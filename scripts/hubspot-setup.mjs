// Creates the HubSpot properties and the two forms the dossier-check submits to.
// Usage:  HUBSPOT_TOKEN=pat-eu1-... node scripts/hubspot-setup.mjs [--dry] [--props-only]
// Private app scopes: crm.schemas.contacts.read, crm.schemas.contacts.write, crm.schemas.custom.read, forms
// Safe to re-run: existing properties are left alone; forms are only created when no form with the same name exists.

const TOKEN = process.env.HUBSPOT_TOKEN;
const DRY = process.argv.includes('--dry');
const PROPS_ONLY = process.argv.includes('--props-only');
const API = 'https://api.hubapi.com';
if (!TOKEN) { console.error('Set HUBSPOT_TOKEN (private app token).'); process.exit(1); }

const GROUP = { name: 'dossier_check', label: 'Dossier-check' };
const LOAN = '2-138893726', COLLATERAL = '2-139157927';
const FORM_NAMES = { report: 'Dossier-check | Rapport', caseSubmit: 'Dossier-check | Case indienen' };

const opt = (pairs) => pairs.map(([value, label], i) => ({ value, label, displayOrder: i }));
const DOCS = opt([['taxatie', 'Taxatierapport'], ['foto', 'Foto onderpand'], ['koopcontract', 'Koopcontract'], ['huurcontracten', 'Huurcontracten'], ['kvk', 'KvK-uittreksel'], ['jaarcijfers', 'Jaarcijfers'], ['ib', 'IB-aangifte UBO'], ['bkr', 'BKR-uittreksel'], ['portefeuille', 'Overzicht vastgoedportefeuille'], ['begroting', 'Begroting of offerte'], ['omgevingsvergunning', 'Omgevingsvergunning'], ['erfpachtcontract', 'Erfpachtcontract'], ['exploitatieovereenkomst', 'Exploitatieovereenkomst']]);
const num = (name, label, currency = false) => ({ name, label, type: 'number', fieldType: 'number', ...(currency ? { showCurrencySymbol: true } : {}) });
const sel = (name, label, options) => ({ name, label, type: 'enumeration', fieldType: 'select', options });
const multi = (name, label, options) => ({ name, label, type: 'enumeration', fieldType: 'checkbox', options });
const text = (name, label) => ({ name, label, type: 'string', fieldType: 'text' });
const area = (name, label) => ({ name, label, type: 'string', fieldType: 'textarea' });
const bool = (name, label) => ({ name, label, type: 'enumeration', fieldType: 'booleancheckbox', options: opt([['true', 'Ja'], ['false', 'Nee']]) });

const PROPS = [
  sel('intermediair_type', 'Type intermediair', opt([['financieringsadviseur', 'Financieringsadviseur'], ['accountant_administratie', 'Accountant of administratiekantoor'], ['makelaar', 'Makelaar'], ['assurantiekantoor', 'Assurantiekantoor'], ['bank_geldverstrekker', 'Bank of geldverstrekker'], ['anders', 'Anders']])),
  sel('dc_outcome', 'Dossier-check uitkomst', opt([['term_sheet', 'Kansrijk: term sheet'], ['dossier_aanvullen', 'Kansrijk: dossier aanvullen'], ['maatwerk', 'Maatwerk']])),
  num('dc_loan_amount', 'Leensom', true), num('dc_property_value', 'Waarde onderpand', true),
  sel('dc_term_months', 'Looptijd (maanden)', opt([3, 6, 12, 24, 36, 48, 60, 120, 240].map(m => [String(m), m < 12 ? `${m} maanden` : `${m} maanden (${m / 12} jaar)`]))), num('dc_ltv', 'LTV (%)'),
  sel('dc_usage', 'Gebruik', opt([['verhuur', 'Verhuurd'], ['eigen', 'Eigen gebruik'], ['combi', 'Combinatie']])),
  sel('dc_applicant_type', 'Aanvrager', opt([['bv', 'BV of NV'], ['ez', 'Eenmanszaak of vof'], ['prive', 'Privé (box 3)']])),
  sel('dc_box3_criteria', 'Box 3-criteria', opt([['ja', 'Ja'], ['nee', 'Nee'], ['onbekend', 'Onbekend'], ['nvt', 'N.v.t.']])),
  sel('dc_ownership', 'Eigendom', opt([['vol', 'Volle eigendom'], ['erfpacht', 'Erfpacht']])),
  sel('dc_bank_declined', 'Afgewezen door bank', opt([['nee', 'Nee'], ['ja', 'Ja'], ['lopend', 'Loopt nog']])),
  sel('dc_urgency', 'Urgentie', opt([['2_weken', 'Binnen 2 weken'], ['1_maand', 'Binnen 1 maand'], ['3_maanden', 'Binnen 3 maanden'], ['orienterend', 'Oriënterend']])),
  multi('dc_special_circumstances', 'Bijzonderheden', opt([['casino_huurder', 'Huurder is een casino'], ['starter', 'Starter of gewijzigde exploitatie'], ['faillissement', 'Eerder failliet'], ['bkr', 'BKR-achterstand'], ['negatieve_publiciteit', 'Negatief in het nieuws'], ['bestemming', 'Gebruik niet conform bestemming'], ['buitenland', 'Onderpand in het buitenland'], ['verzekering', 'Onderpand niet volledig verzekerd']])),
  multi('dc_documents_ready', 'Documenten aanwezig', DOCS), multi('dc_documents_missing', 'Documenten ontbrekend', DOCS),
  text('dc_documents_missing_text', 'Ontbrekende documenten (tekst)'),
  num('dc_dossier_completeness', 'Dossier compleet (%)'),
  num('dc_max_financing', 'Max. financiering', true), num('dc_annual_repayment', 'Aflossing per jaar', true),
  num('dc_guarantee_amount', 'Borgstelling', true), num('dc_financing_fee', 'Financieringsfee', true),
  num('dc_rate_surcharge', 'Renteopslag looptijd (%)'),
  num('dc_monthly_low', 'Maandlast indicatie laag', true), num('dc_monthly_high', 'Maandlast indicatie hoog', true),
  num('dc_intermediary_fee_pct', 'Intermediairsvergoeding (%)'), num('dc_intermediary_fee_amount', 'Intermediairsvergoeding', true),
  area('dc_report_summary', 'Rapport samenvatting'),
  bool('dc_case_submitted', 'Case ingediend'),
  area('dc_notes', 'Toelichting intermediair'),
  bool('dc_client_consent', 'Klant akkoord met delen'),
  { name: 'dc_last_check_at', label: 'Laatste dossier-check', type: 'date', fieldType: 'date' }
];
const NEW_TYPE_OPTION = { value: 'Agrarisch / grond', label: 'Agrarisch / grond' };

/* Fields per form, exactly what the script on the website sends. */
const DC_FIELDS = PROPS.filter(p => !['dc_last_check_at', 'dc_case_submitted', 'dc_notes', 'dc_client_consent'].includes(p.name)).map(p => p.name);
const TRACKING = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'li_fat_id', 'previous_page_before_conversion'];
const COMMON = ['contact_type', 'bw_business_unit', 'doel_financiering', 'type_bestemming', ...DC_FIELDS, ...TRACKING];
const FORMS = {
  report: {
    visible: ['firstname', 'lastname', 'email', 'phone', 'company', 'zip', 'intermediair_type', 'marketing_consent'],
    required: ['firstname', 'lastname', 'email', 'company', 'zip', 'intermediair_type'],
    hidden: COMMON.filter(n => n !== 'intermediair_type'), objects: [['0-2', ['name', 'zip']]]
  },
  caseSubmit: {
    visible: ['email', 'phone', 'dc_notes', 'dc_client_consent'],
    required: ['email', 'phone', 'dc_client_consent'],
    hidden: ['dc_case_submitted', 'appraisal_value', 'desired_loan_amount', 'ltv', 'straatnaam_vastgoed', 'huisnummer_vastgoed', 'huisnummer_toevoeging_los', 'postcode_vastgoed', 'plaatsnaam_vastgoed', ...COMMON],
    objects: [[LOAN, ['loan_amount', 'loan_duration_imp', 'loan_status', 'bi_loans_id', 'loan_country']], [COLLATERAL, ['collateral_address_full', 'collateral_street', 'collateral_house_number', 'collateral_house_number_addition', 'collateral_postal_code', 'collateral_city', 'collateral_country_code', 'collateral_appraisal_value', 'collateral_financing_type', 'collateral_usage']]]
  }
};

async function hs(method, path, body) {
  const res = await fetch(API + path, { method, headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const txt = await res.text(); let json = null; try { json = txt ? JSON.parse(txt) : null; } catch { json = txt; }
  return { ok: res.ok, status: res.status, json };
}
const log = (...a) => console.log(...a);

async function ensureGroup() {
  const r = await hs('GET', `/crm/v3/properties/contacts/groups/${GROUP.name}`);
  if (r.ok) return log('= group exists:', GROUP.label);
  if (DRY) return log('+ would create group:', GROUP.label);
  const c = await hs('POST', '/crm/v3/properties/contacts/groups', { ...GROUP, displayOrder: -1 });
  log(c.ok ? '+ created group: ' + GROUP.label : '! group failed: ' + JSON.stringify(c.json));
}

async function ensureProps() {
  for (const p of PROPS) {
    const r = await hs('GET', `/crm/v3/properties/contacts/${p.name}`);
    if (r.ok) { log(`= exists: ${p.name}${r.json.type !== p.type ? ` (type ${r.json.type}, expected ${p.type})` : ''}`); continue; }
    if (DRY) { log('+ would create:', p.name); continue; }
    const c = await hs('POST', '/crm/v3/properties/contacts', { ...p, groupName: GROUP.name });
    log(c.ok ? '+ created: ' + p.name : `! ${p.name} failed: ${JSON.stringify(c.json)}`);
  }
  const t = await hs('GET', '/crm/v3/properties/contacts/type_bestemming');
  if (!t.ok) return log('! type_bestemming not found');
  if (t.json.options.some(o => o.value === NEW_TYPE_OPTION.value)) return log('= type_bestemming already has', NEW_TYPE_OPTION.value);
  if (DRY) return log('+ would add option to type_bestemming:', NEW_TYPE_OPTION.value);
  const options = [...t.json.options, { ...NEW_TYPE_OPTION, displayOrder: t.json.options.length }];
  const u = await hs('PATCH', '/crm/v3/properties/contacts/type_bestemming', { options });
  log(u.ok ? '+ added option to type_bestemming' : '! type_bestemming update failed: ' + JSON.stringify(u.json));
}

/* Turn a property definition into a Forms v3 field of the matching type. */
function toField(objectTypeId, p, hidden, required) {
  const base = { objectTypeId, name: p.name, label: p.label, hidden, required, dependentFields: [] };
  const opts = (p.options || []).filter(o => !o.hidden).map((o, i) => ({ value: o.value, label: o.label, displayOrder: i }));
  if (p.name === 'email') return { ...base, fieldType: 'email', validation: { useDefaultBlockList: true, blockedEmailDomains: [] } };
  if (p.fieldType === 'phonenumber') return { ...base, fieldType: 'phone', useCountryCodeSelect: false, validation: { minAllowedDigits: 7, maxAllowedDigits: 20 } };
  if (p.type === 'number') return { ...base, fieldType: 'number' };
  if (p.fieldType === 'booleancheckbox') return { ...base, fieldType: 'single_checkbox' };
  if (p.fieldType === 'checkbox') return { ...base, fieldType: 'multiple_checkboxes', options: opts, defaultValues: [] };
  if (p.type === 'enumeration') return { ...base, fieldType: 'dropdown', options: opts, defaultValues: [] };
  if (p.fieldType === 'textarea') return { ...base, fieldType: 'multi_line_text' };
  return { ...base, fieldType: 'single_line_text' };
}

async function fieldsFor(spec) {
  const fields = [], missing = [];
  for (const [names, hidden] of [[spec.visible, false], [spec.hidden, true]]) {
    for (const n of names) {
      const r = await hs('GET', `/crm/v3/properties/contacts/${n}`);
      if (!r.ok) { missing.push('contact.' + n); continue; }
      fields.push(toField('0-1', r.json, hidden, !hidden && spec.required.includes(n)));
    }
  }
  const objectFields = [];
  for (const [obj, names] of spec.objects) {
    for (const n of names) {
      const r = await hs('GET', `/crm/v3/properties/${obj}/${n}`);
      if (!r.ok) { missing.push(`${obj}.${n}`); continue; }
      objectFields.push(toField(obj, r.json, true, false));
    }
  }
  return { fields, objectFields, missing };
}

function formBody(name, fields) {
  const groups = [];
  for (let i = 0; i < fields.length; i += 3) groups.push({ groupType: 'default_group', richTextType: 'text', fields: fields.slice(i, i + 3) });
  const now = new Date().toISOString();
  return {
    formType: 'hubspot', name, createdAt: now, updatedAt: now, archived: false, fieldGroups: groups,
    configuration: { language: 'nl', createNewContactForNewEmail: false, editable: true, allowLinkToResetKnownValues: false, postSubmitAction: { type: 'thank_you', value: 'Bedankt.' }, prePopulateKnownValues: false, cloneable: true, notifyContactOwner: false, recaptchaEnabled: false, archivable: true, notifyRecipients: [], lifecycleStages: [] },
    displayOptions: { renderRawHtml: false, theme: 'default_style', submitButtonText: 'Verstuur', style: { fontFamily: 'arial, helvetica, sans-serif', backgroundWidth: '100%', labelTextColor: '#33475b', labelTextSize: '14px', helpTextColor: '#7C98B6', helpTextSize: '11px', legalConsentTextColor: '#33475b', legalConsentTextSize: '14px', submitColor: '#ff5117', submitAlignment: 'left', submitFontColor: '#ffffff', submitSize: '12px' } },
    legalConsentOptions: { type: 'none' }
  };
}

async function existingForms() {
  const out = {}; let after;
  do {
    const r = await hs('GET', '/marketing/v3/forms?limit=100' + (after ? '&after=' + after : ''));
    if (!r.ok) { log('! could not list forms:', JSON.stringify(r.json)); break; }
    for (const f of r.json.results) out[f.name] = f.id;
    after = r.json.paging?.next?.after;
  } while (after);
  return out;
}

async function ensureForms() {
  const have = await existingForms(), guids = {};
  for (const key of Object.keys(FORMS)) {
    const name = FORM_NAMES[key];
    if (have[name]) { guids[key] = have[name]; log(`= form exists: ${name} -> ${have[name]}`); continue; }
    const { fields, objectFields, missing } = await fieldsFor(FORMS[key]);
    if (missing.length) log(`  note: not on HubSpot, left out of "${name}": ${missing.join(', ')}`);
    if (DRY) { log(`+ would create form "${name}" with ${fields.length + objectFields.length} fields`); continue; }
    let r = await hs('POST', '/marketing/v3/forms', formBody(name, [...fields, ...objectFields]));
    if (!r.ok && objectFields.length) {
      log(`  form with Loan/Collateral fields refused (${r.status}): ${JSON.stringify(r.json?.message || r.json)}`);
      log('  retrying without Loan/Collateral fields; add those in the form editor (copy them from the /lenen/stap-1 form)');
      r = await hs('POST', '/marketing/v3/forms', formBody(name, fields));
    }
    if (r.ok) { guids[key] = r.json.id; log(`+ created form: ${name} -> ${r.json.id}`); }
    else log(`! form "${name}" failed (${r.status}): ${JSON.stringify(r.json)}`);
  }
  return guids;
}

(async () => {
  log(DRY ? '--- DRY RUN: nothing is changed ---' : '--- HubSpot setup ---');
  await ensureGroup();
  await ensureProps();
  if (PROPS_ONLY) return log('\nDone (properties only).');
  const guids = await ensureForms();
  if (guids.report || guids.caseSubmit) {
    log('\nPaste into rules.json -> hubspot.forms:');
    log(JSON.stringify({ report: guids.report || 'REPLACE', caseSubmit: guids.caseSubmit || 'REPLACE' }, null, 2));
  }
})().catch(e => { console.error(e); process.exit(1); });
