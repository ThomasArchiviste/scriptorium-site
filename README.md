# Scriptorium — l'atelier de l'historien

Tableau de bord pour la recherche historique : assistant IA de recherche dans tes
fonds, agenda, gestion (documents Word, écriture, projet), bibliothèque (Tropy,
citations, images, livres/PDF), wiki (pages liées façon Notion, prosopographie,
frise chronologique) et création (Whimsical, Excalidraw, sauvegardes, cartothèque).

Projet **Vite + React**, déployable sur **Vercel**. Assistant IA **gratuit** via Google Gemini.

---

## Structure

```
scriptorium-site/
├── api/
│   └── assistant.js      Fonction serverless : relaie l'assistant vers Google Gemini
├── src/
│   ├── App.jsx           L'application (tous les modules)
│   └── main.jsx          Point d'entrée React
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

## Lancer en local

```bash
npm install
npm run dev
```

Le site s'ouvre sur http://localhost:5173.

> En local, l'assistant IA passe par `/api/assistant`, qui n'existe que sur Vercel
> (ou via `vercel dev`). Tous les autres modules fonctionnent en local.
> Pour tester l'assistant en local : `npm i -g vercel` puis `vercel dev`.

## Variables d'environnement

À définir dans **Vercel → Settings → Environment Variables** (et dans un `.env`
local si tu utilises `vercel dev`) :

| Variable | Obligatoire | Rôle |
|---|---|---|
| `GEMINI_API_KEY` | oui | Clé **gratuite** Google AI Studio (aistudio.google.com). Reste côté serveur, jamais exposée au navigateur. |
| `GEMINI_MODEL` | non | Modèle utilisé. Défaut : `gemini-2.5-flash`. |

> Pour repasser sur un autre fournisseur (Anthropic, etc.), il suffit de modifier
> `api/assistant.js` et la variable correspondante.

## Déployer sur Vercel

1. Crée un dépôt GitHub et pousse le contenu de ce dossier.
2. Sur vercel.com → **Add New → Project** → importe le dépôt.
   Vercel détecte automatiquement Vite (aucune configuration).
3. Ajoute `GEMINI_API_KEY` dans les réglages du projet, puis **redéploie**.
4. C'est en ligne. Le dossier `api/` devient automatiquement une fonction serverless.

## Connexions des modules

Tout se configure depuis l'icône **Réglages** (en haut à droite). Les données
(citations, prosopographie, frise, écriture, projet, **wiki**) sont enregistrées
dans le navigateur (localStorage).

- **Dossiers Google Drive** : partage-les « toute personne disposant du lien » et
  colle l'**ID ou l'URL complète** du dossier. Pour les afficher **dans le thème du
  site** (vignettes + noms), une **clé API Google Drive** est nécessaire — l'aperçu
  de Google ne pouvant pas être re-thémé. Sans clé : bouton « Ouvrir dans Drive ».
- **Clé API Google Drive** : crée-la dans Google Cloud (API Drive activée), en
  lecture seule, puis renseigne-la dans les réglages.
- **Agenda** : adresse Google Agenda ou lien d'intégration ; bouton clair/sombre
  intégré au bloc. Le format 24 h suit le réglage « Langue et région » du compte Google.
- **Tropy** : import d'un export JSON-LD → inventaire de fiches. Clichés via un dossier Drive.
- **Wiki** : pages liées façon Notion (arborescence, recherche, `[[liens]]`, **gras**,
  *italique*, étiquettes) — éditable, rien à connecter.
- **Création** : **Excalidraw** (croquis) et **Tableau blanc / tldraw** (diagrammes,
  flux, wireframes) sont intégrés et **éditables** ; les créations s'enregistrent
  **dans le site** et apparaissent en aperçu dans le bloc **Sauvegardes**, rouvrables
  d'un clic. (Whimsical, produit fermé, ne peut pas être édité en intégration.)

## Aller plus loin (optionnel)

Pour l'édition des fichiers Word **directement** dans la fenêtre Documents et
l'accès aux dossiers Drive **privés**, il faut une connexion Google (OAuth +
Picker / Docs API). Non inclus ici : la version actuelle s'appuie sur des dossiers
Drive partagés et une clé API Drive, qui fonctionnent sans authentification.
