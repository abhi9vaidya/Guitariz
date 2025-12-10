import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Music, Scale, Hash, Music2, Globe, Play, Info, Zap, Disc, Guitar, Search, X } from "lucide-react";
import { playNote } from "@/lib/chordAudio";


type ScaleDataBase = {
  intervals: number[];
  description: string;
};

type WesternScaleData = ScaleDataBase & {
  chords: string[];
  usage: string;
  category?: "mode" | "pentatonic" | "exotic" | "blues";
};

type RagaScaleData = ScaleDataBase & {
  aroha: string;
  avaroha: string;
  time: string;
  mood: string;
};

type ScaleData = WesternScaleData | RagaScaleData;

const WESTERN_SCALES = {
  "Major (Ionian)": {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: "The standard major scale - happy, bright sound",
    chords: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
    usage: "Most common scale in Western music",
    category: "mode" as const
  },
  "Natural Minor (Aeolian)": {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: "Sad, melancholic sound",
    chords: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
    usage: "Minor key compositions",
    category: "mode" as const
  },
  "Harmonic Minor": {
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: "Minor scale with raised 7th - dramatic, exotic",
    chords: ["i", "ii°", "III+", "iv", "V", "VI", "vii°"],
    usage: "Classical music, metal, jazz",
    category: "mode" as const
  },
  "Melodic Minor": {
    intervals: [0, 2, 3, 5, 7, 9, 11],
    description: "Minor scale with raised 6th and 7th",
    chords: ["i", "ii", "III+", "IV", "V", "vi°", "vii°"],
    usage: "Jazz, fusion, classical",
    category: "mode" as const
  },
  "Dorian": {
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: "Minor scale with raised 6th - jazzy, mysterious",
    chords: ["i", "ii", "III", "IV", "v", "vi°", "VII"],
    usage: "Jazz, rock, folk",
    category: "mode" as const
  },
  "Phrygian": {
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: "Spanish-sounding scale - tense, exotic",
    chords: ["i", "II", "III", "iv", "v°", "VI", "vii"],
    usage: "Flamenco, metal, world music",
    category: "mode" as const
  },
  "Lydian": {
    intervals: [0, 2, 4, 6, 7, 9, 11],
    description: "Major scale with raised 4th - dreamy, ethereal",
    chords: ["I", "II", "iii", "#iv°", "V", "vi", "vii"],
    usage: "Film scores, jazz, progressive rock",
    category: "mode" as const
  },
  "Mixolydian": {
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: "Major scale with flattened 7th - bluesy, dominant",
    chords: ["I", "ii", "iii", "IV", "v", "vi", "VII"],
    usage: "Blues, rock, folk",
    category: "mode" as const
  },
  "Locrian": {
    intervals: [0, 1, 3, 5, 6, 8, 10],
    description: "Diminished scale - unstable, dissonant",
    chords: ["i°", "ii", "iii", "iv", "V", "VI", "vii"],
    usage: "Rare, experimental music",
    category: "mode" as const
  },
  "Pentatonic Major": {
    intervals: [0, 2, 4, 7, 9],
    description: "Five-note major scale - simple, pure",
    chords: ["I", "IV", "V"],
    usage: "Folk, country, rock",
    category: "pentatonic" as const
  },
  "Pentatonic Minor": {
    intervals: [0, 3, 5, 7, 10],
    description: "Five-note minor scale - bluesy, soulful",
    chords: ["i", "iv", "v"],
    usage: "Blues, rock, world music",
    category: "pentatonic" as const
  },
  "Blues": {
    intervals: [0, 3, 5, 6, 7, 10],
    description: "Hexatonic blues scale - expressive, emotive",
    chords: ["i", "iv", "V"],
    usage: "Blues, jazz, rock",
    category: "blues" as const
  },
  "Whole Tone": {
    intervals: [0, 2, 4, 6, 8, 10],
    description: "Dreamy, ambiguous scale",
    chords: ["I", "ii", "iii", "IV", "V", "vi"],
    usage: "Impressionist music, jazz",
    category: "exotic" as const
  },
  "Diminished": {
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    description: "Alternating whole and half steps",
    chords: ["i°", "ii°", "III", "iv°", "V", "VI", "vii°"],
    usage: "Jazz, classical, modern",
    category: "exotic" as const
  }
};

const RAGA_SCALES = {
  "Bhairav": {
    intervals: [0, 1, 4, 5, 7, 8, 11],
    description: "Morning raga - devotional, serious. Equivalent to Phrygian dominant scale (5th mode of harmonic minor) with a unique komal re and dha.",
    aroha: "S r G M P d n S'",
    avaroha: "S' n d P M G r S",
    time: "Dawn",
    mood: "Devotional, contemplative"
  },
  "Yaman": {
    intervals: [0, 2, 4, 6, 7, 9, 11],
    description: "Evening raga - romantic, majestic. Equivalent to Lydian mode (4th mode of major scale) - features a raised 4th (tivra ma).",
    aroha: "N R G M D N S'",
    avaroha: "S' N D M G R S",
    time: "Evening",
    mood: "Romantic, heroic"
  },
  "Bhairavi": {
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: "Dawn raga - devotional, soothing. Equivalent to Dorian mode (2nd mode of minor scale) with all komal notes except ma.",
    aroha: "S r g M P d n S'",
    avaroha: "S' n d P M g r S",
    time: "Dawn",
    mood: "Devotional, peaceful"
  },
  "Todi": {
    intervals: [0, 1, 3, 6, 7, 8, 11],
    description: "Morning raga - mystical, complex. Equivalent to Phrygian dominant scale with tivra ma - creates a haunting, exotic sound.",
    aroha: "S r g M' P d n S'",
    avaroha: "S' n d P M' g r S",
    time: "Morning",
    mood: "Mystical, intense"
  },
  "Kafi": {
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: "Evening raga - romantic, light. Equivalent to Dorian mode (2nd mode of minor scale) - features a raised 6th (tivra dha).",
    aroha: "N R g M D n S'",
    avaroha: "S' n D M g R S",
    time: "Evening",
    mood: "Romantic, joyful"
  },
  "Bageshri": {
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: "Night raga - romantic, devotional. Equivalent to Mixolydian mode (5th mode of major scale) with komal re - creates a melancholic yet devotional atmosphere.",
    aroha: "S r g M P d n S'",
    avaroha: "S' n d P M g r S",
    time: "Night",
    mood: "Romantic, devotional"
  },
  "Darbar": {
    intervals: [0, 1, 4, 5, 7, 9, 10],
    description: "Evening raga - majestic, royal. Equivalent to Lydian dominant scale - combines Lydian brightness with Mixolydian flat 7th.",
    aroha: "S r G M P D n S'",
    avaroha: "S' n D P M G r S",
    time: "Evening",
    mood: "Majestic, dignified"
  },
  "Malkauns": {
    intervals: [0, 3, 5, 6, 7, 10],
    description: "Late night raga - mystical, intense. Equivalent to a hexatonic scale similar to diminished patterns - creates a meditative, otherworldly sound.",
    aroha: "S g M d n S'",
    avaroha: "S' n d M g S",
    time: "Late night",
    mood: "Mystical, meditative"
  },
  "Bilawal": {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: "Morning raga - pure, natural. Equivalent to major scale (Ionian mode) - all shudh notes, represents purity and clarity.",
    aroha: "S R G M P D N S'",
    avaroha: "S' N D P M G R S",
    time: "Morning",
    mood: "Pure, natural"
  },
  "Asavari": {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: "Afternoon raga - devotional, serious. Equivalent to natural minor scale (Aeolian mode) - features komal dha and ni.",
    aroha: "S R g M P d n S'",
    avaroha: "S' n d P M g R S",
    time: "Afternoon",
    mood: "Devotional, serious"
  },
  "Bhopali": {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: "Afternoon raga - happy, devotional. Equivalent to Mixolydian mode (5th mode of major scale) - features a flat 7th (komal ni) for a bluesy feel.",
    aroha: "S R G P D S'",
    avaroha: "S' D P G R S",
    time: "Afternoon",
    mood: "Happy, devotional"
  },
  "Durga": {
    intervals: [0, 1, 4, 6, 7, 9, 11],
    description: "Morning raga - powerful, heroic. Equivalent to Lydian mode with komal re - combines Lydian brightness with Phrygian tension.",
    aroha: "S r G M' P D N S'",
    avaroha: "S' N D P M' G r S",
    time: "Morning",
    mood: "Powerful, heroic"
  }
};

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ENGLISH_INDIAN_NOTES = ["S", "r", "R", "g", "G", "M", "m", "P", "d", "D", "n", "N"];
const DEVANAGARI_NOTES = ["सा", "रे♭", "रे", "ग♭", "ग", "म", "म#", "प", "ध♭", "ध", "नि♭", "नि"];

// Color mapping for chromatic notes
const NOTE_COLORS = {
  "C": "bg-red-500 hover:bg-red-600 text-white",
  "C#": "bg-red-400 hover:bg-red-500 text-white",
  "D": "bg-orange-500 hover:bg-orange-600 text-white",
  "D#": "bg-orange-400 hover:bg-orange-500 text-white",
  "E": "bg-yellow-500 hover:bg-yellow-600 text-black",
  "F": "bg-yellow-400 hover:bg-yellow-500 text-black",
  "F#": "bg-green-500 hover:bg-green-600 text-white",
  "G": "bg-green-400 hover:bg-green-500 text-white",
  "G#": "bg-blue-500 hover:bg-blue-600 text-white",
  "A": "bg-blue-400 hover:bg-blue-500 text-white",
  "A#": "bg-purple-500 hover:bg-purple-600 text-white",
  "B": "bg-purple-400 hover:bg-purple-500 text-white"
};

const ScaleExplorer = () => {
  const [rootNote, setRootNote] = useState("C");
  const [selectedScale, setSelectedScale] = useState("Major (Ionian)");
  const [scaleCategory, setScaleCategory] = useState("western");
  const [indianNotationType, setIndianNotationType] = useState("english");
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [scaleSearchQuery, setScaleSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);


  const currentScales = (scaleCategory === "western" ? WESTERN_SCALES : RAGA_SCALES) as Record<string, ScaleData>;

  // Filter scales based on search query and category
  const filteredScales = useMemo(() => {
    let scales = Object.keys(currentScales);
    
    if (scaleSearchQuery.trim()) {
      scales = scales.filter(scale => 
        scale.toLowerCase().includes(scaleSearchQuery.toLowerCase())
      );
    }
    
    if (scaleCategory === "western" && selectedCategory) {
      scales = scales.filter(scale => {
        const scaleData = currentScales[scale];
        return ('category' in scaleData) && scaleData.category === selectedCategory;
      });
    }
    
    return scales;
  }, [scaleSearchQuery, selectedCategory, scaleCategory, currentScales]);

  const getScaleNotes = useMemo(() => {
    const rootIndex = NOTES.indexOf(rootNote);
    const scaleData = currentScales[selectedScale];
    if (!scaleData || !('intervals' in scaleData)) return [];
    return scaleData.intervals.map((interval: number) => NOTES[(rootIndex + interval) % 12]);
  }, [rootNote, selectedScale, currentScales]);

  const getIndianNotation = useMemo(() => {
    if (scaleCategory !== "raga") return [];
    const rootIndex = NOTES.indexOf(rootNote);
    const scaleData = RAGA_SCALES[selectedScale as keyof typeof RAGA_SCALES];
    if (!scaleData || !('intervals' in scaleData)) return [];
    const notesArray = indianNotationType === "devanagari" ? DEVANAGARI_NOTES : ENGLISH_INDIAN_NOTES;
    return scaleData.intervals.map((interval: number) => notesArray[(rootIndex + interval) % 12]);
  }, [rootNote, selectedScale, scaleCategory, indianNotationType]);

  const scaleData = currentScales[selectedScale];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-8">
      <div className="container">

      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl glow-accent">
            <Disc className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-gradient">Scale Explorer</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Discover scales and their patterns across the fretboard
        </p>
      </div>

      <Tabs value={scaleCategory} onValueChange={setScaleCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 rounded-2xl shadow-lg backdrop-blur-sm bg-card/50 border border-border/50">
          <TabsTrigger value="western" className="flex items-center gap-2 text-sm md:text-base data-[state=active]:glow-accent data-[state=active]:bg-primary/10 transition-all duration-300 hover:bg-primary/5">
            <Music className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Western Scales</span>
            <span className="sm:hidden">Western</span>
            <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">{Object.keys(WESTERN_SCALES).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="raga" className="flex items-center gap-2 text-sm md:text-base data-[state=active]:glow-accent data-[state=active]:bg-primary/10 transition-all duration-300 hover:bg-primary/5">
            <Globe className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Indian Ragas</span>
            <span className="sm:hidden">Ragas</span>
            <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">{Object.keys(RAGA_SCALES).length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={scaleCategory} className="mt-8">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Enhanced Controls */}
          <div className="lg:col-span-1">
            <Card className="glass-card rounded-2xl shadow-lg sticky top-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2 text-center text-gradient">
                  <Info className="w-5 h-5 text-primary" />
                  Scale Selection
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose your musical parameters
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Root Note
                  </label>
                  <Select value={rootNote} onValueChange={setRootNote}>
                    <SelectTrigger className="h-11 bg-background/80 border-primary/20 hover:border-primary/40 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTES.map((note) => (
                        <SelectItem key={note} value={note} className="font-mono">
                          {note}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scale Search */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    {scaleCategory === "western" ? "Western Scale" : "Raga"}
                  </label>
                  <div className="relative">
                    <Input
                      placeholder={`Search ${scaleCategory === "western" ? "scales" : "ragas"}...`}
                      value={scaleSearchQuery}
                      onChange={(e) => setScaleSearchQuery(e.target.value)}
                      className="h-11 bg-background/80 border-primary/20 hover:border-primary/40 pr-10 transition-colors"
                    />
                    {scaleSearchQuery && (
                      <button
                        onClick={() => setScaleSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Scale List - Scrollable */}
                  <ScrollArea className="h-64 border border-border/50 rounded-lg p-3 bg-background/40">
                    <div className="space-y-2">
                      {filteredScales.length > 0 ? (
                        filteredScales.map((scale) => (
                          <Button
                            key={scale}
                            onClick={() => {
                              setSelectedScale(scale);
                              setScaleSearchQuery("");
                            }}
                            variant={selectedScale === scale ? "default" : "ghost"}
                            className={`w-full justify-start text-left transition-all ${
                              selectedScale === scale
                                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                                : "hover:bg-primary/10"
                            }`}
                          >
                            <span className="truncate">{scale}</span>
                            {selectedScale === scale && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto" />
                            )}
                          </Button>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No scales found
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Category Filter for Western Scales */}
                {scaleCategory === "western" && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <label className="text-sm font-semibold">Filter by Type</label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setSelectedCategory(null)}
                        variant={selectedCategory === null ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        All
                      </Button>
                      {["mode", "pentatonic", "blues", "exotic"].map((cat) => (
                        <Button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          variant={selectedCategory === cat ? "default" : "outline"}
                          size="sm"
                          className="text-xs capitalize"
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {scaleCategory === "raga" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Music2 className="w-4 h-4" />
                      Indian Notation
                    </label>
                    <Select value={indianNotationType} onValueChange={setIndianNotationType}>
                      <SelectTrigger className="h-11 bg-background/80 border-primary/20 hover:border-primary/40 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English (S, r, R...)</SelectItem>
                        <SelectItem value="devanagari">Devanagari (सा, रे...)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="pt-4 border-t border-border/50">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-1 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="text-2xl font-bold text-primary">
                        {getScaleNotes.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Notes</div>
                    </div>
                    <div className="space-y-1 p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="text-2xl font-bold text-accent">
                        {scaleData?.intervals.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Intervals</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Scale Information */}
          <div className="lg:col-span-2">
            <div className="grid gap-6">
              {/* Enhanced Scale Display */}
              <Card className="glass-card rounded-2xl shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                      <Music className="w-5 h-5 text-primary" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {rootNote} {selectedScale}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {scaleCategory === "western" ? "Western scale with comprehensive theory" : "Indian raga with traditional context"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary" />
                      <div className="text-sm font-semibold">Western Notation</div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {getScaleNotes.map((note, index) => (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={`note-chip inline-flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-sm font-mono shadow-md animate-scale-in transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${NOTE_COLORS[note as keyof typeof NOTE_COLORS]}`}
                                style={{ animationDelay: `${index * 50}ms` }}
                                aria-pressed={false}
                                aria-label={`Note ${note}, degree ${index + 1}`}
                                title={`${note} • Scale degree ${index + 1}`}
                                onClick={() => {
                                  const noteFreq = 440 * Math.pow(2, (NOTES.indexOf(note) - 9) / 12);
                                  playNote(noteFreq);
                                  setLastPlayed(note);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === ' ' || e.key === 'Enter') {
                                    e.preventDefault();
                                    const noteFreq = 440 * Math.pow(2, (NOTES.indexOf(note) - 9) / 12);
                                    playNote(noteFreq);
                                    setLastPlayed(note);
                                  }
                                }}
                              >
                                <span className="text-lg font-bold leading-none">{note}</span>
                                <span className="text-xs opacity-90 leading-none">°{index + 1}</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-center">
                                <div className="font-semibold">{note}</div>
                                <div className="text-xs text-muted-foreground">
                                  Scale degree {index + 1}
                                </div>
                                <div className="text-xs mt-1 opacity-75">Click to play</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>

                  {scaleCategory === "raga" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-accent" />
                        <div className="text-sm font-semibold">Indian Notation</div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {getIndianNotation.map((note, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className={`note-chip inline-flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-sm font-mono shadow-md animate-scale-in transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${NOTE_COLORS[getScaleNotes[index] as keyof typeof NOTE_COLORS]}`}
                                  style={{ animationDelay: `${index * 50}ms` }}
                                  aria-pressed={false}
                                  aria-label={`Indian note ${note}, degree ${index + 1}`}
                                  title={`${note} • Scale degree ${index + 1}`}
                                  onClick={() => {
                                    const noteFreq = 440 * Math.pow(2, (NOTES.indexOf(getScaleNotes[index]) - 9) / 12);
                                    playNote(noteFreq);
                                    setLastPlayed(getScaleNotes[index]);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === ' ' || e.key === 'Enter') {
                                      e.preventDefault();
                                      const noteFreq = 440 * Math.pow(2, (NOTES.indexOf(getScaleNotes[index]) - 9) / 12);
                                      playNote(noteFreq);
                                      setLastPlayed(getScaleNotes[index]);
                                    }
                                  }}
                                >
                                  <span className="text-lg font-bold leading-none">{note}</span>
                                  <span className="text-xs opacity-90 leading-none">°{index + 1}</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <div className="font-semibold">{note}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Scale degree {index + 1}
                                  </div>
                                  <div className="text-xs mt-1 opacity-75">Click to play</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/50">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-primary" />
                        <div className="text-sm font-semibold">Scale Formula</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {scaleData?.intervals.map((interval, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-3 py-1 border-primary/30 bg-primary/5">
                            {interval}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {scaleCategory === "western" && scaleData && "chords" in scaleData && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Music2 className="w-4 h-4 text-accent" />
                          <div className="text-sm font-semibold">Common Chords</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(scaleData as WesternScaleData).chords.map((chord: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs px-3 py-1 border-accent/30 bg-accent/5">
                              {chord}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Scale Details */}
              <Card className="glass-card rounded-2xl shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Scale Information
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Detailed musical context and characteristics
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <div className="text-sm font-semibold">Description</div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {scaleData?.description}
                      </p>
                    </div>

                    {scaleCategory === "western" && scaleData && "usage" in scaleData && (
                      <div className="space-y-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-accent" />
                          <div className="text-sm font-semibold">Common Usage</div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {scaleData.usage}
                        </p>
                      </div>
                    )}

                    {scaleCategory === "raga" && scaleData && "time" in scaleData && (
                      <div className="space-y-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-400 to-red-500"></div>
                          <div className="text-sm font-semibold">Performance Time</div>
                        </div>
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 w-fit">
                          {(scaleData as RagaScaleData).time}
                        </Badge>
                      </div>
                    )}

                    {scaleCategory === "raga" && scaleData && "mood" in scaleData && (
                      <div className="space-y-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"></div>
                          <div className="text-sm font-semibold">Mood & Character</div>
                        </div>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 w-fit">
                          {(scaleData as RagaScaleData).mood}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {scaleCategory === "raga" && scaleData && "aroha" in scaleData && (
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-primary" />
                        <div className="text-sm font-semibold">Traditional Structure</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="text-sm font-medium text-primary flex items-center gap-2">
                            <span className="text-lg">↑</span>
                            Aroha (Ascending)
                          </div>
                          <div className="font-mono text-sm text-foreground/90">
                            {(scaleData as RagaScaleData).aroha}
                          </div>
                        </div>
                        <div className="space-y-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
                          <div className="text-sm font-medium text-accent flex items-center gap-2">
                            <span className="text-lg">↓</span>
                            Avaroha (Descending)
                          </div>
                          <div className="font-mono text-sm text-foreground/90">
                            {(scaleData as RagaScaleData).avaroha}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Enhanced Visual Representations */}
        <div className="lg:col-span-3 space-y-8">
          {/* Enhanced Chromatic Circle */}
          <Card className="glass-card rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                  <Disc className="w-5 h-5 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Chromatic Circle Visualization
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Interactive circle showing scale relationships - hover for details
              </p>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                  {/* Outer circle for visual reference */}
                  <div className="absolute inset-0 rounded-full border-2 border-border/30"></div>

                  {NOTES.map((note, index) => {
                    const angle = (index * 30 - 90) * (Math.PI / 180);
                    const radius = 45;
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);
                    const isInScale = getScaleNotes.includes(note);
                    const isRoot = note === rootNote;

                    return (
                      <Tooltip key={note}>
                        <TooltipTrigger asChild>
                          <button
                            key={note}
                            type="button"
                            className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 hover:scale-110 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                              isRoot
                                ? "gradient-accent text-primary-foreground shadow-lg shadow-primary/50 scale-125 animate-glow-pulse ring-2 ring-primary/50"
                                : isInScale
                                ? `${NOTE_COLORS[note as keyof typeof NOTE_COLORS]} border-2 border-white/20 shadow-md`
                                : "bg-gray-400 hover:bg-gray-500 text-white"
                            }`}
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                            aria-pressed={isRoot}
                            aria-label={`Note ${note} — ${isRoot ? "Root note" : isInScale ? "In scale" : "Not in scale"}`}
                            onClick={() => setRootNote(note)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setRootNote(note);
                              }
                            }}
                          >
                            {note}
                          </button>

                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-center">
                            <div className="font-semibold">{note}</div>
                            <div className="text-xs text-muted-foreground">
                              {isRoot ? "Root note" : isInScale ? "In scale" : "Not in scale"}
                            </div>
                            <div className="text-xs mt-1">Click to set as root</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Fretboard Scale Visualization */}
          <Card className="glass-card rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg">
                  <Guitar className="w-5 h-5 text-accent" />
                </div>
                <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  Guitar Fretboard Pattern
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Clean fretboard showing only scale notes with chromatic colors - centered and visually appealing
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="relative bg-gradient-to-b from-neutral-950 to-neutral-900 p-6 rounded-lg border-2 border-border/50 shadow-inner">
                  {/* Fretboard grid */}
                  <div className="relative pb-4" style={{ width: '560px', height: '320px' }}>
                    {/* Strings (horizontal lines) */}
                    {Array.from({ length: 6 }, (_, stringIndex) => (
                      <div
                        key={stringIndex}
                        className="absolute w-full h-0.5 bg-neutral-700 shadow-inner"
                        style={{ top: `${stringIndex * 40 + 20}px` }}
                      ></div>
                    ))}

                    {/* Frets (vertical lines) */}
                    {Array.from({ length: 13 }, (_, fretIndex) => {
                      const isHighlight = [3, 5, 7, 9, 12].includes(fretIndex);
                      return (
                        <div key={fretIndex}>
                          <div
                            className={`absolute h-full w-0.5 ${fretIndex === 0 ? 'bg-neutral-600' : 'bg-neutral-700'} shadow-inner`}
                            style={{ left: `${fretIndex * 40}px` }}
                          ></div>
                          {isHighlight && (
                            <div
                              className="absolute h-full w-px bg-accent/20"
                              style={{ left: `${fretIndex * 40}px` }}
                            ></div>
                          )}
                        </div>
                      );
                    })}

                    {/* Fret markers (moved slightly up so numbers sit inside the card) */}
                    <div
                      className="absolute left-0 right-0 flex justify-center"
                      style={{ bottom: '14px', pointerEvents: 'none' }} // numbers are non-interactive
                    >
                      {Array.from({ length: 13 }, (_, i) => {
                        const isDoubleDot = [3, 5, 7, 9, 12].includes(i);
                        return (
                          <div key={i} className="flex flex-col items-center" style={{ width: '40px' }}>
                            <div className={`w-3 h-3 rounded-full ${isDoubleDot ? 'bg-neutral-600' : 'bg-neutral-700'}`}></div>
                            {isDoubleDot && (
                              <div className="w-3 h-3 bg-neutral-600 rounded-full mt-1"></div>
                            )}
                            <div className="text-[10px] text-muted-foreground/70 mt-1" style={{ marginTop: '6px' }}>{i}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Notes */}
                    {Array.from({ length: 6 }, (_, stringIndex) => {
                      const stringNotes = ["E", "A", "D", "G", "B", "E"];
                      const openNote = stringNotes[stringIndex];
                      const openNoteIndex = NOTES.indexOf(openNote);

                      return Array.from({ length: 13 }, (_, fretIndex) => {
                        const noteIndex = (openNoteIndex + fretIndex) % 12;
                        const note = NOTES[noteIndex];
                        const isInScale = getScaleNotes.includes(note);
                        const isRoot = note === rootNote;

                        if (!isInScale && !isRoot) return null;

                        // Calculate scale degree
                        const scaleDegree = getScaleNotes.indexOf(note) + 1;
                        const chromaticColor = NOTE_COLORS[note as keyof typeof NOTE_COLORS];
                        const intersectionX = fretIndex * 40;
                        const intersectionY = stringIndex * 40 + 20;

                        return (
                          <TooltipProvider key={`${stringIndex}-${fretIndex}`}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`absolute group transition-all duration-200 cursor-pointer hover:scale-125 ${
                                    isRoot
                                      ? "z-20"
                                      : "z-10"
                                  }`}
                                  style={{
                                    left: `${intersectionX}px`,
                                    top: `${intersectionY}px`,
                                  }}
                                >
                                  <div
                                    className={`relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-all duration-200 ${
                                      isRoot
                                        ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white ring-3 ring-yellow-400/50 scale-125 animate-pulse"
                                        : `${chromaticColor} text-white shadow-md hover:shadow-xl`
                                    }`}
                                    style={{
                                      transform: isRoot ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%)',
                                    }}
                                  >
                                    {note}
                                  </div>
                                  {/* Degree indicator - positioned above the note */}
                                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary/80 text-white text-xs font-bold py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    °{scaleDegree}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <div className="font-semibold">{note} (Fret {fretIndex})</div>
                                  <div className="text-xs text-muted-foreground">
                                    String: {stringNotes[stringIndex]}
                                  </div>
                                  <div className="text-xs mt-1 font-medium">Scale degree °{scaleDegree}</div>
                                  {isRoot && <div className="text-xs mt-1 text-yellow-400">Root note</div>}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      });
                    })}
                  </div>

                  {/* String labels (aligned exactly to string lines) */}
                  <div className="absolute -left-12 top-0 text-xs text-muted-foreground font-mono">
                    {["E", "A", "D", "G", "B", "E"].map((note, index) => (
                      <div
                        key={index}
                        className="absolute flex items-center justify-end text-right"
                        style={{
                          top: `${index * 40 + 20}px`,
                          transform: 'translateY(-50%)',     // exact centering
                          // tiny horizontal nudge so the label visually aligns with the left of the string
                          // preserve right alignment so existing selectors/classnames still match
                          marginRight: '6px',
                          width: '36px'
                        }}
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </TabsContent>
      </Tabs>
      </div>
      <div id="sr-announcer" aria-live="polite" className="sr-only">{lastPlayed ? `Played ${lastPlayed}` : ''}</div>
    </div>
  );

};

export default ScaleExplorer;
