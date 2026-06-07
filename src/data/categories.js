import {
  Grid2X2,
  Store,
  Shirt,
  Smartphone,
  Cpu,
  Sofa,
  HeartPulse,
  TabletSmartphone,
} from 'lucide-react';

export const CATEGORIES = [
  { name: 'All Products',     slug: 'all',            icon: Grid2X2          },
  { name: 'Official Store',   slug: 'official-store', icon: Store            },
  { name: 'Fashion',          slug: 'fashion',        icon: Shirt            },
  { name: 'Electronics',      slug: 'electronics',    icon: Smartphone       },
  { name: 'Computing',        slug: 'computing',      icon: Cpu              },
  { name: 'Home & Office',    slug: 'home-office',    icon: Sofa             },
  { name: 'Health & Beauty',  slug: 'health-beauty',  icon: HeartPulse       },
  { name: 'Phones & Tablets', slug: 'phones-tablets', icon: TabletSmartphone },
];
