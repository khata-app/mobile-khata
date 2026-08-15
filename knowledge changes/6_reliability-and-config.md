# 6 Reliability and configuration

- A newly created Supabase workspace must start empty. The local demo snapshot is for the unauthenticated shell only; do not upload it into a customer workspace during onboarding.
- The web root renders the public landing page until auth hydration completes, then redirects restored sessions to the app.
- Email signup may return no session when confirmation is enabled. Keep the user on the auth screen with a confirmation message instead of opening the protected company setup route.
- EAS owner and project ID are deployment-specific. Read them from `EXPO_ACCOUNT_OWNER` and `EAS_PROJECT_ID`; never carry starter-template identifiers into a new project.
- The bill scanner accepts supported image/PDF MIME types up to 10 MiB and constrains extraction confidence to 0–1 before storing it in the database.
- Invalid JSON in MMKV is removed and treated as a cache miss so a partial write cannot block app startup.
