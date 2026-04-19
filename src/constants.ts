import { ForestRestHouse } from './types';

export const REST_HOUSES: ForestRestHouse[] = [
  {
    id: 'mandi-log-hut',
    name: 'FRH Mandi Log Hut',
    location: 'Mandi District, Himachal Pradesh',
    description: 'The Mandi Log Hut stands as a testament to colonial-era architecture fused with local deodar timber. Situated at an elevation of 1,200m, it offers a sheltered clearing overlooking the Beas river valley.',
    heroImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200',
    elevation: '1,200m',
    tags: ['Premium Heritage', 'Located at heart of Mandi City'],
    accommodationSets: [
      { id: 'set-1', name: 'Set 1', description: 'Heritage Suite', status: 'AVAILABLE', floor: 'Ground', view: 'Valley', capacity: 2, bookings: [] },
      { id: 'set-2', name: 'Set 2', description: 'Heritage Suite', status: 'AVAILABLE', floor: 'Ground', view: 'Deodar Canopy', capacity: 2, bookings: [] },
      { id: 'set-3', name: 'Set 3', description: 'Standard Suite', status: 'AVAILABLE', floor: 'First', view: 'Garden Trail', capacity: 2, bookings: [] },
      { id: 'set-4', name: 'Set 4', description: 'Top Floor Suite', status: 'AVAILABLE', floor: 'Top', view: 'Full Canopy', capacity: 2, bookings: [] }
    ]
  },
  {
    id: 'mandi-transit-hut',
    name: 'FRH Mandi Transit Hut',
    location: 'Mandi, Himachal Pradesh',
    description: 'Strategically located at the nexus of major forest trails, the Mandi Transit Hut offers a secure and restorative resting point for officials and authorized personnel.',
    heroImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200',
    accommodationSets: [
      { id: 'set-1', name: 'Set 1', description: 'Ground Floor', status: 'AVAILABLE', floor: 'Ground', view: 'Forest', capacity: 2, bookings: [] },
      { id: 'set-2', name: 'Set 2', description: 'Ground Floor', status: 'AVAILABLE', floor: 'Ground', view: 'Courtyard', capacity: 2, bookings: [] },
      { id: 'set-3', name: 'Set 3', description: 'First Floor', status: 'AVAILABLE', floor: 'First', view: 'Canopy', capacity: 2, bookings: [] },
      { id: 'set-4', name: 'Set 4', description: 'First Floor', status: 'AVAILABLE', floor: 'First', view: 'Canopy', capacity: 2, bookings: [] }
    ]
  },
  {
    id: 'trekker-hut-prashar',
    name: 'FRH Trekker Hut Prashar',
    location: 'Prashar Lake, Mandi',
    description: 'Rugged yet comfortable trekker hut offering solitude and striking vistas of the Dhauladhar ranges.',
    heroImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200',
    elevation: '2,730m Elevation',
    tags: ['High Altitude Outpost'],
    accommodationSets: [
      { id: 'set-1', name: 'Set 1', description: 'Standard Trekker Room', status: 'AVAILABLE', floor: 'Ground', view: 'Mountain', capacity: 4, bookings: [] },
      { id: 'set-2', name: 'Set 2', description: 'Standard Trekker Room', status: 'AVAILABLE', floor: 'Ground', view: 'Mountain', capacity: 4, bookings: [] },
      { id: 'set-3', name: 'Set 3', description: 'Standard Trekker Room', status: 'AVAILABLE', floor: 'Ground', view: 'Mountain', capacity: 4, bookings: [] }
    ]
  },
  {
    id: 'frh-prashar',
    name: 'FRH Prashar',
    location: 'Prashar, Mandi District',
    description: 'Located amidst high-altitude meadows, this rest house offers a quiet retreat near the sacred Prashar Lake.',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
    tags: ['Alpine Meadow'],
    accommodationSets: [
      { id: 'set-3', name: 'Set 3', description: 'Mountain View Suite', status: 'AVAILABLE', floor: 'Main', view: 'Alpine', capacity: 2, bookings: [] }
    ]
  },
  {
    id: 'dhumadevi',
    name: 'FRH Dhumadevi',
    location: 'Dhumadevi, Mandi District',
    description: 'Nestled deep within the ancient woods, offering a serene escape close to the historic Dhumadevi temple.',
    heroImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1200',
    tags: ['Temple View'],
    accommodationSets: [
      { id: 'set-1', name: 'Set 1', description: 'Forest View', status: 'AVAILABLE', floor: 'Main', view: 'Forest', capacity: 2, bookings: [] },
      { id: 'set-2', name: 'Set 2', description: 'Courtyard View', status: 'AVAILABLE', floor: 'Main', view: 'Courtyard', capacity: 2, bookings: [] },
      { id: 'set-3', name: 'Set 3', description: 'Forest View', status: 'AVAILABLE', floor: 'Main', view: 'Forest', capacity: 2, bookings: [] }
    ]
  },
  {
    id: 'rewalsar',
    name: 'FRH Rewalsar',
    location: 'Rewalsar, Mandi',
    description: 'Situated near the sacred Rewalsar Lake, known for its floating islands and diverse religious heritage.',
    heroImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200',
    tags: ['Lakeside', 'Sacred Heritage'],
    accommodationSets: [
      { id: 'set-1', name: 'Set 1', description: 'Lake View Room', status: 'AVAILABLE', floor: 'Ground', view: 'Lake', capacity: 2, bookings: [] },
      { id: 'set-2', name: 'Set 2', description: 'Lake View Room', status: 'AVAILABLE', floor: 'Ground', view: 'Lake', capacity: 2, bookings: [] },
      { id: 'set-3', name: 'Set 3', description: 'Garden Suite', status: 'AVAILABLE', floor: 'First', view: 'Garden', capacity: 2, bookings: [] },
      { id: 'set-4', name: 'Set 4', description: 'Garden Suite', status: 'AVAILABLE', floor: 'First', view: 'Garden', capacity: 2, bookings: [] }
    ]
  },
  {
    id: 'aut',
    name: 'FRH Aut',
    location: 'Aut, Mandi District',
    description: 'Situated alongside the flowing waters, FRH Aut offers a serene resting point with riverside accessibility.',
    heroImage: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=1200',
    tags: ['Riverside'],
    accommodationSets: [
      { id: 'set-1', name: 'Set 1', description: 'Double Bed, River View', status: 'AVAILABLE', floor: 'Ground', view: 'River', capacity: 2, bookings: [] },
      { id: 'set-2', name: 'Set 2', description: 'Double Bed, Forest View', status: 'AVAILABLE', floor: 'Ground', view: 'Forest', capacity: 2, bookings: [] },
      { id: 'set-3', name: 'Set 3', description: 'Double Bed, Forest View', status: 'AVAILABLE', floor: 'Ground', view: 'Forest', capacity: 2, bookings: [] }
    ]
  }
];
