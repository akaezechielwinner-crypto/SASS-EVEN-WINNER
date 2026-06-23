import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DollarSign, Wallet, CheckCircle, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { EventDetails, Category } from '../types';
import GoogleSheetsSync from './GoogleSheetsSync';

interface OverviewTabProps {
  event: EventDetails;
  onBudgetChange: (val: number) => void;
  onImportBudget: (importedEvent: EventDetails) => void;
}

export default function OverviewTab({ event, onBudgetChange, onImportBudget }: OverviewTabProps) {
  const { totalBudget, categories, expenses } = event;

  // 1. Calculations
  const totalAllocated = categories.reduce((acc, cat) => acc + (totalBudget * cat.percentage / 100), 0);
  const totalAllocatedPercentage = categories.reduce((acc, cat) => acc + cat.percentage, 0);
  
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const paidExpenses = expenses.filter(exp => exp.status === 'paid').reduce((acc, exp) => acc + exp.amount, 0);
  const pendingExpenses = expenses.filter(exp => exp.status === 'pending').reduce((acc, exp) => acc + exp.amount, 0);

  const budgetRemaining = totalBudget - totalExpenses;
  const savingProgress = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  // 2. Format Category Data for Recharts
  const categoryChartData = categories.map(cat => {
    const allocatedAmount = (totalBudget * cat.percentage) / 100;
    const realSpent = expenses
      .filter(exp => exp.categoryId === cat.id)
      .reduce((acc, exp) => acc + exp.amount, 0);

    return {
      name: cat.name,
      allocated: Math.round(allocatedAmount),
      spent: Math.round(realSpent),
      color: cat.color,
      percentage: cat.percentage
    };
  });

  // 3. Alerts for category overrun
  const alerts = categories.map(cat => {
    const allocatedAmount = (totalBudget * cat.percentage) / 100;
    const realSpent = expenses
      .filter(exp => exp.categoryId === cat.id)
      .reduce((acc, exp) => acc + exp.amount, 0);

    return {
      categoryName: cat.name,
      allocated: allocatedAmount,
      spent: realSpent,
      exceededBy: realSpent - allocatedAmount
    };
  }).filter(a => a.exceededBy > 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Target input top-card */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,40 70,60 100,0 L100,100 Z" fill="white" />
          </svg>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-indigo-100 text-xs font-semibold uppercase tracking-wider">Budget Global de l'Évènement</span>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-extrabold tracking-tight">
                {totalBudget.toLocaleString('fr-FR')} FCFA
              </span>
              <div className="text-indigo-200 text-xs bg-indigo-700/40 px-2.5 py-1 rounded-full border border-indigo-400/20 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Distribué à {totalAllocatedPercentage}%</span>
              </div>
            </div>
            <p className="text-indigo-100 text-xs max-w-lg">
              Saisissez votre enveloppe budgétaire globale. Le système répartira cette somme automatiquement selon les pourcentages définis pour chaque poste de dépenses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                id="input-global-budget"
                type="number"
                min="100"
                step="500"
                value={totalBudget || ''}
                onChange={(e) => onBudgetChange(Number(e.target.value))}
                className="bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-white rounded-xl py-3 pl-4 pr-16 text-lg font-bold placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-inner w-64 transform transition"
                placeholder="Ex Enveloppe: 15000000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 font-bold text-sm">FCFA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Allocations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Somme Allouée</span>
            <span className="text-xl font-bold text-slate-800">
              {totalAllocated.toLocaleString('fr-FR')} FCFA
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Dispatched into {categories.length} segments
            </span>
          </div>
        </div>

        {/* Expenses Real */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Dépenses Réelles</span>
            <span className="text-xl font-bold text-slate-800">
              {totalExpenses.toLocaleString('fr-FR')} FCFA
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              {expenses.length} articles saisis au total
            </span>
          </div>
        </div>

        {/* Paid and Clean */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Total Payé</span>
            <span className="text-xl font-bold text-slate-800">
              {paidExpenses.toLocaleString('fr-FR')} FCFA
            </span>
            <span className="text-xs text-slate-500 block mt-0.5 text-emerald-600 font-medium">
              En attente : {pendingExpenses.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        {/* Remaining of total sum */}
        <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 ${budgetRemaining < 0 ? 'bg-red-50/25 border-red-200' : ''}`}>
          <div className={`p-3.5 rounded-xl ${budgetRemaining < 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Reste Enveloppe</span>
            <span className={`text-xl font-bold ${budgetRemaining < 0 ? 'text-red-600 font-extrabold' : 'text-slate-800'}`}>
              {budgetRemaining.toLocaleString('fr-FR')} FCFA
            </span>
            <span className={`text-xs block mt-0.5 font-semibold ${budgetRemaining < 0 ? 'text-red-500' : 'text-slate-500'}`}>
              {budgetRemaining < 0 ? 'Dépassement du budget !' : 'Budget de secours disponible'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts & Overrun Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recharts comparison bar chart (Cible vs Réel) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Répartition par Catégorie</h4>
              <p className="text-xs text-slate-400">Budget Théorique (Cible) vs Dépenses Réelles pour chaque poste</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">En direct</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" F" />
                <Tooltip
                  formatter={(value: any) => [`${value.toLocaleString('fr-FR')} FCFA`]}
                  contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', fontFamily: 'sans-serif', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="allocated" name="Budget Cible" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Dépenses Réelles" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Pie Distribution Chart of target percentages */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800">Ciblage du Budget (%)</h4>
            <p className="text-xs text-slate-400">Répartition théorique des objectifs financiers</p>
          </div>

          {totalAllocatedPercentage === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                <AlertTriangle className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-xs">Aucune catégorie existante pour générer le diagramme.</p>
            </div>
          ) : (
            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="spent"
                    nameKey="name"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: string) => [`${value.toLocaleString('fr-FR')} FCFA`, name]}
                    contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-slate-800">{totalAllocatedPercentage}%</span>
                <span className="text-[10px] text-slate-400 block font-medium">Planifié</span>
              </div>
            </div>
          )}

          {/* Simple Legend lists below pie chart */}
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {categories.slice(0, 4).map((cat) => (
              <div key={cat.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-600 truncate max-w-[120px]">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-500">{cat.percentage}%</span>
              </div>
            ))}
            {categories.length > 4 && (
              <div className="text-[10px] text-slate-400 text-center font-medium">
                + {categories.length - 4} autres catégories
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overrun Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100">
          <div className="flex items-center space-x-2 text-red-800 font-bold mb-3 text-sm">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            <span>Postes de dépenses en dépassement budgétaire</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-red-50 shadow-sm flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">{alert.categoryName}</span>
                  <p className="text-[11px] text-slate-500">
                    Cible : <span className="font-semibold text-slate-700">{Math.round(alert.allocated).toLocaleString('fr-FR')} FCFA</span> | Réel : <span className="font-semibold text-red-600">{Math.round(alert.spent).toLocaleString('fr-FR')} FCFA</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-red-700 font-extrabold bg-red-100/60 px-2.5 py-1 rounded inline-block text-[11px]">
                    +{Math.round(alert.exceededBy).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google Sheets Live synchronization widget */}
      <GoogleSheetsSync event={event} onImportBudget={onImportBudget} />
    </div>
  );
}
