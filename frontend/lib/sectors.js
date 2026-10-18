import {
  Building2, Construction, Droplets, Flame, GraduationCap, Hammer, HeartHandshake, HeartPulse, LayoutGrid,
  Landmark, Map as MapIcon, Megaphone, Receipt, Recycle, Store, Trees, Wheat,
} from 'lucide-react';

export const SECTOR_LIST = [
  { slug: 'roads-transport', name: 'Roads & Transport', icon: Construction },
  { slug: 'water-sewerage', name: 'Water & Sewerage', icon: Droplets },
  { slug: 'environment-waste', name: 'Environment & Waste Management', icon: Recycle },
  { slug: 'health-sanitation', name: 'Public Health & Sanitation', icon: HeartPulse },
  { slug: 'trade-markets', name: 'Trade & Markets', icon: Store },
  { slug: 'education-ecde', name: 'Education & ECDE', icon: GraduationCap },
  { slug: 'agriculture-livestock', name: 'Agriculture & Livestock', icon: Wheat },
  { slug: 'housing-urban', name: 'Housing & Urban Planning', icon: Building2 },
  { slug: 'revenue-licensing', name: 'Revenue & Licensing', icon: Receipt },
  { slug: 'public-infrastructure', name: 'Public Infrastructure', icon: Hammer },
  { slug: 'fire-disaster', name: 'Fire & Disaster Management', icon: Flame },
  { slug: 'social-services', name: 'Social Services', icon: HeartHandshake },
  { slug: 'county-administration', name: 'County Administration', icon: Landmark },
  { slug: 'land-planning', name: 'Land & Physical Planning', icon: MapIcon },
  { slug: 'parks-recreation', name: 'Parks & Recreation', icon: Trees },
  { slug: 'public-participation', name: 'Public Participation', icon: Megaphone },
  { slug: 'other', name: 'Other County Services', icon: LayoutGrid },
];

export const sectorIcon = (slug) => SECTOR_LIST.find((s) => s.slug === slug)?.icon || LayoutGrid;
