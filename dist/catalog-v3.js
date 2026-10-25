import {CATALOG as PREVIOUS, LIMITS, MODULES} from './catalog-v2.js';
export {LIMITS, MODULES};
export const CATALOG_VERSION='2026.10-v3';
export const CATEGORIES=['Kampfschiffe','Unterstützung','Luftfahrzeuge','Unbemannte Systeme','Marineinfanterie & Amphibik'];
export const AREAS={aaw:'Luftverteidigung',asuw:'Überwasserseekriegführung',asw:'U-Boot-Jagd',mine:'Minenkriegführung',strike:'Wirkung gegen Landziele'};
export const AREA_LABELS={aaw:'AAW',asuw:'ASuW',asw:'ASW',mine:'Mine Warfare',strike:'Strike'};
export const QUESTIONS=[['priorities','Welchen Auftrag soll eure Marine vorrangig erfüllen?'],['decisions','Welche Beschaffungsentscheidung trägt diesen Auftrag besonders?'],['tradeoffs','Welche Lücke akzeptiert ihr bewusst – und warum?'],['assumptions','Welche Bedingungen und Unterstützung setzt ihr voraus?']];
export const CHOICES={
 priorities:Object.entries(AREAS).map(([id,name])=>[id,AREA_LABELS[id]+' · '+name]),
 gaps:Object.entries(AREAS).map(([id,name])=>[id,AREA_LABELS[id]+' · '+name]),
 partners:[['air','Luftverteidigung durch Partner'],['asw','U-Boot-Jagd durch Partner'],['recon','Aufklärung und Zielinformationen'],['supply','Versorgung und Instandsetzung'],['bases','Zugang zu ausländischen Stützpunkten']]
};
const vector=([aaw=0,asuw=0,asw=0,mine=0,strike=0]=[])=>({aaw,asuw,asw,mine,strike});
const profiles={frigate:[2,2,1],cruiser:[3,3,2],corvette:[0,2],submarine:[0,3,3],mine:[0,0,0,4],unmannedMine:[0,0,0,2],airwing:[6,5,0,0,3]};
export const MODULE_POINTS={air:vector([4]),surface:vector([0,3]),asw:vector([0,0,3]),strike:vector([0,0,0,0,3]),recon:vector()};
export const SUPPORT_LABELS={supply:'Versorgung auf See',tender:'Technische Unterstützung',tanker:'Kraftstoffversorgung',intelligence:'Aufklärung',helicopter:'Transport / Suche / Rettung',plane:'Transport / Aufklärung',rotorDrone:'Aufklärung',fixedDrone:'Aufklärung',dock:'Seetransport / Landung',amphibiousCarrier:'Lufttransport / Landung',landing:'Landung',marines:'Schutz / Wirkung an Land',logistics:'Versorgung an Land',network:'Führung / Vernetzung'};
const berths={frigate:1,cruiser:2,corvette:1,submarine:1,mine:1,supply:2,tender:1,tanker:1,intelligence:1,carrier:4,dock:2,amphibiousCarrier:2};
const flight={helicopter:1,plane:2,rotorDrone:1,fixedDrone:1,airwing:48};
export const UNIT_NAMES={carrier:'Flugzeugträger',cruiser:'Zerstörer/Kreuzer',supply:'Einsatzgruppenversorger'};
export const INFRASTRUCTURE=['harbor','airbase','network','logistics'];
const harbor={id:'harbor',name:'Marinestützpunkt',category:'Infrastruktur',cost:{build:32,operation:16,personnel:20},unit:'12 Hafenplätze',shape:'base',description:'Liegeplätze, Wartung und Grundbetrieb an Land. Große Plattformen belegen mehrere Hafenplätze.',strengths:['12 Hafenplätze je Stützpunkt'],limits:['Zusätzlicher Aufbau, Betrieb und Personal'],moduleCosts:{}};
export const CATALOG=[...PREVIOUS,harbor].map(source=>{
 const c=structuredClone(source);c.name=UNIT_NAMES[c.id]||c.name;c.infrastructure=INFRASTRUCTURE.includes(c.id);c.points=vector(profiles[c.id]);c.berths=berths[c.id]||0;c.flight=flight[c.id]||0;
 if(c.infrastructure)c.category='Infrastruktur';
 if(['rotorDrone','fixedDrone'].includes(c.id))c.category='Unbemannte Systeme';
 if(c.id==='airbase'){delete c.unique;c.unit='48 Kapazitätspunkte';c.description='Ausbildung, Wartung und Flugbetrieb für bemannte und unbemannte Luftfahrzeuge. Auch Bordluftfahrzeuge benötigen diese Landorganisation.';c.strengths=['48 Kapazitätspunkte je Basis'];c.limits=['Hubschrauber 1 Punkt; Flugzeug 2; Drohnenpaket 1; Trägerluftgruppe als Gesamtpaket 48'];}
 if(c.flight)c.requires=[...new Set([...(c.requires||[]),'airbase'])];return c;
});
export const BY_ID=Object.assign(Object.create(null),Object.fromEntries(CATALOG.map(c=>[c.id,c])));
export const format=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:2}).format(n);
