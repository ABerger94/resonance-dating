const RESEND_API_URL = 'https://api.resend.com/emails';

function json(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(body));
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    json(response, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.VERIFICATION_FROM_EMAIL || 'Resonance <onboarding@resend.dev>';
  if (!apiKey) {
    json(response, 500, { error: 'Email service is not configured.' });
    return;
  }

  let body;
  try {
    body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  } catch {
    json(response, 400, { error: 'Invalid request body.' });
    return;
  }

  const email = String(body?.email || '').trim().toLowerCase();
  const code = String(body?.code || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
    json(response, 400, { error: 'Invalid email or verification code.' });
    return;
  }

  const resendResponse = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: 'Your Resonance verification code',
      text: `Your Resonance verification code is ${code}. It expires in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h1>Verify your Resonance account</h1>
          <p>Your verification code is:</p>
          <p style="font-size: 28px; letter-spacing: 6px; font-weight: 700;">${code}</p>
          <p>This code expires in 15 minutes.</p>
        </div>
      `,
    }),
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    json(response, 502, { error: 'Failed to send verification email.', details });
    return;
  }

  json(response, 200, { ok: true });
}
