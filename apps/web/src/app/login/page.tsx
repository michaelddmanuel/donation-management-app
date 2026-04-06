"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LogIn, AlertCircle, Shield, Users, Package, BarChart3 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Hardcoded admin credentials for local dev
    if (email === "admin" && password === "admin") {
      document.cookie = "dh_auth=authenticated; path=/; max-age=86400; SameSite=Lax";
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Use admin / admin");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-12 flex-col justify-between overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-white/90 text-sm font-medium tracking-wide">DonationHub</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Managing donations<br />made{" "}
              <span className="text-white/80 italic">effortless</span>.
            </h2>
            <p className="text-white/70 mt-4 text-base max-w-md leading-relaxed">
              Track inventory, coordinate volunteers, serve families, and generate impact reports — all from one powerful platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {[
              { icon: Users, label: "1,200+", sub: "Families served" },
              { icon: Package, label: "$97K", sub: "Inventory tracked" },
              { icon: Shield, label: "10", sub: "Active chapters" },
              { icon: BarChart3, label: "99.9%", sub: "Uptime" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={sub} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-white/80 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-[11px] text-white/60">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/40">
          © 2026 DonationHub · Built with ♥ for nonprofits
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo (hidden on lg+) */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/25">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">DonationHub</h1>
            <p className="text-sm text-muted-foreground mt-1">Management Platform</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <button type="button" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/60">
              <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10">
                <Shield className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                Dev mode · use <code className="font-mono font-semibold text-foreground px-1 py-0.5 bg-muted rounded text-[11px]">admin</code> / <code className="font-mono font-semibold text-foreground px-1 py-0.5 bg-muted rounded text-[11px]">admin</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
