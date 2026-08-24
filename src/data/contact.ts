import { File } from 'expo-file-system';

export type ContactSubmission = {
  email: string;
  contents: string;
  /** Up to 3 local `file://` URIs, per Figma's "Photos (up to 3)" field. */
  photoUris: string[];
};

/**
 * Where "Send" actually posts to — a small serverless function
 * (`api/contact.ts`, at the repo root) that relays the submission to Resend
 * so a real email lands in the product owner's inbox. Read from
 * `EXPO_PUBLIC_CONTACT_API_URL` (Expo's standard client-safe env var
 * convention, inlined by Metro at build time — see `.env.example`) rather
 * than hardcoded, since the deployed URL only exists once that function has
 * actually been deployed, which this repo alone can't do.
 */
const CONTACT_API_URL = process.env.EXPO_PUBLIC_CONTACT_API_URL;

/**
 * Sends a real Help & Support submission (Figma "Flow 7.4", node
 * `3201:7418`) to the product owner's inbox — see `api/contact.ts`'s own
 * doc comment for the Resend relay this posts to and why a serverless
 * function is the boundary rather than calling an email API directly from
 * the client (that would ship the API's secret key inside the app bundle).
 *
 * Photos are read into base64 here (`File.base64()`, the same
 * `expo-file-system` class `buildPdf.ts` already reads bytes from) so the
 * whole submission travels as one JSON POST the function can hand straight
 * to Resend's `attachments` field.
 *
 * Throws on any failure — no configured URL, a network error, or a non-2xx
 * response — so the screen's own `catch` can tell the user to try again
 * rather than showing "sent" for something that wasn't.
 */
export async function submitContactRequest({ email, contents, photoUris }: ContactSubmission): Promise<void> {
  if (!CONTACT_API_URL) {
    throw new Error('EXPO_PUBLIC_CONTACT_API_URL is not configured — see .env.example.');
  }

  const photos = await Promise.all(
    photoUris.map(async (uri, index) => ({
      filename: `photo-${index + 1}.jpg`,
      base64: await new File(uri).base64(),
    })),
  );

  const response = await fetch(CONTACT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, contents, photos }),
  });

  if (!response.ok) {
    throw new Error(`Contact request failed with status ${response.status}`);
  }
}
