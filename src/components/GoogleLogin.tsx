import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, Shield, AlertCircle, Sparkles, CheckCircle2, Info,
  Coins, ArrowRight, ChevronRight, ChevronLeft, Calendar,
  TrendingUp, ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../types';
import { googleSignIn } from '../lib/googleAuth';

interface GoogleLoginProps {
  onLogin: (user: UserProfile) => void;
  userEmail?: string;
}

export default function GoogleLogin({ onLogin, userEmail = "akaezechielwinner@gmail.com" }: GoogleLoginProps) {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [introSlide, setIntroSlide] = useState<number>(0);
  const [step, setStep] = useState<'welcome' | 'loading'>('welcome');
  const [authError, setAuthError] = useState<string>('');

  const slides = [
    {
      title: "Bienvenue sur EventSpend SaaS",
      subtitle: "GESTION DE BUDGET ÉVÈNEMENTIEL EN FCFA",
      description: "Optimisez, organisez et suivez l'ensemble de vos dépenses événementielles en un clin d'œil. Conçu spécifiquement pour s'adapter aux réalités financières d'Afrique francophone.",
      icon: <Coins className="w-8 h-8 text-indigo-600" />,
      color: "from-indigo-500/10 to-purple-500/10",
      borderColor: "border-indigo-100",
      graphic: (
        <div className="relative w-full h-44 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-30"></div>
          {/* Animated floating badges */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute left-6 top-8 bg-white shadow-md rounded-xl p-2.5 border border-slate-100 flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-[10px] font-bold text-emerald-700">F</span>
            </div>
            <span className="text-[10px] font-bold text-slate-700">Budget Réparti</span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
            className="absolute right-6 bottom-10 bg-white shadow-md rounded-xl p-2.5 border border-slate-100 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-bold text-slate-700">Mariages & Galas</span>
          </motion.div>

          {/* Central Pulsing Coin */}
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-200"
            >
              FCFA
            </motion.div>
            <div className="absolute -inset-2 rounded-full border-2 border-indigo-200 animate-ping opacity-30"></div>
          </div>
        </div>
      )
    },
    {
      title: "Intelligence Artificielle intégrée",
      subtitle: "ASSISTANT INTELLIGENT DE PLANIFICATION",
      description: "Décrivez simplement votre évènement (lieu, invités, type de réception) et notre IA génère instantanément une répartition budgétaire intelligente avec conseils de négociation.",
      icon: <Sparkles className="w-8 h-8 text-amber-500" />,
      color: "from-amber-500/10 to-orange-500/10",
      borderColor: "border-amber-100",
      graphic: (
        <div className="relative w-full h-44 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-30"></div>
          
          <div className="w-4/5 space-y-2.5 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-800">Modélisation Gemini AI</span>
              </div>
              <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-semibold">Génération</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-medium">Traiteur & Buffet</span>
                <span className="font-bold text-slate-700">40%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "40%" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-indigo-500"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] pt-1">
                <span className="text-slate-500 font-medium">Location de l'Espace</span>
                <span className="font-bold text-slate-700">35%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "35%" }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Contrôle & Gestion sans Effort",
      subtitle: "ALERTES EN TEMPS RÉEL",
      description: "Visualisez en temps réel l'avancement des dépenses et recevez des alertes immédiates en cas de dépassement pour garder le contrôle total de vos finances.",
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      color: "from-emerald-500/10 to-teal-500/10",
      borderColor: "border-emerald-100",
      graphic: (
        <div className="relative w-full h-44 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] opacity-30"></div>
          
          <div className="w-3/4 bg-white rounded-xl shadow-sm border border-slate-100 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-800">Santé de votre Budget</span>
              <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                Alerte Dépassement
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-slate-400 font-medium">Poste Sono & Déco</span>
                <span className="text-red-600 font-bold">120% Utilisé</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1 }}
                  className="h-full bg-red-500"
                />
              </div>
            </div>

            <div className="text-[10px] text-slate-500 leading-normal bg-slate-50 p-1.5 rounded border border-slate-100/80 text-center">
              Dépassement de <strong className="text-red-600">150 000 FCFA</strong>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNextSlide = () => {
    if (introSlide < slides.length - 1) {
      setIntroSlide(prev => prev + 1);
    } else {
      setShowIntro(false);
    }
  };

  const handlePrevSlide = () => {
    if (introSlide > 0) {
      setIntroSlide(prev => prev - 1);
    }
  };

  // Start real Google popup authentication
  const handleStartGoogleSignIn = async () => {
    setStep('loading');
    setAuthError('');
    try {
      const result = await googleSignIn();
      if (result) {
        const loggedUser: UserProfile = {
          email: result.user.email || '',
          name: result.user.displayName || result.user.email?.split('@')[0] || 'Utilisateur Google',
          picture: result.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
        };
        onLogin(loggedUser);
      } else {
        throw new Error("Authentification annulée ou jeton d'accès manquant.");
      }
    } catch (err: any) {
      console.error("Sign-In Error:", err);
      let errMsg = "Échec de l'authentification avec Google.";
      
      if (err.code === 'auth/popup-blocked') {
        errMsg = "Le bloqueur de fenêtres de votre navigateur a bloqué la popup de connexion Google. Veuillez l'autoriser ou utiliser le mode d'accès direct ci-dessous.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        errMsg = "La tentative de connexion a été annulée.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        errMsg = "La fenêtre de connexion a été fermée avant la fin de l'authentification.";
      } else if (err.message) {
        errMsg = err.message;
      }
      
      setAuthError(errMsg);
      setStep('welcome');
    }
  };

  // Instant fallback Demo Login (Offline / Bypass)
  const handleDemoSignIn = () => {
    const demoUser: UserProfile = {
      email: userEmail,
      name: userEmail.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
    };
    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 -z-10"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Header with skip button */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Découverte EventSpend</span>
                </div>
                <button 
                  onClick={() => setShowIntro(false)} 
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-all cursor-pointer"
                >
                  Passer
                </button>
              </div>

              {/* Animated Carousel Slide content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={introSlide}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Slide Graphic element */}
                  {slides[introSlide].graphic}

                  {/* Slide details */}
                  <div className="space-y-2 text-center pt-2">
                    <span className="inline-block text-[10px] font-extrabold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-full">
                      {slides[introSlide].subtitle}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-950 font-sans tracking-tight">
                      {slides[introSlide].title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      {slides[introSlide].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls and dots */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-1.5">
                  {slides.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === introSlide ? 'w-5 bg-indigo-600' : 'w-1.5 bg-slate-200'}`}
                    />
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  {introSlide > 0 && (
                    <button
                      onClick={handlePrevSlide}
                      className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={handleNextSlide}
                    className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-100 cursor-pointer"
                  >
                    <span>{introSlide === slides.length - 1 ? "Commencer" : "Suivant"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : step === 'welcome' ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner relative">
                  <LogIn className="w-8 h-8" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <Sparkles className="w-2 h-2 text-white" />
                  </motion.div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  EventSpend SaaS
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Calculez et simulez vos dépenses d'évènements de manière intelligente avec répartitions financières simples ou assistées par l'IA.
                </p>
              </div>

              {/* Real Google Auth Error Message Display */}
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-red-50 rounded-xl border border-red-100 text-left space-y-1.5"
                >
                  <div className="flex items-center space-x-2 text-red-800 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Erreur de Connexion</span>
                  </div>
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    {authError}
                  </p>
                </motion.div>
              )}

              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-left space-y-2">
                <div className="flex items-center space-x-2 text-indigo-800 font-semibold text-xs">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Connexion Google Sécurisée</span>
                </div>
                <p className="text-[11px] text-indigo-700/80 leading-normal">
                  Connectez-vous pour enregistrer vos budgets dans la base de données sécurisée et bénéficier des services de planification par intelligence artificielle (Gemini).
                </p>
              </div>

              {/* Main Google Sign-In Button */}
              <button
                id="btn-google-signin-trigger"
                onClick={handleStartGoogleSignIn}
                className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.75 21.56,11.4 21.35,11.1z" fill="#4285F4" />
                    <path d="M12,20.62c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.5,1.29c-2.31,0.51 -4.26,-1.02 -4.95,-3.09h-3.41v2.64C4.37,18.06 7.9,20.62 12,20.62z" fill="#34A853" />
                    <path d="M7.05,14.06c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V8.02H3.64C2.94,9.4 2.56,10.96 2.56,12.63c0,1.67 0.38,3.23 1.08,4.61L7.05,14.06z" fill="#FBBC05" />
                    <path d="M12,6.15c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.46 14.43,2.63 12,2.63c-4.1,0 -7.63,2.56 -9.44,6.23l3.41,2.64C6.66,9.45 8.92,6.15 12,6.15z" fill="#EA4335" />
                  </g>
                </svg>
                <span className="text-sm font-bold text-slate-800">S'inscrire / Se connecter avec Google</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">ou</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Demo Mode Bypass (Extremely robust fallback) */}
              <button
                onClick={handleDemoSignIn}
                className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Accéder directement en mode démonstration</span>
              </button>

              <div className="text-[10px] text-slate-400">
                En vous connectant, vous acceptez nos CGU de simulation budgétaire.
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 space-y-4"
            >
              <div className="inline-block relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-slate-100"></div>
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">Authentification Google en cours...</p>
                <p className="text-xs text-slate-400">Ouverture de la fenêtre de connexion sécurisée Firebase</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
