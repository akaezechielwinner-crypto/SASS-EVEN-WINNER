import React, { useState } from 'react';
import { Sparkles, ArrowRight, HelpCircle, AlertCircle, Wand2, RefreshCw, Check, Calendar, ChevronRight } from 'lucide-react';
import { TEMPLATE_EVENTS, Category, ExpenseItem, EventDetails } from '../types';

interface AiPlannerTabProps {
  event: EventDetails;
  onApplyTemplate: (name: string, categories: Category[], recommendedExpenses?: ExpenseItem[]) => void;
}

export default function AiPlannerTab({ event, onApplyTemplate }: AiPlannerTabProps) {
  const { totalBudget } = event;
  
  // AI Generator state
  const [customDescription, setCustomDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Staging area for AI output
  const [generatedData, setGeneratedData] = useState<{
    categories: { name: string; percentage: number; explanation: string }[];
    suggestedExpenses: { name: string; categoryName: string; amount: number; notes: string }[];
  } | null>(null);

  // Apply predefined templates
  const handleApplyPredefined = (template: typeof TEMPLATE_EVENTS[0]) => {
    // Generate recommended expenses for this template based on percentages
    const recommendedExpenses: ExpenseItem[] = [];
    
    // Simple logic to add draft expenses for standard templates
    template.categories.forEach(cat => {
      const catAmount = (totalBudget * cat.percentage) / 100;
      
      recommendedExpenses.push({
        id: `exp-template-${cat.id}-base`,
        name: `Prestation Principale - ${cat.name}`,
        categoryId: cat.id,
        amount: Math.round(catAmount * 0.8),
        status: 'pending',
        notes: `Estival de base pour ${cat.name}`
      });
      recommendedExpenses.push({
        id: `exp-template-${cat.id}-supp`,
        name: `Frais annexes - ${cat.name}`,
        categoryId: cat.id,
        amount: Math.round(catAmount * 0.2),
        status: 'pending',
        notes: 'Marge de sécurité'
      });
    });

    onApplyTemplate(template.name, template.categories, recommendedExpenses);
    setGeneratedData(null); // Clear AI staging
  };

  // call Express API route for AI allocation
  const handleGenerateWithAi = async () => {
    if (!customDescription.trim()) return;
    setIsGenerating(true);
    setErrorMessage('');
    setGeneratedData(null);

    try {
      const response = await fetch('/api/ai-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalBudget,
          description: customDescription.trim()
        }),
      });

      if (!response.ok) {
        throw new Error("L'intelligence artificielle a rencontré une lenteur d'analyse. Veuillez réessayer.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedData(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erreur de communication avec l'assistant IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert and Apply staging AI allocation
  const handleApplyAiBudget = () => {
    if (!generatedData) return;

    // Convert generated schema to official types
    const mappedCategories: Category[] = generatedData.categories.map((cat, idx) => {
      const colors = ['#4F46E5', '#10B981', '#EC4899', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#06B6D4'];
      const icons = ['Home', 'Utensils', 'Sparkles', 'Music', 'Users', 'Truck', 'Camera', 'Gift'];
      return {
        id: `cat-ai-${idx}`,
        name: cat.name,
        percentage: cat.percentage,
        color: colors[idx % colors.length],
        icon: icons[idx % icons.length]
      };
    });

    const mappedExpenses: ExpenseItem[] = generatedData.suggestedExpenses.map((exp, idx) => {
      // Find parent category ID matching the name
      const foundCat = mappedCategories.find(c => c.name === exp.categoryName);
      return {
        id: `exp-ai-${idx}`,
        name: exp.name,
        categoryId: foundCat ? foundCat.id : (mappedCategories[0]?.id || 'cat-ai-0'),
        amount: exp.amount,
        status: 'pending',
        notes: exp.notes
      };
    });

    onApplyTemplate(`IA : ${customDescription.substring(0, 30)}...`, mappedCategories, mappedExpenses);
    setGeneratedData(null);
    setCustomDescription('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* AI Prompting Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-800">Planificateur Intelligent par IA</h3>
        </div>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Saisissez les détails de votre évènement (lieu, nombre d'invités, thème, exigences particulières) et notre IA calculera les lignes budgétaires optimales adaptées à votre budget total de <strong>{totalBudget.toLocaleString('fr-FR')} FCFA</strong>.
        </p>

        <div className="space-y-3">
          <textarea
            id="ai-prompt-input"
            rows={3}
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            disabled={isGenerating}
            placeholder="Ex : Un mariage de princesse pour 150 personnes dans un château du Loiret, avec traiteur raffiné, photographe professionnel toute la journée, et un grand spectacle de feux d'artifice..."
            className="w-full text-xs font-medium border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl p-4 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none min-h-[80px]"
          />

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium">
              Alimenté par <span className="font-semibold text-indigo-600">Gemini 3.5 Flash Model</span>
            </span>
            <button
              type="button"
              onClick={handleGenerateWithAi}
              disabled={isGenerating || !customDescription.trim()}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs py-2.5 px-4 rounded-xl font-bold transition shadow-md cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyse & calculs en cours...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Générer le Budget par l'IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Loader Reassurance message during Gemini Fetch */}
      {isGenerating && (
        <div className="bg-slate-50/80 rounded-2xl p-10 border border-slate-200 text-center space-y-4">
          <div className="inline-block relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-slate-100"></div>
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <p className="text-sm font-semibold text-slate-800">Modélisation de l'évènement...</p>
            <p className="text-xs text-slate-500">Gemini segmente votre budget de {totalBudget.toLocaleString('fr-FR')} FCFA et estime l'ensemble des postes prestataires cohérents.</p>
          </div>
        </div>
      )}

      {/* Staged AI response display */}
      {!isGenerating && generatedData && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-50 flex-wrap gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Proposition Générée par l'IA</span>
              <h4 className="text-sm font-bold text-slate-800">Rationnalisation de l'IA pour votre Enveloppe</h4>
            </div>
            <button
              onClick={handleApplyAiBudget}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-4 rounded-xl font-bold transition shadow-md cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Appliquer cette Répartition IA</span>
            </button>
          </div>

          {/* Staged Categories & explanations */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest leading-none">Répartitions Recommandées</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedData.categories.map((cat, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{cat.name}</span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{cat.percentage}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{cat.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Staged detailed items */}
          <div className="space-y-3 pt-3 border-t border-slate-50">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest leading-none">Détails Estimés des Devis Possibles</h5>
            <div className="bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100 divide-y divide-slate-100">
              {generatedData.suggestedExpenses.map((exp, idx) => (
                <div key={idx} className="p-3 text-xs flex justify-between items-center flex-wrap gap-2 hover:bg-white/50 transition">
                  <div>
                    <span className="font-bold text-slate-800 block">{exp.name}</span>
                    <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Segment : {exp.categoryName} {exp.notes ? `| ${exp.notes}` : ''}</span>
                  </div>
                  <span className="font-bold text-slate-700 shrink-0">{exp.amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Predefined Templates Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <span>Modèles d'Évènements Traditionnels</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATE_EVENTS.map(tmpl => (
            <div
              key={tmpl.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-200 transition group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">{tmpl.name}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{tmpl.categories.length} catégories</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">{tmpl.description}</p>
              </div>

              {/* Percentage Pill highlights */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tmpl.categories.slice(0, 3).map(c => (
                  <span key={c.id} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {c.name} : {c.percentage}%
                  </span>
                ))}
                {tmpl.categories.length > 3 && (
                  <span className="text-[10px] font-bold text-indigo-500">+{tmpl.categories.length - 3}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleApplyPredefined(tmpl)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2 px-3 text-xs rounded-xl flex items-center justify-center space-x-1 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition"
              >
                <span>Utiliser cette Grille de Répartition</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
