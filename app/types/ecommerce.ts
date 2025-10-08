export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice: number;
  stock: number;
  status: string;
  image: string;
  description: string;
  merchant: string;
  sales: number;
  revenue: number;
  productImages: string[];
  brand?: string;
  productHighlights?: string[];
  productVariants: any[];
  offerApplicable: string;
  deliveryFee?: number;
  orderHandlingFee?: number;
  discountOfferedOnProduct?: number;
  productHeight?: number;
  productWidth?: number;
  productWeight?: number;
  productPackageWeight?: number;
  productPackageHeight?: number;
  productPackageWidth?: number;
  whatsInsideTheBox: string[];
  isWarranty: boolean;
  warrantyDescription?: string;
  rating?: any[];
  deliverableLocations: string[];
  eta: string;
  faq?: any[];
  instore?: boolean;
  cityWittyAssured?: boolean;
  isWalletCompatible?: boolean;
  cashbackPoints?: number;
  isPriority?: boolean;
  sponsored?: boolean;
  bestsellerBadge?: boolean;
  additionalInfo?: string;
  isReplacement?: boolean;
  replacementDays?: number;
  isAvailableStock?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const productCategories = [
  "Electronics & Gadgets",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Fashion, Clothing & Apparel",
  "Shoes & Footwear",
  "Jewelry & Accessories",
  "Baby, Kids & Parenting",
  "Books & Stationery",
  "Sports & Fitness",
  "Health & Wellness",
  "Toys & Games",
  "Food and Snacks",
  "Grocery & Gourmet Food",
  "Home Decor & Furnishings",
  "Tools & Home Improvement",
  "Pet Supplies",
  "Automotive Parts & Accessories",
  "Garden & Outdoor",
  "Office Products",
  "Arts, Crafts & Sewing",
  "Travel Gear & Luggage",
  "Computer & Accessories",
  "Mobile Phones & Accessories",
  "Gym and Fitness Equipment",
  "Digital Products & Subscriptions",
  "Collectibles & Fine Art",
  "Doctors and Clinics",
  "Pharma and Pathology",
  "Interior and Exterior Designer",
  "Builder and Constructions",
  "Flooring and Marbles",
  "Paint and Hardware",
  "Tailor and Boutique",
  "Logistics and Courier",
  "Plants and Nurseries",
  "Gifts and Flowers",
  "Others",
];

export const EtaOptions = [
  { label: "Same-Day Delivery (6–12 hours)", eta: "6–12 hours" },
  { label: "Next-Day Delivery (1 day)", eta: "1 day" },
  { label: "Fast Delivery (2–3 days)", eta: "2–3 days" },
  { label: "Standard Delivery (4–7 days)", eta: "4–7 days" },
  { label: "Extended Delivery (8–12 days)", eta: "8–12 days" },
  { label: "Long-Distance Delivery (13–21 days)", eta: "13–21 days" },
  { label: "International Delivery (15–30 days)", eta: "15–30 days" },
  { label: "Pre-Order Delivery (30–45 day)", eta: "30–45 days" },
];

export const mockStats = {
  totalProducts: 1245,
  activeProducts: 987,
  totalOrders: 5432,
  totalRevenue: 125680,
};
