import { EventDetails, Category, ExpenseItem } from '../types';

export function generateEventPDF(event: EventDetails) {
  const { name, totalBudget, categories, expenses } = event;

  // Calculations
  const totalAllocated = categories.reduce((acc, cat) => acc + (totalBudget * cat.percentage / 100), 0);
  const totalAllocatedPercentage = categories.reduce((acc, cat) => acc + cat.percentage, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const paidExpenses = expenses.filter(exp => exp.status === 'paid').reduce((acc, exp) => acc + exp.amount, 0);
  const pendingExpenses = expenses.filter(exp => exp.status === 'pending').reduce((acc, exp) => acc + exp.amount, 0);
  const budgetRemaining = totalBudget - totalExpenses;
  const isOverrun = budgetRemaining < 0;

  // Format currency
  const formatFCFA = (num: number) => {
    return Math.round(num).toLocaleString('fr-FR') + ' FCFA';
  };

  const currentDateString = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Category summary rows
  const categoryRows = categories.map(cat => {
    const allocated = (totalBudget * cat.percentage) / 100;
    const spent = expenses
      .filter(exp => exp.categoryId === cat.id)
      .reduce((acc, exp) => acc + exp.amount, 0);
    const progress = allocated > 0 ? (spent / allocated) * 100 : 0;
    const progressClamped = Math.min(progress, 100);
    const difference = allocated - spent;
    const differenceClass = difference >= 0 ? 'text-success' : 'text-danger font-bold';

    let progressColor = '#4F46E5'; // default indigo
    if (progress > 100) progressColor = '#EF4444'; // red
    else if (progress > 85) progressColor = '#F59E0B'; // amber
    else if (progress > 0) progressColor = '#10B981'; // emerald

    return `
      <tr>
        <td style="font-weight: 600; color: #1e293b;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${cat.color}; margin-right: 8px;"></span>
          ${cat.name}
        </td>
        <td style="text-align: center; color: #475569;">${cat.percentage}%</td>
        <td style="text-align: right; color: #0f172a; font-weight: 500;">${formatFCFA(allocated)}</td>
        <td style="text-align: right; color: #0f172a; font-weight: 500;">${formatFCFA(spent)}</td>
        <td style="text-align: right;" class="${differenceClass}">${difference >= 0 ? '+' : ''}${formatFCFA(difference)}</td>
        <td>
          <div style="width: 100%; background-color: #f1f5f9; border-radius: 9999px; height: 8px; overflow: hidden; margin-bottom: 4px;">
            <div style="background-color: ${progressColor}; width: ${progressClamped}%; height: 100%; border-radius: 9999px;"></div>
          </div>
          <span style="font-size: 10px; color: #64748b; font-weight: 500;">${Math.round(progress)}% utilisé</span>
        </td>
      </tr>
    `;
  }).join('');

  // Expenses details rows
  const expenseRows = expenses.length > 0 
    ? expenses.map((exp, idx) => {
        const cat = categories.find(c => c.id === exp.categoryId);
        const catName = cat ? cat.name : 'Non catégorisé';
        const statusBadge = exp.status === 'paid' 
          ? `<span class="badge badge-success">Payé</span>` 
          : `<span class="badge badge-pending">En attente</span>`;

        return `
          <tr>
            <td style="text-align: center; color: #94a3b8; font-size: 11px;">${idx + 1}</td>
            <td style="font-weight: 600; color: #1e293b;">${exp.name}</td>
            <td style="color: #475569; font-size: 12px;">
              ${cat ? `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${cat.color}; margin-right: 6px;"></span>` : ''}
              ${catName}
            </td>
            <td style="text-align: right; font-weight: 700; color: #0f172a;">${formatFCFA(exp.amount)}</td>
            <td style="text-align: center;">${statusBadge}</td>
            <td style="color: #64748b; font-size: 11px; font-style: italic;">${exp.notes || '-'}</td>
          </tr>
        `;
      }).join('')
    : `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">Aucune dépense enregistrée pour le moment.</td></tr>`;

  // HTML Report Template
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Rapport Budgétaire - ${name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          color: #334155;
          background-color: #ffffff;
          line-height: 1.5;
          padding: 40px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Print optimization */
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 24px;
          margin-bottom: 30px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-box {
          width: 38px;
          height: 38px;
          background-color: #4f46e5;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 20px;
        }

        .brand-title {
          font-weight: 800;
          font-size: 20px;
          color: #1e293b;
          letter-spacing: -0.025em;
        }

        .brand-subtitle {
          font-size: 10px;
          font-weight: 700;
          color: #4f46e5;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: block;
          margin-top: -3px;
        }

        .document-title {
          text-align: right;
        }

        .document-title h1 {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .document-title p {
          font-size: 11px;
          color: #64748b;
        }

        .event-info-section {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .event-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .event-details h2 {
          font-size: 20px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .metadata-item {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
        }
        
        .metadata-item strong {
          color: #334155;
        }

        /* KPI Cards */
        .kpi-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 30px;
        }

        .kpi-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .kpi-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
          display: block;
        }

        .kpi-value {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .kpi-sub {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 4px;
          display: block;
        }

        .kpi-success {
          border-left: 4px solid #10b981;
        }
        
        .kpi-danger {
          border-left: 4px solid #ef4444;
          background-color: #fef2f2;
        }

        .kpi-warning {
          border-left: 4px solid #f59e0b;
        }

        .kpi-primary {
          border-left: 4px solid #4f46e5;
        }

        /* Tables */
        .section-title {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background-color: #e2e8f0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 35px;
        }

        th {
          background-color: #f8fafc;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 14px;
          border-bottom: 2px solid #e2e8f0;
          text-align: left;
        }

        td {
          padding: 12px 14px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 12px;
          color: #334155;
          vertical-align: middle;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .text-success {
          color: #16a34a !important;
        }

        .text-danger {
          color: #dc2626 !important;
        }

        .badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .badge-success {
          background-color: #d1fae5;
          color: #065f46;
        }

        .badge-pending {
          background-color: #fef3c7;
          color: #92400e;
        }

        .footer {
          margin-top: 50px;
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #94a3b8;
        }

        .btn-print-floating {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background-color: #4f46e5;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 20px;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          font-family: inherit;
          z-index: 9999;
        }

        .btn-print-floating:hover {
          background-color: #4338ca;
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>

      <!-- Floating Button for Manual Printing Activation -->
      <button class="btn-print-floating no-print" onclick="window.print()">
        <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
        </svg>
        Imprimer / Enregistrer en PDF
      </button>

      <!-- Document Header -->
      <div class="header-container">
        <div class="brand-logo">
          <div class="logo-box">W</div>
          <div>
            <span class="brand-title">Winner Event</span>
            <span class="brand-subtitle">SaaS Budget</span>
          </div>
        </div>
        <div class="document-title">
          <h1>Rapport Budgétaire</h1>
          <p>Édité le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <!-- Event Summary Metadata Card -->
      <div class="event-info-section">
        <div class="event-grid">
          <div class="event-details">
            <h2>${name}</h2>
            <div class="metadata-item">Généré pour l'adresse : <strong>${event.name ? 'akaezechielwinner@gmail.com' : 'Utilisateur'}</strong></div>
            <div class="metadata-item">Date du rapport : <strong>${currentDateString}</strong></div>
            <div class="metadata-item">Statut financier : <strong class="${isOverrun ? 'text-danger' : 'text-success'}">${isOverrun ? 'Déficitaire (Budget dépassé)' : 'Équilibré'}</strong></div>
          </div>
          <div style="text-align: right; display: flex; flex-direction: column; justify-content: center;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #94a3b8; letter-spacing: 0.05em;">Budget Total</span>
            <span style="font-size: 24px; font-weight: 800; color: #4f46e5;">${formatFCFA(totalBudget)}</span>
          </div>
        </div>
      </div>

      <!-- KPI Summary Row -->
      <div class="kpi-container">
        <div class="kpi-card kpi-primary">
          <span class="kpi-label">Enveloppe Initiale</span>
          <div class="kpi-value">${formatFCFA(totalBudget)}</div>
          <span class="kpi-sub">Fonds de départ configurés</span>
        </div>
        <div class="kpi-card kpi-warning">
          <span class="kpi-label">Dépenses Réelles</span>
          <div class="kpi-value">${formatFCFA(totalExpenses)}</div>
          <span class="kpi-sub">${expenses.length} postes saisis</span>
        </div>
        <div class="kpi-card kpi-success">
          <span class="kpi-label">Total Payé</span>
          <div class="kpi-value">${formatFCFA(paidExpenses)}</div>
          <span class="kpi-sub">En attente : ${formatFCFA(pendingExpenses)}</span>
        </div>
        <div class="kpi-card ${isOverrun ? 'kpi-danger' : 'kpi-success'}">
          <span class="kpi-label">Reste Disponible</span>
          <div class="kpi-value" style="color: ${isOverrun ? '#dc2626' : '#16a34a'}">${formatFCFA(budgetRemaining)}</div>
          <span class="kpi-sub">${isOverrun ? 'Dépassement de budget !' : 'Budget de secours disponible'}</span>
        </div>
      </div>

      <!-- Category Allocation Table -->
      <h3 class="section-title">Objectifs Budgétaires par Poste</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Catégorie</th>
            <th style="width: 10%; text-align: center;">Part (%)</th>
            <th style="width: 18%; text-align: right;">Cible</th>
            <th style="width: 18%; text-align: right;">Réel Dépensé</th>
            <th style="width: 15%; text-align: right;">Différence</th>
            <th style="width: 14%;">Progression</th>
          </tr>
        </thead>
        <tbody>
          ${categoryRows}
        </tbody>
      </table>

      <!-- Page Break to keep the detailed table together on page 2 -->
      <div class="page-break"></div>

      <!-- Expenses Detailed Table -->
      <h3 class="section-title" style="margin-top: 20px;">Détails des Dépenses Réelles Saisies</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 5%; text-align: center;">N°</th>
            <th style="width: 35%;">Désignation</th>
            <th style="width: 25%;">Catégorie</th>
            <th style="width: 15%; text-align: right;">Montant</th>
            <th style="width: 10%; text-align: center;">Statut</th>
            <th style="width: 10%;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${expenseRows}
        </tbody>
      </table>

      <!-- Summary Analysis & Sign-off Block -->
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-top: 30px;">
        <h4 style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Analyse Budgétaire Synthétique</h4>
        <p style="font-size: 11px; color: #475569; leading-height: 1.6;">
          Ce rapport résume la planification budgétaire pour l'évènement <strong>${name}</strong>. 
          Le budget théorique total est de <strong>${formatFCFA(totalBudget)}</strong>, avec un montant global alloué aux catégories de <strong>${formatFCFA(totalAllocated)}</strong> (${totalAllocatedPercentage}% du budget global). 
          Les dépenses réelles s'élèvent à <strong>${formatFCFA(totalExpenses)}</strong>, soit <strong>${totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0}%</strong> de l'enveloppe totale. 
          À ce jour, <strong>${formatFCFA(paidExpenses)}</strong> ont été réglés (${expenses.length > 0 ? Math.round((paidExpenses / totalExpenses) * 100) : 0}% des dépenses totales) et 
          <strong>${formatFCFA(pendingExpenses)}</strong> restent en attente de règlement.
          ${isOverrun 
            ? `<strong class="text-danger" style="display: block; margin-top: 8px;">Attention : Vos dépenses réelles dépassent l'enveloppe budgétaire globale de ${formatFCFA(Math.abs(budgetRemaining))}. Il est fortement conseillé de réduire certains coûts ou de renégocier avec vos prestataires pour rétablir l'équilibre financier.</strong>` 
            : `<strong class="text-success" style="display: block; margin-top: 8px;">Félicitations : Votre budget est équilibré. Il vous reste un solde positif de ${formatFCFA(budgetRemaining)} pour parer à toute éventualité.</strong>`}
        </p>
      </div>

      <!-- Document Footer -->
      <div class="footer">
        <div>Winner Event SaaS - Solution Intelligente de Gestion de Budget d'Évènements</div>
        <div>Page 1 sur 2</div>
      </div>

      <!-- Auto Trigger Print Window -->
      <script>
        window.onload = function() {
          // Allow some time for fonts to load properly
          setTimeout(function() {
            window.print();
          }, 600);
        };
      </script>
    </body>
    </html>
  `;

  // Write content to a blank new window / tab
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // Fallback: If popup is blocked, we can alert or create a hidden print iframe
    alert("Veuillez autoriser les fenêtres contextuelles (popups) pour pouvoir télécharger le PDF.");
  }
}
