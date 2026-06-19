// Fonction serverless Vercel — version GRATUITE via Google Gemini (Google AI Studio).
// Remplace l'ancienne api/assistant.js (version Anthropic). Le client (App.jsx)
// n'a pas besoin de changer : il appelle toujours /api/assistant avec { prompt }.
//
// Variables d'environnement à définir dans Vercel (Settings → Environment Variables) :
//   GEMINI_API_KEY   (obligatoire)  clé gratuite depuis https://aistudio.google.com
//   GEMINI_MODEL     (facultatif)   défaut : gemini-2.5-flash
//
// La clé Gemini gratuite ne demande pas de carte bancaire (1 500 requêtes/jour).

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => { data += c; });
    req.on("end", () => resolve(data));
    req.on("error", () => resolve(""));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée." });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Clé absente. Ajoute GEMINI_API_KEY dans les variables d'environnement Vercel (clé gratuite : aistudio.google.com)." });
    return;
  }

  try {
    let body = req.body;
    if (body === undefined) {
      const raw = await readBody(req);
      body = raw ? JSON.parse(raw) : {};
    } else if (typeof body === "string") {
      body = JSON.parse(body || "{}");
    }

    const prompt = (body && body.prompt) || "";
    if (!prompt) {
      res.status(400).json({ error: "Requête vide." });
      return;
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/"
      + encodeURIComponent(model) + ":generateContent";

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.4 },
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      const msg = (data && data.error && data.error.message) || ("Erreur API (" + r.status + ")");
      res.status(r.status).json({ error: msg });
      return;
    }

    const cand = data.candidates && data.candidates[0];
    const text = cand && cand.content && cand.content.parts
      ? cand.content.parts.map((p) => p.text || "").filter(Boolean).join("\n").trim()
      : "";

    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur : " + (e && e.message ? e.message : "inconnue") });
  }
}
