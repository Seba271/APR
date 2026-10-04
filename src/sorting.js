const collator=new Intl.Collator('es',{numeric:true,sensitivity:'base'});
const sanitaryOrder={'Conforme':0,'En observación':1,'Crítico':2};
const dateValue=value=>{const match=/^(\d{2})-(\d{2})-(\d{4})$/.exec(value);return match?`${match[3]}${match[2]}${match[1]}`:null;};
export function sortWells(wells,aprs,{key,direction}){
 const aprNames=new Map(aprs.map(apr=>[apr.id,apr.name]));
 const value=well=>key==='apr'?aprNames.get(well.aprId)||'':key==='status'?sanitaryOrder[well.status]??3:key==='lastSample'?dateValue(well.lastSample):well[key];
 return [...wells].sort((a,b)=>{
  const av=value(a),bv=value(b);
  // Wells without a sample stay last in either direction.
  if(av==null||bv==null)return av==null&&bv==null?collator.compare(a.id,b.id):av==null?1:-1;
  const comparison=typeof av==='number'?av-bv:collator.compare(String(av),String(bv));
  return comparison*(direction==='desc'?-1:1)||collator.compare(a.id,b.id);
 });
}
