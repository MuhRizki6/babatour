import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { LogIn, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { formatApiErrorDetail } from "../lib/api";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      nav("/admin");
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[color:var(--bg)]">
      <div className="hidden lg:flex flex-1 bg-primary text-white p-12 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent text-white grid place-items-center font-serif-display text-2xl">
              B
            </div>
            <div className="font-serif-display text-2xl">Baba Tour Admin</div>
          </div>
          <div>
            <div className="font-serif-display text-5xl leading-tight">
              Selamat datang kembali,
              <br />
              <span className="text-accent italic">Admin.</span>
            </div>
            <p className="text-white/70 mt-6 max-w-md leading-relaxed">
              Kelola inquiry jamaah, publikasikan artikel, dan pantau pertumbuhan
              Baba Tour Umroh & Haji Khusus dari satu tempat.
            </p>
          </div>
          <div className="text-xs text-white/50">© Baba Tour {new Date().getFullYear()}</div>
        </div>
        <div
          aria-hidden
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(196,154,69,0.2), transparent 70%)" }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-md" data-testid="admin-login-form">
          <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">
            Admin Access
          </div>
          <h1 className="font-serif-display text-primary text-4xl mt-3">Sign in</h1>
          <p className="text-muted mt-3">
            Masuk untuk mengelola dashboard Baba Tour.
          </p>

          <div className="mt-10 space-y-5">
            <div>
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.18em] text-muted">
                Email
              </Label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@babatour.com"
                  data-testid="admin-login-email"
                  className="pl-11 bg-surface border-soft rounded-xl h-12"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-xs uppercase tracking-[0.18em] text-muted">
                Password
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  data-testid="admin-login-password"
                  className="pl-11 bg-surface border-soft rounded-xl h-12"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="mt-8 w-full bg-primary text-white hover:bg-primary/90 transition rounded-full px-8 py-4 font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Signing in..." : (<>Sign in <LogIn className="w-4 h-4" /></>)}
          </button>

          <div className="text-center mt-8 text-xs text-muted">
            <a href="/" className="hover:text-accent transition">← Back to site</a>
          </div>
        </form>
      </div>
    </div>
  );
}
