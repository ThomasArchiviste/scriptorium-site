// Fonction serverless Vercel — relaie les requêtes de l'assistant vers l'API
// Anthropic en gardant la clé secrète côté serveur. Le navigateur ne voit jamais la clé.
//
// Variables d'environnement à définir dans Vercel (Settings → Environment Variables) :
//   ANTHROPIC_API_KEY   (obligatoire)  ta clé API Anthropic
//   ANTHROPIC_MODEL     (facultatif)   ex. claude-sonnet-4-6 (valeur par défaut)

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

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Clé API absente. Ajoute ANTHROPIC_API_KEY dans les variables d'environnement Vercel." });
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

    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      const msg = (data && data.error && data.error.message) || ("Erreur API (" + r.status + ")");
      res.status(r.status).json({ error: msg });
      return;
    }

    const text = (data.content || [])
      .map((c) => c.text || "")
      .filter(Boolean)
      .join("\n")
      .trim();

    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur : " + (e && e.message ? e.message : "inconnue") });
  }
}
