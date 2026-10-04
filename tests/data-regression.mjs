import assert from 'node:assert/strict';
import {repository} from '../src/data.js';
import {passes,findings,provinceFor} from '../src/quality.js';

const samples=repository.getSamples();
assert.equal(samples.length,332);
assert.equal(new Set(samples.map(s=>s.id)).size,samples.length);
assert.equal(samples.filter(s=>s.date>='2015'&&s.date<'2024').length,216);
assert.ok(samples.every(s=>repository.getWells().some(w=>w.id===s.wellId&&w.aprId===s.aprId)));
assert.ok(samples.every(s=>s.province===provinceFor(s.commune)));
assert.ok(samples.every(s=>(findings(s).length>0)===(s.status==='No conforme')));
assert.deepEqual(repository.getSampleSummary(),{total:18,nonconforming:5,ph:'7.2',chlorine:'0.6',bacterial:2});
for(const value of [.2,2])assert.equal(passes({chlorine:value},'chlorine'),true);
for(const value of [.19,2.01,null,undefined,NaN])assert.equal(passes({chlorine:value},'chlorine'),false);
assert.equal(passes({ecoli:1},'ecoli'),false);
assert.equal(passes({ecoli:0},'ecoli'),true);
for(const alert of repository.getAlerts()){
 const sample=samples.find(s=>s.id===alert.sampleId);
 assert.equal(sample.wellId,alert.wellId);
 assert.deepEqual(alert.findings.map(f=>f.key),findings(sample).map(f=>f[0]));
 if(sample.ecoli>0)assert.equal(alert.parameter,'E. coli');
}
assert.equal(repository.getOpenAlertCount(),3);
console.log('OK: trazabilidad, clasificación compartida, límites y resumen aprobado');
