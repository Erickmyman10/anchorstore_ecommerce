// updatePrices.js — Nigerian market price corrections (direct Prisma)
// Run from server/ directory: node updatePrices.js

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();
const prisma = new PrismaClient();

// ── Price correction table ──────────────────────────────────────────────────
// match:   substring that uniquely identifies the product name
// exclude: optional substring — skip if name contains this (disambiguate)
// newPrice: corrected Nigerian retail price (psychological pricing applied)
// reason:  why the old price was wrong
const CORRECTIONS = [
  {
    match: "Acer SB220Q",
    newPrice: 129999,
    reason: "Basic 21.5\" FHD IPS; NG market range ₦90K–₦170K (was ₦959,999)",
  },
  {
    match: "Silicon Power 256GB",
    newPrice: 34999,
    reason: "256GB SSD was priced identically to 1TB SanDisk — 4× too high",
  },
  {
    match: "WD 2TB Elements",
    newPrice: 79999,
    reason: "2TB portable HDD; NG market range ₦65K–₦95K",
  },
  {
    match: "HW-B650",
    newPrice: 279999,
    reason: "Older Samsung soundbar model; NG market range ₦250K–₦320K",
  },
  {
    match: "Casual Premium Slim Fit",
    newPrice: 14999,
    reason: "Unbranded tee — was priced close to Polo Ralph Lauren (₦34,999)",
  },
  {
    match: "Mens Cotton Jacket",
    newPrice: 39999,
    reason: "Generic unbranded jacket — was near Adidas Ultraboost price",
  },
  {
    match: "Mens Casual Slim Fit",
    exclude: "Premium",
    newPrice: 12999,
    reason: "Generic casual wear — no brand to justify ₦25,999",
  },
  {
    match: "Rain Jacket Women",
    newPrice: 29999,
    reason: "Generic windbreaker; NG market range ₦20K–₦35K",
  },
  {
    match: "DANVOUY",
    newPrice: 10999,
    reason: "Generic cotton tee; NG market range ₦8K–₦15K",
  },
  {
    match: "MBJ Women",
    newPrice: 10999,
    reason: "Generic women's blouse; NG market range ₦8K–₦14K",
  },
  {
    match: "Opna Women",
    newPrice: 9999,
    reason: "Athletic moisture-wicking tee; psychological price ₦9,999",
  },
];

async function main() {
  const products = await prisma.product.findMany();
  console.log(`📦 Loaded ${products.length} products from database\n`);
  console.log("─".repeat(72));

  const changed = [];
  const notFound = [];

  for (const c of CORRECTIONS) {
    const product = products.find(
      (p) =>
        p.name.includes(c.match) &&
        (!c.exclude || !p.name.includes(c.exclude))
    );

    if (!product) {
      console.log(`⚠️  NOT FOUND: "${c.match}"`);
      notFound.push(c.match);
      continue;
    }

    const oldPrice = Number(product.unitPrice);
    const pctChange = (((c.newPrice - oldPrice) / oldPrice) * 100).toFixed(1);

    await prisma.product.update({
      where: { id: product.id },
      data: { unitPrice: c.newPrice },
    });

    const bigFlag = Math.abs(Number(pctChange)) >= 30 ? "  ⚡ >30%" : "";
    console.log(`✅ ${product.name}`);
    console.log(
      `   ₦${oldPrice.toLocaleString()} → ₦${c.newPrice.toLocaleString()} (${pctChange}%)${bigFlag}`
    );
    console.log(`   ${c.reason}`);
    changed.push({
      name: product.name,
      oldPrice,
      newPrice: c.newPrice,
      pctChange: Number(pctChange),
    });
    console.log();
  }

  // ── Final report ──────────────────────────────────────────────────────────
  console.log("═".repeat(72));
  console.log("\n📊  PRICING UPDATE REPORT\n");
  console.log(`  Products updated : ${changed.length}`);
  console.log(`  Not found        : ${notFound.length}`);
  if (notFound.length) {
    console.log(`  Missing          : ${notFound.join(", ")}`);
  }

  const bigChanges = changed.filter((x) => Math.abs(x.pctChange) >= 30);
  if (bigChanges.length) {
    console.log(`\n  ⚡ Products with >30% price change (${bigChanges.length}):\n`);
    for (const x of bigChanges) {
      console.log(
        `    • ${x.name}\n      ₦${x.oldPrice.toLocaleString()} → ₦${x.newPrice.toLocaleString()} (${x.pctChange}%)\n`
      );
    }
  }
  console.log("═".repeat(72));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
