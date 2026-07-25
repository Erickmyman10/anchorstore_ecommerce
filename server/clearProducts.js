import prisma from './Utilities/prismaclient.js';

async function clearProducts() {
  const result = await prisma.product.deleteMany({});
  console.log(`Deleted ${result.count} products from the database.`);
  await prisma.$disconnect();
}

clearProducts();
