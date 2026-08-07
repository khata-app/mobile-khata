# 3 Bill scanner

- Added `expo-image-picker` with low-quality image selection (`quality: 0.7`) for a practical mobile/web upload path.
- Added authenticated `supabase/functions/scan-bill/index.ts`.
- `supabase/config.toml` explicitly keeps JWT verification enabled for the function.
- The function validates the caller JWT through Supabase Auth, calls Gemini with a JSON schema, and returns vendor/invoice/date/total/VAT/confidence. Gemini key and model are Edge Function secrets (`GEMINI_API_KEY`, optional `GEMINI_MODEL`), never Expo variables.
- The selected original is uploaded to the private `bill-documents` bucket and its extraction metadata is written to `bill_documents` before the UI shows the review fields.
- OCR remains review-only: `Approve & save purchase` is the action that creates `purchase_bills`.
- The current UI also keeps a clearly labeled demo scan for development without a configured Gemini project.

Future hardening: add image-size limits and a durable scan retry/outbox; attach `purchase_bill_id` when the review is approved.
