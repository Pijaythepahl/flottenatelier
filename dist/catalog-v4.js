// Calibrated resource model; earlier catalogs remain frozen for historical submissions.
import {CATALOG as PREVIOUS} from './catalog-v3.js';
export {CATEGORIES,AREAS,AREA_LABELS,QUESTIONS,CHOICES,MODULES,MODULE_POINTS,SUPPORT_LABELS,UNIT_NAMES,INFRASTRUCTURE,format} from './catalog-v3.js';
export const CATALOG_VERSION='2026.10-v4';
export const LIMITS=Object.freeze({build:880,operation:450,personnel:430});
// Additional permanent specialist capacity; visible points, not numbers of people.
const staff={
 frigate:{asw:1,air:1,strike:.5},cruiser:{asw:1,air:1,strike:.5},corvette:{asw:1,strike:.5},
 helicopter:{asw:.5,recon:.25},plane:{asw:.5,recon:.25},
 rotorDrone:{asw:.5,recon:.25},fixedDrone:{recon:.25}
};
export const CATALOG=PREVIOUS.map(source=>{
 const c=structuredClone(source);
 if(c.id==='supply')c.capacity={...c.capacity,helicopter:2};
 for(const [id,p]of Object.entries(c.moduleCosts))p.personnel=(staff[c.id]?.[id]||0)*4;
 return c;
});
export const BY_ID=Object.assign(Object.create(null),Object.fromEntries(CATALOG.map(c=>[c.id,c])));
