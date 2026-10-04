import {provinceFor,findings,resultValue} from './quality.js';
export const aprs = [
 {id:'apr-1',name:'APR El Manzano',commune:'Monte Patria',manager:'Comité APR El Manzano'},
 {id:'apr-2',name:'APR El Palqui',commune:'Monte Patria',manager:'Comité APR El Palqui'},
 {id:'apr-3',name:'APR Chañaral Alto',commune:'Combarbalá',manager:'Comité APR Chañaral Alto'},
 {id:'apr-4',name:'APR Los Maitenes',commune:'Punitaqui',manager:'Comité APR Los Maitenes'},
 {id:'apr-5',name:'APR Las Palmas',commune:'Río Hurtado',manager:'Comité APR Las Palmas'},
 {id:'apr-6',name:'APR Cerrillos',commune:'Ovalle',manager:'Comité APR Cerrillos'},
 {id:'apr-7',name:'APR Chillepín',commune:'Salamanca',manager:'Comité APR Chillepín'},
 {id:'apr-8',name:'APR Cuz Cuz',commune:'Illapel',manager:'Comité APR Cuz Cuz'},
 {id:'apr-9',name:'APR Quilimarí',commune:'Los Vilos',manager:'Comité APR Quilimarí'}
];
const names=['El Manzano Central','Reserva Quebrada','Las Vertientes','Los Espinos','El Palqui','Tulahuén','Chañaral Alto','Los Maitenes','Las Palmas','Cerrillos','Huatulame','Chillepín','Cuz Cuz','Quilimarí','El Manzano Norte','El Palqui Alto','Chañaral Bajo','Los Maitenes Sur','Las Palmas Norte','Cerrillos Alto','Chillepín Norte','Cuz Cuz Alto','Quilimarí Norte','El Palqui Sur','Los Maitenes Norte'];
export const wells = names.map((name,i)=>{
 const apr=aprs[[0,0,0,0,1,1,2,3,4,5,1,6,7,8,0,1,2,3,4,5,6,7,8,1,3][i]];
 return {id:`PZ-${String(i+1).padStart(2,'0')}`,name:`Pozo ${name}`,aprId:apr.id,commune:apr.commune,locality:i<4?'El Manzano':name.replace(/ Central| Norte| Sur| Alto| Bajo/g,''),operational:i>=22?'Fuera de servicio':'Operativo',status:i===2||i>=18&&i<=21?'En observación':i>=22?'Crítico':'Conforme',lastSample:'12-09-2026',lat:(-30.56-i*.038).toFixed(4),lng:(-70.83-i*.012).toFixed(4),capture:'Subterráneo profundo',flow:(14.3-i*.31).toFixed(1)};
});
// Stable local records shared by Muestras, Dashboard and each well's history.
const sampleRecord=(well,index,month,current=false)=>{
 const bacterial=current&&(index===15||index===16);
 const chlorine=current&&(index===13||index===17)?0.1:current&&(index===0||index===1)?1.1:0.6;
 const turbidity=current&&index===14?6.2:1.2;
 return {id:`MU-2026-${month}-${String(index+1).padStart(3,'0')}`,wellId:well.id,aprId:well.aprId,apr:aprs.find(a=>a.id===well.aprId).name,well:well.name,commune:well.commune,locality:well.locality,date:`2026-${month}-${current?'12':String(28-index%20).padStart(2,'0')}`,time:`${String(9+index%7).padStart(2,'0')}:${index%2?'30':'15'}`,type:bacterial||index%3===0?'Bacteriológico':'Fisicoquímico',ph:[7.0,7.2,7.4][index%3],chlorine,turbidity,coliforms:bacterial?3:0,ecoli:index===16&&current?1:0,temperature:18+index%5,conductivity:450+index*7,status:current&&index>=13?'No conforme':'Conforme',collector:['María González','Carlos Rojas','Ana Pérez'][index%3],source:'Aplicación móvil',note:current&&index>=13?'Resultado observado. Se solicita revisión y seguimiento del registro.':'Muestra recibida y validada. Sin observaciones.'};
};
export const samples=[
 ...[0,1,3,4,5,6,7,8,9,10,11,12,13,18,19,22,23,24].map((wellIndex,i)=>sampleRecord(wells[wellIndex],i,'09',true)),
 ...wells.map((w,i)=>sampleRecord(w,i,'08')),
 ...wells.map((w,i)=>sampleRecord(w,i,'07'))
];
for(const well of wells){const latest=samples.filter(s=>s.wellId===well.id).sort((a,b)=>b.date.localeCompare(a.date))[0];well.lastSample=latest.date.split('-').reverse().join('-');}
const communeCenters={'Monte Patria':[-30.70,-70.94],'Combarbalá':[-31.18,-71.00],'Punitaqui':[-30.84,-71.27],'Río Hurtado':[-30.40,-70.76],'Ovalle':[-30.59,-71.20],'Salamanca':[-31.78,-70.96],'Illapel':[-31.62,-71.16],'Los Vilos':[-31.90,-71.49]};
for(const [i,w] of wells.entries()){const [lat,lng]=communeCenters[w.commune];w.lat=(lat+(i%3-1)*.045).toFixed(4);w.lng=(lng+(Math.floor(i/3)%3-1)*.05).toFixed(4);}
for(const year of Array.from({length:11},(_,i)=>2015+i))for(let month=1;month<=12;month++)for(let j=0;j<2;j++){
 const w=wells[(month*2+j+year)%wells.length],base=sampleRecord(w,month+j,String(month).padStart(2,'0'));
 const bad=(month+j+year)%5===0;
 samples.push({...base,id:`MU-${year}-${String(month).padStart(2,'0')}-${j+1}`,date:`${year}-${String(month).padStart(2,'0')}-${j?'22':'10'}`,chlorine:bad?.1:Number((.4+(month%4)*.1).toFixed(1)),status:bad?'No conforme':'Conforme',note:bad?'Cloro bajo observado en el registro histórico.':'Ejemplo histórico simulado sin observaciones.'});
}
export const alerts=samples.filter(s=>s.date.startsWith('2026-09')&&s.status==='No conforme').map((s,i)=>({id:`AL-2026-${String(i+1).padStart(3,'0')}`,sampleId:s.id,wellId:s.wellId,date:s.date,type:s.coliforms?'Alerta bacteriológica':s.chlorine<.2?'Cloro bajo':'Turbiedad alta',parameter:s.coliforms?'Coliformes totales':s.chlorine<.2?'Cloro libre residual':'Turbiedad',value:s.coliforms?`${s.coliforms} UFC/100 mL`:s.chlorine<.2?`${s.chlorine} mg/L`:`${s.turbidity} UNT`,risk:i>=2?'Crítico':'Alto',status:i>=2?'Pendiente':'Resuelta',resample:i>=2,observations:i<2?[{date:'2026-09-14',text:'Revisión de terreno realizada. Incidencia cerrada en el ejemplo local.'}]:[],resampleDate:''}));
for(const alert of alerts){const sample=samples.find(s=>s.id===alert.sampleId);alert.findings=findings(sample).map(([key,label])=>({key,label,value:resultValue(sample,key)}));if(sample.ecoli>0){alert.parameter='E. coli';alert.value=resultValue(sample,'ecoli');}}
for(const sample of samples){sample.province=provinceFor(sample.commune);sample.source=sample.date<'2024'?'Registro histórico simulado':'Aplicación móvil simulada';sample.dataset=sample.date<'2024'?'Estudio 2015–2023':'Seguimiento 2024–2026';}
for(const well of wells)well.province=provinceFor(well.commune);
for(const apr of aprs)apr.province=provinceFor(apr.commune);
export const users=[['María González','maria.gonzalez@apr.cl','Administrador'],['Carlos Rojas','carlos.rojas@apr.cl','Analista'],['Ana Pérez','ana.perez@apr.cl','Analista'],['Luis Contreras','luis.contreras@apr.cl','Solo lectura'],['Sofía Martínez','sofia.martinez@apr.cl','Analista'],['Jorge Núñez','jorge.nunez@apr.cl','Solo lectura'],['Patricia Silva','patricia.silva@apr.cl','Analista'],['Andrés Torres','andres.torres@apr.cl','Analista'],['Camila Herrera','camila.herrera@apr.cl','Solo lectura'],['Diego Morales','diego.morales@apr.cl','Analista']].map(([name,email,role],i)=>({id:`USR-${i+1}`,name,email,role,status:i===5?'Inactivo':'Activo',lastAccess:`2026-09-${String(12-i).padStart(2,'0')} 10:24`}));
export const preferences={organization:'APR · Región de Coquimbo',email:'admin@apr.cl',pageSize:10,notifyCritical:true,notifyFollowup:false};
export const repository = {
 getAlerts:()=>alerts,
 getUsers:()=>users,
 getPreferences:()=>preferences,
 saveUser(user){const index=users.findIndex(u=>u.id===user.id);if(index<0)users.push(user);else users[index]=user;},
 getOpenAlertCount:()=>new Set(alerts.filter(a=>a.status!=='Resuelta').map(a=>a.wellId)).size,
 getSamples:()=>samples,
 getSampleSummary(){const month=samples.filter(s=>s.date.startsWith('2026-09'));return {total:month.length,nonconforming:month.filter(s=>s.status==='No conforme').length,ph:(month.reduce((n,s)=>n+s.ph,0)/month.length).toFixed(1),chlorine:(month.reduce((n,s)=>n+s.chlorine,0)/month.length).toFixed(1),bacterial:month.filter(s=>s.coliforms>0||s.ecoli>0).length};},
 getSummary(){const total=wells.length,active=wells.filter(w=>w.operational==='Operativo').length;return {total,active,critical:wells.filter(w=>w.status==='Crítico').length,conforme:wells.filter(w=>w.status==='Conforme').length,observation:wells.filter(w=>w.status==='En observación').length,monitored:wells.filter(w=>w.operational==='Operativo'&&w.lastSample!=='Sin muestras').length,communes:new Set(wells.map(w=>w.commune)).size};},
 getWells:()=>wells,
 getAprs:()=>aprs,
 saveWell(record){record.province=provinceFor(record.commune);const index=wells.findIndex(w=>w.id===record.id);if(index<0)wells.push(record);else wells[index]=record;},
 addApr(record){record.province=provinceFor(record.commune);aprs.push(record);}
};



