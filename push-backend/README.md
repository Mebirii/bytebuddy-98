# ByteBuddy '98 — notifications Web Push (backend)

The browser and service worker live at https://mebirii.github.io/bytebuddy-98/.
This directory describes a **dedicated Supabase backend**. Do not deploy it inside
an unrelated application project.

## Setup (not yet deployed)

1. Create a dedicated Supabase project for ByteBuddy. Check billing first.
2. Apply schema.sql in that project's database (RLS is enabled and no public policies exist).
3. Generate VAPID keys via a trusted Web Push library/CLI. Keep the **private** VAPID key
   outside GitHub and all browser code.
4. Set Supabase Edge Function secrets in the dashboard:
   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_CRON_SECRET.
   Use a random 32+-byte token for PUSH_CRON_SECRET.
5. Deploy edge-function.ts as the function named bytebuddy-push with verify_jwt=false.
   This is intentional: public API operations are checked using per-device secrets;
   the scheduled tick is protected by PUSH_CRON_SECRET.
6. Enable pg_cron and pg_net in the **dedicated** Supabase project and schedule a
   POST to https://<project-ref>.supabase.co/functions/v1/bytebuddy-push/tick.
   Store PUSH_CRON_SECRET in Supabase Vault and reference it using
   vault.decrypted_secrets. Use the schedule template in cron-template.sql.
7. Change the public push-config.js to:
      window.BYTEBUDDY_PUSH_API = "https://<project-ref>.supabase.co/functions/v1/bytebuddy-push";
   Push subscriptions remain opt-in per device.

## Behavior & privacy

- Push works when the tab is closed; iOS 16.4+ requires installation via
  "Add to Home Screen" and user permission requested from inside the installed app.
- No central player account is needed. Each browser stores one random per-device secret.
- The server stores encrypted Web Push subscription endpoint and keys, plus a
  small snapshot of pet needs. It does not store the complete game save.
- At most 3 alerts/day, with 4-hour separation, silent 22:00–08:00 Paris time.
- Subscriptions may be removed from the game's settings.
- Auto alert projections are approximate: browser-only game progression is
  not executed in the cloud. Back-end alerts stop after ~24h without a game sync.
- Test push is user-initiated and rate limited.
- On HTTP 404/410 from a push provider, the backend deletes the stale subscription.
- Keep service-role keys and private VAPID keys out of git. Never place them in
  a file served by GitHub Pages. The existing push-config.js contains no secrets.
