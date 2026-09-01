import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { Settings, User, Shield, Bell, Database, Loader2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const seedData = useMutation(api.seed.seedAll);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedData();
      setSeedResult(typeof result === "string" ? result : "Seed completed");
    } catch (e) {
      setSeedResult(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
    setSeeding(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <div className="clay-card">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-[#5B7F6E]" />
            <h3 className="text-sm font-bold">Profile</h3>
          </div>
          <div className="space-y-3">
            <div className="clay-inset rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Name</span>
              <span className="text-sm font-medium">{user?.name || "Demo User"}</span>
            </div>
            <div className="clay-inset rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{user?.email || "demo@coalguard.ai"}</span>
            </div>
            <div className="clay-inset rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Role</span>
              <span className="clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold bg-[#5B7F6E]/10 text-[#5B7F6E]">{user?.role || "MINE_OFFICIAL"}</span>
            </div>
          </div>
        </div>

        {/* Seed Data */}
        <div className="clay-card">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-5 w-5 text-[#8B7EC8]" />
            <h3 className="text-sm font-bold">Demo Data</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Seed the database with realistic synthetic data for the hackathon demo.
            This will populate 12 mines, inspections, violations, compliance items, contractors, and audit logs.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="clay-button flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            {seeding ? "Seeding..." : "Seed Demo Data"}
          </button>
          {seedResult && (
            <div className="clay-inset mt-3 rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground">{seedResult}</p>
            </div>
          )}
        </div>

        <div className="clay-card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-[#8B7EC8]" />
            <h3 className="text-sm font-bold">Security</h3>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Sessions are managed locally for this demo</p>
            <p>• Role-based access control is enforced</p>
            <p>• All actions are logged in the audit trail</p>
          </div>
        </div>

        <div className="clay-card">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-[#C4A882]" />
            <h3 className="text-sm font-bold">Notifications</h3>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Overdue compliance alerts</p>
            <p>• Critical violation notifications</p>
            <p>• Risk score changes</p>
            <p>• Upcoming deadline reminders</p>
          </div>
        </div>

        <div className="clay-card text-center py-6 text-xs text-muted-foreground">
          Demo Environment — CoalGuard AI-V1
        </div>
      </div>
    </AppLayout>
  );
}
