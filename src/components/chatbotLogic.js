// ─────────────────────────────────────────────────────────────────
//  Chatbot Intent + Reply Engine  —  frontend-only simulation
//
//  getBotReply() returns: { text: string, products?: Product[] }
//
//  🔌 future API hook: replace getBotReply() body with your
//     fetch/axios call to the AI backend / OpenAI of your choice.
// ─────────────────────────────────────────────────────────────────

import localProducts from '../data/localProducts';

// ── Helpers ───────────────────────────────────────────────────────

export const fmt = (price) => `₦${price.toLocaleString('en-NG')}`;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Product Search ─────────────────────────────────────────────────

const CATEGORY_ALIASES = {
  phone: 'phones-tablets', phones: 'phones-tablets', mobile: 'phones-tablets',
  smartphone: 'phones-tablets', tablet: 'phones-tablets', ipad: 'phones-tablets',
  laptop: 'computing', computer: 'computing', pc: 'computing', notebook: 'computing',
  tv: 'electronics', television: 'electronics', speaker: 'electronics',
  headphone: 'electronics', powerbank: 'electronics', 'power bank': 'electronics',
  fridge: 'appliances', refrigerator: 'appliances', freezer: 'appliances',
  washer: 'appliances', washing: 'appliances', ac: 'appliances', aircon: 'appliances',
  microwave: 'appliances', dispenser: 'appliances',
  perfume: 'health-beauty', fragrance: 'health-beauty', cologne: 'health-beauty',
  shaver: 'health-beauty', skincare: 'health-beauty', shampoo: 'health-beauty',
  chair: 'home-office', desk: 'home-office', printer: 'home-office', lamp: 'home-office',
  watch: 'fashion', jeans: 'fashion', shirt: 'fashion', shoe: 'fashion',
  shoes: 'fashion', sneaker: 'fashion', polo: 'fashion', chino: 'fashion',
};

function findProducts(message) {
  const text  = message.toLowerCase();
  const words = text.split(/\s+/);

  const resolvedCategory = Object.entries(CATEGORY_ALIASES).find(
    ([alias]) => text.includes(alias)
  )?.[1];

  const results = localProducts.filter((p) => {
    const titleLower = p.title.toLowerCase();
    const brandLower = p.brand?.toLowerCase() ?? '';
    const catLower   = p.category.toLowerCase();

    if (resolvedCategory && catLower === resolvedCategory) return true;
    if (text.includes(catLower)) return true;
    if (brandLower && text.includes(brandLower)) return true;

    return words.some((w) => w.length >= 3 && titleLower.includes(w));
  });

  return results
    .sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0))
    .slice(0, 3);
}

// ── Intent Map ─────────────────────────────────────────────────────

const INTENTS = [
  {
    name: 'greeting',
    patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', "what's up", 'sup'],
    responses: [
      "Hi there! 👋 Welcome to AnchorStore. What can I help you find today?",
      "Hey! Great to see you. Looking for something specific? 🛍️",
      "Hello! Ask me about products, orders, payments, or anything else!",
    ],
  },
  {
    name: 'product',
    patterns: [
      'product', 'item', 'show me', 'looking for', 'find', 'browse', 'buy', 'want',
      'laptop', 'phone', 'tablet', 'tv', 'television', 'watch', 'speaker', 'printer',
      'fridge', 'freezer', 'washer', 'ac', 'microwave', 'dispenser',
      'perfume', 'fragrance', 'shaver', 'skincare',
      'chair', 'desk', 'lamp', 'jeans', 'shirt', 'shoe', 'shoes', 'polo',
      'samsung', 'apple', 'hp', 'lg', 'sony', 'jbl', 'anker', 'tecno', 'infinix',
      'adidas', 'levis', 'casio', 'braun', 'philips',
    ],
    responses: [
      "We carry a wide selection! Browse by category or use the search bar. 🔍",
      "Updated inventory daily — check the homepage for featured picks. ✨",
    ],
  },
  {
    name: 'price',
    patterns: ['price', 'cost', 'how much', 'cheap', 'affordable', 'discount', 'sale', 'deal', 'offer', 'promo', 'coupon', 'budget'],
    responses: [
      "We have options across all budgets! 💰 Check the sale section for the best deals.",
      "Use the price filter on any category page to shop within your budget. 🏷️",
      "Sale items can be up to 30% off — check the homepage for ongoing promos! 🔥",
    ],
  },
  {
    name: 'cart',
    patterns: ['cart', 'basket', 'add to cart', 'checkout', 'purchase', 'order now', 'proceed'],
    responses: [
      "Ready to checkout? 🛒 Head to your cart to review items and complete your purchase!",
      "Click 'Add to Cart' on any product page, then go to checkout whenever you're ready.",
      "Your cart is always a click away at the top right. Checkout takes less than 2 minutes! 🎉",
    ],
  },
  {
    name: 'order',
    patterns: ['order', 'orders', 'track', 'tracking', 'delivery', 'shipping', 'when will', 'my order', 'dispatch', 'status', 'arrive', 'package', 'where is'],
    responses: [
      "Track your order anytime under **My Orders** in your account dashboard. 📦",
      "Visit **My Orders** in your profile — real-time status updates are there.",
      "Standard delivery takes 3–7 business days. Check **My Orders** for the latest. 🚚",
    ],
  },
  {
    name: 'returns',
    patterns: ['return', 'refund', 'exchange', 'send back', 'wrong size', 'damaged', 'broken', 'not happy', 'cancel'],
    responses: [
      "We accept returns within 30 days. Go to **My Orders**, select the item, and choose 'Request Return'. 🔁",
      "Not happy? We'll sort it. Contact support with your order number and we'll make it right. 💪",
    ],
  },
  {
    name: 'payment',
    patterns: ['pay', 'payment', 'credit card', 'debit', 'paystack', 'bank', 'transfer', 'secure', 'safe', 'visa', 'mastercard'],
    responses: [
      "We accept all major cards and bank transfers — every transaction is SSL-secured. 💳",
      "Payments are processed via Paystack, one of the most trusted gateways in Africa. 🔒",
    ],
  },
  {
    name: 'account',
    patterns: ['account', 'login', 'sign in', 'sign up', 'register', 'profile', 'password', 'forgot password', 'log in', 'log out'],
    responses: [
      "Click the person icon at the top right to sign in or create a free account. 👤",
      "Forgot your password? On the login page hit 'Forgot password' — we'll email a reset link. 🔑",
    ],
  },
  {
    name: 'contact',
    patterns: ['contact', 'support', 'help', 'agent', 'human', 'speak to', 'customer service', 'email', 'phone'],
    responses: [
      "Our support team is available Mon–Sat, 9am–6pm. Find us on the **Contact Us** page. 📬",
      "Need a human? Check the **Contact Us** page for email, phone, and WhatsApp options. 📞",
    ],
  },
];

const FALLBACK = [
  "Hmm, not sure I caught that. 🤔 Try asking about products, orders, cart, or delivery!",
  "I didn't quite understand — ask me about products, cart, or order tracking. 😊",
  "Try rephrasing, or browse the store and I'll help where I can! 🛍️",
];

// ── Core Functions ─────────────────────────────────────────────────

export function detectIntent(message) {
  const lower = message.toLowerCase().trim();
  for (const intent of INTENTS) {
    if (intent.patterns.some((p) => lower.includes(p))) return intent.name;
  }
  return 'fallback';
}

export function generateResponse(intentName) {
  const intent = INTENTS.find((i) => i.name === intentName);
  return pick(intent ? intent.responses : FALLBACK);
}

/**
 * @param {string} message
 * @param {string} [firstName]  — optional first name for personalisation
 * @returns {Promise<{ text: string, products?: object[] }>}
 */
export async function getBotReply(message, firstName = '') {
  // 🔌 future API hook — replace this entire function body:
  //
  //   const res = await fetch("/api/chat", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ message, firstName }),
  //   });
  //   return res.json();   // expects { text, products? }

  const intent = detectIntent(message);

  // ── Product intent: real product search ───────────────────────
  if (intent === 'product') {
    const products = findProducts(message);

    if (products.length > 0) {
      const greeting = firstName
        ? pick([
            `Here are some options for you, ${firstName} 👇`,
            `${firstName}, you might like these 🛍️`,
            `Found these in our store for you, ${firstName} 👇`,
          ])
        : pick([
            'Here are some options for you 👇',
            'Found these in our store 🛍️',
            'You might like these 👇',
          ]);

      return { text: greeting, products };
    }

    const delay = 900 + Math.random() * 600;
    await new Promise((r) => setTimeout(r, delay));

    return {
      text: "I couldn't find that specific product 🤔 Try searching by brand (Samsung, Apple, HP…) or category (laptop, phone, TV, shoes…)",
    };
  }

  // ── All other intents ──────────────────────────────────────────
  const delay = 900 + Math.random() * 700;
  await new Promise((r) => setTimeout(r, delay));

  // Personalise greetings if user is logged in
  let text = generateResponse(intent);
  if (intent === 'greeting' && firstName) {
    text = text.replace('Hi there!', `Hi ${firstName}!`).replace('Hey!', `Hey ${firstName}!`);
  }

  return { text };
}
