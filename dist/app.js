
import {CATALOG,BY_ID,LIMITS,CATEGORIES,QUESTIONS,MODULES,AREAS,AREA_LABELS,CHOICES,SUPPORT_LABELS,CATALOG_VERSION,format} from './catalog.js';
import * as E from './engine.js';
import {applyPanelLayout} from './panel-layout.js';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='flottenatelier.v5',costNames={build:'Aufbau',operation:'Betrieb',personnel:'Personal'};
const DOMAIN_NAMES={air:'Luft',surface:'Überwasser',underwater:'Unterwasser'};
let state=E.fresh(),tab='build',selected='frigate',editing=null,pendingModules=[],query='',history=[],snapshot=null,pendingPlan=null,pendingImport=null;
let intro=true,toastTimer,storageOK=true,migrationMessage='';
const collapsedGroups=new Set();
const current=()=>snapshot===null?state.draft:state.submissions[snapshot];
const locked=()=>snapshot!==null||state.draft.status==='submitted';
const modern=()=>[CATALOG_VERSION,E.V4_VERSION,E.V3_VERSION].includes(current().catalogVersion);
const cards=()=>E.catalogFor(current());
const name=u=>cards()[u.type]?.name||BY_ID[u.type]?.name||u.type;
const modules=u=>(u.modules||[]).map(m=>cards()[u.type]?.moduleLabels?.[m]||MODULES[m].name).join(' · ')||'Grundausstattung';
const costs=p=>Object.keys(costNames).map(k=>format(p[k])+' '+costNames[k]).join(' / ');
const label=u=>name(u)+' '+(current().units.filter(x=>x.type===u.type).findIndex(x=>x.id===u.id)+1);
const count=type=>current().units.filter(u=>u.type===type).length;
function notice(message,error=false){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').className='show'+(error?' error':'');toastTimer=setTimeout(()=>$('#toast').className='',error?10000:5000);}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;notice('Browserspeicher nicht verfügbar. Das Spiel funktioniert weiter; bei Bedarf über „Datei“ exportieren.',true);}}
function remember(){history.push(E.copy(state.draft));if(history.length>40)history.shift();}
function commit(next){remember();state=next;save();render();}
function safe(fn){try{fn();}catch(e){notice(e.message,true);}}
function clearEditing(){editing=null;pendingModules=[];}
try{const source=localStorage.getItem(KEY)||localStorage.getItem('flottenatelier.v4')||localStorage.getItem('flottenatelier.v3')||localStorage.getItem('flottenatelier.v2')||localStorage.getItem('flottenatelier.v1');
 if(source){const raw=JSON.parse(source),next=E.parseDocument(raw);if(raw.schemaVersion!==5){localStorage.setItem('flottenatelier.backup.'+Date.now(),source);migrationMessage='Alter Stand gesichert. Unbemannte Systeme sind jetzt in Luft, Überwasser und Unterwasser gegliedert. Alte Drohnen wurden zu Luftsystemen, die frühere Minenabwehrkarte zu einem Unterwassersystem mit Minenabwehr-Baustein umgestellt. Ressourcen und nötige Infrastruktur wurden auf das aktuelle Modell umgestellt. Frühere Abgaben behalten ihre Regeln und Kosten.';}state=next;if(raw.schemaVersion!==5)save();}
}catch(e){storageOK=false;migrationMessage='Vorhandener Browserstand nicht geladen; er bleibt erhalten. '+e.message;}
const pictures=new Set(['frigate','corvette','cruiser','submarine','mine','supply','tender','tanker','intelligence','carrier','dock','amphibiousCarrier','landing','helicopter','plane','rotorDrone','fixedDrone']);
function icon(type='anchor'){
 const paths={anchor:'M16 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 6v15M9 17h14M5 21c0 9 22 9 22 0M5 21v5m22-5v5',base:'M4 28h24M7 28V12l9-6 9 6v16M11 28V16h10v12M13 20h6',network:'M16 6v10M6 26l10-10 10 10M12 2h8v8h-8ZM2 22h8v8H2Zm20 0h8v8h-8Z',marines:'M16 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-6 23v-7a6 6 0 0 1 12 0v7M6 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM2 27v-6a4 4 0 0 1 6-3M26 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm4 18v-6a4 4 0 0 0-6-3',drone:'M12 12h8v8h-8ZM12 12 6 6m14 6 6-6M12 20l-6 6m14-6 6 6M2 6h8m12 0h8M2 26h8m12 0h8'};
 paths.surfaceDrone='M3 21h26l-5 7H8Zm8 0v-7h10v7m-5-7V5m-5 5h10M2 31h28';paths.underwaterDrone='M5 13h19a5 5 0 0 1 0 10H5l-3-5Zm7 0V9h8v4M3 18h4m16-5v10M10 4h12M8 28h16';
 return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[type==='airDrone'?'drone':type]||paths.anchor)+'"/></svg>';
}
function art(c){const shape=c.shape||c.id;return pictures.has(shape)?'<img class="miniature" src="./assets/'+shape+'.png" alt="" loading="lazy" draggable="false">':'<span class="structure-icon" aria-hidden="true">'+icon(shape)+'</span>';}
function button(action,text,extra=''){return '<button data-action="'+action+'" '+extra+'>'+text+'</button>';}
function divider(index,label,controls){return '<div class="panel-divider" role="separator" tabindex="0" aria-orientation="vertical" aria-label="'+label+'" aria-controls="'+controls+'" data-divider="'+index+'" title="Ziehen zum Anpassen · Pfeiltasten zum Verschieben · Doppelklick für Standardbreiten"><span aria-hidden="true"></span></div>';}
function chips(p){return '<div class="cost-chips">'+Object.entries(costNames).map(([k,n])=>'<span>'+n+' <b>'+format(p[k])+'</b></span>').join('')+'</div>';}
function profile(points,compact=false){return '<div class="profile '+(compact?'compact':'')+'">'+Object.keys(AREAS).map(k=>'<div title="'+AREAS[k]+'"><span>'+AREA_LABELS[k]+'</span><b>'+format(points[k])+'</b>'+(compact?'':'<small>'+AREAS[k]+'</small>')+'</div>').join('')+'</div>';}
function resourceView(){const t=E.totals(current().units,current().catalogVersion);
 return '<section class="status-deck" aria-label="Ressourcen und Fähigkeiten"><div class="resources">'+Object.entries(E.limitsFor(current())).map(([k,max])=>'<div class="resource '+(t[k]>max?'over':'')+'"><div><span>'+costNames[k]+(k==='operation'?' / Jahr':'')+'</span><small>'+(t[k]>max?format(t[k]-max)+' über Limit':format(max-t[k])+' frei')+'</small></div><strong>'+format(t[k])+' <small>/ '+max+'</small></strong><meter min="0" max="'+max+'" value="'+Math.min(t[k],max)+'" aria-label="'+costNames[k]+': '+format(t[k])+' von '+max+'"></meter></div>').join('')+'</div><div class="cap-strip"><span class="cap-label">FÄHIGKEITSPROFIL <small>Spielpunkte · keine Bewertung</small></span>'+(modern()?profile(E.capabilities(current().units,current().catalogVersion),true):'<p>Historischer Stand · Fähigkeitsprofil erst nach Überarbeitung.</p>')+'</div></section>';
}
function render(){
 const focused=document.activeElement?.dataset;
 const focus=focused?.action?{action:focused.action,type:focused.type,unit:focused.unit,tab:focused.tab}:null;
 const scrolls=['#catalog-list','.detail-scroll','#fleet-content','.full-page'].map(s=>[s,$(s)?.scrollTop||0]),d=current();
 if(!cards()[selected])selected='frigate';
 $('#app').innerHTML='<header class="topbar"><a class="brand" href="./index.html" aria-label="Flottenatelier Startseite"><span class="brand-symbol">'+icon()+'</span><span>Flottenatelier<small>STRATEGISCHE MARINEPLANUNG</small></span></a><label class="group-field">EURE GRUPPE<input id="group-name" maxlength="100" placeholder="Gruppenname" value="'+esc(d.name)+'" '+(locked()?'disabled':'')+'></label><div class="header-actions"><span class="session-label">120 MINUTEN · GEMEINSAM ENTSCHEIDEN</span>'+button('help','Kurzanleitung')+button('files','Datei')+'</div></header>'+resourceView()
 +'<nav class="main-nav" aria-label="Arbeitsschritte">'+[['build','1','Aufbauen'],['overview','2','Überblicken'],['rationale','3','Begründen']].map(([id,n,title])=>button('tab','<span>'+n+'</span>'+title,'data-tab="'+id+'" aria-current="'+(tab===id?'step':'false')+'" class="'+(tab===id?'active':'')+'"')).join('')+'<div class="nav-actions">'+button('undo','↶ Rückgängig','aria-label="Letzte Änderung rückgängig machen" '+(!history.length||locked()?'disabled':''))+button('summary',locked()?'Diskussionsstand ansehen':'Für Diskussion abschließen','class="primary"')+'</div></nav>'
 +(snapshot!==null?'<div class="state-banner">Diskussionsstand vom '+new Date(d.submittedAt).toLocaleString('de-DE')+button('current','Zum aktuellen Entwurf')+'</div>':d.status==='submitted'?'<div class="state-banner">Dieser Stand ist abgeschlossen. Bereit für die Diskussion.'+button('revise','Überarbeitung beginnen')+'</div>':'')
 +(intro&&tab==='build'&&!locked()?'<section class="intro"><div><b>In drei Schritten zur eigenen Marine.</b><p>Links Einheit wählen, Ausstattung prüfen und hinzufügen. Stützpunkte werden bei Bedarf angeboten. Anschließend Flotte überblicken und Entscheidungen begründen.</p></div>'+button('dismiss-intro','Verstanden','aria-label="Einstiegshinweis ausblenden"')+'</section>':'')
 +'<main id="workspace" class="'+(tab==='build'?'build-layout':'full-layout')+'">'+(tab==='build'?catalogShell()+'<aside id="details-panel" class="details-panel" aria-label="Einheit konfigurieren"></aside><section class="fleet-panel"><div class="panel-heading"><div><span class="eyebrow">EUER ENTWURF</span><h1>Aktuelle Flotte</h1></div>'+button('tab','Gesamtübersicht ↗','data-tab="overview"')+'</div><div id="fleet-content">'+fleetView(false)+'</div><div class="panel-foot">Kosten und Fähigkeiten aktualisieren sich mit jeder Entscheidung.</div></section>':tab==='overview'?overview():rationaleView())+'</main>'
 +'<footer class="page-footer"><span>AUFTRAG → ENTWURF → DISKUSSION</span><span>Fiktive Spielwerte · keine automatische Bewertung</span><span>'+(!storageOK?'Nur in dieser Sitzung':state.submissions.length+' Diskussionsstände')+'</span></footer>';
 if(tab==='build'){
  $('.catalog-panel').id='catalog-panel';$('.fleet-panel').id='fleet-panel';
  $('#details-panel').insertAdjacentHTML('beforebegin',divider(0,'Breite der Einheitenauswahl anpassen','catalog-panel details-panel'));
  $('.fleet-panel').insertAdjacentHTML('beforebegin',divider(1,'Breite der Einheitendetails anpassen','details-panel fleet-panel'));
  applyPanelLayout();renderCatalog();renderDetails();
 }
 for(const [s,y]of scrolls)if($(s))$(s).scrollTop=y;
 if(focus)[...document.querySelectorAll('[data-action]')].find(el=>!el.disabled&&['action','type','unit','tab'].every(k=>el.dataset[k]===focus[k]))?.focus({preventScroll:true});
}
function catalogShell(){return '<aside class="catalog-panel" aria-label="Einheitenauswahl"><div class="panel-heading"><div><span class="eyebrow">EINHEITEN</span><h2>Was braucht ihr?</h2></div></div><label class="search"><span class="sr-only">Einheiten durchsuchen</span><input id="search" type="search" placeholder="Einheit suchen …" value="'+esc(query)+'"></label><div id="catalog-list"></div><p class="panel-foot">Infrastruktur erscheint beim Hinzufügen.</p></aside>';}
function renderCatalog(){
 const list=Object.values(cards()).filter(c=>!BY_ID[c.id]?.infrastructure&&(c.name+' '+c.description+' '+(DOMAIN_NAMES[c.domain]||'')).toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de')));
 $('#catalog-list').innerHTML=CATEGORIES.map(category=>{const matches=list.filter(c=>c.category===category||(category==='Marineinfanterie & Amphibik'&&c.category==='Amphibische Kräfte'));
 const order=['air','surface','underwater'];if(category==='Unbemannte Systeme')matches.sort((a,b)=>order.indexOf(a.domain)-order.indexOf(b.domain));
 return matches.length?'<details class="catalog-group" data-category="'+category+'" '+(query||!collapsedGroups.has(category)?'open':'')+'><summary>'+category+' <span>'+matches.length+'</span></summary>'+matches.map((c,i)=>(c.domain&&matches[i-1]?.domain!==c.domain?'<h3 class="catalog-domain">'+DOMAIN_NAMES[c.domain]+'</h3>':'')+'<button class="catalog-row '+(selected===c.id&&!editing?'selected':'')+'" data-action="select" data-type="'+c.id+'" aria-pressed="'+(selected===c.id&&!editing)+'"><span><b>'+esc(c.name)+'</b><small>'+esc(c.unit)+'</small></span>'+(count(c.id)?'<em>'+count(c.id)+'×</em>':'<span class="row-arrow" aria-hidden="true">›</span>')+'</button>').join('')+'</details>':'';
 }).join('')||'<p class="empty-note">Keine Einheit gefunden. Anderen Suchbegriff versuchen.</p>';
}
function selectedUnit(){return editing?current().units.find(u=>u.id===editing):null;}
function renderDetails(resetScroll=false){
 const scrollY=resetScroll?0:($('.detail-scroll')?.scrollTop||0),focus=document.activeElement?.dataset.module;
 const c=cards()[selected],u=selectedUnit(),mods=u?.modules||pendingModules,preview={type:selected,modules:mods},p=E.unitCost(preview,current().catalogVersion),hosts=c.hosts?(modern()?E.freeHosts(current().units,c.id,u?.id):current().units.filter(x=>c.hosts.includes(x.type))):[];
 $('#details-panel').innerHTML='<div class="panel-heading"><span class="eyebrow">'+(u?'EINHEIT BEARBEITEN':'AUSWÄHLEN & AUSSTATTEN')+'</span>'+(u?button('new-unit','Neue Einheit'):'')+'</div><div class="detail-scroll"><div class="detail-visual">'+art(c)+'</div><h2>'+esc(c.name)+'</h2><p class="detail-unit">'+esc(c.unit)+'</p><p class="detail-description">'+esc(c.description)+'</p>'+chips(p)
 +(modern()?'<div class="detail-profile"><h3>Fähigkeitsbeitrag</h3>'+profile(E.unitPoints(preview,current().catalogVersion),true)+(SUPPORT_LABELS[c.id]?'<p class="support-note">'+esc(SUPPORT_LABELS[c.id])+'</p>':'')+(mods.includes('recon')?'<p class="support-note">Vertiefte Aufklärung</p>':'')+'</div>':'')
 +(modern()&&c.slots?'<fieldset class="equipment"><legend>'+(c.domain?'Fähigkeitsbausteine':'Spezialisierungen')+' · '+mods.length+'/'+c.slots+'</legend>'+Object.entries(c.moduleCosts).map(([id,price])=>'<label><input type="checkbox" data-module="'+id+'" '+(mods.includes(id)?'checked':'')+' '+(locked()||(!mods.includes(id)&&mods.length>=c.slots)?'disabled':'')+'><span>'+esc(c.moduleLabels?.[id]||MODULES[id].name)+'<small>+'+format(price.build/4)+' Aufbau · +'+format(price.operation/4)+' Betrieb · +'+format(price.personnel/4)+' Personal</small></span></label>').join('')+'</fieldset>':'')
 +(c.hosts?(c.optionalHost?'<label class="field-label" for="placement">Stationierung</label><select id="placement" '+(locked()?'disabled':'')+'><option value="land" '+(!u?.parentId?'selected':'')+'>Landgestützt</option><option value="board" '+(u?.parentId?'selected':'')+'>Bordgestützt</option></select>':'<p class="field-label">Bordgestützt</p>')+'<p class="hint">'+(hosts.length?'Bordplätze werden automatisch zugeordnet.':c.optionalHost?'Noch keine freien Bordplätze. Landgestützter Betrieb ist möglich.':'Zuerst '+c.hosts.map(id=>cards()[id].name).join(' oder ')+' hinzufügen. Eine freie Plattform wird automatisch zugeordnet.')+'</p>':'')
 +(modern()&&(c.berths||c.flight)?'<p class="hint">'+(c.berths?c.berths+' '+(c.berths===1?'Hafenplatz':'Hafenplätze'):c.flight+' '+(c.flight===1?'Flugplatz-Kapazitätspunkt':'Flugplatz-Kapazitätspunkte'))+' benötigt. Fehlende Infrastruktur wird angeboten.</p>':'')
 +'<details class="more-details"><summary>Beiträge und Grenzen</summary><p>'+esc(c.description)+'</p><h3>Beiträge</h3><ul>'+c.strengths.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><h3>Grenzen</h3><ul>'+c.limits.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details></div>'
 +'<div class="detail-footer">'+(u?button('remove','Einheit entfernen','class="danger-text" data-unit="'+esc(u.id)+'" '+(locked()?'disabled':'')):'<label class="quantity">Anzahl<input id="quantity" type="number" min="1" max="50" step="1" value="1" '+(locked()?'disabled':'')+'></label>'+button('add','Zur Flotte hinzufügen','class="primary" '+(locked()||c.hosts&&!c.optionalHost&&!hosts.length?'disabled':'')))+'</div>';
 if($('.detail-scroll'))$('.detail-scroll').scrollTop=scrollY;
 if(focus)document.querySelector('[data-module='+focus+']')?.focus({preventScroll:true});
}


function fleetView(full){
 const d=current();if(!d.units.length)return '<div class="empty-fleet"><span class="empty-anchor">'+icon()+'</span><h2>Welche Marine erfüllt euren Auftrag?</h2><p>Wählt links eine Einheit. Prüft Ausstattung und Kosten und fügt sie eurer Flotte hinzu.</p><span class="hint">Ein Auftrag. Drei Ressourcen. Eure Entscheidungen.</span></div>';
 const groups=E.groupUnits(d.units);
 return '<div class="fleet-groups">'+[...CATEGORIES,'Infrastruktur'].map(category=>{
 const stacks=groups.filter(g=>(BY_ID[g[0].type]?.infrastructure?'Infrastruktur':nameCategory(g[0]))===category);
 return stacks.length?'<section class="fleet-section"><div class="section-title"><h2>'+category+'</h2><span>'+stacks.reduce((n,g)=>n+g.length,0)+' Bausteine</span></div><div class="fleet-grid">'+stacks.map(g=>{
 const u=g[0],c=cards()[u.type];return '<article class="fleet-card"><button class="fleet-card-main" data-action="edit-unit" data-unit="'+esc(u.id)+'"><span class="fleet-count">'+g.length+'×</span>'+art(c)+'<h3>'+esc(c.name)+'</h3><p>'+esc(modules(u))+'</p>'+(c.hosts?'<small>'+g.filter(x=>x.parentId).length+' eingeschifft · '+g.filter(x=>!x.parentId).length+' landgestützt</small>':'')+'</button>'+((modern()&&SUPPORT_LABELS[c.id])?'<p class="fleet-support">'+esc(SUPPORT_LABELS[c.id])+'</p>':'')+(full&&modern()&&!c.infrastructure?profile(E.capabilities(g,d.catalogVersion),true):'')+'<div class="fleet-card-foot"><small>'+costs(E.totals(g,d.catalogVersion))+'</small><div>'+button('remove','−','data-unit="'+esc(g.at(-1).id)+'" aria-label="'+esc(c.name)+' entfernen" '+(locked()?'disabled':''))+(!BY_ID[c.id]?.infrastructure?button('duplicate','+','data-unit="'+esc(u.id)+'" aria-label="'+esc(c.name)+' mit gleicher Ausstattung hinzufügen" '+(locked()?'disabled':'')):'')+'</div></div></article>';
 }).join('')+'</div></section>':'';
 }).join('')+'</div>';
}
function nameCategory(u){const c=cards()[u.type];return c.category==='Amphibische Kräfte'?'Marineinfanterie & Amphibik':c.category;}
function infrastructureView(){
 if(!modern())return '';
 return '<section class="infrastructure-summary"><div class="section-title"><h2>Infrastruktur & Kapazität</h2><span>Bei Bedarf gemeinsam beschafft</span></div><div class="capacity-grid">'+E.infrastructureUsage(current().units,current().catalogVersion).map(x=>'<div><span>'+x.name+'</span><strong>'+x.used+' <small>/ '+x.capacity+' belegt</small></strong><p>'+BY_ID[x.type].unit+' je Standort</p><meter min="0" max="'+Math.max(1,x.capacity)+'" value="'+x.used+'" aria-label="'+x.name+': '+x.used+' von '+x.capacity+' belegt"></meter></div>').join('')+'<div><span>Führung & Logistik</span><strong>'+count('network')+' <small>Datennetz</small> · '+count('logistics')+' <small>Logistikpakete</small></strong><p>Ein Netz für die Übung; ein Logistikpaket je eingeschifftem Kräftepaket.</p></div></div></section>';
}
function comparison(d){
 if(!modern())return '';
 const p=E.capabilities(d.units,d.catalogVersion),choices=d.choices;
 return '<section class="comparison"><div class="section-title"><h2>Absicht und Ausstattung</h2><span>Gesprächsanlass · keine Sollwerte</span></div><div class="comparison-grid">'+Object.keys(AREAS).map(k=>'<div><span>'+AREA_LABELS[k]+'</span><strong>'+p[k]+' <small>Punkte</small></strong><p>'+(choices.priorities.includes(k)?'Als Schwerpunkt gewählt':choices.gaps.includes(k)?'Bewusste Lücke gewählt':'Kein Schwerpunkt gewählt')+'</p></div>').join('')+'</div><p class="hint">Punkte zeigen beschaffte Beiträge. Einsatzbereitschaft, Reichweite, Aufklärung und Versorgung sind zusätzlich zu diskutieren. Unterschiedliche Bereiche ergeben keine gemeinsame Gesamtstärke.</p></section>';
}
function supportView(){
 if(!modern())return '';
 const items=E.groupUnits(current().units).filter(g=>SUPPORT_LABELS[g[0].type]||g[0].modules?.includes('recon'));
 return '<section class="support-summary"><h2>Unterstützung mitdenken</h2>'+(items.length?'<div class="support-tags">'+items.map(g=>'<span>'+g.length+'× '+esc(name(g[0]))+' · '+esc(g[0].modules?.includes('recon')?'Vertiefte Aufklärung':SUPPORT_LABELS[g[0].type])+'</span>').join('')+'</div>':'<p>Bislang keine gesonderten Unterstützungsbausteine. Welche Versorgung, Aufklärung und Transportleistung setzt ihr voraus?</p>')+'</section>';
}
function assignmentView(){
 const units=current().units,items=units.filter(u=>cards()[u.type].hosts);
 return items.length?'<section class="assignment-summary"><h2>Stationierung</h2><div class="assignment-list">'+E.groupUnits(items).map(g=>{const u=g[0];return '<div><b>'+g.length+'× '+esc(name(u))+'<small>'+esc(modules(u))+'</small></b><span>'+(u.parentId?'Bordgestützt':'Landgestützt')+(u.supportId?' · Expeditionäre Logistik vorhanden':'')+'</span>'+button('edit-unit','Ändern','data-unit="'+esc(u.id)+'" '+(locked()?'disabled':''))+'</div>';}).join('')+'</div></section>':'';
}
function overview(){return '<div class="full-page"><div class="page-heading"><div><span class="eyebrow">DAS GESAMTBILD</span><h1>Passt eure Flotte zum Auftrag?</h1><p>Prüft Schwerpunkte, Unterstützung und Stationierung.</p></div>'+button('tab','Weiter zur Begründung →','class="primary" data-tab="rationale"')+'</div>'+comparison(current())+infrastructureView()+supportView()+assignmentView()+fleetView(true)+'</div>';}
function choicesView(key,title,hint){
 const values=current().choices?.[key]||[];
 return '<fieldset class="choice-set"><legend>'+title+'</legend><p>'+hint+'</p><div class="choice-options">'+CHOICES[key].map(([id,text])=>'<label><input type="checkbox" data-choice="'+key+'" value="'+id+'" '+(values.includes(id)?'checked':'')+' '+(locked()||(key==='priorities'&&values.length>=2&&!values.includes(id))?'disabled':'')+'><span>'+text+'</span></label>').join('')+'</div></fieldset>';
}
function rationaleView(){
 const d=current();
 return '<div class="full-page rationale-page"><div class="page-heading"><div><span class="eyebrow">ENTSCHEIDUNGEN ERKLÄREN · ETWA 15 MINUTEN</span><h1>Was steckt hinter eurer Flotte?</h1><p>Wählt eure Absichten und ergänzt je Frage wenige Sätze. Es gibt keine richtigen Auswahlantworten.</p></div>'+button('summary','Diskussionsstand prüfen','class="primary"')+'</div>'
 +(modern()?'<div class="choice-layout">'+choicesView('priorities','Unsere Fähigkeitsschwerpunkte','Ein oder zwei Schwerpunkte wählen.')+choicesView('gaps','Bewusst akzeptierte Lücken','Optional · Bereiche mit bewusst geringer eigener Fähigkeit.')+choicesView('partners','Vorausgesetzte Partnerunterstützung','Optional · Unterstützung, die eure Planung voraussetzt.')+'</div>':'')
 +'<div class="question-grid">'+QUESTIONS.map(([key,text],i)=>'<label class="question"><span class="eyebrow">0'+(i+1)+'</span><b>'+text+'</b><textarea data-rationale="'+key+'" rows="3" maxlength="5000" placeholder="'+['Auftrag, Einsatzraum und gewünschte Wirkung …','Wichtigste Einheit oder Spezialisierung und ihr Beitrag …','Bewusster Verzicht und die Folgen …','Partner, Verfügbarkeit, Versorgung oder andere Annahmen …'][i]+'" '+(locked()?'disabled':'')+'>'+esc(d.rationale[key])+'</textarea></label>').join('')+'</div>'+comparison(d)+'</div>';
}
function dialog(title,body,footer=''){
 pendingPlan=null;const m=$('#modal');m.setAttribute('aria-labelledby','dialog-title');m.innerHTML='<div class="modal-head"><h2 id="dialog-title">'+title+'</h2>'+button('close','×','aria-label="Dialog schließen"')+'</div><div class="modal-body">'+body+'</div>'+(footer?'<div class="modal-foot">'+footer+'</div>':'');if(!m.open)m.showModal();
}
function budgetWarning(next){const t=E.totals(next.draft.units);const over=Object.keys(LIMITS).filter(k=>t[k]>LIMITS[k]);return over.length?'<p class="warning">Danach über dem Limit: '+over.map(k=>costNames[k]+' +'+format(t[k]-LIMITS[k])).join(' · ')+'. Entwerfen ist erlaubt; vor Abschluss muss die Flotte wieder im Budget liegen.</p>':'';}
function acceptPlan(plan,message){
 if(plan.extras.length||budgetWarning(plan.next)){
  dialog(plan.extras.length?'Voraussetzungen gemeinsam hinzufügen':'Budget im Blick behalten',
   '<p>'+esc(message.replace('hinzugefügt.','hinzufügen.'))+'</p>'+(plan.extras.length?'<p>Zusätzlich benötigt eure Auswahl:</p><ul class="purchase-extras">'+E.groupUnits(plan.extras).map(g=>'<li><b>'+g.length+'× '+esc(BY_ID[g[0].type].name)+'</b><span>'+esc(BY_ID[g[0].type].unit)+'</span><small>'+costs(E.totals(g))+'</small></li>').join('')+'</ul>':'')+'<div class="purchase-total"><span>Gesamte Änderung einschließlich Voraussetzungen</span>'+chips(plan.cost)+'</div>'+budgetWarning(plan.next),
   button('close','Abbrechen')+button('confirm-plan','Gemeinsam übernehmen','class="primary"'));
  pendingPlan={...plan,message};
 }else{commit(plan.next);notice(message);}
}
function purchase(type,options={},quantity=1){
 if(!Number.isSafeInteger(quantity)||quantity<1||quantity>50)throw new Error('Bitte eine ganze Anzahl von 1 bis 50 wählen.');
 let next=state,extras=[],added=[];
 for(let i=0;i<quantity;i++){const p=E.planPurchase(next,type,options);next=p.next;extras.push(...p.extras);added.push(...p.added);}
 acceptPlan({next,extras,cost:E.totals(added)},quantity+'× '+BY_ID[type].name+' hinzugefügt.');
}
function summary(){
 const d=current(),errors=locked()?[]:E.submissionErrors(d),t=E.totals(d.units,d.catalogVersion);
 dialog(locked()?'Euer Diskussionsstand':'Bereit für die Diskussion?',
  '<h3>'+esc(d.name||'Gruppe ohne Namen')+'</h3>'+chips(t)+(modern()?profile(E.capabilities(d.units,d.catalogVersion)):'')+'<table class="summary-table"><thead><tr><th>Baustein / Ausstattung</th><th>Anzahl</th><th>Aufbau / Betrieb / Personal</th></tr></thead><tbody>'+E.groupUnits(d.units).map(g=>'<tr><td>'+esc(name(g[0]))+'<small>'+esc(modules(g[0]))+'</small></td><td>'+g.length+'</td><td>'+costs(E.totals(g,d.catalogVersion))+'</td></tr>').join('')+'</tbody></table>'+infrastructureView()+assignmentView()
  +(modern()?Object.entries(CHOICES).map(([key,options])=>'<h3>'+({priorities:'Gewählte Schwerpunkte',gaps:'Bewusste Lücken',partners:'Partnerunterstützung'})[key]+'</h3><p>'+esc(options.filter(([id])=>d.choices[key].includes(id)).map(([,name])=>name).join('; ')||'Keine Auswahl')+'</p>').join(''):'')
  +QUESTIONS.map(([key,text])=>'<h3>'+text+'</h3><p class="answer">'+esc(d.rationale[key]||'Noch offen')+'</p>').join('')
  +(errors.length?'<div class="form-errors"><b>Vor Abschluss noch ergänzen</b><ul>'+errors.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+button('complete','Zur Begründung')+'</div>':'<p class="hint">Der Stand wird für die Diskussion eingefroren. Eine Überarbeitung bleibt möglich. Es erfolgt keine automatische Bewertung oder Übermittlung an Lehrende.</p>'),
  button('print','Drucken / PDF')+(locked()?'':button('finish','Für Diskussion abschließen','class="primary" '+(errors.length?'disabled':''))));
}


function help(){
 dialog('In wenigen Minuten startklar','<p class="lead">Welche Marine erfüllt euren Auftrag unter begrenzten Ressourcen?</p><ol class="help-steps"><li><b>Aufbauen.</b> Links Einheit wählen. In der Mitte Ausstattung und Anzahl festlegen. Hinzufügen. Fehlende Infrastruktur wird mit Kosten angeboten.</li><li><b>Überblicken.</b> Prüft Fähigkeiten, Kapazitäten und Stationierung. Überziehen ist im Entwurf erlaubt; vor Abschluss müssen alle Ressourcen im Limit liegen.</li><li><b>Begründen.</b> Ein oder zwei Schwerpunkte wählen und Entscheidungen kurz erläutern. Anschließend den Stand für die Diskussion abschließen.</li></ol><h3>Zwei Stunden einschließlich Auswertung</h3><div class="schedule"><span><b>10 Min.</b>Auftrag & Einstieg</span><span><b>45 Min.</b>Flotte aufbauen</span><span><b>15 Min.</b>Prüfen & begründen</span><span><b>35 Min.</b>Diskutieren</span><span><b>15 Min.</b>Überarbeiten & Fazit</span></div><h3>Einfach gehaltene Spielregeln</h3><p>Ein Marinestützpunkt hat 12 Hafenplätze: kleine Schiffe und Fregatten 1, große Kampfschiffe und Versorger sowie große amphibische Schiffe 2, Flugzeugträger 4. Eingeschiffte Landungsboote nutzen ihre Plattform.</p><p>Eine Marinefliegerbasis bietet 48 Kapazitätspunkte: Hubschrauber 1, Flugzeug 2, Drohnenpaket 1. Der Carrier Air Wing (CVW) belegt als Gesamtpaket 48 Punkte. Landgestützt oder bordgestützt wählen; freie Bordplätze werden automatisch zugeordnet. Fregatte, Zerstörer/Kreuzer und Einsatzgruppenversorger: je 2 Hubschrauberplätze. Auch eingeschiffte Luftfahrzeuge benötigen eine Landorganisation. Das Führungsnetz reicht einmal für die Übung. Eingeschiffte Marineinfanterie benötigt je Kräftepaket eigene expeditionäre Logistik.</p><p>Fähigkeitswerte sind frei gesetzte Spielpunkte, keine reale Leistungsprognose. Spezialisierungen addieren Beiträge. Versorgung, Aufklärung, Reichweite und Verfügbarkeit müssen zusätzlich bedacht werden. Es gibt keine Gesamtpunktzahl und keine Musterlösung.</p><p>Kein Konto erforderlich. Das Spiel übermittelt keine Daten. Bei Bedarf kann ein Stand über „Datei“ exportiert oder gedruckt werden.</p>',button('close','Los geht’s','class="primary"'));
}
function files(){dialog('Datei & Diskussionsstände','<p>Für die Übung ist keine Dateiablage nötig. Export und Import sind optional.</p><div class="file-actions">'+button('export','Entwurf exportieren')+button('import','Entwurf importieren')+button('versions','Frühere Diskussionsstände')+button('reset','Neue Gruppe beginnen','class="danger-text"')+'</div>');}
function versions(){dialog('Frühere Diskussionsstände',state.submissions.length?'<div class="version-list">'+state.submissions.map((s,i)=>button('view-version','<b>'+esc(s.name)+'</b><span>Stand '+(i+1)+' · '+new Date(s.submittedAt).toLocaleString('de-DE')+'</span>','data-index="'+i+'"')).join('')+'</div>':'<p>Noch kein Stand abgeschlossen.</p>');}
function exportFile(){const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='Flottenatelier-'+(state.draft.name||'Gruppe').replace(/[^\p{L}\p{N}_-]/gu,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Entwurf exportiert.');}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b||b.disabled)return;safe(()=>{switch(b.dataset.action){
 case 'select':selected=b.dataset.type;clearEditing();renderCatalog();renderDetails(true);document.querySelector('[data-type='+selected+']')?.focus({preventScroll:true});break;
 case 'new-unit':clearEditing();renderDetails();break;
 case 'edit-unit':{const u=current().units.find(x=>x.id===b.dataset.unit);if(!u)break;selected=u.type;editing=u.id;pendingModules=[];tab='build';$('#modal').close();render();break;}
 case 'tab':tab=b.dataset.tab;render();break;
 case 'dismiss-intro':intro=false;render();break;
 case 'add':purchase(selected,{modules:pendingModules,...cards()[selected].hosts?{stationing:$('#placement')?.value||'board'}:{}},Number($('#quantity').value));break;
 case 'duplicate':{const u=state.draft.units.find(x=>x.id===b.dataset.unit);purchase(u.type,{modules:u.modules,...cards()[u.type].hosts?{stationing:u.parentId?'board':'land'}:{}});break;}
 case 'confirm-plan':if(pendingPlan){const p=pendingPlan;pendingPlan=null;$('#modal').close();commit(p.next);notice(p.message);}break;
 case 'remove':commit(E.removeUnit(state,b.dataset.unit));if(editing===b.dataset.unit)clearEditing();render();notice('Einheit entfernt. Infrastruktur bleibt erhalten und kann separat entfernt werden.');break;
 case 'undo':if(!locked()&&history.length){state.draft=history.pop();clearEditing();save();render();notice('Letzte Änderung zurückgenommen.');}break;
 case 'help':help();break;case 'files':files();break;case 'summary':summary();break;
 case 'close':pendingPlan=null;$('#modal').close();break;
 case 'complete':$('#modal').close();tab='rationale';render();break;
 case 'finish':state=E.submit(state);history=[];clearEditing();save();$('#modal').close();tab='overview';render();notice('Diskussionsstand abgeschlossen.');break;
 case 'revise':{const old=state.draft.catalogVersion!==CATALOG_VERSION;state=E.revise(state);history=[];snapshot=null;clearEditing();save();render();notice(old?'Überarbeitung auf neue Regeln umgestellt. Nötige Infrastruktur ist ergänzt; bitte Kosten prüfen.':'Überarbeitung begonnen. Der Diskussionsstand bleibt erhalten.');break;}
 case 'versions':versions();break;
 case 'view-version':snapshot=Number(b.dataset.index);tab='overview';clearEditing();$('#modal').close();render();break;
 case 'current':snapshot=null;clearEditing();render();break;
 case 'export':exportFile();break;case 'import':$('#import-file').click();break;
 case 'confirm-import':if(pendingImport){try{localStorage.setItem('flottenatelier.backup.'+Date.now(),JSON.stringify(state));}catch{}state=pendingImport;pendingImport=null;history=[];snapshot=null;clearEditing();save();$('#modal').close();render();notice('Entwurf importiert.');}break;
 case 'reset':dialog('Neue Gruppe beginnen?','<p>Der aktuelle Entwurf wird ersetzt. Optional könnt ihr ihn vorher exportieren.</p>',button('export','Vorher exportieren')+button('close','Abbrechen')+button('confirm-reset','Neue Gruppe starten','class="danger"'));break;
 case 'confirm-reset':state=E.fresh();history=[];snapshot=null;tab='build';intro=true;clearEditing();save();$('#modal').close();render();break;
 case 'print':window.print();break;
 }});
});
document.addEventListener('input',e=>{
 if(e.target.id==='search'){query=e.target.value;renderCatalog();return;}if(locked())return;
 if(e.target.id==='group-name'){state.draft.name=e.target.value;save();}
 if(e.target.matches('[data-rationale]')){state.draft.rationale[e.target.dataset.rationale]=e.target.value;save();}
});
document.addEventListener('toggle',e=>{if(!query&&e.target.matches('.catalog-group')){if(e.target.open)collapsedGroups.delete(e.target.dataset.category);else collapsedGroups.add(e.target.dataset.category);}},true);
document.addEventListener('focusin',e=>{if(!locked()&&(e.target.id==='group-name'||e.target.matches('[data-rationale]')))remember();});
document.addEventListener('change',e=>safe(()=>{
 if(locked())return;
 if(e.target.matches('[data-module]')){
  const u=selectedUnit(),previous=u?.modules||pendingModules,m=e.target.dataset.module,mods=e.target.checked?[...previous,m]:previous.filter(x=>x!==m);
  try{E.validateModules(selected,mods);if(u){const p=E.planModules(state,u.id,mods);acceptPlan(p,'Ausstattung von '+name(u)+' angepasst.');if(pendingPlan)renderDetails();}else{pendingModules=mods;const host=$('#placement')?.value,quantity=$('#quantity')?.value;renderDetails();if($('#placement'))$('#placement').value=host;if($('#quantity'))$('#quantity').value=quantity;}}catch(err){renderDetails();throw err;}return;
 }
 if(e.target.id==='placement'&&editing){try{const p=E.planStationing(state,editing,e.target.value);acceptPlan(p,'Stationierung angepasst.');if(pendingPlan)renderDetails();}catch(err){renderDetails();throw err;}return;}
 if(e.target.matches('[data-choice]')){
  const key=e.target.dataset.choice,id=e.target.value,a=state.draft.choices[key],next=e.target.checked?[...a,id]:a.filter(x=>x!==id);
  if(key==='priorities'&&next.length>2){e.target.checked=false;throw new Error('Bitte höchstens zwei Schwerpunkte wählen.');}
  remember();state.draft.choices[key]=next;save();
  if(key==='priorities')document.querySelectorAll('[data-choice="priorities"]').forEach(el=>el.disabled=next.length>=2&&!el.checked);
  const el=$('.comparison');if(el)el.outerHTML=comparison(current());
 }
}));
$('#import-file').addEventListener('change',async e=>{
 const file=e.target.files[0];e.target.value='';if(!file)return;
 try{if(file.size>2000000)throw new Error('Maximal 2 MB pro Import.');const raw=JSON.parse(await file.text());pendingImport=E.parseDocument(raw);
 dialog('Entwurf übernehmen?','<p><b>'+esc(pendingImport.draft.name||'Gruppe ohne Namen')+'</b> · '+pendingImport.draft.units.length+' Bausteine</p>'+(raw.schemaVersion!==5?'<p>Älterer Entwurf: Budget, Personalbedarf und nötige Infrastruktur wurden auf die neuen Regeln umgestellt. Frühere Abgaben bleiben unverändert.</p>':'')+'<p>Der aktuelle Stand wird nach Bestätigung ersetzt und nach Möglichkeit lokal gesichert.</p>',button('close','Abbrechen')+button('confirm-import','Datei übernehmen','class="primary"'));
 }catch(err){pendingImport=null;notice('Import abgelehnt: '+err.message,true);}
});
$('#modal').addEventListener('cancel',()=>{pendingPlan=null;});
window.addEventListener('storage',e=>{if(e.key===KEY)notice('Ein anderer Tab hat diesen Entwurf geändert. Bei Bedarf vor dem Neuladen exportieren.',true);});
render();if(migrationMessage)dialog('Hinweis zum vorhandenen Entwurf','<p>'+esc(migrationMessage)+'</p>',button('close','Verstanden','class="primary"'));
