import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search, Calendar, BookOpen, Network, Clock, Image as ImageIcon, FileText,
  Quote, Settings, Plus, Trash2, X, ExternalLink, Send, Sparkles, Pencil,
  ChevronRight, Upload, Layers, PenTool, Home, FolderOpen, User, Map as MapIcon,
  Library, Save, Info, Link2, ArrowRight, BookMarked, ChevronDown, Filter,
  Moon, Sun, BookText, CornerDownRight, Workflow
} from "lucide-react";
import { Excalidraw as ExcalidrawCanvas, exportToBlob } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

/* ------------------------------------------------------------------ */
/*  Thème — « Scriptorium » : cabinet de travail d'historien, le soir  */
/* ------------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;450;500;600&display=swap');

:root{
  --ink:#17130F; --ink2:#1E1813; --leather:#262019; --leather2:#2F2820;
  --line:rgba(196,164,82,.20); --line-soft:rgba(196,164,82,.10);
  --vellum:#EBE2D0; --vellum-dim:#B7AC95; --muted:#857B69;
  --brass:#C4A452; --brass-hi:#DCC27E; --sanguine:#B64B3C; --sanguine-dim:#8C3a30;
  --serif:'Cormorant Garamond',Georgia,serif; --sans:'Inter',system-ui,sans-serif;
}
*{box-sizing:border-box}
.scriptorium{
  font-family:var(--sans); color:var(--vellum); background:var(--ink);
  min-height:100vh; -webkit-font-smoothing:antialiased;
  background-image:
    radial-gradient(1200px 700px at 78% -10%, rgba(196,164,82,.07), transparent 60%),
    radial-gradient(900px 600px at -5% 110%, rgba(182,75,60,.06), transparent 60%),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/></svg>");
}
.scriptorium ::selection{background:rgba(196,164,82,.30); color:#fff}
.wrap{max-width:1240px; margin:0 auto; padding:0 22px}

/* Bandeau / navigation */
.topbar{position:sticky; top:0; z-index:40; background:linear-gradient(var(--ink),rgba(23,19,15,.82)); backdrop-filter:blur(8px); border-bottom:1px solid var(--line)}
.topbar-in{display:flex; align-items:center; gap:18px; height:72px}
.brand{display:flex; align-items:center; gap:12px; cursor:pointer; user-select:none}
.brand-mark{width:38px; height:38px; border:1px solid var(--brass); display:grid; place-items:center; color:var(--brass); flex:none; position:relative}
.brand-mark::before,.brand-mark::after{content:""; position:absolute; width:6px; height:6px; border:1px solid var(--brass)}
.brand-mark::before{top:-1px; left:-1px; border-right:0; border-bottom:0}
.brand-mark::after{bottom:-1px; right:-1px; border-left:0; border-top:0}
.brand-name{font-family:var(--serif); font-weight:600; font-size:25px; line-height:.95; letter-spacing:.3px}
.brand-sub{font-size:9.5px; letter-spacing:3px; text-transform:uppercase; color:var(--brass); margin-top:2px}
.nav{display:flex; gap:6px; margin-left:8px}
.navlink{font-family:var(--sans); font-size:13.5px; letter-spacing:.2px; color:var(--vellum-dim); background:none; border:none; cursor:pointer; padding:9px 14px; border-radius:2px; position:relative; transition:color .18s}
.navlink:hover{color:var(--vellum)}
.navlink.active{color:var(--brass-hi)}
.navlink.active::after{content:""; position:absolute; left:14px; right:14px; bottom:2px; height:1px; background:var(--brass)}
.topspacer{flex:1}

/* Menu déroulant de navigation */
.navdrop{position:relative}
.navdrop .navlink{display:inline-flex; align-items:center; gap:5px}
.navmenu{position:absolute; top:calc(100% + 6px); left:0; min-width:188px; background:linear-gradient(180deg,var(--leather),var(--leather2)); border:1px solid var(--line); border-radius:3px; padding:6px; z-index:60; box-shadow:0 14px 34px rgba(0,0,0,.5)}
.navmenu button{display:flex; align-items:center; gap:10px; width:100%; text-align:left; background:none; border:none; color:var(--vellum-dim); font-family:var(--sans); font-size:13.5px; padding:10px 11px; border-radius:2px; cursor:pointer; transition:all .14s}
.navmenu button:hover{background:var(--ink2); color:var(--brass)}
.navmenu button.on{color:var(--brass-hi)}
.navmenu button .ico{color:var(--brass); opacity:.85; flex:none}
.topsearch{display:flex; align-items:center; gap:8px; background:var(--ink2); border:1px solid var(--line); border-radius:2px; padding:8px 11px; min-width:230px; color:var(--vellum-dim)}
.topsearch input{background:none; border:none; outline:none; color:var(--vellum); font-family:var(--sans); font-size:13px; width:100%}
.topsearch input::placeholder{color:var(--muted)}
.iconbtn{background:var(--ink2); border:1px solid var(--line); color:var(--vellum-dim); width:38px; height:38px; border-radius:2px; display:grid; place-items:center; cursor:pointer; flex:none; transition:all .18s}
.iconbtn:hover{color:var(--brass); border-color:var(--brass)}

/* Vue */
.view{padding:30px 0 70px; animation:rise .4s ease both}
@keyframes rise{from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:none}}
.view-head{margin:4px 0 24px}
.eyebrow{font-size:10.5px; letter-spacing:3.5px; text-transform:uppercase; color:var(--brass)}
.view-title{font-family:var(--serif); font-size:38px; font-weight:600; line-height:1.05; margin:6px 0 0; letter-spacing:.3px}
.view-note{color:var(--vellum-dim); font-size:14px; margin-top:9px; max-width:680px; line-height:1.55}

/* Grilles */
.grid{display:grid; gap:18px}
.g-home{grid-template-columns:1.55fr 1fr}
.g-2{grid-template-columns:1fr 1fr}
.g-3{grid-template-columns:repeat(3,1fr)}
.span2{grid-column:span 2}
@media(max-width:920px){.g-home,.g-2,.g-3{grid-template-columns:1fr} .span2{grid-column:auto}}

/* Panneau (carte de fonds, avec coins de montage) */
.panel{position:relative; background:linear-gradient(180deg,var(--leather),var(--leather2)); border:1px solid var(--line); border-radius:3px; padding:20px}
.panel.tall{display:flex; flex-direction:column}
.corner{position:absolute; width:11px; height:11px; border:1.5px solid var(--brass); opacity:.55; pointer-events:none}
.corner.tl{top:6px; left:6px; border-right:0; border-bottom:0}
.corner.tr{top:6px; right:6px; border-left:0; border-bottom:0}
.corner.bl{bottom:6px; left:6px; border-right:0; border-top:0}
.corner.br{bottom:6px; right:6px; border-left:0; border-top:0}
.panel-head{display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:14px}
.panel-label{display:flex; align-items:center; gap:9px}
.panel-label .ico{color:var(--brass)}
.panel-title{font-family:var(--serif); font-size:22px; font-weight:600; line-height:1; letter-spacing:.3px}
.panel-kicker{font-size:10px; letter-spacing:2.5px; text-transform:uppercase; color:var(--muted); margin-top:5px}
.cote{font-family:var(--sans); font-size:9.5px; letter-spacing:1.6px; color:var(--muted); border:1px solid var(--line); padding:3px 7px; border-radius:2px; white-space:nowrap; text-transform:uppercase}

/* Boutons */
.btn{font-family:var(--sans); font-size:13px; font-weight:500; cursor:pointer; border-radius:2px; padding:9px 15px; display:inline-flex; align-items:center; gap:7px; transition:all .16s; border:1px solid transparent}
.btn-brass{background:var(--brass); color:#221b0c; border-color:var(--brass)}
.btn-brass:hover{background:var(--brass-hi)}
.btn-ghost{background:transparent; color:var(--vellum-dim); border-color:var(--line)}
.btn-ghost:hover{color:var(--brass); border-color:var(--brass)}
.btn-sang{background:var(--sanguine); color:#fff; border-color:var(--sanguine)}
.btn-sang:hover{background:#c5523f}
.btn-sm{padding:6px 10px; font-size:12px}
.btn[disabled]{opacity:.5; cursor:not-allowed}

/* Champs */
.field{display:block; margin-bottom:13px}
.field label{display:block; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:var(--vellum-dim); margin-bottom:6px}
.inp, textarea.inp, select.inp{width:100%; background:var(--ink2); border:1px solid var(--line); color:var(--vellum); font-family:var(--sans); font-size:13.5px; padding:10px 12px; border-radius:2px; outline:none; transition:border-color .16s}
.inp:focus{border-color:var(--brass)}
textarea.inp{resize:vertical; min-height:72px; line-height:1.5}
.row{display:flex; gap:10px}
.row>*{flex:1}

/* Étiquettes / chips */
.tags{display:flex; flex-wrap:wrap; gap:6px}
.tag{font-size:11px; letter-spacing:.4px; color:var(--brass); border:1px solid var(--line); background:rgba(196,164,82,.06); padding:3px 9px; border-radius:999px; cursor:pointer; transition:all .15s}
.tag:hover{border-color:var(--brass)}
.tag.on{background:var(--brass); color:#221b0c; border-color:var(--brass)}

/* Listes / items */
.scroll{overflow-y:auto; padding-right:4px}
.scroll::-webkit-scrollbar{width:7px}
.scroll::-webkit-scrollbar-thumb{background:var(--line); border-radius:4px}
.item{border:1px solid var(--line-soft); border-radius:2px; padding:13px 14px; margin-bottom:10px; background:var(--ink2); transition:border-color .15s}
.item:hover{border-color:var(--line)}
.item-t{font-family:var(--serif); font-size:18px; font-weight:600; line-height:1.15}
.item-m{font-size:12.5px; color:var(--vellum-dim); margin-top:3px}
.item-actions{display:flex; gap:6px; margin-top:10px}
.mini{background:none; border:1px solid var(--line-soft); color:var(--muted); width:28px; height:28px; border-radius:2px; display:grid; place-items:center; cursor:pointer; transition:all .15s}
.mini:hover{color:var(--brass); border-color:var(--brass)}
.mini.del:hover{color:var(--sanguine); border-color:var(--sanguine)}

.empty{text-align:center; padding:34px 18px; color:var(--muted)}
.empty .ico{color:var(--line); margin-bottom:10px}
.empty h4{font-family:var(--serif); font-size:20px; color:var(--vellum-dim); font-weight:600; margin:0 0 5px}
.empty p{font-size:13px; line-height:1.5; max-width:340px; margin:0 auto}

/* Assistant IA */
.chat{flex:1; min-height:280px; display:flex; flex-direction:column}
.chat-log{flex:1; overflow-y:auto; padding:4px 4px 4px 0; display:flex; flex-direction:column; gap:14px}
.msg{max-width:88%; font-size:13.5px; line-height:1.6}
.msg.user{align-self:flex-end; background:var(--ink2); border:1px solid var(--line); padding:10px 13px; border-radius:3px}
.msg.bot{align-self:flex-start}
.msg.bot .who{font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--sanguine); margin-bottom:5px; display:flex; align-items:center; gap:6px}
.msg.bot .body{white-space:pre-wrap; color:var(--vellum)}
.chat-bar{display:flex; gap:9px; margin-top:14px; border-top:1px solid var(--line-soft); padding-top:14px}
.chat-bar input{flex:1; background:var(--ink2); border:1px solid var(--line); color:var(--vellum); font-family:var(--sans); font-size:13.5px; padding:11px 13px; border-radius:2px; outline:none}
.chat-bar input:focus{border-color:var(--sanguine)}
.suggest{display:flex; flex-wrap:wrap; gap:7px; margin-top:12px}
.suggest button{font-size:12px; color:var(--vellum-dim); background:var(--ink2); border:1px solid var(--line-soft); padding:6px 11px; border-radius:999px; cursor:pointer; transition:all .15s}
.suggest button:hover{color:var(--brass); border-color:var(--brass)}
.dots span{display:inline-block; width:5px; height:5px; border-radius:50%; background:var(--sanguine); margin-right:4px; animation:blink 1.2s infinite}
.dots span:nth-child(2){animation-delay:.2s} .dots span:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,60%,100%{opacity:.25} 30%{opacity:1}}

/* Frise chronologique */
.timeline{position:relative; padding-left:30px}
.timeline::before{content:""; position:absolute; left:9px; top:6px; bottom:6px; width:1px; background:linear-gradient(var(--brass),var(--line),var(--brass))}
.tl-ev{position:relative; margin-bottom:18px}
.tl-ev::before{content:""; position:absolute; left:-25px; top:5px; width:11px; height:11px; border-radius:50%; background:var(--ink); border:2px solid var(--brass)}
.tl-year{font-family:var(--serif); font-size:21px; font-weight:700; color:var(--brass-hi); line-height:1}
.tl-t{font-weight:600; margin-top:3px}
.tl-d{font-size:13px; color:var(--vellum-dim); margin-top:3px; line-height:1.5}

/* Kanban */
.kanban{display:grid; grid-template-columns:repeat(3,1fr); gap:12px}
@media(max-width:680px){.kanban{grid-template-columns:1fr}}
.col{background:var(--ink2); border:1px solid var(--line-soft); border-radius:2px; padding:11px; min-height:120px}
.col-h{font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--vellum-dim); margin-bottom:10px; display:flex; justify-content:space-between}
.card{background:var(--leather); border:1px solid var(--line-soft); border-left:2px solid var(--brass); border-radius:2px; padding:9px 10px; margin-bottom:8px; font-size:13px; cursor:grab}
.card.p-haute{border-left-color:var(--sanguine)}
.card-meta{display:flex; justify-content:space-between; align-items:center; margin-top:7px; font-size:11px; color:var(--muted)}
.card-move{display:flex; gap:4px}
.card-move button{background:none; border:1px solid var(--line-soft); color:var(--muted); border-radius:2px; cursor:pointer; font-size:11px; padding:1px 6px}
.card-move button:hover{color:var(--brass); border-color:var(--brass)}

/* Progression (rédaction) */
.bar{height:6px; background:var(--ink); border-radius:999px; overflow:hidden; margin-top:8px}
.bar > i{display:block; height:100%; background:linear-gradient(90deg,var(--brass),var(--brass-hi))}

/* Embeds */
.frame{width:100%; border:1px solid var(--line); border-radius:2px; background:var(--ink2)}
.notice{display:flex; gap:11px; background:var(--ink2); border:1px solid var(--line-soft); border-left:2px solid var(--brass); border-radius:2px; padding:13px 14px; font-size:13px; color:var(--vellum-dim); line-height:1.55}
.notice .ico{color:var(--brass); flex:none; margin-top:1px}
.notice b{color:var(--vellum); font-weight:600}
.linklist a{display:flex; align-items:center; gap:8px; color:var(--vellum-dim); text-decoration:none; padding:9px 0; border-bottom:1px solid var(--line-soft); font-size:13.5px; transition:color .15s}
.linklist a:hover{color:var(--brass)}
.linklist a .ext{margin-left:auto; opacity:.6}

/* Contrôle segmenté (toggle) */
.seg{display:flex; border:1px solid var(--line); border-radius:2px; overflow:hidden}
.seg button{background:var(--ink2); border:none; color:var(--vellum-dim); font-family:var(--sans); font-size:12px; letter-spacing:.3px; padding:6px 13px; cursor:pointer; transition:all .15s}
.seg button:hover{color:var(--vellum)}
.seg button.on{background:var(--brass); color:#221b0c}
.seg button + button{border-left:1px solid var(--line)}

/* Grille de références (Zotero élargi) */
.zgrid{display:grid; grid-template-columns:1fr 1fr; gap:11px; align-content:start}
.zgrid .item{margin-bottom:0}
@media(max-width:760px){.zgrid{grid-template-columns:1fr}}

/* Barre de filtres */
.filterbar{display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:13px}
.filterbar .topsearch{flex:1; min-width:180px; display:flex}
.chev{flex:none}

/* Modale */
.overlay{position:fixed; inset:0; background:rgba(10,8,6,.7); backdrop-filter:blur(3px); z-index:80; display:grid; place-items:start center; padding:48px 18px; overflow-y:auto; animation:rise .25s ease both}
.modal{width:100%; max-width:560px; background:linear-gradient(180deg,var(--leather),var(--leather2)); border:1px solid var(--line); border-radius:4px; padding:24px; position:relative}
.modal h3{font-family:var(--serif); font-size:25px; font-weight:600; margin:0}
.modal .sub{color:var(--vellum-dim); font-size:13px; margin:6px 0 18px}
.modal-x{position:absolute; top:16px; right:16px}
.set-group{border-top:1px solid var(--line-soft); padding-top:16px; margin-top:16px}
.set-group:first-of-type{border-top:0; padding-top:0; margin-top:0}
.set-group h5{font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--brass); margin:0 0 12px; display:flex; align-items:center; gap:7px}

.foot{border-top:1px solid var(--line); margin-top:30px; padding:22px 0 8px; color:var(--muted); font-size:12px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px}
.foot .mark{font-family:var(--serif); color:var(--vellum-dim); font-size:15px}

@media (prefers-reduced-motion: reduce){*{animation:none !important; transition:none !important}}

/* Galerie Google Drive (aperçus) */
.dgal{display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:14px}
.dgal-card{display:flex; flex-direction:column; text-decoration:none; background:var(--ink2); border:1px solid var(--line-soft); border-radius:3px; overflow:hidden; transition:all .16s}
.dgal-card:hover{border-color:var(--brass); transform:translateY(-2px)}
.dgal-thumb{position:relative; width:100%; aspect-ratio:4/3; background:#0f0c09; display:grid; place-items:center; overflow:hidden}
.dgal-thumb img{width:100%; height:100%; object-fit:cover; display:block}
.dgal-thumb .ph{color:var(--brass); opacity:.55}
.dgal-meta{padding:9px 10px}
.dgal-name{font-size:12.5px; color:var(--vellum); line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden}
.dgal-type{font-size:10px; letter-spacing:1.2px; text-transform:uppercase; color:var(--muted); margin-top:4px}
.dgal-badge{position:absolute; top:6px; left:6px; background:rgba(15,12,9,.78); border:1px solid var(--line); color:var(--brass); border-radius:2px; padding:2px 6px; font-size:9.5px; letter-spacing:1px; text-transform:uppercase}

/* Agenda — filtre thème sombre */
.agenda-wrap{border:1px solid var(--line); border-radius:2px; overflow:hidden; background:var(--ink2)}
.agenda-wrap.dark iframe{filter:invert(0.9) hue-rotate(180deg) saturate(0.85) contrast(0.95)}
.excali-wrap{position:relative; height:480px; border:1px solid var(--line); border-radius:3px; overflow:hidden; background:#fff}
.excali-wrap .excalidraw{height:100%}
.agenda-wrap iframe{display:block}

/* Wiki façon Notion */
.wiki{display:grid; grid-template-columns:260px 1fr; gap:0; border:1px solid var(--line); border-radius:3px; overflow:hidden; min-height:520px}
@media(max-width:760px){.wiki{grid-template-columns:1fr}}
.wiki-side{background:var(--ink2); border-right:1px solid var(--line); display:flex; flex-direction:column; min-width:0}
@media(max-width:760px){.wiki-side{border-right:0; border-bottom:1px solid var(--line); max-height:240px}}
.wiki-side-h{padding:12px; border-bottom:1px solid var(--line-soft)}
.wiki-search{display:flex; align-items:center; gap:8px; background:var(--ink); border:1px solid var(--line); border-radius:2px; padding:7px 10px; color:var(--vellum-dim); margin-bottom:9px}
.wiki-search input{background:none; border:none; outline:none; color:var(--vellum); font-family:var(--sans); font-size:12.5px; width:100%}
.wiki-tree{flex:1; overflow-y:auto; padding:7px}
.wiki-row{display:flex; align-items:center; gap:5px; border-radius:2px; cursor:pointer; color:var(--vellum-dim); font-size:13px; padding:6px 7px; transition:background .12s; user-select:none}
.wiki-row:hover{background:rgba(196,164,82,.07); color:var(--vellum)}
.wiki-row.on{background:rgba(196,164,82,.14); color:var(--brass-hi)}
.wiki-row .twirl{width:15px; flex:none; display:grid; place-items:center; color:var(--muted)}
.wiki-row .emoji{flex:none; width:18px; text-align:center}
.wiki-row .label{flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.wiki-row .addk{opacity:0; flex:none; color:var(--muted); border:none; background:none; cursor:pointer; padding:0 3px}
.wiki-row:hover .addk{opacity:1}
.wiki-row .addk:hover{color:var(--brass)}
.wiki-main{display:flex; flex-direction:column; min-width:0; background:linear-gradient(180deg,var(--leather),var(--leather2))}
.wiki-bar{display:flex; align-items:center; gap:8px; padding:11px 14px; border-bottom:1px solid var(--line-soft)}
.wiki-bar .crumb{flex:1; font-size:11.5px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.wiki-body{flex:1; overflow-y:auto; padding:20px 24px}
.wiki-emoji-in{width:46px; font-size:30px; background:none; border:none; outline:none; text-align:center; cursor:pointer}
.wiki-title-in{width:100%; background:none; border:none; outline:none; color:var(--vellum); font-family:var(--serif); font-size:32px; font-weight:600; line-height:1.1}
.wiki-title-in::placeholder{color:var(--muted)}
.wiki-tagrow{display:flex; align-items:center; gap:8px; margin:10px 0 4px}
.wiki-tagrow input{flex:1; background:var(--ink2); border:1px solid var(--line-soft); color:var(--vellum-dim); border-radius:2px; padding:6px 9px; font-size:12px; outline:none; font-family:var(--sans)}
.wiki-edit{width:100%; min-height:300px; background:var(--ink2); border:1px solid var(--line-soft); border-radius:2px; color:var(--vellum); font-family:var(--sans); font-size:14px; line-height:1.7; padding:14px; outline:none; resize:vertical}
.wiki-edit:focus{border-color:var(--brass)}
.wiki-hint{font-size:11.5px; color:var(--muted); margin-top:8px; line-height:1.5}
.wiki-render{font-size:14.5px; line-height:1.75; color:var(--vellum)}
.wiki-render h1{font-family:var(--serif); font-size:25px; font-weight:600; margin:18px 0 8px}
.wiki-render h2{font-family:var(--serif); font-size:21px; font-weight:600; margin:16px 0 7px}
.wiki-render h3{font-size:16px; font-weight:600; color:var(--vellum-dim); margin:14px 0 6px; letter-spacing:.3px}
.wiki-render p{margin:0 0 11px}
.wiki-render ul{margin:0 0 11px; padding-left:20px}
.wiki-render li{margin:3px 0}
.wiki-render strong{color:#fff; font-weight:600}
.wlink{color:var(--brass-hi); border-bottom:1px solid var(--line); cursor:pointer; text-decoration:none}
.wlink:hover{border-color:var(--brass)}
.wlink.missing{color:var(--sanguine); border-bottom-style:dotted}

@media(max-width:760px){
  .topsearch{display:none} .nav{margin-left:0} .topbar-in{gap:10px; flex-wrap:wrap; height:auto; padding:12px 0}
  .view-title{font-size:30px}
}
`;

/* ------------------------------------------------------------------ */
/*  Persistance via localStorage du navigateur                        */
/* ------------------------------------------------------------------ */

function usePersistent(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initial;
    } catch (e) { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* quota / mode privé */ }
  }, [key, val]);
  return [val, setVal];
}

const uid = () => Math.random().toString(36).slice(2, 9);

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ------------------------------------------------------------------ */
/*  Petits composants                                                  */
/* ------------------------------------------------------------------ */

function Corners() {
  return (<>
    <span className="corner tl" /><span className="corner tr" />
    <span className="corner bl" /><span className="corner br" />
  </>);
}

function Panel({ icon, title, kicker, cote, right, children, className = "", style, collapsible = false, defaultOpen = true }) {
  const Ico = icon;
  const [open, setOpen] = useState(defaultOpen);
  const showBody = !collapsible || open;
  const toggle = collapsible ? () => setOpen((o) => !o) : undefined;
  return (
    <section className={"panel " + className} style={style}>
      <Corners />
      <div className="panel-head" onClick={toggle} style={collapsible ? { cursor: "pointer", marginBottom: showBody ? 14 : 0 } : undefined}>
        <div className="panel-label">
          {Ico && <Ico size={19} className="ico" />}
          <div>
            <div className="panel-title">{title}</div>
            {kicker && <div className="panel-kicker">{kicker}</div>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {right && <span onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 10 }}>{right}</span>}
          {cote && <span className="cote">Cote · {cote}</span>}
          {collapsible && <ChevronDown size={18} className="chev" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", color: "var(--brass)" }} />}
        </div>
      </div>
      {showBody && children}
    </section>
  );
}

function Empty({ icon, title, text }) {
  const Ico = icon || BookOpen;
  return (
    <div className="empty">
      <Ico size={34} className="ico" />
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}

function Notice({ children }) {
  return <div className="notice"><Info size={17} className="ico" /><div>{children}</div></div>;
}

/* ------------------------------------------------------------------ */
/*  ACCUEIL — Assistant IA                                            */
/* ------------------------------------------------------------------ */

function AssistantIA({ buildIndex }) {
  const [log, setLog] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log, busy]);

  const ask = useCallback(async (question) => {
    const text = (question || "").trim();
    if (!text || busy) return;
    setLog((l) => [...l, { role: "user", text }]);
    setQ(""); setBusy(true);
    const index = buildIndex();
    const prompt =
`Tu es l'assistant de recherche documentaire d'un historien, intégré à son tableau de bord « Scriptorium ».
Voici l'index actuel de ses fonds (format JSON). Il regroupe citations, personnes (prosopographie), événements de la frise, et références Zotero présentes dans l'outil :

${JSON.stringify(index).slice(0, 7000)}

Question de l'historien : « ${text} »

Réponds en français, de façon concise et précise. Quand des éléments de l'index correspondent, cite-les (titre / auteur / année) et indique dans quel onglet les retrouver (Bibliothèque, Wiki…). Si l'index ne contient rien de pertinent, dis-le clairement et propose une piste de recherche ou une source à consulter. Pas de baratin.`;
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.error ? data.error : "Erreur " + res.status);
      const answer = (data.text || "").trim()
        || "Je n'ai pas réussi à formuler une réponse. Reformule ta demande ?";
      setLog((l) => [...l, { role: "bot", text: answer }]);
    } catch (e) {
      setLog((l) => [...l, { role: "bot", text: "La consultation a échoué : " + (e.message || "connexion indisponible") + ". Vérifie que la variable ANTHROPIC_API_KEY est bien configurée dans Vercel." }]);
    } finally { setBusy(false); }
  }, [busy, buildIndex]);

  const samples = ["Quelles citations parlent de pouvoir ?", "Qui sont les personnes du XVIᵉ siècle ?", "Résume ma frise chronologique"];

  return (
    <Panel icon={Sparkles} title="Assistant de recherche" kicker="Interroge tes fonds" cote="ACC·IA"
      className="tall" style={{ minHeight: 460 }}>
      <div className="chat">
        <div className="chat-log scroll" ref={logRef}>
          {log.length === 0 && !busy && (
            <Empty icon={Search} title="Pose ta question"
              text="L'assistant cherche dans tes citations, ta prosopographie, ta frise et tes références Zotero pour t'orienter vers le bon document." />
          )}
          {log.map((m, i) => (
            <div key={i} className={"msg " + (m.role === "user" ? "user" : "bot")}>
              {m.role === "bot" && <div className="who"><Sparkles size={12} /> Assistant</div>}
              <div className="body">{m.text}</div>
            </div>
          ))}
          {busy && <div className="msg bot"><div className="who"><Sparkles size={12} /> Assistant</div>
            <div className="dots"><span /><span /><span /></div></div>}
        </div>
        {log.length === 0 && (
          <div className="suggest">
            {samples.map((s) => <button key={s} onClick={() => ask(s)}>{s}</button>)}
          </div>
        )}
        <div className="chat-bar">
          <input value={q} placeholder="Rechercher un document, une idée, une personne…"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") ask(q); }} />
          <button className="btn btn-sang" disabled={busy || !q.trim()} onClick={() => ask(q)}>
            <Send size={15} /> Demander
          </button>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  ACCUEIL — Agenda (Google Calendar)                                */
/* ------------------------------------------------------------------ */

function Agenda({ cfg, openSettings }) {
  const [dark, setDark] = usePersistent("scr.agendaDark", true);
  const src = useMemo(() => {
    const v = (cfg.calendar || "").trim();
    if (!v) return "";
    let u;
    try {
      u = v.startsWith("http") ? new URL(v) : new URL("https://calendar.google.com/calendar/embed");
      if (!v.startsWith("http")) { u.searchParams.set("src", v); u.searchParams.set("mode", "AGENDA"); }
    } catch (e) { return v; }
    u.searchParams.set("hl", "fr");          // interface française → heures en 24 h
    u.searchParams.set("ctz", "Europe/Paris");
    return u.toString();
  }, [cfg.calendar]);
  return (
    <Panel icon={Calendar} title="Agenda" kicker="Google Agenda" cote="ACC·AG"
      right={<span style={{ display: "flex", gap: 6 }}>
        <button className="mini" title={dark ? "Affichage clair" : "Affichage sombre"} onClick={() => setDark((d) => !d)}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button className="mini" onClick={openSettings}><Settings size={15} /></button>
      </span>}>
      {src ? (
        <div className={"agenda-wrap" + (dark ? " dark" : "")}>
          <iframe title="agenda" src={src} style={{ width: "100%", height: 360, border: 0 }} />
        </div>
      ) : (
        <div>
          <Empty icon={Calendar} title="Agenda non relié"
            text="Affiche ton Google Agenda directement ici, en lecture, pour garder tes séances d'archives et d'écriture à l'œil." />
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={openSettings}>
            <Settings size={15} /> Relier mon agenda
          </button>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  GESTION — Rédaction (chantiers d'écriture)                        */
/* ------------------------------------------------------------------ */

function DriveDocs({ cfg, openSettings }) {
  const id = (cfg.docFolder || "").trim();
  return (
    <Panel icon={FileText} title="Documents" kicker="Fichiers Word · Google Drive" cote="ACC·DOC"
      right={<button className="mini" onClick={openSettings}><Settings size={15} /></button>}>
      <DriveBody cfg={cfg} folderId={id} mode="list" openSettings={openSettings} badge="Word"
        emptyText="Navigue dans tes fichiers Word depuis un dossier Drive et ouvre-les pour les éditer." />
      {id && (
        <div className="notice" style={{ marginTop: 12 }}>
          <Info size={17} className="ico" />
          <div>Clique un document pour l'ouvrir et l'éditer dans Google, connecté à ton compte. <b>L'édition directement dans cette fenêtre</b> demanderait la connexion Google (Picker + Docs API).</div>
        </div>
      )}
    </Panel>
  );
}

function GestionBlock() {
  const [view, setView] = useState("ecriture");
  // Écriture
  const [items, setItems] = usePersistent("scr.redaction", []);
  const [rOpen, setROpen] = useState(false);
  const [rDraft, setRDraft] = useState(null);
  const rBlank = () => ({ id: uid(), title: "", type: "Chapitre", target: 5000, current: 0, status: "En cours", notes: "" });
  const rSave = () => { if (!rDraft.title.trim()) return; setItems((l) => l.some((x) => x.id === rDraft.id) ? l.map((x) => x.id === rDraft.id ? rDraft : x) : [...l, rDraft]); setROpen(false); setRDraft(null); };
  // Projet
  const [tasks, setTasks] = usePersistent("scr.projet", []);
  const [pOpen, setPOpen] = useState(false);
  const [pDraft, setPDraft] = useState(null);
  const pAdd = () => { setPDraft({ id: uid(), title: "", col: "afaire", priority: "Normale", note: "" }); setPOpen(true); };
  const pSave = () => { if (!pDraft.title.trim()) return; setTasks((l) => l.some((t) => t.id === pDraft.id) ? l.map((t) => t.id === pDraft.id ? pDraft : t) : [...l, pDraft]); setPOpen(false); };
  const move = (id, dir) => setTasks((l) => l.map((t) => {
    if (t.id !== id) return t;
    const i = COLS.findIndex((c) => c.k === t.col);
    const ni = Math.max(0, Math.min(COLS.length - 1, i + dir));
    return { ...t, col: COLS[ni].k };
  }));

  const seg = (
    <>
      <div className="seg">
        <button className={view === "ecriture" ? "on" : ""} onClick={() => setView("ecriture")}>Écriture</button>
        <button className={view === "projet" ? "on" : ""} onClick={() => setView("projet")}>Projet</button>
      </div>
      {view === "ecriture"
        ? <button className="mini" onClick={() => { setRDraft(rBlank()); setROpen(true); }}><Plus size={16} /></button>
        : <button className="mini" onClick={pAdd}><Plus size={16} /></button>}
    </>
  );

  return (
    <Panel icon={Layers} title="Écriture &amp; projet" kicker="Pilotage du travail" cote="GES" right={seg}>
      {view === "ecriture" ? (
        items.length === 0 ? (
          <Empty icon={PenTool} title="Aucun chantier d'écriture"
            text="Suis l'avancement de ton mémoire et de chaque chapitre : objectif de mots, statut, notes." />
        ) : (
          <div className="scroll" style={{ maxHeight: 340 }}>
            {items.map((it) => {
              const pct = it.target > 0 ? Math.min(100, Math.round((it.current / it.target) * 100)) : 0;
              return (
                <div className="item" key={it.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div className="item-t">{it.title}</div>
                      <div className="item-m">{it.type} · {it.status} · {it.current.toLocaleString("fr")} / {it.target.toLocaleString("fr")} mots</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flex: "none" }}>
                      <button className="mini" onClick={() => { setRDraft(it); setROpen(true); }}><Pencil size={14} /></button>
                      <button className="mini del" onClick={() => setItems((l) => l.filter((x) => x.id !== it.id))}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="bar"><i style={{ width: pct + "%" }} /></div>
                  {it.notes && <div className="item-m" style={{ marginTop: 8 }}>{it.notes}</div>}
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="kanban">
          {COLS.map((c) => {
            const list = tasks.filter((t) => t.col === c.k);
            return (
              <div className="col" key={c.k}>
                <div className="col-h"><span>{c.l}</span><span>{list.length}</span></div>
                {list.map((t) => (
                  <div className={"card " + (t.priority === "Haute" ? "p-haute" : "")} key={t.id}>
                    <div>{t.title}</div>
                    {t.note && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{t.note}</div>}
                    <div className="card-meta">
                      <span className="card-move">
                        <button onClick={() => move(t.id, -1)}>‹</button>
                        <button onClick={() => move(t.id, 1)}>›</button>
                      </span>
                      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {t.priority === "Haute" && <span style={{ color: "var(--sanguine)" }}>prioritaire</span>}
                        <button className="mini del" style={{ width: 22, height: 22 }} onClick={() => setTasks((l) => l.filter((x) => x.id !== t.id))}><Trash2 size={12} /></button>
                      </span>
                    </div>
                  </div>
                ))}
                {list.length === 0 && <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "10px 0" }}>—</div>}
              </div>
            );
          })}
        </div>
      )}

      {rOpen && rDraft && (
        <div className="overlay" onClick={(e) => { if (e.target.classList.contains("overlay")) setROpen(false); }}>
          <div className="modal">
            <button className="iconbtn modal-x" onClick={() => setROpen(false)}><X size={16} /></button>
            <h3>{items.some((x) => x.id === rDraft.id) ? "Modifier le chantier" : "Nouveau chantier"}</h3>
            <p className="sub">Garde le cap sur ton objectif d'écriture.</p>
            <div className="field"><label>Titre</label>
              <input className="inp" value={rDraft.title} onChange={(e) => setRDraft({ ...rDraft, title: e.target.value })} placeholder="Chapitre II — La cour et ses réseaux" /></div>
            <div className="row">
              <div className="field"><label>Type</label>
                <select className="inp" value={rDraft.type} onChange={(e) => setRDraft({ ...rDraft, type: e.target.value })}>
                  {["Mémoire", "Chapitre", "Article", "Note", "Communication"].map((t) => <option key={t}>{t}</option>)}
                </select></div>
              <div className="field"><label>Statut</label>
                <select className="inp" value={rDraft.status} onChange={(e) => setRDraft({ ...rDraft, status: e.target.value })}>
                  {["À commencer", "En cours", "À relire", "Terminé"].map((t) => <option key={t}>{t}</option>)}
                </select></div>
            </div>
            <div className="row">
              <div className="field"><label>Mots écrits</label>
                <input className="inp" type="number" value={rDraft.current} onChange={(e) => setRDraft({ ...rDraft, current: +e.target.value || 0 })} /></div>
              <div className="field"><label>Objectif</label>
                <input className="inp" type="number" value={rDraft.target} onChange={(e) => setRDraft({ ...rDraft, target: +e.target.value || 0 })} /></div>
            </div>
            <div className="field"><label>Notes</label>
              <textarea className="inp" value={rDraft.notes} onChange={(e) => setRDraft({ ...rDraft, notes: e.target.value })} placeholder="Sources à intégrer, angle, points en suspens…" /></div>
            <button className="btn btn-brass" style={{ width: "100%", justifyContent: "center" }} onClick={rSave}><Save size={15} /> Enregistrer</button>
          </div>
        </div>
      )}

      {pOpen && pDraft && (
        <div className="overlay" onClick={(e) => { if (e.target.classList.contains("overlay")) setPOpen(false); }}>
          <div className="modal">
            <button className="iconbtn modal-x" onClick={() => setPOpen(false)}><X size={16} /></button>
            <h3>Nouvelle tâche</h3><p className="sub">Découpe ton travail en étapes claires.</p>
            <div className="field"><label>Intitulé</label>
              <input className="inp" value={pDraft.title} onChange={(e) => setPDraft({ ...pDraft, title: e.target.value })} placeholder="Dépouiller les registres paroissiaux" /></div>
            <div className="row">
              <div className="field"><label>Colonne</label>
                <select className="inp" value={pDraft.col} onChange={(e) => setPDraft({ ...pDraft, col: e.target.value })}>
                  {COLS.map((c) => <option key={c.k} value={c.k}>{c.l}</option>)}
                </select></div>
              <div className="field"><label>Priorité</label>
                <select className="inp" value={pDraft.priority} onChange={(e) => setPDraft({ ...pDraft, priority: e.target.value })}>
                  {["Normale", "Haute"].map((p) => <option key={p}>{p}</option>)}
                </select></div>
            </div>
            <div className="field"><label>Note</label>
              <textarea className="inp" value={pDraft.note} onChange={(e) => setPDraft({ ...pDraft, note: e.target.value })} /></div>
            <button className="btn btn-brass" style={{ width: "100%", justifyContent: "center" }} onClick={pSave}><Save size={15} /> Ajouter</button>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  GESTION — Gestionnaire de projet (kanban)                         */
/* ------------------------------------------------------------------ */

const COLS = [{ k: "afaire", l: "À faire" }, { k: "encours", l: "En cours" }, { k: "termine", l: "Terminé" }];

/* ------------------------------------------------------------------ */
/*  BIBLIOTHÈQUE — Tropy (import JSON-LD, lecture)                     */
/* ------------------------------------------------------------------ */

function Tropy({ cfg, openSettings }) {
  const [items, setItems] = usePersistent("scr.tropy", []);
  const [query, setQuery] = useState("");
  const fileRef = useRef(null);

  const clean = (s) => {
    if (typeof s === "string") return s;
    if (Array.isArray(s)) return s.map(clean).filter(Boolean).join(", ");
    if (s && typeof s === "object") return s["@value"] || s.value || "";
    return "";
  };
  const importJson = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const graph = data["@graph"] || data.items || (Array.isArray(data) ? data : [data]);
        const mapped = (graph || []).map((it) => {
          const findKey = (suf) => Object.keys(it).find((k) => k.toLowerCase().endsWith(suf));
          const title = clean(it[findKey("title")]) || it.name || "(document)";
          const meta = {};
          Object.keys(it).forEach((k) => {
            if (["@id", "@type", "@context", "template", "photo", "selection", "list"].includes(k)) return;
            const label = k.split(/[\/#]/).pop();
            const val = clean(it[k]);
            if (val && label && label.toLowerCase() !== "title") meta[label] = val;
          });
          const photos = Array.isArray(it.photo) ? it.photo.length : (it.photo ? 1 : 0);
          return { id: uid(), title, type: clean(it["@type"]), meta, photos };
        }).filter((x) => (x.title && x.title !== "(document)") || Object.keys(x.meta || {}).length);
        if (!mapped.length) { alert("Aucun élément trouvé. Exporte tes éléments en JSON-LD depuis Tropy."); return; }
        setItems(mapped);
      } catch (e) { alert("Fichier illisible : exporte tes éléments Tropy en JSON-LD."); }
    };
    reader.readAsText(file);
  };

  const filtered = items.filter((i) => !query || (i.title + " " + Object.values(i.meta || {}).join(" ")).toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <Panel icon={ImageIcon} title="Tropy — inventaire" kicker="Métadonnées des photographies d'archives" cote="BIB·TRO"
        right={<button className="mini" title="Importer un export JSON-LD" onClick={() => fileRef.current && fileRef.current.click()}><Upload size={15} /></button>}>
        <input ref={fileRef} type="file" accept=".json,.jsonld" style={{ display: "none" }}
          onChange={(e) => e.target.files[0] && importJson(e.target.files[0])} />
        {items.length === 0 ? (
          <div>
            <Empty icon={ImageIcon} title="Inventaire vide"
              text="Importe un export JSON-LD de Tropy pour retrouver ici tout l'inventaire : titres, métadonnées complètes et nombre de clichés, avec recherche." />
            <Notice><b>Pourquoi un import ?</b> Tropy est un logiciel de bureau (base de données locale, sans API web) : aucune connexion temps réel n'est possible. L'export JSON-LD est la voie officielle ; il est rejoué ici en fiches consultables. Pour <b>voir les clichés</b>, relie ci-dessous le dossier Drive où tu les ranges.</Notice>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
              onClick={() => fileRef.current && fileRef.current.click()}><Upload size={15} /> Importer un export JSON-LD</button>
          </div>
        ) : (
          <div>
            <div className="filterbar">
              <div className="topsearch"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher dans l'inventaire…" /></div>
              <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current && fileRef.current.click()}><Upload size={13} /> Réimporter</button>
            </div>
            <div className="scroll" style={{ maxHeight: 420 }}>
              {filtered.map((i) => (
                <div className="item" key={i.id}>
                  <div className="item-t" style={{ fontSize: 17 }}>{i.title}</div>
                  <div className="item-m">{[i.type, i.photos ? i.photos + " cliché" + (i.photos > 1 ? "s" : "") : ""].filter(Boolean).join(" · ")}</div>
                  {Object.keys(i.meta || {}).length > 0 && (
                    <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "auto 1fr", gap: "3px 12px", fontSize: 12.5 }}>
                      {Object.entries(i.meta).slice(0, 8).map(([k, v]) => (
                        <React.Fragment key={k}>
                          <span style={{ color: "var(--brass)", textTransform: "capitalize" }}>{k}</span>
                          <span style={{ color: "var(--vellum-dim)" }}>{v}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>

      <div style={{ marginTop: 18 }}>
        <Panel icon={ImageIcon} title="Tropy — clichés" kicker="Images reliées · Google Drive" cote="BIB·TRO·IMG"
          right={<button className="mini" onClick={openSettings}><Settings size={15} /></button>}>
          <DriveBody cfg={cfg} folderId={(cfg.tropyFolder || "").trim()} mode="grid" openSettings={openSettings} badge="Cliché"
            emptyText="Range les photographies exportées de Tropy dans un dossier Drive pour les consulter ici, en regard de l'inventaire." />
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BIBLIOTHÈQUE — Banque de citation (CRUD + recherche)              */
/* ------------------------------------------------------------------ */

function Citations({ register }) {
  const [items, setItems] = usePersistent("scr.citations", []);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => { register(items); }, [items, register]);

  const blank = () => ({ id: uid(), text: "", author: "", source: "", page: "", tags: [] });
  const save = () => {
    if (!draft.text.trim()) return;
    const clean = { ...draft, tags: typeof draft.tags === "string" ? draft.tags.split(",").map((t) => t.trim()).filter(Boolean) : draft.tags };
    setItems((l) => l.some((x) => x.id === clean.id) ? l.map((x) => x.id === clean.id ? clean : x) : [...l, clean]);
    setOpen(false);
  };
  const allTags = [...new Set(items.flatMap((i) => i.tags || []))];
  const filtered = items.filter((i) =>
    (!query || (i.text + i.author + i.source).toLowerCase().includes(query.toLowerCase())) &&
    (!tag || (i.tags || []).includes(tag)));

  return (
    <Panel icon={Quote} title="Banque de citations" kicker="Extraits & références" cote="BIB·CIT"
      right={<button className="mini" onClick={() => { setDraft(blank()); setOpen(true); }}><Plus size={16} /></button>}>
      <div className="topsearch" style={{ display: "flex", marginBottom: 11 }}>
        <Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher dans les citations…" />
      </div>
      {allTags.length > 0 && (
        <div className="tags" style={{ marginBottom: 13 }}>
          {allTags.map((t) => <span key={t} className={"tag " + (tag === t ? "on" : "")} onClick={() => setTag(tag === t ? "" : t)}>{t}</span>)}
        </div>
      )}
      {filtered.length === 0 ? (
        <Empty icon={Quote} title="Aucune citation"
          text="Conserve les passages marquants de tes lectures, avec auteur, source et mots-clés, prêts à être cités." />
      ) : (
        <div className="scroll" style={{ maxHeight: 320 }}>
          {filtered.map((i) => (
            <div className="item" key={i.id}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.4, fontStyle: "italic" }}>« {i.text} »</div>
              <div className="item-m" style={{ marginTop: 6 }}>{[i.author, i.source, i.page && "p. " + i.page].filter(Boolean).join(" · ")}</div>
              {(i.tags || []).length > 0 && <div className="tags" style={{ marginTop: 8 }}>{i.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
              <div className="item-actions">
                <button className="mini" onClick={() => { setDraft({ ...i, tags: (i.tags || []).join(", ") }); setOpen(true); }}><Pencil size={14} /></button>
                <button className="mini del" onClick={() => setItems((l) => l.filter((x) => x.id !== i.id))}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && draft && (
        <div className="overlay" onClick={(e) => { if (e.target.classList.contains("overlay")) setOpen(false); }}>
          <div className="modal">
            <button className="iconbtn modal-x" onClick={() => setOpen(false)}><X size={16} /></button>
            <h3>Citation</h3><p className="sub">Un extrait, toujours rattaché à sa source.</p>
            <div className="field"><label>Texte</label>
              <textarea className="inp" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder="L'extrait cité…" /></div>
            <div className="row">
              <div className="field"><label>Auteur</label><input className="inp" value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} /></div>
              <div className="field"><label>Page</label><input className="inp" value={draft.page} onChange={(e) => setDraft({ ...draft, page: e.target.value })} /></div>
            </div>
            <div className="field"><label>Source</label><input className="inp" value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} placeholder="Ouvrage, archive, cote…" /></div>
            <div className="field"><label>Mots-clés (séparés par des virgules)</label>
              <input className="inp" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} placeholder="pouvoir, religion, XVIᵉ" /></div>
            <button className="btn btn-brass" style={{ width: "100%", justifyContent: "center" }} onClick={save}><Save size={15} /> Enregistrer</button>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Embed Google Drive (banque d'image, livres PDF)                   */
/* ------------------------------------------------------------------ */

function DriveThumb({ id, mimeType, badge }) {
  const [err, setErr] = useState(false);
  const isImg = (mimeType || "").startsWith("image/");
  const Ico = isImg ? ImageIcon : FileText;
  const thumb = `https://drive.google.com/thumbnail?id=${id}&sz=w400`;
  return (
    <div className="dgal-thumb">
      {badge && <span className="dgal-badge">{badge}</span>}
      {!err
        ? <img src={thumb} alt="" loading="lazy" onError={() => setErr(true)} />
        : <Ico size={34} className="ph" />}
    </div>
  );
}

function typeLabel(mimeType) {
  const m = mimeType || "";
  if (m.includes("pdf")) return "PDF";
  if (m.includes("word") || m.includes("officedocument.wordprocessing") || m.endsWith("document")) return "Document";
  if (m.startsWith("image/")) return "Image";
  if (m.includes("folder")) return "Dossier";
  if (m.includes("spreadsheet") || m.includes("excel")) return "Tableur";
  if (m.includes("presentation")) return "Présentation";
  return "Fichier";
}

function useDriveFiles(apiKey, folderId) {
  const [state, setState] = useState({ status: "idle", files: [], error: "" });
  useEffect(() => {
    if (!apiKey || !folderId) { setState({ status: "idle", files: [], error: "" }); return; }
    let active = true;
    setState({ status: "loading", files: [], error: "" });
    const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const fields = encodeURIComponent("files(id,name,mimeType,modifiedTime)");
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${apiKey}&fields=${fields}&orderBy=folder,name&pageSize=200`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (d.error) { setState({ status: "error", files: [], error: d.error.message || "Erreur Drive" }); return; }
        setState({ status: "ok", files: d.files || [], error: "" });
      })
      .catch((e) => { if (active) setState({ status: "error", files: [], error: (e && e.message) || "Erreur réseau" }); });
    return () => { active = false; };
  }, [apiKey, folderId]);
  return state;
}

function DriveBody({ cfg, folderId, emptyText, openSettings, badge }) {
  const apiKey = ((cfg && cfg.driveKey) || "").trim();
  const { status, files } = useDriveFiles(apiKey, folderId);
  const [query, setQuery] = useState("");

  if (!folderId) {
    return (
      <div>
        <Empty icon={FolderOpen} title="Dossier non relié" text={emptyText} />
        <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={openSettings}><Link2 size={15} /> Relier un dossier Drive</button>
      </div>
    );
  }

  // Galerie thémée seulement si la clé API renvoie réellement des fichiers ;
  // sinon, aperçu Drive natif (grille de vignettes) — fiable, sans configuration.
  const useGallery = apiKey && status === "ok" && files.length > 0;
  if (!useGallery) {
    const src = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
    return <iframe title="drive" src={src} style={{ width: "100%", height: 400, border: 0, borderRadius: 3, background: "#fff" }} />;
  }

  const filtered = files.filter((f) => !query || f.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <div className="topsearch" style={{ display: "flex", marginBottom: 13 }}>
        <Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filtrer les fichiers…" />
      </div>
      <div className="dgal scroll" style={{ maxHeight: 470 }}>
        {filtered.map((f) => (
          <a className="dgal-card" key={f.id}
            href={(f.mimeType || "").includes("folder") ? `https://drive.google.com/drive/folders/${f.id}` : `https://drive.google.com/file/d/${f.id}/view`}
            target="_blank" rel="noreferrer">
            <DriveThumb id={f.id} mimeType={f.mimeType} badge={badge} />
            <div className="dgal-meta">
              <div className="dgal-name">{f.name}</div>
              <div className="dgal-type">{typeLabel(f.mimeType)}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function DriveEmbed({ icon, title, kicker, cote, folderId, mode, openSettings, emptyText, cfg, badge }) {
  return (
    <Panel icon={icon} title={title} kicker={kicker} cote={cote}
      right={<button className="mini" onClick={openSettings}><Settings size={15} /></button>}>
      <DriveBody cfg={cfg} folderId={folderId} mode={mode} emptyText={emptyText} openSettings={openSettings} badge={badge} />
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  WIKI — Base de connaissances façon Notion (pages liées)           */
/* ------------------------------------------------------------------ */

function WikiNotion({ register }) {
  const seed = [{
    id: "home", title: "Accueil du wiki", parentId: null, emoji: "📜", tags: [],
    content: "Bienvenue dans ton wiki.\n\nCrée des pages, organise-les en arborescence et relie-les avec la syntaxe [[Titre de page]].\n\n# Pour commencer\n- Clique sur **Nouvelle page** à gauche\n- Survole une page pour lui ajouter une sous-page\n- Écris [[un titre]] pour créer un lien vers une autre page",
  }];
  const [pages, setPages] = usePersistent("scr.wiki", seed);
  const [selId, setSelId] = useState(pages[0] ? pages[0].id : null);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [editing, setEditing] = useState(false);

  useEffect(() => { register(pages); }, [pages, register]);
  useEffect(() => { if (!pages.find((p) => p.id === selId)) setSelId(pages[0] ? pages[0].id : null); }, [pages, selId]);

  const sel = pages.find((p) => p.id === selId) || null;
  const update = (id, patch) => setPages((l) => l.map((p) => p.id === id ? { ...p, ...patch } : p));

  const addPage = (parentId) => {
    const id = uid();
    setPages((l) => [...l, { id, title: "Nouvelle page", parentId: parentId || null, emoji: "📄", tags: [], content: "" }]);
    if (parentId) setCollapsed((c) => ({ ...c, [parentId]: false }));
    setSelId(id); setEditing(true);
  };
  const delPage = (id) => setPages((l) => {
    const page = l.find((p) => p.id === id);
    const par = page ? page.parentId : null;
    return l.filter((p) => p.id !== id).map((p) => p.parentId === id ? { ...p, parentId: par } : p);
  });

  const gotoTitle = (title) => {
    const t = title.trim().toLowerCase();
    const found = pages.find((p) => (p.title || "").trim().toLowerCase() === t);
    if (found) { setSelId(found.id); setEditing(false); }
    else {
      const id = uid();
      setPages((l) => [...l, { id, title: title.trim(), parentId: sel ? sel.id : null, emoji: "📄", tags: [], content: "" }]);
      setSelId(id); setEditing(true);
    }
  };

  const renderInline = (text, keyBase) => {
    const nodes = []; let rest = text; let k = 0;
    const re = /(\[\[([^\]]+)\]\])|(\*\*([^*]+)\*\*)|(\*([^*\n]+)\*)|(_([^_\n]+)_)/;
    while (rest.length) {
      const m = rest.match(re);
      if (!m) { nodes.push(rest); break; }
      if (m.index > 0) nodes.push(rest.slice(0, m.index));
      if (m[1]) {
        const title = m[2];
        const exists = pages.some((p) => (p.title || "").trim().toLowerCase() === title.trim().toLowerCase());
        nodes.push(<span key={keyBase + "-" + (k++)} className={"wlink" + (exists ? "" : " missing")} onClick={() => gotoTitle(title)}>{title}</span>);
      } else if (m[3]) {
        nodes.push(<strong key={keyBase + "-" + (k++)}>{m[4]}</strong>);
      } else if (m[5]) {
        nodes.push(<em key={keyBase + "-" + (k++)}>{m[6]}</em>);
      } else if (m[7]) {
        nodes.push(<em key={keyBase + "-" + (k++)}>{m[8]}</em>);
      }
      rest = rest.slice(m.index + m[0].length);
    }
    return nodes;
  };

  const renderContent = (text) => {
    const lines = (text || "").split("\n");
    const blocks = []; let list = null;
    lines.forEach((line, i) => {
      if (line.startsWith("- ")) { if (!list) list = []; list.push(<li key={"li" + i}>{renderInline(line.slice(2), "li" + i)}</li>); return; }
      if (list) { blocks.push(<ul key={"ul" + i}>{list}</ul>); list = null; }
      if (line.startsWith("### ")) blocks.push(<h3 key={i}>{renderInline(line.slice(4), "h" + i)}</h3>);
      else if (line.startsWith("## ")) blocks.push(<h2 key={i}>{renderInline(line.slice(3), "h" + i)}</h2>);
      else if (line.startsWith("# ")) blocks.push(<h1 key={i}>{renderInline(line.slice(2), "h" + i)}</h1>);
      else if (line.trim() === "") blocks.push(<div key={i} style={{ height: 8 }} />);
      else blocks.push(<p key={i}>{renderInline(line, "p" + i)}</p>);
    });
    if (list) blocks.push(<ul key="ul-end">{list}</ul>);
    return blocks;
  };

  const childrenOf = (pid) => pages.filter((p) => (p.parentId || null) === pid);
  const renderTree = (pid, depth) => childrenOf(pid).map((p) => {
    const kids = childrenOf(p.id);
    const isCol = collapsed[p.id];
    return (
      <div key={p.id}>
        <div className={"wiki-row" + (p.id === selId ? " on" : "")} style={{ paddingLeft: 7 + depth * 14 }}
          onClick={() => { setSelId(p.id); setEditing(false); }}>
          <span className="twirl" onClick={(e) => { e.stopPropagation(); if (kids.length) setCollapsed((c) => ({ ...c, [p.id]: !isCol })); }}>
            {kids.length ? <ChevronRight size={13} style={{ transform: isCol ? "none" : "rotate(90deg)", transition: "transform .15s" }} /> : null}
          </span>
          <span className="emoji">{p.emoji || "📄"}</span>
          <span className="label">{p.title || "Sans titre"}</span>
          <button className="addk" title="Ajouter une sous-page" onClick={(e) => { e.stopPropagation(); addPage(p.id); }}><Plus size={13} /></button>
        </div>
        {kids.length > 0 && !isCol && renderTree(p.id, depth + 1)}
      </div>
    );
  });

  const results = query ? pages.filter((p) => (p.title + " " + (p.content || "")).toLowerCase().includes(query.toLowerCase())) : null;

  const crumb = (() => {
    if (!sel) return "";
    const parts = []; let cur = sel; let guard = 0;
    while (cur && guard < 20) { parts.unshift(cur.title || "Sans titre"); cur = pages.find((p) => p.id === cur.parentId); guard++; }
    return parts.join("  ›  ");
  })();

  return (
    <Panel icon={BookText} title="Wiki" kicker="Pages liées · base de connaissances" cote="WIK·NOT">
      <div className="wiki">
        <div className="wiki-side">
          <div className="wiki-side-h">
            <div className="wiki-search">
              <Search size={14} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une page…" />
            </div>
            <button className="btn btn-brass btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => addPage(null)}><Plus size={14} /> Nouvelle page</button>
          </div>
          <div className="wiki-tree">
            {results ? (
              results.length === 0
                ? <div style={{ color: "var(--muted)", fontSize: 12.5, padding: "8px 7px" }}>Aucune page.</div>
                : results.map((p) => (
                  <div key={p.id} className={"wiki-row" + (p.id === selId ? " on" : "")} onClick={() => { setSelId(p.id); setEditing(false); setQuery(""); }}>
                    <span className="twirl" /><span className="emoji">{p.emoji || "📄"}</span><span className="label">{p.title || "Sans titre"}</span>
                  </div>
                ))
            ) : (
              childrenOf(null).length === 0
                ? <div style={{ color: "var(--muted)", fontSize: 12.5, padding: "8px 7px" }}>Crée ta première page.</div>
                : renderTree(null, 0)
            )}
          </div>
        </div>

        <div className="wiki-main">
          {!sel ? (
            <div style={{ margin: "auto" }}><Empty icon={BookText} title="Aucune page" text="Choisis une page à gauche ou crée-en une nouvelle." /></div>
          ) : (
            <>
              <div className="wiki-bar">
                <CornerDownRight size={14} style={{ color: "var(--muted)", flex: "none" }} />
                <span className="crumb">{crumb}</span>
                <button className="mini" title="Ajouter une sous-page" onClick={() => addPage(sel.id)}><Plus size={14} /></button>
                <button className="mini" title={editing ? "Aperçu" : "Modifier"} onClick={() => setEditing((e) => !e)}>{editing ? <BookText size={14} /> : <Pencil size={14} />}</button>
                <button className="mini del" title="Supprimer la page" onClick={() => delPage(sel.id)}><Trash2 size={14} /></button>
              </div>
              <div className="wiki-body">
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <input className="wiki-emoji-in" value={sel.emoji || ""} maxLength={2} onChange={(e) => update(sel.id, { emoji: e.target.value })} title="Emoji" />
                  <input className="wiki-title-in" value={sel.title} onChange={(e) => update(sel.id, { title: e.target.value })} placeholder="Titre de la page" />
                </div>
                <div className="wiki-tagrow">
                  <Filter size={13} style={{ color: "var(--muted)", flex: "none" }} />
                  <input value={(sel.tags || []).join(", ")} placeholder="étiquettes, séparées par des virgules"
                    onChange={(e) => update(sel.id, { tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
                </div>
                {editing ? (
                  <>
                    <textarea className="wiki-edit" value={sel.content || ""} onChange={(e) => update(sel.id, { content: e.target.value })}
                      placeholder="Écris ici…  Lien : [[Titre]] · Titre : # · Sous-titre : ## · Gras : **texte** · Italique : *texte* · Liste : - élément" />
                    <div className="wiki-hint">Lien : <b>[[Titre]]</b> &nbsp;·&nbsp; Titre : <b># </b> &nbsp;·&nbsp; Sous-titre : <b>## </b> &nbsp;·&nbsp; Gras : <b>**texte**</b> &nbsp;·&nbsp; Italique : <b>*texte*</b> &nbsp;·&nbsp; Liste : <b>- </b></div>
                  </>
                ) : (
                  <div className="wiki-render" onDoubleClick={() => setEditing(true)}>
                    {(sel.content || "").trim() ? renderContent(sel.content) : <p style={{ color: "var(--muted)" }}>Page vide. Clique sur le crayon (ou double-clique ici) pour l'éditer.</p>}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  WIKI — Prosopographie (fiches de personnes)                       */
/* ------------------------------------------------------------------ */

function Prosopographie({ register }) {
  const [people, setPeople] = usePersistent("scr.proso", []);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => { register(people); }, [people, register]);

  const blank = () => ({ id: uid(), name: "", birth: "", death: "", role: "", place: "", relations: "", notes: "", tags: [] });
  const save = () => {
    if (!draft.name.trim()) return;
    const clean = { ...draft, tags: typeof draft.tags === "string" ? draft.tags.split(",").map((t) => t.trim()).filter(Boolean) : (draft.tags || []) };
    setPeople((l) => l.some((x) => x.id === clean.id) ? l.map((x) => x.id === clean.id ? clean : x) : [...l, clean]);
    setOpen(false);
  };
  const allTags = [...new Set(people.flatMap((p) => p.tags || []))];
  const filtered = people.filter((p) =>
    (!query || (p.name + p.role + p.place + (p.relations || "")).toLowerCase().includes(query.toLowerCase())) &&
    (!tag || (p.tags || []).includes(tag)));

  return (
    <Panel icon={User} title="Prosopographie" kicker="Notices biographiques" cote="WIK·PRO"
      right={<button className="mini" onClick={() => { setDraft(blank()); setOpen(true); }}><Plus size={16} /></button>}>
      <div className="filterbar">
        <div className="topsearch">
          <Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher une personne…" />
        </div>
      </div>
      {allTags.length > 0 && (
        <div className="tags" style={{ marginBottom: 13 }}>
          {allTags.map((t) => <span key={t} className={"tag " + (tag === t ? "on" : "")} onClick={() => setTag(tag === t ? "" : t)}>{t}</span>)}
        </div>
      )}
      {filtered.length === 0 ? (
        <Empty icon={User} title="Aucune notice"
          text="Constitue ton répertoire de personnes : dates, fonction, lieu, liens et notes — la matière première de toute prosopographie." />
      ) : (
        <div className="scroll" style={{ maxHeight: 330 }}>
          {filtered.map((p) => (
            <div className="item" key={p.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div className="item-t">{p.name}</div>
                  <div className="item-m">{[(p.birth || p.death) && `${p.birth || "?"} – ${p.death || "?"}`, p.role, p.place].filter(Boolean).join(" · ")}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flex: "none" }}>
                  <button className="mini" onClick={() => { setDraft({ ...p, tags: (p.tags || []).join(", ") }); setOpen(true); }}><Pencil size={14} /></button>
                  <button className="mini del" onClick={() => setPeople((l) => l.filter((x) => x.id !== p.id))}><Trash2 size={14} /></button>
                </div>
              </div>
              {p.relations && <div className="item-m" style={{ marginTop: 6 }}><b style={{ color: "var(--vellum-dim)" }}>Liens :</b> {p.relations}</div>}
              {p.notes && <div className="item-m" style={{ marginTop: 4 }}>{p.notes}</div>}
              {(p.tags || []).length > 0 && <div className="tags" style={{ marginTop: 8 }}>{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
            </div>
          ))}
        </div>
      )}

      {open && draft && (
        <div className="overlay" onClick={(e) => { if (e.target.classList.contains("overlay")) setOpen(false); }}>
          <div className="modal">
            <button className="iconbtn modal-x" onClick={() => setOpen(false)}><X size={16} /></button>
            <h3>Notice prosopographique</h3><p className="sub">Une personne, ses repères, ses réseaux.</p>
            <div className="field"><label>Nom</label><input className="inp" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Marguerite de Navarre" /></div>
            <div className="row">
              <div className="field"><label>Naissance</label><input className="inp" value={draft.birth} onChange={(e) => setDraft({ ...draft, birth: e.target.value })} placeholder="1492" /></div>
              <div className="field"><label>Mort</label><input className="inp" value={draft.death} onChange={(e) => setDraft({ ...draft, death: e.target.value })} placeholder="1549" /></div>
            </div>
            <div className="row">
              <div className="field"><label>Fonction / statut</label><input className="inp" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} /></div>
              <div className="field"><label>Lieu</label><input className="inp" value={draft.place} onChange={(e) => setDraft({ ...draft, place: e.target.value })} /></div>
            </div>
            <div className="field"><label>Liens & réseaux</label><input className="inp" value={draft.relations} onChange={(e) => setDraft({ ...draft, relations: e.target.value })} placeholder="Sœur de François Iᵉʳ ; correspond avec…" /></div>
            <div className="field"><label>Notes</label><textarea className="inp" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></div>
            <div className="field"><label>Catégories (séparées par des virgules)</label><input className="inp" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} placeholder="noblesse, clergé, XVIᵉ" /></div>
            <button className="btn btn-brass" style={{ width: "100%", justifyContent: "center" }} onClick={save}><Save size={15} /> Enregistrer</button>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  WIKI — Frise chronologique                                        */
/* ------------------------------------------------------------------ */

function Frise({ register }) {
  const [events, setEvents] = usePersistent("scr.frise", []);
  const [cats, setCats] = usePersistent("scr.frise.cats", ["Politique", "Religieux", "Culturel", "Économique", "Militaire", "Social"]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("");
  const [mgr, setMgr] = useState(null);

  useEffect(() => { register(events); }, [events, register]);

  const blank = () => ({ id: uid(), year: "", title: "", desc: "", cat: cats[0] || "" });
  const save = () => { if (!draft.title.trim()) return; setEvents((l) => l.some((x) => x.id === draft.id) ? l.map((x) => x.id === draft.id ? draft : x) : [...l, draft]); setOpen(false); };
  const openMgr = () => setMgr(cats.map((name) => ({ id: uid(), orig: name, name })));
  const saveCats = () => {
    const renameMap = {};
    mgr.forEach((r) => { const nn = r.name.trim(); if (r.orig && nn && r.orig !== nn) renameMap[r.orig] = nn; });
    const newCats = [...new Set(mgr.map((r) => r.name.trim()).filter(Boolean))];
    if (Object.keys(renameMap).length) setEvents((l) => l.map((e) => renameMap[e.cat] ? { ...e, cat: renameMap[e.cat] } : e));
    setCats(newCats); setCat(""); setMgr(null);
  };
  const optCats = draft && draft.cat && !cats.includes(draft.cat) ? [draft.cat, ...cats] : cats;
  const sorted = [...events]
    .filter((e) =>
      (!query || (e.title + (e.desc || "") + e.year).toLowerCase().includes(query.toLowerCase())) &&
      (!cat || e.cat === cat))
    .sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));

  return (
    <Panel icon={Clock} title="Frise chronologique" kicker="Repères & jalons" cote="WIK·FRI"
      right={<span style={{ display: "flex", gap: 6 }}>
        <button className="mini" title="Gérer les catégories" onClick={openMgr}><Filter size={15} /></button>
        <button className="mini" title="Ajouter un événement" onClick={() => { setDraft(blank()); setOpen(true); }}><Plus size={16} /></button>
      </span>}>
      {events.length > 0 && (
        <>
          <div className="filterbar">
            <div className="topsearch"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher un événement…" /></div>
          </div>
          {cats.length > 0 && (
            <div className="tags" style={{ marginBottom: 13 }}>
              {cats.map((c) => <span key={c} className={"tag " + (cat === c ? "on" : "")} onClick={() => setCat(cat === c ? "" : c)}>{c}</span>)}
            </div>
          )}
        </>
      )}
      {events.length === 0 ? (
        <Empty icon={Clock} title="Frise vide"
          text="Place tes événements sur un fil chronologique : ils se rangent automatiquement par année." />
      ) : sorted.length === 0 ? (
        <div className="empty"><p>Aucun événement ne correspond.</p></div>
      ) : (
        <div className="scroll" style={{ maxHeight: 360 }}>
          <div className="timeline">
            {sorted.map((e) => (
              <div className="tl-ev" key={e.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div className="tl-year">{e.year || "—"}</div>
                    <div className="tl-t">{e.title} <span style={{ fontSize: 11, color: "var(--muted)" }}>· {e.cat}</span></div>
                    {e.desc && <div className="tl-d">{e.desc}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flex: "none" }}>
                    <button className="mini" onClick={() => { setDraft(e); setOpen(true); }}><Pencil size={13} /></button>
                    <button className="mini del" onClick={() => setEvents((l) => l.filter((x) => x.id !== e.id))}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {open && draft && (
        <div className="overlay" onClick={(e) => { if (e.target.classList.contains("overlay")) setOpen(false); }}>
          <div className="modal">
            <button className="iconbtn modal-x" onClick={() => setOpen(false)}><X size={16} /></button>
            <h3>Événement</h3><p className="sub">Un jalon sur ta frise.</p>
            <div className="row">
              <div className="field" style={{ flex: ".5" }}><label>Année</label><input className="inp" value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} placeholder="1515" /></div>
              <div className="field"><label>Catégorie</label>
                <select className="inp" value={draft.cat} onChange={(e) => setDraft({ ...draft, cat: e.target.value })}>
                  {optCats.map((c) => <option key={c} value={c}>{c}</option>)}
                </select></div>
            </div>
            <div className="field"><label>Titre</label><input className="inp" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Bataille de Marignan" /></div>
            <div className="field"><label>Description</label><textarea className="inp" value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} /></div>
            <button className="btn btn-brass" style={{ width: "100%", justifyContent: "center" }} onClick={save}><Save size={15} /> Enregistrer</button>
          </div>
        </div>
      )}

      {mgr && (
        <div className="overlay" onClick={(e) => { if (e.target.classList.contains("overlay")) setMgr(null); }}>
          <div className="modal">
            <button className="iconbtn modal-x" onClick={() => setMgr(null)}><X size={16} /></button>
            <h3>Catégories de la frise</h3>
            <p className="sub">Ajoute, renomme ou retire les catégories : elles servent aux filtres et au classement des événements. Un renommage met à jour les événements concernés.</p>
            <div className="scroll" style={{ maxHeight: 300, marginBottom: 14 }}>
              {mgr.length === 0 && <div className="empty" style={{ padding: "18px 0" }}><p>Aucune catégorie. Ajoutes-en une ci-dessous.</p></div>}
              {mgr.map((row) => (
                <div className="row" key={row.id} style={{ alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <input className="inp" value={row.name} placeholder="Nom de la catégorie"
                    onChange={(e) => setMgr((m) => m.map((x) => x.id === row.id ? { ...x, name: e.target.value } : x))} />
                  <button className="mini del" style={{ flex: "none" }} onClick={() => setMgr((m) => m.filter((x) => x.id !== row.id))}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}
              onClick={() => setMgr((m) => [...m, { id: uid(), orig: null, name: "" }])}><Plus size={15} /> Ajouter une catégorie</button>
            <button className="btn btn-brass" style={{ width: "100%", justifyContent: "center" }} onClick={saveCats}><Save size={15} /> Enregistrer les catégories</button>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  CRÉATION — X-Mind & Cartothèque                                   */
/* ------------------------------------------------------------------ */

function whimsicalEmbed(u) {
  const s = (u || "").trim();
  if (!s) return "";
  if (s.includes("/embed/")) return s;
  try {
    const url = new URL(s);
    const seg = url.pathname.split("/").filter(Boolean).pop() || "";
    const id = seg.includes("-") ? seg.split("-").pop() : seg;
    if (id) return "https://whimsical.com/embed/" + id;
  } catch (e) { /* pas une URL */ }
  return s;
}

function Whimsical({ cfg, openSettings }) {
  const raw = (cfg.whimsical || "").trim();
  const src = whimsicalEmbed(raw);
  return (
    <Panel icon={Workflow} title="Whimsical" kicker="Cartes, flux & wireframes" cote="CRE·WHM"
      right={<span style={{ display: "flex", gap: 6 }}>
        {raw && <a className="mini" href={raw} target="_blank" rel="noreferrer" title="Ouvrir dans un onglet"><ExternalLink size={15} /></a>}
        <button className="mini" onClick={openSettings}><Settings size={15} /></button>
      </span>}>
      {src ? (
        <>
          <iframe title="whimsical" className="frame" src={src} style={{ height: 440 }} allowFullScreen />
          <div className="notice" style={{ marginTop: 12 }}>
            <Info size={17} className="ico" />
            <div>L'intégration Whimsical est en <b>lecture seule</b> (c'est normal) : pour <b>modifier</b>, ouvre le tableau dans Whimsical avec le bouton ↗. Si l'aperçu est blanc, active <i>Share → Embed → « Enable public access »</i>.</div>
          </div>
        </>
      ) : (
        <div>
          <Empty icon={Workflow} title="Aucun tableau relié"
            text="Cartes mentales, organigrammes, flux et wireframes — structure tes idées visuellement." />
          <Notice><b>À savoir :</b> seul le lien d'<b>intégration public</b> de Whimsical s'affiche en page (l'URL normale du tableau est bloquée à l'affichage). Dans Whimsical : <i>Share → Embed</i>, active <b>« Enable public access »</b>, puis colle le lien (ou l'URL du tableau) dans les réglages — je le convertis automatiquement au bon format.</Notice>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={openSettings}><Link2 size={15} /> Indiquer le lien du tableau</button>
        </div>
      )}
    </Panel>
  );
}

function CreationStorage({ cfg, openSettings, drawings, setDrawings, onOpen }) {
  const id = (cfg.createFolder || "").trim();

  const dlExcalidraw = (d) => {
    const content = JSON.stringify({ type: "excalidraw", version: 2, source: "scriptorium", elements: d.elements || [], appState: {}, files: d.files || {} });
    downloadBlob(new Blob([content], { type: "application/json" }), (d.name || "croquis") + ".excalidraw");
  };
  const dlPng = async (d) => {
    try {
      const blob = await exportToBlob({ elements: d.elements || [], files: d.files || {}, appState: { exportBackground: true }, mimeType: "image/png" });
      downloadBlob(blob, (d.name || "croquis") + ".png");
    } catch (e) { alert("Export PNG impossible pour ce croquis."); }
  };

  return (
    <Panel icon={FolderOpen} title="Sauvegardes" kicker="Croquis enregistrés & dossier Drive" cote="CRE·SAV"
      right={<button className="mini" onClick={openSettings}><Settings size={15} /></button>}>
      <div className="panel-kicker" style={{ marginBottom: 8 }}>Croquis Excalidraw enregistrés</div>
      {(!drawings || drawings.length === 0) ? (
        <div className="empty" style={{ padding: "16px 0" }}><p>Aucun croquis enregistré. Dessine dans Excalidraw puis clique « Créer ».</p></div>
      ) : (
        <div className="scroll" style={{ maxHeight: 230, marginBottom: 4 }}>
          {drawings.map((d) => (
            <div className="item" key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div className="item-t" style={{ fontSize: 16, cursor: "pointer" }} onClick={() => onOpen(d.id)}>{d.name}</div>
              <div style={{ display: "flex", gap: 6, flex: "none" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => onOpen(d.id)}><Pencil size={13} /> Ouvrir</button>
                <button className="mini" title="Télécharger .excalidraw" onClick={() => dlExcalidraw(d)}><FileText size={14} /></button>
                <button className="mini" title="Exporter en PNG" onClick={() => dlPng(d)}><ImageIcon size={14} /></button>
                <button className="mini del" title="Supprimer" onClick={() => setDrawings((l) => l.filter((x) => x.id !== d.id))}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel-kicker" style={{ margin: "14px 0 8px" }}>Dossier Drive — exports Whimsical & archives</div>
      <DriveBody cfg={cfg} folderId={id} openSettings={openSettings} badge="Création"
        emptyText="Un dossier Drive pour conserver tes exports Whimsical et tes archives." />

      <div className="notice" style={{ marginTop: 12 }}>
        <Info size={17} className="ico" />
        <div>Tes croquis Excalidraw sont <b>enregistrés dans le site</b> et rouvrables ici d'un clic. Pour les <b>déposer sur Drive</b> ou les passer à un autre outil, utilise « Télécharger » (.excalidraw) ou « PNG ». L'enregistrement <i>automatique</i> vers Google Drive demande la connexion Google (OAuth), non incluse pour l'instant.</div>
      </div>
    </Panel>
  );
}

function ExcalidrawBlock({ drawings, setDrawings, currentId, setCurrentId }) {
  const [name, setName] = useState("");
  const [loadKey, setLoadKey] = useState(0);
  const dataRef = useRef({ elements: [], files: {} });
  const initialRef = useRef({ elements: [], files: {} });

  useEffect(() => {
    const d = (drawings || []).find((x) => x.id === currentId);
    initialRef.current = d ? { elements: d.elements || [], files: d.files || {} } : { elements: [], files: {} };
    dataRef.current = { elements: initialRef.current.elements, files: initialRef.current.files };
    setName(d ? (d.name || "") : "");
    setLoadKey((k) => k + 1);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const newDrawing = () => setCurrentId(null);
  const save = () => {
    const nm = name.trim() || ("Croquis " + new Date().toLocaleDateString("fr"));
    const payload = { elements: dataRef.current.elements || [], files: dataRef.current.files || {} };
    if (currentId) setDrawings((l) => l.map((d) => d.id === currentId ? { ...d, name: nm, ...payload } : d));
    else { const id = uid(); setDrawings((l) => [...(l || []), { id, name: nm, ...payload }]); setCurrentId(id); }
    setName(nm);
  };

  return (
    <Panel icon={PenTool} title="Excalidraw" kicker="Croquis & schémas à main levée" cote="CRE·EXC"
      right={<button className="mini" title="Nouveau croquis" onClick={newDrawing}><Plus size={16} /></button>}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <input className="inp" style={{ flex: 1, minWidth: 150 }} value={name} onChange={(e) => setName(e.target.value)}
          placeholder={currentId ? "Renommer ce croquis" : "Nom du croquis"} />
        <button className="btn btn-brass btn-sm" onClick={save}><Save size={14} /> {currentId ? "Enregistrer" : "Créer"}</button>
        {currentId && <button className="btn btn-ghost btn-sm" onClick={newDrawing}><Plus size={14} /> Nouveau</button>}
      </div>
      <div className="excali-wrap">
        <ExcalidrawCanvas key={loadKey} theme="dark" initialData={initialRef.current}
          onChange={(elements, appState, files) => { dataRef.current = { elements, files }; }} />
      </div>
      <div className="wiki-hint" style={{ marginTop: 8 }}>Dessine, nomme puis <b>Créer</b> / <b>Enregistrer</b>. Tes croquis se retrouvent dans le bloc <b>Sauvegardes</b> ci-dessous, où tu peux les rouvrir ou les exporter.</div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Réglages                                                          */
/* ------------------------------------------------------------------ */

function SettingsModal({ cfg, setCfg, onClose }) {
  const [d, setD] = useState(cfg);
  const f = (k) => (e) => setD({ ...d, [k]: e.target.value });
  return (
    <div className="overlay" onClick={(e) => { if (e.target.classList.contains("overlay")) onClose(); }}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <button className="iconbtn modal-x" onClick={onClose}><X size={16} /></button>
        <h3>Réglages & connexions</h3>
        <p className="sub">Relie tes outils. Tout reste enregistré localement dans ce tableau de bord.</p>

        <div className="set-group">
          <h5><Calendar size={13} /> Agenda</h5>
          <div className="field"><label>Adresse Google Agenda ou lien d'intégration</label>
            <input className="inp" value={d.calendar || ""} onChange={f("calendar")} placeholder="ton.adresse@gmail.com ou https://calendar.google.com/…/embed?src=…" /></div>
        </div>

        <div className="set-group">
          <h5><FolderOpen size={13} /> Google Drive</h5>
          <div className="field"><label>Clé API Google Drive (pour les aperçus visuels)</label><input className="inp" value={d.driveKey || ""} onChange={f("driveKey")} placeholder="facultatif — vignettes intégrées au thème" /></div>
          <div className="field"><label>Dossier « Documents Word » (Accueil)</label><input className="inp" value={d.docFolder || ""} onChange={f("docFolder")} placeholder="ID après /folders/ dans l'URL Drive" /></div>
          <div className="field"><label>Dossier « Banque d'image »</label><input className="inp" value={d.imgFolder || ""} onChange={f("imgFolder")} placeholder="ID du dossier Drive" /></div>
          <div className="field"><label>Dossier « Livres &amp; PDF »</label><input className="inp" value={d.pdfFolder || ""} onChange={f("pdfFolder")} placeholder="ID du dossier Drive" /></div>
          <div className="field"><label>Dossier « Clichés Tropy »</label><input className="inp" value={d.tropyFolder || ""} onChange={f("tropyFolder")} placeholder="ID du dossier Drive" /></div>
          <div className="field"><label>Dossier « Cartothèque » (Création)</label><input className="inp" value={d.cartoFolder || ""} onChange={f("cartoFolder")} placeholder="ID du dossier Drive" /></div>
          <div className="field"><label>Dossier « Sauvegardes création » (exports Whimsical)</label><input className="inp" value={d.createFolder || ""} onChange={f("createFolder")} placeholder="ID du dossier Drive" /></div>
        </div>

        <div className="set-group">
          <h5><Network size={13} /> Création</h5>
          <div className="field"><label>Lien d'un tableau Whimsical (intégration publique)</label><input className="inp" value={d.whimsical || ""} onChange={f("whimsical")} placeholder="https://whimsical.com/…" /></div>
          <p className="sub" style={{ margin: 0 }}>Excalidraw est intégré nativement : les croquis se créent et s'enregistrent directement dans le site, rien à configurer.</p>
        </div>

        <button className="btn btn-brass" style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
          onClick={() => { setCfg(d); onClose(); }}><Save size={15} /> Enregistrer les connexions</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  APP                                                               */
/* ------------------------------------------------------------------ */

const TABS = [
  { k: "accueil", l: "Accueil" },
  { k: "biblio", l: "Bibliothèque", children: [
    { k: "biblio", l: "Bibliothèque", icon: Library },
    { k: "biblio-tropy", l: "Tropy", icon: ImageIcon },
  ] },
  { k: "wiki", l: "Wiki" },
  { k: "creation", l: "Création" },
];

export default function App() {
  const [tab, setTab] = useState("accueil");
  const [cfg, setCfg] = usePersistent("scr.config", {});
  const [showSettings, setShowSettings] = useState(false);
  const [navOpen, setNavOpen] = useState(null);
  const navRef = useRef(null);

  // État Excalidraw partagé entre l'éditeur et le bloc Sauvegardes
  const [excali, setExcali] = usePersistent("scr.excalidraw", []);
  const [excaliCurrent, setExcaliCurrent] = useState(null);

  useEffect(() => {
    if (!navOpen) return;
    const h = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setNavOpen(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [navOpen]);

  // index partagé pour l'assistant
  const idx = useRef({ citations: [], people: [], events: [], wiki: [] });
  const buildIndex = useCallback(() => ({
    citations: idx.current.citations.map((c) => ({ texte: (c.text || "").slice(0, 140), auteur: c.author, source: c.source, motsCles: c.tags })),
    personnes: idx.current.people.map((p) => ({ nom: p.name, dates: `${p.birth || "?"}-${p.death || "?"}`, fonction: p.role, lieu: p.place })),
    evenements: idx.current.events.map((e) => ({ annee: e.year, titre: e.title, categorie: e.cat })),
    wiki: idx.current.wiki.map((w) => ({ titre: w.title, etiquettes: w.tags })),
  }), []);
  const regCitations = useCallback((v) => { idx.current.citations = v; }, []);
  const regPeople = useCallback((v) => { idx.current.people = v; }, []);
  const regEvents = useCallback((v) => { idx.current.events = v; }, []);
  const regWiki = useCallback((v) => { idx.current.wiki = v; }, []);

  const openS = () => setShowSettings(true);

  return (
    <div className="scriptorium">
      <style>{CSS}</style>

      {/* Bandeau */}
      <header className="topbar">
        <div className="wrap topbar-in">
          <div className="brand" onClick={() => setTab("accueil")}>
            <div className="brand-mark"><BookOpen size={19} /></div>
            <div>
              <div className="brand-name">Scriptorium</div>
              <div className="brand-sub">Atelier de l'historien</div>
            </div>
          </div>
          <nav className="nav" ref={navRef}>
            {TABS.map((t) => {
              const active = tab === t.k || (t.children && t.children.some((c) => c.k === tab));
              if (!t.children) {
                return <button key={t.k} className={"navlink " + (active ? "active" : "")} onClick={() => { setTab(t.k); setNavOpen(null); }}>{t.l}</button>;
              }
              return (
                <div className="navdrop" key={t.k}>
                  <button className={"navlink " + (active ? "active" : "")} onClick={() => setNavOpen(navOpen === t.k ? null : t.k)}>
                    {t.l}<ChevronDown size={14} style={{ transform: navOpen === t.k ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                  </button>
                  {navOpen === t.k && (
                    <div className="navmenu">
                      {t.children.map((c) => {
                        const Ico = c.icon;
                        return (
                          <button key={c.k} className={tab === c.k ? "on" : ""} onClick={() => { setTab(c.k); setNavOpen(null); }}>
                            {Ico && <Ico size={15} className="ico" />}{c.l}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="topspacer" />
          <button className="iconbtn" onClick={openS} title="Réglages"><Settings size={17} /></button>
        </div>
      </header>

      <main className="wrap">
        {/* ACCUEIL */}
        {tab === "accueil" && (
          <div className="view">
            <div className="view-head">
              <div className="eyebrow">Cabinet de travail</div>
              <h1 className="view-title">Accueil</h1>
              <p className="view-note">Ton point de départ : interroge tes fonds, garde l'agenda à l'œil, et pilote l'écriture comme le projet — deux modules de gestion réunis ici même.</p>
            </div>
            <div className="grid g-home" style={{ marginBottom: 18 }}>
              <AssistantIA buildIndex={buildIndex} />
              <Agenda cfg={cfg} openSettings={openS} />
            </div>
            <div className="view-head" style={{ marginBottom: 16 }}>
              <div className="eyebrow">Gestion</div>
              <h2 className="view-title" style={{ fontSize: 26 }}>Documents, écriture &amp; projet</h2>
            </div>
            <div className="grid g-2">
              <DriveDocs cfg={cfg} openSettings={openS} />
              <GestionBlock />
            </div>
          </div>
        )}

        {/* BIBLIOTHÈQUE */}
        {tab === "biblio" && (
          <div className="view">
            <div className="view-head">
              <div className="eyebrow">Fonds documentaire</div>
              <h1 className="view-title">Bibliothèque</h1>
              <p className="view-note">Citations, iconographie et ouvrages, adossés à ton Drive. Tropy dispose de sa propre page (menu Bibliothèque).</p>
            </div>
            <div className="grid g-2" style={{ marginBottom: 18 }}>
              <Citations register={regCitations} />
              <DriveEmbed icon={ImageIcon} title="Banque d'image" kicker="Iconographie · planches" cote="BIB·IMG"
                folderId={cfg.imgFolder} mode="grid" cfg={cfg} badge="Image" openSettings={openS}
                emptyText="Centralise ton iconographie depuis un dossier Drive partagé, avec aperçu, directement ici." />
            </div>
            <DriveEmbed icon={FileText} title="Livres & PDF" kicker="Ouvrages numérisés" cote="BIB·PDF"
              folderId={cfg.pdfFolder} mode="grid" cfg={cfg} badge="PDF" openSettings={openS}
              emptyText="Range tes ouvrages et numérisations dans un dossier Drive pour les consulter, en aperçu, sans quitter le tableau de bord." />
          </div>
        )}

        {/* BIBLIOTHÈQUE · TROPY (page dédiée) */}
        {tab === "biblio-tropy" && (
          <div className="view">
            <div className="view-head">
              <div className="eyebrow">Bibliothèque · Iconographie d'archives</div>
              <h1 className="view-title">Tropy</h1>
              <p className="view-note">Tes photographies d'archives, sur leur page dédiée. Importe un export JSON-LD depuis Tropy pour consulter l'inventaire ici.</p>
            </div>
            <Tropy cfg={cfg} openSettings={openS} />
          </div>
        )}

        {/* WIKI */}
        {tab === "wiki" && (
          <div className="view">
            <div className="view-head">
              <div className="eyebrow">Savoir structuré</div>
              <h1 className="view-title">Wiki</h1>
              <p className="view-note">Tes connaissances organisées : un wiki de pages liées, le répertoire prosopographique et la frise chronologique.</p>
            </div>
            <div style={{ marginBottom: 18 }}><WikiNotion register={regWiki} /></div>
            <div className="grid g-2">
              <Prosopographie register={regPeople} />
              <Frise register={regEvents} />
            </div>
          </div>
        )}

        {/* CRÉATION */}
        {tab === "creation" && (
          <div className="view">
            <div className="view-head">
              <div className="eyebrow">Penser visuellement</div>
              <h1 className="view-title">Création</h1>
              <p className="view-note">Donne forme à tes idées : tableaux Whimsical, croquis Excalidraw, sauvegardes de tes créations et collection cartographique.</p>
            </div>
            <div className="grid g-2" style={{ marginBottom: 18 }}>
              <Whimsical cfg={cfg} openSettings={openS} />
              <ExcalidrawBlock drawings={excali} setDrawings={setExcali} currentId={excaliCurrent} setCurrentId={setExcaliCurrent} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <CreationStorage cfg={cfg} openSettings={openS} drawings={excali} setDrawings={setExcali} onOpen={(id) => setExcaliCurrent(id)} />
            </div>
            <DriveEmbed icon={MapIcon} title="Cartothèque" kicker="Cartes & relevés · Google Drive" cote="CRE·CAR"
              folderId={cfg.cartoFolder} mode="grid" cfg={cfg} badge="Carte" openSettings={openS}
              emptyText="Consulte ta collection de cartes depuis un dossier Drive partagé, en aperçu, directement ici." />
          </div>
        )}

        <div className="foot">
          <span className="mark">Scriptorium — l'atelier de l'historien</span>
          <span>Données enregistrées dans ton navigateur · connexions configurables dans les réglages</span>
        </div>
      </main>

      {showSettings && <SettingsModal cfg={cfg} setCfg={setCfg} onClose={() => setShowSettings(false)} />}
    </div>
  );
}
