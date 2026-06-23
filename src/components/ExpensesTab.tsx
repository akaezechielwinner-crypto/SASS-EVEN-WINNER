import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, CheckCircle, Clock, Check, RefreshCw, X, ChevronDown, Filter } from 'lucide-react';
import { ExpenseItem, Category, EventDetails } from '../types';

interface ExpensesTabProps {
  event: EventDetails;
  onUpdateExpenses: (items: ExpenseItem[]) => void;
}

export default function ExpensesTab({ event, onUpdateExpenses }: ExpensesTabProps) {
  const { categories, expenses, totalBudget } = event;

  // Search & Filter local states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Multi-state form for adding / editing
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'paid' | 'pending'>('pending');
  const [notes, setNotes] = useState('');

  // Submit adding or editing
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount === '' || amount <= 0 || !categoryId) return;

    if (editId) {
      // Edit mode
      const updated = expenses.map(item => {
        if (item.id === editId) {
          return {
            ...item,
            name: name.trim(),
            amount: Number(amount),
            categoryId,
            status,
            notes: notes.trim() || undefined
          };
        }
        return item;
      });
      onUpdateExpenses(updated);
      setEditId(null);
    } else {
      // Add mode
      const newItem: ExpenseItem = {
        id: `exp-${Date.now()}`,
        name: name.trim(),
        amount: Number(amount),
        categoryId,
        status,
        notes: notes.trim() || undefined
      };
      onUpdateExpenses([...expenses, newItem]);
    }

    // Reset fields
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setCategoryId('');
    setStatus('pending');
    setNotes('');
    setEditId(null);
    setShowForm(false);
  };

  // Launch edit mode with populated fields
  const startEdit = (item: ExpenseItem) => {
    setName(item.name);
    setAmount(item.amount);
    setCategoryId(item.categoryId);
    setStatus(item.status);
    setNotes(item.notes || '');
    setEditId(item.id);
    setShowForm(true);
  };

  // Delete item
  const handleDelete = (id: string) => {
    const updated = expenses.filter(item => item.id !== id);
    onUpdateExpenses(updated);
  };

  // Inline toggle status click
  const toggleStatus = (item: ExpenseItem) => {
    const updated = expenses.map(i => {
      if (i.id === item.id) {
        return { ...i, status: i.status === 'paid' ? 'pending' : 'paid' as 'paid' | 'pending' };
      }
      return i;
    });
    onUpdateExpenses(updated);
  };

  // Filter logic
  const filteredExpenses = expenses.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategoryFilter === 'all' || item.categoryId === selectedCategoryFilter;
    const matchesStatus = selectedStatusFilter === 'all' || item.status === selectedStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate sum of active list
  const filteredTotal = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Search filters and Add button row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              id="search-expenses"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une dépense ou mémos..."
              className="w-full text-xs font-medium border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center space-x-1 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50/50">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="text-xs font-bold text-slate-600 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes Catégories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50/50">
              <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-xs font-bold text-slate-600 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">Tous Statuts</option>
                <option value="paid">Payé uniquement</option>
                <option value="pending">En attente uniquement</option>
              </select>
            </div>

            {/* Quick add trigger button */}
            <button
              onClick={() => {
                if (showForm && editId) {
                  resetForm();
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 px-4 rounded-xl font-bold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Saisir une Dépense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Saisie detailed expense panel */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-sm font-bold text-slate-800">
              {editId ? "Modifier l'article de dépense" : "Saisir une nouvelle dépense"}
            </span>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Expense Name */}
            <div className="space-y-1 md:col-span-5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Intitulé Dépense</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Location de chapiteau 10x15m, Traiteur buffet de poisson"
                className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
              />
            </div>

            {/* Estimated expense amount */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Montant (FCFA)</label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value !== '' ? Number(e.target.value) : '')}
                placeholder="0.00"
                className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category Selector */}
            <div className="space-y-1 md:col-span-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Classer sous Catégorie</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionnez...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat.percentage}%)</option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">État Paiement</label>
              <div className="flex bg-white rounded-xl border border-slate-300 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`flex-1 py-2.5 text-center transition font-bold ${status === 'pending' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  En attente
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('paid')}
                  className={`flex-1 py-2.5 text-center transition font-bold ${status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Payé
                </button>
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Ajouter des Mémos / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex. Contact prestataire: Marc 0612345678, caution de 500 000 FCFA versée"
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-md transition"
            >
              {editId ? "Sauvegarder" : "Saisir l'article"}
            </button>
          </div>
        </form>
      )}

      {/* List display */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-semibold">Aucune dépense ne correspond aux critères.</p>
            <p className="text-xs text-slate-400 mt-1">Saisissez votre première dépense en cliquant sur "Saisir une Dépense" ci-dessus ou importez des suggestions intelligentes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-5">Intitulé Dépense</th>
                  <th className="py-4 px-5">Catégorie</th>
                  <th className="py-4 px-5">Montant (FCFA)</th>
                  <th className="py-4 px-5">État</th>
                  <th className="py-4 px-5">Note/Mémo</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredExpenses.map((itm) => {
                  const cat = categories.find(c => c.id === itm.categoryId);
                  
                  return (
                    <tr key={itm.id} className="hover:bg-slate-50/50 transition">
                      {/* Name */}
                      <td className="py-4.5 px-5 select-none font-semibold text-slate-800">
                        {itm.name}
                      </td>

                      {/* Category Badge */}
                      <td className="py-4.5 px-5">
                        {cat ? (
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white/95" style={{ backgroundColor: cat.color }}>
                            <span>{cat.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium italic">Sans catégorie</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4.5 px-5 font-bold text-slate-900">
                        {itm.amount.toLocaleString('fr-FR')} FCFA
                      </td>

                      {/* Status Toggle clickable */}
                      <td className="py-4.5 px-5 select-none">
                        <button
                          type="button"
                          onClick={() => toggleStatus(itm)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition ${
                            itm.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/60'
                          }`}
                        >
                          {itm.status === 'paid' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Payé</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>En attente</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Notes optional */}
                      <td className="py-4.5 px-5 max-w-xs truncate text-[11px] text-slate-400 font-medium">
                        {itm.notes || "-"}
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => startEdit(itm)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                            title="Modifier l'article"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(itm.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer la dépense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info total count */}
        {filteredExpenses.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-100 px-5 py-4 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Affichage de {filteredExpenses.length} sur {expenses.length} dépenses
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">Somme affichée :</span>
              <span className="font-extrabold text-slate-800 text-sm">
                {filteredTotal.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
