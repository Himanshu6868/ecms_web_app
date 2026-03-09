import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  GeoPoint,
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot
} from "firebase/firestore";
import type { Ticket, TicketInput, TicketStatus } from "@/types/ticket";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { GeoPoint, addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc };

const ticketCollection = collection(db, "tickets");

const toTicket = (snapshot: QueryDocumentSnapshot<DocumentData>): Ticket => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    title: data.title as string,
    description: data.description as string,
    priority: data.priority as Ticket["priority"],
    category: data.category as string,
    location: (data.location as string | null) ?? null,
    locationCoordinates: (data.locationCoordinates as GeoPoint | null) ?? null,
    createdAt: (data.createdAt as Ticket["createdAt"]) ?? null,
    status: data.status as TicketStatus
  };
};

export const subscribeTickets = (onData: (tickets: Ticket[]) => void, onError: (error: Error) => void): (() => void) => {
  const ticketsQuery = query(ticketCollection, orderBy("createdAt", "desc"));
  return onSnapshot(
    ticketsQuery,
    (snapshot) => {
      const tickets = snapshot.docs.map(toTicket);
      onData(tickets);
    },
    (error) => {
      onError(error as Error);
    }
  );
};

export const createTicket = async (input: TicketInput): Promise<void> => {
  await addDoc(ticketCollection, {
    ...input,
    status: "OPEN",
    createdAt: serverTimestamp()
  });
};

export const changeTicketStatus = async (id: string, status: TicketStatus): Promise<void> => {
  const ticketRef = doc(db, "tickets", id);
  await updateDoc(ticketRef, { status });
};
