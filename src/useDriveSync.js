import { useState, useEffect, useRef, useCallback } from "react";
import {
  localStore, readMeta, writeMeta, syncCore, makeDrive, acquireToken, getCachedToken,
  clearCachedToken, revokeToken, AuthError, LS_EVENT, describeError,
} from "./sync.js";

/**
 * États (status) :
 *  off      pas connecté à Drive
 *  ready    connecté, en attente d'un clic pour (re)prendre un jeton Google (valable ~1 h)
 *  syncing  synchronisation en cours
 *  ok       à jour
 *  pending  Drive contient des mises à jour plus récentes (à appliquer d'un clic)
 *  auth     jeton expiré : un clic pour se reconnecter
 *  choice   première synchro avec des données différentes : choix demandé
 *  error    erreur (voir msg)
 */
export function useDriveSync(clientId) {
  const initial = readMeta(localStore);
  const [st, setSt] = useState({
    status: initial.connected ? "ready" : "off",
    msg: "",
    lastSync: initial.lastSync || 0,
    connected: !!initial.connected,
  });
  const [choice, setChoice] = useState(null);
  const busy = useRef(false);
  const timer = useRef(null);
  const connectedRef = useRef(!!initial.connected);
  const idRef = useRef(clientId);
  idRef.current = clientId;

  const patch = useCallback((p) => {
    if (p.connected !== undefined) connectedRef.current = p.connected;
    setSt((s) => ({ ...s, ...p }));
  }, []);

  const run = useCallback(async (mode, resolution) => {
    if (busy.current) return;
    if (!idRef.current) { patch({ status: "error", msg: "Aucun ID client Google renseigné (Réglages)." }); return; }
    busy.current = true;
    patch({ status: "syncing", msg: "" });
    try {
      let token = getCachedToken();
      if (!token) {
        if (mode === "auto") {
          patch({ status: "auth", msg: "Modifications non synchronisées — clique pour te reconnecter." });
          return;
        }
        token = await acquireToken(idRef.current, ""); // ouvre la fenêtre Google (clic utilisateur)
      }
      const before = readMeta(localStore);
      if (!before.connected) writeMeta(localStore, { ...before, connected: true });

      const res = await syncCore({ store: localStore, drive: makeDrive(token), mode, resolution });

      if (res.status === "choice") {
        setChoice(res);
        patch({ status: "choice", connected: true, msg: "Choix requis pour la première synchronisation." });
        return;
      }
      const lastSync = readMeta(localStore).lastSync;
      if (res.pending > 0) {
        patch({ status: "pending", connected: true, lastSync, msg: `${res.pending} rubrique(s) plus récente(s) sur Drive — clique pour les appliquer.` });
        return;
      }
      const parts = [];
      if (res.pushed) parts.push(`${res.pushed} envoyée(s)`);
      if (res.pulled) parts.push(`${res.pulled} reçue(s)`);
      let msg = parts.length ? parts.join(", ") : "Déjà à jour";
      if (res.lost && res.lost.length) msg += ` — ${res.lost.length} version(s) locale(s) mise(s) de côté (voir Réglages)`;
      if (res.pulled > 0 && mode !== "auto") {
        patch({ status: "ok", connected: true, lastSync, msg: msg + " — rechargement…" });
        setTimeout(() => window.location.reload(), 1600); // les données reçues sont chargées au redémarrage
        return;
      }
      patch({ status: "ok", connected: true, lastSync, msg });
    } catch (e) {
      if (e instanceof AuthError) { clearCachedToken(); patch({ status: "auth", msg: describeError(e) }); }
      else patch({ status: "error", msg: describeError(e) });
    } finally {
      busy.current = false;
    }
  }, [patch]);

  // Envoi automatique, quelques secondes après une modification locale.
  useEffect(() => {
    const onChange = () => {
      if (!connectedRef.current) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => run("auto"), 4000);
    };
    window.addEventListener(LS_EVENT, onChange);
    return () => { window.removeEventListener(LS_EVENT, onChange); clearTimeout(timer.current); };
  }, [run]);

  // Au retour sur l'onglet : vérifier (sans rien écraser) si Drive a du nouveau.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && connectedRef.current && getCachedToken()) run("auto");
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [run]);

  return {
    ...st,
    choice,
    connect: () => run("manual"),
    syncNow: () => run("manual"),
    resolveChoice: (kind) => { setChoice(null); run("manual", kind); },
    cancelChoice: () => { setChoice(null); patch({ status: connectedRef.current ? "ready" : "off", msg: "" }); },
    disconnect: () => {
      clearTimeout(timer.current);
      revokeToken();
      writeMeta(localStore, { connected: false, lastSync: 0, base: {} });
      setChoice(null);
      patch({ status: "off", msg: "", connected: false, lastSync: 0 });
    },
  };
}
