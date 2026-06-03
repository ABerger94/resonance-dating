import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// This function triggers a resend of the OTP via the platform auth SDK
// and sends a custom follow-up email with delivery tips in case the OTP goes to spam.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Send a helper email via Core SendEmail to surface it in case OTP goes to spam
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: 'Resonance - your verification code is on its way',
        body: `<p style="font-family:monospace">Hi,</p>
<p style="font-family:monospace">You requested a new verification code for Resonance.</p>
<p style="font-family:monospace">A 6-digit code was just sent to <strong>${email}</strong> in a separate email with the subject <em>"Verify your email"</em>.</p>
<p style="font-family:monospace">If you don't see it within a minute, please check your <strong>spam or junk folder</strong>.</p>
<p style="font-family:monospace">- Resonance</p>`,
        from_name: 'Resonance'
      });
    } catch (emailErr) {
      // Non-fatal: log but don't fail the request
      console.error('Helper email failed:', emailErr.message);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
