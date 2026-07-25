import prisma from './Utilities/prismaclient.js';

const products = await prisma.product.findMany({ take: 3, select: { name: true } });
products.forEach(p => {
  const idx = p.name.indexOf('—'); // em dash
  const idx2 = p.name.indexOf('â'); // â
  console.log('Name:', p.name);
  console.log('Contains em dash (—):', idx !== -1, 'at index', idx);
  console.log('Contains â:', idx2 !== -1, 'at index', idx2);
  // show char codes around the dash area
  const dashArea = p.name.slice(20, 30);
  const codes = [...dashArea].map(c => `${c}(${c.charCodeAt(0)})`).join(' ');
  console.log('Char codes [20-30]:', codes);
  console.log('---');
});
await prisma.$disconnect();
