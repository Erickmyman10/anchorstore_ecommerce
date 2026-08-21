// seedProducts.js
// Run: node seedProducts.js
// Seeds categories (if missing) and all products against the target API.
//
// Usage:
//   SEED_BASE_URL=https://anchorstoreecommerce-production.up.railway.app/api \
//   SEED_ADMIN_USERNAME=anchoradmin \
//   SEED_ADMIN_PASSWORD=Admin@2026! \
//   SEED_ADMIN_CODE=ANCHOR-ADMIN-2026-SAMUEL \
//   node seedProducts.js
//
// Defaults below already point at the live Railway API and the admin
// credentials from the deployment notes, so this also works with no env vars set.

const BASE_URL = process.env.SEED_BASE_URL || "https://anchorstoreecommerce-production.up.railway.app/api";
const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || "anchoradmin";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@2026!";
const ADMIN_CODE = process.env.SEED_ADMIN_CODE || "ANCHOR-ADMIN-2026-SAMUEL";

// ─── STEP 1: Login to get an admin token ──────────────────────────────────────
async function getToken() {
  const res = await fetch(`${BASE_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      adminCode: ADMIN_CODE,
    }),
  });
  const data = await res.json();
  if (!data.token) {
    console.error("FAILED: Admin login failed:", data);
    console.error("Make sure the admin user exists in this database first (run seedAdmin.js against it).");
    process.exit(1);
  }
  console.log("✅ Logged in as admin successfully\n");
  return data.token;
}

// ─── STEP 1b: Ensure all required categories exist, return name -> id map ─────
const REQUIRED_CATEGORIES = [
  "Official Store",
  "Phones & Tablets",
  "Computing",
  "Appliances",
  "Fashion",
  "Health & Beauty",
  "Home & Office",
  "Electronics",
];

async function ensureCategories(token) {
  const res = await fetch(`${BASE_URL}/categories`);
  const existing = await res.json();
  const map = {};
  for (const c of existing) map[c.name] = c.id;

  for (const name of REQUIRED_CATEGORIES) {
    if (map[name]) {
      console.log(`Category exists: ${name} -> ${map[name]}`);
      continue;
    }
    const createRes = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    const created = await createRes.json();
    if (!created.id) {
      console.error(`FAILED to create category ${name}:`, created);
      process.exit(1);
    }
    map[name] = created.id;
    console.log(`Category created: ${name} -> ${created.id}`);
  }
  return map;
}

// ─── STEP 2: All 87 products ──────────────────────────────────────────────────
const products = [
  // ── OFFICIAL STORE (8) ──
  {
    name: "Samsung Galaxy S24 Ultra — 256GB, Titanium Black",
    unitPrice: 1299999,
    image: "https://fakestoreapi.com/img/81fAn1_2cL._AC_SL1500_.jpg",
    description:
      "The ultimate Samsung flagship with 200MP camera, S Pen, titanium build, and AI-powered features.",
    categoryName: "Official Store",
  },
  {
    name: "Apple iPhone 15 Pro Max — 256GB, Natural Titanium",
    unitPrice: 1649999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Apple's most powerful iPhone with A17 Pro chip, titanium design, and 48MP main camera system.",
    categoryName: "Official Store",
  },
  {
    name: 'Samsung 65" Neo QLED 8K Smart TV — QN800C',
    unitPrice: 2499999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "8K resolution Neo QLED TV with Quantum Matrix Technology Pro, Neural Quantum Processor 8K.",
    categoryName: "Official Store",
  },
  {
    name: 'LG 55" C3 OLED evo Smart TV — 4K 120Hz',
    unitPrice: 999999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Self-lit OLED pixels, α9 AI Processor Gen6, Dolby Vision & Atmos, perfect blacks.",
    categoryName: "Official Store",
  },
  {
    name: "HP Spectre x360 14 — Core i7, 16GB, 1TB SSD",
    unitPrice: 1099999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "Premium 2-in-1 convertible laptop with OLED display, Intel Evo platform, and stunning design.",
    categoryName: "Official Store",
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 11 — i7, 16GB",
    unitPrice: 1299999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      'Business ultrabook with MIL-SPEC durability, 14" 2.8K OLED display, and all-day battery life.',
    categoryName: "Official Store",
  },
  {
    name: "Tecno Phantom V Fold 2 — 512GB, Moonlit Silver",
    unitPrice: 699999,
    image:
      "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Africa's premium foldable phone with 7.85\" inner display, 50MP triple camera, 5000mAh battery.",
    categoryName: "Official Store",
  },
  {
    name: 'Apple MacBook Pro M3 Pro 14" — 18GB, 512GB',
    unitPrice: 2099999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Apple M3 Pro chip, Liquid Retina XDR display, up to 22hr battery, pro-level performance.",
    categoryName: "Official Store",
  },

  // ── PHONES & TABLETS (14) ──
  {
    name: "Tecno Spark 20 Pro — 256GB, 8GB RAM",
    unitPrice: 134999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      '6.78" FHD+ AMOLED display, 108MP camera, 5000mAh battery, 33W fast charge.',
    categoryName: "Phones & Tablets",
  },
  {
    name: "Samsung Galaxy A55 — 128GB, 8GB RAM, IP67",
    unitPrice: 309999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "IP67 water resistance, 50MP OIS camera, Super AMOLED display, 5000mAh battery.",
    categoryName: "Phones & Tablets",
  },
  {
    name: "Apple iPhone 14 — 128GB, Midnight",
    unitPrice: 719999,
    image: "https://fakestoreapi.com/img/81fAn1_2cL._AC_SL1500_.jpg",
    description:
      "A15 Bionic chip, 12MP dual camera system, Crash Detection, Emergency SOS via satellite.",
    categoryName: "Phones & Tablets",
  },
  {
    name: "Samsung Galaxy A15 4G — 128GB, 4GB RAM",
    unitPrice: 99999,
    image:
      "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      '6.5" Super AMOLED display, 50MP triple camera, 5000mAh battery, affordable powerhouse.',
    categoryName: "Phones & Tablets",
  },
  {
    name: "Infinix Hot 40 Pro 5G — 256GB, 8GB RAM",
    unitPrice: 89999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      '5G connectivity, 6.78" IPS display, 108MP camera, 5000mAh battery, 18W charging.',
    categoryName: "Phones & Tablets",
  },
  {
    name: "Infinix Note 40 Pro 5G — 256GB, 12GB RAM",
    unitPrice: 149999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      '6.78" AMOLED, 108MP OIS camera, 100W wired + 20W wireless charging, 5000mAh.',
    categoryName: "Phones & Tablets",
  },
  {
    name: "Tecno Camon 30 Pro 5G — 256GB, 8GB RAM",
    unitPrice: 159999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      '50MP Sony IMX890 front camera, 6.77" AMOLED, Dimensity 8200, 5000mAh battery.',
    categoryName: "Phones & Tablets",
  },
  {
    name: "Xiaomi Redmi Note 13 4G — 256GB, 8GB RAM",
    unitPrice: 119999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      '108MP camera, 6.67" AMOLED 120Hz display, 5000mAh battery, Snapdragon 685.',
    categoryName: "Phones & Tablets",
  },
  {
    name: "Xiaomi Redmi 13C 4G — 128GB, 6GB RAM",
    unitPrice: 69999,
    image:
      "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      '50MP triple camera, 6.74" IPS display, 5000mAh battery, budget-friendly performance.',
    categoryName: "Phones & Tablets",
  },
  {
    name: "Apple iPad 10th Gen — 64GB Wi-Fi, Blue",
    unitPrice: 499999,
    image: "https://fakestoreapi.com/img/81fAn1_2cL._AC_SL1500_.jpg",
    description:
      'A14 Bionic chip, 10.9" Liquid Retina display, 12MP front camera, USB-C connectivity.',
    categoryName: "Phones & Tablets",
  },
  {
    name: 'Apple iPad Pro 12.9" M2 — 256GB Wi-Fi',
    unitPrice: 999999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "M2 chip, Liquid Retina XDR display, ProMotion 120Hz, Thunderbolt port, Face ID.",
    categoryName: "Phones & Tablets",
  },
  {
    name: "OnePlus 12 5G — 256GB, 12GB RAM",
    unitPrice: 599999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      'Snapdragon 8 Gen 3, Hasselblad camera, 100W SUPERVOOC charging, 6.82" LTPO AMOLED.',
    categoryName: "Phones & Tablets",
  },
  {
    name: "Nothing Phone (2a) — 256GB, 12GB RAM",
    unitPrice: 229999,
    image: "https://fakestoreapi.com/img/81fAn1_2cL._AC_SL1500_.jpg",
    description:
      "Unique Glyph Interface, Dimensity 7200 Pro, 50MP dual camera, 5000mAh, 45W charging.",
    categoryName: "Phones & Tablets",
  },
  {
    name: "Samsung Galaxy Tab A9+ 5G — 64GB, 4GB RAM",
    unitPrice: 249999,
    image:
      "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      '11" TFT display, Snapdragon 695, quad speakers, DeX mode support, 7040mAh battery.',
    categoryName: "Phones & Tablets",
  },

  // ── COMPUTING (3) ──
  {
    name: "HP Pavilion 15 Laptop — Core i5, 8GB RAM, 512GB SSD",
    unitPrice: 479999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      'Intel Core i5-1235U, 15.6" FHD IPS display, Intel Iris Xe Graphics, Windows 11 Home.',
    categoryName: "Computing",
  },
  {
    name: "Lenovo IdeaPad 3 — Core i3, 4GB RAM, 256GB SSD",
    unitPrice: 279999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      'Intel Core i3-1215U, 15.6" FHD display, perfect entry-level laptop for students.',
    categoryName: "Computing",
  },
  {
    name: "Dell Inspiron 15 — AMD Ryzen 5, 16GB RAM, 512GB SSD",
    unitPrice: 619999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      'AMD Ryzen 5 7530U, 15.6" FHD, AMD Radeon Graphics, fast performance for creators.',
    categoryName: "Computing",
  },

  // ── APPLIANCES (9) ──
  {
    name: "Samsung 390L Frost-Free Double Door Refrigerator",
    unitPrice: 459999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Twin Cooling Plus, All-Around Cooling, Digital Inverter Compressor, energy efficient.",
    categoryName: "Appliances",
  },
  {
    name: "LG 700L Side-by-Side Refrigerator — Instaview Door-in-Door",
    unitPrice: 899999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Knock twice to see inside without opening, Linear Cooling, smart diagnosis.",
    categoryName: "Appliances",
  },
  {
    name: "Hisense 250L Chest Deep Freezer — FC250D4BWP",
    unitPrice: 219999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "R600a refrigerant, foam door lock, fast freeze function, ideal for large families.",
    categoryName: "Appliances",
  },
  {
    name: "LG 9kg Front Load Washing Machine — AI Direct Drive",
    unitPrice: 389999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "AI technology selects optimal wash motions, 6 Motion DD, Steam technology, energy A+++.",
    categoryName: "Appliances",
  },
  {
    name: "Samsung 9kg Top Load Washing Machine — Eco Bubble",
    unitPrice: 299999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "Eco Bubble technology penetrates fabric 40x faster, Digital Inverter Motor.",
    categoryName: "Appliances",
  },
  {
    name: "Midea 1.5HP Split Air Conditioner — R32 Inverter",
    unitPrice: 299999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "R32 eco-friendly refrigerant, inverter compressor, 4-way airflow, self-cleaning function.",
    categoryName: "Appliances",
  },
  {
    name: "LG 2HP DualCool Premium Inverter Air Conditioner",
    unitPrice: 549999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Dual Inverter Compressor, faster cooling, wider airflow, energy savings up to 70%.",
    categoryName: "Appliances",
  },
  {
    name: "Nasco 25L Digital Solo Microwave Oven",
    unitPrice: 49999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "700W power, 5 power levels, digital display, 30-minute timer, 8 auto-cook programs.",
    categoryName: "Appliances",
  },
  {
    name: "Binatone Floor Standing Water Dispenser — Hot & Cold",
    unitPrice: 54999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "Hot, cold and normal water, child safety lock on hot tap, 3 colour LED indicators.",
    categoryName: "Appliances",
  },

  // ── FASHION (23) ──
  {
    name: "Casio G-Shock DW5600 — Classic Digital Watch",
    unitPrice: 94999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Shock resistant, 200M water resistance, LED backlight, world time, stopwatch.",
    categoryName: "Fashion",
  },
  {
    name: "Seiko 5 Sports Automatic — Men's Watch",
    unitPrice: 184999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "Automatic movement, day-date display, 100M water resistance, stainless steel case.",
    categoryName: "Fashion",
  },
  {
    name: "Levi's 501 Original Straight Jeans — Men's",
    unitPrice: 37999,
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    description:
      "The original jean since 1873. Button fly, straight leg, 100% cotton denim.",
    categoryName: "Fashion",
  },
  {
    name: "Wrangler Texas Stretch Jeans — Regular Fit, Men's",
    unitPrice: 27999,
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    description:
      "Stretch denim for added comfort, regular fit, 5-pocket styling, zip fly.",
    categoryName: "Fashion",
  },
  {
    name: "H&M Skinny High Waist Jeans — Women's",
    unitPrice: 21999,
    image: "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg",
    description:
      "High waist skinny fit, stretch denim, ankle length, 5-pocket design.",
    categoryName: "Fashion",
  },
  {
    name: "Adidas Ultraboost 22 Running Shoes",
    unitPrice: 109999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "BOOST midsole cushioning, Primeknit+ upper, Continental rubber outsole, Torsion system.",
    categoryName: "Fashion",
  },
  {
    name: "Polo Ralph Lauren Classic Fit T-Shirt",
    unitPrice: 34999,
    image:
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    description:
      "Iconic Polo pony embroidery, 100% cotton, ribbed crew neck, classic fit cut.",
    categoryName: "Fashion",
  },
  {
    name: "Tommy Hilfiger Regular Fit Polo Shirt",
    unitPrice: 44999,
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    description:
      "Pique cotton, embroidered Tommy flag logo, 3-button placket, ribbed collar and cuffs.",
    categoryName: "Fashion",
  },
  {
    name: "Zara Men Slim Fit Chino Trousers",
    unitPrice: 29999,
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    description:
      "Slim fit chino, stretch fabric, front pockets, zip fly and button closure, ankle length.",
    categoryName: "Fashion",
  },
  {
    name: 'Fjallraven Foldsack No.1 Backpack — Fits 15" Laptops',
    unitPrice: 179999,
    image: "https://fakestoreapi.com/img/81fAn1_2cL._AC_SL1500_.jpg",
    description:
      "G-1000 HeavyDuty Eco fabric, padded laptop sleeve, multiple compartments, 16L capacity.",
    categoryName: "Fashion",
  },
  {
    name: "Mens Casual Premium Slim Fit T-Shirts",
    unitPrice: 14999,
    image:
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    description:
      "Premium cotton blend, slim fit cut, crew neck, available in multiple colors and sizes.",
    categoryName: "Fashion",
  },
  {
    name: "Mens Cotton Jacket",
    unitPrice: 39999,
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    description:
      "100% cotton outer shell, zip closure, multiple pockets, casual everyday style.",
    categoryName: "Fashion",
  },
  {
    name: "Mens Casual Slim Fit",
    unitPrice: 12999,
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    description:
      "Slim fit casual wear, breathable fabric, modern cut, everyday comfortable style.",
    categoryName: "Fashion",
  },
  {
    name: "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
    unitPrice: 1114999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Handcrafted in Bali, 18k gold and sterling silver, Naga dragon motif, lobster clasp.",
    categoryName: "Fashion",
  },
  {
    name: "Solid Gold Petite Micropave",
    unitPrice: 269999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "14k solid gold, micropave diamond setting, delicate design, perfect for everyday luxury.",
    categoryName: "Fashion",
  },
  {
    name: "White Gold Plated Princess",
    unitPrice: 15999,
    image: "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg",
    description:
      "White gold plated, princess cut cubic zirconia, elegant design for any occasion.",
    categoryName: "Fashion",
  },
  {
    name: "Pierced Owl Rose Gold Plated Stainless Steel Double",
    unitPrice: 17999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "Rose gold plated stainless steel, double hoop design, hypoallergenic, lightweight.",
    categoryName: "Fashion",
  },
  {
    name: "BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats",
    unitPrice: 91999,
    image: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",
    description:
      "3-in-1 design, waterproof outer shell, removable inner fleece, ski pass pocket.",
    categoryName: "Fashion",
  },
  {
    name: "Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket",
    unitPrice: 47999,
    image: "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg",
    description:
      "Faux leather, removable hood, asymmetric zip, multiple pockets, fitted style.",
    categoryName: "Fashion",
  },
  {
    name: "Rain Jacket Women Windbreaker Striped Climbing Raincoats",
    unitPrice: 29999,
    image: "https://fakestoreapi.com/img/71HblAHs1xL._AC_UY879_-2.jpg",
    description:
      "Waterproof windbreaker, lightweight, packable, striped design, hood with adjusters.",
    categoryName: "Fashion",
  },
  {
    name: "MBJ Women's Solid Short Sleeve Boat Neck V",
    unitPrice: 10999,
    image: "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg",
    description:
      "Boat neck design, stretchy fabric, short sleeve, flattering fit, multiple colors.",
    categoryName: "Fashion",
  },
  {
    name: "Opna Women's Short Sleeve Moisture",
    unitPrice: 9999,
    image: "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",
    description:
      "Moisture wicking fabric, short sleeve, athletic fit, breathable for active lifestyle.",
    categoryName: "Fashion",
  },
  {
    name: "DANVOUY Womens T Shirt Casual Cotton Short",
    unitPrice: 10999,
    image: "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg",
    description:
      "100% cotton, casual loose fit, short sleeve, comfortable everyday wear, multiple colors.",
    categoryName: "Fashion",
  },

  // ── HEALTH & BEAUTY (8) ──
  {
    name: "Braun Series 7 Electric Shaver — 70-N7200cc",
    unitPrice: 89999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "SensoFlex adapts to your face, AutoSense reads beard density, Clean&Charge station included.",
    categoryName: "Health & Beauty",
  },
  {
    name: "Philips Series 3000 Wet & Dry Electric Shaver — S3143",
    unitPrice: 34999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "Aquatec technology for wet or dry shave, pop-up trimmer, 5-direction flex heads.",
    categoryName: "Health & Beauty",
  },
  {
    name: "Armaf Club de Nuit Intense Man EDT — 105ml",
    unitPrice: 24999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Inspired by Creed Aventus. Top: Lemon, Blackcurrant. Heart: Rose, Birch. Base: Ambergris.",
    categoryName: "Health & Beauty",
  },
  {
    name: "Hugo Boss Bottled Eau de Toilette — 100ml",
    unitPrice: 54999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "Woody spicy fragrance. Apple, cinnamon, sandalwood and vetiver. The scent of success.",
    categoryName: "Health & Beauty",
  },
  {
    name: "Neutrogena Oil-Free Acne Wash — 3 Pack 175ml",
    unitPrice: 9999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Salicylic acid acne treatment, oil-free formula, won't clog pores, dermatologist recommended.",
    categoryName: "Health & Beauty",
  },
  {
    name: "L'Oreal Paris Revitalift Triple Power Moisturiser — 50ml",
    unitPrice: 8499,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Pro-Retinol, Vitamin C & Hyaluronic Acid. Reduces wrinkles, firms and brightens skin.",
    categoryName: "Health & Beauty",
  },
  {
    name: "OGX Biotin & Collagen Thick & Full Shampoo — 385ml",
    unitPrice: 7499,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "Volumizing shampoo with biotin, collagen and wheat protein. Thickens fine hair.",
    categoryName: "Health & Beauty",
  },
  {
    name: "Dove Deep Moisture Body Wash — 3 Pack 500ml",
    unitPrice: 5999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "NutriumMoisture technology, sulfate-free, lathers into a rich creamy foam, 24hr moisture.",
    categoryName: "Health & Beauty",
  },

  // ── HOME & OFFICE (8) ──
  {
    name: "Ergonomic Mesh Office Chair with Lumbar Support",
    unitPrice: 84999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Breathable mesh back, adjustable lumbar support, armrests and headrest, 150kg capacity.",
    categoryName: "Home & Office",
  },
  {
    name: "Executive L-Shaped Corner Office Desk — 160cm",
    unitPrice: 114999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "L-shaped design, MDF top with wood grain finish, cable management, sturdy metal frame.",
    categoryName: "Home & Office",
  },
  {
    name: "HP LaserJet Pro MFP M428fdw — Print Scan Copy Fax",
    unitPrice: 149999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "Fast 38ppm laser print, automatic duplex, wireless, 50-sheet ADF, fax capability.",
    categoryName: "Home & Office",
  },
  {
    name: "Canon PIXMA TS3540 Wireless All-in-One Printer",
    unitPrice: 54999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "Print, copy, scan wirelessly, Bluetooth, mobile printing, compact design for home use.",
    categoryName: "Home & Office",
  },
  {
    name: "4-Drawer Steel Filing Cabinet with Lock",
    unitPrice: 69999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Heavy-duty steel construction, 4 drawers with hanging rails, anti-tilt mechanism, key lock.",
    categoryName: "Home & Office",
  },
  {
    name: 'Neewer 18" LED Ring Light Kit with 2m Stand',
    unitPrice: 24999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "3200-5500K adjustable colour temp, 10 brightness levels, includes phone holder and bag.",
    categoryName: "Home & Office",
  },
  {
    name: "LED Adjustable Desk Lamp — USB Charging Port",
    unitPrice: 12999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "5 colour modes, 5 brightness levels, USB-A charging port, touch control, memory function.",
    categoryName: "Home & Office",
  },
  {
    name: "Adjustable Aluminium Laptop Stand — 6-Level Height",
    unitPrice: 9999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      'Foldable aluminium, 6 height settings, anti-slip pads, compatible with 10-17" laptops.',
    categoryName: "Home & Office",
  },

  // ── ELECTRONICS (14) ──
  {
    name: "Apple Watch Series 8 — GPS + Cellular, 45mm Midnight",
    unitPrice: 479999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Crash Detection, temperature sensor, heart rate monitor, ECG, 18hr battery, Always-On Retina.",
    categoryName: "Electronics",
  },
  {
    name: 'Samsung 55" Crystal UHD 4K Smart TV — UA55CU7000',
    unitPrice: 359999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Crystal 4K processor, PurColor, HDR, SmartThings compatible, Motion Xcelerator.",
    categoryName: "Electronics",
  },
  {
    name: 'Hisense 43" FHD Smart TV — A4G Series VIDAA',
    unitPrice: 179999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "Full HD 1080p, VIDAA U5.0 OS, built-in Netflix & YouTube, DTS Virtual:X audio.",
    categoryName: "Electronics",
  },
  {
    name: 'LG 65" C3 OLED evo Smart TV — 4K 120Hz HDR',
    unitPrice: 1199999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "OLED evo panel, α9 AI Gen6 processor, Dolby Vision IQ, HDMI 2.1 x4, G-Sync compatible.",
    categoryName: "Electronics",
  },
  {
    name: "JBL Charge 5 Portable Bluetooth Speaker",
    unitPrice: 79999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "IP67 waterproof, 20hr playtime, USB-A power bank output, PartyBoost for stereo pairing.",
    categoryName: "Electronics",
  },
  {
    name: "Sony SRS-XB33 Extra Bass Bluetooth Speaker",
    unitPrice: 69999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "EXTRA BASS, IP67, 24hr battery, built-in mic, Speakerphone, multicolor line light.",
    categoryName: "Electronics",
  },
  {
    name: "Samsung HW-B650 Soundbar — 3.1ch Dolby Atmos",
    unitPrice: 279999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "430W, 3.1 channel, Dolby Atmos, DTS:X, SpaceFit Sound, wireless subwoofer included.",
    categoryName: "Electronics",
  },
  {
    name: "Anker PowerCore 26800mAh Portable Power Bank",
    unitPrice: 34999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "26800mAh, dual USB-A + USB-C, 65W PD output, charges MacBook Pro and phones simultaneously.",
    categoryName: "Electronics",
  },
  {
    name: "WD 2TB Elements Portable External Hard Drive — USB 3.0",
    unitPrice: 79999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "USB 3.0 speed, bus-powered (no adapter needed), plug-and-play, WD Backup compatible.",
    categoryName: "Electronics",
  },
  {
    name: "SanDisk SSD PLUS 1TB Internal SSD — SATA III 6 Gb/s",
    unitPrice: 174999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      'Up to 535MB/s read, 2.5" form factor, SATA III, up to 3x faster than HDD.',
    categoryName: "Electronics",
  },
  {
    name: 'Silicon Power 256GB SSD 3D NAND A55 — SATA III 2.5"',
    unitPrice: 34999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "3D NAND flash, SLC cache performance boost, up to 560/530 MB/s read/write, 3yr warranty.",
    categoryName: "Electronics",
  },
  {
    name: "WD 4TB Gaming Drive — Works with PlayStation 4",
    unitPrice: 184999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "Plug-and-play with PS4/PS4 Pro, USB 3.0, store 100+ games, compact portable design.",
    categoryName: "Electronics",
  },
  {
    name: 'Acer SB220Q 21.5" Full HD IPS Ultra-Thin Monitor',
    unitPrice: 129999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "1920x1080 IPS panel, 75Hz, 1ms VRB, AMD FreeSync, HDMI & VGA ports, frameless design.",
    categoryName: "Electronics",
  },
  {
    name: 'Samsung 49" CHG90 144Hz Curved Gaming Monitor — Super Ultrawide QLED',
    unitPrice: 1599999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "32:9 ratio, 144Hz, QLED, HDR600, AMD FreeSync 2, 1ms response, dual HDMI 2.0.",
    categoryName: "Electronics",
  },
];

// ─── STEP 3: Seed all products ────────────────────────────────────────────────
async function seedProducts() {
  const token = await getToken();
  const categoryMap = await ensureCategories(token);
  let success = 0;
  let failed = 0;

  console.log(`\n🚀 Starting to seed ${products.length} products...\n`);

  for (const { categoryName, ...product } of products) {
    const categoryId = categoryMap[categoryName];
    if (!categoryId) {
      failed++;
      console.error(`FAILED: ${product.name} — unknown category "${categoryName}"`);
      continue;
    }

    try {
      const res = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...product, categoryId }),
      });

      const data = await res.json();

      if (res.ok) {
        success++;
        console.log(`✅ [${success}] ${product.name}`);
      } else {
        failed++;
        console.error(`FAILED: ${product.name}`);
        console.error(`   Error:`, data);
      }
    } catch (err) {
      failed++;
      console.error(`NETWORK ERROR: ${product.name}`, err.message);
    }
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Success: ${success} products seeded`);
  console.log(`Failed:  ${failed} products`);
  console.log(`Total:   ${products.length} products`);
  console.log(`${"─".repeat(50)}`);
}

seedProducts();
