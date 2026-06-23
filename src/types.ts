export interface Category {
  id: string;
  name: string;
  percentage: number; // 0 to 100
  color: string;      // Color code (hex or class)
  icon: string;       // Lucide icon name
}

export interface ExpenseItem {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  status: 'paid' | 'pending';
  notes?: string;
}

export interface EventDetails {
  name: string;
  totalBudget: number;
  categories: Category[];
  expenses: ExpenseItem[];
}

export interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-lieu', name: 'Location de Salle', percentage: 25, color: '#4F46E5', icon: 'Home' }, // indigo
  { id: 'cat-traiteur', name: 'Traiteur & Boissons', percentage: 35, color: '#10B981', icon: 'Utensils' }, // emerald
  { id: 'cat-deco', name: 'Décoration & Fleurs', percentage: 10, color: '#EC4899', icon: 'Sparkles' }, // pink
  { id: 'cat-animation', name: 'Animation & Musique', percentage: 12, color: '#F59E0B', icon: 'Music' }, // amber
  { id: 'cat-staff', name: 'Hôtesses & Personnel', percentage: 8, color: '#3B82F6', icon: 'Users' }, // blue
  { id: 'cat-logistique', name: 'Logistique & Transport', percentage: 6, color: '#8B5CF6', icon: 'Truck' }, // purple
  { id: 'cat-improvus', name: 'Imprévus & Contingence', percentage: 4, color: '#EF4444', icon: 'AlertTriangle' }, // red
];

export const TEMPLATE_EVENTS = [
  {
    id: 'marriage',
    name: 'Mariage de Rêve',
    description: 'Une célébration romantique avec traiteur haut de gamme, décoration fleurie et animation festive.',
    categories: [
      { id: 'cat-lieu', name: 'Domaine & Salle', percentage: 20, color: '#3F83F8', icon: 'Home' },
      { id: 'cat-traiteur', name: 'Traiteur & Vin d\'honneur', percentage: 40, color: '#0E9F6E', icon: 'Utensils' },
      { id: 'cat-deco', name: 'Fleurs & Décoration thématique', percentage: 12, color: '#E74694', icon: 'Sparkles' },
      { id: 'cat-animation', name: 'DJ & Orchestre', percentage: 12, color: '#D03801', icon: 'Music' },
      { id: 'cat-photos', name: 'Photographe & Vidéaste', percentage: 8, color: '#9061F9', icon: 'Camera' },
      { id: 'cat-improvus', name: 'Contingence & Cadeaux invités', percentage: 8, color: '#F05252', icon: 'Gift' }
    ]
  },
  {
    id: 'anniversary',
    name: 'Anniversaire Privé',
    description: 'Une fête conviviale pour vos proches, avec buffet, musique et décorations colorées.',
    categories: [
      { id: 'cat-lieu', name: 'Location de Salle / Bar', percentage: 15, color: '#3F83F8', icon: 'Home' },
      { id: 'cat-traiteur', name: 'Buffet & Boissons / Gâteau', percentage: 45, color: '#0E9F6E', icon: 'Utensils' },
      { id: 'cat-deco', name: 'Décoration & Ballons', percentage: 10, color: '#E74694', icon: 'Sparkles' },
      { id: 'cat-animation', name: 'DJ & Matériel Sono', percentage: 15, color: '#D03801', icon: 'Music' },
      { id: 'cat-improvus', name: 'Boissons supplémentaires & Imprévus', percentage: 15, color: '#F05252', icon: 'AlertTriangle' }
    ]
  },
  {
    id: 'gala',
    name: 'Gala / Soirée d\'Entreprise',
    description: 'Un évènement corporate professionnel avec cocktail dinatoire, scène, écrans et sécurité.',
    categories: [
      { id: 'cat-lieu', name: 'Espace Prestige', percentage: 25, color: '#3F83F8', icon: 'Home' },
      { id: 'cat-traiteur', name: 'Traiteur Cocktail & Open Bar', percentage: 35, color: '#0E9F6E', icon: 'Utensils' },
      { id: 'cat-logistique', name: 'Scène, Éclairage & Écrans (Audiovisuel)', percentage: 15, color: '#9061F9', icon: 'Tv' },
      { id: 'cat-animation', name: 'Animation / Intervenant externe', percentage: 10, color: '#D03801', icon: 'Smile' },
      { id: 'cat-staff', name: 'Personnel d\'accueil & Sécurité', percentage: 10, color: '#16A34A', icon: 'Shield' },
      { id: 'cat-improvus', name: 'Assurances & Imprévus', percentage: 5, color: '#F05252', icon: 'AlertTriangle' }
    ]
  },
  {
    id: 'concert',
    name: 'Concert public / Festival',
    description: 'Organisation d\'un évènement musical grand public nécessitant sono lourde, tickets, communication et sécurité.',
    categories: [
      { id: 'cat-lieu', name: 'Stade / Salle de Spectacle / Plein Air', percentage: 15, color: '#3F83F8', icon: 'Home' },
      { id: 'cat-animation', name: 'Artistes / Cachets', percentage: 40, color: '#D03801', icon: 'Music' },
      { id: 'cat-logistique', name: 'Sonorisation, Lumière & Régie', percentage: 20, color: '#9061F9', icon: 'Volume2' },
      { id: 'cat-staff', name: 'Sécurité, Secouristes & Barrières', percentage: 12, color: '#16A34A', icon: 'Shield' },
      { id: 'cat-communication', name: 'Billetterie & Publicité / Communication', percentage: 8, color: '#E74694', icon: 'Megaphone' },
      { id: 'cat-improvus', name: 'Licences & Assurances', percentage: 5, color: '#F05252', icon: 'FileText' }
    ]
  }
];
