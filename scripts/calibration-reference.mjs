// Instructor-only stress envelope, NOT a claim that all listed aircraft are active on the reference date.
// The transition pool replaces Sea Lynx with Sea Tiger; it never adds both full fleets.
export const REFERENCE_DATE='2026-10-25';
export const REFERENCE_ROWS=[
 ['F125 · Grundplattform', 'frigate',4,[],[20,10,10]],
 ['F123 · U-Boot-Jagd','frigate',4,['asw'],[26,12,11]],
 ['F124 · Luftverteidigung','frigate',3,['air'],[24,11,11]],
 ['K130 · Überwasser-Schwerpunkt','corvette',5,['surface'],[14,6,5]],
 ['U212A','submarine',6,[],[15,7,5]],
 ['Minenabwehreinheiten','mine',10,[],[8,4,4]],
 ['Einsatzgruppenversorger','supply',3,[],[12,6,6]],
 ['Flottendienstboote','intelligence',3,[],[11,5,5]],
 ['Tender','tender',6,[],[8,4,4]],
 ['Flottentanker','tanker',2,[],[6,3,2]],
 ['Sea Lion · Transport/SAR','helicopter',18,[],[1.5,.75,1]],
 ['ASW-Hubschrauber · Übergangspool, keine Ist-Stückzahl','helicopter',22,['asw'],[3,2,1.5]],
 ['Seefernaufklärung · Ansatz zuletzt gemeldeter Zulauf','plane',3,['asw','recon'],[8.5,4.5,3.75]],
 ['Ölaufklärung · generische Annäherung','plane',2,['recon'],[6,3,3.25]],
 ['Marineinfanterie/Spezialkräfte · zwei abstrakte Kräftepakete','marines',2,[],[8,5,9]],
 ['Führungs- und Datennetz','network',1,[],[8,4,5]]
];
export function independentReference(){
 const total={build:0,operation:0,personnel:0};
 for(const [, ,n, ,prices]of REFERENCE_ROWS)Object.keys(total).forEach((k,i)=>total[k]+=n*prices[i]);
 // 46 hulls, with the three support ships using two berths each: 49/12 => five bases.
 const harborCount=Math.ceil(49/12),airbaseCount=Math.ceil((40+5*2)/48);
 for(const [n,p]of [[harborCount,[8,4,5]],[airbaseCount,[8,5,6]]])Object.keys(total).forEach((k,i)=>total[k]+=n*p[i]);
 return {total,harborCount,airbaseCount};
}
export function buildReference(engine){
 let state=engine.fresh();
 for(const [,type,n,modules]of REFERENCE_ROWS)for(let i=0;i<n;i++)state=engine.planPurchase(state,type,{modules}).next;
 return state;
}
