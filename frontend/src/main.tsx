import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { AppWrapper } from "./AppWrapper";

const AdminApp = lazy(() => import("./admin/AdminApp"));

const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

const container = document.getElementById("root");
if (!container) throw new Error("Root container not found");

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<AppWrapper />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);
