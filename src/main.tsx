import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import React, { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";

// Lazy load route components
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Mines = lazy(() => import("./pages/Mines.tsx"));
const MineDetail = lazy(() => import("./pages/MineDetail.tsx"));
const CompliancePage = lazy(() => import("./pages/CompliancePage.tsx"));
const InspectionsPage = lazy(() => import("./pages/InspectionsPage.tsx"));
const ViolationsPage = lazy(() => import("./pages/ViolationsPage.tsx"));
const ContractorsPage = lazy(() => import("./pages/ContractorsPage.tsx"));
const RiskPage = lazy(() => import("./pages/RiskPage.tsx"));
const GISMapPage = lazy(() => import("./pages/GISMapPage.tsx"));
const AssistantPage = lazy(() => import("./pages/AssistantPage.tsx"));
const ReportsPage = lazy(() => import("./pages/ReportsPage.tsx"));
const AuditTrailPage = lazy(() => import("./pages/AuditTrailPage.tsx"));
const AlertsPage = lazy(() => import("./pages/AlertsPage.tsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.tsx"));
const AdminPage = lazy(() => import("./pages/AdminPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EDE8E3]">
      <div className="clay-card px-8 py-6 text-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
      </div>
    </div>
  );
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "Unknown error", stack: error.stack || "" };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#EDE8E3] text-foreground p-6">
          <div className="clay-card max-w-lg text-center p-8">
            <p className="text-sm font-semibold">Runtime Error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/mines" element={<RequireAuth><Mines /></RequireAuth>} />
              <Route path="/mines/:mineId" element={<RequireAuth><MineDetail /></RequireAuth>} />
              <Route path="/compliance" element={<RequireAuth><CompliancePage /></RequireAuth>} />
              <Route path="/inspections" element={<RequireAuth><InspectionsPage /></RequireAuth>} />
              <Route path="/violations" element={<RequireAuth><ViolationsPage /></RequireAuth>} />
              <Route path="/contractors" element={<RequireAuth><ContractorsPage /></RequireAuth>} />
              <Route path="/risk" element={<RequireAuth><RiskPage /></RequireAuth>} />
              <Route path="/map" element={<RequireAuth><GISMapPage /></RequireAuth>} />
              <Route path="/assistant" element={<RequireAuth><AssistantPage /></RequireAuth>} />
              <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
              <Route path="/audit" element={<RequireAuth><AuditTrailPage /></RequireAuth>} />
              <Route path="/alerts" element={<RequireAuth><AlertsPage /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
              <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
      </BrowserRouter>
      <Toaster />
    </RootErrorBoundary>
  </StrictMode>,
);
