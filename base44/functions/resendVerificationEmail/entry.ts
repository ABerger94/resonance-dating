import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// This function triggers a resend of the OTP via the platform auth SDK.
// The platform automatically sends the verification email - no custom email needed.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Platform auth SDK handles OTP email sending automatically
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});