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

export type Runtime = 'Phaser 4' | 'React 19'

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
