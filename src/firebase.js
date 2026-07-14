import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyDBjX7gNfUzVgjYqjJb7bjVtSyAoAESdGU",
  authDomain:        "lido-balneare-2bd05.firebaseapp.com",
  projectId:         "lido-balneare-2bd05",
  storageBucket:     "lido-balneare-2bd05.firebasestorage.app",
  messagingSenderId: "784686090449",
  appId:             "1:784686090449:web:935e74866626742dc31df0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const DOC_REF = (db_instance) => doc(db_instance, "lido", "dati");
let lastSaveTime = 0;

export async function saveUmbrellas(db_instance, umbrellas, rows, cols, nameFontSize, cellHeight, cellWidth, disdette, gruppi, disponibilita, listaAttesa) {
  try {
    const clean = (obj) => JSON.parse(JSON.stringify(obj, (k, v) => v === undefined ? null : v));
    const data = { umbrellas: clean(umbrellas), updatedAt: Date.now() };
    if (rows) data.rows = rows;
    if (cols) data.cols = cols;
    if (nameFontSize) data.nameFontSize = nameFontSize;
    if (cellHeight) data.cellHeight = cellHeight;
    if (disdette && disdette.length) data.disdette = disdette;
    if (gruppi) data.gruppi = gruppi;
    if (disponibilita) data.disponibilita = disponibilita;
    if (listaAttesa) data.listaAttesa = listaAttesa;
    await setDoc(DOC_REF(db_instance), data);
    lastSaveTime = Date.now();
    console.log("Salvato su Firebase!");
    return true;
  } catch (e) {
    console.error("Errore salvataggio:", e);
    return false;
  }
}

export async function loadUmbrellas(db_instance) {
  try {
    const snap = await getDoc(DOC_REF(db_instance));
    if (snap.exists()) {
      const data = snap.data();
      return { umbrellas: data.umbrellas||[], rows: data.rows||null, cols: data.cols||null, nameFontSize: data.nameFontSize||null, cellHeight: data.cellHeight||null, disdette: data.disdette||[], gruppi: data.gruppi||[], disponibilita: data.disponibilita||{giorni_bloccati:[],ombrelloni_bloccati:[],stagione:{dal:"",al:""},postazioni_pet:[]} };
    }
    return { umbrellas:[], rows:null, cols:null, nameFontSize:null, cellHeight:null, disdette:[], gruppi:[] };
  } catch (e) {
    console.error("Errore caricamento:", e);
    return { umbrellas:[], rows:null, cols:null, nameFontSize:null, cellHeight:null, disdette:[], gruppi:[] };
  }
}

export function subscribeUmbrellas(db_instance, callback) {
  return onSnapshot(doc(db_instance, "lido", "dati"), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    // Se abbiamo salvato localmente dopo l'ultimo updatedAt su Firebase, ignoriamo
    if (data.updatedAt && data.updatedAt < lastSaveTime) return;
    callback({
      umbrellas: data.umbrellas || [],
      rows: data.rows || null,
      cols: data.cols || null,
      nameFontSize: data.nameFontSize || null,
      cellWidth: data.cellWidth || 80,
      disdette: data.disdette || [],
      gruppi: data.gruppi || [],
      disponibilita: data.disponibilita || {giorni_bloccati:[],ombrelloni_bloccati:[],stagione:{dal:"",al:""},postazioni_pet:[]},
      cellHeight: data.cellHeight || null,
      listaAttesa: data.listaAttesa || []
    });
  });
}
const appPub = initializeApp({
  apiKey: "AIzaSyBoqlln2_CAeDGiZsi0Zlqgk0UqmijmCIQ",
  projectId: "lido-public",
  appId: "1:432718465597:web:b7bad0ed737ae6e74f7854"
}, "lido-public-admin");
const dbPub = getFirestore(appPub);

export async function loadPrenotazioniClienti() {
  const snap = await getDocs(collection(dbPub, "prenotazioni"));
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function aggiornaStatoPrenotazione(id, status) {
  await updateDoc(doc(dbPub, "prenotazioni", id), {status});
}

export function subscribePrenotazioniInAttesa(callback) {
  return onSnapshot(collection(dbPub, "prenotazioni"), (snap) => {
    const richieste = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(r => r.status === "in_attesa");
    callback(richieste);
  }, (e) => {
    console.error("Errore subscribePrenotazioniInAttesa:", e);
  });
}

export function subscribeTuttePrenotazioni(callback) {
  return onSnapshot(collection(dbPub, "prenotazioni"), (snap) => {
    const tutte = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(tutte);
  }, (e) => {
    console.error("Errore subscribeTuttePrenotazioni:", e);
  });
}
