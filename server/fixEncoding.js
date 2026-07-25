import prisma from './Utilities/prismaclient.js';

// Mojibake for em dash: UTF-8 bytes E2 80 94 misread as Windows-1252
// â = a-circumflex (E2), € = euro sign (80), ” = right double quote (94)
const MOJIBAKE = 'â€”';
const EM_DASH = '—';

const products = await prisma.product.findMany();
let fixed = 0;

for (const product of products) {
  const corrected = product.name.split(MOJIBAKE).join(EM_DASH);
  if (corrected !== product.name) {
    await prisma.product.update({
      where: { id: product.id },
      data: { name: corrected },
    });
    console.log(`Fixed: ${corrected}`);
    fixed++;
  }
}

console.log(`\nDone. Fixed ${fixed} of ${products.length} products.`);
await prisma.$disconnect();
