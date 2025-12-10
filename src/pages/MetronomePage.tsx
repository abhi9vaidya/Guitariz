import Navigation from "@/components/Navigation";
import Metronome from "@/components/Metronome";

const MetronomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 pt-28 pb-16 space-y-6">
        <header className="space-y-2">
          <p className="uppercase text-xs tracking-[0.18em] text-muted-foreground">Rhythm</p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
            Metronome
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Groove with playful ticks, odd meters, and simple controls without extra UI around it.
          </p>
        </header>
        <div className="glass-card rounded-3xl border border-border/50 p-4 md:p-6 shadow-xl">
          <Metronome />
        </div>
      </main>
    </div>
  );
};

export default MetronomePage;
