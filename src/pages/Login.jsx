import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import ResonanceLogo from "@/components/ResonanceLogo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      if (err.code === 'email_not_verified') {
        setShowVerification(true);
        setError("Verify your email before accessing Resonance.");
        return;
      }
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      base44.functions.invoke('resendVerificationEmail', { email }).catch(() => {});
      toast({
        title: "Code sent",
        description: "Check your inbox and spam/junk folder for a 6-digit code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  return (
    <main className="auth-inverted min-h-screen bg-background text-foreground">
      <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex min-h-[42vh] flex-col justify-between border-b border-border px-6 py-8 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12">
          <div className="flex items-center gap-3">
            <ResonanceLogo size={42} />
            <span className="font-mono text-sm font-bold tracking-[0.35em] text-white">RESONANCE</span>
          </div>

          <div className="max-w-xl space-y-5 py-12">
            <div className="flex items-center gap-3">
              <ResonanceLogo size={72} />
              <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">Resonance</h1>
            </div>
            <p className="max-w-lg text-base leading-7 text-muted-foreground">
              Meet through conversation first. Build signal, reveal details gradually, and let connection earn context.
            </p>
          </div>

          <div className="hidden font-mono text-xs tracking-[0.25em] text-muted-foreground lg:block">
            SIGNAL BEFORE SURFACE
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight">Log in</h2>
              <p className="mt-2 text-sm text-muted-foreground">Access your Resonance account.</p>
            </div>

            {error && (
              <div className="mb-4 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {showVerification ? (
              <div className="space-y-5">
                <div className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to {email}.
                </div>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={setOtpCode}
                    autoFocus
                    autoComplete="one-time-code"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  className="h-12 w-full font-medium"
                  onClick={handleVerify}
                  disabled={loading || otpCode.length < 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify email"
                  )}
                </Button>
                <div className="flex justify-between text-sm">
                  <button onClick={handleResend} className="text-primary hover:underline">
                    Resend code
                  </button>
                  <button onClick={() => setShowVerification(false)} className="text-muted-foreground hover:text-foreground">
                    Back to login
                  </button>
                </div>
                <p className="text-center text-xs text-muted-foreground/60">
                  Also check your spam or junk folder.
                </p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="h-12 w-full font-medium" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
            )}

            {!showVerification && <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create one
              </Link>
            </p>}
          </div>
        </section>
      </div>
    </main>
  );
}
