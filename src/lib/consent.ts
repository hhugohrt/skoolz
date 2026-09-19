// Consentement aux traceurs : le pixel de mesure Whop ne se charge qu'après un « Accepter » explicite.
const STORAGE_KEY = "skoolz_consent";
const CHANGE_EVENT = "skoolz-consent-change";

export type Consent = "granted" | "denied" | null;

export function getConsent(): Consent {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(value: "granted" | "denied" | null) {
  try {
    if (value === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* stockage indisponible : le choix vaut pour la page en cours */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  if (value === "granted") loadWhopPixel();
}

export function onConsentChange(listener: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

// Réaffiche le bandeau (lien « Gérer mes cookies »).
export function reopenConsent() {
  setConsent(null);
}

// Code fourni par Whop, inséré à l'identique (il se protège lui-même contre un double chargement).
const WHOP_PIXEL = String.raw`!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_Cqy4ASp7MTGVDJ");whop.track("page");`;

export function loadWhopPixel() {
  if ((window as unknown as { whop?: unknown }).whop) return;
  const script = document.createElement("script");
  script.text = WHOP_PIXEL;
  document.head.appendChild(script);
}
