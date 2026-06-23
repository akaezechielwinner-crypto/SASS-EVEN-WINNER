import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  Sparkles, 
  Briefcase, 
  Layers, 
  ListTodo, 
  HelpCircle, 
  TrendingUp, 
  User, 
  Mail, 
  Coins, 
  Settings,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

import { Category, ExpenseItem, EventDetails, UserProfile, DEFAULT_CATEGORIES } from './types';
import GoogleLogin from './components/GoogleLogin';
import OverviewTab from './components/OverviewTab';
import CategoriesTab from './components/CategoriesTab';
import ExpensesTab from './components/ExpensesTab';
import AiPlannerTab from './components/AiPlannerTab';
import { initAuth, logout as googleLogout } from './lib/googleAuth';
import { safeLocalStorage } from './lib/safeStorage';

const LOCAL_STORAGE_KEY_SESSION = 'event_spend_user_session';
const LOCAL_STORAGE_KEY_EVENT = 'event_spend_active_event_data';

// Default initial drafted expenses to give high-fidelity visual context immediately
const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: 'exp-1', name: 'Location Domaine de Provins (weekend)', categoryId: 'cat-lieu', amount: 3000000, status: 'paid', notes: 'Acompte versé, caution de 1 000 000 FCFA à prévoir en chèque.' },
  { id: 'exp-2', name: 'Assurance Intempéries RC Évènement', categoryId: 'cat-lieu', amount: 250000, status: 'paid', notes: 'Couverture totale pour 200 invités.' },
  { id: 'exp-3', name: 'Cocktail & Buffet Gourmet (100 pers)', categoryId: 'cat-traiteur', amount: 5500000, status: 'pending', notes: 'Menu validé avec option vegan et sans gluten. Boissons incluses.' },
  { id: 'exp-4', name: 'Arche florale & décoration d\'allée', categoryId: 'cat-deco', amount: 900000, status: 'pending', notes: 'Lilas, roses blanches et guirlandes luminescentes.' },
  { id: 'exp-5', name: 'DJ Prestige + Pack Sono & Jeux de lumière', categoryId: 'cat-animation', amount: 1500000, status: 'paid', notes: 'Vérifier la playlist d\'entrée des mariés.' },
  { id: 'exp-6', name: 'Hôtesses d\'accueil (2 personnes x 6h)', categoryId: 'cat-staff', amount: 750000, status: 'pending', notes: 'Via l\'agence PrestaStaff. Uniformes sombres.' },
];

export default function App() {
  // Session User state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const raw = safeLocalStorage.getItem(LOCAL_STORAGE_KEY_SESSION);
    return raw ? JSON.parse(raw) : null;
  });

  // Listen to Google Firebase Auth state changes to keep sessions active and synced
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        const loggedUser: UserProfile = {
          email: user.email || '',
          name: user.displayName || user.email?.split('@')[0] || 'Utilisateur Google',
          picture: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
        };
        setCurrentUser(loggedUser);
        safeLocalStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(loggedUser));
      },
      () => {
        // Safe: if auth token fails or expires, we only logout if we don't have local storage session
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Event Budget planner state
  const [eventData, setEventData] = useState<EventDetails>(() => {
    const raw = safeLocalStorage.getItem(LOCAL_STORAGE_KEY_EVENT);
    if (raw) {
      return JSON.parse(raw);
    }
    return {
      name: 'Mariage Sarah & Marc',
      totalBudget: 15000000,
      categories: DEFAULT_CATEGORIES,
      expenses: INITIAL_EXPENSES
    };
  });

  // Active tab selection
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'expenses' | 'aiPlanner'>('overview');

  // Trigger LocalStorage save whenever eventData changes
  useEffect(() => {
    safeLocalStorage.setItem(LOCAL_STORAGE_KEY_EVENT, JSON.stringify(eventData));
  }, [eventData]);

  // Handle Login
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    safeLocalStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(user));
  };

  // Handle Logout
  const handleLogout = async () => {
    setCurrentUser(null);
    safeLocalStorage.removeItem(LOCAL_STORAGE_KEY_SESSION);
    try {
      await googleLogout();
    } catch (err) {
      console.error("Error signing out from Google Firebase:", err);
    }
  };

  // Callback: Budget Input Global Change
  const handleBudgetChange = (newBudget: number) => {
    setEventData(prev => ({
      ...prev,
      totalBudget: isNaN(newBudget) || newBudget < 0 ? 0 : newBudget
    }));
  };

  // Callback: Category distribution modified (from slider/balances)
  const handleUpdateCategories = (updatedCategories: Category[]) => {
    setEventData(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  // Callback: Expenses lists additions/edits
  const handleUpdateExpenses = (updatedExpenses: ExpenseItem[]) => {
    setEventData(prev => ({
      ...prev,
      expenses: updatedExpenses
    }));
  };

  // Callback: Apply standard template or AI breakdown
  const handleApplyTemplate = (templateName: string, categories: Category[], recommendedExpenses: ExpenseItem[] = []) => {
    setEventData({
      name: templateName,
      totalBudget: eventData.totalBudget, // keep original budget sum
      categories,
      expenses: recommendedExpenses
    });
    setActiveTab('overview'); // route back to overview to see results
  };

  // Mock list of events for the high-density sidebar
  const sidebarEvents = [
    { name: eventData.name, id: 'main', active: true },
    { name: 'Gala Annuel 2026', id: 'gala', active: false },
    { name: 'Anniversaire Julia', id: 'julia', active: false }
  ];

  // If user is not logged in, force simulated Google Sign-In as requested
  if (!currentUser) {
    return <GoogleLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Sidebar navigation based on High Density theme */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow shadow-indigo-100">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-800 font-display">Winner Event</span>
            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest block -mt-1">SaaS Budget</span>
          </div>
        </div>

        {/* Workspace selector - High-Density sidebar list */}
        <div className="p-4 space-y-4 flex-1">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
              <span>Mes Évènements</span>
              <span className="text-[9px] bg-slate-100 text-slate-500 rounded px-1">Live</span>
            </div>
            
            <div className="space-y-1">
              {sidebarEvents.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => evt.id === 'main' ? {} : setEventData(prev => ({ ...prev, name: evt.name }))}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-xs transition-all text-left ${
                    evt.active 
                      ? 'bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${evt.active ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                  <span className="truncate">{evt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Core Tab items rendered directly inside sidebar for premium visual space */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Navigation</div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-xs transition-all text-left ${
                  activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>Tableau de Bord</span>
              </button>
              
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-xs transition-all text-left ${
                  activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Objectifs Catégories</span>
              </button>

              <button
                onClick={() => setActiveTab('expenses')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-xs transition-all text-left ${
                  activeTab === 'expenses' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ListTodo className="w-4 h-4 shrink-0" />
                <span>Saisie des Dépenses</span>
              </button>

              <button
                onClick={() => setActiveTab('aiPlanner')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-xs transition-all text-left ${
                  activeTab === 'aiPlanner' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Planification & IA</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Card at the Bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            {currentUser.picture ? (
              <img
                src={currentUser.picture}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full border border-slate-200 object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold border border-indigo-100 shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 truncate leading-none">via Google CRM</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1 px-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition shrink-0"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main SaaS Workspace with Premium High Density Glass Layout */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Block with high density details */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3 min-w-0">
            <input
              id="input-event-name"
              type="text"
              value={eventData.name}
              onChange={(e) => setEventData(prev => ({ ...prev, name: e.target.value }))}
              className="font-extrabold text-sm sm:text-base text-slate-800 bg-transparent hover:bg-slate-100 focus:bg-white border-none hover:ring-1 hover:ring-slate-200 focus:ring-2 focus:ring-indigo-100 rounded px-2 py-0.5 focus:outline-none transition w-44 sm:w-80 truncate"
              placeholder="Nom de l'évènement..."
              title="Cliquez pour renommer l'évènement"
            />
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              En cours
            </span>
          </div>

          {/* Quick budget inline counter representation */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="block text-[8px] uppercase tracking-widest font-extrabold text-slate-400 leading-none mb-1">Budget Défini</span>
              <div className="relative flex items-center">
                <input
                  id="header-total-budget-input"
                  type="number"
                  value={eventData.totalBudget}
                  onChange={(e) => handleBudgetChange(Number(e.target.value))}
                  className="pl-2.5 pr-14 py-1.5 border border-indigo-100 hover:border-indigo-200 focus:border-indigo-500 bg-slate-50/50 hover:bg-white focus:bg-white rounded-lg font-bold text-indigo-600 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32 sm:w-36 transition-all"
                  placeholder="15000000"
                />
                <span className="absolute right-2 text-slate-400 text-[10px] font-bold font-sans pointer-events-none">FCFA</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab content viewing viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <OverviewTab 
                  event={eventData} 
                  onBudgetChange={handleBudgetChange} 
                  onImportBudget={(importedEvent) => setEventData(importedEvent)} 
                />
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <CategoriesTab event={eventData} onUpdateCategories={handleUpdateCategories} />
              </motion.div>
            )}

            {activeTab === 'expenses' && (
              <motion.div
                key="expenses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <ExpensesTab event={eventData} onUpdateExpenses={handleUpdateExpenses} />
              </motion.div>
            )}

            {activeTab === 'aiPlanner' && (
              <motion.div
                key="aiPlanner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <AiPlannerTab event={eventData} onApplyTemplate={handleApplyTemplate} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Soft layout security status */}
        <div className="px-6 py-2 bg-white border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
          <p className="flex items-center space-x-1.5 font-bold text-slate-500">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
            <span>Tableau de bord sécurisé Winner Event</span>
          </p>
          <div className="flex items-center space-x-2">
            <span>Stockage local sécurisé</span>
          </div>
        </div>
      </main>
    </div>
  );
}
