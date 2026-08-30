# DayOne Privacy Policy

**Last updated: [fill in date when published]**

This Privacy Policy explains how DayOne ("the App", "we", "us") handles
information when you use the app. DayOne is built around a simple idea: your
journal is yours, so almost everything you create in it stays on your device
and never touches our servers.

## 1. Information stored on your device only

When you write a journal entry, DayOne stores the following **locally on
your device only**, using standard on-device storage (AsyncStorage and the
device's file system). None of this is uploaded to us or to any third
party:

- Journal text and formatting (bold, lists, colors, etc.)
- Photos you attach to an entry
- Voice recordings you attach to an entry
- Your Language and Notification preferences
- PDF files you generate from your entries via Export to PDF, and the
  images captured to build them

If you delete the app, or use the in-app "Delete Account" option, this data
is permanently erased and we have no copy of it to recover.

## 2. Device permissions

DayOne asks for the following permissions, each used only for the feature
that needs it, and never for tracking:

- **Camera** — to take a photo for today's entry.
- **Photo Library** — to choose an existing photo for an entry, and to save
  a shared calendar image back to your library if you ask to.
- **Microphone** — to record a voice note for an entry.
- **Notifications** — to show the Daily Reminder and Monthly Report
  notifications you turn on in Settings. These are scheduled entirely on
  your device; we do not operate a push-notification server and never see
  when or whether they fire.

## 3. Information we do receive: Help & Support

If you use **Setting → Help & Support** to contact us, the app sends your
message to us so we can reply. That submission includes:

- The email address you enter (so we can reply to you)
- The message you write
- Any photos you choose to attach (up to 3)

This is sent to a small server function we operate (hosted on Vercel),
which relays it to us by email using **Resend**, an email-delivery service.
Resend and Vercel act as our service providers for this one feature and
only process this data on our behalf to deliver your message — they do not
use it for their own purposes. We keep your message only as long as needed
to respond to you and for our own support records.

## 4. Signing in (if you use Google, Apple, or Kakao sign-in)

If DayOne offers signing in with Google, Apple, or Kakao, we receive only
the basic profile information that provider shares when you sign in
(typically your name and email address), which we use to identify your
account. Your journal content itself is not part of this and is not
uploaded anywhere as a result of signing in — see Section 1.

*(Remove or update this section once the app's real sign-in behavior is
finalized, to match exactly what is implemented.)*

## 5. What we don't do

- We don't run analytics or advertising SDKs in the app.
- We don't sell or share your information with data brokers or advertisers.
- We don't read, scan, or otherwise access your journal content — it never
  reaches us.

## 6. Children's privacy

DayOne is not directed at children under 13, and we do not knowingly
collect personal information from children under 13. If you believe a
child has provided us information through the Help & Support form, contact
us and we will delete it.

## 7. Your choices

- You can delete any entry, photo, or recording at any time from within
  the app.
- You can turn Notifications off at any time in Settings.
- You can delete all app data at once with Setting → Delete Account.
- You can contact us at the address below with any privacy question,
  including a request to see or delete information you've sent us via
  Help & Support.

## 8. Changes to this policy

If we change this policy, we'll update the "Last updated" date above and,
for material changes, note it in the app.

## 9. Contact us

**[fill in a support email you're comfortable publishing — this doc
currently has none filled in on purpose, see the note below]**

---

**Note for whoever publishes this:** fill in the "Last updated" date and a
contact email you want to make public (a submission on the Help & Support
form's underlying address is one option, or a dedicated one) before
publishing to Notion. This draft is written to match exactly what the app
does today per its own source of truth (see this repo's DESIGN_SYSTEM.md);
update Section 4 once real sign-in ships, and get a quick read from someone
with legal background before relying on it — this is a starting point, not
legal advice.
