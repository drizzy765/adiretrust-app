import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { CheckPage } from "./pages/CheckPage";
import { LandingPage } from "./pages/LandingPage";

const ChatPage = lazy(() => import("./pages/ChatPage").then((mod) => ({ default: mod.ChatPage })));

function PageFallback() {
  return <p className="px-4 py-8 text-base text-muted">Loading…</p>;
}

export default function App() {
  return (
    <Shell>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/check" element={<CheckPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/sellers" element={<Navigate to="/" replace />} />
          <Route path="/passport" element={<Navigate to="/" replace />} />
          <Route path="/passport/:id" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}
