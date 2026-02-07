/**
 * PWA Install Prompt Component
 * Shows a beautiful install banner after user engagement
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "guitariz_install_prompt";
const ENGAGEMENT_THRESHOLD = 3; // Show after 3 page navigations
const REMIND_LATER_HOURS = 24; // Don't show again for 24 hours after dismiss

interface InstallPromptState {
    dismissed: boolean;
    dismissedAt: number | null;
    installAttempted: boolean;
}

const getStoredState = (): InstallPromptState => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to load install prompt state", e);
    }
    return { dismissed: false, dismissedAt: null, installAttempted: false };
};

const saveState = (state: InstallPromptState) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save install prompt state", e);
    }
};

export const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [engagementCount, setEngagementCount] = useState(0);
    const [state, setState] = useState<InstallPromptState>(getStoredState);

    // Check if already installed
    useEffect(() => {
        if (
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone
        ) {
            setIsInstalled(true);
        }
    }, []);

    // Listen for install prompt
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        const installedHandler = () => {
            setIsInstalled(true);
            setShowBanner(false);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", installedHandler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", installedHandler);
        };
    }, []);

    // Track engagement (page loads/navigation)
    useEffect(() => {
        const stored = sessionStorage.getItem("guitariz_engagement");
        const count = stored ? parseInt(stored, 10) + 1 : 1;
        sessionStorage.setItem("guitariz_engagement", String(count));
        setEngagementCount(count);
    }, []);

    // Determine when to show banner
    useEffect(() => {
        if (isInstalled || !deferredPrompt) return;
        if (state.installAttempted) return;

        // Check if remind later period has passed
        if (state.dismissed && state.dismissedAt) {
            const hoursSinceDismiss =
                (Date.now() - state.dismissedAt) / (1000 * 60 * 60);
            if (hoursSinceDismiss < REMIND_LATER_HOURS) return;
        }

        // Show after engagement threshold
        if (engagementCount >= ENGAGEMENT_THRESHOLD) {
            // Delay showing banner for better UX
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [
        isInstalled,
        deferredPrompt,
        engagementCount,
        state.dismissed,
        state.dismissedAt,
        state.installAttempted,
    ]);

    const handleInstall = useCallback(async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            const newState = { ...state, installAttempted: true };
            setState(newState);
            saveState(newState);

            if (outcome === "accepted") {
                setShowBanner(false);
            }
        } catch (error) {
            console.error("Install prompt error:", error);
        }
    }, [deferredPrompt, state]);

    const handleDismiss = useCallback(() => {
        setShowBanner(false);
        const newState = { dismissed: true, dismissedAt: Date.now(), installAttempted: false };
        setState(newState);
        saveState(newState);
    }, []);

    const handleRemindLater = useCallback(() => {
        setShowBanner(false);
        const newState = { dismissed: true, dismissedAt: Date.now(), installAttempted: false };
        setState(newState);
        saveState(newState);
    }, []);

    if (isInstalled || !deferredPrompt) return null;

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[400px] z-[90]"
                >
                    <div className="relative bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                        </button>

                        <div className="p-5 pr-12">
                            {/* Icon and title */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                                    <Smartphone className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        Install Guitariz
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                    </h3>
                                    <p className="text-sm text-white/60 mt-0.5">
                                        Get the full studio experience
                                    </p>
                                </div>
                            </div>

                            {/* Benefits */}
                            <ul className="space-y-2 mb-5 text-sm text-white/70">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Works offline with cached tools
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    Faster load times & native feel
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                    Quick access from home screen
                                </li>
                            </ul>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleInstall}
                                    className="flex-1 bg-white text-black hover:bg-white/90 font-semibold h-11 rounded-xl shadow-lg"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Install Now
                                </Button>
                                <Button
                                    onClick={handleRemindLater}
                                    variant="ghost"
                                    className="text-white/50 hover:text-white hover:bg-white/5 h-11 px-4 rounded-xl"
                                >
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    Later
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPrompt;
