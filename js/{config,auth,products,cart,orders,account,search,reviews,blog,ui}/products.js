// ============================================
// SKINMATTERS – Products Data
// To add/edit products, update this array.
// Images go in the /images/ folder.
// ============================================

const PRODUCTS = [
  {
    id: 1,
    name: "Aloe Vera Soap",
    tagline: "Soothe & Glow",
    category: "soap",
    price: 180,
    originalPrice: 220,
    image: "images/Aloe vera Soap.png",
    badge: "Best Seller",
    rating: 4.8,
    reviews: 312,
    description: "Cold-processed with pure aloe vera gel and neem leaf extract. Ideal for acne-prone and sensitive skin."
  },
  {
    id: 2,
    name: "Charcoal Soap",
    tagline: "Deep Cleanse",
    category: "soap",
    price: 190,
    originalPrice: 240,
    image: "images/charcoal 1.png",
    badge: "Trending",
    rating: 4.9,
    reviews: 510,
    description: "Activated charcoal draws out toxins and unclogs pores for a visibly clearer complexion."
  },
  {
    id: 3,
    name: "Avarampoo Soap",
    tagline: "Brightening Formula",
    category: "soap",
    price: 160,
    originalPrice: 200,
    image: "images/Avarampoo Soap.png",
    badge: "Traditional",
    rating: 4.7,
    reviews: 198,
    description: "Traditional South Indian flower soap. Brightens skin and evens out complexion naturally."
  },
  {
    id: 4,
    name: "Kuppaimeni Soap",
    tagline: "Herbal Healing",
    category: "soap",
    price: 150,
    originalPrice: 190,
    image: "images/Kuppaimeni Soap.png",
    badge: "Herbal",
    rating: 4.6,
    reviews: 145,
    description: "Made with Indian acalypha – a powerful Siddha herb known for treating skin disorders."
  },
  {
    id: 5,
    name: "Manjistha & Athimathuram Soap",
    tagline: "Anti-Pigmentation",
    category: "soap",
    price: 175,
    originalPrice: 210,
    image: "images/Manjistha and Athimathuram Soap.png",
    badge: "Ayurvedic",
    rating: 4.8,
    reviews: 223,
    description: "Manjistha purifies blood and skin; Athimathuram reduces pigmentation for radiant skin."
  },
  {
    id: 6,
    name: "Multhaanimetti Soap",
    tagline: "Clay Cleanse",
    category: "soap",
    price: 155,
    originalPrice: 195,
    image: "images/Multhanimetti soap.png",
    badge: "Pure Clay",
    rating: 4.5,
    reviews: 167,
    description: "Multani Mitti (Fuller's Earth) absorbs excess oil and reduces acne marks naturally."
  },
  {
    id: 7,
    name: "Almond Milk & Rice Flour Soap",
    tagline: "Nourish & Soften",
    category: "soap",
    price: 200,
    originalPrice: 250,
    image: "images/Almond milk and rice flour Soap.png",
    badge: "Luxe",
    rating: 4.9,
    reviews: 287,
    description: "Creamy bar with almond milk and rice flour. Exfoliates gently while deeply moisturising."
  },
  {
    id: 8,
    name: "Sandalwood Soap",
    tagline: "Calming & Healing",
    category: "soap",
    price: 185,
    originalPrice: 225,
    image: "images/Sandalwood",
    badge: "Classic",
    rating: 4.7,
    reviews: 342,
    description: "Pure sandalwood powder with rose water. Calms irritated skin and gives a soft, even tone."
  },
  {
    id: 9,
    name: "Beetroot Balm",
    tagline: "Natural Lip Tint",
    category: "balm",
    price: 120,
    originalPrice: 150,
    image: "images/beetroot balm.png",
    badge: "Viral",
    rating: 5.0,
    reviews: 621,
    description: "Beetroot-tinted lip balm with shea butter and vitamin E. Heals and adds a natural rosy tint."
  },
  {
    id: 10,
    name: "Coco Balm",
    tagline: "Deep Moisture",
    category: "balm",
    price: 110,
    originalPrice: 140,
    image: "images/coco balm.png",
    badge: "Moisturising",
    rating: 4.8,
    reviews: 189,
    description: "Pure coconut oil balm. Use on lips, cuticles, elbows – anywhere that needs intense hydration."
  },
  {
    id: 11,
    name: "Hair Growth Oil",
    tagline: "Strengthen & Grow",
    category: "oil",
    price: 350,
    originalPrice: 420,
    image: "images/hair oil 1.png",
    badge: "Top Pick",
    rating: 4.9,
    reviews: 445,
    description: "A blend of 15 herbs in cold-pressed castor and coconut base. Stimulates follicles and prevents hair fall."
  },
  {
    id: 12,
    name: "Face Serum",
    tagline: "Glow Booster",
    category: "oil",
    price: 490,
    originalPrice: 600,
    image: "images/face serum 2.png",
    badge: "New",
    rating: 4.7,
    reviews: 123,
    description: "Vitamin C and rosehip serum. Reduces dark spots, evens skin tone, and adds a healthy glow."
  },
  {
    id: 13,
    name: "Herbal Face Pack",
    tagline: "Deep Clay Mask",
    category: "pack",
    price: 220,
    originalPrice: 280,
    image: "images/face pack 1.png",
    badge: "Detox",
    rating: 4.6,
    reviews: 256,
    description: "Multani mitti, turmeric and sandalwood powder. Weekly pack for deep cleansing and glow."
  },
  {
    id: 14,
    name: "Herbal Hair Pack",
    tagline: "Protein Treatment",
    category: "pack",
    price: 260,
    originalPrice: 320,
    image: "images/hair pack 1.png",
    badge: "Deep Nourish",
    rating: 4.8,
    reviews: 198,
    description: "Amla, shikakai and egg-protein formula. Restores shine and treats damaged, brittle hair."
  }
];

// Export for use in other scripts
if (typeof module !== 'undefined') module.exports = PRODUCTS;
