import prisma from './Utilities/prismaclient.js';

// Uses real filenames on disk. Also updates `image` to the first element
// so the imageRegistry can resolve it (old truncated names don't exist as files).
const imagesMap = [
  { match: "Samsung Galaxy S24 Ultra", images: ["Samsung Galaxy S24 Ultra.jpg", "Samsung Galaxy S24 Ultra back.jpg", "Samsung Galaxy s24 Ultra features.jpg"] },
  { match: "Apple iPhone 15 Pro Max", images: ["Iphone 15 pro max front.jpg", "Iphone 15 promax back.jpg"] },
  { match: "Samsung 65", images: ["samsung-neo-qled-8k-smart-tv-.webp"] },
  { match: "LG 55", images: ["LG 55C3 OLED-evo-Smart-TV.jpg"] },
  { match: "HP Spectre", images: ["HP Spectre-front.jpg", "HP Spectre x360 14 back.jpg", "HP Spectre-2.jpg"] },
  { match: "ThinkPad", images: ["Lenovo ThinkPad  front.jpg", "Lenovo ThinkPad back.jpg", "Lenovo ThinkPad side.jpg"] },
  { match: "Phantom V Fold", images: ["Tecno Phantom V Fold 2.jpg"] },
  { match: "MacBook", images: ["Apple MacBook Pro M3 Pro 14 front.jpg", "Apple MacBook Pro M3 Pro 14 side view.jpg"] },
  { match: "Tecno Spark", images: ["Tecno spark20 pro.jpg"] },
  { match: "Galaxy A55", images: ["Samsung Galaxy A55.jpg"] },
  { match: "iPhone 14", images: ["Iphone 14.jpg"] },
  { match: "Galaxy A15", images: ["Samsung Galaxy A15 4G.jpg"] },
  { match: "Infinix Hot", images: ["Infinix Hot 40 Pro.png", "infinix-hot-40-pro-back.jpg"] },
  { match: "Infinix Note", images: ["Infinix Note 40 Pro 5G.jpg"] },
  { match: "Tecno Camon", images: ["Tecno Camon 30 Pro 5G.jpg"] },
  { match: "Xiaomi Redmi Note", images: ["Xiaomi Redmi Note 13 4G.jpg"] },
  { match: "Xiaomi Redmi 13C", images: ["Xiaomi Redmi 13C 4G.jpg"] },
  { match: "iPad 10th", images: ["Apple iPad 10th Ge.jpg"] },
  { match: "iPad Pro", images: ["Apple iPad Pro 12.9.jpg"] },
  { match: "OnePlus 12", images: ["OnePlus 12 5G front.jpg", "OnePlus 12 5G back.jpg"] },
  { match: "Nothing Phone", images: ["Nothing Phone (2a).jpg"] },
  { match: "Galaxy Tab", images: ["Samsung Galaxy Tab A9+ front.jpg", "Samsung Galaxy Tab A9+ back.jpg"] },
  { match: "HP Pavilion", images: ["HP Pavilion laptop.jpg"] },
  { match: "IdeaPad", images: ["Lenovo Idealpad3.jpg"] },
  { match: "Dell Inspiron", images: ["Dell Inspiron.jpg"] },
  { match: "Samsung 390L", images: ["Samsung 390L Frost-Free Double Door Refrigerator.jpg", "Samsung 390L Frost-Free Double Door Refrigerator open view.jpg"] },
  { match: "LG 700L", images: ["LG 700L Side-by-Side Refrigerator — Instaview Door-in-Door.avif"] },
  { match: "Hisense 250L", images: ["Hisense 250L Chest Deep Freezer.jpg"] },
  { match: "LG 9kg", images: ["LG 9kg Front Load Washing Machine.jpg"] },
  { match: "Samsung 9kg", images: ["Samsung 9kg Top Load Washing Machine.avif"] },
  { match: "Midea", images: ["Midea 1.5HP Split Air Conditioner.jpg", "Midea 1.5HP Split Air Conditioner back.webp"] },
  { match: "LG 2HP", images: ["LG 2HP DualCool Premium Inverter Air Conditioner.webp"] },
  { match: "Microwave", images: ["Nasco 25L Digital Solo Microwave Oven.jpg"] },
  { match: "Water Dispenser", images: ["Binatone Floor Standing Water Dispenser second.jpg"] },
  { match: "G-Shock", images: ["G shock.jpg"] },
  { match: "Seiko", images: ["Seiko mens watch.jpg"] },
  { match: "Levi", images: ["Jean front.jpg", "Jean back.jpg"] },
  { match: "Wrangler", images: ["Wrangler jean front.jpg", "Wrangler jean back.jpg"] },
  { match: "H&M Skinny", images: ["Skinny jean women.jpg"] },
  { match: "Ultraboost", images: ["Adidas Ultraboost 22 Running Shoes.jpg"] },
  { match: "Polo Ralph Lauren", images: ["Polo Ralph Lauren Classic Fit T-Shirt front.jpg", "Polo Ralph Lauren Classic Fit T-Shirt  back.jpg"] },
  { match: "Tommy Hilfiger", images: ["Tommy Hilfiger Regular Fit Polo Shirt ront.jpg", "Tommy Hilfiger Regular Fit Polo Shirt back.jpg"] },
  { match: "Zara Men", images: ["Zara Men Slim Fit Chino Trousers front.jpg", "Zara Men Slim Fit Chino Trousers back.jpg"] },
  { match: "Fjallraven", images: ["back.jpg"] },
  { match: "Mens Casual Premium", images: ["back.jpg"] },
  { match: "Mens Cotton Jacket", images: ["back.jpg"] },
  { match: "Mens Casual Slim", images: ["back.jpg"] },
  { match: "John Hardy", images: ["back.jpg"] },
  { match: "Solid Gold", images: ["back.jpg"] },
  { match: "White Gold", images: ["back.jpg"] },
  { match: "Pierced Owl", images: ["back.jpg"] },
  { match: "BIYLACLESEN", images: ["back.jpg"] },
  { match: "Lock and Love", images: ["back.jpg"] },
  { match: "Rain Jacket", images: ["back.jpg"] },
  { match: "MBJ Women", images: ["back.jpg"] },
  { match: "Opna Women", images: ["back.jpg"] },
  { match: "DANVOUY", images: ["back.jpg"] },
  { match: "Braun Series", images: ["Braun Series 7 Electric Shaver.jpg"] },
  { match: "Philips Series", images: ["Philips Series 3000 Wet & Dry Electric Shaver.jpg"] },
  { match: "Armaf", images: ["Armaf Club de Nuit Intense Man EDT.jpg", "Armaf Club de Nuit Intense Man EDT second.jpg"] },
  { match: "Hugo Boss", images: ["Hugo Boss Bottled Eau de Toilette.jpg"] },
  { match: "Neutrogena", images: ["Neutrogena Oil-Free Acne Wash.jpg"] },
  { match: "L'Oreal", images: ["L'Oreal Paris Revitalift Triple Power Moisturiser front.jpg", "L'Oreal Paris Revitalift Triple Power Moisturiser back.jpg"] },
  { match: "OGX", images: ["OGX Biotin & Collagen Thick & Full Shampoo.webp"] },
  { match: "Dove Deep", images: ["Dove Deep Moisture Body Wash.jpg"] },
  { match: "Ergonomic Mesh Office Chair", images: ["Ergonomic Mesh Office Chair with Lumbar Support.jpg"] },
  { match: "L-Shaped Corner Office Desk", images: ["Executive L-Shaped Corner Office Desk.avif"] },
  { match: "HP LaserJet", images: ["HP LaserJet Pro.jpg"] },
  { match: "Canon PIXMA", images: ["Canon PIXMA TS3540 Wireless All-in-One Printer.jpg"] },
  { match: "Filing Cabinet", images: ["4-Drawer Steel Filing Cabinet with Lock.jpg"] },
  { match: "Ring Light", images: ["Neewer 18 LED Ring Light Kit with 2m Stand front.jpg", "Neewer 18 LED Ring Light Kit with 2m Stand back.jpg"] },
  { match: "Desk Lamp", images: ["LED Adjustable Desk Lamp — USB Charging Port.jpg", "LED Adjustable Desk Lamp — USB Charging Port back.jpg"] },
  { match: "Laptop Stand", images: ["Adjustable Aluminium Laptop Stand.jpg"] },
  { match: "Apple Watch", images: ["Apple watch.jpg"] },
  { match: "Samsung 55", images: ["Samsung 55 Crystal UHD 4K Smart TV.jpg"] },
  { match: "Hisense 43", images: ["Hisense 43.jpg"] },
  { match: "LG 65", images: ["LG 65 C3 OLED evo Smart TV.jpg"] },
  { match: "JBL Charge", images: ["JBL Charge 5 Portable Bluetooth Speaker front.jpg", "JBL Charge 5 Portable Bluetooth Speaker back.jpg"] },
  { match: "Sony SRS", images: ["Sony SRS-XB33 Extra Bass Bluetooth Speaker front.jpg", "Sony SRS-XB33 Extra Bass Bluetooth Speaker back.jpg", "Sony SRS-XB33 Extra Bass Bluetooth Speaker features.jpg"] },
  { match: "Soundbar", images: ["Samsung HW-B650 Soundbar front.jpg", "Samsung HW-B650 Soundbar back.jpg"] },
  { match: "Anker PowerCore", images: ["Anker PowerCore 26800mAh Portable Power Bank.jpg", "Anker PowerCore 26800mAh Portable Power Bank back.jpg"] },
  { match: "WD 2TB", images: ["back.jpg"] },
  { match: "SanDisk SSD", images: ["back.jpg"] },
  { match: "Silicon Power", images: ["back.jpg"] },
  { match: "WD 4TB", images: ["back.jpg"] },
  { match: "Acer SB220Q", images: ["back.jpg"] },
  { match: "CHG90", images: ["back.jpg"] },
];

const FALLBACK = ['back.jpg'];

const products = await prisma.product.findMany({ select: { id: true, name: true } });
let updated = 0;

for (const product of products) {
  const nameLower = product.name.toLowerCase();
  const entry = imagesMap.find(e => nameLower.includes(e.match.toLowerCase()));
  const images = entry ? entry.images : FALLBACK;
  const image = images[0];

  // Use raw SQL because the old Prisma client may not have `images` typed yet
  // (prisma generate failed while server held the DLL lock — migration is applied)
  const pgArray = '{' + images.map(f => '"' + f.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"').join(',') + '}';
  await prisma.$executeRaw`UPDATE products SET images = ${pgArray}::text[], image = ${image} WHERE id = ${product.id}`;

  console.log(`✅ ${product.name}`);
  console.log(`   image : ${image}`);
  if (images.length > 1) console.log(`   images: [${images.join(', ')}]`);
  updated++;
}

console.log(`\nDone. Updated ${updated} products.`);
await prisma.$disconnect();
