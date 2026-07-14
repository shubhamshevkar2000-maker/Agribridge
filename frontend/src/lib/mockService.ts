// Mock Service for AgriBridge UI
// Returns data in the final API shape to avoid inline JSX hardcoding.

export interface Crop {
  id: string;
  title: string;
  farmer: string;
  location: string;
  price: number;
  qty: number;
  img: string;
  trust: number;
  organic: boolean;
  harvestDate?: string;
  expiryEst?: string;
  description?: string;
}

export interface Stat {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  location: string;
  impact: string;
}

const mockCrops: Crop[] = [
  { id: '1', title: 'Premium Red Tomatoes', farmer: 'Ramesh Kumar', location: 'Nashik, MH', price: 2350, qty: 50, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80', trust: 850, organic: true, harvestDate: '2026-07-10', expiryEst: '2026-07-25', description: 'High-quality, farm-fresh red tomatoes grown without synthetic pesticides. Perfect for retail supermarkets and ketchup manufacturing.' },
  { id: '2', title: 'Organic Basmati Rice', farmer: 'Anil Desai', location: 'Karnal, HR', price: 3200, qty: 100, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', trust: 910, organic: true, harvestDate: '2026-07-08', expiryEst: '2026-12-31', description: 'Long-grain premium Basmati rice harvested from the fertile plains of Haryana. Fully organic certified.' },
  { id: '3', title: 'Fresh Green Onions', farmer: 'Suresh Patel', location: 'Pune, MH', price: 1800, qty: 30, img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&q=80', trust: 820, organic: false, harvestDate: '2026-07-11', expiryEst: '2026-07-20', description: 'Crisp green onions, freshly pulled and washed, ready for bulk shipment.' },
  { id: '4', title: 'Nagpur Oranges (Grade A)', farmer: 'Vijay Singh', location: 'Nagpur, MH', price: 4500, qty: 25, img: 'https://images.unsplash.com/photo-1611080632333-934c9c148c3b?w=500&q=80', trust: 890, organic: true, harvestDate: '2026-07-12', expiryEst: '2026-08-01', description: 'Juicy, sweet Nagpur oranges, hand-picked and graded for direct delivery.' },
  { id: '5', title: 'Yellow Corn / Maize', farmer: 'Prakash Rao', location: 'Guntur, AP', price: 1950, qty: 200, img: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=500&q=80', trust: 840, organic: false, harvestDate: '2026-07-09', expiryEst: '2026-10-31', description: 'High-yield yellow corn suitable for feed millers and starch manufacturers.' },
  { id: '6', title: 'Fresh Potatoes', farmer: 'Kisan Mitra', location: 'Agra, UP', price: 1400, qty: 150, img: 'https://images.unsplash.com/photo-1518977676601-b14cf8a1d96f?w=500&q=80', trust: 780, organic: false, harvestDate: '2026-07-07', expiryEst: '2026-09-30', description: 'High-quality processing grade potatoes, ideal for chips and wholesale distribution.' },
];

const mockStats: Stat[] = [
  { label: 'Farmers Onboarded', value: 12500, suffix: '+' },
  { label: 'Crops Sold (Tons)', value: 45000, suffix: '+' },
  { label: 'Value Transacted', value: 850, prefix: '₹', suffix: 'Cr+' },
  { label: 'Loans Disbursed', value: 120, prefix: '₹', suffix: 'Cr+' },
];

const mockFAQs: FAQItem[] = [
  {
    question: 'How does the Live Auction system work?',
    answer: 'Farmers list their crops with a starting base price and duration. Verified buyers place bids in real-time. Bidding is secured and resolved atomically using our backend ledger to ensure no double-accepted bids or race conditions.'
  },
  {
    question: 'What is the AgriCredit Trust Score?',
    answer: 'The Trust Score (from 300 to 900) is calculated based on a farmer\'s successful trade history, on-time logistics fulfillment, and past loan repayment rates. A higher score enables farmers to unlock lower interest rates from institutional banking partners.'
  },
  {
    question: 'How is payment security handled?',
    answer: 'AgriBridge uses a secure escrow account mechanism. Once a buyer purchases a crop or wins an auction, their payment is secured in escrow. The funds are only released to the farmer after the logistics partner verifies pickup and the buyer confirms delivery.'
  },
  {
    question: 'How does shared logistics routing work?',
    answer: 'Our smart logistics engine bundles nearby crop pickups into single multi-stop itineraries. By sharing trucks with neighboring farms, logistics costs are optimized, saving up to 40% on transportation fees.'
  }
];

const mockTestimonials: Testimonial[] = [
  {
    quote: 'Selling my basmati rice directly to bulk buyers in Delhi doubled my margins compared to the local mandis. The payment was in my account within 48 hours.',
    author: 'Devendra Hooda',
    role: 'Basmati Rice Farmer',
    location: 'Karnal, Haryana',
    impact: '100% Margin Increase'
  },
  {
    quote: 'The credit scoring system let us verify Ramesh\'s repayment reliability instantly. We disbursed his tractor loan within a day, compared to weeks of manual paperwork.',
    author: 'Archana Sen',
    role: 'Credit Manager, State Bank',
    location: 'Mumbai, MH',
    impact: '24-Hour Disbursals'
  }
];

export const fetchCrops = async (): Promise<Crop[]> => {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 300));
  return mockCrops;
};

export const fetchCropById = async (id: string): Promise<Crop | undefined> => {
  await new Promise(r => setTimeout(r, 100));
  return mockCrops.find(c => c.id === id);
};

export const fetchStats = async (): Promise<Stat[]> => {
  return mockStats;
};

export const fetchFAQs = async (): Promise<FAQItem[]> => {
  return mockFAQs;
};

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  return mockTestimonials;
};

export interface LoanApplication {
  id: string;
  farmer: string;
  amount: number;
  purpose: string;
  score: number;
  risk: string;
  status: string;
}

export interface Order {
  id: string;
  date: string;
  crop: string;
  farmer: string;
  qty: string;
  amount: string;
  status: string;
}

export interface FavoriteFarmer {
  id: number;
  name: string;
  location: string;
  crops: string;
  trustScore: number;
}

const mockApplications: LoanApplication[] = [
  { id: 'LN-1002', farmer: 'Suresh Patel', amount: 500000, purpose: 'Tractor Purchase', score: 850, risk: 'Low', status: 'pending' },
  { id: 'LN-1005', farmer: 'Vijay Singh', amount: 120000, purpose: 'Fertilizers & Seeds', score: 720, risk: 'Medium', status: 'pending' },
  { id: 'LN-1008', farmer: 'Kisan Mitra', amount: 800000, purpose: 'Drip Irrigation Setup', score: 540, risk: 'High', status: 'pending' },
];

const mockOrders: Order[] = [
  { id: 'ORD-8921', date: '2026-07-12', crop: 'Premium Tomatoes', farmer: 'Ramesh Kumar', qty: '50 Qtl', amount: '₹1,17,500', status: 'In Transit' },
  { id: 'ORD-8910', date: '2026-07-10', crop: 'Organic Wheat', farmer: 'Suresh Patel', qty: '200 Qtl', amount: '₹4,50,000', status: 'Delivered' },
  { id: 'ORD-8855', date: '2026-07-05', crop: 'Basmati Rice', farmer: 'Anil Desai', qty: '100 Qtl', amount: '₹3,20,000', status: 'Delivered' },
];

const mockFavorites: FavoriteFarmer[] = [
  { id: 1, name: 'Ramesh Kumar', location: 'Nashik, MH', crops: 'Tomatoes, Onions', trustScore: 850 },
  { id: 2, name: 'Suresh Patel', location: 'Surat, GJ', crops: 'Wheat, Cotton', trustScore: 920 },
];

export const fetchLoanApplications = async (): Promise<LoanApplication[]> => {
  return mockApplications;
};

export const fetchOrders = async (): Promise<Order[]> => {
  return mockOrders;
};

export const fetchFavorites = async (): Promise<FavoriteFarmer[]> => {
  return mockFavorites;
};

