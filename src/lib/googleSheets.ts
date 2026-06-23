import { EventDetails, Category, ExpenseItem } from '../types';

/**
 * Searches the user's Google Drive for spreadsheets that might be budgets
 */
export async function listUserSpreadsheets(accessToken: string): Promise<{ id: string; name: string; modifiedTime: string }[]> {
  const url = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&orderBy=modifiedTime desc&pageSize=20&fields=files(id,name,modifiedTime)`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error('Impossible d\'accéder à votre Google Drive. Veuillez vérifier vos autorisations.');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Creates a brand new Google Spreadsheet with the current budget details,
 * formatted elegantly, and returns the spreadsheetUrl and spreadsheetId.
 */
export async function exportBudgetToGoogleSheet(
  accessToken: string,
  event: EventDetails
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // 1. Create Spreadsheet
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  const createBody = {
    properties: {
      title: `EventCalc Budget - ${event.name}`
    },
    sheets: [
      {
        properties: {
          title: 'Aperçu Budgétaire',
          gridProperties: {
            frozenRowCount: 4
          }
        }
      }
    ]
  };

  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createBody)
  });

  if (!createRes.ok) {
    if (createRes.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error('Échec de la création de la feuille Google Sheets.');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // 2. Prepare payload to write cells
  const values: any[][] = [];
  
  // Header / Title card
  values.push([`BUDGET DÉTAILLÉ : ${event.name.toUpperCase()}`]);
  values.push([`Généré automatiquement par EventCalc le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`]);
  values.push([`Budget total alloué :`, `${event.totalBudget} €`]);
  values.push([]); // spacer row

  // Section 1: Categories
  values.push(['RÉPARTITION PAR CATÉGORIE']);
  values.push(['Nom de la Catégorie', 'Objectif d\'allocation (%)', 'Budget Estimé (€)']);
  
  event.categories.forEach(cat => {
    const estimatedAmount = (event.totalBudget * cat.percentage) / 100;
    values.push([
      cat.name,
      `${cat.percentage} %`,
      estimatedAmount
    ]);
  });

  values.push([]); // spacer
  values.push([]); // spacer

  // Section 2: Detailed Expenses
  values.push(['DÉTAIL DES PRÉSTATIONS ET DÉPENSES SAISIES']);
  values.push(['Désignation de la dépense', 'Catégorie associée', 'Montant (€)', 'Statut de paiement', 'Notes & Remarques']);

  event.expenses.forEach(exp => {
    const parentCat = event.categories.find(c => c.id === exp.categoryId);
    values.push([
      exp.name,
      parentCat?.name || exp.categoryId,
      exp.amount,
      exp.status === 'paid' ? 'Payé' : 'En attente',
      exp.notes || ''
    ]);
  });

  // Write values to index sheet (Aperçu Budgétaire!A1)
  const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Aperçu Budgétaire'!A1?valueInputOption=USER_ENTERED`;
  const writeRes = await fetch(writeUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: "'Aperçu Budgétaire'!A1",
      majorDimension: 'ROWS',
      values: values
    })
  });

  if (!writeRes.ok) {
    throw new Error('Échec du transfert des données vers le tableur Google Sheets.');
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Imports categories and expenses back from an existing Google Sheet.
 * Reads rows parses budget, categories, and expenses dynamically.
 */
export async function importBudgetFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<EventDetails> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Aperçu Budgétaire'!A1:Z100`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error('Impossible de lire les cellules de la feuille "Aperçu Budgétaire". Assurez-vous qu\'elle provient d\'un export standard EventCalc.');
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  if (rows.length < 5) {
    throw new Error('Le document Sheets semble vide ou endommagé.');
  }

  // Parse Event Name (Row 1)
  let eventName = 'Budget Importé';
  const firstRowStr = rows[0]?.[0] || '';
  if (firstRowStr.startsWith('BUDGET DÉTAILLÉ : ')) {
    eventName = firstRowStr.replace('BUDGET DÉTAILLÉ : ', '');
    // Capitalize beautifully
    eventName = eventName.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // Parse Budget (Row 3)
  let totalBudget = 10000;
  const budgetRowLabel = rows[2]?.[0] || '';
  const budgetRowValue = rows[2]?.[1] || '';
  if (budgetRowLabel.includes('Budget total alloué')) {
    const rawVal = budgetRowValue.replace(' €', '').replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed) && parsed > 0) {
      totalBudget = Math.round(parsed);
    }
  }

  // Identify where categories and expenses reside in rows
  let categoryHeadersIdx = -1;
  let expenseHeadersIdx = -1;

  for (let i = 0; i < rows.length; i++) {
    const cellValue = rows[i]?.[0] || '';
    if (cellValue === 'Nom de la Catégorie') {
      categoryHeadersIdx = i;
    }
    if (cellValue === 'Désignation de la dépense') {
      expenseHeadersIdx = i;
    }
  }

  const colors = ['#4F46E5', '#10B981', '#EC4899', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#06B6D4'];
  const icons = ['Home', 'Utensils', 'Sparkles', 'Music', 'Users', 'Truck', 'Camera', 'Gift'];

  // Parse Categories
  const categories: Category[] = [];
  if (categoryHeadersIdx !== -1) {
    let cursor = categoryHeadersIdx + 1;
    let idx = 0;
    while (cursor < rows.length) {
      const row = rows[cursor];
      if (!row || row.length === 0 || !row[0] || row[0].trim() === '' || row[0] === 'DÉTAIL DES PRÉSTATIONS ET DÉPENSES SAISIES') {
        break;
      }
      
      const catName = row[0];
      const rawPct = row[1] || '0';
      const pctNum = parseFloat(rawPct.replace('%', '').trim());

      categories.push({
        id: `cat-import-${idx}`,
        name: catName,
        percentage: isNaN(pctNum) ? 0 : pctNum,
        color: colors[idx % colors.length],
        icon: icons[idx % icons.length]
      });
      cursor++;
      idx++;
    }
  }

  // Fallback to default if no categories parsed
  if (categories.length === 0) {
    categories.push({ id: 'cat-import-default', name: 'Général', percentage: 100, color: '#4F46E5', icon: 'Sparkles' });
  }

  // Parse Expenses
  const expenses: ExpenseItem[] = [];
  if (expenseHeadersIdx !== -1) {
    let cursor = expenseHeadersIdx + 1;
    let idx = 0;
    while (cursor < rows.length) {
      const row = rows[cursor];
      if (!row || row.length === 0 || !row[0] || row[0].trim() === '') {
        cursor++;
        continue;
      }

      const expName = row[0];
      const associatedCatName = row[1];
      const rawAmount = row[2] || '0';
      const rawStatus = row[3] || 'En attente';
      const notes = row[4] || '';

      const amountNum = parseFloat(rawAmount.toString().replace(/\s/g, '').replace(',', '.'));
      
      // Find matching category
      let categoryId = categories[0]?.id || 'cat-import-default';
      const matchedCat = categories.find(c => c.name.toLowerCase() === associatedCatName.toLowerCase());
      if (matchedCat) {
        categoryId = matchedCat.id;
      }

      expenses.push({
        id: `exp-import-${idx}`,
        name: expName,
        categoryId: categoryId,
        amount: isNaN(amountNum) ? 0 : Math.round(amountNum),
        status: rawStatus.toLowerCase().includes('pay') ? 'paid' : 'pending',
        notes: notes || undefined
      });

      cursor++;
      idx++;
    }
  }

  return {
    name: eventName,
    totalBudget,
    categories,
    expenses
  };
}
