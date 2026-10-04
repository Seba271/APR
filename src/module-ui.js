import {escape,Icon,SearchBar,FilterButton,DataTable,Pagination,EmptyState} from './components.js';
export {escape,Icon};
export const normalize=value=>String(value??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const date=value=>value?.split(' ')[0].split('-').reverse().join('-')||'—';
export const action=(text,key,primary=false,icon='')=>`<button class="button ${primary?'primary':''}" data-module-action="${key}">${icon?Icon(icon):''}${text}</button>`;
export const select=(name,label,values,value='',empty='Todos')=>`<label>${label}<select name="${name}" data-module-filter="${name}" aria-label="${label}">${empty!==null?`<option value="">${empty}</option>`:''}${values.map(v=>{const [id,text]=Array.isArray(v)?v:[v,v];return `<option value="${escape(id)}" ${value===String(id)?'selected':''}>${escape(text)}</option>`;}).join('')}</select></label>`;
export const field=(name,label,value='',type='text',extra='')=>`<label>${label}<input name="${name}" type="${type}" value="${escape(value)}" required ${extra}></label>`;
export function toolbar(state,label,filters='') {const count=Object.values(state.filters||{}).filter(Boolean).length;return `<div class="search-row">${SearchBar(state.query||'',{label:`Buscar ${label}`,placeholder:`Buscar ${label}…`})}${FilterButton(count,state.expanded,{label:`Filtrar ${label}`,controls:'module-filters'})}</div>${state.expanded?`<div class="well-filter-panel" id="module-filters">${filters}${action('Restablecer','reset')}</div>`:''}${count?`<div class="active-filters"><span>${count} filtros activos</span>${action('Limpiar','reset')}</div>`:''}`;}
export function sorted(rows,sort){return [...rows].sort((a,b)=>{const av=a[sort.key],bv=b[sort.key];return (typeof av==='number'?av-bv:String(av??'').localeCompare(String(bv??''),'es',{numeric:true,sensitivity:'base'}))*(sort.direction==='asc'?1:-1);});}
export function listing(rows,state,columns,row,label='registros'){state.page=Math.max(1,Math.min(state.page,Math.ceil(rows.length/10)||1));return rows.length?`<div class="table-card">${DataTable(sorted(rows,state.sort).slice((state.page-1)*10,state.page*10).map(row).join(''),state.sort,columns)}${Pagination(state.page,rows.length,10,label)}</div>`:EmptyState('No hay resultados','Prueba con otros criterios de búsqueda.',action('Restablecer','reset'));}
export function tableAction(el,state,render){if(el.dataset.page){state.page=Number(el.dataset.page);render();return true;}if(el.dataset.sort){state.sort={key:el.dataset.sort,direction:state.sort.key===el.dataset.sort&&state.sort.direction==='asc'?'desc':'asc'};state.page=1;render();document.querySelector(`[data-sort="${state.sort.key}"]`)?.focus();return true;}if(el.dataset.action==='filters'){state.expanded=!state.expanded;render();return true;}return false;}
export function searchInput(target,state,render){
 if(target.id!=='search')return;
 const start=target.selectionStart,end=target.selectionEnd,direction=target.selectionDirection;
 state.query=target.value;state.page=1;render({preserveSearch:true});
 const input=document.querySelector('#search');
 input?.focus({preventScroll:true});
 if(input&&start!==null)input.setSelectionRange(start,end,direction||'none');
}
export function filterChange(target,state,render){if(!target.dataset.moduleFilter)return;state.filters[target.dataset.moduleFilter]=target.value;state.page=1;render();}

