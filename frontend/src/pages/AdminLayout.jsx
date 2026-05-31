import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Newspaper, LogOut, ExternalLink, Package, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-[color:var(--bg)]" data-testid="admin-layout">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-primary text-white p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent grid place-items-center font-serif-display text-2xl">B</div>
          <div>
            <div className="font-serif-display text-xl">Baba Tour</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/60">Admin Panel</div>
          </div>
        </div>

        <nav className="mt-10 flex-1 space-y-1">
          <NavLink
            to="/admin"
            end
            data-testid="admin-nav-inquiries"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" /> Inquiries
          </NavLink>
          <NavLink
            to="/admin/packages"
            data-testid="admin-nav-packages"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
              }`
            }
          >
            <Package className="w-4 h-4" /> Packages
          </NavLink>
          <NavLink
            to="/admin/blog"
            data-testid="admin-nav-blog"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
              }`
            }
          >
            <Newspaper className="w-4 h-4" /> Articles
          </NavLink>
          <NavLink
            to="/admin/newsletter"
            data-testid="admin-nav-newsletter"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
              }`
            }
          >
            <Mail className="w-4 h-4" /> Newsletter
          </NavLink>
        </nav>

        <div className="space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/5 transition"
          >
            <ExternalLink className="w-4 h-4" /> View Site
          </a>
          <div className="border-t border-white/10 pt-4">
            <div className="px-4 text-xs text-white/50 uppercase tracking-[0.18em] mb-2">
              Signed in
            </div>
            <div className="px-4 text-sm font-serif-display">{user?.email}</div>
            <button
              onClick={logout}
              data-testid="admin-logout-btn"
              className="mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/80 hover:bg-white/5 transition"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent grid place-items-center font-serif-display">B</div>
          <span className="font-serif-display">Baba Admin</span>
        </div>
        <button onClick={logout} data-testid="admin-logout-mobile" className="text-sm text-white/80">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-primary text-white border-t border-white/10 flex z-40">
        <NavLink to="/admin" end className={({ isActive }) => `flex-1 py-3 text-center text-[11px] ${isActive ? "text-accent" : "text-white/70"}`}>
          <LayoutDashboard className="w-5 h-5 mx-auto mb-1" /> Inquiries
        </NavLink>
        <NavLink to="/admin/packages" className={({ isActive }) => `flex-1 py-3 text-center text-[11px] ${isActive ? "text-accent" : "text-white/70"}`}>
          <Package className="w-5 h-5 mx-auto mb-1" /> Packages
        </NavLink>
        <NavLink to="/admin/blog" className={({ isActive }) => `flex-1 py-3 text-center text-[11px] ${isActive ? "text-accent" : "text-white/70"}`}>
          <Newspaper className="w-5 h-5 mx-auto mb-1" /> Articles
        </NavLink>
        <NavLink to="/admin/newsletter" className={({ isActive }) => `flex-1 py-3 text-center text-[11px] ${isActive ? "text-accent" : "text-white/70"}`}>
          <Mail className="w-5 h-5 mx-auto mb-1" /> Subs
        </NavLink>
      </nav>

      <main className="lg:pl-64 pb-20 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
