// Operational criteria for the mockup. These are not a certified interpretation of NCh 409/1.
export const parameters=[
 ['chlorine','Cloro libre residual','mg/L'],
 ['coliforms','Coliformes totales','UFC/100 mL'],
 ['ecoli','E. coli','UFC/100 mL'],
 ['ph','pH',''],
 ['turbidity','Turbiedad','UNT']
];
export const passes=(sample,key)=>Number.isFinite(sample[key])&&(key==='ph'?sample[key]>=6.5&&sample[key]<=8.5:key==='chlorine'?sample[key]>=.2&&sample[key]<=2:key==='turbidity'?sample[key]<=5:sample[key]===0);
export const findings=sample=>parameters.filter(([key])=>!passes(sample,key));
export const resultValue=(sample,key)=>{
 const [, ,unit]=parameters.find(p=>p[0]===key);
 const value=sample[key];
 if(!Number.isFinite(value))return 'Sin resultado';
 if(['coliforms','ecoli'].includes(key))return value?`${value} ${unit}`:'Ausente';
 return `${value.toFixed(1)}${unit?' '+unit:''}`;
};
export const provinces=['Elqui','Limarí','Choapa'];
export const provinceFor=commune=>['La Serena','Coquimbo','Vicuña','Paihuano','La Higuera','Andacollo'].includes(commune)?'Elqui':['Illapel','Salamanca','Canela','Los Vilos'].includes(commune)?'Choapa':'Limarí';
