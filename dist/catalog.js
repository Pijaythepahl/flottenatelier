// Three uncrewed platform families with role-specific payloads.
import {CATALOG as PREVIOUS,MODULES as OLD_MODULES,MODULE_POINTS as OLD_POINTS,SUPPORT_LABELS as OLD_SUPPORT,UNIT_NAMES as OLD_NAMES} from './catalog-v4.js';
export {CATEGORIES,AREAS,AREA_LABELS,QUESTIONS,CHOICES,INFRASTRUCTURE,LIMITS,format} from './catalog-v4.js';
export const UNIT_NAMES={...OLD_NAMES,airwing:'Carrier Air Wing (CVW)',plane:'Maritime Patrol Aircraft (MPA)'};
export const CATALOG_VERSION='2026.10-v5';
export const MODULES={...OLD_MODULES,mine:{name:'Minenabwehr',requires:['network']}};
const points=(aaw=0,asuw=0,asw=0,mine=0,strike=0)=>({aaw,asuw,asw,mine,strike});
export const MODULE_POINTS={...OLD_POINTS,mine:points(0,0,0,3)};
export const SUPPORT_LABELS={...OLD_SUPPORT,airDrone:'Aufklärung aus der Luft',surfaceDrone:'Aufklärung auf See',underwaterDrone:'Unterwasseraufklärung'};
const price=([build,operation,personnel])=>({build:build*4,operation:operation*4,personnel:personnel*4});
const base=(id,name,domain,values,description,limits,modules,moduleLabels,modulePoints)=>({
 id,name,category:'Unbemannte Systeme',domain,cost:price(values),unit:'1 Systempaket mit Betreuung',shape:id,description,
 strengths:['Eigenständig von Land einsetzbar','Zwei wählbare Fähigkeitsbausteine','Keine Besatzung an Bord'],
 limits,requires:['network'],slots:2,moduleCosts:Object.fromEntries(Object.entries(modules).map(([k,v])=>[k,price(v)])),
 moduleLabels,modulePoints,points:points(),berths:domain==='air'?0:1,flight:domain==='air'?1:0,infrastructure:false
});
const air=base('airDrone','Unbemanntes Luftsystem (UAV)','air',[6,3,2],
 'Unbemannte Luftfahrzeuge mit Grundsensorik und Betreuung. Wählt Sensorik, U-Boot-Ortung, Minensuche oder Flugkörper. Bei Bordbetrieb steht das Paket für bordgeeignete Luftfahrzeuge.',
 ['Begrenzte Ausdauer und Nutzlast','Minensuche bedeutet Erkennen, keine vollständige Räumung','Ortung allein ist keine vollständige U-Boot-Bekämpfung'],
 {recon:[2,1,.25],asw:[3,1,.5],mine:[3,1,.5],surface:[3,1,0],strike:[10,3,.5]},
 {recon:'Sensorik & Aufklärung',asw:'U-Boot-Ortung',mine:'Minensuche (Sensorik)',surface:'Seeziel-Flugkörper',strike:'Landziel-Flugkörper'},
 {asw:points(0,0,2),mine:points(0,0,0,1),surface:points(0,2),strike:points(0,0,0,0,2)});
air.hosts=['frigate','cruiser','supply','amphibiousCarrier'];air.optionalHost=true;air.requires.push('airbase');
const additions=[air,
 base('surfaceDrone','Unbemanntes Überwassersystem (USV)','surface',[6,2,1.5],
 'Unbemannte Überwasserfahrzeuge mit Grundsensorik und eigener Betreuung. Von Land einsetzen und mit Sensoren, Minenabwehr oder Flugkörpern ausstatten. Start- und Bergungsmittel sind enthalten.',
 ['Begrenzte Ausdauer und geringer Eigenschutz','Führung, Wartung und Start/Bergung bleiben nötig','Kein Ersatz für Transport- und Führungsräume großer Schiffe'],
 {recon:[2,1,.25],asw:[4,2,.5],mine:[4,2,.5],surface:[4,2,0],strike:[10,3,.5]},
 {recon:'Sensorik & Aufklärung',asw:'U-Boot-Ortung',mine:'Minenabwehr',surface:'Seeziel-Flugkörper',strike:'Landziel-Flugkörper'},
 {asw:points(0,0,2),surface:points(0,2),strike:points(0,0,0,0,2)}),
 base('underwaterDrone','Unbemanntes Unterwassersystem (UUV)','underwater',[8,3,2],
 'Unbemannte Unterwasserfahrzeuge zur Beobachtung und Untersuchung unter Wasser. Wählt Sensorik, U-Boot-Ortung oder Minenabwehr. Start- und Bergungsmittel sind enthalten; ein bemanntes Minenjagdboot ist nicht erforderlich.',
 ['Begrenzter Datenaustausch unter Wasser','Ortung allein ist keine vollständige U-Boot-Bekämpfung','Betreuung und Auswertung erfordern Fachpersonal'],
 {recon:[2,1,.25],asw:[4,2,.5],mine:[4,2,.5]},
 {recon:'Unterwasseraufklärung',asw:'U-Boot-Ortung',mine:'Minenabwehr'},
 {asw:points(0,0,2)})
];
export const CATALOG=[...PREVIOUS.filter(c=>!['rotorDrone','fixedDrone','unmannedMine'].includes(c.id)).map(source=>{
 const c=structuredClone(source);
 c.name=UNIT_NAMES[c.id]||c.name;
 c.limits=c.limits?.map(text=>text.replaceAll('Trägerluftgruppe','Carrier Air Wing (CVW)'));
 if(c.capacity){c.capacity.airDrone=c.capacity.rotorDrone;delete c.capacity.rotorDrone;}
 return c;
}),...additions];
export const BY_ID=Object.assign(Object.create(null),Object.fromEntries(CATALOG.map(c=>[c.id,c])));
