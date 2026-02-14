import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FamilyContact, NotificationRecord } from "@/types/notifications";

const CONTACTS_COLLECTION = "contacts";
const HISTORY_COLLECTION = "notification_history";

/** Strip undefined values that Firestore rejects */
function sanitize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function addContact(
  userId: string,
  contact: Omit<FamilyContact, "id" | "user_id" | "created_at" | "updated_at">
): Promise<string> {
  const now = new Date().toISOString();
  const data = sanitize({
    user_id: userId,
    ...contact,
    created_at: now,
    updated_at: now,
  });
  const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), data);
  return docRef.id;
}

export async function getContactsForUser(
  userId: string
): Promise<FamilyContact[]> {
  const q = query(
    collection(db, CONTACTS_COLLECTION),
    where("user_id", "==", userId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as FamilyContact)
  );
  results.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return results;
}

export async function updateContact(
  docId: string,
  updates: Partial<Omit<FamilyContact, "id" | "user_id" | "created_at">>
): Promise<void> {
  const ref = doc(db, CONTACTS_COLLECTION, docId);
  await updateDoc(ref, sanitize({ ...updates, updated_at: new Date().toISOString() }));
}

export async function deleteContact(docId: string): Promise<void> {
  const ref = doc(db, CONTACTS_COLLECTION, docId);
  await deleteDoc(ref);
}

export async function getNotificationHistory(
  userId: string,
  limit = 50
): Promise<NotificationRecord[]> {
  const q = query(
    collection(db, HISTORY_COLLECTION),
    where("user_id", "==", userId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as NotificationRecord)
  );
  // Sort client-side (newest first)
  results.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return results.slice(0, limit);
}
