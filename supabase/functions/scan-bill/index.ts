import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

const extractionSchema = {
  type: 'object',
  properties: {
    vendor: { type: 'string' },
    invoice: { type: 'string' },
    date: { type: 'string', description: 'ISO date when visible, otherwise empty string' },
    total: { type: 'number' },
    vat: { type: 'number' },
    confidence: { type: 'number' },
  },
  required: ['vendor', 'invoice', 'date', 'total', 'vat', 'confidence'],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization) return jsonResponse({ error: 'missing_authorization' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  if (!supabaseUrl || !publishableKey) return jsonResponse({ error: 'supabase_not_configured' }, 500);
  if (!geminiKey) return jsonResponse({ error: 'gemini_not_configured' }, 503);

  const supabase = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return jsonResponse({ error: 'not_authenticated' }, 401);

  const payload = await request.json().catch(() => null) as { imageBase64?: unknown; mimeType?: unknown } | null;
  const imageBase64 = typeof payload?.imageBase64 === 'string' ? payload.imageBase64 : '';
  const mimeType = typeof payload?.mimeType === 'string' ? payload.mimeType : 'image/jpeg';
  if (!imageBase64 || !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(mimeType)) {
    return jsonResponse({ error: 'invalid_image_payload' }, 400);
  }

  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            text: 'Extract the purchase bill fields. Do not guess unreadable values. Return an empty string or 0 when a field is not visible. Amounts must be in the document currency units, not paisa.',
          },
          { inlineData: { data: imageBase64, mimeType } },
        ],
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: extractionSchema,
        temperature: 0,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Gemini extraction failed', detail);
    return jsonResponse({ error: 'gemini_request_failed' }, 502);
  }

  const result = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return jsonResponse({ error: 'empty_extraction' }, 422);

  try {
    const extracted = JSON.parse(text) as Record<string, unknown>;
    return jsonResponse({ extracted, userId: userData.user.id });
  } catch {
    return jsonResponse({ error: 'invalid_extraction_json' }, 422);
  }
});
