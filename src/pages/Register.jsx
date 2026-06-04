import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, KeyRound } from "lucide-react";
import ResonanceLogo from "@/components/ResonanceLogo";
import GoogleIcon from "@/components/GoogleIcon";

export default function Register() {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep("otp");
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode: otp });
      base44.auth.setToken(result.access_token);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  return (
    <main className="auth-inverted min-h-screen bg-background text-foreground">
      <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left branding panel */}
        <section className="flex min-h-[42vh] flex-col justify-between border-b border-border px-6 py-8 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12">
          <div className="flex items-center gap-3">
            <ResonanceLogo size={42} className="text-white [&_path]:stroke-white" color="currentColor" />
            <span className="font-mono text-sm font-bold tracking-[0.35em] text-white">RESONANCE</span>
          </div>
          <div className="max-w-xl space-y-5 py-12">
            <div className="flex items-center gap-3">
              <ResonanceLogo size={72} className="text-white [&_path]:stroke-white" color="currentColor" />
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

        {/* Right form panel */}
        <section className="flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-sm">
            {step === "form" ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight">Create account</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Join Resonance. No photos required.</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-medium mb-6"
                  onClick={handleGoogle}
                >
                  <GoogleIcon className="w-5 h-5 mr-2" />
                  Continue with Google
                </Button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">or</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="h-12 w-full font-medium" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Log in
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center border border-primary/30 bg-primary/5">
                    <KeyRound className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">Verify your email</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We sent a code to <span className="text-foreground font-medium">{email}</span>. Enter it below.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoFocus
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-12 text-center text-lg tracking-widest"
                      required
                    />
                  </div>
                  <Button type="submit" className="h-12 w-full font-medium" disabled={loading || otp.length < 4}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                    ) : (
                      "Verify & Continue"
                    )}
                  </Button>
                </form>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Didn't get it?{" "}
                  <button onClick={handleResend} className="font-medium text-primary hover:underline">
                    Resend code
                  </button>
                </p>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  <button onClick={() => setStep("form")} className="hover:underline">
                    ← Use a different email
                  </button>
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}