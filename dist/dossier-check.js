/*! Briqwise dossier-check v1.2.1 | logic, business-email validation and HubSpot Forms API connector | rules: rules.json */
(function () {
  'use strict';

  var SCRIPT = document.currentScript;
  var DEFAULTS = {"_info":"Briqwise dossier-check rules. Edit, commit to main, then purge the jsDelivr cache. Everything here is public.","version":"2026-10-19","hubspot":{"portalId":"25717347","forms":{"report":"7b005adc-6bbc-4b51-a285-73736a6bf72a","caseSubmit":"71fcbb57-bfae-45ea-9fb7-fcfb7ae8ba4a"},"loanDurationUnit":"months"},"ui":{"gateOutcome":false,"meetingUrl":"https://www.briqwise.com/contact","meetingTrigger":".lower-third-meeting_link","phone":"085 130 37 86"},"email":{"blockFreeMail":true,"mxCheck":true,"extraBlockedDomains":[]},"loan":{"min":100000,"max":5000000,"termOptionsMonths":[3,6,12,24,36,48,60,120,240],"ltvMax":0.75,"ltvHigherRate":0.7,"sweetspotMax":1000000,"goodMax":2500000},"repayment":{"interestOnlyLtv":0.5,"linearYears":10,"shortTermMonths":24,"shortTermInterestOnlyLtv":0.7},"costs":{"financingFee":0.0295,"financingFeeMinBase":100000,"managementFee":0.0025},"guarantee":{"lowLtv":0.5,"lowLtvPct":0.15},"rate":{"min":6,"max":9,"termSurcharges":[{"fromMonths":120,"pct":0.5},{"fromMonths":180,"pct":1},{"fromMonths":240,"pct":1.5}]},"intermediaryFee":{"enabled":true,"validUntil":null,"pctPerCriterion":0.5,"maxLoanAmount":200000,"maxLtv":0.5,"maxTermMonths":24}};
  var UI_CSS = "#bw-dc{--v:#1c0057;--v2:#493379;--v3:#77669a;--tx:#344054;--mu:#667085;--bd:#d0d5dd;--bd2:#eaecf0;--sf:#f9fafb;--pe:#feded5;--pe2:#fff4f0;--or:#ff5117;--sel:#ff7b55;--rd:#ff426c;--gr:linear-gradient(40deg,#ff30c1,#ff426c 19%,#ff5117);--ok:#067647;--okb:#ecfdf3;--okd:#abefc6;--wa:#b54708;--wab:#fffaeb;--wad:#fedf89;--da:#c01048;--dab:#fff1f3;--dad:#fecdd6;--mw:#493379;--mwb:#f4f1fa;--mwd:#d9d1ea;container-type:inline-size;font-family:Manrope,sans-serif;color:var(--tx);font-size:16px;line-height:1.5;max-width:880px;margin:0 auto}#bw-dc *{box-sizing:border-box}#bw-dc .dc-card{background:#fff;border-radius:16px;box-shadow:0 4px 8px 9px #0000000d;padding:32px}#bw-dc h2.dc-h{font-family:Ppformula,Manrope,sans-serif;font-weight:800;color:var(--v);font-size:28px;line-height:1.2;margin:0 0 6px}#bw-dc .dc-intro{margin:0 0 20px;color:var(--mu);font-size:15px}#bw-dc .dc-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:6px;font-size:13px;color:var(--mu)}#bw-dc .dc-eyebrow{font-weight:700;color:var(--or);text-transform:none}#bw-dc .dc-lbl{font-size:14px;font-weight:600;color:var(--v);margin:0 0 8px;display:block}#bw-dc .dc-hint{font-size:13px;color:var(--mu);margin:4px 0 0}#bw-dc .dc-meter{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:center;background:var(--pe2);border-radius:12px;padding:14px 16px;margin-bottom:24px}#bw-dc .dc-bar{position:relative;height:10px;border-radius:5px;background:#fff}#bw-dc .dc-bar i{position:absolute;top:-4px;width:2px;height:18px;background:var(--v)}#bw-dc .dc-bar i.s{top:-2px;width:1px;height:14px;background:var(--v3)}#bw-dc .dc-barf{height:10px;border-radius:5px;width:0;transition:width .25s,background .25s}#bw-dc .dc-ticks{position:relative;height:16px;font-size:11px;color:var(--v3)}#bw-dc .dc-ticks span{position:absolute;transform:translate(-50%)}#bw-dc .dc-pill{display:inline-block;font-size:12px;font-weight:700;padding:4px 10px;border-radius:8px}#bw-dc .dc-stat{display:inline-flex;align-items:center;gap:7px;font-size:16px;font-weight:700;line-height:1.3;transition:color .2s}#bw-dc .dc-stat:before{content:\"\";flex:none;width:9px;height:9px;border-radius:50%;background:currentColor;box-shadow:0 0 0 3px #fff}#bw-dc .dc-meter .dc-ltv,#bw-dc .dc-meter svg{transition:opacity .2s,filter .2s}#bw-dc .dc-meter.ko .dc-ltv,#bw-dc .dc-meter.ko svg{opacity:.35;filter:grayscale(1)}#bw-dc .dc-ko{font-size:13px;line-height:1.45;color:var(--da);background:var(--dab);border:1px solid var(--dad);border-radius:10px;padding:10px 12px;margin:-8px 0 20px}#bw-dc .dc-ko[hidden]{display:none}#bw-dc .dc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:20px}#bw-dc .dc-grid.sm{grid-template-columns:repeat(auto-fit,minmax(120px,170px))}#bw-dc .dc-grid.g3{grid-template-columns:repeat(3,minmax(0,1fr))}#bw-dc .dc-opt{font-family:inherit;background:#fff;border:1px solid var(--bd);border-radius:12px;padding:12px 14px;font-size:14px;font-weight:500;color:var(--tx);cursor:pointer;display:flex;gap:10px;align-items:center;text-align:left;line-height:1.3;min-width:0;min-height:48px;hyphens:auto;overflow-wrap:anywhere;transition:border-color .15s,background .15s}#bw-dc .dc-opt:hover{border-color:var(--sel)}#bw-dc .dc-opt svg{width:20px;height:20px;flex-shrink:0;stroke:var(--v3);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}#bw-dc .dc-opt.col{flex-direction:column;justify-content:center;text-align:center;gap:6px;padding:14px 8px}#bw-dc .dc-opt.on{border:1.5px solid var(--sel);background:var(--pe2);color:var(--v);font-weight:700}#bw-dc .dc-opt.on svg{stroke:var(--or)}#bw-dc .dc-opt.ok.on{border-color:var(--ok);background:var(--okb);color:var(--ok)}#bw-dc .dc-opt.ok.on svg{stroke:var(--ok)}#bw-dc .dc-opt.wa.on{border-color:var(--wa);background:var(--wab);color:var(--wa)}#bw-dc .dc-opt.wa.on svg{stroke:var(--wa)}#bw-dc .dc-opt.da.on{border-color:var(--da);background:var(--dab);color:var(--da)}#bw-dc .dc-opt.da.on svg{stroke:var(--da)}#bw-dc .dc-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}#bw-dc .dc-chips .dc-opt{min-height:44px;padding:10px 12px;font-size:13px}#bw-dc .dc-sl{margin-bottom:22px}#bw-dc .dc-slh{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:2px}#bw-dc .dc-slh .dc-lbl{margin:0}#bw-dc .dc-val{font-family:Ppformula,Manrope,sans-serif;font-size:18px;font-weight:700;color:var(--v);white-space:nowrap}#bw-dc .dc-stp{display:flex;align-items:center;gap:8px}#bw-dc .dc-stp button{width:34px;height:34px;border-radius:10px;border:1px solid var(--bd);background:#fff;color:var(--v);font-size:18px;line-height:1;cursor:pointer;padding:0}#bw-dc input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:36px;background:transparent;margin:0;padding:0}#bw-dc input[type=range]:focus{outline:none}#bw-dc input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:linear-gradient(to right,var(--or) var(--p,50%),var(--bd2) var(--p,50%))}#bw-dc input[type=range]::-moz-range-track{height:6px;border-radius:3px;background:linear-gradient(to right,var(--or) var(--p,50%),var(--bd2) var(--p,50%))}#bw-dc input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:#fff;border:2px solid var(--or);margin-top:-9px;box-shadow:0 1px 3px #10182826}#bw-dc input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#fff;border:2px solid var(--or)}#bw-dc .dc-scale{display:flex;justify-content:space-between;font-size:12px;color:var(--mu)}#bw-dc .dc-calc{background:var(--sf);border:1px solid var(--bd2);border-radius:12px;padding:12px 14px;margin:-6px 0 22px;font-size:14px}#bw-dc .dc-calc .r{display:flex;justify-content:space-between;gap:8px;padding:2px 0}#bw-dc .dc-calc .r b{color:var(--v)}#bw-dc .dc-nav{display:flex;justify-content:space-between;gap:10px;margin-top:8px}#bw-dc .dc-btn{font-family:Manrope,sans-serif;font-size:16px;font-weight:700;border-radius:12px;padding:14px 28px;cursor:pointer;border:0;background:var(--gr);color:#fff;min-height:52px;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;text-align:center}#bw-dc .dc-btn:disabled{opacity:.6;cursor:wait}#bw-dc .dc-btn.dc-line{background:#fff;color:var(--or);border:1px solid var(--or)}#bw-dc .dc-btn.ghost{background:transparent;color:var(--v);border:1px solid var(--bd);font-weight:600}#bw-dc .dc-btn.full{width:100%}#bw-dc .dc-in{font-family:Manrope,sans-serif;width:100%;height:50px;border:1px solid var(--bd);border-radius:12px;padding:12px 16px;font-size:16px;color:#101828;background:#fff}#bw-dc textarea.dc-in{height:96px;resize:vertical}#bw-dc .dc-in:focus{outline:none;border-color:var(--sel);box-shadow:0 0 0 3px #ff7b5533}#bw-dc .dc-in.bad{border-color:var(--da)}#bw-dc .dc-f2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:16px}#bw-dc .dc-err{font-size:13px;color:var(--da);margin:6px 0 0;min-height:0}#bw-dc .dc-check{display:flex;gap:10px;font-size:13px;color:var(--mu);align-items:flex-start;margin:6px 0}#bw-dc .dc-check input{width:18px;height:18px;margin-top:1px;flex-shrink:0;accent-color:var(--or)}#bw-dc .dc-out{display:flex;gap:12px;align-items:flex-start;border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid}#bw-dc .dc-out svg{width:24px;height:24px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;margin-top:1px}#bw-dc .dc-out p{margin:0}#bw-dc .dc-out .t{font-family:Ppformula,Manrope,sans-serif;font-weight:700;font-size:18px;margin-bottom:2px}#bw-dc .dc-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:20px}#bw-dc .dc-tile{background:var(--sf);border:1px solid var(--bd2);border-radius:12px;padding:12px 14px}#bw-dc .dc-tile p{margin:0}#bw-dc .dc-tile .k{font-size:13px;color:var(--mu)}#bw-dc .dc-tile .v{font-family:Ppformula,Manrope,sans-serif;font-size:19px;font-weight:700;color:var(--v);margin-top:2px}#bw-dc .dc-tile .v.dc-mask{color:var(--v3);letter-spacing:1px}#bw-dc .dc-box{border:1px solid var(--bd);border-radius:12px;padding:16px;margin-bottom:20px}#bw-dc .dc-box.peach{background:var(--pe2);border-color:var(--pe)}#bw-dc .dc-box.green{background:var(--okb);border-color:var(--okd);color:var(--ok)}#bw-dc .dc-box h3{font-family:Ppformula,Manrope,sans-serif;font-size:17px;font-weight:700;color:var(--v);margin:0 0 10px}#bw-dc .dc-box.green h3{color:var(--ok)}#bw-dc .dc-case{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}#bw-dc .dc-case .v{font-family:Ppformula,Manrope,sans-serif;font-size:19px;font-weight:700;color:var(--v)}#bw-dc .dc-case .k{font-size:13px;color:var(--mu)}#bw-dc .dc-list{margin:0;padding:0;list-style:none;font-size:14px}#bw-dc .dc-list li{padding:3px 0 3px 22px;position:relative}#bw-dc .dc-list li:before{content:\"\";position:absolute;left:2px;top:9px;width:10px;height:10px;border-radius:50%;border:2px solid currentColor;opacity:.7}#bw-dc .dc-list li.y:before{background:currentColor}#bw-dc .dc-small{font-size:12px;color:var(--mu);margin:12px 0 0}#bw-dc .dc-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0}#bw-dc [hidden]{display:none!important}#bw-dc .pac-target-input{width:100%}@container (max-width:560px){#bw-dc .dc-card{padding:18px;border-radius:14px}#bw-dc h2.dc-h{font-size:22px}#bw-dc .dc-meter{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#bw-dc .dc-meter .dc-ltv{grid-column:1/-1}#bw-dc .dc-grid,#bw-dc .dc-grid.sm,#bw-dc .dc-grid.g3{grid-template-columns:repeat(2,minmax(0,1fr))}#bw-dc .dc-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}#bw-dc .dc-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}#bw-dc .dc-tile .v{font-size:16px}#bw-dc .dc-case{grid-template-columns:1fr 1fr}#bw-dc .dc-case>div:first-child{grid-column:1/-1}#bw-dc .dc-f2{grid-template-columns:1fr}#bw-dc .dc-nav .back span{display:none}#bw-dc .dc-nav .dc-btn:not(.back){flex:1}#bw-dc .dc-btn{padding:14px 18px}}";
  var UI_HTML = "<div class=\"dc-card\"><div class=\"dc-top\"><span class=\"dc-eyebrow\">Dossier-check voor intermediairs</span><span data-dc=\"stepLbl\">Stap 1 van 3</span></div><h2 class=\"dc-h\">Heeft deze aanvraag kans?</h2><p class=\"dc-intro\">Schuif, klik en zie direct hoe je case ervoor staat.</p><div class=\"dc-meter\" data-dc=\"meter\"><div class=\"dc-ltv\"><span class=\"dc-lbl\" style=\"margin-bottom:6px\">LTV <span data-dc=\"ltvTxt\"></span></span><div class=\"dc-bar\"><div class=\"dc-barf\" data-dc=\"ltvBar\"></div><i class=\"s\" data-dc=\"tickFree\" style=\"left:50%\"></i><i data-dc=\"tickMax\" style=\"left:75%\"></i></div><div class=\"dc-ticks\"><span data-dc=\"tickFreeL\" style=\"left:50%\">50%</span><span data-dc=\"tickMaxL\" style=\"left:75%\">max 75%</span></div></div><div style=\"display:flex;align-items:center;gap:10px\"><svg width=\"42\" height=\"42\" viewBox=\"0 0 44 44\" aria-hidden=\"true\"><circle cx=\"22\" cy=\"22\" r=\"18\" fill=\"none\" stroke=\"#fff\" stroke-width=\"5\"/><circle data-dc=\"ring\" cx=\"22\" cy=\"22\" r=\"18\" fill=\"none\" stroke=\"#067647\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-dasharray=\"113.1\" stroke-dashoffset=\"113.1\" transform=\"rotate(-90 22 22)\" style=\"transition:stroke-dashoffset .3s\"/></svg><div><span class=\"dc-hint\" style=\"margin:0\">Dossier</span><div class=\"dc-val\" style=\"font-size:16px\" data-dc=\"docPct\">0%</div></div></div><div><span class=\"dc-hint\" style=\"margin:0 0 2px;display:block\">Status</span><span class=\"dc-stat\" data-dc=\"stat\"></span><span class=\"dc-hint\" style=\"margin:2px 0 0;display:block\" data-dc=\"statWhy\"></span></div></div><section data-step=\"1\"><span class=\"dc-lbl\">Doel van de financiering</span><div class=\"dc-grid\" data-g=\"doel\"><button type=\"button\" class=\"dc-opt\" data-v=\"aankoop\" data-i=\"key\">Aankoop</button><button type=\"button\" class=\"dc-opt\" data-v=\"herfin\" data-i=\"refresh\">Herfinanciering</button><button type=\"button\" class=\"dc-opt\" data-v=\"verbouw\" data-i=\"hammer\">Verbouwing</button><button type=\"button\" class=\"dc-opt\" data-v=\"project\" data-i=\"crane\">Nieuwbouw of transformatie</button><button type=\"button\" class=\"dc-opt\" data-v=\"bedrijf\" data-i=\"case\">Bedrijfs&shy;financiering</button></div><span class=\"dc-lbl\">Type vastgoed</span><div class=\"dc-grid\" data-g=\"type\"><button type=\"button\" class=\"dc-opt\" data-v=\"bedrijfsruimte\" data-i=\"warehouse\">Bedrijfsruimte</button><button type=\"button\" class=\"dc-opt\" data-v=\"combi\" data-i=\"store\">Bedrijf + woning</button><button type=\"button\" class=\"dc-opt\" data-v=\"woning\" data-i=\"home\">Woning</button><button type=\"button\" class=\"dc-opt\" data-v=\"winkel\" data-i=\"bag\">Winkel of horeca</button><button type=\"button\" class=\"dc-opt\" data-v=\"recreatie\" data-i=\"tent\">Recreatie</button><button type=\"button\" class=\"dc-opt\" data-v=\"grond\" data-i=\"leaf\">Agrarisch of grond</button></div><div class=\"dc-sl\"><div class=\"dc-slh\"><span class=\"dc-lbl\">Marktwaarde vastgoed</span><div class=\"dc-stp\"><button type=\"button\" data-s=\"waarde\" data-d=\"-1\" aria-label=\"Lager\">&minus;</button><span class=\"dc-val\" data-dc=\"wOut\"></span><button type=\"button\" data-s=\"waarde\" data-d=\"1\" aria-label=\"Hoger\">+</button></div></div><input type=\"range\" data-dc=\"waarde\" min=\"150000\" max=\"10000000\" step=\"25000\" value=\"1300000\" aria-label=\"Marktwaarde vastgoed\"><p class=\"dc-hint\">Nog geen taxatie? Gebruik de koopsom of een eigen inschatting.</p></div><div class=\"dc-sl\"><div class=\"dc-slh\"><span class=\"dc-lbl\">Gevraagd bedrag</span><div class=\"dc-stp\"><button type=\"button\" data-s=\"bedrag\" data-d=\"-1\" aria-label=\"Lager\">&minus;</button><span class=\"dc-val\" data-dc=\"bOut\"></span><button type=\"button\" data-s=\"bedrag\" data-d=\"1\" aria-label=\"Hoger\">+</button></div></div><input type=\"range\" data-dc=\"bedrag\" min=\"100000\" max=\"5000000\" step=\"25000\" value=\"850000\" aria-label=\"Gevraagd bedrag\"><div class=\"dc-scale\"><span data-dc=\"minL\">&euro; 100.000</span><span data-dc=\"maxL\">max. &euro; 5.000.000</span></div><p class=\"dc-hint\" data-dc=\"bHint\"></p></div><div class=\"dc-nav\" style=\"justify-content:flex-end\"><button type=\"button\" class=\"dc-btn\" data-go=\"2\">Volgende &rarr;</button></div></section><section data-step=\"2\" hidden><div class=\"dc-sl\"><div class=\"dc-slh\"><span class=\"dc-lbl\">Gewenste looptijd</span><span class=\"dc-val\" data-dc=\"lOut\"></span></div><input type=\"range\" data-dc=\"looptijd\" min=\"0\" max=\"8\" step=\"1\" value=\"6\" aria-label=\"Gewenste looptijd\"><p class=\"dc-hint\" data-dc=\"lHint\"></p></div><div class=\"dc-calc\"><div class=\"r\"><span>Aflossingsvrij</span><b data-dc=\"cVrij\"></b></div><div class=\"r\"><span>Verplichte aflossing</span><b data-dc=\"cAfl\"></b></div><p class=\"dc-hint\" data-dc=\"cRule\"></p></div><span class=\"dc-lbl\">Gebruik</span><div class=\"dc-grid sm three\" data-g=\"gebruik\"><button type=\"button\" class=\"dc-opt col\" data-v=\"verhuur\" data-i=\"users\">Verhuurd</button><button type=\"button\" class=\"dc-opt col\" data-v=\"eigen\" data-i=\"user\">Eigen gebruik</button><button type=\"button\" class=\"dc-opt col\" data-v=\"combi\" data-i=\"split\">Combinatie</button></div><span class=\"dc-lbl\">Aanvrager</span><div class=\"dc-grid sm three\" data-g=\"aanvrager\"><button type=\"button\" class=\"dc-opt col\" data-v=\"bv\" data-i=\"building\">BV of NV</button><button type=\"button\" class=\"dc-opt col\" data-v=\"ez\" data-i=\"badge\">Eenmanszaak of vof</button><button type=\"button\" class=\"dc-opt col\" data-v=\"prive\" data-i=\"user\">Priv&eacute; (box 3)</button></div><p class=\"dc-ko\" data-dc=\"koConsument\" hidden></p><div data-dc=\"box3w\" hidden><span class=\"dc-lbl\">Minimaal drie verhuurde panden en drie huurcontracten, en huur minimaal 25% van het totale inkomen?</span><div class=\"dc-grid sm\" data-g=\"box3\"><button type=\"button\" class=\"dc-opt\" data-v=\"ja\" style=\"justify-content:center\">Ja</button><button type=\"button\" class=\"dc-opt\" data-v=\"nee\" style=\"justify-content:center\">Nee</button></div></div><span class=\"dc-lbl\">Wat ligt al klaar? Tik aan.</span><div class=\"dc-chips\" data-dc=\"docs\"></div><div class=\"dc-calc\" style=\"margin-top:0\" data-dc=\"vergLive\"><div class=\"r\"><span>Jouw vergoeding als intermediair</span><b data-dc=\"cVerg\" style=\"color:#067647\"></b></div><p class=\"dc-hint\" data-dc=\"cVergH\"></p></div><div class=\"dc-nav\"><button type=\"button\" class=\"dc-btn ghost back\" data-go=\"1\" aria-label=\"Terug\">&larr;<span> Terug</span></button><button type=\"button\" class=\"dc-btn\" data-go=\"3\">Volgende &rarr;</button></div></section><section data-step=\"3\" hidden><span class=\"dc-lbl\">Is de geldnemer of huurder actief in seks, wapens of drugs, of exploiteert de geldnemer zelf een casino?</span><div class=\"dc-grid sm\" data-g=\"excl\"><button type=\"button\" class=\"dc-opt\" data-v=\"nee\" data-i=\"check\">Nee</button><button type=\"button\" class=\"dc-opt da\" data-v=\"ja\" data-i=\"ban\">Ja</button></div><p class=\"dc-ko\" data-dc=\"koBranche\" hidden></p><span class=\"dc-lbl\">Eigendomssituatie</span><div class=\"dc-grid sm three\" data-g=\"eig\"><button type=\"button\" class=\"dc-opt col\" data-v=\"vol\" data-i=\"home\">Volle eigendom</button><button type=\"button\" class=\"dc-opt col\" data-v=\"erfpacht\" data-i=\"cal\">Erfpacht</button><button type=\"button\" class=\"dc-opt col da\" data-v=\"opstal\" data-i=\"ban\">Recht van opstal</button></div><p class=\"dc-ko\" data-dc=\"koOpstal\" hidden></p><span class=\"dc-lbl\">Bijzonderheden? Tik aan wat van toepassing is.</span><div class=\"dc-chips\" data-dc=\"bijz\"></div><span class=\"dc-lbl\">Is de case al afgewezen door een bank?</span><div class=\"dc-grid sm three\" data-g=\"bank\"><button type=\"button\" class=\"dc-opt\" data-v=\"nee\" style=\"justify-content:center\">Nee</button><button type=\"button\" class=\"dc-opt\" data-v=\"ja\" style=\"justify-content:center\">Ja</button><button type=\"button\" class=\"dc-opt\" data-v=\"lopend\" style=\"justify-content:center;text-align:center\">Loopt nog</button></div><div class=\"dc-sl\"><div class=\"dc-slh\"><span class=\"dc-lbl\">Wanneer moet het rond zijn?</span><span class=\"dc-val\" style=\"font-size:16px\" data-dc=\"uOut\"></span></div><input type=\"range\" data-dc=\"urg\" min=\"0\" max=\"3\" step=\"1\" value=\"1\" aria-label=\"Urgentie\"></div><div class=\"dc-nav\"><button type=\"button\" class=\"dc-btn ghost back\" data-go=\"2\" aria-label=\"Terug\">&larr;<span> Terug</span></button><button type=\"button\" class=\"dc-btn\" data-dc=\"toResult\">Bekijk uitkomst &rarr;</button></div></section><section data-step=\"4\" hidden><div class=\"dc-out\" data-dc=\"oBox\"><span data-dc=\"oIcon\"></span><div><p class=\"t\" data-dc=\"oTitle\"></p><p data-dc=\"oText\"></p></div></div><div data-dc=\"koBox\" hidden><button type=\"button\" class=\"dc-btn ghost\" data-go=\"3\">&larr; Terug naar de check</button></div><div data-dc=\"gate\"><span class=\"dc-lbl\">&#128274; In je volledige rapport</span><div class=\"dc-tiles\"><div class=\"dc-tile\"><p class=\"k\">Max. financiering</p><p class=\"v dc-mask\">&euro; &bull;&bull;&bull;&bull;&bull;&bull;</p></div><div class=\"dc-tile\"><p class=\"k\">Maandlast indicatie</p><p class=\"v dc-mask\">&euro; &bull;&bull;&bull;&bull;</p></div><div class=\"dc-tile\" data-dc=\"vergTeaser\"><p class=\"k\">Jouw vergoeding</p><p class=\"v dc-mask\">&euro; &bull;&bull;&bull;&bull;&bull;</p></div><div class=\"dc-tile\"><p class=\"k\">What-if taxatie</p><p class=\"v dc-mask\">&bull;&bull; %</p></div></div><div class=\"dc-box peach\" data-dc-slot=\"report\"><form data-dc-form=\"report\" novalidate><div class=\"dc-f2\"><div><label class=\"dc-lbl\" for=\"dc-fn\">Voornaam</label><input class=\"dc-in\" id=\"dc-fn\" name=\"firstname\" type=\"text\" placeholder=\"Sanne\" autocomplete=\"given-name\" required></div><div><label class=\"dc-lbl\" for=\"dc-ln\">Achternaam</label><input class=\"dc-in\" id=\"dc-ln\" name=\"lastname\" type=\"text\" placeholder=\"de Vries\" autocomplete=\"family-name\" required></div></div><div class=\"dc-f2\"><div><label class=\"dc-lbl\" for=\"dc-em\">Zakelijk e-mailadres</label><input class=\"dc-in\" id=\"dc-em\" name=\"email\" type=\"email\" placeholder=\"sanne@adviesbureau.nl\" autocomplete=\"email\" inputmode=\"email\" required></div><div><label class=\"dc-lbl\" for=\"dc-tel\">Telefoonnummer (optioneel)</label><input class=\"dc-in\" id=\"dc-tel\" name=\"phone\" type=\"tel\" placeholder=\"06 12345678\" autocomplete=\"tel\" inputmode=\"tel\"></div></div><div class=\"dc-f2\"><div><label class=\"dc-lbl\" for=\"dc-co\">Kantoornaam</label><input class=\"dc-in\" id=\"dc-co\" name=\"company\" type=\"text\" placeholder=\"Van Dijk Advies\" autocomplete=\"organization\" required></div><div><label class=\"dc-lbl\" for=\"dc-zip\">Postcode kantoor</label><input class=\"dc-in\" id=\"dc-zip\" name=\"zip\" type=\"text\" placeholder=\"7571\" autocomplete=\"postal-code\" inputmode=\"numeric\" maxlength=\"7\" required></div></div><span class=\"dc-lbl\">Wat voor kantoor ben je?</span><div class=\"dc-grid g3\" data-g=\"tint\" style=\"margin-bottom:14px\"><button type=\"button\" class=\"dc-opt col\" data-v=\"financieringsadviseur\" data-i=\"pie\">Financierings&shy;adviseur</button><button type=\"button\" class=\"dc-opt col\" data-v=\"accountant_administratie\" data-i=\"calc\">Accountant of administratie</button><button type=\"button\" class=\"dc-opt col\" data-v=\"makelaar\" data-i=\"pin\">Makelaar</button><button type=\"button\" class=\"dc-opt col\" data-v=\"assurantiekantoor\" data-i=\"shield\">Assurantie&shy;kantoor</button><button type=\"button\" class=\"dc-opt col\" data-v=\"bank_geldverstrekker\" data-i=\"bank\">Bank of geldverstrekker</button><button type=\"button\" class=\"dc-opt col\" data-v=\"anders\" data-i=\"dots\">Anders</button></div><input type=\"hidden\" name=\"intermediair_type\"><input class=\"dc-hp\" type=\"text\" name=\"dc_website\" tabindex=\"-1\" autocomplete=\"off\" aria-hidden=\"true\"><label class=\"dc-check\"><input type=\"checkbox\" name=\"marketing_consent\" value=\"true\"> Ik ontvang graag kennis en updates van Briqwise voor intermediairs.</label><p class=\"dc-err\" data-dc-err></p><button type=\"submit\" class=\"dc-btn full\" style=\"margin-top:10px\">Stuur mijn rapport &rarr;</button><p class=\"dc-small\" style=\"text-align:center\">Direct in je inbox, plus de checklist volledig dossier. We gebruiken je gegevens volgens onze <a href=\"/privacyverklaring\" style=\"color:inherit\">privacyverklaring</a>.</p></form></div><button type=\"button\" class=\"dc-btn ghost\" data-go=\"1\">Case aanpassen</button></div><div data-dc=\"detail\" hidden><div class=\"dc-box\"><div style=\"display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px\"><h3 style=\"margin:0\">Jouw case</h3><button type=\"button\" class=\"dc-btn ghost\" style=\"min-height:36px;padding:6px 12px;font-size:13px\" data-go=\"1\">Aanpassen</button></div><div class=\"dc-case\"><div><p class=\"k\" style=\"margin:0\">Leensom</p><p class=\"v\" style=\"margin:0\" data-dc=\"cLeen\"></p></div><div><p class=\"k\" style=\"margin:0\">Waarde onderpand</p><p class=\"v\" style=\"margin:0\" data-dc=\"cWaarde\"></p></div><div><p class=\"k\" style=\"margin:0\">Looptijd</p><p class=\"v\" style=\"margin:0\" data-dc=\"cLoop\"></p></div></div><p class=\"dc-hint\" style=\"margin-top:10px\" data-dc=\"cMeta\"></p></div><div class=\"dc-tiles\"><div class=\"dc-tile\"><p class=\"k\">Max. financiering</p><p class=\"v\" data-dc=\"dMax\"></p></div><div class=\"dc-tile\"><p class=\"k\">Extra eigen inbreng</p><p class=\"v\" data-dc=\"dGap\"></p></div><div class=\"dc-tile\"><p class=\"k\">Indicatieve rente</p><p class=\"v\" data-dc=\"dRente\"></p></div><div class=\"dc-tile\"><p class=\"k\">Maandlast jaar 1</p><p class=\"v\" data-dc=\"dMnd\"></p></div><div class=\"dc-tile\"><p class=\"k\">Aflossing per jaar</p><p class=\"v\" data-dc=\"dAfl\"></p></div><div class=\"dc-tile\"><p class=\"k\">Borgstelling</p><p class=\"v\" data-dc=\"dBorg\"></p></div><div class=\"dc-tile\"><p class=\"k\">Financieringsfee</p><p class=\"v\" data-dc=\"dFee\"></p></div><div class=\"dc-tile\"><p class=\"k\">Beheer per jaar</p><p class=\"v\" data-dc=\"dBeh\"></p></div></div><div class=\"dc-box green\" data-dc=\"vergBox\"><div style=\"display:flex;justify-content:space-between;align-items:baseline;gap:8px\"><h3 style=\"margin:0\">Jouw vergoeding als intermediair</h3><span class=\"dc-val\" style=\"color:#067647\" data-dc=\"dVerg\"></span></div><ul class=\"dc-list\" style=\"margin-top:8px\" data-dc=\"dVergL\"></ul><p class=\"dc-small\" style=\"color:inherit\">Ook te verrekenen als korting op de financieringsfee van je klant.</p></div><div class=\"dc-box\"><h3>What-if: wat als de taxatie anders uitvalt?</h3><div class=\"dc-slh\"><span class=\"dc-hint\" style=\"margin:0\">Taxatie t.o.v. opgave</span><span class=\"dc-val\" data-dc=\"wiOut\"></span></div><input type=\"range\" data-dc=\"wi\" min=\"-20\" max=\"20\" step=\"1\" value=\"0\" aria-label=\"Taxatie afwijking\"><p style=\"font-size:14px;margin:4px 0 0\" data-dc=\"wiRes\"></p></div><div class=\"dc-box\"><h3>Nog aan te leveren</h3><ul class=\"dc-list\" style=\"color:#b54708\" data-dc=\"dMiss\"></ul><p class=\"dc-hint\" data-dc=\"dNote\"></p></div><div data-dc=\"caseCta\" style=\"display:flex;flex-direction:column;gap:10px\"><button type=\"button\" class=\"dc-btn full\" data-dc=\"openCase\">Case indienen bij Briqwise &rarr;</button><a class=\"dc-btn dc-line full\" data-dc=\"meetLink\" href=\"#\" target=\"_blank\" rel=\"noopener\">Plan een call met een accountmanager</a></div><div class=\"dc-box peach\" data-dc=\"caseWrap\" hidden style=\"margin-top:20px\"><h3>Case indienen</h3><p class=\"dc-hint\" style=\"margin:-4px 0 14px\">Je accountmanager neemt binnen &eacute;&eacute;n werkdag contact op en vraagt de ontbrekende documenten op.</p><div data-dc-slot=\"case\"><form data-dc-form=\"case\" novalidate><label class=\"dc-lbl\" for=\"dc-adr\">Adres van het onderpand</label><input class=\"dc-in\" id=\"dc-adr\" name=\"address\" type=\"text\" placeholder=\"Straatnaam en huisnummer\" autocomplete=\"off\" required><div class=\"dc-f2\" style=\"margin-top:14px\"><div><label class=\"dc-lbl\" for=\"dc-pc\">Postcode</label><input class=\"dc-in\" id=\"dc-pc\" name=\"postcode_vastgoed\" type=\"text\" placeholder=\"1234 AB\" required></div><div><label class=\"dc-lbl\" for=\"dc-pl\">Plaats</label><input class=\"dc-in\" id=\"dc-pl\" name=\"plaatsnaam_vastgoed\" type=\"text\" placeholder=\"Utrecht\"></div></div><p class=\"dc-hint\" style=\"margin:0 0 16px\" data-dc=\"phKnown\" hidden>Je accountmanager belt je op <b data-dc=\"phVal\"></b>. <a href=\"#\" data-dc=\"phEdit\" style=\"color:var(--or)\">Ander nummer?</a></p><div style=\"margin-bottom:16px\" data-dc=\"phWrap\"><label class=\"dc-lbl\" for=\"dc-ph\">Jouw telefoonnummer</label><input class=\"dc-in\" id=\"dc-ph\" name=\"phone\" type=\"tel\" placeholder=\"06 12345678\" autocomplete=\"tel\" inputmode=\"tel\" required></div><label class=\"dc-lbl\" for=\"dc-nt\">Toelichting (optioneel)</label><textarea class=\"dc-in\" id=\"dc-nt\" name=\"dc_notes\" placeholder=\"Bijvoorbeeld: koopakte moet voor 1 december passeren.\"></textarea><input type=\"hidden\" name=\"straatnaam_vastgoed\"><input type=\"hidden\" name=\"huisnummer_vastgoed\"><input type=\"hidden\" name=\"huisnummer_toevoeging_los\"><input class=\"dc-hp\" type=\"text\" name=\"dc_website\" tabindex=\"-1\" autocomplete=\"off\" aria-hidden=\"true\"><label class=\"dc-check\"><input type=\"checkbox\" name=\"dc_client_consent\" value=\"true\" required> Mijn klant is akkoord dat ik deze gegevens met Briqwise deel.</label><p class=\"dc-err\" data-dc-err></p><button type=\"submit\" class=\"dc-btn full\" style=\"margin-top:10px\">Case indienen &rarr;</button></form></div></div><div class=\"dc-box green\" data-dc=\"caseDone\" hidden style=\"margin-top:20px\"><h3>Case ontvangen</h3><p style=\"margin:0;font-size:14px\">Je accountmanager neemt binnen &eacute;&eacute;n werkdag contact met je op. Je ontvangt een bevestiging per e-mail met de documenten die we nog nodig hebben.</p></div><p class=\"dc-small\">Indicatief, geen aanbod. Zekerheden: eerste hypotheek, verpanding huurpenningen en opstalpolis. Een financiering is pas zeker zodra een investeerder het acceptatieformulier heeft ondertekend.</p></div></section></div>";

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
    var t = CONFIG.meetingTrigger && document.querySelector(CONFIG.meetingTrigger);
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
