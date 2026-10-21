/*! Briqwise dossier-check | logic, business-email validation and HubSpot Forms API connector | rules: rules.json */
(function () {
  'use strict';

  var SCRIPT = document.currentScript;
  var DEFAULTS = /*__RULES__*/null;
  var UI_CSS = /*__CSS__*/'';
  var UI_HTML = /*__HTML__*/'';

  function merge(a, b) {
    var o = {}, k;
    for (k in a) o[k] = a[k];
    for (k in (b || {})) o[k] = (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') ? merge(a[k], b[k]) : b[k];
    return o;
  }
  function rulesUrl() {
    var attr = SCRIPT && SCRIPT.getAttribute('data-rules');
    if (attr) return attr;
    return SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/[^\/]*$/, '') + '../rules.json' : '';
  }
  function boot() {
    var host = document.getElementById('bw-dc');
    if (!host || host.getAttribute('data-dc-ready')) return;
    host.setAttribute('data-dc-ready', '1');
    if (!host.hasAttribute('data-dc-root')) {
      if (!document.getElementById('bw-dc-css')) { var st = document.createElement('style'); st.id = 'bw-dc-css'; st.textContent = UI_CSS; document.head.appendChild(st); }
      host.innerHTML = UI_HTML; host.setAttribute('data-dc-root', '');
    }
    var url = rulesUrl(), done = false;
    function start(remote) { if (done) return; done = true; main(merge(DEFAULTS, remote || {}), !!remote); }
    if (!url || !window.fetch) return start(null);
    var timer = setTimeout(function () { start(null); }, 2500); // never let the tool wait on the CDN
    fetch(url).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { clearTimeout(timer); start(j); })
      .catch(function () { clearTimeout(timer); start(null); });
  }

  function main(RU, remoteRules) {
  var CONFIG = {
    portalId: RU.hubspot.portalId,
    forms: RU.hubspot.forms,
    loanDurationUnit: RU.hubspot.loanDurationUnit || 'months',
    endpoint: 'https://api.hsforms.com/submissions/v3/integration/submit/',
    dryRun: /[?&]dc-dry=1/.test(location.search) || !!(SCRIPT && SCRIPT.hasAttribute('data-dry-run')),
    gateOutcome: RU.ui.gateOutcome,
    blockFreeMail: RU.email.blockFreeMail,
    mxCheck: RU.email.mxCheck,
    extraBlocked: RU.email.extraBlockedDomains || [],
    meetingUrl: RU.ui.meetingUrl,
    meetingTrigger: RU.ui.meetingTrigger || '',
    meetingModalMinWidth: RU.ui.meetingModalMinWidth || 768,
    phone: RU.ui.phone,
    googleMapsKey: 'AIzaSyAvGTcXSgj4Zp2y-5ldz0UPNzWZ6qYb2cA', // same key as /lenen/stap-1
    objects: { contact: '0-1', company: '0-2', loan: '2-138893726', collateral: '2-139157927' },
    rules: {
      min: RU.loan.min, max: RU.loan.max, ltvMax: RU.loan.ltvMax, ltvRateUp: RU.loan.ltvHigherRate, sweet: RU.loan.sweetspotMax, good: RU.loan.goodMax,
      ltvFree: RU.repayment.interestOnlyLtv, ltvFreeShort: RU.repayment.shortTermInterestOnlyLtv, shortTerm: RU.repayment.shortTermMonths, linearYears: RU.repayment.linearYears,
      terms: RU.loan.termOptionsMonths || [3, 6, 12, 24, 36, 48, 60, 120, 240],
      fee: RU.costs.financingFee, feeMinBase: RU.costs.financingFeeMinBase, mgmt: RU.costs.managementFee,
      borgLowLtv: RU.guarantee.lowLtv, borgLowPct: RU.guarantee.lowLtvPct,
      rateMin: RU.rate.min, rateMax: RU.rate.max, surcharges: (RU.rate.termSurcharges || []).slice().sort(function (a, b) { return b.fromMonths - a.fromMonths; })
    },
    fee: RU.intermediaryFee
  };

  var root = document.querySelector('[data-dc-root]');
  if (!root) return;
  var R = CONFIG.rules;
  var FEE_ON = !!(CONFIG.fee && CONFIG.fee.enabled) && (!CONFIG.fee.validUntil || new Date() <= new Date(CONFIG.fee.validUntil + 'T23:59:59'));

  /* ================= helpers ================= */
  function $(k) { return root.querySelector('[data-dc="' + k + '"]'); }
  function $$(s) { return Array.prototype.slice.call(root.querySelectorAll(s)); }
  function eur(n) { return '€ ' + Math.round(n).toLocaleString('nl-NL'); }
  function pc(n) { return n.toFixed(2).replace('.', ',') + '%'; }
  function pctL(f) { return (Math.round(f * 1000) / 10).toString().replace('.', ',') + '%'; }
  function lt(m) { return m < 12 ? m + ' maanden' : (m % 12 ? (m / 12).toFixed(1).replace('.', ',') : m / 12) + ' jaar'; }
  function track(action, extra) {
    try { window.dataLayer = window.dataLayer || []; var e = { event: 'dossier_check', dc_action: action }; for (var k in (extra || {})) e[k] = extra[k]; window.dataLayer.push(e); } catch (x) {}
  }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (x) { return null; } }

  var ICON = {
    key: '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3m-3 3 2 2m-5 1 2 2"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.8-4M4 4v4h4M4 13a8 8 0 0 0 14.8 4M20 20v-4h-4"/>',
    hammer: '<path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9m3 3 2-2m-5-1 5-5 4 4-5 5z"/>',
    crane: '<path d="M6 21V3l12 4H6m4 14V7m-6 14h10m4-14v5m-1 0h2v3h-2z"/>',
    'case': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    warehouse: '<path d="M3 21V8l9-5 9 5v13M7 21v-8h10v8M7 17h10"/>',
    store: '<path d="M3 21h18M4 21V10m16 11V10M3 7l2-4h14l2 4H3zm0 0a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 21v-6h6v6"/>',
    home: '<path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    bag: '<path d="M5 8h14l-1 13H6zm4 0V6a3 3 0 0 1 6 0v2"/>',
    tent: '<path d="M3 20 12 4l9 16H3zm9-16v16m-3 0 3-6 3 6"/>',
    leaf: '<path d="M5 21c0-9 5-15 15-16-1 10-7 15-15 16zm0 0 8-8"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0m1-12a3 3 0 1 1 0 6m5 6a6 6 0 0 0-4-5.6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    split: '<path d="M12 21v-8L5 6m7 7 7-7M5 10V6h4m10 4V6h-4"/>',
    building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16m0-10h2a2 2 0 0 1 2 2v8M3 21h18M8 7h4m-4 4h4m-4 4h4"/>',
    badge: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4m8-4v4"/>',
    pie: '<path d="M12 3v9h9a9 9 0 1 1-9-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8m-8 5h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
    pin: '<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    bank: '<path d="M3 21h18M4 10h16L12 4zM6 10v8m4-8v8m4-8v8m4-8v8"/>',
    dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    ok: '<path d="m5 12 5 5 9-10"/>',
    alert: '<path d="M12 4 2 20h20zm0 6v4m0 3h.01"/>',
    msg: '<path d="M4 5h16v11H8l-4 4z"/>',
    file: '<path d="M14 3H6v18h12V7zm0 0v4h4M9 13h6m-6 4h4"/>'
  };
  function svg(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICON[k] || '') + '</svg>'; }
  $$('[data-i]').forEach(function (b) { b.insertAdjacentHTML('afterbegin', svg(b.getAttribute('data-i'))); });

  /* ================= state ================= */
  var S = { doel: 'aankoop', type: 'bedrijfsruimte', gebruik: 'verhuur', aanvrager: 'bv', box3: '', excl: 'nee', eig: 'vol', bank: 'nee', tint: '' };
  var done = { kvk: true, ib: true };
  var bz = {};
  var startedAt = Date.now();
  var lastResult = null;
  var URG = ['Binnen 2 weken', 'Binnen 1 maand', 'Binnen 3 maanden', 'Oriënterend'];
  var URG_V = ['2_weken', '1_maand', '3_maanden', 'orienterend'];
  var BIJZ = [['casino_huurder', 'Huurder is een casino'], ['starter', 'Starter of gewijzigde exploitatie'], ['faillissement', 'Eerder failliet'], ['bkr', 'BKR-achterstand'], ['negatieve_publiciteit', 'Negatief in het nieuws'], ['bestemming', 'Gebruik niet conform bestemming'], ['buitenland', 'Onderpand in het buitenland'], ['verzekering', 'Onderpand niet volledig verzekerd']];
  var LBL = {
    doel: { aankoop: 'Aankoop', herfin: 'Herfinanciering', verbouw: 'Verbouwing', project: 'Nieuwbouw of transformatie', bedrijf: 'Bedrijfsfinanciering' },
    type: { bedrijfsruimte: 'Bedrijfsruimte', combi: 'Bedrijf + woning', woning: 'Woning', winkel: 'Winkel of horeca', recreatie: 'Recreatie', grond: 'Agrarisch of grond' },
    gebruik: { verhuur: 'Verhuurd', eigen: 'Eigen gebruik', combi: 'Combinatie' },
    aanvrager: { bv: 'BV of NV', ez: 'Eenmanszaak of vof', prive: 'Privé (box 3)' }
  };
  /* HubSpot option values of existing properties */
  var HS_DOEL = { aankoop: 'Ik wil vastgoed aankopen', herfin: 'Ik wil mijn vastgoed herfinancieren', verbouw: 'Ik wil mijn vastgoed verbouwen', project: 'Ik wil een vastgoed ontwikkelproject financieren', bedrijf: 'Ik wil een bedrijfsfinanciering afsluiten met vastgoed als onderpand' };
  var FIN_TYPE = { aankoop: 'purchase', herfin: 'refinance', verbouw: 'project', project: 'project', bedrijf: 'refinance' };
  var USAGE = { woning: 'residential', combi: 'mixed', bedrijfsruimte: 'commercial', winkel: 'commercial', recreatie: 'commercial', grond: 'commercial' };
  var HS_TYPE = { bedrijfsruimte: 'Bedrijfsruimte', combi: 'Bedrijfsruimte + woning/appartement', woning: 'Woning / appartement', winkel: 'Winkel', recreatie: 'Recreatie', grond: 'Agrarisch / grond' };

  /* ================= option groups ================= */
  $$('[data-g]').forEach(function (g) {
    var k = g.getAttribute('data-g');
    var btns = Array.prototype.slice.call(g.querySelectorAll('.dc-opt'));
    function draw() { btns.forEach(function (b) { b.classList.toggle('on', S[k] === b.getAttribute('data-v')); b.setAttribute('aria-pressed', S[k] === b.getAttribute('data-v')); }); }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        S[k] = b.getAttribute('data-v'); draw();
        if (k === 'tint') { var h = root.querySelector('[data-dc-form="report"] [name="intermediair_type"]'); if (h) h.value = S.tint; setErr('report', ''); }
        if (k === 'aanvrager') $('box3w').hidden = S.aanvrager !== 'prive';
        if (['doel', 'type', 'gebruik', 'aanvrager', 'eig'].indexOf(k) > -1) renderDocs();
        upd();
      });
    });
    draw();
  });

  $$('[data-s]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = $(b.getAttribute('data-s')); var st = b.getAttribute('data-s') === 'waarde' ? 50000 : 25000;
      r.value = Math.min(+r.max, Math.max(+r.min, +r.value + st * (+b.getAttribute('data-d')))); upd();
    });
  });
  function fill(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); }

  function docList() {
    var d = [['taxatie', 'Taxatierapport (max. 9 maanden)'], ['foto', 'Foto onderpand']];
    if (S.doel === 'aankoop') d.push(['koopcontract', 'Koopcontract']);
    if (S.gebruik !== 'eigen') d.push(['huurcontracten', 'Huurcontracten']);
    if (S.aanvrager !== 'prive') d.push(['kvk', 'KvK-uittreksel'], ['jaarcijfers', 'Jaarcijfers']);
    d.push(['ib', 'IB-aangifte UBO'], ['bkr', 'BKR-uittreksel']);
    if (S.aanvrager === 'prive') d.push(['portefeuille', 'Overzicht vastgoedportefeuille']);
    if (S.doel === 'project' || S.doel === 'verbouw') d.push(['begroting', 'Begroting of offerte aannemer'], ['omgevingsvergunning', 'Omgevingsvergunning']);
    if (S.eig === 'erfpacht') d.push(['erfpachtcontract', 'Erfpachtcontract']);
    if (S.type === 'recreatie' && S.gebruik !== 'eigen') d.push(['exploitatieovereenkomst', 'Exploitatieovereenkomst']);
    return d;
  }
  function chips(el, list, state, cls, onIcon) {
    el.innerHTML = list.map(function (x) { return '<button type="button" class="dc-opt ' + cls + (state[x[0]] ? ' on' : '') + '" data-k="' + x[0] + '" aria-pressed="' + !!state[x[0]] + '">' + svg(state[x[0]] ? onIcon : 'plus') + x[1] + '</button>'; }).join('');
    Array.prototype.slice.call(el.querySelectorAll('.dc-opt')).forEach(function (c) {
      c.addEventListener('click', function () { var k = c.getAttribute('data-k'); state[k] = !state[k]; chips(el, list, state, cls, onIcon); upd(); });
    });
  }
  function renderDocs() { chips($('docs'), docList(), done, 'ok', 'ok'); }
  function renderBijz() { chips($('bijz'), BIJZ, bz, 'wa', 'alert'); }

  /* ================= calculations ================= */
  function aflossing(b, w, m) {
    var kort = m <= R.shortTerm, grens = (kort ? R.ltvFreeShort : R.ltvFree) * w, vrij = Math.min(b, grens), rest = b - vrij;
    return { vrij: vrij, rest: rest, perJaar: rest <= 0 ? 0 : kort ? rest / (m / 12) : rest / R.linearYears, kort: kort };
  }
  function opslag(m) { for (var i = 0; i < R.surcharges.length; i++) if (m >= R.surcharges[i].fromMonths) return R.surcharges[i].pct; return 0; }
  function vergoeding(b, l, m, pct) {
    var Fe = CONFIG.fee || {}, step = Fe.pctPerCriterion || 0;
    var c = [['Compleet dossier', pct === 100], ['Leensom tot ' + eur(Fe.maxLoanAmount), b <= Fe.maxLoanAmount], ['LTV tot ' + pctL(Fe.maxLtv), l <= Fe.maxLtv], ['Looptijd tot ' + Fe.maxTermMonths + ' maanden', m <= Fe.maxTermMonths]];
    var p = FEE_ON ? c.filter(function (x) { return x[1]; }).length * step : 0;
    return { c: c, p: p, eur: b * p / 100 };
  }
  function calc(wAdj) {
    var w = +$('waarde').value * (1 + (wAdj || 0) / 100), b = +$('bedrag').value, m = termAt($('looptijd').value), l = b / w;
    var dl = docList(), have = dl.filter(function (d) { return done[d[0]]; });
    var pct = Math.round(have.length / dl.length * 100);
    var ko = S.excl === 'ja' ? 'branche' : S.eig === 'opstal' ? 'opstal' : (S.aanvrager === 'prive' && S.gebruik === 'eigen') ? 'consument' : '';
    var fit = b >= R.min && b <= R.max && l <= R.ltvMax;
    var twijfel = BIJZ.some(function (x) { return bz[x[0]]; }) || (S.aanvrager === 'prive' && S.box3 === 'nee');
    var a = aflossing(b, w, m), ops = opslag(m), maxF = Math.min(w * R.ltvMax, R.max);
    return {
      w: w, b: b, m: m, l: l, pct: pct, fit: fit, ko: ko, twijfel: twijfel, a: a, ops: ops, maxF: maxF,
      o: ko ? 'knockout' : (!fit || twijfel) ? 'maatwerk' : pct >= 80 ? 'term_sheet' : 'dossier_aanvullen',
      have: have, miss: dl.filter(function (d) { return !done[d[0]]; }),
      borg: S.aanvrager === 'bv' ? (l <= R.borgLowLtv ? R.borgLowPct * b : b) : 0,
      fee: R.fee * Math.max(b, R.feeMinBase), mgmt: b * R.mgmt,
      rLo: R.rateMin + ops, rHi: R.rateMax + ops,
      v: vergoeding(b, l, m, pct)
    };
  }
  /* the slider moves over an index; the months come from rules.loan.termOptionsMonths */
  function termAt(i) { var t = R.terms; return t[Math.max(0, Math.min(t.length - 1, +i))]; }
  function monthly(r, rate) { return (r.b * rate / 100 + r.a.perJaar) / 12; }

  var ST = { knockout: ['da', 'Niet mogelijk'], term_sheet: ['ok', 'Kansrijk'], dossier_aanvullen: ['wa', 'Aanvullen'], maatwerk: ['mw', 'Maatwerk'] };
  var COL = { ok: ['#067647', '#ecfdf3', '#abefc6'], wa: ['#b54708', '#fffaeb', '#fedf89'], da: ['#c01048', '#fff1f3', '#fecdd6'], mw: ['#493379', '#f4f1fa', '#d9d1ea'] };

  function upd() {
    $$('input[type=range]').forEach(fill);
    var r = calc();
    $('wOut').textContent = eur(r.w); $('bOut').textContent = eur(r.b);
    $('bHint').textContent = r.b <= R.sweet ? 'Sweetspot: hier kunnen we het snelst schakelen.' : r.b <= R.good ? 'Goed mogelijk.' : 'Mogelijk, maar dan moet alles kloppen.';
    var bar = $('ltvBar'); bar.style.width = Math.min(r.l * 100, 100) + '%';
    bar.style.background = r.l <= R.ltvRateUp ? '#067647' : r.l <= R.ltvMax ? '#f79009' : '#c01048';
    $('ltvTxt').textContent = (r.l * 100).toFixed(1).replace('.', ',') + '%';
    $('ring').setAttribute('stroke-dashoffset', (113.1 * (1 - r.pct / 100)).toFixed(1));
    $('docPct').textContent = r.pct + '%';
    var st = ST[r.o], c = COL[st[0]], p = $('stat'); p.textContent = st[1]; p.style.color = c[0];
    $('statWhy').textContent = r.ko ? KO_SHORT[r.ko] : '';
    $('meter').classList.toggle('ko', !!r.ko);
    [['branche', 'koBranche'], ['opstal', 'koOpstal'], ['consument', 'koConsument']].forEach(function (k) {
      var el = $(k[1]), on = KO_ON[k[0]](); el.hidden = !on; if (on) el.textContent = KO[k[0]];
    });
    $('lOut').textContent = lt(r.m);
    $('lHint').textContent = r.ops ? 'Renteopslag van +' + pc(r.ops) + ' bij deze looptijd. Investeerders hebben voorkeur voor 60 maanden.' : (r.m === 60 ? 'Voorkeurslooptijd van investeerders.' : 'Investeerders hebben voorkeur voor 60 maanden.');
    $('cVrij').textContent = eur(r.a.vrij);
    $('cAfl').textContent = r.a.perJaar ? eur(r.a.perJaar) + ' per jaar' : 'Geen';
    $('cRule').textContent = r.a.kort ? 'Looptijd tot ' + R.shortTerm + ' maanden: aflossingsvrij tot ' + pctL(R.ltvFreeShort) + ' LTV, het meerdere los je af binnen de looptijd.' : 'Tot ' + pctL(R.ltvFree) + ' LTV aflossingsvrij, het meerdere los je lineair af in ' + R.linearYears + ' jaar.';
    $('cVerg').textContent = pc(r.v.p) + ' · ' + eur(r.v.eur);
    var nxt = r.v.c.filter(function (x) { return !x[1]; }).map(function (x) { return x[0].toLowerCase(); });
    $('cVergH').textContent = nxt.length ? 'Tot ' + pc(4 * ((CONFIG.fee || {}).pctPerCriterion || 0)) + ' mogelijk. Nog te behalen: ' + nxt.join(', ') + '.' : 'Maximale vergoeding behaald.';
    $('uOut').textContent = URG[+$('urg').value];
    return r;
  }
  ['waarde', 'bedrag', 'looptijd', 'urg'].forEach(function (k) { $(k).addEventListener('input', upd); });

  /* ================= navigation ================= */
  var steps = $$('section[data-step]');
  function go(n) {
    steps.forEach(function (s) { s.hidden = s.getAttribute('data-step') !== String(n); });
    $('stepLbl').textContent = n < 4 ? 'Stap ' + n + ' van 3' : 'Uitkomst';
    if (root.getBoundingClientRect().top < 0) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    track('step', { dc_step: n });
  }
  $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-go')); }); });

  var KO_ON = { branche: function () { return S.excl === 'ja'; }, opstal: function () { return S.eig === 'opstal'; }, consument: function () { return S.aanvrager === 'prive' && S.gebruik === 'eigen'; } };
  var KO_SHORT = { branche: 'Uitgesloten sector', opstal: 'Recht van opstal', consument: 'Consumentenfinanciering' };
  var KO = {
    branche: 'Briqwise financiert geen geldnemers of huurders die actief zijn in seks, wapens of drugs, en geen casino in eigen beheer. Ook niet als maatwerk. Is alleen de huurder een casino? Kies dan Nee en tik bij bijzonderheden \'Huurder is een casino\' aan.',
    opstal: 'Een recht van opstal accepteren we niet als onderpand, ook niet als maatwerk. Erfpacht kan wel.',
    consument: 'Privé lenen voor eigen gebruik is een consumentenfinanciering in de zin van de Wft. Die bieden we niet aan op ons platform. Verhuur vanuit box 3 kan wel.'
  };
  function outcome(r) {
    if (r.ko) return ['da', 'ban', 'Deze case kunnen we niet financieren', KO[r.ko]];
    var hr = r.l > R.ltvRateUp ? ' Een LTV boven ' + pctL(R.ltvRateUp) + ' betekent doorgaans een hogere rente.' : '';
    var bk = S.bank === 'ja' ? ' Een afwijzing door de bank is voor ons geen belemmering.' : '';
    if (r.o === 'maatwerk') {
      var why = !r.fit ? (r.l > R.ltvMax ? 'De LTV ligt boven de ' + pctL(R.ltvMax) + '.' : 'Het bedrag valt buiten ' + eur(R.min) + ' tot ' + eur(R.max) + '.') : 'Er zijn punten die je accountmanager eerst wil bespreken.';
      return ['mw', 'msg', 'Maatwerk: bespreek met je accountmanager', why + ' We denken in wat wél kan: vaak is er een route om de case binnen de richtlijnen te krijgen.' + bk];
    }
    if (r.o === 'term_sheet') return ['ok', 'check', 'Kansrijk: klaar voor een term sheet', 'Binnen onze voorwaarden en je dossier is vrijwel compleet. Je ontvangt binnen één werkdag een term sheet.' + hr + bk];
    return ['wa', 'file', 'Kansrijk: dossier aanvullen', 'Past binnen onze voorwaarden. Met een compleet dossier ontvang je binnen één werkdag een term sheet.' + hr + bk];
  }
  $('toResult').addEventListener('click', function () {
    var r = upd(); lastResult = r; var t = outcome(r), c = COL[t[0]], bx = $('oBox');
    bx.style.color = c[0]; bx.style.background = c[1]; bx.style.borderColor = c[2];
    $('oIcon').innerHTML = svg(t[1]); $('oTitle').textContent = t[2]; $('oText').textContent = t[3];
    bx.hidden = CONFIG.gateOutcome && !r.ko && !reportSent;
    $('koBox').hidden = !r.ko;
    $('gate').hidden = !!r.ko || reportSent;
    $('detail').hidden = !!r.ko || !reportSent;
    if (reportSent && !r.ko) renderReport(r);
    go(4);
    track('outcome', { dc_outcome: r.o, dc_ltv: Math.round(r.l * 1000) / 10, dc_amount: r.b });
  });

  /* ================= report ================= */
  function renderReport(r) {
    $('cLeen').textContent = eur(r.b); $('cWaarde').textContent = eur(r.w);
    $('cLoop').textContent = lt(r.m) + (r.m >= 12 ? ' (' + r.m + ' mnd)' : '');
    $('cMeta').textContent = [LBL.doel[S.doel], LBL.type[S.type], LBL.gebruik[S.gebruik], LBL.aanvrager[S.aanvrager], 'LTV ' + (r.l * 100).toFixed(1).replace('.', ',') + '%'].join(' · ');
    $('dMax').textContent = eur(r.maxF); $('dGap').textContent = eur(Math.max(0, r.b - r.maxF));
    $('dRente').textContent = pc(r.rLo) + ' – ' + pc(r.rHi);
    $('dMnd').textContent = eur(monthly(r, r.rLo)) + ' – ' + eur(monthly(r, r.rHi));
    $('dAfl').textContent = eur(r.a.perJaar);
    $('dBorg').textContent = S.aanvrager === 'bv' ? eur(r.borg) + (r.l <= R.borgLowLtv ? ' (' + pctL(R.borgLowPct) + ')' : ' (100%)') : 'n.v.t.';
    $('dFee').textContent = eur(r.fee); $('dBeh').textContent = eur(r.mgmt);
    $('dVerg').textContent = pc(r.v.p) + ' · ' + eur(r.v.eur);
    $('dVergL').innerHTML = r.v.c.map(function (x) { return '<li class="' + (x[1] ? 'y' : '') + '">' + x[0] + ' (0,50%)</li>'; }).join('');
    $('dMiss').innerHTML = r.miss.length ? r.miss.map(function (m) { return '<li>' + m[1] + '</li>'; }).join('') : '<li class="y" style="color:#067647">Alles compleet</li>';
    $('dNote').textContent = S.eig === 'erfpacht' ? 'Erfpacht: de einddatum moet minimaal 10 jaar na het einde van de financiering liggen.' : '';
    $('meetLink').href = CONFIG.meetingUrl;
    $('wi').value = 0; wiUpd();
  }
  function wiUpd() {
    var v = +$('wi').value; fill($('wi')); $('wiOut').textContent = (v > 0 ? '+' : '') + v + '%';
    var r = calc(v);
    $('wiRes').innerHTML = 'Taxatie ' + eur(r.w) + ' → LTV <b>' + (r.l * 100).toFixed(1).replace('.', ',') + '%</b>, aflossing ' + (r.a.perJaar ? eur(r.a.perJaar) + ' per jaar' : 'niet verplicht') + '. ' +
      (r.l <= R.ltvMax ? '<span style="color:#067647">Binnen de grens.</span>' : '<span style="color:#b54708">Boven ' + pctL(R.ltvMax) + ': verlaag naar ' + eur(r.maxF) + ' of verhoog de eigen inbreng met ' + eur(r.b - r.maxF) + '.</span>');
  }
  $('wi').addEventListener('input', wiUpd);

  /* ================= business e-mail validation ================= */
  var FREE = 'gmail.com googlemail.com hotmail.com hotmail.nl hotmail.be outlook.com outlook.nl outlook.be live.com live.nl live.be msn.com icloud.com me.com mac.com yahoo.com yahoo.nl ymail.com aol.com gmx.com gmx.net gmx.de web.de mail.com proton.me protonmail.com pm.me zoho.com yandex.com ziggo.nl kpnmail.nl kpnplanet.nl planet.nl home.nl hetnet.nl chello.nl upcmail.nl casema.nl quicknet.nl zeelandnet.nl tele2.nl online.nl caiway.nl telfort.nl versatel.nl xs4all.nl solcon.nl hccnet.nl telenet.be skynet.be scarlet.be'.split(' ');
  var DISPOSABLE = /(mailinator|yopmail|guerrillamail|sharklasers|10minutemail|temp-?mail|trashmail|getnada|maildrop|dispostable|throwaway|fakeinbox|mintemail|mailnesia|moakt|emailondeck|spamgourmet|tempr\.email|burnermail|mohmal|mailcatch|inboxkitten|tmail|tmpmail)/i;
  var JUNK = /^(test|tests|example|voorbeeld|asdf?|asd|qwerty|azerty|abc|abcd|xxx+|aaa+|foo|bar|blabla|nvt|geen|none|noreply|no-reply|nep|fake)$/i;
  var mxCache = {};
  function dohLookup(domain, type) {
    var ctl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, 3500);
    return fetch('https://dns.google/resolve?name=' + encodeURIComponent(domain) + '&type=' + type, { signal: ctl ? ctl.signal : undefined, headers: { accept: 'application/dns-json' } })
      .then(function (r) { clearTimeout(t); return r.json(); });
  }
  function domainAccepts(domain) {
    if (!CONFIG.mxCheck) return Promise.resolve(true);
    if (domain in mxCache) return Promise.resolve(mxCache[domain]);
    return dohLookup(domain, 'MX').then(function (j) {
      if (j.Status === 3) return false; // NXDOMAIN
      if ((j.Answer || []).some(function (a) { return a.type === 15; })) return true;
      return dohLookup(domain, 'A').then(function (a) { return (a.Answer || []).some(function (x) { return x.type === 1; }); });
    }).then(function (ok) { mxCache[domain] = ok; return ok; })
      .catch(function () { return true; }); // fail open: never block a real lead because DNS lookup failed
  }
  function validateEmail(raw) {
    var email = String(raw || '').trim().toLowerCase();
    if (!/^[^\s@]+@([a-z0-9-]+\.)+[a-z]{2,}$/.test(email)) return Promise.resolve('Vul een geldig e-mailadres in.');
    var local = email.split('@')[0], domain = email.split('@')[1], label = domain.split('.').slice(-2, -1)[0] || '';
    if (CONFIG.blockFreeMail && (FREE.indexOf(domain) > -1 || CONFIG.extraBlocked.indexOf(domain) > -1)) return Promise.resolve('Gebruik je zakelijke e-mailadres. Gmail, Hotmail, Ziggo en vergelijkbare adressen accepteren we niet.');
    if (DISPOSABLE.test(domain)) return Promise.resolve('Tijdelijke e-mailadressen accepteren we niet.');
    if (JUNK.test(label) || JUNK.test(local) || /^(.{2,5})\1+$/.test(label) || (label.length >= 5 && !/[aeiouy]/.test(label))) return Promise.resolve('Dit lijkt geen echt e-mailadres. Gebruik je zakelijke e-mailadres.');
    return domainAccepts(domain).then(function (ok) { return ok ? '' : 'Het domein ' + domain + ' kan geen e-mail ontvangen. Controleer je e-mailadres.'; });
  }

  /* ================= HubSpot Forms API connector ================= */
  var TRACK_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'li_fat_id'];
  (function captureAttribution() {
    try {
      var q = new URLSearchParams(location.search);
      TRACK_KEYS.forEach(function (k) { if (q.get(k)) ss('dc_' + k, q.get(k)); });
      if (!ss('dc_prev') && document.referrer) ss('dc_prev', document.referrer);
    } catch (x) {}
  })();
  function cookie(n) { var m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : undefined; }
  function F(name, value, obj) { return { objectTypeId: obj || CONFIG.objects.contact, name: name, value: value == null ? '' : String(value) }; }

  function caseFields(r) {
    var C = CONFIG.objects.contact;
    var f = [
      F('contact_type', 'Intermediair'), // API submissions do not apply a form's hidden default, so the tool sends it
      F('bw_business_unit', '_briqwise b.v.'),
      F('doel_financiering', HS_DOEL[S.doel]),
      F('type_bestemming', HS_TYPE[S.type]),
      F('dc_loan_amount', r.b), F('dc_property_value', Math.round(r.w)), F('dc_term_months', r.m),
      F('dc_ltv', Math.round(r.l * 1000) / 10),
      F('dc_usage', S.gebruik), F('dc_applicant_type', S.aanvrager), F('dc_box3_criteria', S.aanvrager === 'prive' ? (S.box3 || 'onbekend') : 'nvt'),
      F('dc_ownership', S.eig), F('dc_bank_declined', S.bank), F('dc_urgency', URG_V[+$('urg').value]),
      F('dc_special_circumstances', BIJZ.filter(function (x) { return bz[x[0]]; }).map(function (x) { return x[0]; }).join(';')),
      F('dc_documents_ready', r.have.map(function (d) { return d[0]; }).join(';')),
      F('dc_documents_missing', r.miss.map(function (d) { return d[0]; }).join(';')),
      F('dc_documents_missing_text', r.miss.map(function (d) { return d[1]; }).join(', ') || 'Geen'),
      F('dc_dossier_completeness', r.pct),
      F('dc_outcome', r.o),
      F('dc_max_financing', Math.round(r.maxF)), F('dc_annual_repayment', Math.round(r.a.perJaar)),
      F('dc_guarantee_amount', Math.round(r.borg)), F('dc_financing_fee', Math.round(r.fee)),
      F('dc_rate_surcharge', r.ops), F('dc_monthly_low', Math.round(monthly(r, r.rLo))), F('dc_monthly_high', Math.round(monthly(r, r.rHi))),
      F('dc_intermediary_fee_pct', r.v.p), F('dc_intermediary_fee_amount', Math.round(r.v.eur)),
      F('dc_report_summary', summary(r))
    ];
    TRACK_KEYS.forEach(function (k) { var v = ss('dc_' + k); if (v) f.push(F(k, v)); });
    var prev = ss('dc_prev'); if (prev) f.push(F('previous_page_before_conversion', prev));
    return f.filter(function (x) { return x.objectTypeId !== C || x.value !== ''; });
  }
  function summary(r) {
    return [
      'Leensom ' + eur(r.b) + ' | Waarde ' + eur(r.w) + ' | LTV ' + (r.l * 100).toFixed(1).replace('.', ',') + '% | Looptijd ' + r.m + ' mnd',
      LBL.doel[S.doel] + ' | ' + LBL.type[S.type] + ' | ' + LBL.gebruik[S.gebruik] + ' | ' + LBL.aanvrager[S.aanvrager] + ' | ' + (S.eig === 'vol' ? 'Volle eigendom' : S.eig === 'erfpacht' ? 'Erfpacht' : 'Opstal'),
      'Max. financiering ' + eur(r.maxF) + ' | Aflossing ' + eur(r.a.perJaar) + ' p/j | Indicatie maandlast ' + eur(monthly(r, r.rLo)) + ' - ' + eur(monthly(r, r.rHi)),
      'Borgstelling ' + (S.aanvrager === 'bv' ? eur(r.borg) : 'n.v.t.') + ' | Financieringsfee ' + eur(r.fee) + ' | Beheer ' + eur(r.mgmt) + ' p/j | Rente indicatief ' + pc(r.rLo) + ' - ' + pc(r.rHi),
      (FEE_ON ? 'Vergoeding intermediair ' + pc(r.v.p) + ' (' + eur(r.v.eur) + ') | ' : '') + 'Dossier ' + r.pct + '% compleet | Ontbreekt: ' + (r.miss.map(function (d) { return d[1]; }).join(', ') || 'niets'),
      'Bijzonderheden: ' + (BIJZ.filter(function (x) { return bz[x[0]]; }).map(function (x) { return x[1]; }).join(', ') || 'geen') + ' | Bank afgewezen: ' + S.bank + ' | Urgentie: ' + URG[+$('urg').value]
    ].join('\n');
  }

  function hsSubmit(formKey, fields) {
    var guid = CONFIG.forms[formKey];
    var body = { fields: fields, context: { pageUri: location.href, pageName: document.title } };
    var hutk = cookie('hubspotutk'); if (hutk) body.context.hutk = hutk;
    if (CONFIG.dryRun || /REPLACE/.test(guid)) {
      if (window.console) console.info('[dossier-check] dry run', formKey, body);
      return new Promise(function (res) { setTimeout(function () { res({ ok: true }); }, 600); });
    }
    return fetch(CONFIG.endpoint + CONFIG.portalId + '/' + guid, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (j) {
          if (res.ok) return { ok: true };
          var types = (j.errors || []).map(function (e) { return e.errorType; });
          if (window.console) console.warn('[dossier-check] HubSpot error', res.status, j);
          if (types.indexOf('BLOCKED_EMAIL') > -1 || types.indexOf('INVALID_EMAIL') > -1 || types.indexOf('INVALID_DOMAIN') > -1) return { ok: false, msg: 'Dit e-mailadres accepteren we niet. Gebruik je zakelijke e-mailadres.' };
          return { ok: false, msg: 'Versturen lukte niet. Probeer het opnieuw of bel ons op ' + CONFIG.phone + '.' };
        });
      })
      .catch(function () { return { ok: false, msg: 'Geen verbinding. Probeer het opnieuw.' }; });
  }

  /* Adopt native Webflow forms (data-dc-form="report" / "case") if the designer placed them; otherwise use the fallback forms in the embed. */
  function adopt(key) {
    var slot = root.querySelector('[data-dc-slot="' + key + '"]');
    var ext = Array.prototype.slice.call(document.querySelectorAll('form[data-dc-form="' + key + '"]')).filter(function (f) { return !root.contains(f); })[0];
    if (ext && slot) {
      var wrap = ext.closest('.w-form') || ext; slot.innerHTML = ''; slot.appendChild(wrap);
      if (key === 'report' && !ext.querySelector('[name="intermediair_type"]')) ext.insertAdjacentHTML('beforeend', '<input type="hidden" name="intermediair_type">');
      if (!ext.querySelector('[data-dc-err]')) ext.insertAdjacentHTML('beforeend', '<p class="dc-err" data-dc-err></p>');
      return ext;
    }
    return root.querySelector('form[data-dc-form="' + key + '"]');
  }
  var forms = { report: adopt('report'), caseSubmit: adopt('case') };
  function setErr(key, msg) { var f = forms[key]; var e = f && f.querySelector('[data-dc-err]'); if (e) e.textContent = msg; if (msg) track('form_error', { dc_form: key, dc_error: msg }); }
  function val(f, n) { var el = f.querySelector('[name="' + n + '"]'); if (!el) return ''; if (el.type === 'checkbox') return el.checked ? 'true' : ''; return (el.value || '').trim(); }
  function busy(f, on) { var b = f.querySelector('[type=submit]'); if (b) { b.disabled = on; if (on) { b.dataset.t = b.textContent; b.textContent = 'Even geduld…'; } else if (b.dataset.t) b.textContent = b.dataset.t; } }
  function isBot(f) { return val(f, 'dc_website') !== '' || Date.now() - startedAt < 4000; }

  /* Capture-phase listener: runs before Webflow's own handler and stops it, so the data goes to HubSpot only (no double submission). */
  var reportSent = false;
  if (forms.report) {
    var em = forms.report.querySelector('[name="email"]');
    if (em) em.addEventListener('blur', function () { if (!em.value) return; validateEmail(em.value).then(function (m) { em.classList.toggle('bad', !!m); setErr('report', m); }); });
    if (em) em.addEventListener('input', function () { em.classList.remove('bad'); setErr('report', ''); });
    forms.report.addEventListener('submit', function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      var f = forms.report, r = lastResult || calc();
      if (!val(f, 'firstname')) return setErr('report', 'Vul je voornaam in.');
      if (f.querySelector('[name="lastname"]') && !val(f, 'lastname')) return setErr('report', 'Vul je achternaam in.');
      if (val(f, 'phone') && val(f, 'phone').replace(/\D/g, '').length < 10) return setErr('report', 'Vul een geldig telefoonnummer in, of laat het veld leeg.');
      if (f.querySelector('[name="company"]') && !val(f, 'company')) return setErr('report', 'Vul de naam van je kantoor in.');
      var zip4 = (val(f, 'zip').match(/^(\d{4})\s*([a-zA-Z]{2})?$/) || [])[1];
      if (f.querySelector('[name="zip"]') && !zip4) return setErr('report', 'Vul de postcode van je kantoor in, bijvoorbeeld 7571.');
      var tint = val(f, 'intermediair_type') || S.tint;
      if (!tint) return setErr('report', 'Kies wat voor kantoor je bent.');
      busy(f, true);
      validateEmail(val(f, 'email')).then(function (m) {
        if (m) { busy(f, false); if (em) em.classList.add('bad'); return setErr('report', m); }
        if (isBot(f)) { busy(f, false); return showReport(r); }
        var fields = [F('firstname', val(f, 'firstname')), F('lastname', val(f, 'lastname')), F('email', val(f, 'email').toLowerCase()), F('phone', val(f, 'phone')), F('company', val(f, 'company')), F('zip', zip4), F('intermediair_type', tint),
          /* the kantoor as Company: the owner routing works on the company's postal code */
          F('name', val(f, 'company'), CONFIG.objects.company), F('zip', zip4, CONFIG.objects.company)];
        if (val(f, 'marketing_consent')) fields.push(F('marketing_consent', 'true'));
        return hsSubmit('report', fields.concat(caseFields(r))).then(function (res) {
          busy(f, false);
          if (!res.ok) return setErr('report', res.msg);
          ss('dc_email', val(f, 'email').toLowerCase());
          var ph = forms.caseSubmit && forms.caseSubmit.querySelector('[name="phone"]'); if (ph && !ph.value) ph.value = val(f, 'phone');
          if (ph && ph.value && $('phKnown')) { $('phVal').textContent = ph.value; $('phKnown').hidden = false; $('phWrap').hidden = true; }
          track('generate_lead', { dc_form: 'report', dc_outcome: r.o, dc_intermediair_type: tint });
          showReport(r);
        });
      });
    }, true);
  }
  function showReport(r) {
    reportSent = true; $('gate').hidden = true; $('detail').hidden = false; $('oBox').hidden = false; renderReport(r);
    $('detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ================= case indienen ================= */
  $('openCase').addEventListener('click', function () {
    $('caseWrap').hidden = false; $('caseCta').hidden = true; loadPlaces(); track('case_open');
    var a = forms.caseSubmit && forms.caseSubmit.querySelector('[name="address"]'); if (a) a.focus();
  });

  function loadPlaces() {
    var input = forms.caseSubmit && forms.caseSubmit.querySelector('[name="address"]');
    if (!input || input.dataset.ac) return;
    function bind() {
      if (!(window.google && google.maps && google.maps.places)) return;
      input.dataset.ac = '1';
      var ac = new google.maps.places.Autocomplete(input, { types: ['address'], componentRestrictions: { country: ['nl'] }, fields: ['address_components'] });
      ac.addListener('place_changed', function () {
        var p = ac.getPlace(); if (!p || !p.address_components) return;
        var get = function (t) { var c = p.address_components.filter(function (x) { return x.types.indexOf(t) > -1; })[0]; return c ? c.long_name : ''; };
        var nr = get('street_number'), m = nr.match(/^(\d+)(.*)$/);
        setV('straatnaam_vastgoed', get('route'));
        setV('huisnummer_vastgoed', m ? m[1] : nr);
        setV('huisnummer_toevoeging_los', m ? m[2].trim().replace(/^[-\s]+/, '') : '');
        setV('postcode_vastgoed', get('postal_code'));
        setV('plaatsnaam_vastgoed', get('locality') || get('postal_town'));
      });
    }
    if (window.google && google.maps && google.maps.places) return bind();
    if (document.getElementById('dc-gmaps')) return;
    var s = document.createElement('script'); s.id = 'dc-gmaps'; s.async = true;
    s.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&key=' + CONFIG.googleMapsKey;
    s.onload = bind; document.head.appendChild(s);
  }
  function setV(n, v) { var el = forms.caseSubmit.querySelector('[name="' + n + '"]'); if (el) el.value = v || ''; }
  function loanId() { var s = 'F'; for (var i = 0; i < 12; i++) s += Math.floor(Math.random() * 10); return s; }

  if (forms.caseSubmit) {
    forms.caseSubmit.addEventListener('submit', function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      var f = forms.caseSubmit, r = lastResult || calc(), L = CONFIG.objects.loan, K = CONFIG.objects.collateral;
      var pcode = val(f, 'postcode_vastgoed').toUpperCase().replace(/\s+/g, '');
      if (!val(f, 'address')) return setErr('caseSubmit', 'Vul het adres van het onderpand in.');
      if (!/^\d{4}[A-Z]{2}$/.test(pcode)) return setErr('caseSubmit', 'Vul een geldige postcode in, bijvoorbeeld 1234AB.');
      if (val(f, 'phone').replace(/\D/g, '').length < 10) return setErr('caseSubmit', 'Vul een geldig telefoonnummer in.');
      if (!val(f, 'dc_client_consent')) return setErr('caseSubmit', 'Bevestig dat je klant akkoord is met het delen van de gegevens.');
      var email = ss('dc_email') || val(forms.report, 'email').toLowerCase();
      if (!email) return setErr('caseSubmit', 'Vraag eerst je rapport aan.');
      setErr('caseSubmit', ''); busy(f, true);
      if (isBot(f)) return done_();
      var street = val(f, 'straatnaam_vastgoed'), nr = val(f, 'huisnummer_vastgoed'), add = val(f, 'huisnummer_toevoeging_los'), city = val(f, 'plaatsnaam_vastgoed');
      var full = street ? (street + ' ' + nr + add + (city ? ', ' + city : '')) : val(f, 'address');
      var fields = [
        F('email', email), F('phone', val(f, 'phone')),
        F('dc_notes', val(f, 'dc_notes')), F('dc_client_consent', 'true'),
        F('appraisal_value', Math.round(r.w)), F('desired_loan_amount', r.b), F('ltv', (r.l * 100).toFixed(2)),
        F('dc_case_submitted', 'true'),
        F('straatnaam_vastgoed', street), F('huisnummer_vastgoed', nr), F('huisnummer_toevoeging_los', add),
        F('postcode_vastgoed', pcode), F('plaatsnaam_vastgoed', city),
        F('collateral_address_full', full, K), F('collateral_street', street, K), F('collateral_house_number', nr, K),
        F('collateral_house_number_addition', add, K), F('collateral_postal_code', pcode, K), F('collateral_city', city, K),
        F('collateral_country_code', 'nl', K), F('collateral_appraisal_value', Math.round(r.w), K),
        F('collateral_financing_type', FIN_TYPE[S.doel], K), F('collateral_usage', USAGE[S.type], K),
        F('loan_amount', r.b, L), F('loan_duration_imp', CONFIG.loanDurationUnit === 'years' ? Math.round(r.m / 12 * 10) / 10 : r.m, L),
        F('loan_status', 'new', L), F('bi_loans_id', loanId(), L), F('loan_country', 'nl', L)
      ].concat(caseFields(r)).filter(function (x) { return x.value !== ''; });
      hsSubmit('caseSubmit', fields).then(function (res) {
        if (!res.ok) { busy(f, false); return setErr('caseSubmit', res.msg); }
        track('case_submit', { dc_outcome: r.o, dc_amount: r.b });
        done_();
      });
      function done_() { $('caseWrap').hidden = true; $('caseDone').hidden = false; }
    }, true);
  }

  /* "Plan een call" opens the site's own meeting modal when the page has its trigger, else the meeting URL */
  $('meetLink').addEventListener('click', function (e) {
    /* on small screens the site's meeting modal is cramped: open the meeting page instead */
    var small = window.matchMedia && window.matchMedia('(max-width: ' + (CONFIG.meetingModalMinWidth - 1) + 'px)').matches;
    var t = !small && CONFIG.meetingTrigger && document.querySelector(CONFIG.meetingTrigger);
    track('meeting_click', { dc_via: t ? 'modal' : 'link' });
    if (t) { e.preventDefault(); t.click(); }
  });

  if ($('phEdit')) $('phEdit').addEventListener('click', function (e) {
    e.preventDefault(); $('phKnown').hidden = true; $('phWrap').hidden = false;
    var i = $('phWrap').querySelector('input'); i.focus(); i.select();
  });

  /* ================= rule-driven UI ================= */
  (function applyRules() {
    var b = $('bedrag'); b.min = R.min; b.max = R.max; b.value = Math.min(R.max, Math.max(R.min, +b.value));
    var lt = $('looptijd'), i60 = R.terms.indexOf(60); lt.max = R.terms.length - 1; lt.value = i60 > -1 ? i60 : Math.floor(R.terms.length / 2);
    $('minL').textContent = eur(R.min); $('maxL').textContent = 'max. ' + eur(R.max);
    $('tickMax').style.left = $('tickMaxL').style.left = (R.ltvMax * 100) + '%'; $('tickMaxL').textContent = 'max ' + pctL(R.ltvMax);
    $('tickFree').style.left = $('tickFreeL').style.left = (R.ltvFree * 100) + '%'; $('tickFreeL').textContent = pctL(R.ltvFree);
    if (!FEE_ON) {
      $('vergLive').hidden = true; $('vergBox').hidden = true;
      $('vergTeaser').querySelector('.k').textContent = 'Aflossing per jaar';
    }
    root.setAttribute('data-dc-rules', remoteRules ? 'remote' : 'built-in');
  })();

  /* ================= init ================= */
  renderDocs(); renderBijz(); upd(); go(1);
  steps[0].hidden = false;
  track('view');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
