import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load local environment variables if available
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // Shared Gemini client utility with proper header telemetry
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "DUMMY_KEY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Smart API breakdown route
  app.post("/api/ai-breakdown", async (req, res) => {
    try {
      const { totalBudget, description, currentLanguage = "fr" } = req.body;

      if (!totalBudget || isNaN(totalBudget) || totalBudget <= 0) {
        return res.status(400).json({ error: "Le budget total doit être un nombre positif." });
      }

      if (!description || typeof description !== "string") {
        return res.status(400).json({ error: "La description de l'évènement est requise." });
      }

      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY non configurée. Utilisation de données simulées.");
        return res.json(getMockBreakdown(totalBudget, description));
      }

      const prompt = `Crée un budget évènementiel optimisé d'une somme totale de ${totalBudget} FCFA pour l'évènement suivant : "${description}".
      Divise ce budget en 4 à 7 catégories cohérentes de dépenses évènementielles. Pour chaque catégorie, attribue un pourcentage exact (de sorte que la somme totale des pourcentages des catégories fasse EXACTEMENT 100) et propose également 5 à 10 dépenses concrètes, réelles, estimées avec justifications.
      Fais toute la réponse en français. Calcule des montants cohérents en FCFA avec la réalité des prestataires évènementiels dans l'Afrique francophone (Cote d'Ivoire, Sénégal, Cameroun, etc.).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              categories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Nom de la catégorie (ex: Location de salle, Traiteur & Cocktail, Décoration de table, DJ & Artistes)" },
                    percentage: { type: Type.INTEGER, description: "Pourcentage alloué (0 à 100). La somme de tous les pourcentages doit impérativement être ÉGALE À 100." },
                    explanation: { type: Type.STRING, description: "Explication rapide de la pertinence de ce budget pour cet évènement" }
                  },
                  required: ["name", "percentage"]
                }
              },
              suggestedExpenses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Nom de l'article de dépense spécifique (ex: Location de l'espace, Buffet chaud, Location sono, Photographe)" },
                    categoryName: { type: Type.STRING, description: "Nom exact de la catégorie parent sélectionnée ci-dessus pour classer cet article" },
                    amount: { type: Type.NUMBER, description: "Montant estimé en FCFA pour cet article spécifique" },
                    notes: { type: Type.STRING, description: "Justification logique ou conseil pour économiser sur cet article" }
                  },
                  required: ["name", "categoryName", "amount"]
                }
              }
            },
            required: ["categories", "suggestedExpenses"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Pas de texte retourné par Gemini");
      }

      const parsedData = JSON.parse(responseText.trim());
      return res.json(parsedData);

    } catch (error: any) {
      console.error("Erreur Gemini API:", error);
      // Gracious fallback to standard high-fidelity recommendations if API fails or blocks
      const { totalBudget } = req.body;
      return res.json(getMockBreakdown(totalBudget || 5000, req.body.description || "Évènement personnalisé"));
    }
  });

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  // Serve Vite in development, static build in production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server connected on http://0.0.0.0:${PORT}`);
  });
}

// Fallback logic for when GEMINI_API_KEY is not set or times out
function getMockBreakdown(totalBudget: number, description: string) {
  const lowercaseDesc = description.toLowerCase();
  
  let categories = [
    { name: "Location de Salle", percentage: 25, explanation: "Allocation standard pour accueillir vos invités dans d'excellentes conditions." },
    { name: "Traiteur & Boissons", percentage: 35, explanation: "Part principale indispensable pour régaler vos convives (cocktail ou buffet)." },
    { name: "Décoration & Fleurs", percentage: 15, explanation: "Création d'une ambiance esthétique conforme à vos attentes." },
    { name: "Animation & DJ", percentage: 15, explanation: "Musique, sonorisation et éclairage pour dynamiser la soirée." },
    { name: "Imprévus", percentage: 10, explanation: "Sécurité financière pour couvrir les coûts inattendus." }
  ];

  if (lowercaseDesc.includes("mariage") || lowercaseDesc.includes("wedding")) {
    categories = [
      { name: "Lieu & Réception", percentage: 20, explanation: "Location du domaine ou de la salle de réception." },
      { name: "Traiteur & Vins", percentage: 40, explanation: "Menu de fête complet avec cocktail dinatoire, diner et pièces montées." },
      { name: "Fleurs & Décoration", percentage: 15, explanation: "Arche de cérémonie, centres de table et bouquets de mariage." },
      { name: "DJ & Musiciens", percentage: 15, explanation: "Animation live durant le cocktail et DJ jusqu'au bout de la nuit." },
      { name: "Photo & Souvenirs", percentage: 10, explanation: "Reportage photo complet pour immortaliser cette journée magique." }
    ];
  } else if (lowercaseDesc.includes("pro") || lowercaseDesc.includes("entreprise") || lowercaseDesc.includes("gala")) {
    categories = [
      { name: "Espace & Accueil", percentage: 30, explanation: "Lieu prestigieux adapté à une clientèle corporative avec sécurité." },
      { name: "Cocktail Dinatoire", percentage: 40, explanation: "Mignardises raffinées et boissons de qualité supérieure." },
      { name: "Technique & Scène", percentage: 20, explanation: "Sono, micros HF, projecteurs autonomes et écrans de retour." },
      { name: "Communication & Badges", percentage: 10, explanation: "Signalétique, roll-ups personnalisés et badges d'identification." }
    ];
  }

  // Generate suggested individual expenses
  const suggestedExpenses: any[] = [];
  categories.forEach(cat => {
    const catAmount = (totalBudget * cat.percentage) / 100;
    
    if (cat.name.includes("Lieu") || cat.name.includes("Espace") || cat.name.includes("Salle")) {
      suggestedExpenses.push({
        name: "Location de l'Espace principal",
        categoryName: cat.name,
        amount: Math.round(catAmount * 0.8),
        notes: "Comprend les frais de ménage de fin d'évènement"
      });
      suggestedExpenses.push({
        name: "Assurance évènementielle obligatoire",
        categoryName: cat.name,
        amount: Math.round(catAmount * 0.2),
        notes: "Garantit la couverture en cas de dégradation ou annulation forcée"
      });
    } else if (cat.name.includes("Traiteur") || cat.name.includes("Cocktail") || cat.name.includes("Buffet")) {
      suggestedExpenses.push({
        name: "Repas par convive (Buffet / Service)",
        categoryName: cat.name,
        amount: Math.round(catAmount * 0.7),
        notes: "Estimé pour régaler tout le monde"
      });
      suggestedExpenses.push({
        name: "Boissons softs, softs, champagne",
        categoryName: cat.name,
        amount: Math.round(catAmount * 0.3),
        notes: "Prévoir un droit de bouchon si vous apportez vos propres bouteilles"
      });
    } else if (cat.name.includes("Décoration") || cat.name.includes("Fleurs")) {
      suggestedExpenses.push({
        name: "Décoration des tables & Centres",
        categoryName: cat.name,
        amount: Math.round(catAmount * 0.6),
        notes: "Utilisez des guirlandes LED pour une lumière chaleureuse bon marché"
      });
      suggestedExpenses.push({
        name: "Bouquets, arche florale & photobooth",
        categoryName: cat.name,
        amount: Math.round(catAmount * 0.4),
        notes: "Un coin photo souvenir idéal pour vos convives !"
      });
    } else if (cat.name.includes("Animation") || cat.name.includes("DJ") || cat.name.includes("Technique")) {
      suggestedExpenses.push({
        name: "Prestation animatrice DJ (Soirée)",
        categoryName: cat.name,
        amount: Math.round(catAmount * 0.8),
        notes: "Inclus matériel de sonorisation complet et jeux de lumières d'ambiance"
      });
      suggestedExpenses.push({
        name: "Animations ludiques (ex: Bornes de jeux)",
        categoryName: cat.name,
        amount: Math.round(catAmount * 0.2),
        notes: "Ajoute un côté décalé et mémorable"
      });
    } else {
      suggestedExpenses.push({
        name: "Frais divers & Logistique de crise",
        categoryName: cat.name,
        amount: Math.round(catAmount),
        notes: "Fonds de secours en cas d'achat urgent de dernière minute"
      });
    }
  });

  return {
    categories,
    suggestedExpenses
  };
}

startServer();
