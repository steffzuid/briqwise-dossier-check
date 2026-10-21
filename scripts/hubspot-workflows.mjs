#!/usr/bin/env node
/*
 * Creates the two dossier-check workflows in HubSpot (switched OFF, for review):
 *   1. "Dossier-check | Rapport"  : form submission -> owner by postcode (if empty) -> e-mail 01 or 02
 *   2. "Dossier-check | Case"     : form submission -> e-mail 03
 *
 * The postcode routing mirrors workflow 699106543 (that flow cannot be read via the API), on the
 * contact's office postcode (zip, 4 digits). Branches are checked top to bottom, first match wins.
 *
 *   HUBSPOT_TOKEN=... node scripts/hubspot-workflows.mjs --dry      # prints the flows, changes nothing
 *   HUBSPOT_TOKEN=... node scripts/hubspot-workflows.mjs            # creates them (disabled)
 *   HUBSPOT_TOKEN=... node scripts/hubspot-workflows.mjs --rapport-only   # only flow 1
 *   HUBSPOT_TOKEN=... node scripts/hubspot-workflows.mjs --diagnose       # tests each building block, cleans up
 *   --emails <rapport>,<knockout>,<case>   use other e-mail content ids
 *   --delete <flowId,flowId>                delete older versions first
 *
 * Scope needed: automation (plus the scopes of hubspot-setup.mjs are fine to keep).
 */

const TOKEN = process.env.HUBSPOT_TOKEN;
const DRY = process.argv.includes('--dry');
if (!TOKEN) { console.error('Set HUBSPOT_TOKEN'); process.exit(1); }

const API = 'https://api.hubapi.com';
/* Same order and prefixes as workflow 699106543 ("1. Branch"). */
const ROUTES = [
  ['Jan Dekker', '1061821123', ['102', '103', '1086', '1087', '1095', '11', '144', '145', '146', '147', '148', '149', '15', '16', '17', '18', '19', '77', '78', '79', '82', '83', '84', '85', '86', '87', '88', '89', '9']],
  ['Rients Teernstra', '766963520', ['51', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64']],
  ['Justin Braam', '1006778299', ['100', '101', '104', '105', '106', '107', '1081', '1082', '1083', '1084', '1085', '1088', '1089', '1090', '1091', '1092', '1093', '1094', '1096', '1097', '1098', '1099', '12', '13', '140', '141', '142', '143', '2', '30', '34', '35', '36', '37', '38', '39']],
  ['Eric Mennink', '1061821122', ['40', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '80', '81']],
  ['Richard Halters', '1254881945', ['31', '32', '33', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '52']]
];
const FORMS = { report: '7b005adc-6bbc-4b51-a285-73736a6bf72a', caseSubmit: '71fcbb57-bfae-45ea-9fb7-fcfb7ae8ba4a' };
const EMAILS = { // content ids, overridable: --emails rapport,knockout,case
  rapport: '495488580841', knockout: '495527308493', caseOntvangen: '495541067985' // v2 e-mails
};
{ const i = process.argv.indexOf('--emails'); if (i > -1) { const [a, b, c] = process.argv[i + 1].split(','); Object.assign(EMAILS, { rapport: a, knockout: b, caseOntvangen: c }); } }
const FALLBACK_OWNER = '353404138'; // Guus

/* Account manager details written onto the contact, so the e-mails can show the right
   name, phone, photo and meeting link with plain personalization tokens. */
const FILES = 'https://25717347.fs1.hubspotusercontent-eu1.net/hubfs/25717347/';
const MEET = 'https://meetings-eu1.hubspot.com/';
const AM = {
  '1061821123': { dc_am_name: 'Jan Dekker', dc_am_email: 'jan@briqwise.com', dc_am_phone: '+31 6 43 52 52 12', dc_am_photo_url: FILES + 'jan.jpg', dc_am_meeting_url: MEET + 'jan-dekker' },
  '766963520': { dc_am_name: 'Rients Teernstra', dc_am_email: 'rients@briqwise.com', dc_am_phone: '+31 (0)6 35 63 63', dc_am_photo_url: FILES + 'Rients_Briqwise_400x400.png', dc_am_meeting_url: MEET + 'rients-teernstra' },
  '1006778299': { dc_am_name: 'Justin Braam', dc_am_email: 'justin@briqwise.com', dc_am_phone: '085 130 37 86', dc_am_photo_url: FILES + 'guus.jpg', dc_am_meeting_url: MEET + 'justin-braam' },
  '1061821122': { dc_am_name: 'Eric Mennink', dc_am_email: 'eric@briqwise.com', dc_am_phone: '+31 6 11 59 65 97', dc_am_photo_url: FILES + 'eric.jpg', dc_am_meeting_url: MEET + 'guus-oerlemans' },
  '1254881945': { dc_am_name: 'Richard Halters', dc_am_email: 'richard@briqwise.com', dc_am_phone: '+31 6 54 26 27 41', dc_am_photo_url: FILES + 'Richard%20Halters-fotor-20241011102030.png', dc_am_meeting_url: MEET + 'richard-halters' },
  '353404138': { dc_am_name: 'Guus Oerlemans', dc_am_email: 'guus@briqwise.com', dc_am_phone: '+31 (0)6 25 05 78 94', dc_am_photo_url: FILES + 'guus.jpg', dc_am_meeting_url: MEET + 'guus-oerlemans' }
};
const AM_PROPS = [['dc_am_name', 'Accountmanager naam'], ['dc_am_email', 'Accountmanager e-mail'], ['dc_am_phone', 'Accountmanager telefoon'], ['dc_am_photo_url', 'Accountmanager foto (URL)'], ['dc_am_meeting_url', 'Accountmanager meetinglink']];

async function hs(method, path, body) {
  const res = await fetch(API + path, { method, headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const txt = await res.text(); let json = null; try { json = txt ? JSON.parse(txt) : null; } catch { json = txt; }
  return { ok: res.ok, status: res.status, json };
}
const clone = (o) => JSON.parse(JSON.stringify(o));

/* ---------- action builders (automation v4) ---------- */
let nextId = 1;
const id = () => String(nextId++);
const next = (to) => to ? { edgeType: 'STANDARD', nextActionId: to } : undefined;
const single = (actionId, actionTypeId, fields, to) => ({ type: 'SINGLE_CONNECTION', actionId, actionTypeVersion: 0, actionTypeId, fields, ...(to ? { connection: next(to) } : {}) });
const delay = (actionId, minutes, to) => single(actionId, '0-1', { delta: String(minutes), time_unit: 'MINUTES' }, to);
const email = (actionId, contentId, to) => single(actionId, '0-4', { content_id: contentId }, to);
const setProp = (actionId, name, value, to) => single(actionId, '0-5', { property_name: name, value: { type: 'STATIC_VALUE', staticValue: value } }, to);
const setOwner = (actionId, ownerId, to) => single(actionId, '0-5', { property_name: 'hubspot_owner_id', value: { type: 'STATIC_VALUE', staticValue: ownerId } }, to);
const prop = (property, operationType, operator, values) => ({
  filterBranchType: 'OR', filterBranchOperator: 'OR', filters: [], filterBranches: [{
    filterBranchType: 'AND', filterBranchOperator: 'AND', filterBranches: [],
    filters: [{ filterType: 'PROPERTY', property, operation: { operationType, operator, includeObjectsWithNoValueSet: false, ...(values ? { values } : {}) } }]
  }]
});
const listBranch = (actionId, branches, defaultName, defaultTo) => ({
  type: 'LIST_BRANCH', actionId,
  listBranches: branches.map(b => ({ branchName: b.name, filterBranch: b.filter, ...(b.to ? { connection: next(b.to) } : {}) })),
  defaultBranchName: defaultName, ...(defaultTo ? { defaultBranch: next(defaultTo) } : {})
});

const formTrigger = (guid) => ({
  type: 'EVENT_BASED', shouldReEnroll: true, listMembershipFilterBranches: [],
  eventFilterBranches: [{
    filterBranchType: 'UNIFIED_EVENTS', filterBranchOperator: 'AND', eventTypeId: '4-1639801', operator: 'HAS_COMPLETED', filterBranches: [],
    filters: [{ filterType: 'PROPERTY', property: 'hs_form_id', operation: { operationType: 'MULTISTRING', operator: 'IS_EQUAL_TO', includeObjectsWithNoValueSet: false, values: [guid] } }]
  }]
});

const base = (name, criteria, actions, startActionId) => ({
  isEnabled: false, flowType: 'WORKFLOW', type: 'CONTACT_FLOW', objectTypeId: '0-1', name,
  startActionId, nextAvailableActionId: String(nextId), actions, enrollmentCriteria: criteria,
  timeWindows: [], blockedDates: [], customProperties: {}, dataSources: [], suppressionListIds: [], canEnrollFromSalesforce: false
});

/* ---------- main ---------- */

/* Flow 1: rapport. No merging paths (the API rejects them): every path gets its own copy. */
nextId = 1;
const tail = () => { // outcome branch -> e-mail 01 / 02
  const b = id(), m1 = id(), m2 = id();
  return [b, [
    listBranch(b, [{ name: 'Knockout', filter: prop('dc_outcome', 'ENUMERATION', 'IS_ANY_OF', ['knockout']), to: m2 }], 'Rapport', m1),
    email(m1, EMAILS.rapport), email(m2, EMAILS.knockout)
  ]];
};
const amChain = (ownerId, after) => { // set the 5 dc_am_* properties, then continue at `after`
  const data = AM[ownerId] || AM[FALLBACK_OWNER];
  const ids = AM_PROPS.map(() => id());
  return [ids[0], AM_PROPS.map(([n], i) => setProp(ids[i], n, data[n], ids[i + 1] || after))];
};
const aDelay = id(), aHasOwner = id(), aRoute = id(), aWhich = id();
const acts = [];
/* path A: contact already has an owner -> branch on that owner to fill in the details */
const whichBranches = Object.keys(AM).map(ownerId => {
  const [t, ta] = tail(); const [c, ca] = amChain(ownerId, t); acts.push(...ca, ...ta);
  return { name: AM[ownerId].dc_am_name, filter: prop('hubspot_owner_id', 'ENUMERATION', 'IS_ANY_OF', [ownerId]), to: c };
});
let whichDefault; { const [t, ta] = tail(); const [c, ca] = amChain(FALLBACK_OWNER, t); acts.push(...ca, ...ta); whichDefault = c; }
/* path B: no owner yet -> postcode routing sets the owner and the details */
const routeBranches = ROUTES.map(([name, owner, prefixes]) => {
  const aid = id(); const [t, ta] = tail(); const [c, ca] = amChain(owner, t);
  acts.push(setOwner(aid, owner, c), ...ca, ...ta);
  return { name, filter: prop('zip', 'MULTISTRING', 'STARTS_WITH', prefixes), to: aid };
});
const aFallback = id(); { const [t, ta] = tail(); const [c, ca] = amChain(FALLBACK_OWNER, t); acts.push(setOwner(aFallback, FALLBACK_OWNER, c), ...ca, ...ta); }
const flow1 = base('Dossier-check | Rapport → eigenaar + e-mail', formTrigger(FORMS.report), [
  delay(aDelay, 1, aHasOwner),
  /* only keep an existing owner when it is an intermediary account manager; anyone else
     (e.g. an investor account manager) is replaced through the postcode routing */
  listBranch(aHasOwner, [{ name: 'Eigenaar is accountmanager intermediairs', filter: prop('hubspot_owner_id', 'ENUMERATION', 'IS_ANY_OF', Object.keys(AM)), to: aWhich }], 'Geen of andere eigenaar', aRoute),
  listBranch(aWhich, whichBranches, 'Andere eigenaar (gegevens Guus)', whichDefault),
  listBranch(aRoute, routeBranches, 'Geen correcte postcode (Guus)', aFallback),
  ...acts
], aDelay);

/* Flow 2: case */
nextId = 1;
const cDelay = id(), cMail = id();
const flow2 = base('Dossier-check | Case ingediend → e-mail', formTrigger(FORMS.caseSubmit), [
  delay(cDelay, 1, cMail),
  email(cMail, EMAILS.caseOntvangen)
], cDelay);

/* --diagnose: create tiny test flows, one feature each, report which one HubSpot rejects, delete them again. */
if (process.argv.includes('--diagnose')) {
  const probe = (name, actions) => { const f = base('DC test | ' + name, formTrigger(FORMS.report), actions, '1'); f.nextAvailableActionId = String(actions.length + 1); return f; };
  const tests = [
    ['set owner', [setOwner('1', FALLBACK_OWNER)]],
    ['branch zip starts with', [listBranch('1', [{ name: 'A', filter: prop('zip', 'MULTISTRING', 'STARTS_WITH', ['31', '32']), to: '2' }], 'Anders', '3'), delay('2', 1), delay('3', 1)]],
    ['branch owner is known', [listBranch('1', [{ name: 'A', filter: prop('hubspot_owner_id', 'ALL_PROPERTY', 'IS_KNOWN'), to: '2' }], 'Anders', '3'), delay('2', 1), delay('3', 1)]],
    ['branch outcome enum', [listBranch('1', [{ name: 'A', filter: prop('dc_outcome', 'ENUMERATION', 'IS_ANY_OF', ['knockout']), to: '2' }], 'Anders', '3'), delay('2', 1), delay('3', 1)]],
    ['merge two paths', [listBranch('1', [{ name: 'A', filter: prop('zip', 'MULTISTRING', 'STARTS_WITH', ['31']), to: '2' }], 'Anders', '2'), delay('2', 1)]],
    ['branch on owner', [listBranch('1', [{ name: 'A', filter: prop('hubspot_owner_id', 'ENUMERATION', 'IS_ANY_OF', [FALLBACK_OWNER]), to: '2' }], 'Anders', '3'), delay('2', 1), delay('3', 1)]],
    ['set text property', [setProp('1', 'dc_notes', 'test')]],
    ['email rapport', [email('1', EMAILS.rapport)]],
    ['email knockout', [email('1', EMAILS.knockout)]]
  ];
  for (const [name, actions] of tests) {
    const r = await hs('POST', '/automation/v4/flows', probe(name, actions));
    console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${name}${r.ok ? '' : ' -> ' + JSON.stringify(r.json)}`);
    if (r.ok) await hs('DELETE', `/automation/v4/flows/${r.json.id}`);
  }
  process.exit(0);
}

/* properties for the account manager details */
for (const [name, label] of AM_PROPS) {
  if (DRY) { console.log('= would ensure property', name); continue; }
  const g = await hs('GET', `/crm/v3/properties/contacts/${name}`);
  if (g.ok) { console.log('= exists:', name); continue; }
  const c = await hs('POST', '/crm/v3/properties/contacts', { name, label, type: 'string', fieldType: 'text', groupName: 'dossier_check' });
  console.log(c.ok ? '+ created: ' + name : `! ${name} failed: ${JSON.stringify(c.json)}`);
}

/* --delete <id,id>: remove earlier versions of these workflows first */
{ const i = process.argv.indexOf('--delete');
  if (i > -1) for (const fid of process.argv[i + 1].split(',')) {
    if (DRY) { console.log('= would delete workflow', fid); continue; }
    const d = await hs('DELETE', `/automation/v4/flows/${fid}`);
    console.log(d.ok ? `- deleted workflow ${fid}` : `! delete ${fid} failed (${d.status}): ${JSON.stringify(d.json)}`);
  } }

const only = process.argv.includes('--rapport-only');
for (const f of only ? [flow1] : [flow1, flow2]) {
  if (DRY) { console.log(`\n--- would create (disabled): ${f.name}\n` + JSON.stringify(f, null, 2)); continue; }
  const r = await hs('POST', '/automation/v4/flows', f);
  if (r.ok) console.log(`+ created (disabled): ${f.name} -> https://app-eu1.hubspot.com/workflows/25717347/platform/flow/${r.json.id}/edit`);
  else { console.log(`! ${f.name} failed (${r.status}): ${JSON.stringify(r.json)}`); }
}
if (DRY) console.log('\n--- DRY RUN: nothing created');
