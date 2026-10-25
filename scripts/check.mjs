import {readdirSync, readFileSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
for(const file of readdirSync('dist').filter(x=>x.endsWith('.js'))){
  const result=spawnSync(process.execPath,['--check','dist/'+file],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);
}
const html=readFileSync('dist/index.html','utf8');
for(const path of ['app.js','styles.css'])if(!html.includes(path)||!existsSync('dist/'+path))throw new Error('Startdatei fehlt: '+path);
const {CATALOG}=await import('../dist/catalog.js');
for(const c of CATALOG){
  const shape=c.shape||c.id;
  if(!['base','network','drone','missile','marines','airDrone','surfaceDrone','underwaterDrone'].includes(shape)&&!existsSync('dist/assets/'+shape+'.png'))throw new Error('Bild fehlt: '+shape);
}
console.log('Alle Programme und lokalen Startdateien geprüft.');
