import prisma from './Utilities/prismaclient.js';

const imageMap = [
  { match: "Samsung Galaxy S24 Ultra", filename: "Samsung Galaxy S24 Ultra .jpg" },
  { match: "Apple iPhone 15 Pro Max", filename: "Iphone 15 pro max front.jpg" },
  { match: "Samsung 65", filename: "samsung-neo-qled-8k-sma....jpg" },
  { match: "LG 55", filename: "LG 55C3 OLED-evo-Smart....jpg" },
  { match: "HP Spectre", filename: "HP Spectre-front.jpg" },
  { match: "ThinkPad", filename: "Lenovo ThinkPad  front.jpg" },
  { match: "Phantom V Fold", filename: "Tecno Phantom V Fold 2.jpg" },
  { match: "MacBook", filename: "Apple MacBook Pro M3 Pr....jpg" },
  { match: "Tecno Spark", filename: "Tecno spark20 pro.jpg" },
  { match: "Galaxy A55", filename: "Samsung Galaxy A55.jpg" },
  { match: "iPhone 14", filename: "Iphone 14.jpg" },
  { match: "Galaxy A15", filename: "Samsung Galaxy A15 4G.jpg" },
  { match: "Infinix Hot", filename: "Infinix Hot 40 Pro.png" },
  { match: "Infinix Note", filename: "Infinix Note 40 Pro 5G.jpg" },
  { match: "Tecno Camon", filename: "Tecno Camon 30 Pro 5G.jpg" },
  { match: "Xiaomi Redmi Note", filename: "Xiaomi Redmi Note 13 4G....jpg" },
  { match: "Xiaomi Redmi 13C", filename: "Xiaomi Redmi 13C 4G.jpg" },
  { match: "iPad 10th", filename: "Apple iPad 10th Ge.jpg" },
  { match: "iPad Pro", filename: "Apple iPad Pro.jpg" },
  { match: "OnePlus 12", filename: "OnePlus 12 5G front.jpg" },
  { match: "Nothing Phone", filename: "Nothing Phone (2a).jpg" },
  { match: "Galaxy Tab", filename: "Samsung Galaxy Tab A9+ fr....jpg" },
  { match: "HP Pavilion", filename: "HP Pavilion laptop.jpg" },
  { match: "IdeaPad", filename: "Lenovo Idealpad3.jpg" },
  { match: "Dell Inspiron", filename: "Dell Inspiron.jpg" },
  { match: "Samsung 390L", filename: "Samsung 390L Frost-Free ....jpg" },
  { match: "LG 700L", filename: "LG 700L Side-by-Side Refri....jpg" },
  { match: "Hisense 250L", filename: "Hisense 250L Chest Deep F....jpg" },
  { match: "LG 9kg", filename: "LG 9kg Front Load Washin....jpg" },
  { match: "Samsung 9kg", filename: "Samsung 9kg Top Load Wa....jpg" },
  { match: "Midea", filename: "Midea 1.5HP Split Air Cond....jpg" },
  { match: "LG 2HP", filename: "LG 2HP DualCool Premium ....jpg" },
  { match: "Microwave", filename: "Nasco 25L Digital Solo Mic....jpg" },
  { match: "Water Dispenser", filename: "Binatone Floor Standing W....jpg" },
  { match: "G-Shock", filename: "G shock.jpg" },
  { match: "Seiko", filename: "Seiko mens watch.jpg" },
  { match: "Levi", filename: "Jean front.jpg" },
  { match: "Wrangler", filename: "Wrangler jean front.jpg" },
  { match: "H&M Skinny", filename: "Skinny jean women.jpg" },
  { match: "Ultraboost", filename: "Adidas Ultraboost 22 Runn....jpg" },
  { match: "Polo Ralph Lauren", filename: "Polo Ralph Lauren Classic F....jpg" },
  { match: "Tommy Hilfiger", filename: "Tommy Hilfiger Regular Fit ....jpg" },
  { match: "Zara Men", filename: "Zara Men Slim Fit Chino Tr....jpg" },
  { match: "Fjallraven", filename: "back.jpg" },
  { match: "Mens Casual Premium", filename: "back.jpg" },
  { match: "Mens Cotton Jacket", filename: "back.jpg" },
  { match: "Mens Casual Slim", filename: "back.jpg" },
  { match: "John Hardy", filename: "back.jpg" },
  { match: "Solid Gold", filename: "back.jpg" },
  { match: "White Gold", filename: "back.jpg" },
  { match: "Pierced Owl", filename: "back.jpg" },
  { match: "BIYLACLESEN", filename: "back.jpg" },
  { match: "Lock and Love", filename: "back.jpg" },
  { match: "Rain Jacket", filename: "back.jpg" },
  { match: "MBJ Women", filename: "back.jpg" },
  { match: "Opna Women", filename: "back.jpg" },
  { match: "DANVOUY", filename: "back.jpg" },
  { match: "Braun Series", filename: "Braun Series 7 Electric Shav....jpg" },
  { match: "Philips Series", filename: "Philips Series 3000 Wet & ....jpg" },
  { match: "Armaf", filename: "Armaf Club de Nuit Intense....jpg" },
  { match: "Hugo Boss", filename: "Hugo Boss Bottled Eau de ....jpg" },
  { match: "Neutrogena", filename: "Neutrogena Oil-Free Acne ....jpg" },
  { match: "L'Oreal", filename: "L'Oreal Paris Revitalift Tripl....jpg" },
  { match: "OGX", filename: "OGX Biotin & Collagen Thi....jpg" },
  { match: "Dove Deep", filename: "Dove Deep Moisture Body ....jpg" },
  { match: "Ergonomic Mesh Office Chair", filename: "Ergonomic Mesh Office Ch....jpg" },
  { match: "L-Shaped Corner Office Desk", filename: "Executive L-Shaped Corner ....jpg" },
  { match: "HP LaserJet", filename: "HP LaserJet Pro.jpg" },
  { match: "Canon PIXMA", filename: "Canon PIXMA TS3540 Wirel....jpg" },
  { match: "Filing Cabinet", filename: "4-Drawer Steel Filing Cabin....jpg" },
  { match: "Ring Light", filename: "Neewer 18 LED Ring Light ....jpg" },
  { match: "Desk Lamp", filename: "LED Adjustable Desk Lamp ....jpg" },
  { match: "Laptop Stand", filename: "Adjustable Aluminium Lapt....jpg" },
  { match: "Apple Watch", filename: "Apple watch.jpg" },
  { match: "Samsung 55", filename: "Samsung S5 Crystal UHD 4....jpg" },
  { match: "Hisense 43", filename: "Hisense 43.jpg" },
  { match: "LG 65", filename: "LG 65 C3 OLED evo Smart ....jpg" },
  { match: "JBL Charge", filename: "JBL Charge 5 Portable Bluet....jpg" },
  { match: "Sony SRS", filename: "Sony SRS-XB33 Extra Bass ....jpg" },
  { match: "Soundbar", filename: "Samsung HW-B650 Sound....jpg" },
  { match: "Anker PowerCore", filename: "Anker PowerCore 26800mA....jpg" },
  { match: "WD 2TB", filename: "back.jpg" },
  { match: "SanDisk SSD", filename: "back.jpg" },
  { match: "Silicon Power", filename: "back.jpg" },
  { match: "WD 4TB", filename: "back.jpg" },
  { match: "Acer SB220Q", filename: "back.jpg" },
  { match: "CHG90", filename: "back.jpg" },
];

const FALLBACK = 'back.jpg';

const products = await prisma.product.findMany();
let matched = 0;
let fallbacks = 0;

for (const product of products) {
  const nameLower = product.name.toLowerCase();
  const entry = imageMap.find(e => nameLower.includes(e.match.toLowerCase()));
  const filename = entry ? entry.filename : FALLBACK;

  await prisma.product.update({
    where: { id: product.id },
    data: { image: filename },
  });

  if (entry) {
    console.log(`✅ ${product.name} → ${filename}`);
    matched++;
  } else {
    console.log(`⚠️  ${product.name} → ${filename} (fallback)`);
    fallbacks++;
  }
}

console.log(`\nDone. ${matched} matched, ${fallbacks} used fallback, ${products.length} total.`);
await prisma.$disconnect();
