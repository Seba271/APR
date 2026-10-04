import {provinces} from './quality.js';
import {repository} from './data.js';
import {PageHeader,StatusBadge,EmptyState} from './components.js';
import {escape,Icon,normalize,toolbar,select,action,searchInput,filterChange} from './module-ui.js';
const state={query:'',expanded:false,filters:{province:'',commune:'',status:''},selected:null,zoom:1,x:0,y:0};
let drag=null,suppressClick=false;
const projection=w=>({x:(Number(w.lng)+71.85)/1.8*1000,y:(-30.1-Number(w.lat))/2.25*720});
function markerPositions(){
  const placed=new Map();
  for(const well of repository.getWells()){
    const origin=projection(well);
    let point=origin;
    for(let step=0;step<200;step++){
      if([...placed.values()].every(p=>Math.hypot(p.x-point.x,p.y-point.y)>=32))break;
      const angle=step*2.39996,radius=20+Math.sqrt(step)*12;
      point={x:Math.max(20,Math.min(975,origin.x+Math.cos(angle)*radius)),y:Math.max(25,Math.min(690,origin.y+Math.sin(angle)*radius))};
    }
    placed.set(well.id,point);
  }
  return placed;
}
function rows(){return repository.getWells().filter(w=>(!state.filters.province||w.province===state.filters.province)&&(!state.filters.commune||w.commune===state.filters.commune)&&(!state.filters.status||w.status===state.filters.status)&&normalize([w.id,w.name,w.locality,w.commune,repository.getAprs().find(a=>a.id===w.aprId)?.name].join(' ')).includes(normalize(state.query)));}
function mapSvg(wells){const positions=markerPositions();const selected=wells.find(w=>w.id===state.selected);const towns=[...new Map(repository.getWells().map(w=>[w.commune,w])).values()];return `<svg class="geo-map" data-map-canvas="true" viewBox="0 0 1000 720" role="group" aria-label="Mapa esquemático de la Región de Coquimbo con ${wells.length} pozos. Arrastra para mover, usa la rueda para acercar y selecciona un marcador para ver el pozo."><defs><pattern id="terrain" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M10 85 50 10 95 90M30 85 50 48 73 85" fill="none" stroke="#c9d9c8" stroke-width="1"/></pattern></defs><g transform="translate(${500-500*state.zoom+state.x} ${360-360*state.zoom+state.y}) scale(${state.zoom})"><rect x="-2000" y="-2000" width="5000" height="5000" fill="#dceef3"/><path d="M130 -500 190 0 140 100 210 210 170 320 235 420 200 520 245 720 310 1200H2200V-500Z" fill="#eef0e5" stroke="#b1ccd1" stroke-width="3"/><path d="M460 0 500 100 450 190 570 280 530 430 650 530 620 720H1200V0Z" fill="#e0e8d9"/><rect x="240" width="850" height="720" fill="url(#terrain)"/><path d="M260 0Q200 180 320 300T300 720" fill="none" stroke="white" stroke-width="9"/><path d="M260 0Q200 180 320 300T300 720" fill="none" stroke="#d8c8aa" stroke-width="3"/><path d="M950 180Q670 200 550 210T220 250M750 400Q550 390 280 500" fill="none" stroke="#a4d3e1" stroke-width="5"/><path d="M220 250Q400 240 550 210M280 500Q400 490 580 530" fill="none" stroke="white" stroke-width="4"/>${[100,300,500,700,900].map(x=>`<path d="M${x} 0V720" stroke="#cad9db" stroke-dasharray="3 9" stroke-width=".7"/>`).join('')}${[120,300,480,660].map(y=>`<path d="M0 ${y}H1000" stroke="#cad9db" stroke-dasharray="3 9" stroke-width=".7"/>`).join('')}<text x="80" y="350" transform="rotate(-90 80 350)" fill="#729bab" font-size="15" letter-spacing="5">OCÉANO PACÍFICO</text><text x="820" y="430" transform="rotate(-90 820 430)" fill="#94aa91" font-size="13" letter-spacing="5">CORDILLERA</text>${towns.map(w=>{const p=projection(w);return `<text x="${p.x+15}" y="${p.y-22}" fill="#61756a" font-size="12" stroke="#f5f6ed" stroke-width="3" paint-order="stroke">${escape(w.commune)}</text>`;}).join('')}${wells.map(w=>{const p=positions.get(w.id),color=w.status==='Crítico'?'#ec6373':w.status==='En observación'?'#e2aa39':'#17af8d';return `<g class="map-marker" data-map-well="${w.id}" tabindex="0" role="button" aria-label="${escape(w.name)}, ${w.status}" transform="translate(${p.x} ${p.y})"><title>${escape(w.name)} · ${w.id}</title>${state.selected===w.id?'<circle r="21" fill="#088dcc22" stroke="#008dcd"/>':''}<path d="M0 16C-4 10-11 2-11-5a11 11 0 0 1 22 0C11 2 4 10 0 16Z" fill="${color}" stroke="white" stroke-width="2.5"/><circle cy="-5" r="3" fill="white"/></g>`;}).join('')}${selected?(()=>{const p=positions.get(selected.id),x=Math.max(15,Math.min(775,p.x-105)),y=Math.max(10,p.y-106);return `<g class="map-popup" transform="translate(${x} ${y})"><rect width="220" height="65" rx="8" fill="white" stroke="#c6dce7"/><text x="12" y="24" font-size="12" fill="#12345a">${escape(selected.name)}</text><text x="12" y="45" font-size="11" fill="#71869e">${selected.id} · ${selected.status}</text></g>`;})():''}</g></svg>`;}
export function mapPage(){const wells=rows(),w=wells.find(w=>w.id===state.selected);return `<section class="module-page map-page">${PageHeader('Mapa de pozos APR','Ubicación geográfica de los pozos y su estado sanitario')}${toolbar(state,'pozos en el mapa',select('province','Provincia',provinces,state.filters.province)+select('commune','Comuna',[...new Set(repository.getWells().map(w=>w.commune))],state.filters.commune)+select('status','Estado sanitario',['Conforme','En observación','Crítico'],state.filters.status))}<div id="module-results"><div class="map-layout ${w?'has-selection':''}"><div class="map-surface">${mapSvg(wells)}<div class="map-count">${wells.length} pozos visibles</div><div class="map-controls">${[['+','map-in','Acercar'],['−','map-out','Alejar'],['↺','map-reset','Restablecer mapa']].map(([label,key,title])=>`<button data-module-action="${key}" aria-label="${title}" title="${title}">${label}</button>`).join('')}</div><div class="map-help">Arrastra para mover <span>·</span> Rueda para zoom <span>·</span> Clic en un marcador</div><div class="map-legend">${['Conforme','En observación','Crítico'].map(StatusBadge).join('')}</div><span class="map-credit">Base esquemática local · Coordenadas simuladas</span>${!wells.length?'<div class="map-no-results">No hay pozos para estos filtros.</div>':''}</div>${w?`<aside class="map-selection"><div class="map-selection-heading"><h2>Pozo seleccionado</h2>${action('×','map-close')}</div><span class="eyebrow">${w.id}</span><h3>${escape(w.name)}</h3>${StatusBadge(w.status)}<dl class="detail-list">${[['APR',repository.getAprs().find(a=>a.id===w.aprId)?.name],['Provincia',w.province],['Comuna',w.commune],['Localidad',w.locality],['Coordenadas',`${w.lat}, ${w.lng}`],['Última muestra',w.lastSample]].map(([k,v])=>`<div><dt>${k}</dt><dd>${escape(v)}</dd></div>`).join('')}</dl><button class="button primary" data-well="${w.id}">${Icon('pin')}Ver detalle del pozo</button></aside>`:''}</div></section>`;}
export function mapClick(el,ctx){if(el.dataset.mapWell){state.selected=el.dataset.mapWell;ctx.render();return true;}if(el.dataset.mapCanvas){if(suppressClick){suppressClick=false;return true;}const box=el.getBoundingClientRect(),event=ctx.event;if(!event)return false;state.x+=500-(event.clientX-box.left)/box.width*1000;state.y+=360-(event.clientY-box.top)/box.height*720;ctx.render();return true;}if(el.dataset.action==='filters'){state.expanded=!state.expanded;ctx.render();return true;}const key=el.dataset.moduleAction;if(!key)return false;if(key==='reset'){state.query='';state.filters={province:'',commune:'',status:''};state.selected=null;}else if(key==='map-close')state.selected=null;else if(key==='map-in')state.zoom=Math.min(4,state.zoom+.4);else if(key==='map-out')state.zoom=Math.max(1,state.zoom-.4);else if(key==='map-reset'){state.zoom=1;state.x=state.y=0;}else return false;ctx.render();return true;}
export const mapInput=(target,render)=>searchInput(target,state,render);
export const mapChange=(target,render)=>filterChange(target,state,render);


const transform=()=>`translate(${500-500*state.zoom+state.x} ${360-360*state.zoom+state.y}) scale(${state.zoom})`;
function applyTransform(svg=document.querySelector('.geo-map')){svg?.querySelector(':scope > g')?.setAttribute('transform',transform());}
export function mapPointerDown(event){
  const svg=event.target.closest?.('[data-map-canvas]');
  if(!svg||event.button!==0||event.target.closest?.('[data-map-well]'))return false;
  drag={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:state.x,y:state.y,moved:false,svg};
  svg.setPointerCapture?.(event.pointerId);
  svg.classList.add('is-dragging');
  return true;
}
export function mapPointerMove(event){
  if(!drag||event.pointerId!==drag.pointerId)return false;
  const box=drag.svg.getBoundingClientRect(),dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;
  state.x=drag.x+dx/box.width*1000;
  state.y=drag.y+dy/box.height*720;
  drag.moved=drag.moved||Math.hypot(dx,dy)>4;
  applyTransform(drag.svg);
  return true;
}
export function mapPointerUp(event){
  if(!drag||event.pointerId!==drag.pointerId)return false;
  suppressClick=drag.moved;
  drag.svg.classList.remove('is-dragging');
  drag.svg.releasePointerCapture?.(event.pointerId);
  drag=null;
  return true;
}
export function mapWheel(event){
  const svg=event.target.closest?.('[data-map-canvas]');
  if(!svg)return false;
  event.preventDefault();
  const box=svg.getBoundingClientRect(),sx=(event.clientX-box.left)/box.width*1000,sy=(event.clientY-box.top)/box.height*720;
  const oldZoom=state.zoom,newZoom=Math.max(1,Math.min(4,oldZoom+(event.deltaY<0?.2:-.2)));
  if(newZoom===oldZoom)return true;
  const worldX=(sx-(500-500*oldZoom+state.x))/oldZoom,worldY=(sy-(360-360*oldZoom+state.y))/oldZoom;
  state.zoom=newZoom;
  state.x=sx-(500-500*newZoom)-newZoom*worldX;
  state.y=sy-(360-360*newZoom)-newZoom*worldY;
  applyTransform(svg);
  return true;
}
