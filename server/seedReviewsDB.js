// Seed reviews from client data into the database.
// Run: node seedReviewsDB.js (from server/ directory)

import prisma from "./Utilities/prismaclient.js";
import { seededReviews } from "../client/src/data/reviews.js";

// Maps the numeric productId in reviews.js → a keyword that appears in the real product name.
// NOTE: This is a corrected version — the frontend seedReviews.js PRODUCT_ID_MAP had
// 301/302/303 pointing at phones instead of appliances, and was missing 104/105/106.
const PRODUCT_ID_MAP = {
  // Computing
  '101': 'HP Pavilion 15',
  '102': 'Lenovo IdeaPad 3',
  '103': 'Dell Inspiron 15',
  // Phones & Tablets
  '104': 'Tecno Spark 20',
  '105': 'Samsung Galaxy A55',
  '106': 'iPhone 14',
  // Fashion / Electronics (single-digit category IDs)
  '107': 'G-Shock',
  '108': 'Seiko',
  '109': 'Apple Watch',
  '110': "Levi",
  '111': 'Wrangler',
  '112': 'H&M Skinny',
  // Official Store
  '201': 'Samsung Galaxy S24 Ultra',
  '202': 'Apple iPhone 15 Pro Max',
  '203': 'Samsung 65',
  '204': 'LG 55',
  '205': 'HP Spectre',
  '206': 'ThinkPad X1',
  '207': 'Phantom V Fold',
  '208': 'MacBook Pro M3',
  // Appliances
  '301': 'Samsung 390',
  '302': 'LG 700',
  '303': 'Hisense 250',
  '304': 'LG 9kg Front Load',
  '305': 'Samsung 9kg',
  '306': 'Midea',
  '307': 'LG 2HP',
  '308': 'Nasco',
  '309': 'Binatone',
  // More Phones & Tablets
  '401': 'Samsung Galaxy A15',
  '403': 'Infinix Hot 40',
  '404': 'Infinix Note 40',
  '405': 'Tecno Camon 30',
  '406': 'Xiaomi Redmi Note 13',
  '407': 'Xiaomi Redmi 13C',
  '408': 'Apple iPad 10',
  '409': 'Apple iPad Pro 12',
  '410': 'OnePlus 12',
  '411': 'Nothing Phone',
  '412': 'Samsung Galaxy Tab',
  // Health & Beauty
  '501': 'Braun Series 7',
  '502': 'Philips Series 3000',
  '503': 'Armaf',
  '504': 'Hugo Boss',
  '505': 'Neutrogena',
  '506': "L'Oreal",
  '507': 'OGX',
  '508': 'Dove',
  // Home & Office
  '601': 'Ergonomic Mesh Office Chair',
  '602': 'L-Shaped',
  '603': 'HP LaserJet',
  '604': 'Canon PIXMA',
  '605': 'Filing Cabinet',
  '606': 'Ring Light',
  '607': 'Desk Lamp',
  '608': 'Laptop Stand',
  // Electronics
  '701': 'Samsung 55',
  '702': 'Hisense 43',
  '703': 'LG 65',
  '704': 'JBL Charge 5',
  '705': 'Sony SRS',
  '706': 'Soundbar',
  '707': 'Anker PowerCore',
  // Fashion
  '802': 'Ultraboost',
  '803': 'Polo Ralph Lauren',
  '804': 'Tommy Hilfiger',
  '806': 'Zara',
};

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true } });
  console.log(`Found ${products.length} products in database`);

  const findRealId = (keyword) => {
    const product = products.find((p) =>
      p.name?.toLowerCase().includes(keyword.toLowerCase())
    );
    return product?.id ?? null;
  };

  const mapped = [];
  const skipped = [];

  for (const review of seededReviews) {
    const keyword = PRODUCT_ID_MAP[review.productId];
    if (!keyword) {
      skipped.push(`${review.id} — no map entry for productId '${review.productId}'`);
      continue;
    }
    const realId = findRealId(keyword);
    if (!realId) {
      skipped.push(`${review.id} — no DB product matching keyword '${keyword}'`);
      continue;
    }
    mapped.push({
      id:        review.id,
      productId: realId,
      userId:    null,
      name:      review.name,
      title:     review.title ?? null,
      rating:    review.rating,
      comment:   review.comment,
      verified:  review.verified,
      likes:     review.likes,
      dislikes:  review.dislikes,
      createdAt: new Date(review.createdAt),
    });
  }

  console.log(`\nMapped ${mapped.length} reviews to real product IDs`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} reviews:`);
    skipped.forEach((s) => console.log(`  ⚠ ${s}`));
  }

  const result = await prisma.review.createMany({
    data: mapped,
    skipDuplicates: true,
  });

  console.log(`\n✅ Seeded ${result.count} reviews into database (${mapped.length - result.count} were already present)`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
