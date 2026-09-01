import { useEffect, useState } from "react";
import { currentUser, setCurrentUser, subscribeLocal } from "@/lib/local-db";

type DemoUser = { _id: string; name: string; email: string; role: string };

export function useAuth() {
  const [user, setUser] = useState<DemoUser | null>(() => currentUser());
  useEffect(() => subscribeLocal(() => setUser(currentUser())), []);
  const signIn = async (provider: string, formData: FormData) => {
    if (provider === "anonymous") {
      const guest: DemoUser = { _id: "guest-user", name: "Demo Guest", email: "guest@coalguard.local", role: "MINE_OFFICIAL" };
      setCurrentUser(guest);
      return;
    }
    const email = String(formData.get("email") || "").trim();
    const code = String(formData.get("code") || "").trim();
    if (!email) throw new Error("Email is required.");
    if (code && code.length === 6) {
      const demo: DemoUser = { _id: `user-${btoa(email).replace(/[^a-z0-9]/gi,"").slice(0,12)}`, name: email.split("@")[0] || "Demo User", email, role: "MINE_OFFICIAL" };
      setCurrentUser(demo);
      return;
    }
    // Local-only demo: the second step accepts any six-digit code.
    return;
  };
  const signOut = async () => setCurrentUser(null);
  return { isLoading: false, isAuthenticated: !!user, user, signIn, signOut };
}
