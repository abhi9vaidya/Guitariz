import fs from 'fs';
import path from 'path';

const routes = [
  {
    url: '/',
    title: 'Guitariz - Chord AI Free, Music Theory & Studio Tools',
    description: 'The ultimate free music studio: Chord AI, vocal splitter, interactive fretboard, Circle of Fifths, and more. No subscription required.',
    canonical: 'https://guitariz.studio/',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Guitariz Studio',
      url: 'https://guitariz.studio/',
      description: 'Professional music theory and AI analysis tools for musicians.',
      applicationCategory: 'MusicApplication',
      operatingSystem: 'Web'
    })
  },
  {
    url: '/chord-ai',
    title: 'Chord AI Free - Audio to Chord Recognition & Music Theory | Guitariz',
    description: 'Extract chords, tempo, and scales from any song for free. Advanced AI chord recognition and harmonic transcription with no subscription.',
    canonical: 'https://guitariz.studio/chord-ai',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Chord AI - Guitariz',
      url: 'https://guitariz.studio/chord-ai',
      description: 'Advanced Chord AI: Extract chords, tempo, and scales from audio using neural networks.',
      inLanguage: 'en-US'
    })
  },
  {
    url: '/vocal-splitter',
    title: 'AI Vocal Splitter - Stem Separation for Karaoke & Practice | Guitariz',
    description: 'Separate vocals and instrumentals from any song using advanced AI. High-quality stem extraction for karaoke, remixing, and practice.',
    canonical: 'https://guitariz.studio/vocal-splitter',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Guitariz Vocal Splitter',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      description: 'High-quality AI stem extraction for karaoke and remixing.',
      url: 'https://guitariz.studio/vocal-splitter',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    })
  },
  {
    url: '/fretboard',
    title: 'Interactive Guitar Fretboard & Scale Explorer | Guitariz',
    description: 'Master guitar theory with our interactive fretboard. Visualize scales, chords, and notes across the neck. Perfect for guitarists of all levels.',
    canonical: 'https://guitariz.studio/fretboard',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Interactive Fretboard - Guitariz',
      url: 'https://guitariz.studio/fretboard',
      description: 'Interactive guitar fretboard for learning scales, chords, and music theory.',
      inLanguage: 'en-US'
    })
  },
  {
    url: '/chords',
    title: 'Guitar Chord Library - 1000+ Diagrams & Voicings | Guitariz',
    description: 'Explore a comprehensive guitar chord library. Detailed diagrams, finger positions, and interactive voicings for every level.',
    canonical: 'https://guitariz.studio/chords',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Guitar Chord Library - Guitariz',
      url: 'https://guitariz.studio/chords',
      description: 'Comprehensive guitar chord library with interactive diagrams.',
      inLanguage: 'en-US'
    })
  },
  {
    url: '/scales',
    title: 'Guitar Scale Explorer - Interactive Scale Patterns & Modes | Guitariz',
    description: 'Explore guitar scales and modes visually. Interactive patterns for major, minor, pentatonic, and exotic scales.',
    canonical: 'https://guitariz.studio/scales',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Guitar Scale Explorer - Guitariz',
      url: 'https://guitariz.studio/scales',
      description: 'Interactive guitar scale explorer for learning scale patterns and improvisation.',
      inLanguage: 'en-US'
    })
  },
  {
    url: '/theory',
    title: 'Interactive Circle of Fifths - Music Theory Lab | Guitariz',
    description: 'Master functional harmony with our interactive Circle of Fifths. Visualize key relationships, modulations, and chord families.',
    canonical: 'https://guitariz.studio/theory',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Guitariz Theory Lab',
      applicationCategory: 'MusicApplication',
      operatingSystem: 'Web',
      description: 'Interactive music theory tools featuring the Circle of Fifths.',
      url: 'https://guitariz.studio/theory',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    })
  },
  {
    url: '/metronome',
    title: 'Online Metronome & High-Precision Timing | Guitariz',
    description: 'Free online metronome for precise timing. Adjustable tempo, time signatures, and visual pulse for musicians.',
    canonical: 'https://guitariz.studio/metronome',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Online Metronome - Guitariz',
      url: 'https://guitariz.studio/metronome',
      description: 'Free online metronome with adjustable tempo and time signatures.',
      inLanguage: 'en-US'
    })
  },
  {
    url: '/tuner',
    title: 'Online Guitar Tuner - Chromatic Tuning Precision | Guitariz',
    description: 'Free online chromatic tuner for guitar, bass, and other instruments. High-precision pitch detection.',
    canonical: 'https://guitariz.studio/tuner',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Online Tuner - Guitariz',
      url: 'https://guitariz.studio/tuner',
      description: 'Professional online chromatic tuner with high-precision detection.',
      inLanguage: 'en-US'
    })
  },
  {
    url: '/ear-training',
    title: 'Ear Training - Level Up Your Musical Hearing | Guitariz',
    description: 'Gamified ear training for intervals, chords, and pitch recognition. Improve your musicality with our interactive tools.',
    canonical: 'https://guitariz.studio/ear-training',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Ear Training - Guitariz',
      url: 'https://guitariz.studio/ear-training',
      description: 'Interactive ear training tools for musicians.',
      inLanguage: 'en-US'
    })
  }
];

const distDir = path.resolve(process.cwd(), 'dist');
const srcIndexPath = path.resolve(distDir, 'index.html');

if (!fs.existsSync(srcIndexPath)) {
  console.error('dist/index.html not found. Run `vite build` first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(srcIndexPath, 'utf8');

for (const r of routes) {
  const outDir = path.join(distDir, r.url.replace(/^\//, ''));
  const outIndex = path.join(outDir, 'index.html');

  let html = baseHtml;

  // Replace title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${r.title}</title>`);

  // Inject/replace meta description
  if (/meta name="description"/i.test(html)) {
    html = html.replace(/<meta name="description"[\s\S]*?>/i, `<meta name="description" content="${r.description}" />`);
  } else {
    html = html.replace('</head>', `  <meta name="description" content="${r.description}" />\n</head>`);
  }

  // Replace canonical link
  if (/rel="canonical"/i.test(html)) {
    html = html.replace(/<link rel="canonical"[\s\S]*?>/i, `<link rel="canonical" href="${r.canonical}" />`);
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${r.canonical}" />\n</head>`);
  }

  // Replace og:url and og:title/description
  if (/property="og:url"/i.test(html)) {
    html = html.replace(/<meta property="og:url"[\s\S]*?>/i, `<meta property="og:url" content="${r.canonical}" />`);
  }
  if (/property="og:title"/i.test(html)) {
    html = html.replace(/<meta property="og:title"[\s\S]*?>/i, `<meta property="og:title" content="${r.title}" />`);
  }
  if (/property="og:description"/i.test(html)) {
    html = html.replace(/<meta property="og:description"[\s\S]*?>/i, `<meta property="og:description" content="${r.description}" />`);
  }

  // Insert page-specific JSON-LD before </head>
  const ldScript = `  <script type="application/ld+json">${r.jsonLd}</script>`;
  html = html.replace('</head>', `${ldScript}\n</head>`);

  // Ensure og:image uses logo2.png (black background)
  if (/property="og:image"/i.test(html)) {
    html = html.replace(/<meta property="og:image"[\s\S]*?>/i, `<meta property="og:image" content="https://guitariz.studio/logo2.png" />`);
  } else {
    html = html.replace('</head>', `  <meta property="og:image" content="https://guitariz.studio/logo2.png" />\n</head>`);
  }

  // Ensure twitter image
  if (/name="twitter:image"/i.test(html)) {
    html = html.replace(/<meta name="twitter:image"[\s\S]*?>/i, `<meta name="twitter:image" content="https://guitariz.studio/logo2.png" />`);
  } else {
    html = html.replace('</head>', `  <meta name="twitter:image" content="https://guitariz.studio/logo2.png" />\n</head>`);
  }

  // Write out
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outIndex, html, 'utf8');
  console.log(`Wrote prerendered page: ${outIndex}`);
}

console.log('Prerender completed for routes:', routes.map(r => r.url).join(', '));
