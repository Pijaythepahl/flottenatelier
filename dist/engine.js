import {BY_ID,LIMITS,CATALOG_VERSION,QUESTIONS,MODULES,AREAS,MODULE_POINTS,CHOICES} from './catalog.js';
import * as v2 from './engine-v2.js';
import * as v3 from './engine-v3.js';
import * as v4 from './engine-v4.js';
import * as v1 from './engine-v1.js';
import {BY_ID as OLD} from './catalog-v1.js';
import {BY_ID as PREVIOUS} from './catalog-v2.js';
import {BY_ID as V3_CATALOG} from './catalog-v3.js';
import {BY_ID as V4_CATALOG} from './catalog-v4.js';
import {LIMITS as OLD_LIMITS} from './catalog-v3.js';
export const LEGACY='2026.09-v1',PREVIOUS_VERSION='2026.09-v2';
export const V3_VERSION='2026.10-v3';
export const V4_VERSION='2026.10-v4';
export const copy=value=>structuredClone(value);
const emptyChoices=()=>({priorities:[],gaps:[],partners:[]});
export function fresh(){return {schemaVersion:5,catalogVersion:CATALOG_VERSION,draft:{catalogVersion:CATALOG_VERSION,name:'',iteration:1,status:'draft',units:[],rationale:Object.fromEntries(QUESTIONS.map(([k])=>[k,''])),choices:emptyChoices()},submissions:[]};}
export const catalogFor=d=>d.catalogVersion===LEGACY?OLD:d.catalogVersion===PREVIOUS_VERSION?PREVIOUS:d.catalogVersion===V3_VERSION?V3_CATALOG:d.catalogVersion===V4_VERSION?V4_CATALOG:BY_ID;
export const limitsFor=d=>d.catalogVersion===CATALOG_VERSION?LIMITS:v4.limitsFor(d);
export function unitCost(u,version=CATALOG_VERSION){if(version!==CATALOG_VERSION)return v4.unitCost(u,version);const c=BY_ID[u.type],p={...c.cost};for(const m of u.modules||[])for(const k of Object.keys(p))p[k]+=c.moduleCosts[m][k];return Object.fromEntries(Object.entries(p).map(([k,v])=>[k,v/4]));}
export function totals(units,version=CATALOG_VERSION){return units.reduce((a,u)=>{const p=unitCost(u,version);for(const k of Object.keys(a))a[k]+=p[k];return a;},{build:0,operation:0,personnel:0});}
export const configuration=u=>u.type+':'+[...(u.modules||[])].sort().join(',')+':'+(u.parentId?'board':'land');
export function groupUnits(units){const groups=new Map();for(const u of units){const key=configuration(u);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(u);}return [...groups.values()];}
export function unitPoints(u,version=CATALOG_VERSION){if(version!==CATALOG_VERSION)return v4.unitPoints(u);const c=BY_ID[u.type],p={...c.points};for(const m of u.modules||[])for(const k of Object.keys(p))p[k]+=(c.modulePoints?.[m]||MODULE_POINTS[m])[k];return p;}
export function capabilities(units,version=CATALOG_VERSION){const result=Object.fromEntries(Object.keys(AREAS).map(k=>[k,0]));for(const u of units){const p=unitPoints(u,version);for(const k of Object.keys(result))result[k]+=p[k];}return result;}
export function infrastructureUsage(units,version=CATALOG_VERSION){if(version!==CATALOG_VERSION)return v4.infrastructureUsage(units);return [
 {type:'harbor',name:'Hafenplätze',used:units.reduce((n,u)=>n+BY_ID[u.type].berths,0),capacity:units.filter(u=>u.type==='harbor').length*12,perBase:12},
 {type:'airbase',name:'Flugplatzkapazität',used:units.reduce((n,u)=>n+BY_ID[u.type].flight,0),capacity:units.filter(u=>u.type==='airbase').length*48,perBase:48}
];}
export function freeHosts(units,type,excludeId){const c=BY_ID[type];return units.filter(u=>c?.hosts?.includes(u.type)&&units.filter(p=>p.id!==excludeId&&p.type===type&&p.parentId===u.id).length<(BY_ID[u.type].capacity?.[type]||1));}
export const freeSupports=(units,type,excludeId)=>v2.freeSupports(units,type,excludeId);
function stationingHost(units,type,mode,unit){
 const c=BY_ID[type];
 if(!['land','board'].includes(mode))throw new Error('Bitte landgestützt oder bordgestützt wählen.');
 if(mode==='land'){if(c.hosts&&!c.optionalHost)throw new Error(c.name+' kann nur bordgestützt genutzt werden.');return null;}
 if(!c.hosts)throw new Error(c.name+' kann nicht bordgestützt genutzt werden.');
 const hosts=freeHosts(units,type,unit?.id),host=hosts.find(h=>h.id===unit?.parentId)||hosts[0];
 if(!host)throw new Error('Keine freien Bordplätze für '+c.name+'. Zuerst '+c.hosts.map(id=>BY_ID[id].name).join(' / ')+' hinzufügen'+(c.optionalHost?' oder landgestützten Betrieb wählen.':'.'));
 return host.id;
}
function editable(state){if(state.draft.status!=='draft'||state.draft.catalogVersion!==CATALOG_VERSION)throw new Error('Dieser Entwurf ist abgeschlossen. Beginnt eine Überarbeitung.');}
export function validateModules(type,mods){const c=BY_ID[type];if(!c)throw new Error('Unbekannte Einheit.');if(!Array.isArray(mods)||mods.length>(c.slots||0)||new Set(mods).size!==mods.length)throw new Error('Zu viele oder doppelte Spezialisierungen.');for(const m of mods)if(typeof m!=='string'||!Object.hasOwn(c.moduleCosts,m))throw new Error('Diese Spezialisierung ist für '+c.name+' nicht erlaubt.');}
export function issues(units){const errors=[],ids=new Set(),usedSupports=new Set();for(const u of units){
 const c=BY_ID[u.type];if(!c){errors.push('Unbekannte Einheit.');continue;}
 if(ids.has(u.id))errors.push('Doppelte Einheitenkennung.');ids.add(u.id);
 if(c.unique&&units.filter(x=>x.type===u.type).length>1)errors.push(c.name+' ist nur einmal wählbar.');
 try{validateModules(u.type,u.modules);}catch(e){errors.push(e.message);continue;}
 for(const required of [...c.requires||[],...u.modules.flatMap(m=>MODULES[m].requires||[])])if(!units.some(x=>x.type===required))errors.push(c.name+' benötigt '+BY_ID[required].name+'.');
 if(c.hosts){if(!u.parentId&&!c.optionalHost)errors.push(c.name+' benötigt eine zugeordnete Plattform.');if(u.parentId&&!freeHosts(units,u.type,u.id).some(p=>p.id===u.parentId))errors.push('Ungeeignete oder voll belegte Plattform für '+c.name+'.');}else if(u.parentId)errors.push(c.name+' kann keiner Plattform zugeordnet werden.');
 if(c.support&&u.parentId){const support=units.find(x=>x.id===u.supportId);if(!support||support.type!==c.support)errors.push(c.name+' benötigt ein eigenes Paket '+BY_ID[c.support].name+'.');if(usedSupports.has(u.supportId))errors.push('Ein Logistikpaket kann nur ein Kräftepaket unterstützen.');usedSupports.add(u.supportId);}else if(u.supportId)errors.push('Unerlaubte Unterstützungszuordnung.');
 }
 for(const x of infrastructureUsage(units.filter(u=>Object.hasOwn(BY_ID,u.type))))if(x.used>x.capacity)errors.push(x.name+': '+x.used+' benötigt, '+x.capacity+' vorhanden.');
 return [...new Set(errors)];
}
function checked(state){if(state.draft.units.length>1000)throw new Error('Maximal 1.000 Bausteine pro Entwurf.');const errors=issues(state.draft.units);if(errors.length)throw new Error(errors.join(' '));return state;}
export function availability(units,type){const c=BY_ID[type];if(!c)return 'Unbekannte Einheit.';if(c.unique&&units.some(u=>u.type===type))return 'Bereits vorhanden.';return '';}
function append(next,type,options={}){
 if(!Object.hasOwn(BY_ID,type))throw new Error('Unbekannte Einheit.');
 const why=availability(next.draft.units,type);if(why)throw new Error(why);
 const modules=[...(options.modules||[])].sort();validateModules(type,modules);
 const c=BY_ID[type],parentId=options.stationing!==undefined?stationingHost(next.draft.units,type,options.stationing):options.parentId??(!c.optionalHost&&c.hosts?freeHosts(next.draft.units,type)[0]?.id:null);
 const u={id:options.id||crypto.randomUUID(),type,modules,parentId:parentId||null,supportId:parentId&&c.support?options.supportId||null:null};next.draft.units.push(u);return u;
}
// Pure plans disclose every extra dependency and the combined cost before committing.
export function planPurchase(state,type,options={}){
 editable(state);const next=copy(state),start=next.draft.units.length,u=append(next,type,options),c=BY_ID[type];
 for(const id of [...c.requires||[],...u.modules.flatMap(m=>MODULES[m].requires||[])]){
  if(!next.draft.units.some(x=>x.type===id)){if(!BY_ID[id].infrastructure)throw new Error('Zuerst '+BY_ID[id].name+' hinzufügen.');append(next,id);}
 }
 if(c.hosts&&!c.optionalHost&&!u.parentId)throw new Error('Zuerst eine freie Plattform hinzufügen: '+c.hosts.map(id=>BY_ID[id].name).join(' / ')+'.');
 if(c.support&&u.parentId&&!u.supportId){let support=freeSupports(next.draft.units,u.type,u.id)[0];if(!support)support=append(next,c.support);u.supportId=support.id;}
 for(const x of infrastructureUsage(next.draft.units))for(let n=x.capacity;n<x.used;n+=x.perBase)append(next,x.type);
 checked(next);const added=next.draft.units.slice(start);return {next,unit:u,added,extras:added.filter(x=>x.id!==u.id),cost:totals(added)};
}
export function addUnit(state,type,options={}){editable(state);const next=copy(state);append(next,type,options);return checked(next);}
export function removeUnit(state,id){editable(state);const next=copy(state);if(!next.draft.units.some(u=>u.id===id))throw new Error('Einheit nicht gefunden.');next.draft.units=next.draft.units.filter(u=>u.id!==id);try{return checked(next);}catch(e){throw new Error('Noch benötigt. Zuerst abhängige Einheiten entfernen oder umordnen. '+e.message);}}
export function planModules(state,id,modules){
 editable(state);const next=copy(state),u=next.draft.units.find(u=>u.id===id);if(!u)throw new Error('Einheit nicht gefunden.');
 validateModules(u.type,modules);const before=unitCost(u);u.modules=[...modules].sort();const added=[];
 for(const m of modules)for(const type of MODULES[m].requires||[])if(!next.draft.units.some(x=>x.type===type))added.push(append(next,type));
 checked(next);const after=unitCost(u),cost=totals(added);for(const k of Object.keys(cost))cost[k]+=after[k]-before[k];return {next,extras:added,cost};
}
export const setModules=(state,id,modules)=>{const plan=planModules(state,id,modules);if(plan.extras.length)throw new Error('Zusätzliches Führungs- und Datennetz erforderlich.');return plan.next;};
export function planAssignment(state,id,parentId){
 editable(state);const next=copy(state),u=next.draft.units.find(u=>u.id===id);if(!u)throw new Error('Einheit nicht gefunden.');u.parentId=parentId||null;u.supportId=null;const extras=[];
 if(u.parentId&&BY_ID[u.type].support){let support=freeSupports(next.draft.units,u.type,u.id)[0];if(!support){support=append(next,BY_ID[u.type].support);extras.push(support);}u.supportId=support.id;}
 checked(next);return {next,extras,cost:totals(extras)};
}
export function planStationing(state,id,mode){
 editable(state);const u=state.draft.units.find(x=>x.id===id);if(!u)throw new Error('Einheit nicht gefunden.');
 const parentId=stationingHost(state.draft.units,u.type,mode,u);
 return parentId===u.parentId?{next:copy(state),extras:[],cost:totals([])}:planAssignment(state,id,parentId);
}
export function assignUnit(state,id,parentId,supportId){editable(state);const next=copy(state),u=next.draft.units.find(u=>u.id===id);if(!u)throw new Error('Einheit nicht gefunden.');u.parentId=parentId||null;u.supportId=u.parentId?supportId||null:null;return checked(next);}
function validateChoices(value){
 if(!value||typeof value!=='object')throw new Error('Ungültige Auswahlfragen.');
 const out={};for(const [key,options]of Object.entries(CHOICES)){const a=value[key];if(!Array.isArray(a)||new Set(a).size!==a.length||a.some(id=>!options.some(([k])=>k===id))||(key==='priorities'&&a.length>2))throw new Error('Ungültige Auswahlfragen.');out[key]=[...a];}return out;
}
export function submissionErrors(draft){
 if(draft.catalogVersion!==CATALOG_VERSION)return v4.submissionErrors(draft);
 const errors=issues(draft.units),cost=totals(draft.units);
 if(!draft.name.trim())errors.push('Gebt eurer Gruppe einen Namen.');
 if(!draft.units.some(u=>!BY_ID[u.type].infrastructure))errors.push('Fügt mindestens eine Einheit hinzu.');
 for(const k of Object.keys(LIMITS))if(cost[k]>LIMITS[k])errors.push(({build:'Aufbaukapital',operation:'Betrieb',personnel:'Personal'})[k]+' überschritten.');
 try{validateChoices(draft.choices);}catch(e){errors.push(e.message);}
 if(!draft.choices?.priorities?.length)errors.push('Wählt ein oder zwei Fähigkeitsschwerpunkte.');
 for(const [k,text]of QUESTIONS)if(!draft.rationale[k]?.trim())errors.push(text);return errors;
}
export function submit(state,now=new Date().toISOString()){editable(state);if(state.submissions.length>=100)throw new Error('Maximal 100 Diskussionsstände.');const errors=submissionErrors(state.draft);if(errors.length)throw new Error(errors.join(' '));const next=copy(state);next.draft.status='submitted';next.submissions.push({...copy(next.draft),submittedAt:now});return next;}
function migrate(d){
 const base=d.catalogVersion===LEGACY?v2.migrateDraft(d):copy(d);base.catalogVersion=CATALOG_VERSION;base.choices??=emptyChoices();for(const u of base.units)u.modules??=[];
 for(const u of base.units){if(u.type==='unmannedMine'){u.type='underwaterDrone';u.modules=['mine'];u.parentId=null;u.supportId=null;}else if(['rotorDrone','fixedDrone'].includes(u.type))u.type='airDrone';}
 const state={draft:base};for(const u of [...base.units])for(const type of [...BY_ID[u.type].requires||[],...u.modules.flatMap(m=>MODULES[m].requires||[])])if(!base.units.some(x=>x.type===type))append(state,type);
 // Preserve valid placements; move excess optional aircraft to another free host or land.
 for(const u of base.units)if(u.parentId&&BY_ID[u.type].optionalHost&&!freeHosts(base.units,u.type,u.id).some(h=>h.id===u.parentId)){u.parentId=freeHosts(base.units,u.type,u.id)[0]?.id||null;if(!u.parentId)u.supportId=null;}
 for(const x of infrastructureUsage(base.units))for(let n=x.capacity;n<x.used;n+=x.perBase)append(state,x.type);checked(state);return base;
}
export function revise(state){if(state.draft.status!=='submitted')throw new Error('Schließt zunächst euren Entwurf ab.');if(state.submissions.length>=100)throw new Error('Maximal 100 Diskussionsstände.');const next=copy(state);if(next.draft.catalogVersion!==CATALOG_VERSION)next.draft=migrate(next.draft);next.draft.status='draft';next.draft.iteration++;return next;}
export function parseDocument(raw){
 if([1,2,3,4].includes(raw?.schemaVersion)){const old=v4.parseDocument(raw);return {schemaVersion:5,catalogVersion:CATALOG_VERSION,draft:old.draft.status==='draft'?migrate(old.draft):old.draft,submissions:old.submissions};}
 if(!raw||raw.schemaVersion!==5||raw.catalogVersion!==CATALOG_VERSION)throw new Error('Diese Datei gehört nicht zur unterstützten Version des Flottenateliers.');
 const clean=(d,snapshot=false)=>{
  if(!d||![CATALOG_VERSION,V4_VERSION,V3_VERSION,PREVIOUS_VERSION,LEGACY].includes(d.catalogVersion)||typeof d.name!=='string'||d.name.length>100||!Number.isSafeInteger(d.iteration)||d.iteration<1||!['draft','submitted'].includes(d.status)||!Array.isArray(d.units)||d.units.length>1000||(d.catalogVersion!==CATALOG_VERSION&&d.status!=='submitted'))throw new Error('Ungültiger Entwurf in der Datei.');
  const catalog=catalogFor(d),isV1=d.catalogVersion===LEGACY;
  const units=d.units.map(u=>{
   if(!u||!Object.hasOwn(catalog,u.type)||typeof u.id!=='string'||!u.id.length||u.id.length>100||!['parentId','supportId'].every(k=>u[k]===null||typeof u[k]==='string')||(!isV1&&(!Array.isArray(u.modules)||u.modules.some(m=>typeof m!=='string'))))throw new Error('Ungültige Einheit in der Datei.');
   return {id:u.id,type:u.type,parentId:u.parentId,supportId:u.supportId,...isV1?{}:{modules:[...u.modules].sort()}};
  });
  const errors=(isV1?v1.issues:d.catalogVersion===PREVIOUS_VERSION?v2.issues:d.catalogVersion===V3_VERSION?v3.issues:d.catalogVersion===V4_VERSION?v4.issues:issues)(units);if(errors.length)throw new Error(errors.join(' '));
  const rationale={};for(const [k]of QUESTIONS){if(typeof d.rationale?.[k]!=='string'||d.rationale[k].length>5000)throw new Error('Ungültige Begründung in der Datei.');rationale[k]=d.rationale[k];}
  const result={catalogVersion:d.catalogVersion,name:d.name,iteration:d.iteration,status:d.status,units,rationale,...[CATALOG_VERSION,V4_VERSION,V3_VERSION].includes(d.catalogVersion)?{choices:validateChoices(d.choices)}:{}};
  if(d.status==='submitted'&&submissionErrors(result).length)throw new Error('Ungültiger Diskussionsstand in der Datei.');
  if(snapshot){if(d.status!=='submitted'||typeof d.submittedAt!=='string'||!Number.isFinite(Date.parse(d.submittedAt)))throw new Error('Ungültiger Diskussionsstand in der Datei.');result.submittedAt=d.submittedAt;}return result;
 };
 if(!Array.isArray(raw.submissions)||raw.submissions.length>100)throw new Error('Ungültige Versionsliste.');
 const draft=clean(raw.draft),submissions=raw.submissions.map(d=>clean(d,true));
 if(submissions.some((s,i)=>s.iteration!==i+1))throw new Error('Ungültige Reihenfolge der Diskussionsstände.');
 if(draft.iteration!==submissions.length+(draft.status==='draft'?1:0))throw new Error('Entwurf und Diskussionsstände passen nicht zusammen.');
 if(draft.status==='submitted'){const last=submissions.at(-1);if(!last||JSON.stringify(draft)!==JSON.stringify(Object.fromEntries(Object.entries(last).filter(([k])=>k!=='submittedAt'))))throw new Error('Abgeschlossener Entwurf wurde nachträglich verändert.');}
 return {schemaVersion:5,catalogVersion:CATALOG_VERSION,draft,submissions};
}
