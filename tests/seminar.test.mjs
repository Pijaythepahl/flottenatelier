
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/engine.js';
import * as V2 from '../dist/engine-v2.js';
import * as V1 from '../dist/engine-v1.js';
import {CATALOG,BY_ID,QUESTIONS,AREAS,CATALOG_VERSION,LIMITS} from '../dist/catalog.js';
const buy=(s,type,n=1,options={})=>{for(let i=0;i<n;i++)s=E.planPurchase(s,type,options).next;return s;};
const ready=s=>{s=E.copy(s);s.draft.name='Lehrgang';s.draft.choices.priorities=['asw'];for(const [k]of QUESTIONS)s.draft.rationale[k]='Begründete Entscheidung';return s;};
test('Erste Fregatte: Hafen und Gesamtkosten gemeinsam planen, Quelle unverändert',()=>{
 const source=E.fresh(),before=JSON.stringify(source),p=E.planPurchase(source,'frigate');
 assert.equal(JSON.stringify(source),before);assert.deepEqual(p.extras.map(x=>x.type),['harbor']);
 assert.deepEqual(p.cost,{build:28,operation:14,personnel:15});
 assert.deepEqual(E.infrastructureUsage(p.next.draft.units)[0],{type:'harbor',name:'Hafenplätze',used:1,capacity:12,perBase:12});
 assert.deepEqual(E.issues(p.next.draft.units),[]);
});
test('Zwölf Fregatten nutzen einen Hafen; erst Nummer 13 erweitert ihn',()=>{
 let s=buy(E.fresh(),'frigate',12);assert.equal(s.draft.units.filter(u=>u.type==='harbor').length,1);
 const p=E.planPurchase(s,'frigate');assert.deepEqual(p.extras.map(u=>u.type),['harbor']);assert.equal(s.draft.units.length,13);
});
test('Große Schiffe und Träger belegen nachvollziehbar mehr Hafenplätze',()=>{
 let s=buy(E.fresh(),'carrier');assert.equal(E.infrastructureUsage(s.draft.units)[0].used,4);
 assert.deepEqual(s.draft.units.map(u=>u.type),['carrier','airbase','network','harbor']);
 s=buy(s,'cruiser');s=buy(s,'supply');assert.equal(E.infrastructureUsage(s.draft.units)[0].used,8);
});
test('Luftfahrzeuge und Drohnenpakete erweitern Flugorganisation an Kapazitätsgrenze',()=>{
 let s=buy(E.fresh(),'helicopter',48);assert.equal(s.draft.units.filter(u=>u.type==='airbase').length,1);
 const p=E.planPurchase(s,'plane');assert.deepEqual(p.extras.map(u=>u.type),['airbase']);
 const d=E.planPurchase(E.fresh(),'airDrone');assert.deepEqual(new Set(d.extras.map(u=>u.type)),new Set(['airbase','network']));
 assert.equal(E.infrastructureUsage(d.next.draft.units)[1].used,1);
});
test('Strike-Fregatte zeigt Hafen und Führungsnetz in einer atomaren Planung',()=>{
 const p=E.planPurchase(E.fresh(),'frigate',{modules:['strike','asw']});
 assert.deepEqual(new Set(p.extras.map(u=>u.type)),new Set(['harbor','network']));
 assert.deepEqual(p.cost,{build:52,operation:23,personnel:21.5});
 assert.deepEqual(E.unitPoints(p.unit),{aaw:2,asuw:2,asw:4,mine:0,strike:3});
});
test('Fähigkeitsprofile sind additiv; Unterstützung und Infrastruktur erhalten keine erfundene Kampfstärke',()=>{
 let s=buy(E.fresh(),'frigate',2,{modules:['asw']});s=buy(s,'supply');
 assert.deepEqual(E.capabilities(s.draft.units),{aaw:4,asuw:4,asw:8,mine:0,strike:0});
 for(const c of CATALOG){assert.deepEqual(Object.keys(c.points),Object.keys(AREAS));assert.ok(Object.values(c.points).every(n=>Number.isSafeInteger(n)&&n>=0));}
 assert.ok(Object.values(E.unitPoints({type:'supply',modules:[]})).every(n=>n===0));
});
test('Nachrüstung plant Führungsnetz; Entfernen abhängiger Infrastruktur wird verhindert',()=>{
 const s=buy(E.fresh(),'frigate'),id=s.draft.units[0].id,p=E.planModules(s,id,['strike']);
 assert.equal(s.draft.units[0].modules.length,0);assert.deepEqual(p.extras.map(u=>u.type),['network']);
 assert.deepEqual(p.cost,{build:18,operation:7,personnel:5.5});
 assert.throws(()=>E.removeUnit(p.next,p.next.draft.units.find(u=>u.type==='network').id),/Noch benötigt/);
});
test('Belegte Häfen und Flugplätze lassen sich nicht entfernen; freie Infrastruktur schon',()=>{
 let s=buy(E.fresh(),'plane');assert.throws(()=>E.removeUnit(s,s.draft.units.find(u=>u.type==='airbase').id),/Flugplatzkapazität/);
 s=E.removeUnit(s,s.draft.units.find(u=>u.type==='plane').id);s=E.removeUnit(s,s.draft.units[0].id);assert.equal(s.draft.units.length,0);
 s=buy(E.fresh(),'frigate');assert.throws(()=>E.removeUnit(s,s.draft.units.find(u=>u.type==='harbor').id),/Hafenplätze/);
});
test('Trägerluftgruppe und Landungsboote beschaffen ihre große Plattform nicht stillschweigend',()=>{
 const s=E.fresh();assert.throws(()=>E.planPurchase(s,'airwing'),/freie Plattform/);assert.throws(()=>E.planPurchase(s,'landing'),/freie Plattform/);assert.equal(s.draft.units.length,0);
 const independent=E.planPurchase(s,'underwaterDrone',{modules:['mine']});assert.ok(!independent.next.draft.units.some(u=>u.type==='mine'));
});
test('Einschiffung der Marineinfanterie bietet Logistik an; Landbetrieb benötigt sie nicht',()=>{
 let s=buy(buy(E.fresh(),'marines'),'dock'),m=s.draft.units.find(u=>u.type==='marines'),host=s.draft.units.find(u=>u.type==='dock');
 const p=E.planAssignment(s,m.id,host.id);assert.deepEqual(p.extras.map(u=>u.type),['logistics']);assert.equal(s.draft.units.filter(u=>u.type==='logistics').length,0);
 const land=E.planAssignment(p.next,m.id,null);assert.equal(land.next.draft.units[0].supportId,null);assert.equal(land.extras.length,0);
 const again=E.planAssignment(land.next,m.id,host.id);assert.equal(again.extras.length,0);
});
test('Eingeschiffte Luftfahrzeuge benötigen trotzdem Landorganisation; Hostkapazität bleibt hart',()=>{
 let s=buy(E.fresh(),'frigate'),host=s.draft.units[0].id;s=buy(s,'helicopter',2,{parentId:host});
 assert.equal(s.draft.units.filter(u=>u.type==='airbase').length,1);
 assert.throws(()=>buy(s,'helicopter',1,{parentId:host}),/voll belegte/);
 assert.equal(E.infrastructureUsage(s.draft.units)[1].used,2);
});
test('Überschreitung als Entwurf möglich; Abschluss nur mit passendem Budget',()=>{
 const s=ready(buy(E.fresh(),'frigate',50));assert.ok(E.totals(s.draft.units).build>LIMITS.build);assert.throws(()=>E.submit(s),/überschritten/);
 assert.equal(s.submissions.length,0);
});
test('Abschluss benötigt Auftrag, vier kurze Begründungen und ein oder zwei Schwerpunkte',()=>{
 const s=buy(E.fresh(),'corvette');assert.equal(E.submissionErrors(s.draft).length,6);
 assert.deepEqual(E.submissionErrors(ready(s).draft),[]);
 const bad=ready(s);bad.draft.choices.priorities=['aaw','asw','mine'];assert.throws(()=>E.submit(bad),/Auswahlfragen/);
});
test('Abschluss, Überarbeitung, Auswahlfragen und Zuordnungen überleben Dateirundreise',()=>{
 let s=ready(buy(E.fresh(),'frigate'));s.draft.choices.gaps=['strike'];s.draft.choices.partners=['recon','supply'];
 s=E.submit(s);const original=JSON.stringify(s.submissions[0]);assert.throws(()=>buy(s,'corvette'),/abgeschlossen/);
 s=buy(E.revise(s),'corvette');assert.equal(JSON.stringify(s.submissions[0]),original);assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(s))),s);
 s=E.submit(s);assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(s))),s);
});
test('Version 2 Entwürfe ergänzen Infrastruktur ohne Veränderung der Quelle',()=>{
 let old=V2.addUnit(V2.fresh(),'frigate');const before=JSON.stringify(old),s=E.parseDocument(old);
 assert.equal(JSON.stringify(old),before);assert.equal(s.schemaVersion,5);assert.equal(s.draft.catalogVersion,CATALOG_VERSION);
 assert.equal(s.draft.units.filter(u=>u.type==='harbor').length,1);assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(s))),s);
});
test('Historische Abgaben erhalten Kosten und Regeln bis zur Überarbeitung',()=>{
 let old=V2.addUnit(V2.fresh(),'frigate');old.draft.name='Alt';for(const [k]of QUESTIONS)old.draft.rationale[k]='Alt';
 old=V2.submit(old);const s=E.parseDocument(old);
 assert.deepEqual(E.totals(s.draft.units,s.draft.catalogVersion),{build:20,operation:10,personnel:10});
 assert.deepEqual(s.submissions,old.submissions);assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(s))),s);
 const next=E.revise(s);assert.equal(next.draft.units.filter(u=>u.type==='harbor').length,1);assert.deepEqual(next.submissions,s.submissions);
});
test('Version 1 Abgaben und Migration behalten Einzelauflösung der Marineflieger',()=>{
 let old=V1.addUnit(V1.addUnit(V1.fresh(),'airbase'),'helicopter');old.draft.name='Alt';for(const [k]of QUESTIONS)old.draft.rationale[k]='Alt';
 const s=E.parseDocument(V1.submit(old)),next=E.revise(s);
 assert.equal(next.draft.units.filter(u=>u.type==='helicopter').length,2);assert.equal(next.draft.catalogVersion,CATALOG_VERSION);
 assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(next))),next);
});
test('Import lehnt manipulierte Kapazitäten, Kennungen, Auswahlen, Module und Abgaben ab',()=>{
 const s=ready(buy(E.fresh(),'frigate'));
 for(const type of ['evil','__proto__','constructor']){const b=E.copy(s);b.draft.units[0].type=type;assert.throws(()=>E.parseDocument(b),/Ungültige Einheit/);}
 let b=E.copy(s);b.draft.units=b.draft.units.filter(u=>u.type!=='harbor');assert.throws(()=>E.parseDocument(b),/Hafenplätze/);
 b=E.copy(s);b.draft.choices.partners=['hacked'];assert.throws(()=>E.parseDocument(b),/Auswahlfragen/);
 b=E.copy(s);b.draft.units[0].modules=['constructor'];assert.throws(()=>E.parseDocument(b),/nicht erlaubt/);
 b=E.submit(s);b.draft.name='Anders';assert.throws(()=>E.parseDocument(b),/nachträglich/);
});
test('Ungültige Mengen, IDs und Spezialisierungen verändern die Quelle nicht',()=>{
 const s=buy(E.fresh(),'corvette'),before=JSON.stringify(s);
 assert.throws(()=>E.planPurchase(s,'corvette',{modules:['air']}),/nicht erlaubt/);
 assert.throws(()=>E.removeUnit(s,'missing'),/nicht gefunden/);assert.throws(()=>E.planModules(s,s.draft.units[0].id,['surface','surface']),/doppelte/);
 assert.equal(JSON.stringify(s),before);
});

test('Flugplatzkapazität: Hubschrauber 1, Flugzeug 2, Drohnenpaket immer 1',()=>{
 let s=buy(E.fresh(),'helicopter',20);s=buy(s,'plane',10);s=buy(s,'airDrone',4);s=buy(s,'airDrone',4);
 const usage=E.infrastructureUsage(s.draft.units)[1];assert.equal(usage.used,48);assert.equal(usage.capacity,48);assert.equal(usage.perBase,48);
 const p=E.planPurchase(s,'airDrone');assert.deepEqual(p.extras.map(u=>u.type),['airbase']);assert.equal(E.infrastructureUsage(p.next.draft.units)[1].used,49);
 assert.equal(E.infrastructureUsage(s.draft.units)[1].capacity,48);
});
test('24 Flugzeuge füllen eine Basis; die Trägerluftgruppe bleibt ein ganzes Basispaket',()=>{
 const s=buy(E.fresh(),'plane',24);assert.equal(E.infrastructureUsage(s.draft.units)[1].used,48);
 assert.deepEqual(E.planPurchase(s,'plane').extras.map(u=>u.type),['airbase']);
 const carrier=buy(buy(E.fresh(),'carrier'),'airwing',1,{stationing:'board'});
 assert.equal(E.infrastructureUsage(carrier.draft.units)[1].used,48);assert.equal(E.infrastructureUsage(carrier.draft.units)[1].capacity,48);
 assert.deepEqual(E.planPurchase(carrier,'helicopter').extras.map(u=>u.type),['airbase']);
});
test('Bordgestützte Sammelkäufe verteilen sich auf freie Plattformen',()=>{
 let s=buy(buy(E.fresh(),'frigate'),'supply');s=buy(s,'helicopter',4,{stationing:'board'});
 const frigate=s.draft.units.find(u=>u.type==='frigate'),supply=s.draft.units.find(u=>u.type==='supply');
 assert.equal(s.draft.units.filter(u=>u.parentId===frigate.id).length,2);assert.equal(s.draft.units.filter(u=>u.parentId===supply.id).length,2);
 assert.deepEqual(E.issues(s.draft.units),[]);const before=JSON.stringify(s);
 assert.throws(()=>E.planPurchase(s,'helicopter',{stationing:'board'}),/Keine freien Bordplätze/);assert.equal(JSON.stringify(s),before);
});
test('Land/Bord-Umschaltung benötigt keine Plattformkennung und erhält freie Plätze',()=>{
 let s=buy(buy(E.fresh(),'frigate'),'helicopter',1,{stationing:'land'});const h=s.draft.units.find(u=>u.type==='helicopter');
 assert.equal(h.parentId,null);const p=E.planStationing(s,h.id,'board');assert.ok(p.next.draft.units.find(u=>u.id===h.id).parentId);assert.equal(h.parentId,null);
 const same=E.planStationing(p.next,h.id,'board');assert.deepEqual(same.next,p.next);
 const land=E.planStationing(p.next,h.id,'land');assert.equal(land.next.draft.units.find(u=>u.id===h.id).parentId,null);assert.equal(land.extras.length,0);
});
test('Bordbetrieb ohne Plattform scheitert verständlich; reine Bordpakete erlauben kein Land',()=>{
 const s=buy(E.fresh(),'helicopter');assert.throws(()=>E.planStationing(s,s.draft.units[0].id,'board'),/Keine freien Bordplätze/);
 assert.throws(()=>E.planPurchase(E.fresh(),'airwing',{stationing:'land'}),/nur bordgestützt/);
 assert.throws(()=>E.planPurchase(E.fresh(),'plane',{stationing:'board'}),/nicht bordgestützt/);
});
test('Automatische Einschiffung bietet Logistik an und bewahrt bestehende Zuordnungen',()=>{
 let s=buy(buy(E.fresh(),'dock'),'marines');const m=s.draft.units.find(u=>u.type==='marines');
 const p=E.planStationing(s,m.id,'board');assert.deepEqual(p.extras.map(u=>u.type),['logistics']);
 assert.deepEqual(E.planStationing(p.next,m.id,'board').next,p.next);
 assert.deepEqual(E.parseDocument(JSON.parse(JSON.stringify(p.next))),p.next);
});
test('Land- und Bordbetrieb gruppieren getrennt, konkrete Bordplattformen bleiben zusammengefasst',()=>{
 let s=buy(E.fresh(),'frigate',2);s=buy(s,'helicopter',3,{stationing:'board'});s=buy(s,'helicopter',2,{stationing:'land'});
 assert.deepEqual(E.groupUnits(s.draft.units.filter(u=>u.type==='helicopter')).map(g=>g.length),[3,2]);
});
test('Einheitennamen sind in aktueller Oberfläche eindeutig',()=>{
 assert.equal(BY_ID.carrier.name,'Flugzeugträger');assert.equal(BY_ID.cruiser.name,'Zerstörer/Kreuzer');assert.equal(BY_ID.supply.name,'Einsatzgruppenversorger');
});
