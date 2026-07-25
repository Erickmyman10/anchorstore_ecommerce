// seedProducts.js
// Place this file in your server/ folder
// Run: node seedProducts.js
// Make sure your server is running on port 5000 first!

const BASE_URL = "http://localhost:5000/api";

// â”€â”€â”€ STEP 1: Login to get token â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function getToken() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Admin User",
      password: "Admin1234!",
    }),
  });
  const data = await res.json();
  if (!data.token) {
    console.error("âŒ Login failed:", data);
    process.exit(1);
  }
  console.log("âœ… Logged in successfully\n");
  return data.token;
}

// â”€â”€â”€ STEP 2: All 87 products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const products = [
  // â”€â”€ OFFICIAL STORE (8) â”€â”€
  {
    name: "Samsung Galaxy S24 Ultra â€” 256GB, Titanium Black",
    unitPrice: 1299999,
    image: "https://fakestoreapi.com/img/81fAn1_2cL._AC_SL1500_.jpg",
    description:
      "The ultimate Samsung flagship with 200MP camera, S Pen, titanium build, and AI-powered features.",
    categoryId: "cmqqt2m0f000078czta80x1hl",
  },
  {
    name: "Apple iPhone 15 Pro Max â€” 256GB, Natural Titanium",
    unitPrice: 1649999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Apple's most powerful iPhone with A17 Pro chip, titanium design, and 48MP main camera system.",
    categoryId: "cmqqt2m0f000078czta80x1hl",
  },
  {
    name: 'Samsung 65" Neo QLED 8K Smart TV â€” QN800C',
    unitPrice: 2499999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "8K resolution Neo QLED TV with Quantum Matrix Technology Pro, Neural Quantum Processor 8K.",
    categoryId: "cmqqt2m0f000078czta80x1hl",
  },
  {
    name: 'LG 55" C3 OLED evo Smart TV â€” 4K 120Hz',
    unitPrice: 999999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Self-lit OLED pixels, Î±9 AI Processor Gen6, Dolby Vision & Atmos, perfect blacks.",
    categoryId: "cmqqt2m0f000078czta80x1hl",
  },
  {
    name: "HP Spectre x360 14 â€” Core i7, 16GB, 1TB SSD",
    unitPrice: 1099999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "Premium 2-in-1 convertible laptop with OLED display, Intel Evo platform, and stunning design.",
    categoryId: "cmqqt2m0f000078czta80x1hl",
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 11 â€” i7, 16GB",
    unitPrice: 1299999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      'Business ultrabook with MIL-SPEC durability, 14" 2.8K OLED display, and all-day battery life.',
    categoryId: "cmqqt2m0f000078czta80x1hl",
  },
  {
    name: "Tecno Phantom V Fold 2 â€” 512GB, Moonlit Silver",
    unitPrice: 699999,
    image:
      "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Africa's premium foldable phone with 7.85\" inner display, 50MP triple camera, 5000mAh battery.",
    categoryId: "cmqqt2m0f000078czta80x1hl",
  },
  {
    name: 'Apple MacBook Pro M3 Pro 14" â€” 18GB, 512GB',
    unitPrice: 2099999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Apple M3 Pro chip, Liquid Retina XDR display, up to 22hr battery, pro-level performance.",
    categoryId: "cmqqt2m0f000078czta80x1hl",
  },

  // â”€â”€ PHONES & TABLETS (14) â”€â”€
  {
    name: "Tecno Spark 20 Pro â€” 256GB, 8GB RAM",
    unitPrice: 134999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      '6.78" FHD+ AMOLED display, 108MP camera, 5000mAh battery, 33W fast charge.',
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "Samsung Galaxy A55 â€” 128GB, 8GB RAM, IP67",
    unitPrice: 309999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "IP67 water resistance, 50MP OIS camera, Super AMOLED display, 5000mAh battery.",
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "Apple iPhone 14 â€” 128GB, Midnight",
    unitPrice: 719999,
    image: "https://fakestoreapi.com/img/81fAn1_2cL._AC_SL1500_.jpg",
    description:
      "A15 Bionic chip, 12MP dual camera system, Crash Detection, Emergency SOS via satellite.",
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "Samsung Galaxy A15 4G â€” 128GB, 4GB RAM",
    unitPrice: 99999,
    image:
      "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      '6.5" Super AMOLED display, 50MP triple camera, 5000mAh battery, affordable powerhouse.',
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "Infinix Hot 40 Pro 5G â€” 256GB, 8GB RAM",
    unitPrice: 89999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      '5G connectivity, 6.78" IPS display, 108MP camera, 5000mAh battery, 18W charging.',
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "Infinix Note 40 Pro 5G â€” 256GB, 12GB RAM",
    unitPrice: 149999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      '6.78" AMOLED, 108MP OIS camera, 100W wired + 20W wireless charging, 5000mAh.',
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "Tecno Camon 30 Pro 5G â€” 256GB, 8GB RAM",
    unitPrice: 159999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      '50MP Sony IMX890 front camera, 6.77" AMOLED, Dimensity 8200, 5000mAh battery.',
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "Xiaomi Redmi Note 13 4G â€” 256GB, 8GB RAM",
    unitPrice: 119999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      '108MP camera, 6.67" AMOLED 120Hz display, 5000mAh battery, Snapdragon 685.',
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "Xiaomi Redmi 13C 4G â€” 128GB, 6GB RAM",
    unitPrice: 69999,
    image:
      "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      '50MP triple camera, 6.74" IPS display, 5000mAh battery, budget-friendly performance.',
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "Apple iPad 10th Gen â€” 64GB Wi-Fi, Blue",
    unitPrice: 499999,
    image: "https://fakestoreapi.com/img/81fAn1_2cL._AC_SL1500_.jpg",
    description:
      'A14 Bionic chip, 10.9" Liquid Retina display, 12MP front camera, USB-C connectivity.',
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: 'Apple iPad Pro 12.9" M2 â€” 256GB Wi-Fi',
    unitPrice: 999999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "M2 chip, Liquid Retina XDR display, ProMotion 120Hz, Thunderbolt port, Face ID.",
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "OnePlus 12 5G â€” 256GB, 12GB RAM",
    unitPrice: 599999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      'Snapdragon 8 Gen 3, Hasselblad camera, 100W SUPERVOOC charging, 6.82" LTPO AMOLED.',
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "Nothing Phone (2a) â€” 256GB, 12GB RAM",
    unitPrice: 229999,
    image: "https://fakestoreapi.com/img/81fAn1_2cL._AC_SL1500_.jpg",
    description:
      "Unique Glyph Interface, Dimensity 7200 Pro, 50MP dual camera, 5000mAh, 45W charging.",
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },
  {
    name: "Samsung Galaxy Tab A9+ 5G â€” 64GB, 4GB RAM",
    unitPrice: 249999,
    image:
      "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      '11" TFT display, Snapdragon 695, quad speakers, DeX mode support, 7040mAh battery.',
    categoryId: "cmqqnen550001o8b0kearsz6u",
  },

  // â”€â”€ COMPUTING (3) â”€â”€
  {
    name: "HP Pavilion 15 Laptop â€” Core i5, 8GB RAM, 512GB SSD",
    unitPrice: 479999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      'Intel Core i5-1235U, 15.6" FHD IPS display, Intel Iris Xe Graphics, Windows 11 Home.',
    categoryId: "cmqqt2m0j000178cz1ibss169",
  },
  {
    name: "Lenovo IdeaPad 3 â€” Core i3, 4GB RAM, 256GB SSD",
    unitPrice: 279999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      'Intel Core i3-1215U, 15.6" FHD display, perfect entry-level laptop for students.',
    categoryId: "cmqqt2m0j000178cz1ibss169",
  },
  {
    name: "Dell Inspiron 15 â€” AMD Ryzen 5, 16GB RAM, 512GB SSD",
    unitPrice: 619999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      'AMD Ryzen 5 7530U, 15.6" FHD, AMD Radeon Graphics, fast performance for creators.',
    categoryId: "cmqqt2m0j000178cz1ibss169",
  },

  // â”€â”€ APPLIANCES (9) â”€â”€
  {
    name: "Samsung 390L Frost-Free Double Door Refrigerator",
    unitPrice: 459999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Twin Cooling Plus, All-Around Cooling, Digital Inverter Compressor, energy efficient.",
    categoryId: "cmqqnf8nb0003o8b0ohoibfnv",
  },
  {
    name: "LG 700L Side-by-Side Refrigerator â€” Instaview Door-in-Door",
    unitPrice: 899999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Knock twice to see inside without opening, Linear Cooling, smart diagnosis.",
    categoryId: "cmqqnf8nb0003o8b0ohoibfnv",
  },
  {
    name: "Hisense 250L Chest Deep Freezer â€” FC250D4BWP",
    unitPrice: 219999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "R600a refrigerant, foam door lock, fast freeze function, ideal for large families.",
    categoryId: "cmqqnf8nb0003o8b0ohoibfnv",
  },
  {
    name: "LG 9kg Front Load Washing Machine â€” AI Direct Drive",
    unitPrice: 389999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "AI technology selects optimal wash motions, 6 Motion DD, Steam technology, energy A+++.",
    categoryId: "cmqqnf8nb0003o8b0ohoibfnv",
  },
  {
    name: "Samsung 9kg Top Load Washing Machine â€” Eco Bubble",
    unitPrice: 299999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "Eco Bubble technology penetrates fabric 40x faster, Digital Inverter Motor.",
    categoryId: "cmqqnf8nb0003o8b0ohoibfnv",
  },
  {
    name: "Midea 1.5HP Split Air Conditioner â€” R32 Inverter",
    unitPrice: 299999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "R32 eco-friendly refrigerant, inverter compressor, 4-way airflow, self-cleaning function.",
    categoryId: "cmqqnf8nb0003o8b0ohoibfnv",
  },
  {
    name: "LG 2HP DualCool Premium Inverter Air Conditioner",
    unitPrice: 549999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Dual Inverter Compressor, faster cooling, wider airflow, energy savings up to 70%.",
    categoryId: "cmqqnf8nb0003o8b0ohoibfnv",
  },
  {
    name: "Nasco 25L Digital Solo Microwave Oven",
    unitPrice: 49999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "700W power, 5 power levels, digital display, 30-minute timer, 8 auto-cook programs.",
    categoryId: "cmqqnf8nb0003o8b0ohoibfnv",
  },
  {
    name: "Binatone Floor Standing Water Dispenser â€” Hot & Cold",
    unitPrice: 54999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "Hot, cold and normal water, child safety lock on hot tap, 3 colour LED indicators.",
    categoryId: "cmqqnf8nb0003o8b0ohoibfnv",
  },

  // â”€â”€ FASHION (23) â”€â”€
  {
    name: "Casio G-Shock DW5600 â€” Classic Digital Watch",
    unitPrice: 94999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Shock resistant, 200M water resistance, LED backlight, world time, stopwatch.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Seiko 5 Sports Automatic â€” Men's Watch",
    unitPrice: 184999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "Automatic movement, day-date display, 100M water resistance, stainless steel case.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Levi's 501 Original Straight Jeans â€” Men's",
    unitPrice: 37999,
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    description:
      "The original jean since 1873. Button fly, straight leg, 100% cotton denim.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Wrangler Texas Stretch Jeans â€” Regular Fit, Men's",
    unitPrice: 27999,
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    description:
      "Stretch denim for added comfort, regular fit, 5-pocket styling, zip fly.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "H&M Skinny High Waist Jeans â€” Women's",
    unitPrice: 21999,
    image: "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg",
    description:
      "High waist skinny fit, stretch denim, ankle length, 5-pocket design.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Adidas Ultraboost 22 Running Shoes",
    unitPrice: 109999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "BOOST midsole cushioning, Primeknit+ upper, Continental rubber outsole, Torsion system.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Polo Ralph Lauren Classic Fit T-Shirt",
    unitPrice: 34999,
    image:
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    description:
      "Iconic Polo pony embroidery, 100% cotton, ribbed crew neck, classic fit cut.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Tommy Hilfiger Regular Fit Polo Shirt",
    unitPrice: 44999,
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    description:
      "Pique cotton, embroidered Tommy flag logo, 3-button placket, ribbed collar and cuffs.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Zara Men Slim Fit Chino Trousers",
    unitPrice: 29999,
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    description:
      "Slim fit chino, stretch fabric, front pockets, zip fly and button closure, ankle length.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: 'Fjallraven Foldsack No.1 Backpack â€” Fits 15" Laptops',
    unitPrice: 179999,
    image: "https://fakestoreapi.com/img/81fAn1_2cL._AC_SL1500_.jpg",
    description:
      "G-1000 HeavyDuty Eco fabric, padded laptop sleeve, multiple compartments, 16L capacity.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Mens Casual Premium Slim Fit T-Shirts",
    unitPrice: 14999,
    image:
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    description:
      "Premium cotton blend, slim fit cut, crew neck, available in multiple colors and sizes.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Mens Cotton Jacket",
    unitPrice: 39999,
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    description:
      "100% cotton outer shell, zip closure, multiple pockets, casual everyday style.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Mens Casual Slim Fit",
    unitPrice: 12999,
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    description:
      "Slim fit casual wear, breathable fabric, modern cut, everyday comfortable style.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
    unitPrice: 1114999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Handcrafted in Bali, 18k gold and sterling silver, Naga dragon motif, lobster clasp.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Solid Gold Petite Micropave",
    unitPrice: 269999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "14k solid gold, micropave diamond setting, delicate design, perfect for everyday luxury.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "White Gold Plated Princess",
    unitPrice: 15999,
    image: "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg",
    description:
      "White gold plated, princess cut cubic zirconia, elegant design for any occasion.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Pierced Owl Rose Gold Plated Stainless Steel Double",
    unitPrice: 17999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "Rose gold plated stainless steel, double hoop design, hypoallergenic, lightweight.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats",
    unitPrice: 91999,
    image: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",
    description:
      "3-in-1 design, waterproof outer shell, removable inner fleece, ski pass pocket.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket",
    unitPrice: 47999,
    image: "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg",
    description:
      "Faux leather, removable hood, asymmetric zip, multiple pockets, fitted style.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Rain Jacket Women Windbreaker Striped Climbing Raincoats",
    unitPrice: 29999,
    image: "https://fakestoreapi.com/img/71HblAHs1xL._AC_UY879_-2.jpg",
    description:
      "Waterproof windbreaker, lightweight, packable, striped design, hood with adjusters.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "MBJ Women's Solid Short Sleeve Boat Neck V",
    unitPrice: 10999,
    image: "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg",
    description:
      "Boat neck design, stretchy fabric, short sleeve, flattering fit, multiple colors.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "Opna Women's Short Sleeve Moisture",
    unitPrice: 9999,
    image: "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",
    description:
      "Moisture wicking fabric, short sleeve, athletic fit, breathable for active lifestyle.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },
  {
    name: "DANVOUY Womens T Shirt Casual Cotton Short",
    unitPrice: 10999,
    image: "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg",
    description:
      "100% cotton, casual loose fit, short sleeve, comfortable everyday wear, multiple colors.",
    categoryId: "cmqqnfezg0004o8b05ciazzxm",
  },

  // â”€â”€ HEALTH & BEAUTY (8) â”€â”€
  {
    name: "Braun Series 7 Electric Shaver â€” 70-N7200cc",
    unitPrice: 89999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "SensoFlex adapts to your face, AutoSense reads beard density, Clean&Charge station included.",
    categoryId: "cmqqnl97n0008o8b011grwbwq",
  },
  {
    name: "Philips Series 3000 Wet & Dry Electric Shaver â€” S3143",
    unitPrice: 34999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "Aquatec technology for wet or dry shave, pop-up trimmer, 5-direction flex heads.",
    categoryId: "cmqqnl97n0008o8b011grwbwq",
  },
  {
    name: "Armaf Club de Nuit Intense Man EDT â€” 105ml",
    unitPrice: 24999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Inspired by Creed Aventus. Top: Lemon, Blackcurrant. Heart: Rose, Birch. Base: Ambergris.",
    categoryId: "cmqqnl97n0008o8b011grwbwq",
  },
  {
    name: "Hugo Boss Bottled Eau de Toilette â€” 100ml",
    unitPrice: 54999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "Woody spicy fragrance. Apple, cinnamon, sandalwood and vetiver. The scent of success.",
    categoryId: "cmqqnl97n0008o8b011grwbwq",
  },
  {
    name: "Neutrogena Oil-Free Acne Wash â€” 3 Pack 175ml",
    unitPrice: 9999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Salicylic acid acne treatment, oil-free formula, won't clog pores, dermatologist recommended.",
    categoryId: "cmqqnl97n0008o8b011grwbwq",
  },
  {
    name: "L'Oreal Paris Revitalift Triple Power Moisturiser â€” 50ml",
    unitPrice: 8499,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Pro-Retinol, Vitamin C & Hyaluronic Acid. Reduces wrinkles, firms and brightens skin.",
    categoryId: "cmqqnl97n0008o8b011grwbwq",
  },
  {
    name: "OGX Biotin & Collagen Thick & Full Shampoo â€” 385ml",
    unitPrice: 7499,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "Volumizing shampoo with biotin, collagen and wheat protein. Thickens fine hair.",
    categoryId: "cmqqnl97n0008o8b011grwbwq",
  },
  {
    name: "Dove Deep Moisture Body Wash â€” 3 Pack 500ml",
    unitPrice: 5999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "NutriumMoisture technology, sulfate-free, lathers into a rich creamy foam, 24hr moisture.",
    categoryId: "cmqqnl97n0008o8b011grwbwq",
  },

  // â”€â”€ HOME & OFFICE (8) â”€â”€
  {
    name: "Ergonomic Mesh Office Chair with Lumbar Support",
    unitPrice: 84999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Breathable mesh back, adjustable lumbar support, armrests and headrest, 150kg capacity.",
    categoryId: "cmqqnfywt0007o8b0g5ajlnsz",
  },
  {
    name: "Executive L-Shaped Corner Office Desk â€” 160cm",
    unitPrice: 114999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "L-shaped design, MDF top with wood grain finish, cable management, sturdy metal frame.",
    categoryId: "cmqqnfywt0007o8b0g5ajlnsz",
  },
  {
    name: "HP LaserJet Pro MFP M428fdw â€” Print Scan Copy Fax",
    unitPrice: 149999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "Fast 38ppm laser print, automatic duplex, wireless, 50-sheet ADF, fax capability.",
    categoryId: "cmqqnfywt0007o8b0g5ajlnsz",
  },
  {
    name: "Canon PIXMA TS3540 Wireless All-in-One Printer",
    unitPrice: 54999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "Print, copy, scan wirelessly, Bluetooth, mobile printing, compact design for home use.",
    categoryId: "cmqqnfywt0007o8b0g5ajlnsz",
  },
  {
    name: "4-Drawer Steel Filing Cabinet with Lock",
    unitPrice: 69999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Heavy-duty steel construction, 4 drawers with hanging rails, anti-tilt mechanism, key lock.",
    categoryId: "cmqqnfywt0007o8b0g5ajlnsz",
  },
  {
    name: 'Neewer 18" LED Ring Light Kit with 2m Stand',
    unitPrice: 24999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "3200-5500K adjustable colour temp, 10 brightness levels, includes phone holder and bag.",
    categoryId: "cmqqnfywt0007o8b0g5ajlnsz",
  },
  {
    name: "LED Adjustable Desk Lamp â€” USB Charging Port",
    unitPrice: 12999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "5 colour modes, 5 brightness levels, USB-A charging port, touch control, memory function.",
    categoryId: "cmqqnfywt0007o8b0g5ajlnsz",
  },
  {
    name: "Adjustable Aluminium Laptop Stand â€” 6-Level Height",
    unitPrice: 9999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      'Foldable aluminium, 6 height settings, anti-slip pads, compatible with 10-17" laptops.',
    categoryId: "cmqqnfywt0007o8b0g5ajlnsz",
  },

  // â”€â”€ ELECTRONICS (14) â”€â”€
  {
    name: "Apple Watch Series 8 â€” GPS + Cellular, 45mm Midnight",
    unitPrice: 479999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "Crash Detection, temperature sensor, heart rate monitor, ECG, 18hr battery, Always-On Retina.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: 'Samsung 55" Crystal UHD 4K Smart TV â€” UA55CU7000',
    unitPrice: 359999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "Crystal 4K processor, PurColor, HDR, SmartThings compatible, Motion Xcelerator.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: 'Hisense 43" FHD Smart TV â€” A4G Series VIDAA',
    unitPrice: 179999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "Full HD 1080p, VIDAA U5.0 OS, built-in Netflix & YouTube, DTS Virtual:X audio.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: 'LG 65" C3 OLED evo Smart TV â€” 4K 120Hz HDR',
    unitPrice: 1199999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "OLED evo panel, Î±9 AI Gen6 processor, Dolby Vision IQ, HDMI 2.1 x4, G-Sync compatible.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: "JBL Charge 5 Portable Bluetooth Speaker",
    unitPrice: 79999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "IP67 waterproof, 20hr playtime, USB-A power bank output, PartyBoost for stereo pairing.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: "Sony SRS-XB33 Extra Bass Bluetooth Speaker",
    unitPrice: 69999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "EXTRA BASS, IP67, 24hr battery, built-in mic, Speakerphone, multicolor line light.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: “Samsung HW-B650 Soundbar â€” 3.1ch Dolby Atmos”,
    unitPrice: 279999,
    image:
      "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg",
    description:
      "430W, 3.1 channel, Dolby Atmos, DTS:X, SpaceFit Sound, wireless subwoofer included.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: "Anker PowerCore 26800mAh Portable Power Bank",
    unitPrice: 34999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "26800mAh, dual USB-A + USB-C, 65W PD output, charges MacBook Pro and phones simultaneously.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: “WD 2TB Elements Portable External Hard Drive â€” USB 3.0”,
    unitPrice: 79999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "USB 3.0 speed, bus-powered (no adapter needed), plug-and-play, WD Backup compatible.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: "SanDisk SSD PLUS 1TB Internal SSD â€” SATA III 6 Gb/s",
    unitPrice: 174999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      'Up to 535MB/s read, 2.5" form factor, SATA III, up to 3x faster than HDD.',
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: 'Silicon Power 256GB SSD 3D NAND A55 â€” SATA III 2.5”',
    unitPrice: 34999,
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    description:
      "3D NAND flash, SLC cache performance boost, up to 560/530 MB/s read/write, 3yr warranty.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: "WD 4TB Gaming Drive â€” Works with PlayStation 4",
    unitPrice: 184999,
    image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
    description:
      "Plug-and-play with PS4/PS4 Pro, USB 3.0, store 100+ games, compact portable design.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: 'Acer SB220Q 21.5" Full HD IPS Ultra-Thin Monitor',
    unitPrice: 129999,
    image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
    description:
      "1920x1080 IPS panel, 75Hz, 1ms VRB, AMD FreeSync, HDMI & VGA ports, frameless design.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
  {
    name: 'Samsung 49" CHG90 144Hz Curved Gaming Monitor â€” Super Ultrawide QLED',
    unitPrice: 1599999,
    image: "https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",
    description:
      "32:9 ratio, 144Hz, QLED, HDR600, AMD FreeSync 2, 1ms response, dual HDMI 2.0.",
    categoryId: "cmqqt2m0n000278czkqa9id6t",
  },
];

// â”€â”€â”€ STEP 3: Seed all products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function seedProducts() {
  const token = await getToken();
  let success = 0;
  let failed = 0;

  console.log(`ðŸš€ Starting to seed ${products.length} products...\n`);

  for (const product of products) {
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      const data = await res.json();

      if (res.ok) {
        success++;
        console.log(`âœ… [${success}] ${product.name}`);
      } else {
        failed++;
        console.error(`âŒ FAILED: ${product.name}`);
        console.error(`   Error:`, data);
      }
    } catch (err) {
      failed++;
      console.error(`âŒ NETWORK ERROR: ${product.name}`, err.message);
    }
  }

  console.log(`\n${"â”€".repeat(50)}`);
  console.log(`âœ… Success: ${success} products seeded`);
  console.log(`âŒ Failed:  ${failed} products`);
  console.log(`ðŸ"¦ Total:   ${products.length} products`);
  console.log(`${"â”€".repeat(50)}`);
}

seedProducts();
