// Recomputes each product's `rating` (average) and `reviewCount` from its
// actual Review rows. Run this AFTER seedReviewsDB.js, since it reads from
// the reviews that script inserts.
//
// Run: node updateProductRatings.js  (with DATABASE_URL set to the target DB)

import prisma from "./Utilities/prismaclient.js";

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true } });
  console.log(`Found ${products.length} products`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      // No reviews yet — leave at 0 rather than writing a fake average.
      skipped++;
      continue;
    }

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const rounded = Math.round(avg * 10) / 10;

    await prisma.product.update({
      where: { id: product.id },
      data: { rating: rounded, reviewCount: reviews.length },
    });

    console.log(`✅ ${product.name} — rating ${rounded} (${reviews.length} reviews)`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} products, ${skipped} had no reviews and were left at 0.`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
