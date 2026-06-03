// ── Product images ──────────────────────────────────────────────────────────
import hpPavilion      from '../Images/products/HP Pavilion laptop.jpg';
import lenovoIdeaPad   from '../Images/products/Lenovo Idealpad3.jpg';
import dellInspiron    from '../Images/products/Dell Inspiron.jpg';
import tecnoSpark      from '../Images/products/Tecno spark20 pro.jpg';
import samsungA55      from '../Images/products/Samsung Galaxy A55.jpg';
import iphone14        from '../Images/products/Iphone 14.jpg';
import gShock          from '../Images/products/G shock.jpg';
import seikoWatch      from '../Images/products/Seiko mens watch.jpg';
import appleWatch      from '../Images/products/Apple watch.jpg';
import jeanFront       from '../Images/products/Jean front.jpg';
import wranglerFront   from '../Images/products/Wrangler jean front.jpg';
import skinnyjeanWomen from '../Images/products/Skinny jean women.jpg';

// ── Category card images ─────────────────────────────────────────────────────
import electronicsCard from '../Images/card/Electronic card.png';
import fashionCard     from '../Images/card/Fashion card.png';
import accessoriesCard from '../Images/card/Accessories card.png';

// ── Hero banner images ───────────────────────────────────────────────────────
import banner1 from '../Images/banners/Hero banner1.png';
import banner2 from '../Images/banners/hero banner 2.png';

// Keyed by local product ID (101–112)
const productImageMap = {
  101: hpPavilion,
  102: lenovoIdeaPad,
  103: dellInspiron,
  104: tecnoSpark,
  105: samsungA55,
  106: iphone14,
  107: gShock,
  108: seikoWatch,
  109: appleWatch,
  110: jeanFront,
  111: wranglerFront,
  112: skinnyjeanWomen,
};

export const categoryImages = {
  electronics: electronicsCard,
  fashion:     fashionCard,
  accessories: accessoriesCard,
};

export const bannerImages = [banner1, banner2];

/** Returns the imported image asset for a local product ID, or null. */
export function getProductImage(productId) {
  return productImageMap[productId] ?? null;
}

export default productImageMap;
