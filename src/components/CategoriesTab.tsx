import React, { useState } from 'react';
import { Lock, Unlock, Plus, Trash2, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { Category, EventDetails } from '../types';

interface CategoriesTabProps {
  event: EventDetails;
  onUpdateCategories: (categories: Category[]) => void;
}

const AVAILABLE_COLORS = [
  '#4F46E5', // indigo
  '#10B981', // emerald
  '#EC4899', // pink
  '#F59E0B', // amber
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EF4444', // red
  '#06B6D4', // cyan
  '#14B8A6', // teal
  '#84CC16', // lime
];

const AVAILABLE_ICONS = [
  { name: 'Home', label: 'Lieu / Salle' },
  { name: 'Utensils', label: 'Repas / Traiteur' },
  { name: 'Music', label: 'Musique / DJ' },
  { name: 'Sparkles', label: 'Déco / Fleurs' },
  { name: 'Users', label: 'Hôtes / Staff' },
  { name: 'Truck', label: 'Transport / Logistique' },
  { name: 'Camera', label: 'Rallonge / Photo' },
  { name: 'Gift', label: 'Cadeaux / Goodies' },
  { name: 'Shield', label: 'Sécurité / Accueil' },
  { name: 'Megaphone', label: 'Pub / Com' },
  { name: 'Smile', label: 'Divers / Autre' }
];

export default function CategoriesTab({ event, onUpdateCategories }: CategoriesTabProps) {
  const { totalBudget, categories } = event;

  // Local state for locked categories
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  
  // Local state for adding a new custom category
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatPercentage, setNewCatPercentage] = useState(10);
  const [newCatColor, setNewCatColor] = useState(AVAILABLE_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState('Home');

  const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0);

  // Toggle lock state
  const toggleLock = (catId: string) => {
    const nextLocked = new Set(lockedIds);
    if (nextLocked.has(catId)) {
      nextLocked.delete(catId);
    } else {
      nextLocked.add(catId);
    }
    setLockedIds(nextLocked);
  };

  // Adjust categories percentages with smart balancing
  const handleSliderChange = (changedCatId: string, newValue: number) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === changedCatId) {
        return { ...cat, percentage: newValue };
      }
      return cat;
    });

    const activeLocked = new Set(lockedIds);
    activeLocked.add(changedCatId); // Lock the sliding one during calculation

    const unlockedCats = updatedCategories.filter(cat => !activeLocked.has(cat.id));
    
    if (unlockedCats.length > 0) {
      // Calculate remaining percentage to distribute
      const lockedSum = updatedCategories
        .filter(cat => activeLocked.has(cat.id))
        .reduce((sum, cat) => sum + cat.percentage, 0);
      
      const targetForUnlocked = 100 - lockedSum;

      if (targetForUnlocked >= 0) {
        const currentUnlockedSum = unlockedCats.reduce((sum, cat) => sum + cat.percentage, 0);
        
        const recalculated = updatedCategories.map(cat => {
          if (activeLocked.has(cat.id)) {
            return cat;
          }
          let ratio = 1 / unlockedCats.length;
          if (currentUnlockedSum > 0) {
            ratio = cat.percentage / currentUnlockedSum;
          }
          const distributedPercent = Math.max(0, Math.round(targetForUnlocked * ratio));
          return { ...cat, percentage: distributedPercent };
        });

        // Enforce exact 100 sum in case of rounding errors
        const newTotal = recalculated.reduce((sum, cat) => sum + cat.percentage, 0);
        if (newTotal !== 100 && unlockedCats.length > 0) {
          const diff = 100 - newTotal;
          // Apply discrepancy to first unlocked category
          const targetUnlockedIdx = recalculated.findIndex(cat => !activeLocked.has(cat.id));
          if (targetUnlockedIdx !== -1) {
            recalculated[targetUnlockedIdx].percentage = Math.max(0, recalculated[targetUnlockedIdx].percentage + diff);
          }
        }
        onUpdateCategories(recalculated);
      } else {
        // If locked sum exceeds 100, just update slider and let user balance manually
        onUpdateCategories(updatedCategories);
      }
    } else {
      // No other unlocked categories, update directly (user must balance manually)
      onUpdateCategories(updatedCategories);
    }
  };

  // Automatic balance button clicked
  const autoRebalance = () => {
    const unlockedCats = categories.filter(cat => !lockedIds.has(cat.id));
    if (unlockedCats.length === 0) return;

    const lockedSum = categories
      .filter(cat => lockedIds.has(cat.id))
      .reduce((sum, cat) => sum + cat.percentage, 0);
    
    const remainingToDistribute = 100 - lockedSum;

    if (remainingToDistribute < 0) {
      // Locked sum is already over 100, clear some locks or scale down
      const equalShareChange = Math.round(100 / categories.length);
      const balanced = categories.map((cat, idx) => ({
        ...cat,
        percentage: idx === 0 ? 100 - (equalShareChange * (categories.length - 1)) : equalShareChange
      }));
      setLockedIds(new Set());
      onUpdateCategories(balanced);
      return;
    }

    const currentUnlockedSum = unlockedCats.reduce((sum, cat) => sum + cat.percentage, 0);
    const rebalanced = categories.map(cat => {
      if (lockedIds.has(cat.id)) return cat;
      
      let ratio = 1 / unlockedCats.length;
      if (currentUnlockedSum > 0) {
        ratio = cat.percentage / currentUnlockedSum;
      }
      return { ...cat, percentage: Math.max(0, Math.round(remainingToDistribute * ratio)) };
    });

    // Handle rounding discrepancies
    const finalSum = rebalanced.reduce((sum, cat) => sum + cat.percentage, 0);
    if (finalSum !== 100) {
      const diff = 100 - finalSum;
      const targetIdx = rebalanced.findIndex(cat => !lockedIds.has(cat.id));
      if (targetIdx !== -1) {
        rebalanced[targetIdx].percentage = Math.max(0, rebalanced[targetIdx].percentage + diff);
      }
    }
    onUpdateCategories(rebalanced);
  };

  // Add custom category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const id = `cat-custom-${Date.now()}`;
    const newCategory: Category = {
      id,
      name: newCatName.trim(),
      percentage: Math.min(100, Math.max(0, newCatPercentage)),
      color: newCatColor,
      icon: newCatIcon
    };

    onUpdateCategories([...categories, newCategory]);
    setNewCatName('');
    setShowAddForm(false);
  };

  // Delete category
  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter(cat => cat.id !== id);
    onUpdateCategories(updated);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-800">Gérer les Catégories & Objectifs</h3>
          <p className="text-xs text-slate-400">Ajoutez, ajustez et verrouillez vos postes de dépenses pour répartir l'enveloppe globale de <strong>{totalBudget.toLocaleString('fr-FR')} FCFA</strong> </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Warning badge */}
          {totalPercentage !== 100 ? (
            <div className="flex items-center space-x-1.5 text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Somme : {totalPercentage}% (Cible 100%)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Somme parfaite de 100%</span>
            </div>
          )}

          {/* Auto balance trigger */}
          <button
            onClick={autoRebalance}
            className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs py-1.5 px-3 rounded-lg font-bold transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rééquilibrer</span>
          </button>

          {/* Add Category Trigger */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 px-3 rounded-lg font-bold transition shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau</span>
          </button>
        </div>
      </div>

      {/* Slide New Category Panel */}
      {showAddForm && (
        <form onSubmit={handleAddCategory} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Nouvelle Catégorie de Dépense
            </span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 text-xs font-semibold">Fermer</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Input name */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Nom de la Catégorie</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex Cameraman / Vidéo, Cadeaux d'invités"
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
              />
            </div>

            {/* Target base percentage */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Allocation Cible (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={newCatPercentage}
                onChange={(e) => setNewCatPercentage(Number(e.target.value))}
                className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Select Icon */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Icône Représentative</label>
              <select
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {AVAILABLE_ICONS.map(i => (
                  <option key={i.name} value={i.name}>{i.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            {/* Choose Colors */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Code Couleur Visuelle</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setNewCatColor(c)}
                    className="w-6 h-6 rounded-full border border-slate-300 focus:outline-none flex items-center justify-center transition hover:scale-110 active:scale-95"
                    style={{ backgroundColor: c }}
                  >
                    {newCatColor === c && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition self-end"
            >
              Ajouter au Répartiteur
            </button>
          </div>
        </form>
      )}

      {/* List / Slider segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const allocatedVal = (totalBudget * cat.percentage) / 100;
          const isLocked = lockedIds.has(cat.id);

          return (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-200 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold shadow"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.name.substring(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{cat.name}</h4>
                    <span className="text-[11px] text-slate-400 font-medium">Pourcentage : {cat.percentage}%</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Lock Indicator to support auto balance slider restriction */}
                  <button
                    type="button"
                    onClick={() => toggleLock(cat.id)}
                    className={`p-1.5 rounded-lg border transition ${
                      isLocked
                        ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                    }`}
                    title={isLocked ? "Catégorie verrouillée lors du rééquilibrage" : "Verrouiller le pourcentage"}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete category */}
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 rounded-lg transition"
                    title="Supprimer la catégorie"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Slider representation */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Enveloppe Postée</span>
                  <span className="font-extrabold text-slate-900">{allocatedVal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cat.percentage}
                    onChange={(e) => handleSliderChange(cat.id, Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-100 accent-indigo-600 focus:outline-none cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800 w-8 text-right pr-1">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
