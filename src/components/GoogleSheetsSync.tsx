import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  ArrowUpRight, 
  RefreshCw, 
  DownloadCloud, 
  Check, 
  ExternalLink, 
  Lock, 
  ArrowDownLeft,
  Search,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { googleSignIn, getAccessToken, logout } from '../lib/googleAuth';
import { listUserSpreadsheets, exportBudgetToGoogleSheet, importBudgetFromGoogleSheet } from '../lib/googleSheets';
import { EventDetails } from '../types';

interface GoogleSheetsSyncProps {
  event: EventDetails;
  onImportBudget: (importedEvent: EventDetails) => void;
}

export default function GoogleSheetsSync({ event, onImportBudget }: GoogleSheetsSyncProps) {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Google sheets listing & select state
  const [spreadsheets, setSpreadsheets] = useState<{ id: string; name: string; modifiedTime: string }[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState<string>('');
  const [manualSheetId, setManualSheetId] = useState<string>('');
  
  // Interaction outcomes
  const [isExporting, setIsExporting] = useState(false);
  const [latestExportResult, setLatestExportResult] = useState<{ id: string; url: string; name: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState('');

  // Auto-check if we already have an active access token in session storage
  useEffect(() => {
    const activeToken = getAccessToken();
    if (activeToken) {
      setToken(activeToken);
      fetchUserSheets(activeToken);
    }
  }, []);

  // Handle Sign in with Google
  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    setErrorMessage('');
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setImportSuccessMessage('Connexion Google Sheets établie avec succès !');
        setTimeout(() => setImportSuccessMessage(''), 4000);
        fetchUserSheets(result.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Échec d'autorisation Google. Veuillez accorder les permissions requises pour les feuilles de calcul.");
    } finally {
      setIsAuthorizing(false);
    }
  };

  // List users google sheets
  const fetchUserSheets = async (accessToken: string) => {
    setIsLoadingSheets(true);
    setErrorMessage('');
    try {
      const list = await listUserSpreadsheets(accessToken);
      setSpreadsheets(list);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'UNAUTHORIZED') {
        // Clear expired token
        setToken(null);
        sessionStorage.removeItem('g_access_token');
      } else {
        setErrorMessage("Impossible de lister vos feuilles Google Sheets. Veuillez actualiser.");
      }
    } finally {
      setIsLoadingSheets(false);
    }
  };

  // Perform Google Sheet export
  const handleExport = async () => {
    if (!token) return;
    setIsExporting(true);
    setErrorMessage('');
    setLatestExportResult(null);
    try {
      const result = await exportBudgetToGoogleSheet(token, event);
      setLatestExportResult({
        id: result.spreadsheetId,
        url: result.spreadsheetUrl,
        name: `EventCalc Budget - ${event.name}`
      });
    } catch (err: any) {
      console.error(err);
      if (err.message === 'UNAUTHORIZED') {
        setToken(null);
        setErrorMessage("Votre session Google a expiré. Veuillez vous reconnecter.");
      } else {
        setErrorMessage("Erreur lors de l'export de votre budget vers Google Sheets. Veuillez réessayer.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Perform Google Sheet import
  const handleImport = async () => {
    const sheetIdToUse = manualSheetId.trim() || selectedSheetId;
    if (!token || !sheetIdToUse) {
      setErrorMessage("Veuillez sélectionner une feuille de calcul existante ou coller un ID valide.");
      return;
    }

    // MANDATORY USER CONFIRMATION before destructive operation
    const confirmed = window.confirm(
      `⚠️ ATTENTION : Vous allez importer un budget depuis Google Sheets.\n\nCette action va remplacer l'intégralité de vos postes de dépenses, allocations et statuts de paiement actuels pour "${event.name}".\n\nVoulez-vous continuer ?`
    );
    if (!confirmed) return;

    setIsImporting(true);
    setErrorMessage('');
    setImportSuccessMessage('');
    try {
      const importedBudget = await importBudgetFromGoogleSheet(token, sheetIdToUse);
      
      // Inject imported categories & expenses into global state callback
      onImportBudget(importedBudget);
      
      setImportSuccessMessage(`Félicitations ! Le budget "${importedBudget.name}" a été importé avec succès (${importedBudget.categories.length} catégories, ${importedBudget.expenses.length} dépenses).`);
      setTimeout(() => setImportSuccessMessage(''), 8000);
      
      // Reset sheet selection
      setSelectedSheetId('');
      setManualSheetId('');
    } catch (err: any) {
      console.error(err);
      if (err.message === 'UNAUTHORIZED') {
        setToken(null);
        setErrorMessage("Votre session Google a expiré. Veuillez vous re-connecter.");
      } else {
        setErrorMessage(err.message || "Erreur critique d'importation. Assurez-vous que l'onglet 'Aperçu Budgétaire' existe dans le tableur.");
      }
    } finally {
      setIsImporting(false);
    }
  };

  // Disconnect drive session
  const handleDisconnect = async () => {
    await logout();
    setToken(null);
    setSpreadsheets([]);
    setLatestExportResult(null);
    setSelectedSheetId('');
    setManualSheetId('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      
      {/* Module Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow shadow-emerald-100">
            <FileSpreadsheet className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-800">Synchronisation Google Sheets</h4>
            <p className="text-[10px] text-slate-500 font-medium">Expatriez et rapatriez vos calculs de budget depuis de véritables tableurs Google en temps réel.</p>
          </div>
        </div>

        {token && (
          <button 
            onClick={handleDisconnect}
            className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition"
          >
            Déconnecter
          </button>
        )}
      </div>

      {/* Connection trigger if not authorized */}
      {!token ? (
        <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 text-center space-y-4">
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-center">
              <span className="p-3 bg-indigo-50 text-indigo-600 rounded-full inline-block">
                <Lock className="w-6 h-6" />
              </span>
            </div>
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Compte Google Obligatoire</h5>
            <p className="text-xs text-slate-500 leading-normal">
              Afin de sauvegarder vos devis ou configurer de nouvelles lignes budgétaires via Google Sheets, connectez en toute sécurité votre compte Google avec les accès de modifications requis.
            </p>
          </div>

          <div className="flex justify-center pt-1">
            <button
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              className="flex items-center space-x-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold py-2.5 px-5 rounded-xl shadow-md transition-all cursor-pointer hover:border-indigo-300 disabled:opacity-50"
            >
              {isAuthorizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-xs">Autorisation en cours...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.75 21.56,11.4 21.35,11.1z" fill="#4285F4" />
                    <path d="M12,20.62c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.5,1.29c-2.31,0.51 -4.26,-1.02 -4.95,-3.09h-3.41v2.64C4.37,18.06 7.9,20.62 12,20.62z" fill="#34A853" />
                    <path d="M7.05,14.06c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V8.02H3.64C2.94,9.4 2.56,10.96 2.56,12.63c0,1.67 0.38,3.23 1.08,4.61L7.05,14.06z" fill="#FBBC05" />
                    <path d="M12,6.15c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.46 14.43,2.63 12,2.63c-4.1,0 -7.63,2.56 -9.44,6.23l3.41,2.64C6.66,9.45 8.92,6.15 12,6.15z" fill="#EA4335" />
                  </svg>
                  <span className="text-xs">Lier mon compte Google Drive & Sheets</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Connected Workspace panel controls */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Block: Export to Sheets */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-wide leading-none inline-block">Moteur d'Exportation</span>
              <h5 className="text-xs font-bold text-slate-800">Exporter le Budget Actuel</h5>
              <p className="text-[11px] text-slate-500 leading-normal">
                Cette action va générer un classeur Google Sheet structuré avec vos graphiques, catégories de pourcentages et la liste exhaustive de vos dépenses saisies.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-sm cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Création du tableur en cours...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Créer un tableur Google Sheets</span>
                  </>
                )}
              </button>
            </div>

            {/* Display export outcome details */}
            {latestExportResult && (
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 space-y-2 mt-2">
                <div className="flex items-start space-x-2 text-[11px] text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-bold">Tableur créé avec succès !</span>
                    <p className="text-emerald-700 font-mono text-[9px] mt-0.5 truncate">{latestExportResult.name}</p>
                  </div>
                </div>

                <a
                  href={latestExportResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition"
                >
                  <span>Ouvrir Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Right Block: Import from Sheets */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-wide leading-none inline-block">Moteur d'Importation</span>
              <h5 className="text-xs font-bold text-slate-800">Importer depuis Sheets</h5>
              <p className="text-[11px] text-slate-500 leading-normal">
                Récupérez un modèle budgétaire EventCalc stocké sur votre Drive. L'onglet principal doit comporter la structure de lignes budget / catégories.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {/* Select dropdown from Google sheets listing */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold block uppercase leading-none">Sélectionner dans Drive</label>
                {isLoadingSheets ? (
                  <div className="text-center py-2 text-xs text-slate-400 font-medium">Chargement des fichiers...</div>
                ) : spreadsheets.length === 0 ? (
                  <div className="text-[11px] text-slate-400 py-1 font-medium bg-slate-100 rounded px-2">Aucun budget Sheets détecté dans votre Drive.</div>
                ) : (
                  <select
                    id="select-user-spreadsheets"
                    value={selectedSheetId}
                    onChange={(e) => {
                      setSelectedSheetId(e.target.value);
                      if (e.target.value) setManualSheetId(''); // Clear manual to avoid confusion
                    }}
                    className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                  >
                    <option value="">-- Choisir un tableur --</option>
                    {spreadsheets.map(sheet => (
                      <option key={sheet.id} value={sheet.id}>
                        {sheet.name} ({new Date(sheet.modifiedTime).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Manual input for sheet ID just in case user has custom links */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase leading-none">Ou via ID Spreadsheet</label>
                  <span className="text-[9px] text-slate-400">ID dans l'URL du fichier</span>
                </div>
                <input
                  id="input-manual-sheet-id"
                  type="text"
                  value={manualSheetId}
                  onChange={(e) => {
                    setManualSheetId(e.target.value);
                    if (e.target.value) setSelectedSheetId(''); // Clear dropdown to prioritize ID
                  }}
                  placeholder="ID : 1aBcDeFgHiJkLmNoP..."
                  className="w-full text-[11px] bg-white border border-slate-200 focus:border-indigo-500 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleImport}
                disabled={isImporting || (!selectedSheetId && !manualSheetId.trim())}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-sm cursor-pointer mt-2"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Lecture et analyse en cours...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Lancer l'importation de budget</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Notifications of actions */}
      {errorMessage && (
        <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-100 flex items-start space-x-2">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {importSuccessMessage && (
        <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-xl border border-emerald-100 flex items-start space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 text-emerald-500 mt-0.5" />
          <span className="font-medium">{importSuccessMessage}</span>
        </div>
      )}

    </div>
  );
}
