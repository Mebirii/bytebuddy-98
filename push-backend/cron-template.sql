-- In the DEDICATED Supabase project, after enabling pg_cron and pg_net.
-- Replace placeholders at deployment time. Never commit secrets to this file.
-- Store your CRON_TOKEN in Supabase Vault, not in this SQL source in GitHub:
-- select vault.create_secret('<YOUR_RANDOM_CRON_TOKEN>', 'bytebuddy_push_cron');
-- Then schedule (project-ref is public; token stays in Vault):
select cron.schedule(
  'bytebuddy-push-needs',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/bytebuddy-push/tick',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-bytebuddy-cron',(
        select decrypted_secret from vault.decrypted_secrets
        where name='bytebuddy_push_cron'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
  $$
);
