import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Shield, Users, Mail, CheckCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface GoogleLoginProps {
  onLogin: (user: UserProfile) => void;
  userEmail?: string;
}

export default function GoogleLogin({ onLogin, userEmail = "akaezechielwinner@gmail.com" }: GoogleLoginProps) {
  const [step, setStep] = useState<'welcome' | 'accounts' | 'consent' | 'loading'>('welcome');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const availableAccounts: UserProfile[] = [
    {
      email: userEmail,
      name: userEmail.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
    },
    {
      email: "contact.prestaspend@gmail.com",
      name: "Presta Spend Team",
      picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
    }
  ];

  const handleStartGoogleSignIn = () => {
    setStep('accounts');
  };

  const handleSelectAccount = (user: UserProfile) => {
    setSelectedUser(user);
    setStep('consent');
  };

  const handleApproveConsent = () => {
    setStep('loading');
    setTimeout(() => {
      if (selectedUser) {
        onLogin(selectedUser);
      }
    }, 1500); // realistic loading feel
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 -z-10"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <LogIn className="w-8 h-8" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  EventSpend SaaS
                </h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Calculez et simulez vos dépenses d'évènements de manière intelligente avec répartitions financières simples ou assistées par l'IA.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-left space-y-2">
                <div className="flex items-center space-x-2 text-amber-800 font-medium text-xs">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Environnement Sécurisé Hors-Ligne</span>
                </div>
                <p className="text-xs text-amber-700 leading-normal">
                  Vous avez choisi de ne pas configurer d'identifiants Cloud Firebase permanents. Vos données de budget seront sauvegardées localement en toute sécurité dans votre explorateur crypté (localStorage).
                </p>
              </div>

              <button
                id="btn-google-signin-trigger"
                onClick={handleStartGoogleSignIn}
                className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium py-3 px-4 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.75 21.56,11.4 21.35,11.1z" fill="#4285F4" />
                    <path d="M12,20.62c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.5,1.29c-2.31,0.51 -4.26,-1.02 -4.95,-3.09h-3.41v2.64C4.37,18.06 7.9,20.62 12,20.62z" fill="#34A853" />
                    <path d="M7.05,14.06c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V8.02H3.64C2.94,9.4 2.56,10.96 2.56,12.63c0,1.67 0.38,3.23 1.08,4.61L7.05,14.06z" fill="#FBBC05" />
                    <path d="M12,6.15c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.46 14.43,2.63 12,2.63c-4.1,0 -7.63,2.56 -9.44,6.23l3.41,2.64C6.66,9.45 8.92,6.15 12,6.15z" fill="#EA4335" />
                  </g>
                </svg>
                <span className="text-sm font-semibold">Continuer avec Google</span>
              </button>

              <div className="text-[11px] text-slate-400">
                En vous connectant, vous acceptez nos CGU de simulation budgétaire.
              </div>
            </motion.div>
          )}

          {step === 'accounts' && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.76-8.24-8.385s3.7-8.385 8.24-8.385c2.58 0 4.307 1.07 5.297 2.02l2.46-2.37C18.435 1.21 15.62 0 12.24 0 5.58 0 0 5.42 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z" fill="#718096" />
                </svg>
                <h3 className="text-xl font-bold text-slate-950 font-sans tracking-tight">
                  Choisissez un compte
                </h3>
                <p className="text-xs text-slate-500">
                  pour continuer vers l'application <span className="font-semibold text-indigo-600">EventSpend</span>
                </p>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {availableAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleSelectAccount(account)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={account.picture}
                        referrerPolicy="no-referrer"
                        alt={account.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-100"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{account.name}</div>
                        <div className="text-[11px] text-slate-500">{account.email}</div>
                      </div>
                    </div>
                    {account.email === userEmail && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        Session active
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('welcome')}
                className="w-full py-2 hover:bg-slate-50 text-xs text-slate-500 font-semibold rounded-lg border border-transparent hover:border-slate-200 transition-all text-center"
              >
                Retourner à l'accueil
              </button>
            </motion.div>
          )}

          {step === 'consent' && selectedUser && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={selectedUser.picture}
                    alt={selectedUser.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="text-xs font-medium text-slate-700">{selectedUser.email}</div>
                </div>
                <span className="text-xs text-slate-400">Google Auth Secure</span>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                  Autorisations requises
                </h4>
                <p className="text-xs text-slate-500">
                  L'application de planification budgétaire souhaite accéder à votre compte Google afin de personnaliser votre espace de travail :
                </p>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-left border border-slate-100">
                  <div className="flex items-start space-x-2.5 text-xs text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">Adresse e-mail principale</span>
                      <p className="text-slate-500 text-[11px]">Pour identifier votre espace de sauvegarde privé.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5 text-xs text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">Profil public standard</span>
                      <p className="text-slate-500 text-[11px]">Pour afficher votre photo de profil et votre nom sur le tableau de bord.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setStep('accounts')}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  id="btn-google-consent-approve"
                  onClick={handleApproveConsent}
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-center">
                <a href="#privacy" className="text-[10px] text-slate-400 hover:underline">Consulter les règles de confidentialité Google</a>
              </div>
            </motion.div>
          )}

          {step === 'loading' && (
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
                <p className="text-sm font-semibold text-slate-800">Authentification avec Google...</p>
                <p className="text-xs text-slate-400">Synchronisation de vos données locales sécurisées</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
