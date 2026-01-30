import fs from 'fs';
import path from 'path';

const routes = [
  {
    url: '/chord-ai',
    title: 'Chord AI Free - Neural Audio Transcription & Harmonic Mapping | Guitariz',
    description:
      'The best Chord AI Free: Extract chords, tempo, and scales from any audio file using neural networks. High-precision harmonic transcription with no subscription.',
    canonical: 'https://guitariz.studio/chord-ai',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Chord AI - Guitariz',
      url: 'https://guitariz.studio/chord-ai',
      description:
        'Advanced Chord AI: Extract chords, tempo, and scales from audio using neural networks.',
      inLanguage: 'en-US'
    })
  },
  {
    url: '/vocal-splitter',
    title: 'AI Vocal Splitter | Guitariz - Stem Separation',
    description: 'Separate vocals from any song using advanced AI. High-quality stem extraction for karaoke, remixing, and practice.',
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
    title: 'Interactive Guitar Fretboard | Guitariz - Learn Guitar Theory',
    description: 'Master guitar theory with our interactive fretboard. Visualize scales, chords, and notes across the entire neck. Perfect for beginners and advanced players.',
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
    title: 'Guitar Chord Library | Guitariz - 1000+ Chord Diagrams',
    description: 'Complete guitar chord library with diagrams and finger positions. Learn major, minor, 7th, sus, and advanced jazz chords. Free chord dictionary for all levels.',
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
    title: 'Guitar Scale Explorer | Guitariz - Interactive Scale Patterns',
    description: 'Explore guitar scales visually. Major, minor, pentatonic, blues, modes, and exotic scales with interactive fretboard diagrams. Master improvisation and soloing.',
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
    url: '/metronome',
    title: 'Online Metronome | Guitariz - Free Practice Tool',
    description: 'Free online metronome for musicians. Adjustable tempo, time signatures, and sound options. Perfect for practice, recording, and building rhythm skills.',
    canonical: 'https://guitariz.studio/metronome',
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Online Metronome - Guitariz',
      url: 'https://guitariz.studio/metronome',
      description: 'Free online metronome with adjustable tempo and time signatures.',
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
