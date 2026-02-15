"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Request Google Calendar access via popup.
 * Only requests the calendar.events scope — progressive consent.
 */
export async function requestCalendarAccess(): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/calendar.events");

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);

  if (!credential?.accessToken) {
    throw new Error("No access token received from Google");
  }

  // Google access tokens expire in ~3600 seconds
  return {
    accessToken: credential.accessToken,
    expiresIn: 3600,
  };
}
