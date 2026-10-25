// Panel sizes are a view preference, separate from fleet documents and undo.
let preferred=null;
const key='flottenatelier.panel-widths';
try{const saved=JSON.parse(localStorage.getItem(key));if(Array.isArray(saved)&&saved.length===2&&saved.every(x=>Number.isFinite(x)&&x>0))preferred=saved;}catch{}
const minimum=[180,260,280],handles=20;
let drag=null;
const clamp=(n,min,max)=>Math.max(min,Math.min(n,max));
function sizes(root){
 const width=root.clientWidth-handles;
 const catalog=clamp(root.clientWidth*.115,210,300);
 const defaults=[catalog,(width-catalog)*.505];
 const wanted=preferred||defaults;
 const left=clamp(wanted[0],minimum[0],width-minimum[1]-minimum[2]);
 return [left,clamp(wanted[1],minimum[1],width-left-minimum[2])];
}
function limits(root,index,widths){
 const width=root.clientWidth-handles;
 return index===0?[minimum[0],widths[0]+widths[1]-minimum[1]]:[minimum[1],width-widths[0]-minimum[2]];
}
export function applyPanelLayout(){
 const root=document.querySelector('.build-layout');if(!root)return;
 if(window.innerWidth<=850){root.style.removeProperty('--catalog-width');root.style.removeProperty('--details-width');return;}
 const widths=sizes(root);
 root.style.setProperty('--catalog-width',widths[0]+'px');root.style.setProperty('--details-width',widths[1]+'px');
 root.querySelectorAll('.panel-divider').forEach((el,index)=>{
  const [min,max]=limits(root,index,widths);
  el.setAttribute('aria-valuemin',Math.round(min));el.setAttribute('aria-valuemax',Math.round(max));el.setAttribute('aria-valuenow',Math.round(widths[index]));
  el.setAttribute('aria-valuetext',Math.round(widths[index])+' Pixel');
 });
}
function persist(){try{localStorage.setItem(key,JSON.stringify(preferred));}catch{}}
function resize(root,index,value,start=sizes(root)){
 const [min,max]=limits(root,index,start),next=clamp(value,min,max);
 preferred=index===0?[next,start[1]+start[0]-next]:[start[0],next];applyPanelLayout();
}
function finish(e){
 if(!drag||e.pointerId!==drag.pointerId)return;
 drag=null;document.body.classList.remove('resizing-panels');persist();
}
document.addEventListener('pointerdown',e=>{
 const handle=e.target.closest('.panel-divider');if(!handle||e.button!==0||window.innerWidth<=850)return;
 const root=handle.closest('.build-layout');
 drag={root,index:Number(handle.dataset.divider),x:e.clientX,start:sizes(root),pointerId:e.pointerId};
 handle.setPointerCapture(e.pointerId);handle.focus({preventScroll:true});document.body.classList.add('resizing-panels');e.preventDefault();
});
document.addEventListener('pointermove',e=>{
 if(drag&&e.pointerId===drag.pointerId)resize(drag.root,drag.index,drag.start[drag.index]+e.clientX-drag.x,drag.start);
});
document.addEventListener('pointerup',finish);document.addEventListener('pointercancel',finish);document.addEventListener('lostpointercapture',finish);
document.addEventListener('keydown',e=>{
 const handle=e.target.closest('.panel-divider');if(!handle||window.innerWidth<=850)return;
 const root=handle.closest('.build-layout'),index=Number(handle.dataset.divider),widths=sizes(root),[min,max]=limits(root,index,widths);
 const step=e.shiftKey?40:10;
 const value=e.key==='ArrowLeft'?widths[index]-step:e.key==='ArrowRight'?widths[index]+step:e.key==='Home'?min:e.key==='End'?max:null;
 if(value===null)return;e.preventDefault();resize(root,index,value,widths);persist();
});
document.addEventListener('dblclick',e=>{
 if(!e.target.closest('.panel-divider'))return;
 preferred=null;try{localStorage.removeItem(key);}catch{}applyPanelLayout();
});
window.addEventListener('resize',applyPanelLayout);
