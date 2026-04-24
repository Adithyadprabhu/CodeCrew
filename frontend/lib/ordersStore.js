// Shared orders store – localStorage based, mirrors the seller's requests
const KEY = 'ecocycle_orders';
const CHANNEL = 'ecocycle_orders_channel';

const DEFAULT_ORDERS = [
  {
    id: 'ORD-001',
    buyerId: 'buyer123',
    buyerName: 'GreenMart Recyclers',
    buyerCompany: 'GreenMart Pvt. Ltd.',
    sellerId: 'seller001',
    sellerName: 'EcoCycle Seller',
    material: 'Plastic (PET)',
    quantity: '2 Tons',
    price: 36000,
    location: 'Mumbai, Maharashtra',
    date: 'Apr 24, 2026',
    message: 'Need high-grade PET for our bottle manufacturing unit.',
    status: 'pending',
    avatar: 'G',
    avatarColor: 'bg-blue-500',
  },
  {
    id: 'ORD-002',
    buyerId: 'buyer123',
    buyerName: 'EcoLoop Industries',
    buyerCompany: 'EcoLoop Mfg. Co.',
    sellerId: 'seller001',
    sellerName: 'EcoCycle Seller',
    material: 'Cardboard (OCC)',
    quantity: '500 kg',
    price: 4500,
    location: 'Pune, Maharashtra',
    date: 'Apr 23, 2026',
    message: 'Looking for bulk OCC cardboard.',
    status: 'pending',
    avatar: 'E',
    avatarColor: 'bg-green-500',
  },
  {
    id: 'ORD-003',
    buyerId: 'buyer456',
    buyerName: 'ReCraft Solutions',
    buyerCompany: 'ReCraft Tech Pvt. Ltd.',
    sellerId: 'seller001',
    sellerName: 'EcoCycle Seller',
    material: 'Metal (Aluminum)',
    quantity: '100 kg',
    price: 9500,
    location: 'Bangalore, Karnataka',
    date: 'Apr 22, 2026',
    message: '',
    status: 'accepted',
    avatar: 'R',
    avatarColor: 'bg-purple-500',
  },
  {
    id: 'ORD-004',
    buyerId: 'buyer789',
    buyerName: 'Waste Warriors Co.',
    buyerCompany: 'Waste Warriors Pvt. Ltd.',
    sellerId: 'seller001',
    sellerName: 'EcoCycle Seller',
    material: 'Glass',
    quantity: '300 kg',
    price: 1200,
    location: 'Hyderabad, Telangana',
    date: 'Apr 21, 2026',
    message: 'For our glass recycling plant.',
    status: 'rejected',
    avatar: 'W',
    avatarColor: 'bg-orange-500',
  },
  {
    id: 'ORD-005',
    buyerId: 'buyer123',
    buyerName: 'BioGreen Processors',
    buyerCompany: 'BioGreen Pvt. Ltd.',
    sellerId: 'seller001',
    sellerName: 'EcoCycle Seller',
    material: 'Organic Waste',
    quantity: '1 Ton',
    price: 2500,
    location: 'Chennai, Tamil Nadu',
    date: 'Apr 20, 2026',
    message: 'For composting facility.',
    status: 'pending',
    avatar: 'B',
    avatarColor: 'bg-teal-500',
  },
];

let _channel = null;
function getChannel() {
  if (typeof window === 'undefined') return null;
  if (!_channel) {
    try { _channel = new BroadcastChannel(CHANNEL); } catch { _channel = null; }
  }
  return _channel;
}

export function getOrders() {
  if (typeof window === 'undefined') return DEFAULT_ORDERS;
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_ORDERS));
      return DEFAULT_ORDERS;
    }
    return JSON.parse(stored);
  } catch {
    return DEFAULT_ORDERS;
  }
}

export function saveOrders(orders) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const next = orders.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o);
  saveOrders(next);

  const ch = getChannel();
  if (ch) ch.postMessage({ type: 'ORDER_UPDATED', orderId, status });

  return next;
}

export function getOrderById(orderId) {
  return getOrders().find(o => o.id === orderId) || null;
}

export function getBuyerOrders(buyerId) {
  return getOrders().filter(o => o.buyerId === buyerId);
}

export function subscribeToOrders(callback) {
  if (typeof window === 'undefined') return () => {};
  try {
    const ch = getChannel();
    const bcHandler = () => {
      try {
        callback(getOrders());
      } catch (error) {
        console.error('Error in order callback:', error);
      }
    };
    if (ch) ch.addEventListener('message', bcHandler);
    
    const storageHandler = (e) => {
      if (e.key === KEY) {
        try {
          callback(getOrders());
        } catch (error) {
          console.error('Error in storage order handler:', error);
        }
      }
    };
    window.addEventListener('storage', storageHandler);
    
    return () => {
      if (ch) ch.removeEventListener('message', bcHandler);
      window.removeEventListener('storage', storageHandler);
    };
  } catch (error) {
    console.error('Error subscribing to orders:', error);
    return () => {};
  }
}
