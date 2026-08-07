# scan-bill

Authenticated Edge Function that sends a bill image to Gemini for structured extraction. Set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) as Supabase Edge Function secrets; never put the Gemini key in the Expo app.

```bash
supabase secrets set GEMINI_API_KEY=your-key
supabase functions deploy scan-bill
```

The client invokes it with `{ imageBase64, mimeType }`. The caller still reviews the returned fields before saving a purchase bill.
