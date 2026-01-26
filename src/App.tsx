import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";

const Index = lazy(() => import("./pages/Index"));
const FretboardPage = lazy(() => import("./pages/FretboardPage"));
const ChordsPage = lazy(() => import("./pages/ChordsPage"));
const ScalesPage = lazy(() => import("./pages/ScalesPage"));
const MetronomePage = lazy(() => import("./pages/MetronomePage"));
const ChordAIPage = lazy(() => import("./pages/ChordAIPage"));
const VocalSplitterPage = lazy(() => import("./pages/VocalSplitterPage"));
const TheoryPage = lazy(() => import("./pages/TheoryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

import GuitarizLoader from "@/components/ui/loader";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const RouteFallback = () => (
  <GuitarizLoader fullScreen text="INITIALIZING" />
);

const queryClient = new QueryClient();

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const App = () => {
  const location = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <Analytics />
      <SpeedInsights />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrapper>
                    <Index />
                  </PageWrapper>
                </Suspense>
              }
            />
            <Route
              path="/fretboard"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrapper>
                    <FretboardPage />
                  </PageWrapper>
                </Suspense>
              }
            />
            <Route
              path="/chords"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrapper>
                    <ChordsPage />
                  </PageWrapper>
                </Suspense>
              }
            />
            <Route
              path="/scales"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrapper>
                    <ScalesPage />
                  </PageWrapper>
                </Suspense>
              }
            />
            <Route
              path="/metronome"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrapper>
                    <MetronomePage />
                  </PageWrapper>
                </Suspense>
              }
            />
            <Route
              path="/chord-ai"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrapper>
                    <ChordAIPage />
                  </PageWrapper>
                </Suspense>
              }
            />
            <Route
              path="/vocal-splitter"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrapper>
                    <VocalSplitterPage />
                  </PageWrapper>
                </Suspense>
              }
            />
            <Route
              path="/theory"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrapper>
                    <TheoryPage />
                  </PageWrapper>
                </Suspense>
              }
            />
            <Route
              path="*"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrapper>
                    <NotFound />
                  </PageWrapper>
                </Suspense>
              }
            />
          </Routes>
        </AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
