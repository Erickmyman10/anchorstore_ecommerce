// All prices stored directly in ₦ at psychological price points.
// Categories: "electronics" | "fashion" | "accessories"

import productImageMap from '../utils/imageMap';

const localProducts = [
  // ── Laptops ───────────────────────────────────────────────────────────────
  {
    id: 101,
    title: 'HP Pavilion 15 Laptop — Core i5, 8GB RAM, 512GB SSD',
    price: 479999,
    category: 'electronics',
    description:
      'Versatile everyday laptop for work and study. Intel Core i5-1235U processor, 8GB DDR4 RAM, 512GB NVMe SSD, 15.6" Full HD IPS display, Windows 11 Home. Perfect for students and professionals.',
    image: productImageMap[101],
    rating: { rate: 4.3, count: 128 },
  },
  {
    id: 102,
    title: 'Lenovo IdeaPad 3 — Core i3, 4GB RAM, 256GB SSD',
    price: 279999,
    category: 'electronics',
    description:
      'Affordable and reliable computing. Intel Core i3-1115G4, 4GB DDR4 RAM, 256GB SSD, 15.6" Full HD display. Ideal for students and everyday office tasks.',
    image: productImageMap[102],
    rating: { rate: 4.0, count: 76 },
  },
  {
    id: 103,
    title: 'Dell Inspiron 15 — AMD Ryzen 5, 16GB RAM, 512GB SSD',
    price: 619999,
    category: 'electronics',
    description:
      'High-performance laptop for professionals. AMD Ryzen 5 7520U, 16GB DDR5 RAM, 512GB NVMe SSD, 15.6" FHD display, backlit keyboard. Handles multitasking and creative work with ease.',
    image: productImageMap[103],
    rating: { rate: 4.5, count: 214 },
  },

  // ── Phones ────────────────────────────────────────────────────────────────
  {
    id: 104,
    title: 'Tecno Spark 20 Pro — 256GB Storage, 8GB RAM',
    price: 134999,
    category: 'electronics',
    description:
      "Tecno's powerhouse midrange. 6.78\" AMOLED display, 50MP triple rear camera, 5000mAh battery, Android 13, Helio G99 processor. Outstanding value for money.",
    image: productImageMap[104],
    rating: { rate: 4.1, count: 342 },
  },
  {
    id: 105,
    title: 'Samsung Galaxy A55 — 128GB, 8GB RAM, IP67',
    price: 309999,
    category: 'electronics',
    description:
      'Samsung premium mid-range. 6.6" Super AMOLED 120Hz display, 50MP OIS camera, IP67 water resistance, 5000mAh battery, Samsung Knox security.',
    image: productImageMap[105],
    rating: { rate: 4.4, count: 189 },
  },
  {
    id: 106,
    title: 'Apple iPhone 14 — 128GB, Midnight',
    price: 719999,
    category: 'electronics',
    description:
      'Flagship iPhone experience. A15 Bionic chip, dual 12MP cameras with Action mode, 6.1" Super Retina XDR OLED, Ceramic Shield, Emergency SOS via satellite.',
    image: productImageMap[106],
    rating: { rate: 4.7, count: 567 },
  },

  // ── Watches ───────────────────────────────────────────────────────────────
  {
    id: 107,
    title: 'Casio G-Shock DW5600 — Classic Digital Watch',
    price: 94999,
    category: 'accessories',
    description:
      'The indestructible legend. Shock-resistant construction, 200M water resistance, EL backlight, 1/100-second stopwatch, countdown timer, World Time 29 zones.',
    image: productImageMap[107],
    rating: { rate: 4.6, count: 403 },
  },
  {
    id: 108,
    title: "Seiko 5 Sports Automatic — Men's Watch",
    price: 184999,
    category: 'accessories',
    description:
      'Timeless automatic movement. 24-jewel Seiko calibre, day-date display, stainless steel case and bracelet, 100M water resistance, scratch-resistant mineral crystal.',
    image: productImageMap[108],
    rating: { rate: 4.4, count: 156 },
  },
  {
    id: 109,
    title: 'Apple Watch Series 8 — GPS + Cellular, 45mm Midnight',
    price: 479999,
    category: 'accessories',
    description:
      'Advanced health and fitness on your wrist. Blood oxygen sensor, ECG app, crash detection, Always-On Retina display, 18-hour battery, water resistant 50M.',
    image: productImageMap[109],
    rating: { rate: 4.8, count: 712 },
  },

  // ── Jeans ─────────────────────────────────────────────────────────────────
  {
    id: 110,
    title: "Levi's 501 Original Straight Jeans — Men's",
    price: 37999,
    category: 'fashion',
    description:
      "The original and definitive jeans since 1873. Button fly, straight fit through thigh and leg, 100% cotton denim, classic 5-pocket styling. Available in multiple washes.",
    image: productImageMap[110],
    rating: { rate: 4.5, count: 892 },
  },
  {
    id: 111,
    title: "Wrangler Texas Stretch Jeans — Regular Fit, Men's",
    price: 27999,
    category: 'fashion',
    description:
      'Workhorse durability meets everyday comfort. Regular straight fit, 98% cotton 2% elastane blend, 5-pocket design, zip fly, reinforced stress points.',
    image: productImageMap[111],
    rating: { rate: 4.1, count: 234 },
  },
  {
    id: 112,
    title: "H&M Skinny High Waist Jeans — Women's",
    price: 21999,
    category: 'fashion',
    description:
      'On-trend high-waist silhouette for a flattering fit. Stretchy denim blend, skinny leg, ankle length, zip and button closure. Available in 3 wash options.',
    image: productImageMap[112],
    rating: { rate: 4.2, count: 311 },
  },
];

export default localProducts;
