import {parameters,passes,resultValue,provinces} from './quality.js';
import {repository} from './data.js';
import {escape,Icon,PageHeader,SearchBar,FilterButton,DataTable,Pagination,StatusBadge,EmptyState} from './components.js';

const initialFilters=()=>({period:'',province:'',commune:'',aprId:'',type:'',status:''});
const state={query:'',page:1,size:10,expanded:false,filters:initialFilters(),sort:{key:'date',direction:'desc'}};
const columns=[['date','Fecha'],['apr','APR'],['well','Pozo'],['commune','Comuna'],['type','Tipo de análisis'],['ph','pH'],['chlorine','Cloro (mg/L)'],['status','Estado']];
const date=value=>value.split('-').reverse().join('-');
const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const resetButton=()=>'<button class="button" data-action="sample-reset">Restablecer</button>';
export function selectSamples(){
 const q=normalize(state.query.trim());
 return repository.getSamples().filter(sample=>Object.entries(state.filters).every(([key,value])=>!value||(key==='period'?(value==='study'?sample.date>='2015'&&sample.date<'2024':sample.date.startsWith(value)):sample[key]===value))&&(!q||normalize([sample.id,sample.apr,sample.well,sample.wellId,sample.commune].join(' ')).includes(q))).sort((a,b)=>{
  const key=state.sort.key;const comparison=key==='date'?`${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`):typeof a[key]==='number'?a[key]-b[key]:String(a[key]).localeCompare(String(b[key]),'es',{numeric:true,sensitivity:'base'});
  return comparison*(state.sort.direction==='asc'?1:-1)||b.time.localeCompare(a.time)||a.id.localeCompare(b.id);
 });
}
function filters(){
 const options=[['period','Período',[['2026-09','Septiembre 2026'],['2026-08','Agosto 2026'],['2026-07','Julio 2026'],['study','Estudio 2015–2023'],...Array.from({length:11},(_,i)=>[String(2025-i),`Año ${2025-i}`])]],['province','Provincia',provinces.map(p=>[p,p])],['commune','Comuna',[...new Set(repository.getSamples().map(s=>s.commune))].map(s=>[s,s])],['aprId','APR',repository.getAprs().map(a=>[a.id,a.name])],['type','Tipo de análisis',['Fisicoquímico','Bacteriológico'].map(s=>[s,s])],['status','Estado',['Conforme','No conforme'].map(s=>[s,s])]];
 return state.expanded?`<div class="well-filter-panel sample-filters" id="sample-filters">${options.map(([key,label,values])=>`<label>${label}<select data-sample-filter="${key}" aria-label="${label}"><option value="">Todos</option>${values.map(([value,text])=>`<option value="${escape(value)}" ${state.filters[key]===value?'selected':''}>${escape(text)}</option>`).join('')}</select></label>`).join('')}<button class="text-button" data-action="sample-clear">Limpiar filtros</button></div>`:'';
}
export function sampleResults(){
 const rows=selectSamples();state.page=Math.max(1,Math.min(state.page,Math.ceil(rows.length/state.size)||1));
 if(!rows.length)return EmptyState('No se encontraron muestras','Prueba con otra búsqueda o restablece los filtros.',resetButton());
 return `<div class="table-card">${DataTable(rows.slice((state.page-1)*state.size,state.page*state.size).map(s=>`<tr data-sample="${s.id}"><td class="date-cell">${date(s.date)}<small>${s.time}</small></td><td class="apr-link">${escape(s.apr)}</td><td class="well-name">${escape(s.well)}<small>${s.wellId}</small></td><td>${escape(s.commune)}</td><td>${s.type}</td><td class="numeric">${s.ph.toFixed(1)}</td><td class="numeric ${s.chlorine<0.2?'result-alert':''}">${s.chlorine.toFixed(1)}</td><td>${StatusBadge(s.status)}</td><td><button class="button sample-detail-button" data-sample="${s.id}" aria-label="Ver detalle de ${s.id}">${Icon('report')}Ver detalle</button></td></tr>`).join(''),state.sort,columns)}${Pagination(state.page,rows.length,state.size,'muestras')}</div><div class="samples-page-size"><label>Registros por página <select id="sample-size">${[10,20,50].map(size=>`<option ${size===state.size?'selected':''}>${size}</option>`).join('')}</select></label><span role="status">${rows.length} de ${repository.getSamples().length} registros</span></div>`;
}
export function samplesPage(){
 const count=Object.values(state.filters).filter(Boolean).length;
 return `<section class="samples-page">${PageHeader('Muestras','Consulta y seguimiento de los registros de calidad de agua recibidos desde terreno')}<div class="search-row">${SearchBar(state.query,{label:'Buscar muestras',placeholder:'Buscar por código de muestra, APR, pozo o comuna…'})}${FilterButton(count,state.expanded,{label:'Filtrar muestras',controls:'sample-filters'})}</div>${filters()}${count?`<div class="active-filters">${Object.entries(state.filters).filter(([,v])=>v).map(([key,value])=>`<span>${escape(key==='aprId'?repository.getAprs().find(a=>a.id===value)?.name:key==='period'?({'2026-09':'Septiembre 2026','2026-08':'Agosto 2026','2026-07':'Julio 2026','study':'Estudio 2015–2023'}[value]||`Año ${value}`):value)}</span>`).join('')}<button class="text-button" data-action="sample-clear">Limpiar</button></div>`:''}<div class="samples-list-heading"><h2>Registros de muestras</h2><span>Registros simulados 2015 – 2026</span></div><div id="sample-results">${sampleResults()}</div></section>`;
}
export function sampleDetail(id,openDrawer){
 const s=repository.getSamples().find(sample=>sample.id===id);if(!s)return;
 const metrics=parameters.map(([key,label])=>[label,resultValue(s,key),passes(s,key)]);
 openDrawer('Detalle de la muestra',`<div class="sample-title"><span class="eyebrow">${s.id}</span>${StatusBadge(s.status)}</div><h3 class="sample-well-title">${escape(s.well)}</h3><p class="muted">${escape(s.apr)} · ${s.wellId}</p><dl class="detail-list">${[['Fecha y hora',`${date(s.date)} · ${s.time}`],['Provincia',s.province],['Comuna',s.commune],['Localidad',s.locality],['Tipo de análisis',s.type],['Responsable',s.collector],['Origen',s.source],['Conjunto de datos',s.dataset]].map(([label,value])=>`<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl><h3 class="sample-section-title">Resultados del registro</h3><div class="sample-metrics">${metrics.map(([label,value,ok])=>`<div class="${ok?'':'outside-range'}"><span>${label}</span><strong>${value}</strong>${Icon(ok?'check':'alert')}</div>`).join('')}</div><p class="sample-secondary">Temperatura: ${s.temperature} °C · Conductividad: ${s.conductivity} µS/cm</p><div class="sample-observation"><h3>Observaciones</h3><p>${escape(s.note)}</p></div>`,`<button class="button" data-well="${s.wellId}">${Icon('pin')}Ver pozo</button><button class="button primary" data-action="close">Cerrar detalle</button>`);
}
export function samplesClick(el,{render,openDrawer}){
 if(el.dataset.sample){sampleDetail(el.dataset.sample,openDrawer);return true;}
 if(el.dataset.page){state.page=Number(el.dataset.page);render();return true;}
 if(el.dataset.sort){state.sort={key:el.dataset.sort,direction:state.sort.key===el.dataset.sort&&state.sort.direction==='asc'?'desc':'asc'};state.page=1;document.querySelector('#sample-results').innerHTML=sampleResults();document.querySelector(`[data-sort="${state.sort.key}"]`)?.focus();return true;}
 if(el.dataset.action==='filters'){state.expanded=!state.expanded;render();document.querySelector('[data-action="filters"]')?.focus();return true;}
 if(['sample-clear','sample-reset'].includes(el.dataset.action)){state.filters=initialFilters();if(el.dataset.action==='sample-reset')state.query='';state.page=1;render();return true;}
 return false;
}
export function samplesInput(target){if(target.id!=='search')return;state.query=target.value;state.page=1;document.querySelector('#sample-results').innerHTML=sampleResults();}
export function samplesChange(target,render){if(target.dataset.sampleFilter){state.filters[target.dataset.sampleFilter]=target.value;}else if(target.id==='sample-size'){state.size=Number(target.value);}else return;state.page=1;render();}
