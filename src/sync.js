// Synchronisation des données de Scriptorium avec un espace PRIVÉ de ton Google Drive
// (« appDataFolder » : dossier caché, invisible dans Mon Drive, lisible uniquement par ce site).
//
// Principe : chaque rubrique du site (wiki, citations, frise…) est une clé localStorage
// « scr.* ». On garde, par clé, la date de dernière modification locale. À chaque
// synchronisation, on compare avec le fichier stocké sur Drive et on pousse / reçoit
// uniquement ce qui a changé. En cas de modification des DEUX côtés, la plus récente gagne
// et l'autre version est mise de côté (récupérable dans les Réglages).

export const PREFIX = "scr.";
export const MT = "scrsync.mt.";    // date de dernière modification locale, par clé
export const DEF = "scrsync.def.";  // marque « valeur par défaut, jamais modifiée »
export const META = "scrsync.meta"; // { connected, lastSync, base }
export const LOST = "scrsync.lost"; // versions locales écrasées (filet de sécurité)
export const LS_EVENT = "scr-local-change";

const SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const FILE_NAME = "scriptorium-sync.json";

export const KEY_LABELS = {
  "scr.wiki": "Wiki",
  "scr.citations": "Citations",
  "scr.proso": "Prosopographie",
  "scr.frise": "Frise chronologique",
  "scr.frise.cats": "Catégories de la frise",
  "scr.redaction": "Écriture",
  "scr.projet": "Projet",
  "scr.creations": "Créations (Excalidraw / tableau blanc)",
  "scr.tropy": "Inventaire Tropy",
  "scr.config": "Réglages et connexions",
  "scr.agendaDark": "Agenda (mode sombre)",
};
export const labelOf = (k) => KEY_LABELS[k] || k;

/* ------------------------------------------------------------------ */
/*  Stockage (injecté : localStorage dans le navigateur, Map en test) */
/* ------------------------------------------------------------------ */

export const localStore = {
  keys() {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) out.push(localStorage.key(i));
    return out;
  },
  get: (k) => localStorage.getItem(k),
  set: (k, v) => localStorage.setItem(k, v),
  remove: (k) => localStorage.removeItem(k),
};

export function readMeta(store) {
  const empty = { connected: false, lastSync: 0, base: {} };
  try { return { ...empty, ...JSON.parse(store.get(META) || "{}") }; } catch (e) { return empty; }
}
export function writeMeta(store, meta) { store.set(META, JSON.stringify(meta)); }

export function readLost(store) {
  try { return JSON.parse(store.get(LOST) || "[]"); } catch (e) { return []; }
}
function saveLost(store, key, v, at, from) {
  const arr = readLost(store);
  arr.unshift({ key, v, at, from }); // from : "appareil" (version locale) ou "drive" (version écrasée sur Drive)
  store.set(LOST, JSON.stringify(arr.slice(0, 6))); // lève une erreur si le quota est dépassé : voulu
}

/**
 * Enregistre une écriture de l'appli et tient à jour les marqueurs de synchro.
 * - 1re écriture d'une clé absente = valeur par défaut (pas une modification de l'utilisateur) ;
 * - toute écriture suivante qui change la valeur = modification (horodatée).
 * Retourne true si c'est une vraie modification (→ à synchroniser).
 */
export function recordWrite(store, key, next, now = Date.now) {
  const prev = store.get(key);
  if (prev === next) return false;
  store.set(key, next);
  if (prev === null) { store.set(DEF + key, "1"); return false; }
  store.set(MT + key, String(now()));
  store.remove(DEF + key);
  return true;
}

export function collectLocal(store) {
  const out = {};
  for (const k of store.keys()) {
    if (!k.startsWith(PREFIX)) continue;
    const v = store.get(k);
    if (v == null) continue;
    out[k] = { v, t: Number(store.get(MT + k)) || 0, d: store.get(DEF + k) === "1" };
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Fusion                                                            */
/* ------------------------------------------------------------------ */

/**
 * local / remote : { clé: { v: texte, t: date, d?: valeur par défaut } }
 * base : { clé: date convenue lors de la dernière synchro }
 * firstSync : cet appareil n'a jamais été synchronisé.
 */
export function planMerge(local, remote, base, firstSync) {
  const pull = [], push = [], conflicts = [], lost = [], same = [];
  for (const k of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    const l = local[k], r = remote[k];
    if (l && !r) { if (!l.d) push.push(k); continue; }       // nouveau ici → envoyer (sauf valeur par défaut)
    if (!l && r) { pull.push(k); continue; }                  // nouveau sur Drive → recevoir
    if (l.v === r.v) { same.push(k); continue; }              // identique
    if (l.d) { pull.push(k); continue; }                      // ici : valeur par défaut jamais touchée
    if (firstSync) { conflicts.push(k); continue; }           // 1re synchro, données différentes des deux côtés
    const b = base[k];
    const lc = b === undefined || l.t !== b;                  // modifié ici depuis la dernière synchro ?
    const rc = b === undefined || r.t !== b;                  // modifié sur Drive depuis la dernière synchro ?
    if (lc && !rc) push.push(k);
    else if (!lc && rc) pull.push(k);
    else if (l.t > r.t) push.push(k);                         // modifié des deux côtés : le plus récent gagne
    else { pull.push(k); lost.push(k); }                      // …et la version locale est mise de côté
  }
  return { pull, push, conflicts, lost, same };
}

/**
 * Une passe de synchronisation.
 * mode "manual" : peut écraser des données locales par celles de Drive (l'appelant recharge la page).
 * mode "auto"   : en tâche de fond, n'ENVOIE que les modifications locales sûres ; ne modifie jamais
 *                 les données locales (les mises à jour de Drive restent « en attente »).
 * resolution    : "drive" | "local" — choix de l'utilisateur lors de la toute première synchro.
 */
export async function syncCore({ store, drive, mode = "manual", resolution = null, now = Date.now }) {
  const meta = readMeta(store);
  const base = { ...(meta.base || {}) };
  const local = collectLocal(store);
  const file = await drive.find();
  const stamp = now();

  // Aucun fichier sur Drive : on le crée avec les données de cet appareil.
  if (!file) {
    const keys = {};
    for (const k of Object.keys(local)) {
      if (local[k].d) continue;
      keys[k] = { v: local[k].v, t: local[k].t || stamp };
    }
    await drive.create({ version: 1, updatedAt: stamp, keys });
    for (const k of Object.keys(keys)) { store.set(MT + k, String(keys[k].t)); base[k] = keys[k].t; }
    writeMeta(store, { ...meta, lastSync: stamp, base });
    return { status: "ok", pushed: Object.keys(keys).length, pulled: 0, lost: [], pending: 0 };
  }

  const remoteDoc = await drive.read(file.id);
  const rk = (remoteDoc && remoteDoc.keys) || {};
  const plan = planMerge(local, rk, base, !meta.lastSync);
  let { pull, push, lost } = plan;

  if (plan.conflicts.length) {
    if (resolution === "drive") pull = pull.concat(plan.conflicts);
    else if (resolution === "local") push = push.concat(plan.conflicts);
    else return { status: mode === "auto" ? "pending" : "choice", conflicts: plan.conflicts, pending: plan.conflicts.length, pushed: 0, pulled: 0, lost: [] };
  }

  let pending = 0;
  if (mode === "auto") { pending = pull.length; pull = []; lost = []; }

  // 1) Filet de sécurité : mettre de côté toute version sur le point d'être écrasée,
  //    qu'elle soit locale (remplacée par Drive) ou sur Drive (remplacée par cet appareil).
  const setAside = [];
  for (const k of pull) {
    if (local[k] && !local[k].d && (lost.includes(k) || plan.conflicts.includes(k))) {
      saveLost(store, k, local[k].v, stamp, "appareil"); setAside.push(k);
    }
  }
  for (const k of push) {
    const r = rk[k];
    if (r && r.v !== local[k].v && (plan.conflicts.includes(k) || base[k] === undefined || r.t !== base[k])) {
      saveLost(store, k, r.v, stamp, "drive"); setAside.push(k);
    }
  }

  // 2) Envoyer les modifications locales.
  if (push.length) {
    const nk = { ...rk };
    const sent = [];
    for (const k of push) { const t = local[k].t || stamp; nk[k] = { v: local[k].v, t }; sent.push([k, t]); }
    await drive.update(file.id, { version: 1, updatedAt: stamp, keys: nk });
    for (const [k, t] of sent) { store.set(MT + k, String(t)); store.remove(DEF + k); base[k] = t; }
  }

  // 3) Recevoir les modifications de Drive.
  for (const k of pull) {
    store.set(k, rk[k].v);
    store.set(MT + k, String(rk[k].t));
    store.remove(DEF + k);
    base[k] = rk[k].t;
  }

  // 4) Aligner les rubriques identiques.
  for (const k of plan.same) {
    if (local[k].t !== rk[k].t) store.set(MT + k, String(rk[k].t));
    base[k] = rk[k].t;
  }

  writeMeta(store, { ...meta, lastSync: stamp, base });
  return { status: pending ? "pending" : "ok", pushed: push.length, pulled: pull.length, lost: setAside, pending };
}

/* ------------------------------------------------------------------ */
/*  Google Identity Services (jeton d'accès, ~1 h)                    */
/* ------------------------------------------------------------------ */

export class AuthError extends Error {}

let gisPromise = null;
export function loadGis() {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => { gisPromise = null; reject(new Error("Impossible de charger Google Identity Services (bloqueur de scripts ?).")); };
    document.head.appendChild(s);
  });
  return gisPromise;
}

let cached = { token: null, exp: 0 };
export function getCachedToken() { return cached.token && Date.now() < cached.exp - 60000 ? cached.token : null; }
export function clearCachedToken() { cached = { token: null, exp: 0 }; }

// Le client de jeton est créé À L'AVANCE (au chargement de la page) : l'ouverture de la fenêtre Google doit
// être déclenchée directement par le clic de l'utilisateur, sans aucune attente (chargement de script,
// requête réseau…) entre le clic et requestAccessToken(), sinon le navigateur refuse d'ouvrir la fenêtre.
let tokenClient = null;
let tokenClientId = null;
let pending = null;

export async function prepareGoogle(clientId) {
  await loadGis();
  if (tokenClient && tokenClientId === clientId) return;
  tokenClientId = clientId;
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPE,
    callback: (resp) => {
      const p = pending; pending = null;
      if (!p) return;
      if (resp.error) { p.reject(new Error(resp.error_description || resp.error)); return; }
      cached = { token: resp.access_token, exp: Date.now() + (Number(resp.expires_in) || 3600) * 1000 };
      p.resolve(resp.access_token);
    },
    error_callback: (err) => {
      const p = pending; pending = null;
      if (p) p.reject(new Error((err && err.type) || "popup_error"));
    },
  });
}

// NE PAS rendre cette fonction « async » ni y ajouter d'await avant requestAccessToken().
export function acquireToken(clientId, prompt = "") {
  return new Promise((resolve, reject) => {
    if (!tokenClient || tokenClientId !== clientId) {
      prepareGoogle(clientId).catch(() => {});
      reject(new Error("gis_not_ready"));
      return;
    }
    pending = { resolve, reject };
    try { tokenClient.requestAccessToken({ prompt }); }
    catch (e) { pending = null; reject(e); }
  });
}

export function revokeToken() {
  const t = cached.token;
  clearCachedToken();
  try { if (t && window.google) window.google.accounts.oauth2.revoke(t, () => {}); } catch (e) { /* ignore */ }
}

/* ------------------------------------------------------------------ */
/*  API Drive (espace appDataFolder)                                  */
/* ------------------------------------------------------------------ */

async function dFetch(token, url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: { Authorization: "Bearer " + token, ...(opts.headers || {}) } });
  if (r.status === 401) throw new AuthError("401");
  if (!r.ok) {
    let msg = "Erreur Drive " + r.status;
    try { const d = await r.json(); if (d && d.error && d.error.message) msg += " — " + d.error.message; } catch (e) { /* ignore */ }
    throw new Error(msg);
  }
  return r;
}

export function makeDrive(token) {
  const API = "https://www.googleapis.com/drive/v3/files";
  const UP = "https://www.googleapis.com/upload/drive/v3/files";
  return {
    async find() {
      const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);
      const r = await dFetch(token, `${API}?spaces=appDataFolder&q=${q}&orderBy=createdTime&fields=files(id,name)&pageSize=10`);
      const d = await r.json();
      return (d.files || [])[0] || null;
    },
    async read(id) {
      const r = await dFetch(token, `${API}/${id}?alt=media`);
      return r.json();
    },
    async create(obj) {
      const boundary = "scr" + Math.random().toString(36).slice(2);
      const meta = { name: FILE_NAME, parents: ["appDataFolder"], mimeType: "application/json" };
      const body =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(obj)}\r\n--${boundary}--`;
      const r = await dFetch(token, `${UP}?uploadType=multipart&fields=id`, {
        method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body,
      });
      return r.json();
    },
    async update(id, obj) {
      await dFetch(token, `${UP}/${id}?uploadType=media`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj),
      });
    },
  };
}

export function describeError(e) {
  const m = (e && e.message) || String(e);
  if (e instanceof AuthError) return "Session Google expirée — reconnecte-toi.";
  if (/popup_closed/.test(m)) return "Fenêtre Google fermée avant la fin de la connexion.";
  if (/gis_not_ready/.test(m)) return "Le module Google finit de se charger : réessaie dans quelques secondes.";
  if (/popup_failed_to_open/.test(m)) return "La fenêtre Google n'a pas pu s'ouvrir. Réessaie en cliquant directement ; si ça persiste, désactive pour ce site les bloqueurs de pub / protections renforcées (extensions, Brave Shields, Firefox) puis recharge la page.";
  if (/access_denied/.test(m)) return "Accès refusé. Vérifie que ton adresse figure parmi les utilisateurs test de l'écran de consentement Google.";
  if (/quota/i.test(m)) return "Espace de stockage du navigateur insuffisant : exporte une sauvegarde, puis libère de la place.";
  if (/Failed to fetch|NetworkError/i.test(m)) return "Connexion impossible (réseau ou bloqueur de contenu).";
  return m;
}

/* ------------------------------------------------------------------ */
/*  Sauvegarde / restauration manuelle (fichier .json)                */
/* ------------------------------------------------------------------ */

export function exportLocalBackup(store = localStore) {
  const data = {};
  for (const k of store.keys()) if (k.startsWith(PREFIX)) data[k] = store.get(k);
  const blob = new Blob([JSON.stringify({ app: "scriptorium", exportedAt: new Date().toISOString(), data })], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "scriptorium-sauvegarde-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return Object.keys(data).length;
}

export async function importLocalBackup(file, store = localStore, now = Date.now) {
  const parsed = JSON.parse(await file.text());
  const data = parsed && parsed.data ? parsed.data : parsed; // accepte aussi le format brut de la console
  let n = 0;
  for (const [k, v] of Object.entries(data || {})) {
    if (!k.startsWith(PREFIX) || typeof v !== "string") continue;
    store.set(k, v);
    store.set(MT + k, String(now()));
    store.remove(DEF + k);
    n++;
  }
  return n;
}

export function downloadLostVersions(store = localStore) {
  const lost = readLost(store);
  const blob = new Blob([JSON.stringify({ app: "scriptorium", type: "versions-ecrasees", items: lost }, null, 1)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "scriptorium-versions-ecrasees.json"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return lost.length;
}
