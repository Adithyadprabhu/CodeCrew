// Shared listings store using localStorage for cross-page persistence
const KEY = 'ecocycle_listings';

const DEFAULT_LISTINGS = [
  {
    id: 1, name: 'Clear PET Pellets', material: 'Plastic (PET)',
    quantity: '500', unit: 'kg', price: '9500',
    phone: '9876543210', email: 'seller@ecocycle.in',
    location: 'Mumbai, Maharashtra',
    description: 'High-grade post-consumer PET, cleaned and sorted.',
    status: 'ACTIVE', confidence: 92, date: 'Apr 22, 2026',
  },
  {
    id: 2, name: 'Compressed Corrugated Cardboard', material: 'Cardboard (OCC)',
    quantity: '200', unit: 'kg', price: '1800',
    phone: '9123456789', email: 'seller@ecocycle.in',
    location: 'Pune, Maharashtra',
    description: 'Baled OCC, dry and clean. Minimum pickup 100 kg.',
    status: 'PENDING', confidence: 78, date: 'Apr 20, 2026',
  },
  {
    id: 3, name: 'Aluminum Can Scrap', material: 'Metal (Aluminum)',
    quantity: '50', unit: 'kg', price: '4750',
    phone: '9001122334', email: 'seller@ecocycle.in',
    location: 'Bangalore, Karnataka',
    description: 'Crushed aluminum cans, ~98% purity.',
    status: 'DRAFT', confidence: 85, date: 'Apr 18, 2026',
  },
];

export function getListings() {
  if (typeof window === 'undefined') return DEFAULT_LISTINGS;
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_LISTINGS));
      return DEFAULT_LISTINGS;
    }
    return JSON.parse(stored);
  } catch {
    return DEFAULT_LISTINGS;
  }
}

export function saveListings(listings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(listings));
  } catch (error) {
    console.error('Error saving listings:', error);
  }
}

export function addListing(listing) {
  const current = getListings();
  const next = [...current, { ...listing, id: Date.now() }];
  saveListings(next);
  return next;
}

export function updateListing(updated) {
  const next = getListings().map(l => l.id === updated.id ? updated : l);
  saveListings(next);
  return next;
}

export function deleteListing(id) {
  const next = getListings().filter(l => l.id !== id);
  saveListings(next);
  return next;
}
