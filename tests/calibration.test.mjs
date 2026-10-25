import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/engine.js';
import * as V3 from '../dist/engine-v3.js';
import {CATALOG,LIMITS,QUESTIONS,CATALOG_VERSION} from '../dist/catalog.js';
import {buildReference,independentReference} from '../scripts/calibration-reference.mjs';
const ready=s=>{s=E.copy(s);s.draft.name='Referenz';s.draft.choices.priorities=['asw','aaw'];for(const [k]of QUESTIONS)s.draft.rationale[k]='Begründung';return s;};
test('Unabhängige Vollrechnung einschließlich Infrastruktur passt ins neue Budget',()=>{
 const s=buildReference(E),expected=independentReference();
 assert.deepEqual(E.totals(s.draft.units),expected.total);
 assert.deepEqual(expected.total,{build:835.5,operation:417,personnel:401.75});
 assert.equal(s.draft.units.filter(u=>u.type==='harbor').length,5);assert.equal(s.draft.units.filter(u=>u.type==='airbase').length,2);
 assert.deepEqual(E.submissionErrors(ready(s).draft),[]);
 assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(E.submit(ready(s))))).draft.units,s.draft.units);
});
test('Zusätzliche P8 bis zum bestellten Acht-Maschinen-Los ist als Szenario finanzierbar, kein Ist-Bestand',()=>{
 let s=buildReference(E);for(let i=0;i<5;i++)s=E.planPurchase(s,'plane',{modules:['asw','recon']}).next;
 assert.deepEqual(E.totals(s.draft.units),{build:878,operation:439.5,personnel:420.5});assert.deepEqual(E.submissionErrors(ready(s).draft),[]);
});
test('ASW-Sensorik und Flugzeug-Missionspersonal sind zusätzliche Bindung; Waffen allein nicht pauschal',()=>{
 assert.deepEqual(E.unitCost({type:'frigate',modules:['asw']}),{build:26,operation:12,personnel:11});
 assert.equal(E.unitCost({type:'frigate',modules:['air']}).personnel,11);
 assert.equal(E.unitCost({type:'frigate',modules:['surface']}).personnel,10);
 assert.equal(E.unitCost({type:'frigate',modules:['strike','asw']}).personnel,11.5);
 assert.equal(E.unitCost({type:'plane',modules:['asw','recon']}).personnel,3.75);
 assert.equal(E.unitCost({type:'helicopter',modules:['asw']}).personnel,1.5);
});
test('Bordbetrieb zählt Luftfahrzeugpersonal genau einmal und verändert nur die Zuordnung',()=>{
 let s=E.planPurchase(E.fresh(),'frigate',{modules:['asw']}).next;
 s=E.planPurchase(s,'helicopter',{modules:['asw'],stationing:'land'}).next;
 const h=s.draft.units.find(u=>u.type==='helicopter'),before=E.totals(s.draft.units),next=E.planStationing(s,h.id,'board').next;
 assert.deepEqual(E.totals(next.draft.units),before);assert.equal(E.unitCost(next.draft.units.find(u=>u.id===h.id)).personnel,1.5);
});
test('V3-Abgaben behalten alte Modulpreise und Budgets; erst die Überarbeitung wird neu gerechnet',()=>{
 let old=V3.planPurchase(V3.fresh(),'frigate',{modules:['asw']}).next;old=V3.submit(ready(old));
 const s=E.parseDocument(old);assert.deepEqual(s.submissions,old.submissions);
 assert.equal(E.unitCost(s.draft.units[0],s.draft.catalogVersion).personnel,10);assert.equal(E.limitsFor(s.draft).build,720);
 assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(s))),s);
 const next=E.revise(s);assert.equal(next.draft.catalogVersion,CATALOG_VERSION);assert.equal(E.unitCost(next.draft.units[0]).personnel,11);
 assert.equal(E.limitsFor(next.draft).build,LIMITS.build);assert.deepEqual(next.submissions,old.submissions);assert.deepEqual(next.draft.choices,old.draft.choices);
});
test('V3-Entwurf migriert verlustfrei und behält Prioritäten, Texte, IDs und Bordzuordnung',()=>{
 let old=ready(V3.planPurchase(V3.fresh(),'frigate',{modules:['asw']}).next);old=V3.planPurchase(old,'helicopter',{stationing:'board',modules:['asw']}).next;
 const source=JSON.stringify(old),s=E.parseDocument(old);assert.equal(JSON.stringify(old),source);assert.equal(s.schemaVersion,5);
 assert.deepEqual(s.draft.units,old.draft.units);assert.deepEqual(s.draft.choices,old.draft.choices);assert.deepEqual(s.draft.rationale,old.draft.rationale);
 assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(s))),s);
});
test('Sämtliche aktuellen Basis- und Modulpreise bleiben nichtnegative ganzzahlige Viertelpunkte',()=>{
 for(const c of CATALOG)for(const p of [c.cost,...Object.values(c.moduleCosts)])for(const v of Object.values(p))assert.ok(Number.isSafeInteger(v)&&v>=0,c.id);
});
test('EGV nimmt zwei Hubschrauber auf; überzählige historische Bordfluggeräte werden verlustfrei umgeordnet',()=>{
 let old=V3.planPurchase(V3.fresh(),'supply').next;for(let i=0;i<6;i++)old=V3.planPurchase(old,'helicopter',{stationing:'board'}).next;
 const original=JSON.stringify(old),s=E.parseDocument(old),host=s.draft.units.find(u=>u.type==='supply');
 assert.equal(JSON.stringify(old),original);assert.equal(s.draft.units.filter(u=>u.type==='helicopter').length,6);
 assert.equal(s.draft.units.filter(u=>u.parentId===host.id).length,2);assert.equal(s.draft.units.filter(u=>u.type==='helicopter'&&!u.parentId).length,4);
 assert.deepEqual(E.issues(s.draft.units),[]);assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(s))),s);
});
