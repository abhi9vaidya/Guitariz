import Navigation from "@/components/Navigation";
import Fretboard from "@/components/Fretboard";

const FretboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 pt-28 pb-16 space-y-6">
        <header className="space-y-2">
          <p className="uppercase text-xs tracking-[0.18em] text-muted-foreground">Fretboard</p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Play the neck
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Hear every position, see color-coded notes, and practice shapes without the rest of the app weighing you down.
          </p>
        </header>
        <div className="glass-card rounded-3xl border border-border/50 p-4 md:p-6 shadow-xl">
          <Fretboard />
        </div>
      </main>
    </div>
  );
};

export default FretboardPage;
