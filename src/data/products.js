export const categories = [
  { id: 'all', name: 'All Products', count: 48 },
  { id: 'electronics', name: 'Electronics', count: 12 },
  { id: 'clothing', name: 'Clothing', count: 16 },
  { id: 'home', name: 'Home & Living', count: 10 },
  { id: 'sports', name: 'Sports', count: 10 },
];

export const products = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 299, rating: '4.8' },
  { id: 2, name: 'Running Jacket', category: 'Clothing', price: 89, rating: '4.3' },
  { id: 3, name: 'Desk Lamp', category: 'Home & Living', price: 45, rating: '4.6' },
  { id: 4, name: 'Yoga Mat', category: 'Sports', price: 35, rating: '4.7' },
  { id: 5, name: 'Smart Watch', category: 'Electronics', price: 199, rating: '4.5' },
  { id: 6, name: 'Denim Jacket', category: 'Clothing', price: 79, rating: '4.2' },
  { id: 7, name: 'Coffee Maker', category: 'Home & Living', price: 129, rating: '4.4' },
  { id: 8, name: 'Tennis Racket', category: 'Sports', price: 65, rating: '4.1' },
  { id: 9, name: 'Bluetooth Speaker', category: 'Electronics', price: 149, rating: '4.6' },
  { id: 10, name: 'Casual Sneakers', category: 'Clothing', price: 99, rating: '4.3' },
  { id: 11, name: 'Throw Pillow Set', category: 'Home & Living', price: 55, rating: '4.5' },
  { id: 12, name: 'Gym Gloves', category: 'Sports', price: 25, rating: '4.0' },
];

export const featuredProducts = products.slice(0, 4);
