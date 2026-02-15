"use client";

import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { GoogleCalendarToken } from "@/types/calendar";

const TOKEN_PATH = (uid: string) =>
  doc(db, "users", uid, "tokens", "google_calendar");

/** Save calendar access token to Firestore */
export async function saveCalendarToken(
  uid: string,
  accessToken: string,
  expiresIn: number
): Promise<void> {
  const token: GoogleCalendarToken = {
    access_token: accessToken,
    expires_at: Date.now() + expiresIn * 1000,
    scope: "https://www.googleapis.com/auth/calendar.events",
    stored_at: Date.now(),
  };
  await setDoc(TOKEN_PATH(uid), token);
}

/** Get calendar token from Firestore, or null if not found */
export async function getCalendarToken(
  uid: string
): Promise<GoogleCalendarToken | null> {
  const snap = await getDoc(TOKEN_PATH(uid));
  if (!snap.exists()) return null;
  return snap.data() as GoogleCalendarToken;
}

/** Delete calendar token from Firestore */
export async function deleteCalendarToken(uid: string): Promise<void> {
  await deleteDoc(TOKEN_PATH(uid));
}

/** Check if token is expired (with 5-minute buffer) */
export function isTokenExpired(token: GoogleCalendarToken): boolean {
  const BUFFER_MS = 5 * 60 * 1000;
  return Date.now() >= token.expires_at - BUFFER_MS;
}

/** Mark a session as scheduled to calendar */
export async function markSessionScheduled(
  uid: string,
  sessionId: string
): Promise<void> {
  await setDoc(
    doc(db, "users", uid, "calendar_sessions", sessionId),
    { scheduled_at: Date.now() }
  );
}

/** Check if a session was already scheduled to calendar */
export async function isSessionScheduled(
  uid: string,
  sessionId: string
): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", uid, "calendar_sessions", sessionId));
  return snap.exists();
}
