// The catalogue is data, not markup: one entry per real, deployed game.
// Every URL here was checked against the live site or GitHub release.

import releaseData from './releases.json'

export type Category =
  | 'Puzzle'
  | 'Relaxing'
  | 'Logic'
  | 'Strategy'
  | 'Arcade'
  | 'Physics'
  | 'Brain Training'
  | 'Casual'

export type Runtime =
  | 'Phaser 4'
  | 'Phaser 3'
  | 'React 19'
  | 'Unity WebGL'
  | 'Babylon.js'
  | 'PixiJS 8'
  | 'Three.js'
  | 'Godot 4'

export interface DownloadLink {
  label: string
  platform: 'macOS' | 'Windows' | 'Linux'
  url: string
  note?: string
}

export interface Game {
  id: string
  name: string
  tagline: string
  description: string
  categories: Category[]
  runtime: Runtime
  version: string
  updated: string
  status: 'live' | 'coming-soon'
  featured?: boolean
  playUrl: string
  /** Preferred host for this game. Probed at play time; falls back to playUrl. */
  preferredPlayUrl?: string
  siteUrl: string
  repoUrl: string
  releasesUrl: string
  downloads: DownloadLink[]
  cover: { from: string; to: string; emoji: string }
  highlights: string[]
  howToPlay: string[]
  levels: string
  saveKey: string
}

const repo = (id: string) => `https://github.com/jd4rider/${id}`

export const GAMES: Game[] = [
  {
    id: 'bubblewrap',
    name: 'Bubble Wrap',
    tagline: 'A whole sheet of tiny, satisfying pops.',
    description:
      'A 12 × 9 sheet of bubble wrap you can pop by tapping or dragging. Classic mode is pure zen; Journey mode adds five timed levels, coins and three power-ups. Each pop is synthesised with the Web Audio API — there are no audio files — and phones that expose the Vibration API get a tiny haptic tick.',
    categories: ['Relaxing', 'Casual', 'Arcade'],
    runtime: 'React 19',
    version: '0.2.1',
    updated: '2026-11-02',
    status: 'live',
    featured: true,
    playUrl: 'https://bubblewrapgame.online/play/',
    siteUrl: 'https://bubblewrapgame.online/',
    repoUrl: repo('bubble-wrap'),
    releasesUrl: `${repo('bubble-wrap')}/releases`,
    downloads: [
      {
        label: 'macOS (Apple Silicon)',
        platform: 'macOS',
        url: 'https://github.com/jd4rider/bubble-wrap/releases/download/v0.2.1/Bubble-Wrap-mac-arm64.dmg',
      },
      {
        label: 'macOS (Intel)',
        platform: 'macOS',
        url: 'https://github.com/jd4rider/bubble-wrap/releases/download/v0.2.1/Bubble-Wrap-mac-x64.dmg',
      },
      {
        label: 'Windows installer',
        platform: 'Windows',
        url: 'https://github.com/jd4rider/bubble-wrap/releases/download/v0.2.1/Bubble-Wrap-win-setup.exe',
      },
    ],
    cover: { from: '#38bdf8', to: '#2563eb', emoji: '🫧' },
    highlights: [
      'Classic full-sheet mode plus a five-level Journey with stars, coins and power-ups',
      'Haptic pops on devices that support the Vibration API',
      'Desktop saves live in SQLite; the web build uses IndexedDB with a localStorage fallback',
      'Installable on macOS via Homebrew cask and on Windows via PowerShell',
    ],
    howToPlay: [
      'Tap or drag across the sheet to pop bubbles.',
      'In Journey mode, beat the bubble target before the timer runs out.',
      'Spend coins on Burst, Chain and Time Boost between levels.',
    ],
    levels: 'Classic sheet + 5 Journey levels',
    saveKey: 'bubble-wrap-save-v2',
  },
  {
    id: 'pipe-dreams',
    name: 'Pipe Dreams',
    tagline: 'Turn the pipes. Guide the water.',
    description:
      'A rotating-pipe puzzle where water has to reach the OUT valve. Grids grow from 4 × 4 to 9 × 9, then add tees, crosses, brick walls and bolted pipes that cannot move. Finish at or under par for three stars.',
    categories: ['Puzzle', 'Relaxing', 'Logic'],
    runtime: 'Phaser 4',
    version: '0.2.1',
    updated: '2026-11-02',
    status: 'live',
    featured: true,
    playUrl: 'https://jd4rider.github.io/pipe-dreams/play/',
    preferredPlayUrl: 'https://pipe-dreams.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/pipe-dreams/',
    repoUrl: repo('pipe-dreams'),
    releasesUrl: `${repo('pipe-dreams')}/releases`,
    downloads: [
      { label: 'macOS (Apple Silicon)', platform: 'macOS', url: 'https://github.com/jd4rider/pipe-dreams/releases/download/v0.2.1/Pipe-Dreams-mac-arm64.dmg' },
      { label: 'macOS (Intel)', platform: 'macOS', url: 'https://github.com/jd4rider/pipe-dreams/releases/download/v0.2.1/Pipe-Dreams-mac-x64.dmg' },
      { label: 'Windows installer', platform: 'Windows', url: 'https://github.com/jd4rider/pipe-dreams/releases/download/v0.2.1/Pipe-Dreams-win-setup.exe' },
      { label: 'Linux AppImage', platform: 'Linux', url: 'https://github.com/jd4rider/pipe-dreams/releases/download/v0.2.1/Pipe-Dreams-linux-x86_64.AppImage' },
    ],
    cover: { from: '#0ea5e9', to: '#0c4a6e', emoji: '🔧' },
    highlights: [
      '60 levels across five worlds, plus a 90-second Rush mode',
      'Wrap-around edge pipes and flowing water effects added in v0.2.0',
      'Brick walls and bolted pipes keep later levels honest',
      'Par-based star scoring with hints and resets',
    ],
    howToPlay: [
      'Tap a pipe to turn it a quarter turn.',
      'Connect IN to OUT so the water can flow all the way through.',
      'Pipes marked with a bolt are fixed — route around them.',
    ],
    levels: '60 levels · 5 worlds + Rush',
    saveKey: 'pipe-dreams-save-v1',
  },
  {
    id: 'jewel-match',
    name: 'Jewel Match',
    tagline: 'Swap, sparkle, cascade.',
    description:
      'A match-3 with real depth: line gems, bombs, stars and rainbows appear from the shapes you build. Journey mode plots 48 levels across six regions with score, collect and timed goals; Classic, Timed Blitz and Zen round out the set.',
    categories: ['Puzzle', 'Casual', 'Brain Training'],
    runtime: 'Phaser 4',
    version: '0.3.2',
    updated: '2026-11-02',
    status: 'live',
    featured: true,
    playUrl: 'https://jd4rider.github.io/jewel-match/play/',
    preferredPlayUrl: 'https://jewel-match.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/jewel-match/',
    repoUrl: repo('jewel-match'),
    releasesUrl: `${repo('jewel-match')}/releases`,
    downloads: [
      { label: 'macOS (Apple Silicon)', platform: 'macOS', url: 'https://github.com/jd4rider/jewel-match/releases/download/v0.3.2/Jewel-Match-mac-arm64.dmg' },
      { label: 'macOS (Intel)', platform: 'macOS', url: 'https://github.com/jd4rider/jewel-match/releases/download/v0.3.2/Jewel-Match-mac-x64.dmg' },
      { label: 'Windows installer', platform: 'Windows', url: 'https://github.com/jd4rider/jewel-match/releases/download/v0.3.2/Jewel-Match-win-setup.exe' },
      { label: 'Linux AppImage', platform: 'Linux', url: 'https://github.com/jd4rider/jewel-match/releases/download/v0.3.2/Jewel-Match-linux-x86_64.AppImage' },
    ],
    cover: { from: '#a855f7', to: '#4c1d95', emoji: '💎' },
    highlights: [
      'Four modes: Journey, Classic, Timed Blitz and Zen',
      'Line gems, bombs, stars and rainbow gems from 4-in-a-row, L/T and 2 × 2 shapes',
      'Five power-ups: Hammer, Bomb, Zap, Shuffle and Extra moves',
      '48 Journey levels over six regions with three-star ratings',
    ],
    howToPlay: [
      'Swap two neighbouring gems to line up three or more.',
      'Build four in a line for a line gem, an L or T for a bomb, a 2 × 2 for a star.',
      'Swap two specials together for a much bigger blast.',
    ],
    levels: '48 Journey levels · 6 regions',
    saveKey: 'jewel-match-save-v2',
  },
  {
    id: 'pixel-stitch',
    name: 'Pixel Stitch',
    tagline: 'Numbered clues, hidden pictures.',
    description:
      'A nonogram (picross) game where the numbers beside each row and above each column describe a hidden picture. Twenty-four starter patterns are verified to be solvable with pure line logic — no guessing. Paint your own design and share it as a short code.',
    categories: ['Puzzle', 'Logic', 'Brain Training'],
    runtime: 'Phaser 4',
    version: '0.1.1',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/pixel-stitch/play/',
    preferredPlayUrl: 'https://pixel-stitch.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/pixel-stitch/',
    repoUrl: repo('pixel-stitch'),
    releasesUrl: `${repo('pixel-stitch')}/releases`,
    downloads: [
      {
        label: 'macOS (Apple Silicon)',
        platform: 'macOS',
        url: 'https://github.com/jd4rider/pixel-stitch/releases/download/v0.1.1/Pixel-Stitch-mac-arm64.dmg',
      },
      {
        label: 'macOS (Intel)',
        platform: 'macOS',
        url: 'https://github.com/jd4rider/pixel-stitch/releases/download/v0.1.1/Pixel-Stitch-mac-x64.dmg',
      },
      {
        label: 'Windows installer',
        platform: 'Windows',
        url: 'https://github.com/jd4rider/pixel-stitch/releases/download/v0.1.1/Pixel-Stitch-win-setup.exe',
      },
      {
        label: 'Linux AppImage',
        platform: 'Linux',
        url: 'https://github.com/jd4rider/pixel-stitch/releases/download/v0.1.1/Pixel-Stitch-linux-x86_64.AppImage',
      },
    ],
    cover: { from: '#f472b6', to: '#831843', emoji: '🧵' },
    highlights: [
      '24 starter puzzles across four packs, from 5 × 5 to 10 × 10',
      'Every puzzle verified solvable by line logic in the test suite',
      'Paint-and-share editor with short PS1 share codes',
      'Drag to fill, tap to clear, and auto-crossed leftovers',
    ],
    howToPlay: [
      'Read each clue as ordered groups: "3 2" means three filled, a gap, then two.',
      'Tap or drag to fill squares; tap again to clear them.',
      'Switch to Mark (or right-click) to cross out squares you know are empty.',
    ],
    levels: '24 patterns · 4 packs + editor',
    saveKey: 'pixel-stitch-save-v1',
  },
  {
    id: 'sand-sort-studio',
    name: 'Sand Sort Studio',
    tagline: 'Pour, stack, sort every colour.',
    description:
      'A pour-sorting puzzle with 60 levels across five worlds. Twin flasks hold two colours, padlocked flasks open once enough are sealed, and chameleon sand changes colour every time it moves. Rush mode gives you 120 seconds and buys more time for each solve.',
    categories: ['Puzzle', 'Relaxing', 'Logic'],
    runtime: 'Phaser 4',
    version: '0.1.2',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/sand-sort-studio/play/',
    preferredPlayUrl: 'https://sand-sort-studio.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/sand-sort-studio/',
    repoUrl: repo('sand-sort-studio'),
    releasesUrl: `${repo('sand-sort-studio')}/releases`,
    downloads: [
      { label: 'macOS (Apple Silicon)', platform: 'macOS', url: 'https://github.com/jd4rider/sand-sort-studio/releases/download/v0.1.2/Sand-Sort-Studio-mac-arm64.dmg' },
      { label: 'macOS (Intel)', platform: 'macOS', url: 'https://github.com/jd4rider/sand-sort-studio/releases/download/v0.1.2/Sand-Sort-Studio-mac-x64.dmg' },
      { label: 'Windows installer', platform: 'Windows', url: 'https://github.com/jd4rider/sand-sort-studio/releases/download/v0.1.2/Sand-Sort-Studio-win-setup.exe' },
      { label: 'Linux AppImage', platform: 'Linux', url: 'https://github.com/jd4rider/sand-sort-studio/releases/download/v0.1.2/Sand-Sort-Studio-linux-x86_64.AppImage' },
    ],
    cover: { from: '#fbbf24', to: '#b45309', emoji: '🏖️' },
    highlights: [
      '60 levels across five worlds, plus a 120-second Rush mode',
      'Twin flasks, padlocked flasks and colour-changing chameleon sand',
      'Free hint, undo and reset on every level',
      'Ghost-sand rendering bug fixed in v0.1.1',
    ],
    howToPlay: [
      'Tap a flask, then another, to pour its top colour across.',
      'You can pour onto an empty flask or onto the same colour.',
      'A flask holding one colour is sealed — fill them all to win.',
    ],
    levels: '60 levels · 5 worlds + Rush',
    saveKey: 'sand-sort-save-v1',
  },
  {
    id: 'lighthouse-keeper',
    name: 'Lighthouse Keeper',
    tagline: 'Light the coast. Keep the reef dark.',
    description:
      'Rotate lighthouses, flip mirrors and tint lenses so every buoy is lit in the colour it asks for — while every forbidden reef marker stays untouched. A night-coast puzzle about routing light rather than water.',
    categories: ['Puzzle', 'Logic', 'Strategy'],
    runtime: 'Phaser 4',
    version: '0.1.1',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/lighthouse-keeper/play/',
    preferredPlayUrl: 'https://lighthouse-keeper.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/lighthouse-keeper/',
    repoUrl: repo('lighthouse-keeper'),
    releasesUrl: `${repo('lighthouse-keeper')}/releases`,
    downloads: [
      {
        label: 'macOS (Apple Silicon)',
        platform: 'macOS',
        url: 'https://github.com/jd4rider/lighthouse-keeper/releases/download/v0.1.1/Lighthouse-Keeper-mac-arm64.dmg',
      },
      {
        label: 'macOS (Intel)',
        platform: 'macOS',
        url: 'https://github.com/jd4rider/lighthouse-keeper/releases/download/v0.1.1/Lighthouse-Keeper-mac-x64.dmg',
      },
      {
        label: 'Windows installer',
        platform: 'Windows',
        url: 'https://github.com/jd4rider/lighthouse-keeper/releases/download/v0.1.1/Lighthouse-Keeper-win-setup.exe',
      },
      {
        label: 'Linux AppImage',
        platform: 'Linux',
        url: 'https://github.com/jd4rider/lighthouse-keeper/releases/download/v0.1.1/Lighthouse-Keeper-linux-x86_64.AppImage',
      },
    ],
    cover: { from: '#22d3ee', to: '#1e3a8a', emoji: '🗼' },
    highlights: [
      '24 stations across four coasts: Harbor Watch, Cliffside, Reef Waters and Storm Coast',
      'Mirrors flip and slide; lenses tint beams red, green or blue',
      'Forbidden reef markers must stay dark — a real constraint, not decoration',
      'Every level’s solved art is re-traced by the beam engine in tests',
    ],
    howToPlay: [
      'Tap a lighthouse to turn it a quarter turn — each shines one beam.',
      'Tap a mirror to flip it, or drag it onto open water to move it.',
      'Tap a lens to cycle red → green → blue; white (W) buoys need an untinted beam.',
    ],
    levels: '24 stations · 4 coasts',
    saveKey: 'lighthouse-keeper-save-v1',
  },
  {
    id: 'laser-logic',
    name: 'Laser Logic',
    tagline: 'Angle the light into every receiver.',
    description:
      'Steer laser beams with mirrors, colour filters, splitters and prisms. Targets light only when they receive exactly the colour they ask for. Sixty Journey levels across five worlds, plus a two-minute Rush mode.',
    categories: ['Logic', 'Puzzle', 'Brain Training'],
    runtime: 'Phaser 4',
    version: '0.1.1',
    updated: '2026-11-01',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/laser-logic/play/',
    preferredPlayUrl: 'https://laser-logic.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/laser-logic/',
    repoUrl: repo('laser-logic'),
    releasesUrl: `${repo('laser-logic')}/releases`,
    downloads: [
      { label: 'macOS (Apple Silicon)', platform: 'macOS', url: 'https://github.com/jd4rider/laser-logic/releases/download/v0.1.1/Laser-Logic-mac-arm64.dmg' },
      { label: 'macOS (Intel)', platform: 'macOS', url: 'https://github.com/jd4rider/laser-logic/releases/download/v0.1.1/Laser-Logic-mac-x64.dmg' },
      { label: 'Windows installer', platform: 'Windows', url: 'https://github.com/jd4rider/laser-logic/releases/download/v0.1.1/Laser-Logic-win-setup.exe' },
      { label: 'Linux AppImage', platform: 'Linux', url: 'https://github.com/jd4rider/laser-logic/releases/download/v0.1.1/Laser-Logic-linux-x86_64.AppImage' },
    ],
    cover: { from: '#f43f5e', to: '#7f1d1d', emoji: '🔴' },
    highlights: [
      'Splitters send a beam two ways; prisms break white light into red, green and blue',
      'Colour filters pass only their own wavelength',
      'Movable mirrors can be dragged to any empty cell',
      '60 Journey levels over five worlds plus a 120-second Rush',
    ],
    howToPlay: [
      'Tap a mirror to flip it and steer the beams.',
      'A target lights only when it receives exactly its own colour.',
      'Use filters, splitters and prisms to reach colours a plain mirror cannot.',
    ],
    levels: '60 levels · 5 worlds + Rush',
    saveKey: 'laser-logic-save-v1',
  },
  {
    id: 'circuit-crafter',
    name: 'Circuit Crafter',
    tagline: 'Wire it. Switch it. Light it.',
    description:
      'A genuine little circuit simulator disguised as a puzzle: batteries push power, wires conduct only where their rotated shape connects, AND and OR gates gate the flow, timers make beacons blink, light sensors chain circuits together — and one live fuse fails the whole board.',
    categories: ['Logic', 'Strategy', 'Brain Training'],
    runtime: 'Phaser 4',
    version: '0.1.1',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/circuit-crafter/play/',
    preferredPlayUrl: 'https://circuit-crafter.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/circuit-crafter/',
    repoUrl: repo('circuit-crafter'),
    releasesUrl: `${repo('circuit-crafter')}/releases`,
    downloads: [
      {
        label: 'macOS (Apple Silicon)',
        platform: 'macOS',
        url: 'https://github.com/jd4rider/circuit-crafter/releases/download/v0.1.1/Circuit-Crafter-mac-arm64.dmg',
      },
      {
        label: 'macOS (Intel)',
        platform: 'macOS',
        url: 'https://github.com/jd4rider/circuit-crafter/releases/download/v0.1.1/Circuit-Crafter-mac-x64.dmg',
      },
      {
        label: 'Windows installer',
        platform: 'Windows',
        url: 'https://github.com/jd4rider/circuit-crafter/releases/download/v0.1.1/Circuit-Crafter-win-setup.exe',
      },
      {
        label: 'Linux AppImage',
        platform: 'Linux',
        url: 'https://github.com/jd4rider/circuit-crafter/releases/download/v0.1.1/Circuit-Crafter-linux-x86_64.AppImage',
      },
    ],
    cover: { from: '#34d399', to: '#065f46', emoji: '⚡' },
    highlights: [
      'Power is spread by a fixed-point simulation, not a scripted answer table',
      'AND / OR gates, pulsing timers, light sensors and fuses',
      '24 boards across four benches, from 7 × 7 to 10 × 10',
      'Every level’s solved art is re-simulated in the test suite',
    ],
    howToPlay: [
      'Tap a wire to turn it; power follows the sides that actually connect.',
      'Open switches to cut a circuit — some boards need a switch left off.',
      'Beacons must blink on the timer; lamps must stay steadily lit.',
    ],
    levels: '24 boards · 4 benches',
    saveKey: 'circuit-crafter-save-v1',
  },
  {
    id: 'rumble-rally',
    name: 'Rumble Rally',
    tagline: 'Drive, tilt, and land on your wheels.',
    description:
      'A physics driving puzzle: roll your car over ramps, gaps and crates to reach the flag. On the ground you drive; in the air the same controls tilt you, so every jump is a small landing problem. Every one of the 200 seeded courses is checked solvable by a test bot.',
    categories: ['Physics', 'Arcade', 'Casual'],
    runtime: 'Phaser 4',
    version: '0.1.3',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/rumble-rally/play/',
    preferredPlayUrl: 'https://rumble-rally.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/rumble-rally/',
    repoUrl: repo('rumble-rally'),
    releasesUrl: `${repo('rumble-rally')}/releases`,
    downloads: [
      { label: 'macOS (Apple Silicon)', platform: 'macOS', url: 'https://github.com/jd4rider/rumble-rally/releases/download/v0.1.3/Rumble-Rally-mac-arm64.dmg' },
      { label: 'macOS (Intel)', platform: 'macOS', url: 'https://github.com/jd4rider/rumble-rally/releases/download/v0.1.3/Rumble-Rally-mac-x64.dmg' },
      { label: 'Windows installer', platform: 'Windows', url: 'https://github.com/jd4rider/rumble-rally/releases/download/v0.1.3/Rumble-Rally-win-setup.exe' },
      { label: 'Linux AppImage', platform: 'Linux', url: 'https://github.com/jd4rider/rumble-rally/releases/download/v0.1.3/Rumble-Rally-linux-x86_64.AppImage' },
    ],
    cover: { from: '#fb923c', to: '#7c2d12', emoji: '🚗' },
    highlights: [
      '200 procedurally generated courses across five worlds',
      'Same controls drive and tilt: careful landings are the whole game',
      'Three stars per course for a clean, collectible run',
      'Keyboard and on-screen touch buttons; landscape is best on a phone',
    ],
    howToPlay: [
      'Arrow keys or A/D drive; hold the on-screen buttons on touch devices.',
      'Rolling over drives you forward — in the air the same input tilts the car.',
      'Land on your wheels. Touching the ground with the car body is a crash.',
      'Collect the three stars on each course; every finish earns at least one.',
    ],
    levels: '200 levels · 5 worlds',
    saveKey: 'rumblerally-save-v1',
  },
  {
    id: 'whisker-grid',
    name: 'Whisker Grid',
    tagline: 'One cat per colour, row and column.',
    description:
      'A cat-themed logic puzzle in the queens family: place exactly one cat in every colour region, row and column, and never let two cats touch — diagonals included. A thousand seeded levels scale from four colours to nine, so the deduction gets deeper without the rules ever changing.',
    categories: ['Logic', 'Puzzle', 'Brain Training'],
    runtime: 'Phaser 4',
    version: '0.2.1',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/whisker-grid/play/',
    preferredPlayUrl: 'https://whisker-grid.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/whisker-grid/',
    repoUrl: repo('whisker-grid'),
    releasesUrl: `${repo('whisker-grid')}/releases`,
    downloads: [
      { label: 'macOS (Apple Silicon)', platform: 'macOS', url: 'https://github.com/jd4rider/whisker-grid/releases/download/v0.2.1/Whisker-Grid-mac-arm64.dmg' },
      { label: 'macOS (Intel)', platform: 'macOS', url: 'https://github.com/jd4rider/whisker-grid/releases/download/v0.2.1/Whisker-Grid-mac-x64.dmg' },
      { label: 'Windows installer', platform: 'Windows', url: 'https://github.com/jd4rider/whisker-grid/releases/download/v0.2.1/Whisker-Grid-win-setup.exe' },
      { label: 'Linux AppImage', platform: 'Linux', url: 'https://github.com/jd4rider/whisker-grid/releases/download/v0.2.1/Whisker-Grid-linux-x86_64.AppImage' },
    ],
    cover: { from: '#f9a8d4', to: '#9d174d', emoji: '🐱' },
    highlights: [
      '1000 seeded Journey levels, from 4 colours to 9',
      'Tap to cross out, drag to mark many, double-tap to place a cat',
      'Hint, Reveal and Mouse power-ups for when a board stalls',
      'Rush mode: 120 seconds of endless boards',
    ],
    howToPlay: [
      'Each colour region, row and column must hold exactly one cat.',
      'No two cats may touch, including diagonally.',
      'Tap to cross out a square, drag across many, double-tap to place a cat.',
      'Use Hint or Mouse when you get stuck; Reveal places a cat outright.',
    ],
    levels: '1000 levels · Journey + Rush',
    saveKey: 'whiskergrid-save-v1',
  },
  {
    id: 'blocked-in',
    name: 'Blocked In',
    tagline: 'Slide the key block free.',
    description:
      'A sliding-block puzzle with a twist: spinners rotate their neighbours, magnets drag metal blocks out of reach, and some exits only open while a switch is held. Thirty boards across four workshops, each one verified solvable.',
    categories: ['Puzzle', 'Logic', 'Brain Training'],
    runtime: 'Phaser 4',
    version: '0.1.0',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/blocked-in/play/',
    preferredPlayUrl: 'https://blocked-in.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/blocked-in/',
    repoUrl: repo('blocked-in'),
    releasesUrl: `${repo('blocked-in')}/releases`,
    downloads: [],
    cover: { from: '#38bdf8', to: '#0c4a6e', emoji: '🧩' },
    highlights: [
      '30 boards across four workshops, from 5 × 5 to 8 × 8',
      'Spinners, magnets and moving exits change how blocks move',
      'Every board is re-solved by the test suite before it ships',
      'Drag or tap a block to slide it into free space',
    ],
    howToPlay: [
      'Drag the red key block toward the exit on the right.',
      'Blocks only slide in straight lines into empty space.',
      'Tap a spinner to rotate the blocks around it.',
    ],
    levels: '30 boards · 4 workshops',
    saveKey: 'blocked-in-save-v1',
  },
  {
    id: 'bubble-spiral',
    name: 'Bubble Spiral',
    tagline: 'Aim, fire, pop the chain.',
    description:
      'A marble-chain arcade puzzle: a spiral of coloured marbles crawls toward a hole, and every shot you fire joins the chain. Connect three or more of a colour to pop them, and watch the gap snap shut — a closing seam can trigger a second match before the chain reaches the hole. One hundred seeded Journey spirals across eight chapters, plus Classic, Endless, Zen and a shared daily board.',
    categories: ['Arcade', 'Puzzle', 'Casual'],
    runtime: 'Phaser 4',
    version: '0.1.1',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/bubble-spiral/play/',
    preferredPlayUrl: 'https://spiral.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/bubble-spiral/',
    repoUrl: repo('bubble-spiral'),
    releasesUrl: `${repo('bubble-spiral')}/releases`,
    downloads: [],
    cover: { from: '#f472b6', to: '#4338ca', emoji: '\u{1F300}' },
    highlights: [
      '100 seeded Journey spirals across eight chapters, each checked against a shot-budget fairness rule',
      'Rainbow, bomb and frozen marbles, plus Slow, Reverse and Rainbow power-ups',
      'Gap-closing chain reactions that can pop a second group',
      'Daily challenge, endless waves, classic stages and a forgiving Zen mode',
    ],
    howToPlay: [
      'Aim with the pointer or by dragging, then release to fire.',
      'Join three or more of the same colour to pop them.',
      'Shoot a frozen marble once to thaw it before it can join a group.',
    ],
    levels: '100 Journey boards \u00b7 8 chapters + daily, endless, classic and Zen',
    saveKey: 'bubble-spiral-save-v1',
  },
  {
    id: 'hexodus',
    name: 'Hexodus',
    tagline: 'Clear every ray.',
    description:
      'A hexagonal escape puzzle: each tile carries an arrow, and it can only leave when every hex along that ray is empty. One hundred solver-verified Journey boards across eight chapters introduce keys, frost and rotating arrows, alongside a shared daily challenge, endless Zen and Classic stages. Every board is generated from a seed and checked solvable before it ships.',
    categories: ['Puzzle', 'Logic', 'Brain Training'],
    runtime: 'Phaser 4',
    version: '0.1.0',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/hexodus/play/',
    preferredPlayUrl: 'https://hexodus.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/hexodus/',
    repoUrl: repo('hexodus'),
    releasesUrl: `${repo('hexodus')}/releases`,
    downloads: [],
    cover: { from: '#a78bfa', to: '#312e81', emoji: '⬡' },
    highlights: [
      '100 solver-verified Journey levels across eight chapters',
      'Locks and keys, frost that thaws from the edges, and arrows that turn with their neighbours',
      'A daily board seeded from the UTC date, identical on every device',
      'Undo, solver-backed hints, four themes and reduced-motion support',
    ],
    howToPlay: [
      'Tap a tile: it escapes only if every hex on its arrow ray is empty.',
      'A blocked tile shakes and the first blocker pulses — no penalty.',
      'Keys open matching padlocks; frost thaws when neighbours leave.',
    ],
    levels: '100 Journey levels · 8 chapters + daily, Zen and Classic',
    saveKey: 'hexodus-save-v1',
  },
  {
    id: 'purrfect-squares',
    name: 'Purrfect Squares',
    tagline: 'Draw a rectangle for every cat.',
    description:
      'A cozy, untimed logic puzzle. Every numbered cat needs a rectangle of exactly that many squares, and every tile of the wooden board must be covered. Drag from one tile to another to draw a rectangle, tap one to lift it, and lean on three-stage hints and unlimited undo instead of a clock. Two hundred Journey boards across eight chapters — each generated from a seed and solver-verified to have exactly one solution — plus daily, zen, expert and unlimited modes.',
    categories: ['Puzzle', 'Logic', 'Relaxing', 'Brain Training'],
    runtime: 'Phaser 4',
    version: '0.1.0',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/purrfect-squares/play/',
    preferredPlayUrl: 'https://purrfectsquares.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/purrfect-squares/',
    repoUrl: repo('purrfect-squares'),
    releasesUrl: `${repo('purrfect-squares')}/releases`,
    downloads: [],
    cover: { from: '#f6c48a', to: '#4f9d69', emoji: '🐈' },
    highlights: [
      '200 Journey boards, each verified to have exactly one solution',
      'Drag-to-draw rectangles with two-tap and keyboard alternatives',
      'No timer, no lives, unlimited undo and three-stage hints',
      'Daily catnap, Zen, Expert and Unlimited modes, plus five unlockable themes',
    ],
    howToPlay: [
      'Drag across tiles to draw a rectangle, or tap one corner and then the other.',
      'A rectangle must hold exactly one cat and have the same area as its number.',
      'Tap a placed rectangle to lift it, and keep going until every tile is covered.',
    ],
    levels: '200 Journey boards · 8 chapters + daily, zen, expert and unlimited',
    saveKey: 'purrfect-squares-save-v1',
  },
  {
    id: 'skipping-stones',
    name: 'Skipping Stones',
    tagline: 'Flat stones, a long lake, the perfect angle.',
    description:
      'A physics arcade game about the oldest good idea at a lake. Drag to set power and aim, release, and watch a flat stone skip away from you while it keeps a little energy for one more bounce. Five lakes each with their own light and wind, a hundred Journey boards that were generated and then proven with a stored winning throw, a daily stone identical for everybody, and a collection of stones that genuinely throw differently. No timer, no lives, just one more throw.',
    categories: ['Arcade', 'Physics', 'Relaxing', 'Casual'],
    runtime: 'Phaser 4',
    version: '0.1.0',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/skipping-stones/play/',
    preferredPlayUrl: 'https://skippingstones.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/skipping-stones/',
    repoUrl: repo('skipping-stones'),
    releasesUrl: `${repo('skipping-stones')}/releases`,
    downloads: [],
    cover: { from: '#1f9d7a', to: '#0e2c3d', emoji: '🪨' },
    highlights: [
      '100 Journey challenges across five lakes, each proven by a stored throw',
      'Deterministic stone physics: power, launch angle, spin, wind and stone shape',
      'A daily challenge seeded by the UTC date, the same board for everyone',
      'Six stones and six trails, balanced so nothing is pay-to-win',
    ],
    howToPlay: [
      'Drag up from the water to set power, slide left or right to aim, then release.',
      'A shallow, fast, spinning stone skips. A steep or tired one goes straight in.',
      'Hit the buoys, make the skip count, and chase your best distance.',
    ],
    levels: '100 Journey challenges · 5 lakes + daily, zen, endless, precision and trick shot',
    saveKey: 'skipping-stones-save-v1',
  },
  {
    id: 'mini-golf-garden',
    name: 'Mini Golf Garden',
    tagline: 'Seventy-two little putts through eight whimsical gardens.',
    description:
      'A cosy physics miniature-golf game. Drag back from the ball to aim, release to putt, then read the slopes, ponds, windmills and conveyor belts between you and the cup. Eight hand-built gardens hold nine holes each — 72 in total — with par, birdies and three-star ratings, plus daily, time-attack, trick-shot and zen modes.',
    categories: ['Physics', 'Relaxing', 'Casual'],
    runtime: 'Phaser 3',
    version: '0.1.0',
    updated: '2026-11-02',
    status: 'live',
    featured: true,
    playUrl: 'https://jd4rider.github.io/mini-golf-garden/play/',
    siteUrl: 'https://jd4rider.github.io/mini-golf-garden/',
    repoUrl: repo('mini-golf-garden'),
    releasesUrl: `${repo('mini-golf-garden')}/releases`,
    downloads: [],
    cover: { from: '#8ed36b', to: '#2f5d3a', emoji: '⛳' },
    highlights: [
      '72 hand-designed holes across eight themed gardens',
      'Deterministic 120 Hz ball physics with slopes, ice, sand, mud and water',
      'Windmills, timed gates, rafts, lily pads, mushrooms, teleporters and bees',
      'Journey, Free Play, Daily Challenge, Time Attack, Trick Shots and Zen',
      'Keyboard and touch controls, fully offline, cloud saves when signed in',
    ],
    howToPlay: [
      'Press near the ball, drag away from your target and release to putt.',
      'Stone and ice let the ball run; sand and mud grab it; water costs a stroke.',
      'Par or better earns three stars. Stars open the next garden.',
    ],
    levels: '72 holes in 8 gardens',
    saveKey: 'mini-golf-garden-save-v1',
  },
  {
    id: 'prism-party',
    name: 'Prism Party',
    tagline: 'Drag mirrors onto the board, split the spectrum, light every crystal.',
    description:
      'A calm, tactile light puzzle. Some optics are already on the board and some are loose in a tray, so most boards cannot be solved by turning alone: drag a mirror or prism into an empty socket, then tap it to aim it. Colour-locked doors only open for their own wavelength, directional crystals only drink from one side, and walls close off the wrong turns. White light splits into red, green and blue, filters strip channels away, splitters share one beam between two crystals, and portals carry the light across the board. Two hundred puzzles across five rooms, each built from a working solution and then re-solved by an exhaustive solver before shipping, placements included, with three stars for solving in the fewest possible actions. No timer, unlimited undo, and a daily board identical for everyone.',
    categories: ['Puzzle', 'Logic', 'Relaxing', 'Brain Training'],
    runtime: 'Phaser 4',
    version: '0.1.0',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/prism-party/play/',
    preferredPlayUrl: 'https://prismparty.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/prism-party/',
    repoUrl: repo('prism-party'),
    releasesUrl: `${repo('prism-party')}/releases`,
    downloads: [
      {
        label: 'macOS (Apple Silicon)',
        platform: 'macOS',
        url: 'https://github.com/jd4rider/prism-party/releases/download/v0.1.0/Prism.Party-0.1.0-arm64.dmg',
      },
      {
        label: 'macOS (Intel)',
        platform: 'macOS',
        url: 'https://github.com/jd4rider/prism-party/releases/download/v0.1.0/Prism.Party-0.1.0.dmg',
      },
    ],
    cover: { from: '#7c5cf6', to: '#1a1235', emoji: '\u{1F537}' },
    highlights: [
      '200 puzzles, every one solved and verified by a backtracking solver',
      'Drag loose mirrors and prisms into sockets - the route does not exist until you do',
      'Colour-locked doors, directional crystals and 1,000+ walls to route around',
      'A real light engine: additive RGB mixing and per-channel transmission, so no device invents light',
      'Untimed, with unlimited undo, redo and restart',
      'Daily puzzle, Zen mode and free play',
    ],
    howToPlay: [
      'Drag a piece from the tray into a glowing socket.',
      'Tap a mirror, prism or seated piece to turn it.',
      'Steer the beam into every coloured crystal at the same time.',
      'Prisms separate white light; filters strip colours out; doors only open for their own colour.',
    ],
    levels: '200 puzzles \u00b7 5 worlds + daily, zen and free play',
    saveKey: 'prism-party-save-v1',
  },
  {
    id: 'bus-jam-bonanza',
    name: 'Bus Jam Bonanza',
    tagline: 'Thread the traffic. Fill the buses. Clear the queue.',
    description:
      'A 2.5D bus-dispatch puzzle. Tap a parked bus, steer it through the traffic to one of a few boarding bays, and let colour-matched passengers board from a strictly ordered queue. Full buses leave automatically; the wrong dispatch order can fill every bay with the wrong colours, so reading the queue is the puzzle. All 300 Journey levels across ten worlds were built from a working dispatch order and re-solved by a BFS solver before shipping, so every level has a fair solution. One-way lanes, traffic gates, limited bays and deliberately parked decoys keep later worlds honest.',
    categories: ['Puzzle', 'Logic', 'Strategy', 'Casual'],
    runtime: 'Phaser 3',
    version: '1.0.0',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/bus-jam-bonanza/play/',
    siteUrl: 'https://jd4rider.github.io/bus-jam-bonanza/',
    repoUrl: repo('bus-jam-bonanza'),
    releasesUrl: `${repo('bus-jam-bonanza')}/releases`,
    downloads: [],
    cover: { from: '#fbbf24', to: '#b45309', emoji: '\u{1F68C}' },
    highlights: [
      '300 Journey levels across ten themed worlds, every one re-solved by the shipped engine',
      'Swept-footprint routing, one-way lanes, traffic gates and limited boarding bays',
      'Strict front-of-queue boarding with colour and symbol coding on every bus and passenger',
      'Solver-backed three-stage hints, undo, redo, restart and par-based star ratings',
      'Journey, Zen, Daily, Expert, Endless and Free Play with offline-first saves',
    ],
    howToPlay: [
      'Tap a bus to dispatch it to a free boarding bay.',
      'Passengers board only a matching-colour bus, and only from the front of the queue.',
      'Fill a bus to capacity and it leaves, freeing the bay for the next dispatch.',
      'Clear every passenger. If the lot jams, undo or restart and try a different order.',
    ],
    levels: '300 levels \u00b7 10 worlds + daily, zen, expert and endless',
    saveKey: 'bus-jam-bonanza-save-v1',
  },
  {
    id: 'gear-garden',
    name: 'Gear Garden',
    tagline: 'Fit the gears. Wake the garden.',
    description:
      'A portrait-first 2.5D clockwork puzzle. Fit brass gears onto wooden axles, then send a motor\u2019s power through them to blooms, windmills, fountains and clockwork birds. Gears only mesh when their tooth counts add up to 24, a compound shaft carries motion to a second layer, belts cross and reverse, clutches must be engaged, and a driven axle can stall or overload. All 1,000 gardens across twenty worlds were constructed from a working mechanism, verified by the same solver the game uses for hints, and re-validated in CI, so no shipped garden can be unsolvable. Exact rational ratios mean a speed requirement is never a matter of rounding.',
    categories: ['Puzzle', 'Logic', 'Brain Training', 'Casual'],
    runtime: 'PixiJS 8',
    version: '1.0.0',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/gear-garden/play/',
    preferredPlayUrl: 'https://geargarden.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/gear-garden/',
    repoUrl: repo('gear-garden'),
    releasesUrl: `${repo('gear-garden')}/releases`,
    downloads: [],
    cover: { from: '#e3ad55', to: '#2f4633', emoji: '\u2699\uFE0F' },
    highlights: [
      '1,000 gardens across twenty themed worlds, each one solver-verified before shipping',
      'A real transmission simulation: mesh directions, exact ratios, compound shafts, belts, clutches and torque loads',
      'Contradictions are explained \u2014 two drives disagreeing, a braked axle, or a mechanism behind too much load',
      'Tactile 2.5D brass and copper gears with layered shadows and mechanisms that bloom when powered',
      'Solver-backed hints, full undo/redo, portrait touch controls plus a keyboard path, and offline saves',
    ],
    howToPlay: [
      'Tap a gear in the tray, then tap an empty wooden axle to fit it.',
      'Neighbouring gears mesh only when their tooth counts add up to 24. Watch the objective\u2019s direction and speed.',
      'Press RUN to turn the motor. If nothing moves, check the chain, a released clutch or an overloaded drive.',
      'Wake every mechanism in the garden. Undo and restart are always free.',
    ],
    levels: '1,000 gardens \u00b7 20 worlds + daily, zen, endless and free build',
    saveKey: 'gear-garden-save-v1',
  },
  {
    id: 'traffic-tangle',
    name: 'Traffic Tangle',
    tagline: 'Draw the routes. Start the traffic. Get everyone home.',
    description:
      'A miniature toy-city routing puzzle. Give every car a road route to its own coloured pin, set the signals, then press GO and watch all of them drive at once. Nothing is scripted: each level runs a fixed-step traffic simulation with lane occupancy, intersection reservations and real conflict zones, so two cars crossing on the same layer collide unless their timings miss. One thousand Journey levels across twenty worlds are generated from a working plan and re-driven by the shipped simulation before they ship. Bridges and tunnels stack layers, one-way streets, roundabouts, railroad crossings and multi-stop deliveries keep later worlds honest.',
    categories: ['Puzzle', 'Logic', 'Strategy', 'Casual'],
    runtime: 'Phaser 3',
    version: '1.0.0',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/traffic-tangle/play/',
    siteUrl: 'https://jd4rider.github.io/traffic-tangle/',
    repoUrl: repo('traffic-tangle'),
    releasesUrl: `${repo('traffic-tangle')}/releases`,
    downloads: [],
    cover: { from: '#2f8fbf', to: '#132a3a', emoji: '\u{1F6A6}' },
    highlights: [
      '1,000 Journey levels across twenty themed worlds, each re-driven by the shipped simulation in CI',
      'A deterministic 60 Hz traffic engine with lane occupancy, intersection reservations and deadlock detection',
      'Bridges, tunnels, one-way streets, roundabouts, signals and multi-stop deliveries',
      'Draw routes by dragging or two taps, with solver-backed hints and full undo/redo',
      'Portrait-first touch controls, keyboard shortcuts and offline saves',
    ],
    howToPlay: [
      'Tap a car to select it, then tap its pin to draw a route - or drag along the roads yourself.',
      'Tap a traffic light to shift its phase until the timing works.',
      'Press GO and watch every car drive at once. Redo the routes if two of them meet.',
      'Get every car home without a collision. Undo, reset and hints are always free.',
    ],
    levels: '1,000 levels \u00b7 20 worlds + daily, zen, endless and sandbox',
    saveKey: 'traffic-tangle-save-v1',
  },
  {
    id: 'cannon-clash-3d',
    name: 'Cannon Clash 3D',
    tagline: 'Line up the shot. Break the block line.',
    description:
      'A portrait 3D cannon puzzle built in Unity and rendered straight from the WebGL player. Each level hands you a fixed number of shots, a target and a stack of blocks standing between you and it: pick the angle, pick the power, and fire. Real 3D physics does the rest, so the same shot can topple one tower and bounce uselessly off another. Stars reward finishing cleanly, worlds unlock as you go, and a daily challenge picks a fresh board each day. Nothing to install - the payload streams in behind a progress bar and the whole game runs in the browser.',
    categories: ['Puzzle', 'Arcade', 'Physics', 'Casual'],
    runtime: 'Unity WebGL',
    version: '0.1.0',
    updated: '2026-11-03',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/cannon-clash-3d-web/play/',
    siteUrl: 'https://jd4rider.github.io/cannon-clash-3d-web/',
    repoUrl: repo('cannon-clash-3d-web'),
    releasesUrl: `${repo('cannon-clash-3d-web')}/releases`,
    downloads: [],
    cover: { from: '#7b5bff', to: '#14122b', emoji: '\u{1F4A5}' },
    highlights: [
      'Native Unity WebGL build with real 3D physics, not a 2D stand-in',
      'A campaign of block-breaking levels with a shot budget and star ratings',
      'Daily challenge and world progression tracked in your browser',
      'Play area scaled to fit any screen without stretching the view',
      'Portrait play area that fills a phone screen and letterboxes on desktop',
      'Mouse and touch input, no install and no download',
    ],
    howToPlay: [
      'Open the game and wait for the Unity progress bar - the first load streams about 76 MB',
      'Aim the cannon, then choose the power for the shot',
      'Clear the target without running out of shots',
      'Rotate to landscape and the game stays a centred portrait panel instead of stretching',
    ],
    levels: 'Unity WebGL build \u00b7 campaign worlds + daily challenge',
    saveKey: '',
  },
  {
    id: 'wrecking-yard',
    name: 'Wrecking Yard',
    tagline: 'Straight out of the yard.',
    description:
      'A portrait Unity WebGL build, published straight from the Unity player: a real 3D scene rather than a 2D approximation, a 9:16 play area that scales to fit any screen, and mouse and touch input. Nothing to install - the payload streams in behind a progress bar and the game runs entirely in the browser.',
    categories: ['Arcade'],
    runtime: 'Unity WebGL',
    version: '0.1.0',
    updated: '2026-11-03',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/wrecking-yard-web/play/',
    siteUrl: 'https://jd4rider.github.io/wrecking-yard-web/',
    repoUrl: repo('wrecking-yard-web'),
    releasesUrl: `${repo('wrecking-yard-web')}/releases`,
    downloads: [],
    cover: { from: '#f59e0b', to: '#3f1d0b', emoji: '\u{1F6A7}' },
    highlights: [
      'Native Unity WebGL build - a real 3D scene, not a 2D stand-in',
      'Portrait 9:16 play area, scaled to fit phones, tablets and desktops',
      'Mouse and touch input, no install and no download',
      'Served from GitHub Pages, with the Unity payload decompressed at deploy time',
    ],
    howToPlay: [
      'Open the game and wait for the Unity progress bar - the first load streams about 56 MB',
      'Use the fullscreen button in the footer for the whole 9:16 view',
      'On a phone the game fills the screen automatically',
      'Progress is held by the Unity player in your browser storage',
    ],
    levels: 'Unity WebGL build \u00b7 0.1.0',
    saveKey: '',
  },
  {
    id: 'bridge-buddies',
    name: 'Bridge Buddies',
    tagline: 'Build it. Test it. Get them across.',
    description:
      'A miniature 3D bridge-engineering puzzle, rebuilt in Unity and rendered straight from the WebGL player. Buy planks, beams and bracing out of a fixed budget, tap between posts to raise a truss, then press TEST and watch a little buddy drive across the span you just built. The bridge is a real structural solve rather than a canned animation: every member carries axial force and bending moment, the deck sags under the wheels and the vehicle rides the sag, and an overloaded member lets go instead of pretending it is fine. Portrait 9:16 play area scaled to fit any screen, mouse and touch input, no install and no download.',
    categories: ['Physics', 'Puzzle', 'Strategy', 'Casual'],
    runtime: 'Unity WebGL',
    version: '0.1.0',
    updated: '2026-11-04',
    status: 'live',
    featured: true,
    playUrl: 'https://jd4rider.github.io/bridge-buddies-web/play/',
    siteUrl: 'https://jd4rider.github.io/bridge-buddies-web/',
    repoUrl: repo('bridge-buddies-web'),
    releasesUrl: `${repo('bridge-buddies-web')}/releases`,
    downloads: [],
    cover: { from: '#8fd0e8', to: '#2f5d3a', emoji: '\u{1F309}' },
    highlights: [
      'Native Unity WebGL build with real 3D rendering, not a 2D stand-in',
      'A real structural solve: axial force and bending moment on every member',
      'The deck sags under the vehicle, and the vehicle rides the sag',
      'Place the deck, the truss and the piers, then press TEST to watch it cross',
      'Portrait 9:16 play area that fills a phone and letterboxes on desktop',
      'Mouse and touch input, no install and no download',
    ],
    howToPlay: [
      'Open the game and wait for the Unity progress bar - the first load streams about 61 MB',
      'Tap between two posts to place a member, and keep an eye on the budget',
      'Add bracing and piers until TEST shows the structure holding',
      'Press TEST and watch the buddy drive across the span',
    ],
    levels: 'Unity WebGL build \u00b7 build-and-test challenges',
    saveKey: '',
  },
  {
    id: 'brick-blitz',
    name: 'Brick Blitz',
    tagline: 'Smash the wall. Catch the chaos.',
    description:
      'A portrait-first 3D brick-breaker built with Three.js. Ten worlds of fifty levels each, a boss at the end of every world, forty power-ups including the bad ones, and twenty-five brick types that change how you aim: shield plating to burn off, colour locks that ignore ordinary hits, portals that move the ball, gravity wells that bend it, and switches that open every bulkhead on the level. The ball runs on a fixed 120 Hz step with swept collisions, so a hit is a hit on every screen size, and fast balls cannot tunnel through a brick.',
    categories: ['Arcade', 'Casual'],
    runtime: 'Three.js',
    version: '1.0.0',
    updated: '2026-11-02',
    status: 'live',
    playUrl: 'https://jd4rider.github.io/brick-blitz/play/',
    preferredPlayUrl: 'https://brickblitz.littlejoyarcade.site/play/',
    siteUrl: 'https://jd4rider.github.io/brick-blitz/',
    repoUrl: repo('brick-blitz'),
    releasesUrl: `${repo('brick-blitz')}/releases`,
    downloads: [],
    cover: { from: '#4de1ff', to: '#1b0b2e', emoji: '\u{1F9F1}' },
    highlights: [
      '500 levels across ten themed worlds, every one structurally validated in CI before it ships',
      '40 power-ups with deterministic conflict rules: tiny beats mega, speed is capped, the ball swarm is capped',
      '25 brick types with real behaviours, not just different colours \u2014 portals, gravity wells, switches and armoured cores',
      'Ten bosses with three health phases and telegraphed attacks, from the Brick Titan to the Blitz King',
      'Deterministic swept collision physics and portrait-first touch controls with keyboard support',
    ],
    howToPlay: [
      'Drag anywhere in the lower half of the screen to slide the paddle. On desktop use the mouse or arrow keys.',
      'Tap LAUNCH. Where the ball lands on the paddle sets the angle: centre goes almost straight up, edges go wide.',
      'Read the glyphs: shields need fire, colour locks need electricity, bulkheads never break. Catch capsules but avoid the red-ringed ones.',
      'Break the objective, then the boss core. Stars come from score, not from speed.',
    ],
    levels: '500 levels \u00b7 10 worlds + endless, survival, boss rush, daily, zen and 8 challenges',
    saveKey: 'brick-blitz-save-v1',
  },
  {
    id: 'trailblazer-dash',
    name: 'Trailblazer Dash',
    tagline: 'One world. Five hundred trails. Never stop moving.',
    description:
      'A portrait-first 3D endless runner built in Godot 4 and exported to the web. You are a Trailblazer restoring the Wayfinder Network across Avelora: five hundred handcrafted campaign trails over twenty regions, a living world map that lights up as you travel, and an endless trail for when you just want to run. Swipe to change lanes, jump the hurdles, slide under the bars, collect Wayfinder Sparks and light the beacon at the end of every trail.',
    categories: ['Arcade', 'Casual'],
    runtime: 'Godot 4',
    version: '1.0.0',
    updated: '2026-11-03',
    status: 'live',
    featured: true,
    playUrl: 'https://jd4rider.github.io/trailblazer-dash/',
    preferredPlayUrl: 'https://trailblazerdash.littlejoyarcade.site/',
    siteUrl: 'https://jd4rider.github.io/trailblazer-dash/',
    repoUrl: repo('trailblazer-dash'),
    releasesUrl: `${repo('trailblazer-dash')}/releases`,
    downloads: [],
    cover: { from: '#2ec4a6', to: '#0b1c20', emoji: '\u{1F3C3}' },
    highlights: [
      '500 campaign trails across 20 regions of Avelora, every layout validated headless before it ships',
      'A living journey map: cleared trails light the route and reveal the next region',
      'Blender-authored runner, props and landmarks, with real 3D parallax scenery',
      'Sparks, relics, power-up crates and a three-star objective on every trail',
      'Portrait-first swipe controls plus keyboard, built with the Little Joy Arcade account bridge',
    ],
    howToPlay: [
      'Swipe left or right to change lane, up to jump, down to slide. Arrow keys and WASD work on desktop.',
      'Tap START RUNNING, then keep moving. A stumble costs your speed and one heart, not the run.',
      'Collect sparks to meet the objective and finish under the beacon to light the next trail.',
      'Star two and three need the objective met, not just the finish line.',
    ],
    levels: '500 levels \u00b7 20 regions + endless and daily',
    saveKey: 'trailblazer-dash-save-v1',
  },
]

// Versions, dates and download links are generated from each repository's
// latest GitHub release by scripts/sync-releases.mjs. Descriptions, categories
// and copy above stay hand-written.
interface ReleaseInfo {
  version: string
  updated: string
  downloads: DownloadLink[]
}

const RELEASES = releaseData as Record<string, ReleaseInfo | undefined>

for (const game of GAMES) {
  const release = RELEASES[game.id]
  if (!release) continue
  game.version = release.version
  game.updated = release.updated
  game.downloads = release.downloads
}

export const CATEGORIES: Category[] = [
  'Puzzle',
  'Relaxing',
  'Logic',
  'Strategy',
  'Arcade',
  'Physics',
  'Brain Training',
  'Casual',
]

export const gamesById = new Map(GAMES.map((game) => [game.id, game]))

export const featuredGames = GAMES.filter((game) => game.featured)

/**
 * Swap the catalogue in place with rows loaded from the database. Called once
 * before the app renders, so every page (including derived lists) sees the same
 * data without each component needing its own fetch.
 */
export function replaceCatalog(next: Game[]): void {
  if (next.length === 0) return
  GAMES.splice(0, GAMES.length, ...next)
  gamesById.clear()
  for (const game of GAMES) gamesById.set(game.id, game)
  featuredGames.splice(0, featuredGames.length, ...GAMES.filter((game) => game.featured))
}

export function relatedGames(game: Game, count = 3): Game[] {
  return GAMES.filter((other) => other.id !== game.id)
    .sort((a, b) => {
      const overlap = (g: Game) => g.categories.filter((c) => game.categories.includes(c)).length
      return overlap(b) - overlap(a)
    })
    .slice(0, count)
}
