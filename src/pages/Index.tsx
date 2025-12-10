import { Suspense, lazy, useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import { Music2, Zap, Globe, Star, ArrowRight, Sparkles, Waves, Palette, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const Fretboard = lazy(() => import("@/components/Fretboard"));
const RootChordLibrary = lazy(() => import("@/components/RootChordLibrary"));
const ScaleExplorer = lazy(() => import("@/components/ScaleExplorer"));
const Metronome = lazy(() => import("@/components/Metronome"));
const CircleOfFifths = lazy(() => import("@/components/CircleOfFifths"));

const SectionPlaceholder = ({ label }: { label: string }) => (
  <div className="glass-card rounded-3xl border border-border/50 p-6 md:p-8 flex items-center justify-between animate-pulse bg-card/70">
    <div className="space-y-2">
      <div className="h-4 w-32 bg-border/60 rounded" />
      <div className="h-3 w-48 bg-border/40 rounded" />
    </div>
    <div className="text-sm text-muted-foreground">Loading {label}…</div>
  </div>
);

const useIsNearViewport = (rootMargin = "250px") => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isNear) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, isNear]);

  return { ref, isNear };
};

const Index = () => {
  const { ref: fretboardRef, isNear: fretboardNear } = useIsNearViewport();
  const { ref: chordsRef, isNear: chordsNear } = useIsNearViewport();
  const { ref: scalesRef, isNear: scalesNear } = useIsNearViewport();
  const { ref: metroRef, isNear: metroNear } = useIsNearViewport();
  const { ref: theoryRef, isNear: theoryNear } = useIsNearViewport();
  const handleStartExploring = () => {
    const element = document.getElementById("fretboard");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 opacity-55" style={{ backgroundImage: "radial-gradient(circle at 22% 20%, hsla(24,94%,60%,0.14), transparent 34%), radial-gradient(circle at 78% 12%, hsla(195,83%,52%,0.12), transparent 32%), radial-gradient(circle at 70% 78%, hsla(220,80%,66%,0.12), transparent 30%)" }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_45%)] blur-xl opacity-26" />
      <div className="absolute -bottom-32 -left-10 w-80 h-80 bg-gradient-to-br from-primary/25 via-accent/18 to-secondary/20 rounded-full blur-xl" />
      <div className="absolute -top-24 right-10 w-96 h-96 bg-gradient-to-br from-secondary/22 via-primary/18 to-accent/18 rounded-full blur-xl" />
      </div>

      <Navigation />

      <main className="pt-28 pb-16 md:pb-28">
        {/* Hero */}
        <section className="relative px-6 pt-16 md:pt-28">
          <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 relative">
              <div className="inline-flex items-center gap-2 ribbon">
                <Sparkles className="w-4 h-4" />
                <span>Playful. Bold. Musical.</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl leading-tight font-bold text-gradient">
                  Guitar theory that feels like a jam session.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                  Paint chords, scales, and rhythms with color. Glide across the fretboard, hear every note, and see theory light up like stage lights.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  onClick={handleStartExploring}
                  className="gap-2 px-7 py-6 text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent text-background shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform"
                >
                  Start exploring
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById("theory")?.scrollIntoView({ behavior: "smooth" })}
                  className="gap-2 px-7 py-6 text-base font-semibold border-primary/50 text-foreground/90 hover:border-accent hover:bg-primary/10"
                >
                  See the theory map
                  <Compass className="w-5 h-5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                {[{ icon: Music2, label: "Fretboard", tone: "from-primary/30" }, { icon: Waves, label: "Metronome", tone: "from-secondary/30" }, { icon: Palette, label: "Scales", tone: "from-accent/30" }].map(({ icon: Icon, label, tone }) => (
                  <div key={label} className={`flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/60 backdrop-blur-md hover:border-primary/50 transition ${tone}`}>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-card/70 to-card/30 grid place-items-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tool</p>
                      <p className="font-semibold">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:ml-6">
              <div className="absolute -left-10 -top-10 w-48 h-48 bg-gradient-to-br from-secondary/25 via-primary/20 to-accent/20 rounded-full blur-2xl opacity-70" />
              <div className="absolute -right-6 bottom-4 w-36 h-36 bg-gradient-to-br from-primary/25 via-secondary/20 to-accent/20 rounded-full blur-2xl opacity-80" />
              <div className="relative glass-card border border-glass-border/80 rounded-3xl shadow-2xl p-6 md:p-8 ink-blob">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="uppercase text-xs tracking-[0.2em] text-muted-foreground">Live canvas</p>
                    <h3 className="text-2xl font-semibold">Color your chords</h3>
                  </div>
                  <div className="tag-chip">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Reactive</span>
                  </div>
                </div>
                <div className="grid gap-4">
                  {[{ title: "Fretboard", desc: "Tap to hear chroma", icon: Music2 }, { title: "Scales", desc: "Western + ragas", icon: Globe }, { title: "Metronome", desc: "Grooves & odd time", icon: Waves }].map(({ title, desc, icon: Icon }) => (
                    <div key={title} className="p-4 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md hover:border-primary/50 transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 grid place-items-center">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold">{title}</p>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Storyline strip */}
        <section className="px-6 mt-16">
          <div className="container mx-auto grid md:grid-cols-3 gap-4">
            {[{ icon: Zap, title: "Hands-on", text: "Every card is tappable, playable, and glows when you explore." }, { icon: Globe, title: "Cross-culture", text: "Swap between western modes and Indian ragas in one flow." }, { icon: Star, title: "Stage-ready", text: "Built for inspiration—no installs, just start playing." }].map(({ icon: Icon, title, text }) => (
              <div key={title} className="p-5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md hover:border-primary/50 transition hover:-translate-y-1">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/25 via-secondary/20 to-accent/20 grid place-items-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-lg mb-1">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tools */}
        <div className="container mx-auto px-6 space-y-24 md:space-y-32 pb-24 md:pb-32 pt-16">
          <section id="fretboard" className="scroll-mt-24" ref={fretboardRef}>
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="uppercase text-xs tracking-[0.18em] text-muted-foreground">Section</p>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Fretboard playground</h2>
                  <p className="text-muted-foreground mt-2">Hear every position with color-coded notes.</p>
                </div>
                <span className="tag-chip">Real-time audio</span>
              </div>
              <div className="glass-card rounded-3xl border border-border/50 p-4 md:p-6 shadow-xl">
                {fretboardNear ? (
                  <Suspense fallback={<SectionPlaceholder label="Fretboard" />}>
                    <Fretboard />
                  </Suspense>
                ) : (
                  <SectionPlaceholder label="Fretboard" />
                )}
              </div>
            </div>
          </section>

          <section id="chords" className="scroll-mt-24" ref={chordsRef}>
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="uppercase text-xs tracking-[0.18em] text-muted-foreground">Library</p>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">Chord gallery</h2>
                  <p className="text-muted-foreground mt-2">Swipe through rich voicings and shapes.</p>
                </div>
                <span className="tag-chip">Curated</span>
              </div>
              <div className="glass-card rounded-3xl border border-border/50 p-4 md:p-6 shadow-xl">
                {chordsNear ? (
                  <Suspense fallback={<SectionPlaceholder label="Chord Library" />}>
                    <RootChordLibrary />
                  </Suspense>
                ) : (
                  <SectionPlaceholder label="Chord Library" />
                )}
              </div>
            </div>
          </section>

          <section id="scales" className="scroll-mt-24" ref={scalesRef}>
            {scalesNear ? (
              <Suspense fallback={<SectionPlaceholder label="Scale Explorer" />}>
                <ScaleExplorer />
              </Suspense>
            ) : (
              <SectionPlaceholder label="Scale Explorer" />
            )}
          </section>

          <section id="metronome" className="scroll-mt-24" ref={metroRef}>
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="uppercase text-xs tracking-[0.18em] text-muted-foreground">Rhythm</p>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">Metronome</h2>
                  <p className="text-muted-foreground mt-2">Groove with playful ticks and glowing tempos.</p>
                </div>
                <span className="tag-chip">Keep time</span>
              </div>
              <div className="glass-card rounded-3xl border border-border/50 p-4 md:p-6 shadow-xl">
                {metroNear ? (
                  <Suspense fallback={<SectionPlaceholder label="Metronome" />}>
                    <Metronome />
                  </Suspense>
                ) : (
                  <SectionPlaceholder label="Metronome" />
                )}
              </div>
            </div>
          </section>

          <section id="theory" className="scroll-mt-24" ref={theoryRef}>
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="uppercase text-xs tracking-[0.18em] text-muted-foreground">Map</p>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Circle of Fifths</h2>
                  <p className="text-muted-foreground mt-2">See keys orbit with color-coded highlights.</p>
                </div>
                <span className="tag-chip">Visual theory</span>
              </div>
              <div className="glass-card rounded-3xl border border-border/50 p-4 md:p-6 shadow-xl">
                {theoryNear ? (
                  <Suspense fallback={<SectionPlaceholder label="Circle of Fifths" />}>
                    <CircleOfFifths />
                  </Suspense>
                ) : (
                  <SectionPlaceholder label="Circle of Fifths" />
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/40 py-14 px-6 bg-gradient-to-b from-transparent via-background/60 to-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Guitariz" className="w-10 h-10 rounded-xl" />
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Guitariz</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A vivid playground for chords, scales, and rhythms. Built for guitarists who love color.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Tools</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#fretboard" className="hover:text-primary transition-colors">Fretboard</a></li>
                <li><a href="#chords" className="hover:text-primary transition-colors">Chord Library</a></li>
                <li><a href="#scales" className="hover:text-primary transition-colors">Scale Explorer</a></li>
                <li><a href="#metronome" className="hover:text-primary transition-colors">Metronome</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Explore</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#theory" className="hover:text-primary transition-colors">Circle of Fifths</a></li>
                <li><a href="https://github.com/abhi9vaidya/guitariz" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a></li>
                <li><a href="mailto:hello@guitariz.app" className="hover:text-primary transition-colors">hello@guitariz.app</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Mood</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Stay playful, stay curious, and let the harmony glow.</p>
              <div className="sunset-divider" />
              <p className="text-xs text-muted-foreground">© 2025 Guitariz</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
