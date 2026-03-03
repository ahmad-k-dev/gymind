import { create } from 'zustand';
import type { Gym } from '../types';
import { normalizeGymProfile } from '../data/mockGyms';

const DATA: Gym[] = [
  { id:'1', name:'The Forge Elite', address:'1247 W 34th St, Manhattan', distance:'1.2 mi', rating:4.9, reviews:1200, traffic:'Medium', capacity:55, price:89, image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80', images:['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'], tags:['Weights','HIIT','Cardio'], about:'Premium fitness sanctuary with state-of-the-art equipment and expert trainers.' },
  { id:'2', name:'Iron Paradise', address:'88 Park Ave S', distance:'0.8 mi', rating:4.7, reviews:890, traffic:'Low', capacity:30, price:69, image:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80', images:['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80'], tags:['Powerlifting','CrossFit'], about:'Catering to serious lifters with Olympic platforms and competition-grade equipment.' },
  { id:'3', name:'Olympus Athletics', address:'555 Fitness Blvd, Chelsea', distance:'2.4 mi', rating:4.8, reviews:1450, traffic:'High', capacity:82, price:120, image:'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80', images:['https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80'], tags:['Spa','Pool','Yoga'], about:"Chelsea's premier full-service fitness club with world-class amenities." },
  { id:'4', name:'Crunch Fitness', address:'West 23rd Street', distance:'0.5 mi', rating:4.2, reviews:632, traffic:'Low', capacity:35, price:24, image:'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80', images:['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80'], tags:['Pool','Sauna'], about:'Affordable no-judgment fitness for everyone.' },
  { id:'5', name:'Equinox Nomad', address:'Park Ave South, Midtown', distance:'1.8 mi', rating:4.9, reviews:2100, traffic:'High', capacity:82, price:180, image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'], tags:['Spa','Yoga','Classes'], about:'The pinnacle of luxury fitness in Midtown Manhattan.' },
];

interface GymsStore {
  gyms: Gym[];
  selected: Gym | null;
  query: string;
  loading: boolean;
  fetchGyms: () => Promise<void>;
  select: (id: string) => void;
  search: (q: string) => void;
  results: () => Gym[];
}

export const useGyms = create<GymsStore>((set, get) => ({
  gyms: [], selected: null, query: '', loading: false,

  fetchGyms: async () => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 600));
    set({ gyms: DATA.map(normalizeGymProfile), loading: false });
  },

  select: (id) => set({ selected: get().gyms.find(g => g.id === id) ?? null }),

  search: (q) => set({ query: q }),

  results: () => {
    const { gyms, query } = get();
    if (!query.trim()) return gyms;
    const q = query.toLowerCase();
    return gyms.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.tags.some(t => t.toLowerCase().includes(q))
    );
  },
}));
