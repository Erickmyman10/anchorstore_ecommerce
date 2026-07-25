import prisma from './Utilities/prismaclient.js';

async function seedCategories() {
  const names = ['Official Store', 'Computing', 'Electronics'];

  for (const name of names) {
    const category = await prisma.category.create({ data: { name } });
    console.log(`${name}: ${category.id}`);
  }

  await prisma.$disconnect();
}

seedCategories();
