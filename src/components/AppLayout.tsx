import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mountain,
  ShieldCheck,
  Search,
  AlertTriangle,
  Users,
  Brain,
  Map,
  MessageSquare,
  FileBarChart,
  ScrollText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Mines", path: "/mines", icon: Mountain },
  { label: "Compliance", path: "/compliance", icon: ShieldCheck },
  { label: "Inspections", path: "/inspections", icon: Search },
  { label: "Violations", path: "/violations", icon: AlertTriangle },
  { label: "Contractors", path: "/contractors", icon: Users },
  { label: "Risk Intelligence", path: "/risk", icon: Brain },
  { label: "GIS Map", path: "/map", icon: Map },
  { label: "AI Assistant", path: "/assistant", icon: MessageSquare },
  { label: "Reports", path: "/reports", icon: FileBarChart },
  { label: "Audit Trail", path: "/audit", icon: ScrollText },
  { label: "Alerts", path: "/alerts", icon: Bell },
  { label: "Admin", path: "/admin", icon: ShieldAlert },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const unreadCount = useQuery(api.alerts.getUnreadCount);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#EDE8E3]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "clay-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/30 transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5B7F6E] text-white shadow-lg">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">CoalGuard AI-V1</h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Governance Platform</p>
          </div>
          <button
            className="ml-auto lg:hidden rounded-xl p-1 hover:bg-white/40"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "clay-inset text-[#5B7F6E] shadow-inner"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/40"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.label === "Alerts" && unreadCount && unreadCount > 0 && (
                  <Badge className="ml-auto bg-[#FF4757] text-white text-[10px] px-1.5 py-0 rounded-lg h-5 min-w-5 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
                {isActive && (
                  <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/20 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="clay-badge flex h-9 w-9 items-center justify-center rounded-xl bg-[#C4A882]/30 text-sm font-bold text-foreground">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.role || "MINE_OFFICIAL"}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-xl p-2 text-muted-foreground hover:text-destructive hover:bg-white/40 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="clay-card !rounded-none !rounded-b-none border-x-0 border-t-0 flex items-center gap-4 px-6 py-3 z-30">
          <button
            className="lg:hidden rounded-xl p-2 hover:bg-white/40 text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="clay-badge flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-[#6BCB77] animate-pulse" />
            System Online
          </div>
          <button
            onClick={() => navigate("/alerts")}
            className="relative rounded-xl p-2 hover:bg-white/40 text-muted-foreground transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount && unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4757] text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="rounded-xl p-2 hover:bg-white/40 text-muted-foreground transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
