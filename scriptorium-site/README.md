# Scriptorium — l'atelier de l'historien

Tableau de bord pour la recherche historique : assistant IA de recherche dans tes
fonds, agenda, gestion (documents Word, écriture, projet), bibliothèque (Zotero,
Tropy, citations, images, PDF), wiki (Obsidian, prosopographie, frise chronologique)
et création (X-Mind, Excalidraw, cartothèque).

Projet **Vite + React**, déployable sur **Vercel**.

---

## Structure

```
scriptorium-site/
├── api/
│   └── assistant.js      Fonction serverless : relaie l'assistant vers l'API Anthropic
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

> En local, l'assistant IA passe par `/api/assistant`. Cet endpoint n'existe que
> sur Vercel (ou avec `vercel dev`). Tous les autres modules fonctionnent en local.
> Pour tester l'assistant en local, lance `npm i -g vercel` puis `vercel dev`.

## Variables d'environnement

À définir dans **Vercel → Settings → Environment Variables** (et dans un fichier
`.env` local si tu utilises `vercel dev`) :

| Variable | Obligatoire | Rôle |
|---|---|---|
| `ANTHROPIC_API_KEY` | oui | Ta clé API Anthropic (console.anthropic.com). Reste côté serveur, jamais exposée au navigateur. |
| `ANTHROPIC_MODEL` | non | Modèle utilisé. Défaut : `claude-sonnet-4-6`. |

## Déployer sur Vercel

1. Crée un dépôt GitHub et pousse le contenu de ce dossier.
2. Sur vercel.com → **Add New → Project** → importe le dépôt.
   Vercel détecte automatiquement Vite (pas de configuration à faire).
3. Avant ou après le premier déploiement, ajoute la variable `ANTHROPIC_API_KEY`
   dans les réglages du projet, puis **redéploie**.
4. C'est en ligne. Le dossier `api/` devient automatiquement une fonction serverless.

## Connexions des modules

Tout se configure depuis l'icône **Réglages** (en haut à droite). Les données
(citations, prosopographie, frise, écriture, projet) sont enregistrées dans le
navigateur (localStorage).

- **Agenda / Documents / Banque d'image / Livres PDF / Cartothèque** : identifiants
  de dossiers Google Drive partagés « avec le lien » (partie après `/folders/`).
- **Zotero** : identifiant de bibliothèque + clé API (pour une bibliothèque privée).
- **Tropy** : import d'un export JSON-LD (page dédiée via le menu Bibliothèque).
- **Obsidian** : URL d'un coffre publié (ex. Quartz sur GitHub Pages).
- **Excalidraw** : lien d'un tableau partagé (sinon dessin libre intégré).

## Aller plus loin (optionnel)

Pour l'édition des fichiers Word **directement** dans la fenêtre Documents et
l'accès aux dossiers Drive privés, il faut une connexion Google (OAuth + Picker /
Docs API). Ce n'est pas inclus ici : la version actuelle utilise l'affichage de
dossiers Drive partagés, qui fonctionne sans authentification.
