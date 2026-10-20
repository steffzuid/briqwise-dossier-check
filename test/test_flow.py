"""End-to-end check of the preview: calculations, validation, gating, case submit, layout."""
import pathlib, sys, subprocess, time, shutil
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parents[1]
BASE = "http://127.0.0.1:8765/test/"
src = (root / "test" / "fixture.html").read_text()
def page_with(rules_url, name):
    (root / "test" / f"_{name}.html").write_text(src.replace("RULES_URL", rules_url))
    return BASE + f"_{name}.html"
url = page_with("../rules.json", "main")
alt = (root / "test" / "_rules_alt.json")
import json
rj = json.loads((root / "rules.json").read_text()); rj["loan"]["ltvMax"] = 0.7; rj["intermediaryFee"]["enabled"] = False
alt.write_text(json.dumps(rj))
url_alt = page_with("_rules_alt.json", "alt")
url_404 = page_with("does-not-exist.json", "missing")
server = subprocess.Popen([sys.executable, "-m", "http.server", "8765", "--bind", "127.0.0.1"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.8)
shots = root / "test" / "shots"; shots.mkdir(exist_ok=True)
fails = []

def check(cond, msg):
    print(("PASS " if cond else "FAIL ") + msg)
    if not cond: fails.append(msg)

def setrange(page, key, v):
    page.eval_on_selector(f'[data-dc="{key}"]', "(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}", str(v))

def txt(page, key): return page.inner_text(f'[data-dc="{key}"]').strip()

with sync_playwright() as p:
    b = p.chromium.launch()
    for name, vp in [("mobile", {"width": 390, "height": 844}), ("desktop", {"width": 1280, "height": 900})]:
        page = b.new_page(viewport=vp)
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        sent = {}
        def on_console(m):
            if "[dossier-check] dry run" in m.text and len(m.args) >= 3:
                sent[m.args[1].json_value()] = {(x["objectTypeId"], x["name"]): x["value"] for x in m.args[2].json_value()["fields"]}
        page.on("console", on_console)
        page.route("https://dns.google/**", lambda r: r.fulfill(status=200, content_type="application/json",
            body='{"Status":3}' if "nietbestaand" in r.request.url else '{"Status":0,"Answer":[{"type":15,"data":"10 mx.example.nl."}]}'))
        page.goto(url); page.wait_for_timeout(300)
        page.screenshot(path=str(shots / f"{name}-1.png"), full_page=True)

        # horizontal overflow
        ow = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        check(ow <= 0, f"{name}: no horizontal scroll (overflow {ow}px)")

        # ACCM example: 500k value, 300k loan, 60 mnd -> 250k free, 5k/yr
        setrange(page, "waarde", 500000); setrange(page, "bedrag", 300000)
        check(txt(page, "ltvTxt") == "60,0%", f"{name}: LTV 60,0% ({txt(page,'ltvTxt')})")
        page.click('[data-go="2"]')
        check(txt(page, "cVrij") == "€ 250.000", f"{name}: aflossingsvrij 250k ({txt(page,'cVrij')})")
        check(txt(page, "cAfl") == "€ 5.000 per jaar", f"{name}: aflossing 5k ({txt(page,'cAfl')})")
        # short term rule: 24 mnd -> free up to 70% = 350k -> nothing to repay
        setrange(page, "looptijd", 3)  # index 3 = 24 mnd
        check(txt(page, "cAfl") == "Geen", f"{name}: 24 mnd no repayment ({txt(page,'cAfl')})")
        setrange(page, "looptijd", 7)  # 120 mnd
        check("+0,50%" in txt(page, "lHint"), f"{name}: 120 mnd surcharge hint")
        setrange(page, "looptijd", 6)  # 60 mnd
        page.screenshot(path=str(shots / f"{name}-2.png"), full_page=True)
        page.click('section[data-step="2"] [data-go="3"]')
        page.click('[data-dc="toResult"]')
        check(not page.is_hidden('[data-dc="gate"]'), f"{name}: gate visible")
        check(page.is_hidden('[data-dc="detail"]'), f"{name}: detail hidden before e-mail")
        check(txt(page, "stat") in ("Aanvullen", "Kansrijk"), f"{name}: status {txt(page,'stat')}")
        page.screenshot(path=str(shots / f"{name}-4-gate.png"), full_page=True)

        # validation
        page.wait_for_timeout(4000)  # bot timer
        f = 'form[data-dc-form="report"]'
        page.fill(f + ' [name="firstname"]', "Sanne")
        page.fill(f + ' [name="email"]', "sanne@vandijkadvies.nl"); page.click('[data-g="tint"] [data-v="makelaar"]')
        page.click(f + ' [type="submit"]'); page.wait_for_timeout(250)
        check("achternaam" in page.inner_text(f + ' [data-dc-err]'), f"{name}: lastname required")
        page.fill(f + ' [name="lastname"]', "de Vries"); page.fill(f + ' [name="phone"]', "06 1234 5678")
        def submit_with(email):
            page.fill(f + ' [name="email"]', email)
            page.click(f + ' [type="submit"]'); page.wait_for_timeout(250)
            return page.inner_text(f + ' [data-dc-err]').strip()
        page.click('[data-g="tint"] [data-v="makelaar"]')
        check("zakelijke" in submit_with("sanne@gmail.com"), f"{name}: gmail blocked")
        check("zakelijke" in submit_with("sanne@ziggo.nl"), f"{name}: ziggo blocked")
        check("echt" in submit_with("asadsad@asdasd.nl"), f"{name}: asdasd.nl blocked")
        check("Tijdelijke" in submit_with("x@mailinator.com"), f"{name}: disposable blocked")
        check("kan geen e-mail" in submit_with("sanne@nietbestaand-kantoor.nl"), f"{name}: NXDOMAIN blocked")
        check("geldig" in submit_with("sanne@kantoor"), f"{name}: syntax blocked")
        submit_with("sanne@vandijkadvies.nl"); page.wait_for_timeout(900)
        check(page.is_visible('[data-dc="detail"]'), f"{name}: report shown after valid business e-mail")
        check(txt(page, "cLeen") == "€ 300.000", f"{name}: case summary leensom ({txt(page,'cLeen')})")
        check(txt(page, "dAfl") == "€ 5.000", f"{name}: report aflossing ({txt(page,'dAfl')})")
        check(txt(page, "dBorg").startswith("€ 300.000"), f"{name}: borg 100% at LTV 60% ({txt(page,'dBorg')})")
        check(txt(page, "dFee") == "€ 8.850", f"{name}: fee 2,95% ({txt(page,'dFee')})")
        page.screenshot(path=str(shots / f"{name}-5-report.png"), full_page=True)
        rp = sent.get("report", {})
        for k, v in [("lastname", "de Vries"), ("phone", "06 1234 5678"), ("contact_type", "Intermediair"), ("intermediair_type", "Makelaar"), ("dc_term_months", "60")]:
            check(rp.get(("0-1", k), "").lower() == v.lower(), f"{name}: report sends {k}={rp.get(('0-1', k))}")
        check("Borgstelling" in rp.get(("0-1", "dc_report_summary"), ""), f"{name}: summary has borgstelling line")
        check(not any(k[1] == "dc_borrower_name" for k in rp), f"{name}: no dc_borrower_name")

        # case submit
        lk = page.eval_on_selector('[data-dc="meetLink"]', "e=>getComputedStyle(e).position+'/'+getComputedStyle(e).top")
        check(lk.startswith("static"), f"{name}: call button not positioned by host CSS ({lk})")
        page.click('[data-dc="openCase"]')
        cf = 'form[data-dc-form="case"]'
        page.fill(cf + ' [name="address"]', "Oudegracht 12"); page.fill(cf + ' [name="postcode_vastgoed"]', "3511 AB")
        page.fill(cf + ' [name="plaatsnaam_vastgoed"]', "Utrecht");
        check(page.input_value(cf + ' [name="phone"]') == "06 1234 5678", f"{name}: phone prefilled from report")
        check(page.is_hidden('[data-dc="phWrap"]') and "06 1234 5678" in txt(page, "phKnown"), f"{name}: known phone not asked again")
        page.click('[data-dc="phEdit"]')
        check(page.is_visible('[data-dc="phWrap"]'), f"{name}: phone editable via link")
        page.click(cf + ' [type="submit"]'); page.wait_for_timeout(200)
        check("akkoord" in page.inner_text(cf + ' [data-dc-err]'), f"{name}: consent required")
        page.check(cf + ' [name="dc_client_consent"]'); page.click(cf + ' [type="submit"]'); page.wait_for_timeout(900)
        check(page.is_visible('[data-dc="caseDone"]'), f"{name}: case confirmation shown")
        cs = sent.get("caseSubmit", {}); L, K = "2-138893726", "2-139157927"
        for key, v in [((K, "collateral_financing_type"), "purchase"), ((K, "collateral_usage"), "commercial"), ((K, "collateral_country_code"), "nl"),
                       ((L, "loan_status"), "new"), ((L, "loan_duration_imp"), "60"), ((L, "loan_country"), "nl"), ((L, "loan_amount"), "300000"),
                       (("0-1", "appraisal_value"), "500000"), (("0-1", "desired_loan_amount"), "300000"), (("0-1", "contact_type"), "Intermediair"),
                       (("0-1", "email"), "sanne@vandijkadvies.nl")]:
            check(cs.get(key) == v, f"{name}: case sends {key[1]}={cs.get(key)}")
        page.screenshot(path=str(shots / f"{name}-6-case.png"), full_page=True)

        # knockout path
        page.goto(url); page.wait_for_timeout(200)
        page.click('[data-go="2"]'); page.click('section[data-step="2"] [data-go="3"]')
        check(page.is_hidden('[data-dc="koOpstal"]'), f"{name}: no opstal hint before choosing")
        page.click('[data-g="eig"] [data-v="opstal"]')
        check(page.is_visible('[data-dc="koOpstal"]') and "Erfpacht kan wel" in txt(page, "koOpstal"), f"{name}: opstal explainer shown")
        check(txt(page, "statWhy") == "Recht van opstal", f"{name}: status reason ({txt(page,'statWhy')})")
        check("ko" in page.get_attribute('[data-dc="meter"]', "class"), f"{name}: meter greyed on knockout")
        page.click('[data-g="excl"] [data-v="ja"]')
        check(page.is_visible('[data-dc="koBranche"]') and page.is_visible('[data-dc="koOpstal"]'), f"{name}: both explainers when both apply")
        page.click('[data-g="excl"] [data-v="nee"]')
        check(page.is_hidden('[data-dc="koBranche"]'), f"{name}: branche explainer hides again")
        page.screenshot(path=str(shots / f"{name}-7-ko.png"), full_page=True)
        page.click('[data-dc="toResult"]')
        check(page.is_hidden('[data-dc="gate"]') and "opstal" in txt(page, "oText"), f"{name}: opstal knockout, no gate")
        # maatwerk: LTV 80%
        page.goto(url); page.wait_for_timeout(200)
        setrange(page, "waarde", 1000000); setrange(page, "bedrag", 800000)
        check(txt(page, "stat") == "Maatwerk", f"{name}: LTV 80% -> maatwerk")
        check(not errs, f"{name}: no JS errors {errs}")
        page.close()
    pg = b.new_page()
    pg.goto(url); pg.wait_for_timeout(500)
    check(pg.get_attribute("[data-dc-root]", "data-dc-rules") == "remote", "rules.json loaded from URL")
    pg.goto(url_alt); pg.wait_for_timeout(500)
    check(pg.inner_text('[data-dc="tickMaxL"]') == "max 70%", "alt rules: LTV max label follows rules.json")
    check(pg.is_hidden('[data-dc="vergLive"]'), "alt rules: intermediary fee hidden when disabled")
    setrange(pg, "waarde", 1000000); setrange(pg, "bedrag", 725000)
    check(pg.inner_text('[data-dc="stat"]') == "Maatwerk", "alt rules: 72,5% LTV -> maatwerk under 70% cap")
    pg.goto(url_404); pg.wait_for_timeout(600)
    check(pg.get_attribute("[data-dc-root]", "data-dc-rules") == "built-in", "missing rules.json -> built-in fallback")
    check(pg.inner_text('[data-dc="tickMaxL"]') == "max 75%", "fallback uses built-in 75%")
    pg.close()
    b.close()
server.terminate()

print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)
