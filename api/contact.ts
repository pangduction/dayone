// Vercel Edge Function — deploy this whole repo to Vercel and it's picked up
// automatically as `/api/contact` with zero extra config (choose "Other" as
// the framework preset if asked; no build step is needed for this file).
//
// This is the boundary `src/data/contact.ts`'s `submitContactRequest` posts
// to for the real Help & Support flow (Figma "Flow 7.4", HelpSupportScreen).
// A server has to sit in between the app and the email API: Resend's API
// key is a real secret, and the client is a shipped mobile app whose bundle
// anyone can inspect — embedding it there would hand every install of
// DayOne the ability to send email as this account. This function holds
// that key server-side (`RESEND_API_KEY`, set in Vercel's project settings,
// never committed to this repo) and is the only thing that ever calls
// Resend directly.
//
// The destination is fixed to the product owner's own inbox — a contact
// form's whole point — and uses Resend's default `onboarding@resend.dev`
// sender, which works with no domain verification specifically because
// Resend's sandbox mode only allows sending *to* the account's own
// registered email, which is exactly this address anyway.
export const config = { runtime: 'edge' };

const OWNER_EMAIL = 'una.choi0109@gmail.com';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const MAX_PHOTOS = 3;

type ContactPhoto = { filename: string; base64: string };
type ContactBody = { email?: string; contents?: string; photos?: ContactPhoto[] };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response('RESEND_API_KEY is not configured on this deployment.', { status: 500 });
  }

  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON body.', { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const contents = typeof body.contents === 'string' ? body.contents.trim() : '';
  // Trusts the client's own "up to 3" cap for the count, but re-enforces it
  // here too rather than assuming a well-behaved caller.
  const photos = Array.isArray(body.photos) ? body.photos.slice(0, MAX_PHOTOS) : [];

  if (!email || !contents) {
    return new Response('email and contents are required.', { status: 400 });
  }

  const resendResponse = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DayOne Feedback <onboarding@resend.dev>',
      to: [OWNER_EMAIL],
      // Replying to the notification goes straight back to whoever sent it.
      reply_to: email,
      subject: 'DayOne Feedback',
      text: `From: ${email}\n\n${contents}`,
      attachments: photos.map((photo) => ({ filename: photo.filename, content: photo.base64 })),
    }),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    return new Response(`Resend request failed: ${detail}`, { status: 502 });
  }

  return new Response(null, { status: 204 });
}
