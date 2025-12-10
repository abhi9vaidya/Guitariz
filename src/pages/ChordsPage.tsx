import Navigation from "@/components/Navigation";
import RootChordLibrary from "@/components/RootChordLibrary";

const ChordsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 pt-28 pb-16 space-y-6">
        <header className="space-y-2">
          <p className="uppercase text-xs tracking-[0.18em] text-muted-foreground">Chords</p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
            Chord library
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse curated voicings and shapes with audio feedback and quick filters.
          </p>
        </header>
        <div className="glass-card rounded-3xl border border-border/50 p-4 md:p-6 shadow-xl">
          <RootChordLibrary />
        </div>
      </main>
    </div>
  );
};

export default ChordsPage;
