import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/engine.js';
import * as V4 from '../dist/engine-v4.js';
import {CATALOG,BY_ID,CATALOG_VERSION,QUESTIONS} from '../dist/catalog.js';
const buy=(s,type,modules=[])=>E.planPurchase(s,type,{modules}).next;
const ready=s=>{s=E.copy(s);s.draft.name='Unbemannt';s.draft.choices.priorities=['mine'];for(const [k]of QUESTIONS)s.draft.rationale[k]='Begründung';return s;};
test('Genau drei Plattformfamilien: Luft, Überwasser, Unterwasser; keine separate Minenkarte',()=>{
 const cards=CATALOG.filter(c=>c.category==='Unbemannte Systeme');
 assert.deepEqual(cards.map(c=>c.id),['airDrone','surfaceDrone','underwaterDrone']);assert.deepEqual(cards.map(c=>c.domain),['air','surface','underwater']);
 for(const c of cards){assert.equal(c.slots,2);assert.ok(c.moduleCosts.mine);assert.ok(c.cost.personnel>0);assert.ok(!c.requires.includes('mine'));}
 for(const id of ['unmannedMine','rotorDrone','fixedDrone'])assert.equal(BY_ID[id],undefined);
});
test('Unterwasser-Minenabwehr ohne bemanntes Minenjagdboot: gesamte Infrastruktur atomar angeboten',()=>{
 const source=E.fresh(),p=E.planPurchase(source,'underwaterDrone',{modules:['mine']});
 assert.deepEqual(source.draft.units,[]);assert.deepEqual(new Set(p.extras.map(u=>u.type)),new Set(['network','harbor']));
 assert.deepEqual(p.cost,{build:28,operation:13,personnel:12.5});assert.equal(E.capabilities(p.next.draft.units).mine,3);
 assert.ok(!p.next.draft.units.some(u=>u.type==='mine'));assert.equal(E.infrastructureUsage(p.next.draft.units)[1].used,0);
 assert.deepEqual(E.submissionErrors(ready(p.next).draft),[]);assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(E.submit(ready(p.next))))).draft.units,p.next.draft.units);
});
test('USV-Sensorik und Flugkörper wirken erst nach Ausstattungswahl; kleinerer Beitrag als große Plattformen',()=>{
 const u={type:'surfaceDrone',modules:[]};assert.ok(Object.values(E.unitPoints(u)).every(n=>n===0));
 assert.deepEqual(E.unitCost({...u,modules:['surface','strike']}),{build:20,operation:7,personnel:2});
 assert.deepEqual(E.unitPoints({...u,modules:['surface','strike']}),{aaw:0,asuw:2,asw:0,mine:0,strike:2});
 const s=buy(E.fresh(),'surfaceDrone',['mine','recon']);assert.equal(E.capabilities(s.draft.units).mine,3);assert.deepEqual(E.issues(s.draft.units),[]);
});
test('UAV-Minensuche ist ein Sensorbeitrag, USV/UUV-Minenabwehr ein größeres Gesamtpaket',()=>{
 assert.equal(E.unitPoints({type:'airDrone',modules:['mine']}).mine,1);
 for(const type of ['surfaceDrone','underwaterDrone'])assert.equal(E.unitPoints({type,modules:['mine']}).mine,3);
 assert.equal(E.unitPoints({type:'underwaterDrone',modules:['asw']}).asw,2);
});
test('Führung wird geteilt, See-/Unterwasserpakete belegen Hafen-, Luftpakete Flugplatzkapazität',()=>{
 let s=buy(E.fresh(),'airDrone');s=buy(s,'surfaceDrone');s=buy(s,'underwaterDrone');
 assert.equal(s.draft.units.filter(u=>u.type==='network').length,1);const [sea,air]=E.infrastructureUsage(s.draft.units);
 assert.equal(sea.used,2);assert.equal(sea.capacity,12);assert.equal(air.used,1);assert.equal(air.capacity,48);
});
test('Zwei passende Bausteine je Plattform; keine Luftverteidigung oder Landziel-Flugkörper auf UUV',()=>{
 const s=E.fresh();assert.throws(()=>buy(s,'underwaterDrone',['strike']),/nicht erlaubt/);
 assert.throws(()=>buy(s,'airDrone',['air']),/nicht erlaubt/);assert.throws(()=>buy(s,'surfaceDrone',['mine','asw','recon']),/Zu viele/);
 assert.deepEqual(s.draft.units,[]);
});
test('Bordgeeignete UAV verwenden automatisch die begrenzten Drohnenplätze',()=>{
 let s=buy(E.fresh(),'frigate');s=E.planPurchase(s,'airDrone',{stationing:'board',modules:['recon']}).next;
 assert.ok(s.draft.units.find(u=>u.type==='airDrone').parentId);assert.throws(()=>E.planPurchase(s,'airDrone',{stationing:'board'}),/Keine freien Bordplätze/);
 const u=s.draft.units.find(u=>u.type==='airDrone');const land=E.planStationing(s,u.id,'land').next;
 assert.deepEqual(E.totals(land.draft.units),E.totals(s.draft.units));assert.equal(E.freeHosts(land.draft.units,'airDrone').length,1);
});
test('Alte Minenkarte migriert zu UUV plus Minenabwehr, bemanntes Boot kann danach entfernt werden',()=>{
 let old=V4.planPurchase(V4.fresh(),'mine').next;old=V4.planPurchase(old,'unmannedMine').next;const original=JSON.stringify(old);
 let s=E.parseDocument(old),unit=s.draft.units.find(u=>u.id===old.draft.units.find(u=>u.type==='unmannedMine').id);
 assert.equal(JSON.stringify(old),original);assert.equal(unit.type,'underwaterDrone');assert.deepEqual(unit.modules,['mine']);
 s=E.removeUnit(s,s.draft.units.find(u=>u.type==='mine').id);assert.deepEqual(E.issues(s.draft.units),[]);assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(s))),s);
});
test('Alte Dreh-/Flächenflügler werden UAV; Ausrüstung und gültige Bordzuordnung bleiben erhalten',()=>{
 let old=V4.planPurchase(V4.fresh(),'frigate').next;old=V4.planPurchase(old,'rotorDrone',{stationing:'board',modules:['asw']}).next;old=V4.planPurchase(old,'fixedDrone',{modules:['recon']}).next;
 const s=E.parseDocument(old),air=s.draft.units.filter(u=>u.type==='airDrone');assert.equal(air.length,2);assert.ok(air[0].parentId);assert.equal(air[1].parentId,null);
 assert.deepEqual(air.map(u=>u.modules),[['asw'],['recon']]);assert.equal(s.draft.catalogVersion,CATALOG_VERSION);assert.deepEqual(E.issues(s.draft.units),[]);
});
test('V4-Abgabe bleibt mit alter Minenabhängigkeit und Punkten historisch; nur Überarbeitung wechselt Modell',()=>{
 let old=buyLegacy(V4.fresh());old=V4.submit(ready(old));const s=E.parseDocument(old);
 assert.deepEqual(s.submissions,old.submissions);assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(s))),s);
 assert.equal(E.capabilities(s.draft.units,s.draft.catalogVersion).mine,6);assert.deepEqual(E.infrastructureUsage(s.draft.units,s.draft.catalogVersion),V4.infrastructureUsage(old.draft.units));
 const next=E.revise(s);assert.ok(next.draft.units.some(u=>u.type==='underwaterDrone'&&u.modules.includes('mine')));assert.deepEqual(next.submissions,old.submissions);
});
function buyLegacy(s){s=V4.planPurchase(s,'mine').next;return V4.planPurchase(s,'unmannedMine').next;}
test('Import prüft neue Typen, Bausteine und Personalwerte, fremde Preise werden verworfen',()=>{
 const s=buy(E.fresh(),'surfaceDrone',['mine','recon']);s.draft.units[0].cost={build:-100};const clean=E.parseDocument(s);assert.equal(clean.draft.units[0].cost,undefined);
 const bad=E.copy(clean);bad.draft.units[0].modules=['air'];assert.throws(()=>E.parseDocument(bad),/nicht erlaubt/);
 assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(clean))),clean);
});
