import { cp, mkdir, rm } from 'node:fs/promises';

const output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'src']) {
  await cp(new URL(`../${file}`, import.meta.url), new URL(file, output), { recursive: true });
}
await mkdir(new URL('assets/', output), { recursive: true });
await cp(new URL('../assets/reference.png', import.meta.url), new URL('assets/reference.png', output));
console.log('Sitio estático preparado en dist/');
