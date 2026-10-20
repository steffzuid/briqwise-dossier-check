# Briqwise dossier-check

Interactive lead magnet for intermediairs on `briqwise.com/intermediairs/quickscan`. Runs in Webflow, loads its code and rules from this repo through jsDelivr, and submits to HubSpot through the Forms API v3.

```
src/app.js        logic, e-mail validation, HubSpot connector
src/ui.html       markup + CSS (bundled into the script at build time)
rules.json        business rules, form GUIDs, e-mail settings (fetched at runtime)
dist/             built files served by jsDelivr (commit these)
test/             Playwright end-to-end test + Webflow-like fixture
```

## Webflow

Embed element where the tool should appear:

```html
<div id="bw-dc"></div>
```

Page settings → Custom code → Before `</body>` (replace `OWNER`):

```html
<script src="https://cdn.jsdelivr.net/gh/OWNER/briqwise-dossier-check@1.1.0/dist/dossier-check.min.js"
        data-rules="https://cdn.jsdelivr.net/gh/OWNER/briqwise-dossier-check@main/rules.json"
        data-cookieconsent="ignore" defer></script>
```

- The script is pinned to a release tag, so a code change never goes live by accident.
- `rules.json` comes from `main`, so rule changes need no Webflow publish.
- `data-cookieconsent="ignore"` stops Cookiebot auto-blocking from holding the script back. The script sets no cookies itself.
- If `rules.json` cannot be loaded within 2.5 seconds, the tool runs on the rules built into the script (the `rules.json` of that release).

## Changing rules (no developer needed)

1. Edit `rules.json` on GitHub and commit to `main`.
2. Purge the cache: open `https://purge.jsdelivr.net/gh/OWNER/briqwise-dossier-check@main/rules.json` (or use jsdelivr.com/tools/purge). Without a purge, jsDelivr serves the old file for up to 12 hours.
3. Check on the live page: the root element gets `data-dc-rules="remote"` when the file loaded.

| Key | Meaning |
| --- | --- |
| `hubspot.forms.report` / `caseSubmit` | Form GUIDs. While a GUID contains `REPLACE`, nothing is sent (dry run). |
| `hubspot.loanDurationUnit` | `months` or `years`: unit of `loan_duration_imp` on the Loan. |
| `ui.gateOutcome` | `true` hides the outcome behind the e-mail form as well. |
| `ui.meetingTrigger` | CSS selector of the page element that opens the site's meeting modal (now `.lower-third-meeting_link`). If it is not on the page, the button opens `ui.meetingUrl`. |
| `ui.meetingUrl`, `ui.phone` | "Plan een call" link and phone number in error messages. |
| `email.blockFreeMail`, `email.mxCheck`, `email.extraBlockedDomains` | E-mail validation. |
| `loan.termOptionsMonths` | The terms the slider offers, in months (now 3, 6, 12, 24, 36, 48, 60, 120, 240). The slider snaps to these. Keep in sync with the `dc_term_months` dropdown in HubSpot. |
| `loan.*` | Min/max amount, LTV cap (0.75), LTV above which the rate goes up (0.70), sweetspot bands. |
| `repayment.*` | Interest-only up to 50% LTV, the rest linear over 10 years; up to 24 months interest-only up to 70% LTV. |
| `costs.*`, `guarantee.*`, `rate.*` | Fees, guarantee (15% at LTV ≤ 50%), rate band 6–9% and term surcharges. |
| `intermediaryFee.*` | Intermediairsregeling. `enabled: false` or a past `validUntil` (YYYY-MM-DD) hides it everywhere. |

## HubSpot setup (once)

`scripts/hubspot-setup.mjs` creates the 31 contact properties (group "Dossier-check"), adds the option "Agrarisch / grond" to `type_bestemming`, and creates the forms "Dossier-check | Rapport" and "Dossier-check | Case indienen" with every field the tool sends. It prints the two form GUIDs for `rules.json`.

```bash
HUBSPOT_TOKEN=pat-eu1-... node scripts/hubspot-setup.mjs --dry   # shows what it would do
HUBSPOT_TOKEN=pat-eu1-... node scripts/hubspot-setup.mjs         # does it
```

Private app scopes: `crm.schemas.contacts.read`, `crm.schemas.contacts.write`, `crm.schemas.custom.read`, `forms`. Never commit the token. The script is safe to re-run.

## Changing code

```bash
npm install
npm run build      # writes dist/
npm test           # needs: pip install playwright (Chromium)
```

Then bump `version` in `package.json`, rebuild, commit including `dist/`, and tag the release with the bare version number (`git tag 1.1.0`). Update the version in the Webflow script URL and publish.

Test on the live page without sending anything to HubSpot: add `?dc-dry=1` to the URL. Payloads are logged to the console.

## Notes

- The repo must be public: jsDelivr only serves public GitHub repositories. Everything in it is visible in the browser anyway; never commit private keys or tokens.
- The Google Maps key is the existing browser key from `/lenen/stap-1`. Make sure it is restricted to `*.briqwise.com` in Google Cloud.
- HubSpot setup (properties, forms, workflows): see the doc "Dossier-check: HubSpot- en Webflow-inrichting".
