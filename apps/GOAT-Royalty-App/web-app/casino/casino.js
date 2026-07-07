const games = [
  { id: 'ultimate-bourre', title: 'Ultimate Bourré', shortTitle: 'Ultimate Bourré', tableTitle: 'Ultimate Bourré', family: 'Ultimate Bourré', edge: '1.6%', vol: 'High', players: '12.8k', icon: 'A', accent: '#f2d58a' },
  { id: 'crash', title: 'Crash', family: 'Originals', edge: '1.8%', vol: 'High', players: '8.2k', icon: 'CR', accent: '#2dd4bf' },
  { id: 'dice', title: 'Dice', family: 'Originals', edge: '1.0%', vol: 'Tunable', players: '5.9k', icon: 'DI', accent: '#facc15' },
  { id: 'mines', title: 'Mines', family: 'Originals', edge: '2.0%', vol: 'High', players: '6.4k', icon: 'MI', accent: '#fb7185' },
  { id: 'plinko', title: 'Plinko', family: 'Originals', edge: '1.4%', vol: 'Tunable', players: '4.8k', icon: 'PL', accent: '#38bdf8' },
  { id: 'limbo', title: 'Limbo', family: 'Originals', edge: '1.2%', vol: 'High', players: '3.1k', icon: 'LI', accent: '#a3e635' },
  { id: 'wheel', title: 'Wheel', family: 'Originals', edge: '1.5%', vol: 'Tunable', players: '2.9k', icon: 'WH', accent: '#fb923c' },
  { id: 'roulette', title: 'Roulette', family: 'Tables', edge: '2.7%', vol: 'Medium', players: '3.8k', icon: 'RO', accent: '#ef4444' },
  { id: 'blackjack', title: 'Blackjack', family: 'Tables', edge: '0.8%', vol: 'Medium', players: '4.1k', icon: 'BJ', accent: '#f8fafc' },
  { id: 'baccarat', title: 'Baccarat', family: 'Tables', edge: '1.1%', vol: 'Low', players: '2.2k', icon: 'BA', accent: '#c084fc' },
  { id: 'slots', title: 'Slots', family: 'Reels', edge: '3.0%', vol: 'High', players: '7.7k', icon: 'SL', accent: '#f472b6' },
  { id: 'video-poker', title: 'Video Poker', family: 'Reels', edge: '1.6%', vol: 'Medium', players: '1.7k', icon: 'VP', accent: '#fde68a' },
  { id: 'keno', title: 'Keno', family: 'Numbers', edge: '4.0%', vol: 'High', players: '2.5k', icon: 'KE', accent: '#67e8f9' },
  { id: 'hilo', title: 'Hi-Lo', family: 'Numbers', edge: '1.9%', vol: 'Medium', players: '2.6k', icon: 'HL', accent: '#86efac' },
  { id: 'towers', title: 'Towers', family: 'Originals', edge: '2.4%', vol: 'High', players: '1.9k', icon: 'TW', accent: '#818cf8' },
  { id: 'coin-flip', title: 'Coin Flip', family: 'Originals', edge: '1.0%', vol: 'Low', players: '4.4k', icon: 'CF', accent: '#fef08a' },
  { id: 'sportsbook', title: 'Sportsbook', family: 'Sports', edge: 'Market', vol: 'Live', players: '9.5k', icon: 'SB', accent: '#22c55e' },
  { id: 'crown-run', title: 'Crown Run', family: 'VIP', edge: '1.7%', vol: 'High', players: '5.1k', icon: 'CN', accent: '#f2d58a', mode: 'surge' },
  { id: 'prism-drop', title: 'Prism Drop', family: 'Originals', edge: '1.6%', vol: 'Tunable', players: '3.9k', icon: 'PD', accent: '#67e8f9', mode: 'drop' },
  { id: 'vault-break', title: 'Vault Break', family: 'VIP', edge: '2.1%', vol: 'High', players: '4.6k', icon: 'VB', accent: '#86efac', mode: 'vault' },
  { id: 'neon-ladder', title: 'Neon Ladder', family: 'Originals', edge: '2.0%', vol: 'High', players: '3.3k', icon: 'NL', accent: '#a78bfa', mode: 'ladder' },
  { id: 'signal-spin', title: 'Signal Spin', family: 'Shows', edge: '1.9%', vol: 'Tunable', players: '6.2k', icon: 'SS', accent: '#fb923c', mode: 'spin' },
  { id: 'treasure-cases', title: 'Treasure Cases', family: 'Cases', edge: '3.2%', vol: 'High', players: '5.8k', icon: 'TC', accent: '#f472b6', mode: 'case' },
  { id: 'bankroll-battle', title: 'Bankroll Battle', family: 'VIP', edge: '1.4%', vol: 'Medium', players: '4.9k', icon: 'BB', accent: '#fde68a', mode: 'duel' },
  { id: 'pulse-picks', title: 'Pulse Picks', family: 'Numbers', edge: '3.5%', vol: 'High', players: '2.8k', icon: 'PP', accent: '#38bdf8', mode: 'numbers' },
  { id: 'gold-lines', title: 'Gold Lines', family: 'Reels', edge: '3.0%', vol: 'High', players: '7.2k', icon: 'GL', accent: '#facc15', mode: 'lines' },
  { id: 'turbo-keno', title: 'Turbo Keno', family: 'Numbers', edge: '3.9%', vol: 'High', players: '3.5k', icon: 'TK', accent: '#22d3ee', mode: 'numbers' },
  { id: 'royal-rush', title: 'Royal Rush', family: 'Shows', edge: '2.2%', vol: 'Medium', players: '4.2k', icon: 'RR', accent: '#fb7185', mode: 'race' },
  { id: 'lucky-lane', title: 'Lucky Lane', family: 'VIP', edge: '1.8%', vol: 'Medium', players: '3.7k', icon: 'LL', accent: '#2dd4bf', mode: 'race' },
];

const families = ['All', 'Ultimate Bourré', 'VIP', 'Originals', 'Tables', 'Reels', 'Numbers', 'Shows', 'Cases', 'Sports'];
const tokens = ['USDT-D', 'BTC-D', 'ETH-D', 'SOL-D'];
const vipRoute = '/royalty-vip-622501560fe0e185';
const coreGameIds = ['ultimate-bourre', 'crash', 'mines', 'plinko', 'roulette'];
const slotSymbols = ['A', 'K', 'Q', '7', 'BAR', 'WILD'];
const lineSymbols = ['GOLD', 'ACE', 'STAR', 'VAULT', '777', 'WILD'];
const suitSymbols = { H: '&hearts;', D: '&diams;', C: '&clubs;', S: '&spades;' };
const suitNames = { H: 'Hearts', D: 'Diamonds', C: 'Clubs', S: 'Spades' };
const redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const plinkoBuckets = {
  low: [0.4, 0.7, 1, 1.2, 1.5, 1.2, 1, 0.7, 0.4],
  medium: [0.2, 0.5, 0.9, 1.4, 2.1, 1.4, 0.9, 0.5, 0.2],
  high: [0, 0.2, 0.6, 1.8, 6.8, 1.8, 0.6, 0.2, 0],
};
const wheelMultipliers = {
  low: [0, 1.2, 1.4, 1.7, 2, 0.5, 1.1, 1.6],
  medium: [0, 0.4, 1.3, 2.1, 3.5, 0.6, 1.5, 2.8],
  high: [0, 0, 1.5, 4, 8, 0.2, 2.2, 12],
};
const studioSpinMultipliers = {
  low: [0, 0.5, 1.1, 1.3, 1.6, 2.1, 2.8, 4],
  medium: [0, 0.3, 0.8, 1.4, 2, 3.2, 5, 9],
  high: [0, 0, 0.5, 1.8, 3.5, 8, 15, 25],
};
const casePrizes = [
  { label: 'Dust', multiplier: 0 },
  { label: 'Chip Back', multiplier: 0.4 },
  { label: 'Double Crown', multiplier: 2 },
  { label: 'Vault Pull', multiplier: 4.5 },
  { label: 'VIP Burst', multiplier: 12 },
];
const raceLanes = ['Crown', 'Vault', 'Neon', 'Signal'];
const rouletteSeedNumbers = [23, 8, 31, 0, 14, 27, 2, 19, 34, 11];
const studioStats = [
  ['1', 'Ultimate Bourré powerhouse'],
  ['29', 'demo games online'],
  ['2', 'Classic and Survival'],
  ['0', 'real-money rails'],
];
const oscarCoachSteps = [
  { label: 'Access', detail: 'Users enter with a saved sandbox account, then invite codes upgrade VIP or operator roles.' },
  { label: 'Gate', detail: 'OSCAR-TOOLS grants operator tools; VIP-GOAT-ROYALTY and ANIGO-ALLEY-VIP grant private access.' },
  { label: 'Ledger', detail: 'Every game, bonus, fee, deposit, withdrawal, and vault move writes an accounting event.' },
  { label: 'Security', detail: 'Banned or suspended users are blocked, admin actions are audited, and rate limits stay on.' },
  { label: 'Compliance', detail: 'Real-money rails remain locked until email auth, KYC, AML, geofence, and payment providers are real.' },
  { label: 'Market Standard', detail: 'Benchmark against licensed readiness, audited games, fast secure banking, mobile UX, support, and responsible play.' },
];
const quickGameIds = ['ultimate-bourre', 'crash', 'dice', 'mines', 'plinko', 'blackjack', 'roulette', 'slots', 'keno', 'treasure-cases'];
const defaultProductSurfaces = [
  { id: 'casino', label: 'Casino', host: 'casino.72.61.193.184.nip.io', purpose: 'standalone casino lobby', access: 'direct', status: 'live' },
  { id: 'goat-ops', label: 'Goat Royalty', host: 'goat.72.61.193.184.nip.io', purpose: 'admin and ops access', access: 'ops', status: 'live' },
  { id: 'anigo-vip', label: 'Anigo Alley', host: 'anigoalley.com', purpose: 'secret VIP casino access', access: 'invite-only', status: 'live' },
];
const suits = ['H', 'D', 'C', 'S'];
const ranks = [
  ['A', 11],
  ['2', 2],
  ['3', 3],
  ['4', 4],
  ['5', 5],
  ['6', 6],
  ['7', 7],
  ['8', 8],
  ['9', 9],
  ['10', 10],
  ['J', 10],
  ['Q', 10],
  ['K', 10],
];

let state = {
  memberId: 'demo-oscar',
  memberName: 'Oscar',
  apiOnline: false,
  apiMessage: 'Local Demo',
  surface: 'Casino',
  vip: true,
  role: 'operator',
  status: 'active',
  permissions: ['casino.play', 'vip.enter', 'rooms.manage', 'admin.audit', 'security.maintain'],
  limits: { dailyDeposit: 5000, dailyLoss: 2500, maxTableAnte: 5000, cooldownUntil: null },
  activity: [],
  productSurfaces: defaultProductSurfaces,
  routeMode: 'lobby',
  search: '',
  favorites: ['ultimate-bourre', 'crash', 'mines'],
  recentlyPlayed: ['ultimate-bourre'],
  rooms: [],
  compliance: {
    realMoneyEnabled: false,
    kyc: 'hook-disabled',
    aml: 'hook-disabled',
    geofence: 'policy-pending',
    responsiblePlay: 'limits-and-cooldowns-ready',
  },
  adminSummary: null,
  adminAudit: [],
  walletLedger: [],
  tournaments: [],
  handHistory: [],
  security: {
    rateLimit: { status: 'active', windowSeconds: 60, maxRequests: 180 },
    adminKeyVersion: 1,
    adminKeyFingerprint: 'demo',
    lastBackup: null,
    responsiblePlay: { dailyDepositLimit: 5000, dailyLossLimit: 2500, cooldownMinutes: 20 },
  },
  selectedGame: 'ultimate-bourre',
  family: 'All',
  token: 'USDT-D',
  balance: 25000,
  bet: 100,
  risk: 'medium',
  cashout: 2.1,
  diceTarget: 50,
  rouletteBet: 'red',
  rouletteNumber: 23,
  slotReels: ['7', 'BAR', 'WILD', '7', 'BAR'],
  plinkoIndex: 4,
  plinkoPath: [0, 1, 1, 0, 1, 0, 1, 1],
  kenoPicks: [3, 7, 11, 18, 24, 32],
  kenoDraw: [1, 3, 8, 11, 18, 22, 29, 32, 37, 40],
  hiloCard: { rank: '8', suit: 'S', value: 8 },
  crash: { last: 2.1, target: 2.1, status: 'Armed', history: [1.18, 2.44, 5.2, 1.04, 8.9, 1.72] },
  plinkoLast: { risk: 'medium', path: [0, 1, 1, 0, 1, 0, 1, 1], bucket: 5, multiplier: 2.1 },
  rouletteHistory: rouletteSeedNumbers,
  bourre: {
    phase: 'ready',
    mode: 'classic',
    trump: 'H',
    pot: 760,
    ante: 25,
    sideBet: 0,
    tableFee: 10,
    trickWins: 3,
    tricksPlayed: 0,
    survivalHit: false,
    survivalArmed: false,
    room: 'Open VIP Table',
    roomId: 'room-open-vip',
    tableStatus: 'open',
    spectators: 18,
    cameraStatus: 'armed',
    dealer: 'Table Host',
    currentTrick: [],
    potBreakdown: { antes: 175, fees: 10, side: 0, bonus: 575 },
    message: 'VIP table ready',
    trickLog: ['Classic table seeded'],
    playerHand: [
      { rank: 'A', suit: 'H', value: 11 },
      { rank: 'K', suit: 'H', value: 10 },
      { rank: '10', suit: 'H', value: 10 },
      { rank: 'Q', suit: 'S', value: 10 },
      { rank: '9', suit: 'D', value: 9 },
    ],
    rivals: [
      { name: 'NOLA Ace', tricks: 1, status: 'stayed' },
      { name: 'Creole King', tricks: 1, status: 'stayed' },
      { name: 'Bayou VIP', tricks: 0, status: 'dropped' },
      { name: 'Table Host', tricks: 0, status: 'viewer' },
    ],
  },
  prototype: { id: 'crown-run', mode: 'surge', result: 'Ready', labels: ['1.18x', '1.45x', '2.20x', '4.80x', '12.0x'], highlights: [2], multiplier: 2.2 },
  mines: null,
  blackjack: null,
  ledger: [
    { game: 'Ultimate Bourré', detail: 'Classic table - 3 tricks won', multiplier: 2.4, stake: 100, payout: 240, win: true, seed: 'demo-a91f' },
    { game: 'Roulette', detail: 'Red 23', multiplier: 2, stake: 75, payout: 150, win: true, seed: 'demo-f44c' },
    { game: 'Mines', detail: 'Six clean tiles', multiplier: 3.24, stake: 120, payout: 388.8, win: true, seed: 'demo-0bd2' },
  ],
  bank: {
    vault: 5200,
    pending: 0,
    accounts: [
      { id: 'checking', name: 'Demo Checking', mask: '8842', type: 'ACH', balance: 12840.25, status: 'Verified' },
      { id: 'savings', name: 'Prize Reserve', mask: '2280', type: 'Savings', balance: 7600, status: 'Verified' },
      { id: 'wire', name: 'Wire Desk', mask: '5519', type: 'Wire', balance: 50000, status: 'Manual Review' },
    ],
    cards: [
      { id: 'virtual', name: 'Virtual Cashier', mask: '1044', limit: 2500, spent: 410, frozen: false },
      { id: 'vip', name: 'VIP Black Card', mask: '7771', limit: 10000, spent: 2400, frozen: false },
      { id: 'reserve', name: 'Reserve Card', mask: '3902', limit: 1500, spent: 0, frozen: true },
    ],
    ledger: [
      { type: 'Deposit', detail: 'Demo Checking to casino wallet', amount: 1500, status: 'Settled', id: 'bank-a11f' },
      { type: 'Vault', detail: 'Casino wallet to cold vault', amount: 800, status: 'Locked', id: 'bank-c42d' },
      { type: 'Card', detail: 'Reserve Card frozen by risk control', amount: 0, status: 'Control', id: 'bank-f90e' },
    ],
  },
};

const els = {
  surfaceStatus: document.getElementById('surface-status'),
  apiStatus: document.getElementById('api-status'),
  memberStatus: document.getElementById('member-status'),
  vipStatus: document.getElementById('vip-status'),
  surfaceGrid: document.getElementById('surface-grid'),
  loginMemberId: document.getElementById('login-member-id'),
  loginName: document.getElementById('login-name'),
  loginAccount: document.getElementById('login-account'),
  registerAccount: document.getElementById('register-account'),
  sidebarAccountSummary: document.getElementById('sidebar-account-summary'),
  oscarCoach: document.getElementById('oscar-coach'),
  accountSummary: document.getElementById('account-summary'),
  walletLedger: document.getElementById('wallet-ledger'),
  securitySummary: document.getElementById('security-summary'),
  rotateAdminKey: document.getElementById('rotate-admin-key'),
  createBackup: document.getElementById('create-backup'),
  wallet: document.getElementById('wallet-balance'),
  quickWallet: document.getElementById('quick-wallet-balance'),
  tokens: document.getElementById('token-grid'),
  quickGames: document.getElementById('quick-game-dock'),
  gameRouteBar: document.getElementById('game-route-bar'),
  gameRouteTitle: document.getElementById('game-route-title'),
  gameRouteMeta: document.getElementById('game-route-meta'),
  gameCount: document.getElementById('game-count'),
  wageredTotal: document.getElementById('wagered-total'),
  returnTotal: document.getElementById('return-total'),
  bet: document.getElementById('bet-amount'),
  cashout: document.getElementById('cashout-target'),
  cashoutLabel: document.getElementById('cashout-label'),
  dice: document.getElementById('dice-target'),
  diceLabel: document.getElementById('dice-label'),
  search: document.getElementById('game-search'),
  favoritesRail: document.getElementById('favorites-rail'),
  recentRail: document.getElementById('recent-rail'),
  premiumShelves: document.getElementById('premium-shelves'),
  favoriteCurrent: document.getElementById('favorite-current'),
  studioStrip: document.getElementById('studio-strip'),
  families: document.getElementById('family-tabs'),
  games: document.getElementById('games-grid'),
  activeTitle: document.getElementById('active-game-title'),
  arenaTitle: document.getElementById('arena-title'),
  arenaEdge: document.getElementById('arena-edge'),
  arena: document.getElementById('arena'),
  receipt: document.getElementById('last-receipt'),
  ledger: document.getElementById('ledger-list'),
  wins: document.getElementById('wins-count'),
  ledgerWagered: document.getElementById('ledger-wagered'),
  ledgerReturned: document.getElementById('ledger-returned'),
  bankTotal: document.getElementById('bank-total'),
  vaultTotal: document.getElementById('vault-total'),
  pendingTotal: document.getElementById('pending-total'),
  bankAccount: document.getElementById('bank-account'),
  bankAction: document.getElementById('bank-action'),
  bankAmount: document.getElementById('bank-amount'),
  bankMemo: document.getElementById('bank-memo'),
  bankAccounts: document.getElementById('bank-accounts'),
  bankCards: document.getElementById('card-grid'),
  bankLedger: document.getElementById('bank-ledger'),
  vipCode: document.getElementById('vip-code'),
  redeemVip: document.getElementById('redeem-vip'),
  vipResult: document.getElementById('vip-result'),
  roomsList: document.getElementById('rooms-list'),
  roomName: document.getElementById('room-name'),
  createRoom: document.getElementById('create-room'),
  tournamentsList: document.getElementById('tournaments-list'),
  tournamentName: document.getElementById('tournament-name'),
  createTournament: document.getElementById('create-tournament'),
  spectatorPanel: document.getElementById('spectator-panel'),
  handHistoryList: document.getElementById('hand-history-list'),
  adminSummary: document.getElementById('admin-summary'),
  adminNote: document.getElementById('admin-note'),
  adminAction: document.getElementById('admin-action'),
  adminAudit: document.getElementById('admin-audit'),
  kycStatus: document.getElementById('kyc-status'),
  amlStatus: document.getElementById('aml-status'),
  geofenceStatus: document.getElementById('geofence-status'),
  responsibleStatus: document.getElementById('responsible-status'),
};

function money(value) {
  return `${round(value).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${state.token}`;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(items) {
  return items[rand(0, items.length - 1)];
}

function seed() {
  return `demo-${Math.random().toString(16).slice(2, 8)}`;
}

function multiplier(value) {
  return `${Number(value).toFixed(value >= 10 ? 1 : 2)}x`;
}

function currentSurface() {
  const host = window.location.hostname;
  const vipPath = window.location.pathname === vipRoute || window.location.pathname.startsWith(`${vipRoute}/`);
  if (host.includes('goat')) return 'Goat Royalty Ops';
  if (host.includes('anigoalley') && vipPath) return 'Anigo Alley VIP';
  if (vipPath) return 'Secret VIP';
  return 'Casino';
}

function compactTime(value) {
  if (!value) return 'now';
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function currentGame() {
  return games.find((game) => game.id === state.selectedGame) || games[0];
}

function assetPath(filePath) {
  const base = window.CASINO_ASSET_BASE || routeBase() || '/';
  return `${base}${String(filePath).replace(/^\.?\//, '')}`;
}

function displayTitle(game, context = 'short') {
  if (!game) return '';
  if (context === 'table') return game.tableTitle || game.shortTitle || game.title;
  if (context === 'official') return game.title;
  return game.shortTitle || game.title;
}

function routeBase() {
  const pathName = window.location.pathname;
  return pathName === vipRoute || pathName.startsWith(`${vipRoute}/`) ? vipRoute : '';
}

function routePath() {
  const base = routeBase();
  const pathName = window.location.pathname;
  return base ? pathName.slice(base.length) || '/' : pathName;
}

function gameIdFromRoute() {
  const match = routePath().match(/^\/games\/([^/]+)/);
  if (!match) return null;
  const gameId = decodeURIComponent(match[1]);
  return games.some((game) => game.id === gameId) ? gameId : null;
}

function gameRoute(gameId) {
  return `${routeBase()}/games/${encodeURIComponent(gameId)}/`;
}

function lobbyRoute() {
  return `${routeBase() || ''}/`;
}

function applyRouteFromLocation() {
  const gameId = gameIdFromRoute();
  if (gameId) {
    state.selectedGame = gameId;
    state.routeMode = 'game';
  } else {
    state.routeMode = 'lobby';
  }
}

function openGameRoute(gameId) {
  const game = games.find((item) => item.id === gameId);
  if (!game) return;
  state.selectedGame = game.id;
  state.routeMode = 'game';
  rememberGame(game.id);
  const nextUrl = gameRoute(game.id);
  if (window.location.pathname !== nextUrl) window.history.pushState({ gameId: game.id }, '', nextUrl);
  renderAll();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openLobbyRoute() {
  state.routeMode = 'lobby';
  const nextUrl = lobbyRoute();
  if (window.location.pathname !== nextUrl) window.history.pushState({ lobby: true }, '', nextUrl);
  renderAll();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deck() {
  return suits.flatMap((suit) => ranks.map(([rank, value]) => ({ rank, value, suit }))).sort(() => Math.random() - 0.5);
}

function handValue(cards) {
  let value = cards.reduce((total, card) => total + card.value, 0);
  let aces = cards.filter((card) => card.rank === 'A').length;
  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }
  return value;
}

function baccaratValue(cards) {
  return cards.reduce((total, card) => total + (card.value > 9 ? 0 : card.value), 0) % 10;
}

function rouletteColor(number) {
  if (number === 0) return 'green';
  return redNumbers.has(number) ? 'red' : 'black';
}

function crashNumber() {
  const roll = Math.max(0.002, 1 - Math.random());
  return Math.min(80, Math.max(1, round((0.97 / roll) * 0.72)));
}

function riskScale(low, medium, high) {
  return state.risk === 'high' ? high : state.risk === 'low' ? low : medium;
}

function uniqueNumbers(count, max) {
  const values = new Set();
  while (values.size < count) values.add(rand(1, max));
  return Array.from(values).sort((a, b) => a - b);
}

async function apiFetch(path, options = {}) {
  const response = await fetch(apiPath(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok || payload.ok === false) throw new Error(payload.error || `API ${response.status}`);
  return payload;
}

function apiPath(path) {
  const isVipRoute = window.location.pathname === vipRoute || window.location.pathname.startsWith(`${vipRoute}/`);
  return isVipRoute ? `${vipRoute}${path}` : path;
}

function applyMember(member) {
  if (!member) return;
  state.memberId = member.id || state.memberId;
  state.memberName = member.displayName || state.memberName;
  state.role = member.role || state.role;
  state.status = member.status || state.status;
  state.vip = Boolean(member.vip);
  state.balance = round(member.balance ?? state.balance);
  state.token = member.token || state.token;
  state.permissions = member.permissions || state.permissions;
  state.limits = member.limits || state.limits;
  state.activity = member.activity || state.activity;
  state.favorites = member.favorites || state.favorites;
  state.recentlyPlayed = member.recentlyPlayed || state.recentlyPlayed;
  if (member.bank) state.bank = member.bank;
}

async function loadBackend() {
  try {
    const payload = await apiFetch(`/api/bootstrap?member=${encodeURIComponent(state.memberId)}`);
    state.apiOnline = true;
    state.apiMessage = 'Server Saved';
    applyMember(payload.member);
    if (payload.receipts?.length) state.ledger = payload.receipts;
    state.productSurfaces = payload.productSurfaces || state.productSurfaces;
    state.rooms = payload.rooms || state.rooms;
    state.tournaments = payload.tournaments || state.tournaments;
    state.handHistory = payload.handHistory || state.handHistory;
    state.walletLedger = payload.walletLedger || state.walletLedger;
    state.security = payload.security || state.security;
    state.compliance = payload.compliance || state.compliance;
    state.adminSummary = payload.adminSummary || state.adminSummary;
    await loadAdminSummary();
    renderAll();
  } catch (error) {
    state.apiOnline = false;
    state.apiMessage = 'Local Demo';
    renderSystemPanels();
  }
}

async function loadAdminSummary() {
  try {
    const payload = await apiFetch('/api/admin/summary', { headers: { 'X-Oscar-Key': 'oscar-demo-key' } });
    state.adminSummary = payload.summary;
    state.adminAudit = payload.audit || [];
    state.productSurfaces = payload.productSurfaces || state.productSurfaces;
    state.rooms = payload.rooms || state.rooms;
    state.tournaments = payload.tournaments || state.tournaments;
    state.handHistory = payload.handHistory || state.handHistory;
    state.walletLedger = payload.walletLedger || state.walletLedger;
    state.security = payload.security || state.security;
    state.compliance = payload.compliance || state.compliance;
  } catch (error) {
    state.adminAudit = [{ action: 'admin-summary-local', detail: 'Oscar tools are waiting for the server API', createdAt: new Date().toISOString() }];
  }
}

async function syncReceipt(entry) {
  if (!state.apiOnline) return;
  try {
    const game = games.find((item) => item.title === entry.game) || currentGame();
    const payload = await apiFetch('/api/receipts', {
      method: 'POST',
      body: JSON.stringify({
        ...entry,
        memberId: state.memberId,
        gameId: game.id,
        balance: state.balance,
        token: state.token,
      }),
    });
    applyMember(payload.member);
    state.adminSummary = payload.summary || state.adminSummary;
    state.walletLedger = payload.walletLedger || state.walletLedger;
    renderAll();
  } catch (error) {
    state.apiOnline = false;
    state.apiMessage = 'Local Demo';
    renderSystemPanels();
  }
}

async function syncBourreHand(hand) {
  if (!state.apiOnline) return;
  try {
    const payload = await apiFetch('/api/bourre/history', {
      method: 'POST',
      body: JSON.stringify({ ...hand, memberId: state.memberId }),
    });
    state.handHistory = payload.handHistory || state.handHistory;
    renderSystemPanels();
  } catch (error) {
    state.apiOnline = false;
    state.apiMessage = 'Local Demo';
    renderSystemPanels();
  }
}

function rememberGame(gameId) {
  state.recentlyPlayed = [gameId, ...state.recentlyPlayed.filter((item) => item !== gameId)].slice(0, 12);
}

function commit(result) {
  const entry = { ...result, seed: result.seed || seed() };
  state.balance = round(Math.max(0, state.balance - result.stake + result.payout));
  state.ledger = [entry, ...state.ledger].slice(0, 12);
  walletEvent('game-settlement', `${entry.game}: ${entry.detail}`, entry.stake, entry.payout, 0, entry.win ? 'Settled' : 'Settled');
  rememberGame(currentGame().id);
  renderAll();
  syncReceipt(entry);
}

function stake() {
  const value = Math.max(1, Number(els.bet.value) || 1);
  state.bet = Math.min(value, Math.max(1, state.balance));
  els.bet.value = state.bet;
  return state.bet;
}

function play() {
  const game = state.selectedGame;
  const amount = stake();
  if (amount > state.balance) return;

  const runners = {
    crash: playCrash,
    'ultimate-bourre': playBourre,
    dice: playDice,
    mines: startMines,
    plinko: playPlinko,
    roulette: playRoulette,
    blackjack: startBlackjack,
    baccarat: playBaccarat,
    slots: playSlots,
    limbo: playLimbo,
    keno: playKeno,
    wheel: playWheel,
    hilo: () => playHilo('higher'),
    towers: playTowers,
    'video-poker': playVideoPoker,
    'coin-flip': playCoinFlip,
    sportsbook: playSportsbook,
  };

  (runners[game] || playPrototype)(amount);
}

function playBourre(amount) {
  if (state.bourre.phase !== 'playing') {
    dealBourreHand(amount);
    return;
  }
  playBourreTrick();
}

function cardLabel(card) {
  return `${card.rank}${card.suit}`;
}

function dealBourreHand(amount = stake()) {
  const cards = deck();
  const trump = pick(suits);
  const playerHand = cards.splice(0, 5).sort((a, b) => bourreCardPower(b, trump) - bourreCardPower(a, trump));
  const room = state.rooms.find((item) => item.id === state.bourre.roomId) || state.rooms.find((item) => item.game === 'Ultimate Bourré') || {};
  const sideBet = state.bourre.mode === 'survival' ? round(amount * 0.25) : 0;
  const tableFee = Math.max(1, round((room.minAnte || amount) * 0.04));
  const rivals = ['NOLA Ace', 'Creole King', 'Bayou VIP', 'Table Host', 'River Shark', 'Crescent Queen']
    .slice(0, rand(3, 6))
    .map((name) => ({
      name,
      tricks: 0,
      status: Math.random() > 0.12 ? 'stayed' : 'dropped',
      hand: cards.splice(0, 5).sort((a, b) => bourreCardPower(b, trump) - bourreCardPower(a, trump)),
    }));
  const activeCount = rivals.filter((rival) => rival.status !== 'dropped').length + 1;
  const antePool = round(amount * activeCount);
  const sidePool = round(sideBet * activeCount);
  const tablePot = round(antePool + sidePool + rand(80, 460));
  state.bourre = {
    ...state.bourre,
    phase: 'playing',
    stake: amount,
    handId: seed(),
    deck: cards,
    trump,
    pot: tablePot,
    sideBet,
    tableFee,
    trickWins: 0,
    tricksPlayed: 0,
    survivalHit: false,
    survivalArmed: state.bourre.mode === 'survival',
    playerHand,
    rivals,
    room: room.name || state.bourre.room || 'Open VIP Table',
    roomId: room.id || state.bourre.roomId || 'room-open-vip',
    tableStatus: room.status || 'open',
    spectators: room.spectators || room.viewers || state.bourre.spectators || 18,
    cameraStatus: room.cameraStatus || (room.camera ? 'armed' : 'off'),
    dealer: pick(['Table Host', 'NOLA Ace', 'Creole King', 'Bayou VIP']),
    currentTrick: [],
    potBreakdown: { antes: antePool, fees: tableFee, side: sidePool, bonus: round(tablePot - antePool - sidePool) },
    message: `${state.bourre.mode} hand dealt. Trump is ${suitNames[trump]}.`,
    trickLog: [`Ante ${money(amount)} posted`, sideBet ? `Survival side save ${money(sideBet)} armed` : 'Classic winner-take-pot rules', `${suitNames[trump]} is trump`],
  };
  renderAll();
}

function playBourreTrick() {
  const b = state.bourre;
  if (b.phase !== 'playing' || !b.playerHand.length) return;
  const card = b.playerHand.shift();
  const trickCards = [{ name: 'You', card, score: bourreCardPower(card, b.trump) + rand(0, 4), main: true }];
  b.rivals.filter((rival) => rival.status !== 'dropped').forEach((rival) => {
    const rivalCard = rival.hand?.shift() || b.deck?.shift() || pick(deck());
    trickCards.push({ name: rival.name, rival, card: rivalCard, score: bourreCardPower(rivalCard, b.trump) + rand(0, 4) });
  });
  const winner = trickCards.sort((a, bScore) => bScore.score - a.score)[0];
  const wonTrick = winner?.main;

  b.tricksPlayed += 1;
  if (wonTrick) {
    b.trickWins += 1;
    b.message = `Trick ${b.tricksPlayed}: you pulled it with ${cardLabel(card)}.`;
  } else {
    winner.rival.tricks += 1;
    b.message = `Trick ${b.tricksPlayed}: ${winner.rival.name} took it with ${cardLabel(winner.card)}.`;
  }
  b.currentTrick = trickCards.map((item) => ({ name: item.name, card: cardLabel(item.card), score: item.score }));
  b.trickLog = [b.message, ...(b.trickLog || [])].slice(0, 8);

  if (b.tricksPlayed >= 5 || b.playerHand.length === 0) {
    settleBourreRound();
    return;
  }

  renderAll();
}

function settleBourreRound(forceDrop = false) {
  const b = state.bourre;
  const amount = b.stake || stake();
  const maxRival = Math.max(0, ...b.rivals.map((rival) => rival.tricks));
  const wonPot = !forceDrop && b.trickWins > maxRival && b.trickWins > 0;
  const bourred = b.trickWins === 0;
  const survivalHit = !forceDrop && b.mode === 'survival' && b.survivalArmed && !wonPot && Math.random() > 0.38;
  const pay = wonPot
    ? round(b.trickWins >= 4 ? 3.8 : 2.4)
    : survivalHit
      ? round(bourred ? 1.65 : 1.25)
      : 0;
  const detail = forceDrop
    ? `Dropped after ${b.tricksPlayed} tricks`
    : wonPot
      ? `${b.mode} - ${b.trickWins} tricks won`
      : survivalHit
        ? `Survival save - ${b.trickWins} tricks`
        : bourred
          ? 'Ultimate Bourré - no tricks taken'
          : `${b.trickWins} tricks / pot missed`;
  const rivalWinner = [...b.rivals].sort((a, winner) => winner.tricks - a.tricks)[0];
  const winner = wonPot ? 'You' : survivalHit ? 'Survival Side Save' : rivalWinner?.name || 'Table';
  const hand = {
    id: b.handId || seed(),
    room: b.room,
    mode: b.mode,
    trump: b.trump,
    ante: amount,
    pot: b.pot,
    result: detail,
    tricksWon: b.trickWins,
    payout: round(amount * pay),
    winner,
    log: [detail, ...(b.trickLog || [])].slice(0, 12),
  };

  state.bourre = {
    ...b,
    phase: 'complete',
    survivalHit,
    survivalArmed: false,
    message: pay >= 1 ? `Round paid ${multiplier(pay)}.` : 'Round settled with no win.',
    trickLog: [detail, ...(b.trickLog || [])].slice(0, 8),
  };
  state.handHistory = [hand, ...state.handHistory].slice(0, 24);
  syncBourreHand(hand);

  commit({
    game: 'Ultimate Bourré',
    detail,
    multiplier: pay,
    stake: amount,
    payout: round(amount * pay),
    win: pay >= 1,
    seed: hand.id,
  });
}

function dropBourreHand() {
  if (state.bourre.phase !== 'playing') return;
  settleBourreRound(true);
}

function armSurvivalSave() {
  state.bourre.mode = 'survival';
  state.bourre.message = 'Survival side action armed for this hand.';
  state.bourre.trickLog = [state.bourre.message, ...(state.bourre.trickLog || [])].slice(0, 8);
  renderAll();
}

function bourreCardPower(card, trump) {
  const rankPower = card.rank === 'A' ? 14 : card.rank === 'K' ? 13 : card.rank === 'Q' ? 12 : card.rank === 'J' ? 11 : Number(card.rank) || card.value;
  return rankPower + (card.suit === trump ? 20 : 0);
}

function playCrash(amount) {
  const crashAt = crashNumber();
  const win = crashAt >= state.cashout;
  state.crash = {
    last: crashAt,
    target: state.cashout,
    status: win ? 'Cashed' : 'Crashed',
    history: [crashAt, ...((state.crash && state.crash.history) || [])].slice(0, 8),
  };
  commit({
    game: 'Crash',
    detail: `Crash ${multiplier(crashAt)} / target ${multiplier(state.cashout)}`,
    multiplier: win ? state.cashout : 0,
    stake: amount,
    payout: win ? round(amount * state.cashout) : 0,
    win,
  });
}

function playDice(amount) {
  const roll = round(Math.random() * 100);
  const pay = round(98 / Math.max(1, 100 - state.diceTarget));
  const win = roll > state.diceTarget;
  commit({
    game: 'Dice',
    detail: `Rolled ${roll.toFixed(2)} over ${state.diceTarget}`,
    multiplier: win ? pay : 0,
    stake: amount,
    payout: win ? round(amount * pay) : 0,
    win,
  });
}

function playPlinko(amount) {
  const path = Array.from({ length: 8 }, () => rand(0, 1));
  const index = path.reduce((total, step) => total + step, 0);
  const pay = plinkoBuckets[state.risk][index];
  state.plinkoPath = path;
  state.plinkoIndex = index;
  state.plinkoLast = {
    risk: state.risk,
    path,
    bucket: index + 1,
    multiplier: pay,
  };
  commit({
    game: 'Plinko',
    detail: `${state.risk} bucket ${index + 1}`,
    multiplier: pay,
    stake: amount,
    payout: round(amount * pay),
    win: pay > 1,
  });
}

function playRoulette(amount) {
  const number = rand(0, 36);
  const color = rouletteColor(number);
  const pay = state.rouletteBet === 'green' ? 14 : 2;
  const win = state.rouletteBet === color;
  state.rouletteNumber = number;
  state.rouletteHistory = [number, ...(state.rouletteHistory || [])].slice(0, 12);
  commit({
    game: 'Roulette',
    detail: `${number} ${color}`,
    multiplier: win ? pay : 0,
    stake: amount,
    payout: win ? round(amount * pay) : 0,
    win,
  });
}

function playBaccarat(amount) {
  const cards = deck();
  const player = [cards.pop(), cards.pop()];
  const banker = [cards.pop(), cards.pop()];
  if (baccaratValue(player) < 6) player.push(cards.pop());
  if (baccaratValue(banker) < 6) banker.push(cards.pop());
  const playerValue = baccaratValue(player);
  const bankerValue = baccaratValue(banker);
  const win = bankerValue >= playerValue;
  commit({
    game: 'Baccarat',
    detail: `Banker ${bankerValue} / Player ${playerValue}`,
    multiplier: win ? 1.95 : 0,
    stake: amount,
    payout: win ? round(amount * 1.95) : 0,
    win,
  });
}

function playSlots(amount) {
  const reels = Array.from({ length: 5 }, () => pick(slotSymbols));
  const counts = reels.reduce((acc, symbol) => ({ ...acc, [symbol]: (acc[symbol] || 0) + 1 }), {});
  const best = Math.max(...Object.values(counts));
  const pay = reels.includes('WILD') && best >= 3 ? best * 1.6 : best >= 3 ? best * 1.1 : 0;
  state.slotReels = reels;
  commit({
    game: 'Slots',
    detail: reels.join(' - '),
    multiplier: pay,
    stake: amount,
    payout: round(amount * pay),
    win: pay > 0,
  });
}

function playLimbo(amount) {
  const outcome = crashNumber();
  const win = outcome >= state.cashout;
  commit({
    game: 'Limbo',
    detail: `Result ${multiplier(outcome)}`,
    multiplier: win ? state.cashout : 0,
    stake: amount,
    payout: win ? round(amount * state.cashout) : 0,
    win,
  });
}

function playKeno(amount) {
  const draw = new Set();
  while (draw.size < 10) draw.add(rand(1, 40));
  state.kenoDraw = Array.from(draw).sort((a, b) => a - b);
  const hits = state.kenoPicks.filter((number) => draw.has(number)).length;
  const pay = hits >= 6 ? hits * 2.2 : hits >= 4 ? hits * 0.9 : hits >= 3 ? 1.2 : 0;
  commit({
    game: 'Keno',
    detail: `${hits}/${state.kenoPicks.length} hits`,
    multiplier: pay,
    stake: amount,
    payout: round(amount * pay),
    win: pay > 0,
  });
}

function playWheel(amount) {
  const segment = rand(0, wheelMultipliers[state.risk].length - 1);
  const pay = wheelMultipliers[state.risk][segment];
  commit({
    game: 'Wheel',
    detail: `${state.risk} segment ${segment + 1}`,
    multiplier: pay,
    stake: amount,
    payout: round(amount * pay),
    win: pay > 1,
  });
}

function playHilo(direction) {
  const amount = stake();
  const next = pick(deck());
  const win = direction === 'higher' ? next.value >= state.hiloCard.value : next.value <= state.hiloCard.value;
  const detail = `${state.hiloCard.rank}${state.hiloCard.suit} to ${next.rank}${next.suit}`;
  state.hiloCard = next;
  commit({
    game: 'Hi-Lo',
    detail,
    multiplier: win ? 1.92 : 0,
    stake: amount,
    payout: win ? round(amount * 1.92) : 0,
    win,
  });
}

function playTowers(amount) {
  const floors = rand(0, state.risk === 'high' ? 8 : state.risk === 'medium' ? 6 : 5);
  const pay = floors === 0 ? 0 : round(1 + floors * (state.risk === 'high' ? 0.72 : state.risk === 'medium' ? 0.48 : 0.28));
  commit({
    game: 'Towers',
    detail: `${floors} floors cleared`,
    multiplier: pay,
    stake: amount,
    payout: round(amount * pay),
    win: pay > 1,
  });
}

function playVideoPoker(amount) {
  const cards = deck().slice(0, 5);
  const counts = Object.values(cards.reduce((acc, card) => ({ ...acc, [card.rank]: (acc[card.rank] || 0) + 1 }), {})).sort((a, b) => b - a);
  const flush = cards.every((card) => card.suit === cards[0].suit);
  const pay = flush && counts[0] === 1 ? 9 : counts[0] === 4 ? 8 : counts[0] === 3 && counts[1] === 2 ? 6 : flush ? 5 : counts[0] === 3 ? 3 : counts[0] === 2 && counts[1] === 2 ? 2.2 : counts[0] === 2 ? 1.4 : 0;
  commit({
    game: 'Video Poker',
    detail: cards.map((card) => `${card.rank}${card.suit}`).join(' '),
    multiplier: pay,
    stake: amount,
    payout: round(amount * pay),
    win: pay > 0,
  });
}

function playCoinFlip(amount) {
  const side = Math.random() > 0.5 ? 'Heads' : 'Tails';
  const win = side === 'Heads';
  commit({
    game: 'Coin Flip',
    detail: side,
    multiplier: win ? 1.98 : 0,
    stake: amount,
    payout: win ? round(amount * 1.98) : 0,
    win,
  });
}

function playSportsbook(amount) {
  const odds = pick([1.72, 1.91, 2.14, 2.65, 3.2]);
  const win = Math.random() > 1 / odds;
  commit({
    game: 'Sportsbook',
    detail: `Demo line ${multiplier(odds)}`,
    multiplier: win ? odds : 0,
    stake: amount,
    payout: win ? round(amount * odds) : 0,
    win,
  });
}

function playPrototype(amount) {
  const game = currentGame();
  const mode = game.mode || 'spin';
  let pay = 0;
  let detail = '';
  const visual = {
    id: game.id,
    mode,
    accent: game.accent,
    result: 'Settled',
    labels: [],
    highlights: [],
    multiplier: 0,
  };

  if (mode === 'surge') {
    const outcome = crashNumber();
    const win = outcome >= state.cashout;
    pay = win ? state.cashout : 0;
    detail = `Surge ${multiplier(outcome)} / target ${multiplier(state.cashout)}`;
    visual.result = multiplier(outcome);
    visual.labels = [1.08, 1.35, 1.85, state.cashout, 7.5, 18].map(multiplier);
    visual.highlights = [win ? 3 : rand(0, 2)];
  }

  if (mode === 'drop') {
    const path = Array.from({ length: 8 }, () => rand(0, 1));
    const index = path.reduce((total, step) => total + step, 0);
    pay = plinkoBuckets[state.risk][index];
    detail = `${state.risk} prism bucket ${index + 1}`;
    visual.result = multiplier(pay);
    visual.labels = plinkoBuckets[state.risk].map(multiplier);
    visual.highlights = [index];
  }

  if (mode === 'vault') {
    const locks = 6;
    const opened = rand(0, locks);
    pay = opened === 0 ? 0 : round(1 + opened * riskScale(0.22, 0.36, 0.58));
    detail = `${opened}/${locks} locks opened`;
    visual.result = `${opened} open`;
    visual.labels = Array.from({ length: locks }, (_, index) => index < opened ? 'OPEN' : 'LOCK');
    visual.highlights = Array.from({ length: opened }, (_, index) => index);
  }

  if (mode === 'ladder') {
    const floors = rand(0, riskScale(5, 7, 9));
    pay = floors === 0 ? 0 : round(1 + floors * riskScale(0.24, 0.42, 0.7));
    detail = `${floors} neon floors cleared`;
    visual.result = multiplier(pay);
    visual.labels = Array.from({ length: 9 }, (_, index) => `${index + 1}`);
    visual.highlights = Array.from({ length: floors }, (_, index) => index);
  }

  if (mode === 'spin') {
    const values = studioSpinMultipliers[state.risk];
    const index = rand(0, values.length - 1);
    pay = values[index];
    detail = `${state.risk} signal segment ${index + 1}`;
    visual.result = multiplier(pay);
    visual.labels = values.map(multiplier);
    visual.highlights = [index];
  }

  if (mode === 'case') {
    const prize = pick(casePrizes);
    pay = prize.multiplier;
    detail = prize.label;
    visual.result = prize.label;
    visual.labels = casePrizes.map((item) => item.label);
    visual.highlights = [casePrizes.indexOf(prize)];
  }

  if (mode === 'duel') {
    const player = rand(1, 100);
    const house = rand(1, 100);
    pay = player > house ? player - house > 35 ? 3.6 : 1.92 : 0;
    detail = `You ${player} / House ${house}`;
    visual.result = multiplier(pay);
    visual.labels = [`You ${player}`, `House ${house}`, player > house ? 'CLEAR' : 'STOP'];
    visual.highlights = player > house ? [0, 2] : [1];
  }

  if (mode === 'numbers') {
    const picks = uniqueNumbers(5, 20);
    const draw = uniqueNumbers(7, 20);
    const hits = picks.filter((number) => draw.includes(number)).length;
    pay = hits >= 5 ? 12 : hits === 4 ? 5.2 : hits === 3 ? 2 : hits === 2 ? 0.8 : 0;
    detail = `${hits}/5 pulse hits`;
    visual.result = `${hits} hits`;
    visual.picks = picks;
    visual.draw = draw;
  }

  if (mode === 'lines') {
    const reels = Array.from({ length: 5 }, () => pick(lineSymbols));
    const counts = reels.reduce((acc, symbol) => ({ ...acc, [symbol]: (acc[symbol] || 0) + 1 }), {});
    const best = Math.max(...Object.values(counts));
    pay = reels.includes('WILD') && best >= 3 ? best * 2 : best >= 4 ? best * 1.7 : best >= 3 ? best * 1.05 : 0;
    detail = reels.join(' - ');
    visual.result = multiplier(pay);
    visual.reels = reels;
  }

  if (mode === 'race') {
    const scores = raceLanes.map((lane) => ({ lane, score: rand(45, 100) })).sort((a, b) => b.score - a.score);
    const winner = scores[0];
    pay = winner.lane === raceLanes[0] ? 3.2 : winner.lane === raceLanes[1] ? 1.8 : 0;
    detail = `${winner.lane} lane won`;
    visual.result = `${winner.lane} ${winner.score}`;
    visual.lanes = scores;
    visual.highlights = [winner.lane];
  }

  visual.multiplier = pay;
  state.prototype = visual;
  commit({
    game: game.title,
    detail,
    multiplier: pay,
    stake: amount,
    payout: round(amount * pay),
    win: pay >= 1,
  });
}

function startMines(amount) {
  const count = state.risk === 'high' ? 8 : state.risk === 'medium' ? 5 : 3;
  const mines = new Set();
  while (mines.size < count) mines.add(rand(0, 24));
  state.balance = round(Math.max(0, state.balance - amount));
  state.mines = { stake: amount, mines: Array.from(mines), revealed: [], status: 'active', multiplier: 1 };
  renderAll();
}

function revealMine(index) {
  if (!state.mines || state.mines.status !== 'active' || state.mines.revealed.includes(index)) return;
  if (state.mines.mines.includes(index)) {
    const entry = { game: 'Mines', detail: `Mine on tile ${index + 1}`, multiplier: 0, stake: state.mines.stake, payout: 0, win: false, seed: seed() };
    state.mines.status = 'lost';
    state.ledger = [entry, ...state.ledger].slice(0, 12);
    renderAll();
    return;
  }
  state.mines.revealed.push(index);
  state.mines.multiplier = round(1 + state.mines.revealed.length * (state.risk === 'high' ? 0.44 : state.risk === 'medium' ? 0.31 : 0.2));
  renderAll();
}

function cashoutMines() {
  if (!state.mines || state.mines.status !== 'active' || state.mines.revealed.length === 0) return;
  const payout = round(state.mines.stake * state.mines.multiplier);
  const entry = { game: 'Mines', detail: `${state.mines.revealed.length} clean tiles`, multiplier: state.mines.multiplier, stake: state.mines.stake, payout, win: true, seed: seed() };
  state.balance = round(state.balance + payout);
  state.mines.status = 'won';
  state.ledger = [entry, ...state.ledger].slice(0, 12);
  renderAll();
}

function startBlackjack(amount) {
  const cards = deck();
  const player = [cards.pop(), cards.pop()];
  const dealer = [cards.pop(), cards.pop()];
  state.balance = round(Math.max(0, state.balance - amount));
  state.blackjack = { stake: amount, deck: cards, player, dealer, status: 'active', message: 'Live hand' };
  renderAll();
}

function hitBlackjack() {
  const roundState = state.blackjack;
  if (!roundState || roundState.status !== 'active') return;
  roundState.player.push(roundState.deck.pop());
  const value = handValue(roundState.player);
  if (value > 21) {
    roundState.status = 'lost';
    roundState.message = `Bust ${value}`;
    state.ledger = [{ game: 'Blackjack', detail: roundState.message, multiplier: 0, stake: roundState.stake, payout: 0, win: false, seed: seed() }, ...state.ledger].slice(0, 12);
  }
  renderAll();
}

function standBlackjack() {
  const roundState = state.blackjack;
  if (!roundState || roundState.status !== 'active') return;
  while (handValue(roundState.dealer) < 17) roundState.dealer.push(roundState.deck.pop());
  const playerValue = handValue(roundState.player);
  const dealerValue = handValue(roundState.dealer);
  const win = dealerValue > 21 || playerValue > dealerValue;
  const push = playerValue === dealerValue;
  const payout = push ? roundState.stake : win ? round(roundState.stake * 2) : 0;
  if (payout) state.balance = round(state.balance + payout);
  roundState.status = push ? 'push' : win ? 'won' : 'lost';
  roundState.message = `Player ${playerValue} / Dealer ${dealerValue}`;
  state.ledger = [{ game: 'Blackjack', detail: roundState.message, multiplier: push ? 1 : win ? 2 : 0, stake: roundState.stake, payout, win: win || push, seed: seed() }, ...state.ledger].slice(0, 12);
  renderAll();
}

function renderAll() {
  renderRouteMode();
  renderSystemPanels();
  renderSurfaceGrid();
  renderAccountSecurity();
  renderWallet();
  renderQuickGames();
  renderBanking();
  renderStudioStrip();
  renderPremiumShelves();
  renderFamilies();
  renderGames();
  renderArena();
  renderLedger();
}

function renderRouteMode() {
  const game = currentGame();
  const isGamePage = state.routeMode === 'game';
  document.body.classList.toggle('game-page', isGamePage);
  document.body.classList.toggle('lobby-page', !isGamePage);
  if (els.gameRouteTitle) els.gameRouteTitle.textContent = displayTitle(game, 'table');
  if (els.gameRouteMeta) els.gameRouteMeta.textContent = `${game.edge} edge - ${game.players} live`;
  document.title = isGamePage ? `${displayTitle(game, 'table')} | Ultimate Bourré Casino` : 'Ultimate Bourré Casino';
}

function renderSystemPanels() {
  state.surface = currentSurface();
  if (els.surfaceStatus) els.surfaceStatus.textContent = state.surface;
  if (els.apiStatus) {
    els.apiStatus.textContent = state.apiMessage;
    els.apiStatus.classList.toggle('offline', !state.apiOnline);
  }
  if (els.memberStatus) els.memberStatus.textContent = `${state.memberName} ${state.role}`;
  if (els.vipStatus) els.vipStatus.textContent = state.vip ? 'VIP Access' : 'Guest Access';
  if (els.favoriteCurrent) {
    const game = currentGame();
    els.favoriteCurrent.textContent = state.favorites.includes(game.id) ? 'Saved' : 'Save Game';
    els.favoriteCurrent.classList.toggle('active', state.favorites.includes(game.id));
  }
  renderMiniRails();
  renderSidebarAccess();
  renderOscarCoach();
  renderRooms();
  renderTournaments();
  renderSpectatorPanel();
  renderHandHistory();
  renderAdmin();
  renderCompliance();
}

function renderSurfaceGrid() {
  if (!els.surfaceGrid) return;
  const surface = currentSurface();
  els.surfaceGrid.innerHTML = state.productSurfaces.map((item) => `
    <article class="${surface.toLowerCase().includes(item.label.split(' ')[0].toLowerCase()) ? 'active' : ''}">
      <strong>${item.label}</strong>
      <span>${item.purpose}</span>
      <small>${item.access} - ${item.status}</small>
    </article>
  `).join('');
}

function renderSidebarAccess() {
  if (!els.sidebarAccountSummary) return;
  const access = state.vip ? 'VIP Access' : 'Guest Access';
  const api = state.apiOnline ? 'server saved' : 'local demo';
  els.sidebarAccountSummary.textContent = `${state.memberName} - ${state.role} - ${access} - ${api}`;
}

function renderOscarCoach() {
  if (!els.oscarCoach) return;
  const activeMode = state.role === 'operator'
    ? 'Oscar can audit, secure, and maintain this Casino surface.'
    : state.vip
      ? 'VIP user can enter private rooms, but operator tools stay locked.'
      : 'Guest user can play sandbox games, but private access stays locked.';
  els.oscarCoach.innerHTML = `
    <article>
      <strong>${state.apiOnline ? 'Server connected' : 'Local fallback'}</strong>
      <span>${activeMode}</span>
    </article>
    ${oscarCoachSteps.map((step) => `
      <article>
        <strong>${step.label}</strong>
        <span>${step.detail}</span>
      </article>
    `).join('')}
  `;
}

function renderAccountSecurity() {
  if (els.accountSummary) {
    const permissions = (state.permissions || []).slice(0, 4).join(', ') || 'casino.play';
    const lastActivity = (state.activity || [])[0];
    els.accountSummary.innerHTML = `
      <div><strong>${state.memberName}</strong><span>${state.memberId}</span></div>
      <div><strong>${state.role}</strong><span>${state.status}</span></div>
      <div><strong>${state.vip ? 'VIP' : 'Guest'}</strong><span>${permissions}</span></div>
      <div><strong>${money(state.limits?.maxTableAnte || 0)}</strong><span>max table ante</span></div>
      <div><strong>${lastActivity ? lastActivity.action : 'ready'}</strong><span>${lastActivity ? compactTime(lastActivity.createdAt) : 'local'}</span></div>
    `;
  }

  if (els.walletLedger) {
    const entries = state.walletLedger.length ? state.walletLedger : [
      { action: 'local-wallet', detail: 'Waiting for server accounting ledger', debit: 0, credit: state.balance, fee: 0, balanceAfter: state.balance, status: 'Local', id: 'local' },
    ];
    els.walletLedger.innerHTML = entries.slice(0, 8).map((item) => `
      <article class="ledger-item">
        <strong><span>${item.action}</span><span>${item.status}</span></strong>
        <p>${item.detail}</p>
        <small><span>D ${money(item.debit || 0)}</span><span>C ${money(item.credit || 0)}</span><span>Fee ${money(item.fee || 0)}</span><span>${item.id}</span></small>
      </article>
    `).join('');
  }

  if (els.securitySummary) {
    const security = state.security || {};
    const responsible = security.responsiblePlay || {};
    els.securitySummary.innerHTML = `
      <div><strong>${security.rateLimit?.status || 'active'}</strong><span>${security.rateLimit?.maxRequests || 180}/${security.rateLimit?.windowSeconds || 60}s rate limit</span></div>
      <div><strong>v${security.adminKeyVersion || 1}</strong><span>key ${security.adminKeyFingerprint || 'demo'}</span></div>
      <div><strong>${security.lastBackup ? 'ready' : 'none'}</strong><span>${security.lastBackup ? 'backup saved' : 'backup pending'}</span></div>
      <div><strong>${money(responsible.dailyLossLimit || 2500)}</strong><span>daily loss limit</span></div>
      <div><strong>${responsible.cooldownMinutes || 20}m</strong><span>cooldown control</span></div>
    `;
  }
}

function renderMiniRails() {
  const renderChip = (gameId) => {
    const game = games.find((item) => item.id === gameId);
    if (!game) return '';
    return `<button type="button" data-quick-game="${game.id}" style="--accent:${game.accent}">${displayTitle(game)}</button>`;
  };
  if (els.favoritesRail) {
    const items = state.favorites.length ? state.favorites : ['ultimate-bourre'];
    els.favoritesRail.innerHTML = items.map(renderChip).join('');
  }
  if (els.recentRail) {
    const items = state.recentlyPlayed.length ? state.recentlyPlayed : ['ultimate-bourre'];
    els.recentRail.innerHTML = items.map(renderChip).join('');
  }
}

function renderRooms() {
  if (!els.roomsList) return;
  const rooms = state.rooms.length ? state.rooms : [
    { name: 'Open VIP Table', game: 'Ultimate Bourré', mode: 'classic', privacy: 'public', seats: 7, viewers: 18, minAnte: 25, camera: false, status: 'open' },
    { name: 'Royal Card Party', game: 'Ultimate Bourré', mode: 'survival', privacy: 'invite', seats: 7, viewers: 0, minAnte: 250, camera: true, status: 'locked' },
  ];
  els.roomsList.innerHTML = rooms.slice(0, 6).map((room) => `
    <article class="room-card">
      <strong><span>${room.name}</span><span>${room.status}</span></strong>
      <p>${room.game} - ${room.mode} - ${room.privacy}</p>
      <small><span>${room.players?.length || 0}/${room.seats} seats</span><span>${room.spectators || room.viewers || 0} viewers</span><span>${room.camera ? `Camera ${room.cameraStatus || 'armed'}` : 'No camera'}</span></small>
      <div class="room-actions">
        <button type="button" data-room-action="join" data-room-id="${room.id}">Join</button>
        <button type="button" data-room-action="watch" data-room-id="${room.id}">Watch</button>
        <button type="button" data-room-action="camera" data-room-id="${room.id}">Camera</button>
      </div>
    </article>
  `).join('');
}

function renderTournaments() {
  if (!els.tournamentsList) return;
  const tournaments = state.tournaments.length ? state.tournaments : [
    { id: 'tour-local', name: 'Ultimate Bourré Nightly', mode: 'classic', buyIn: 250, tableFee: 10, prizePool: 5000, entrants: ['demo-oscar'], maxEntrants: 64, status: 'registering', startsAt: new Date().toISOString() },
  ];
  els.tournamentsList.innerHTML = tournaments.slice(0, 5).map((tournament) => `
    <article class="room-card tournament-card">
      <strong><span>${tournament.name}</span><span>${tournament.status}</span></strong>
      <p>${tournament.mode} - buy-in ${money(tournament.buyIn || 0)} - fee ${money(tournament.tableFee || 0)}</p>
      <small><span>${(tournament.entrants || []).length}/${tournament.maxEntrants || 64} entrants</span><span>${money(tournament.prizePool || 0)} prize pool</span><span>${compactTime(tournament.startsAt)}</span></small>
      <div class="room-actions">
        <button type="button" data-tournament-action="join" data-tournament-id="${tournament.id}">Enter</button>
      </div>
    </article>
  `).join('');
}

function renderSpectatorPanel() {
  if (!els.spectatorPanel) return;
  const viewers = state.rooms.reduce((sum, room) => sum + (room.spectators || room.viewers || 0), 0);
  const cameraRooms = state.rooms.filter((room) => room.camera || room.cameraStatus === 'live');
  const activeRoom = state.rooms.find((room) => room.id === state.bourre.roomId) || state.rooms[0];
  els.spectatorPanel.innerHTML = `
    <div><strong>${viewers}</strong><span>total VIP viewers</span></div>
    <div><strong>${cameraRooms.length}</strong><span>camera-ready rooms</span></div>
    <div><strong>${activeRoom?.name || 'Open VIP Table'}</strong><span>${activeRoom?.cameraStatus || 'armed'} camera hook</span></div>
    <div><strong>${state.bourre.spectators || 0}</strong><span>current table spectators</span></div>
  `;
}

function renderHandHistory() {
  if (!els.handHistoryList) return;
  const hands = state.handHistory.length ? state.handHistory : [
    { id: 'local-hand', room: 'Open VIP Table', mode: 'classic', result: 'Waiting for saved Ultimate Bourré hands', tricksWon: 0, payout: 0, winner: 'Table', createdAt: new Date().toISOString(), log: [] },
  ];
  els.handHistoryList.innerHTML = hands.slice(0, 8).map((hand) => `
    <article class="ledger-item">
      <strong><span>${hand.result}</span><span>${hand.mode}</span></strong>
      <p>${hand.room} - ${hand.tricksWon} tricks - winner ${hand.winner}</p>
      <small><span>${money(hand.payout || 0)}</span><span>${compactTime(hand.createdAt)}</span><span>${hand.id}</span></small>
      <button type="button" data-hand-replay="${hand.id}">Replay</button>
    </article>
  `).join('');
}

function renderAdmin() {
  if (els.adminSummary) {
    const summary = state.adminSummary || {
      members: 1,
      vipMembers: state.vip ? 1 : 0,
      rooms: state.rooms.length,
      receipts: state.ledger.length,
      totalWagered: state.ledger.reduce((sum, item) => sum + item.stake, 0),
      totalReturned: state.ledger.reduce((sum, item) => sum + item.payout, 0),
      realMoneyEnabled: false,
    };
    els.adminSummary.innerHTML = `
      <div><strong>${summary.members}</strong><span>members</span></div>
      <div><strong>${summary.vipMembers}</strong><span>VIP</span></div>
      <div><strong>${summary.rooms}</strong><span>rooms</span></div>
      <div><strong>${summary.receipts}</strong><span>receipts</span></div>
      <div><strong>${Math.round(summary.totalWagered || 0)}</strong><span>wagered</span></div>
      <div><strong>${summary.realMoneyEnabled ? 'ON' : 'OFF'}</strong><span>real money</span></div>
      <div><strong>${summary.tournaments || state.tournaments.length}</strong><span>tournaments</span></div>
      <div><strong>${summary.handHistory || state.handHistory.length}</strong><span>saved hands</span></div>
    `;
  }
  if (els.adminAudit) {
    const audit = state.adminAudit.length ? state.adminAudit : [{ action: 'local-preview', detail: 'Oscar tools ready in local demo mode', createdAt: new Date().toISOString() }];
    els.adminAudit.innerHTML = audit.slice(0, 6).map((item) => `
      <article class="ledger-item">
        <strong><span>${item.action}</span><span>${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></strong>
        <p>${item.detail}</p>
        <small><span>${item.actor || 'system'}</span><span>${item.id || 'local'}</span></small>
      </article>
    `).join('');
  }
}

function renderCompliance() {
  const compliance = state.compliance || {};
  if (els.kycStatus) els.kycStatus.textContent = compliance.kyc || 'hook-disabled';
  if (els.amlStatus) els.amlStatus.textContent = compliance.aml || 'hook-disabled';
  if (els.geofenceStatus) els.geofenceStatus.textContent = compliance.geofence || 'policy-pending';
  if (els.responsibleStatus) els.responsibleStatus.textContent = compliance.responsiblePlay || 'limits ready';
}

function renderStudioStrip() {
  if (!els.studioStrip) return;
  els.studioStrip.innerHTML = studioStats.map(([value, label]) => `<article><strong>${value}</strong><span>${label}</span></article>`).join('');
}

function renderQuickGames() {
  if (!els.quickGames) return;
  const quickGames = quickGameIds.map((id) => games.find((game) => game.id === id)).filter(Boolean);
  els.quickGames.innerHTML = quickGames.map((game) => `
    <button type="button" data-quick-game="${game.id}" class="${game.id === state.selectedGame ? 'active' : ''}" style="--thumb:url('${coverForGame(game)}'); --accent:${game.accent}">
      <span style="--accent:${game.accent}">${game.icon}</span>
      <strong>${displayTitle(game)}</strong>
    </button>
  `).join('');
}

function renderPremiumShelves() {
  if (!els.premiumShelves) return;
  const shelfDefs = [
    { title: 'First 5 Real Games', eyebrow: 'Playable Core', ids: coreGameIds },
    { title: 'VIP Only', eyebrow: 'Private Access', ids: games.filter((game) => game.family === 'VIP').map((game) => game.id).slice(0, 5) },
    { title: 'Instant Originals', eyebrow: 'Fast Play', ids: ['crash', 'mines', 'plinko', 'dice', 'limbo'] },
  ];
  els.premiumShelves.innerHTML = shelfDefs.map((shelf) => `
    <section class="premium-shelf">
      <div>
        <p class="eyebrow">${shelf.eyebrow}</p>
        <h3>${shelf.title}</h3>
      </div>
      <div class="shelf-row">
        ${shelf.ids.map((id) => games.find((game) => game.id === id)).filter(Boolean).map((game) => `
          <button type="button" data-quick-game="${game.id}" style="--thumb:url('${coverForGame(game)}'); --accent:${game.accent}" class="${game.id === state.selectedGame ? 'active' : ''}">
            <span>${game.icon}</span>
            <strong>${displayTitle(game)}</strong>
            <small>${coreGameIds.includes(game.id) ? 'real game' : `${game.players} live`}</small>
          </button>
        `).join('')}
      </div>
    </section>
  `).join('');
}

function renderBanking() {
  const totalBank = state.bank.accounts.reduce((total, account) => total + account.balance, 0);
  els.bankTotal.textContent = round(totalBank).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  els.vaultTotal.textContent = round(state.bank.vault).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  els.pendingTotal.textContent = round(state.bank.pending).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  els.bankAccount.innerHTML = state.bank.accounts
    .map((account) => `<option value="${account.id}">${account.name} - ${account.type} ${account.mask}</option>`)
    .join('');

  els.bankAccounts.innerHTML = state.bank.accounts
    .map((account) => `
      <article class="bank-account">
        <strong><span>${account.name}</span><span>${round(account.balance).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></strong>
        <p>${account.type} account ending ${account.mask}</p>
        <small><span>${account.status}</span><span>Sandbox</span></small>
      </article>
    `)
    .join('');

  els.bankCards.innerHTML = state.bank.cards
    .map((card) => `
      <article class="bank-card ${card.frozen ? 'frozen' : ''}">
        <strong><span>${card.name}</span><span>${card.frozen ? 'Frozen' : 'Active'}</span></strong>
        <p>Card ending ${card.mask} - ${round(card.spent).toLocaleString('en')} / ${round(card.limit).toLocaleString('en')} demo limit</p>
        <small><span>${card.frozen ? 'Blocked' : 'Spend allowed'}</span><span>Risk rules on</span></small>
        <button type="button" data-card-toggle="${card.id}">${card.frozen ? 'Unfreeze' : 'Freeze'} Card</button>
      </article>
    `)
    .join('');

  els.bankLedger.innerHTML = state.bank.ledger
    .map((item) => `
      <article class="ledger-item">
        <strong><span>${item.type}</span><span>${round(item.amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></strong>
        <p>${item.detail}</p>
        <small><span>${item.status}</span><span>${item.id}</span></small>
      </article>
    `)
    .join('');
}

function bankEvent(type, detail, amount, status = 'Settled') {
  state.bank.ledger = [{ type, detail, amount, status, id: `bank-${Math.random().toString(16).slice(2, 6)}` }, ...state.bank.ledger].slice(0, 12);
}

function walletEvent(action, detail, debit = 0, credit = 0, fee = 0, status = 'Settled') {
  state.walletLedger = [{
    id: `wallet-${Math.random().toString(16).slice(2, 6)}`,
    memberId: state.memberId,
    action,
    detail,
    debit,
    credit,
    fee,
    balanceAfter: state.balance,
    status,
    createdAt: new Date().toISOString(),
  }, ...state.walletLedger].slice(0, 40);
}

async function processBankAction() {
  const action = els.bankAction.value;
  const account = state.bank.accounts.find((item) => item.id === els.bankAccount.value) || state.bank.accounts[0];
  const amount = Math.max(1, round(Number(els.bankAmount.value) || 1));
  const memo = (els.bankMemo.value || 'Cashier transfer').trim().slice(0, 40);
  const withdrawalFee = round(Math.max(1, amount * 0.015));
  const cashoutFee = round(Math.max(1, amount * 0.025));

  if (action === 'deposit') {
    if (account.balance < amount) {
      bankEvent('Rejected', `${account.name} has insufficient demo funds`, amount, 'Rejected');
    } else {
      account.balance = round(account.balance - amount);
      state.balance = round(state.balance + amount);
      bankEvent('Deposit', `${account.name} to casino wallet - ${memo}`, amount);
      walletEvent('deposit', `${account.name} to casino wallet - ${memo}`, 0, amount, 0);
    }
  }

  if (action === 'withdraw') {
    if (state.balance < amount + withdrawalFee) {
      bankEvent('Rejected', 'Casino wallet has insufficient demo funds', amount, 'Rejected');
    } else {
      state.balance = round(state.balance - amount - withdrawalFee);
      account.balance = round(account.balance + amount);
      state.bank.pending = round(state.bank.pending + Math.min(amount, 500));
      bankEvent('Withdrawal', `Casino wallet to ${account.name} - ${memo}`, amount, amount >= 5000 ? 'Manual Review' : 'Settled');
      walletEvent('withdrawal', `Casino wallet to ${account.name} - ${memo}`, amount, 0, withdrawalFee, amount >= 5000 ? 'Manual Review' : 'Settled');
    }
  }

  if (action === 'vault') {
    if (state.balance < amount) {
      bankEvent('Rejected', 'Casino wallet has insufficient demo funds', amount, 'Rejected');
    } else {
      state.balance = round(state.balance - amount);
      state.bank.vault = round(state.bank.vault + amount);
      bankEvent('Vault', `Casino wallet to cold vault - ${memo}`, amount, 'Locked');
      walletEvent('vault-lock', `Casino wallet to cold vault - ${memo}`, amount, 0, 0, 'Locked');
    }
  }

  if (action === 'bonus') {
    state.balance = round(state.balance + amount);
    bankEvent('Bonus', `Promotional demo chips - ${memo}`, amount, 'Promo');
    walletEvent('bonus', `Promotional demo chips - ${memo}`, 0, amount, 0, 'Promo');
  }

  if (action === 'table-fee') {
    if (state.balance < amount) {
      bankEvent('Rejected', 'Casino wallet has insufficient demo funds for table fee', amount, 'Rejected');
    } else {
      state.balance = round(state.balance - amount);
      bankEvent('Table Fee', `Ultimate Bourré table entry fee - ${memo}`, amount);
      walletEvent('table-fee', `Ultimate Bourré table entry fee - ${memo}`, amount, 0, 0);
    }
  }

  if (action === 'cashout-fee') {
    if (state.balance < cashoutFee) {
      bankEvent('Rejected', 'Casino wallet has insufficient demo funds for processing fee', cashoutFee, 'Rejected');
    } else {
      state.balance = round(state.balance - cashoutFee);
      bankEvent('Cash-out Fee', `Sandbox cash-out processing fee on ${amount} - ${memo}`, cashoutFee);
      walletEvent('cashout-fee', `Sandbox cash-out processing fee on ${amount} - ${memo}`, 0, 0, cashoutFee);
    }
  }

  renderAll();
  if (state.apiOnline) {
    try {
      const payload = await apiFetch('/api/bank-action', {
        method: 'POST',
        body: JSON.stringify({ memberId: state.memberId, action, accountId: account.id, amount, memo }),
      });
      applyMember(payload.member);
      state.walletLedger = payload.walletLedger || state.walletLedger;
      state.adminSummary = payload.summary || state.adminSummary;
      renderAll();
    } catch (error) {
      state.apiOnline = false;
      state.apiMessage = 'Local Demo';
      renderSystemPanels();
    }
  }
}

function toggleCard(cardId) {
  const card = state.bank.cards.find((item) => item.id === cardId);
  if (!card) return;
  card.frozen = !card.frozen;
  bankEvent('Card', `${card.name} ${card.frozen ? 'frozen' : 'unfrozen'} by cashier control`, 0, 'Control');
  renderAll();
}

function renderWallet() {
  const conversions = { 'USDT-D': state.balance, 'BTC-D': state.balance / 64000, 'ETH-D': state.balance / 3200, 'SOL-D': state.balance / 145 };
  if (els.wallet) els.wallet.textContent = money(state.balance);
  if (els.quickWallet) els.quickWallet.textContent = money(state.balance);
  if (els.gameCount) els.gameCount.textContent = games.length;
  if (els.tokens) {
    els.tokens.innerHTML = tokens.map((token) => `<button type="button" data-token="${token}" class="${token === state.token ? 'active' : ''}"><span>${token}</span><br><strong>${round(conversions[token]).toLocaleString('en', { maximumFractionDigits: token === 'USDT-D' ? 2 : 6 })}</strong></button>`).join('');
  }
  if (els.cashoutLabel) els.cashoutLabel.textContent = multiplier(state.cashout);
  if (els.diceLabel) els.diceLabel.textContent = state.diceTarget;
}

function renderFamilies() {
  els.families.innerHTML = families.map((family) => `<button type="button" data-family="${family}" class="${family === state.family ? 'active' : ''}">${family}</button>`).join('');
}

function renderGames() {
  const query = state.search.trim().toLowerCase();
  const visible = (state.family === 'All' ? games : games.filter((game) => game.family === state.family))
    .filter((game) => !query || `${game.title} ${game.family} ${game.vol}`.toLowerCase().includes(query));
  els.games.innerHTML = visible.map((game) => `
    <button type="button" class="game-card ${game.id === state.selectedGame ? 'active' : ''} ${game.id === 'ultimate-bourre' ? 'headline' : ''} ${coreGameIds.includes(game.id) ? 'core-game' : ''}" data-game="${game.id}" style="--cover:url('${coverForGame(game)}'); --accent:${game.accent}">
      <span class="game-card-top">
        <span class="game-icon" style="--accent: ${game.accent}">${game.icon}</span>
        <span class="game-status">${coreGameIds.includes(game.id) ? 'real game' : `${game.players} playing`}</span>
      </span>
      <span class="game-sheen" aria-hidden="true"></span>
      <h3>${displayTitle(game)}</h3>
      <div class="game-meta"><span>${game.edge}</span><span>${game.vol}</span><span>${game.players}</span></div>
    </button>
  `).join('');
}

function coverForGame(game) {
  const visual = game.mode || game.id;
  if (game.id === 'ultimate-bourre') return assetPath('assets/casino/optimized/ultimate-bourre-hero.jpg');
  if (['crash', 'limbo'].includes(game.id) || visual === 'surge') return assetPath('assets/casino/optimized/cover-crash.jpg');
  if (game.id === 'mines' || visual === 'vault') return assetPath('assets/casino/optimized/cover-mines.jpg');
  if (game.id === 'plinko' || visual === 'drop') return assetPath('assets/casino/optimized/cover-plinko.jpg');
  if (['slots', 'gold-lines'].includes(game.id) || visual === 'lines') return assetPath('assets/casino/optimized/cover-slots.jpg');
  if (['roulette', 'wheel'].includes(game.id) || visual === 'spin') return assetPath('assets/casino/optimized/cover-roulette.jpg');
  if (['blackjack', 'baccarat', 'video-poker', 'hilo'].includes(game.id)) return assetPath('assets/casino/optimized/cover-cards.jpg');
  if (['keno', 'turbo-keno', 'pulse-picks'].includes(game.id) || visual === 'numbers') return assetPath('assets/casino/optimized/cover-numbers.jpg');
  if (['sportsbook', 'crown-run', 'treasure-cases', 'bankroll-battle', 'royal-rush', 'lucky-lane'].includes(game.id) || ['case', 'duel', 'race'].includes(visual)) return assetPath('assets/casino/optimized/cover-vip.jpg');
  if (['dice', 'towers', 'coin-flip'].includes(game.id) || visual === 'ladder') return assetPath('assets/casino/optimized/cover-vip.jpg');
  return assetPath('assets/casino/optimized/cover-vip.jpg');
}

function gameCockpit(stats, footer = '') {
  return `
    <div class="game-cockpit">
      ${stats.map((item) => `
        <article>
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </article>
      `).join('')}
      ${footer ? `<div class="cockpit-footer">${footer}</div>` : ''}
    </div>
  `;
}

function renderArena() {
  const game = currentGame();
  els.activeTitle.textContent = displayTitle(game, 'table');
  els.arenaTitle.textContent = displayTitle(game, 'table');
  els.arenaEdge.textContent = `${game.edge} edge`;
  const views = {
    'ultimate-bourre': bourreView,
    crash: crashView,
    dice: diceView,
    mines: minesView,
    plinko: plinkoView,
    roulette: rouletteView,
    blackjack: blackjackView,
    baccarat: baccaratView,
    slots: slotsView,
    limbo: limboView,
    keno: kenoView,
    wheel: wheelView,
    hilo: hiloView,
    towers: towersView,
    'video-poker': videoPokerView,
    'coin-flip': coinFlipView,
    sportsbook: sportsbookView,
  };
  els.arena.innerHTML = (views[state.selectedGame] || prototypeView)();
  wireArenaActions();
}

function bourreView() {
  const game = currentGame();
  const b = state.bourre;
  const activeSeats = [
    { name: 'You', tricks: b.trickWins, status: b.mode, main: true },
    ...b.rivals,
  ].slice(0, 7);
  const seatMarkup = activeSeats.map((seat, index) => `
    <span class="bourre-seat seat-${index + 1} ${seat.main ? 'main' : ''}">
      <strong>${seat.name}</strong>
      <small>${seat.tricks} tricks</small>
    </span>
  `).join('');
  return `
    <div class="bourre-arena" style="--accent:${game.accent}">
      <div class="bourre-score">
        <article><span>${suitSymbols[b.trump]}</span><small>${suitNames[b.trump]} trump</small></article>
        <article><span>${money(b.pot)}</span><small>demo pot</small></article>
        <article><span>${b.trickWins}/5</span><small>your tricks</small></article>
        <article><span>${b.survivalHit ? 'SAVE' : b.phase.toUpperCase()}</span><small>${b.mode} mode</small></article>
        <article><span>${b.spectators || 0}</span><small>spectators</small></article>
        <article><span>${b.cameraStatus || 'off'}</span><small>camera hook</small></article>
      </div>

      ${gameCockpit([
        { label: 'Room', value: b.room },
        { label: 'Mode', value: b.mode },
        { label: 'Ante', value: money(b.ante || b.stake || state.bet) },
        { label: 'Replay', value: `${state.handHistory.length} hands` },
      ], `<span>Classic + Survival table state</span><span>${b.tableStatus} access</span>`)}

      <div class="bourre-felt">
        ${seatMarkup}
        <div class="bourre-pot-stack">
          <span></span><span></span><span></span>
          <strong>${money(b.pot)}</strong>
        </div>
        <div class="bourre-trump-card ${b.trump === 'H' || b.trump === 'D' ? 'red' : ''}">
          <span>TRUMP</span>
          <strong>${suitSymbols[b.trump]}</strong>
        </div>
        <div class="bourre-video-wall">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>

      <div class="bourre-state-grid">
        <article><strong>${b.room}</strong><span>${b.tableStatus} table - dealer ${b.dealer}</span></article>
        <article><strong>${money(b.potBreakdown?.antes || 0)}</strong><span>antes in pot</span></article>
        <article><strong>${money(b.potBreakdown?.side || 0)}</strong><span>Survival side pool</span></article>
        <article><strong>${money(b.tableFee || 0)}</strong><span>table fee</span></article>
      </div>

      <div class="bourre-hand-row">
        <div class="bourre-mode-panel">
          <button type="button" data-bourre-mode="classic" class="${b.mode === 'classic' ? 'active' : ''}">Classic</button>
          <button type="button" data-bourre-mode="survival" class="${b.mode === 'survival' ? 'active' : ''}">Survival</button>
          <button type="button" data-bourre-action="deal">${b.phase === 'playing' ? 'New Hand' : 'Deal Hand'}</button>
          <button type="button" data-bourre-action="play" class="${b.phase === 'playing' ? 'active' : ''}">Play Trick</button>
          <button type="button" data-bourre-action="survival">Side Save</button>
          <button type="button" data-bourre-action="drop">Drop</button>
        </div>
        <div class="cards-row bourre-hand">${b.playerHand.map(cardHtml).join('')}</div>
        <div class="bourre-badges">
          <span>${b.message || 'VIP table ready'}</span>
          ${(b.trickLog || []).slice(0, 3).map((item) => `<span>${item}</span>`).join('')}
        </div>
      </div>

      <div class="bourre-trick-log">
        <div>
          <p class="eyebrow">Current Trick</p>
          <div class="trick-cards">${(b.currentTrick || []).length ? b.currentTrick.map((item) => `<span>${item.name}: ${item.card}</span>`).join('') : '<span>No trick in motion</span>'}</div>
        </div>
        <div>
          <p class="eyebrow">Replay Log</p>
          <div class="trick-cards">${(b.trickLog || []).slice(0, 6).map((item) => `<span>${item}</span>`).join('')}</div>
        </div>
      </div>
    </div>
  `;
}

function crashView() {
  const crash = state.crash || { last: state.cashout, target: state.cashout, status: 'Armed', history: [] };
  const history = (crash.history || []).slice(0, 6);
  return `
    <div class="real-game-stack">
      ${gameCockpit([
        { label: 'Target', value: multiplier(crash.target || state.cashout) },
        { label: 'Last', value: multiplier(crash.last || state.cashout) },
        { label: 'Status', value: crash.status || 'Armed' },
        { label: 'Edge', value: '1.8%' },
      ], history.map((item) => `<span>${multiplier(item)}</span>`).join(''))}
      <div class="crash-stage">
        <div class="crash-line"></div>
        <div class="crash-rocket" style="--flight:${Math.min(92, Math.max(18, (crash.last || 1) * 14))}%"></div>
        <div class="big-multiplier">${multiplier(crash.last || state.cashout)}</div>
      </div>
      <div class="rail"><span>1.12x</span><span>1.48x</span><span>${multiplier(state.cashout)}</span><span>4.80x</span><span>12.4x</span></div>
    </div>
  `;
}

function diceView() {
  return `<div class="dice-track"><div class="dice-bar"><div class="dice-fill"></div></div><div class="dice-rolls">${[12, 28, 44, 67, 91].map((roll) => `<div>${roll}</div>`).join('')}</div></div>`;
}

function limboView() {
  return `<div class="dark-stage" style="display:grid;place-items:center;text-align:center"><div><p class="eyebrow">Multiplier Floor</p><div class="big-static">10.00x</div><div class="rail"><span>1.03x</span><span>1.84x</span><span>3.60x</span><span>8.25x</span><span>44.2x</span></div></div></div>`;
}

function plinkoView() {
  const pins = Array.from({ length: 8 }, (_, row) => `<div class="pin-row">${Array.from({ length: row + 3 }, (_, pin) => `<span class="pin ${state.plinkoPath[row] === pin % 2 ? 'hot' : ''}"></span>`).join('')}</div>`).join('');
  const buckets = plinkoBuckets[state.risk].map((bucket, index) => `<span class="bucket ${index === state.plinkoIndex ? 'active' : ''}">${multiplier(bucket)}</span>`).join('');
  const last = state.plinkoLast || { risk: state.risk, bucket: state.plinkoIndex + 1, multiplier: plinkoBuckets[state.risk][state.plinkoIndex], path: state.plinkoPath };
  return `
    <div class="real-game-stack">
      ${gameCockpit([
        { label: 'Risk', value: last.risk },
        { label: 'Bucket', value: last.bucket },
        { label: 'Last Pay', value: multiplier(last.multiplier) },
        { label: 'Rows', value: '8' },
      ], (last.path || []).map((step) => `<span>${step ? 'R' : 'L'}</span>`).join(''))}
      <div class="plinko-board"><div>${pins}</div><div class="bucket-grid">${buckets}</div></div>
    </div>
  `;
}

function rouletteView() {
  const color = rouletteColor(state.rouletteNumber);
  return `
    <div class="real-game-stack">
      ${gameCockpit([
        { label: 'Bet', value: state.rouletteBet },
        { label: 'Last', value: `${state.rouletteNumber} ${color}` },
        { label: 'Payout', value: state.rouletteBet === 'green' ? '14.00x' : '2.00x' },
        { label: 'Edge', value: '2.7%' },
      ], (state.rouletteHistory || []).slice(0, 10).map((number) => `<span class="${rouletteColor(number)}">${number}</span>`).join(''))}
      <div class="roulette-wrap">
        <div class="wheel ${color}"><span>${state.rouletteNumber}</span></div>
        <div class="roulette-bets">${['red', 'black', 'green'].map((betColor) => `<button type="button" data-roulette="${betColor}" class="${betColor} ${state.rouletteBet === betColor ? 'active' : ''}">${betColor}</button>`).join('')}</div>
      </div>
    </div>
  `;
}

function slotsView() {
  return `<div class="slots-reels">${state.slotReels.map((symbol) => `<div class="slot-reel">${symbol}</div>`).join('')}</div>`;
}

function kenoView() {
  return `<div class="number-grid">${Array.from({ length: 40 }, (_, index) => {
    const number = index + 1;
    const pick = state.kenoPicks.includes(number);
    const draw = state.kenoDraw.includes(number);
    return `<button type="button" data-keno="${number}" class="number-cell ${pick ? 'pick' : ''} ${draw ? 'draw' : ''} ${pick && draw ? 'hit' : ''}">${number}</button>`;
  }).join('')}</div>`;
}

function hiloView() {
  return `<div class="felt-stage" style="display:grid;place-items:center"><div><div class="cards-row">${cardHtml(state.hiloCard)}</div><div class="table-actions"><button class="secondary" type="button" data-hilo="lower">Lower</button><button type="button" data-hilo="higher">Higher</button></div></div></div>`;
}

function minesView() {
  const roundState = state.mines;
  const cells = Array.from({ length: 25 }, (_, index) => {
    const revealed = roundState && roundState.revealed.includes(index);
    const bomb = roundState && roundState.status !== 'active' && roundState.mines.includes(index);
    return `<button type="button" data-mine="${index}" class="mine-cell ${revealed ? 'revealed' : ''} ${bomb ? 'bomb' : ''}">${bomb ? 'X' : revealed ? 'OK' : index + 1}</button>`;
  }).join('');
  const mineCount = roundState ? roundState.mines.length : riskScale(3, 5, 8);
  return `
    <div class="real-game-stack">
      ${gameCockpit([
        { label: 'Mines', value: mineCount },
        { label: 'Clean', value: roundState ? roundState.revealed.length : 0 },
        { label: 'Status', value: roundState ? roundState.status : 'ready' },
        { label: 'Next', value: multiplier(roundState ? roundState.multiplier : 1) },
      ], `<span>${state.risk} risk</span><span>${roundState ? money(roundState.stake) : money(state.bet)} stake</span>`)}
      <div class="mines-wrap"><div class="mines-grid">${cells}</div><aside class="side-readout"><p class="eyebrow">Multiplier</p><strong>${multiplier(roundState ? roundState.multiplier : 1)}</strong><span>${roundState ? `${roundState.revealed.length} clean tiles` : 'No board active'}</span><button type="button" class="cashout-button" data-cashout-mines>Cash Out</button></aside></div>
    </div>
  `;
}

function blackjackView() {
  const roundState = state.blackjack || {
    dealer: [{ rank: 'K', suit: 'C', value: 10 }, { rank: '6', suit: 'D', value: 6 }],
    player: [{ rank: '10', suit: 'S', value: 10 }, { rank: '7', suit: 'H', value: 7 }],
    message: 'Ready',
  };
  return `<div class="felt-stage"><p class="eyebrow">Dealer ${state.blackjack ? handValue(roundState.dealer) : ''}</p><div class="cards-row">${roundState.dealer.map(cardHtml).join('')}</div><p class="eyebrow" style="margin-top:26px">Player ${state.blackjack ? handValue(roundState.player) : ''}</p><div class="cards-row">${roundState.player.map(cardHtml).join('')}</div><div class="table-actions"><button class="secondary" type="button" data-blackjack="hit">Hit</button><button type="button" data-blackjack="stand">Stand</button></div><p style="text-align:center;color:var(--gold);font-weight:900">${roundState.message}</p></div>`;
}

function baccaratView() {
  const player = [{ rank: '7', suit: 'D', value: 7 }, { rank: 'A', suit: 'S', value: 11 }, { rank: '3', suit: 'H', value: 3 }];
  const banker = [{ rank: '9', suit: 'C', value: 9 }, { rank: '5', suit: 'D', value: 5 }, { rank: '2', suit: 'S', value: 2 }];
  return `<div class="felt-stage" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:center"><div><p class="eyebrow">Player</p><div class="cards-row">${player.map(cardHtml).join('')}</div></div><div><p class="eyebrow">Banker</p><div class="cards-row">${banker.map(cardHtml).join('')}</div></div></div>`;
}

function wheelView() {
  return `<div class="dark-stage" style="display:grid;place-items:center"><div><div class="wheel"><span>Spin</span></div><div class="rail">${wheelMultipliers[state.risk].slice(0, 5).map((item) => `<span>${multiplier(item)}</span>`).join('')}</div></div></div>`;
}

function towersView() {
  return `<div class="towers-grid">${Array.from({ length: 24 }, (_, index) => `<div class="tower-cell ${index % 4 === 0 ? 'hot' : ''}"></div>`).join('')}</div>`;
}

function videoPokerView() {
  const hand = [{ rank: 'A', suit: 'H', value: 11 }, { rank: 'A', suit: 'S', value: 11 }, { rank: 'K', suit: 'D', value: 10 }, { rank: '7', suit: 'C', value: 7 }, { rank: '7', suit: 'H', value: 7 }];
  return `<div class="felt-stage" style="display:grid;place-items:center"><div class="cards-row">${hand.map(cardHtml).join('')}</div></div>`;
}

function coinFlipView() {
  return `<div class="dark-stage" style="display:grid;place-items:center"><div class="coin">CC</div></div>`;
}

function sportsbookView() {
  return `<div class="dark-stage" style="display:grid;align-content:center;gap:12px;padding:18px">${[['Miami Neon', '1.91'], ['Tokyo Drift', '2.14'], ['London Afterhours', '2.65']].map(([team, odds]) => `<div class="sports-line"><strong>${team}</strong><span>${odds}</span></div>`).join('')}</div>`;
}

function prototypeView() {
  const game = currentGame();
  const visual = state.prototype && state.prototype.id === game.id
    ? state.prototype
    : { mode: game.mode, result: 'Ready', labels: ['1.20x', '1.80x', '2.50x', '5.00x'], highlights: [1], accent: game.accent, multiplier: 1 };

  if (visual.mode === 'numbers') {
    return `<div class="prototype-stage" style="--accent:${game.accent}"><div class="prototype-head"><span>${visual.result}</span><strong>${game.title}</strong></div><div class="mini-number-grid">${Array.from({ length: 20 }, (_, index) => {
      const number = index + 1;
      const pick = (visual.picks || []).includes(number);
      const draw = (visual.draw || []).includes(number);
      return `<span class="${pick ? 'pick' : ''} ${draw ? 'draw' : ''} ${pick && draw ? 'hit' : ''}">${number}</span>`;
    }).join('')}</div></div>`;
  }

  if (visual.mode === 'lines') {
    const reels = visual.reels || lineSymbols.slice(0, 5);
    return `<div class="prototype-stage" style="--accent:${game.accent}"><div class="prototype-head"><span>${visual.result}</span><strong>${game.title}</strong></div><div class="slots-reels compact">${reels.map((symbol) => `<div class="slot-reel">${symbol}</div>`).join('')}</div></div>`;
  }

  if (visual.mode === 'race') {
    const lanes = visual.lanes || raceLanes.map((lane, index) => ({ lane, score: 85 - index * 10 }));
    return `<div class="prototype-stage" style="--accent:${game.accent}"><div class="prototype-head"><span>${visual.result}</span><strong>${game.title}</strong></div><div class="race-lanes">${lanes.map((lane) => `<div class="race-lane ${visual.highlights?.includes(lane.lane) ? 'hot' : ''}"><strong>${lane.lane}</strong><span style="width:${lane.score}%"></span><em>${lane.score}</em></div>`).join('')}</div></div>`;
  }

  const labels = visual.labels || [];
  return `<div class="prototype-stage" style="--accent:${game.accent}"><div class="prototype-head"><span>${visual.result}</span><strong>${game.title}</strong></div><div class="prototype-grid">${labels.map((label, index) => `<span class="${visual.highlights?.includes(index) ? 'hot' : ''}">${label}</span>`).join('')}</div><div class="prototype-meter"><span style="width:${Math.min(100, Math.max(12, (Number(visual.multiplier) || 1) * 12))}%"></span></div></div>`;
}

function cardHtml(card) {
  const red = card.suit === 'H' || card.suit === 'D';
  return `<div class="card ${red ? 'red' : ''}"><span>${card.rank}</span><span style="text-align:center">${suitSymbols[card.suit] || card.suit}</span><span style="transform:rotate(180deg)">${card.rank}</span></div>`;
}

function renderLedger() {
  const wins = state.ledger.filter((item) => item.win).length;
  const wagered = state.ledger.reduce((sum, item) => sum + item.stake, 0);
  const returned = state.ledger.reduce((sum, item) => sum + item.payout, 0);
  els.wins.textContent = wins;
  els.ledgerWagered.textContent = Math.round(wagered);
  els.ledgerReturned.textContent = Math.round(returned);
  if (els.wageredTotal) els.wageredTotal.textContent = Math.round(wagered);
  if (els.returnTotal) els.returnTotal.textContent = Math.round(returned);
  const last = state.ledger[0];
  els.receipt.className = `receipt ${last.win ? 'win' : 'loss'}`;
  const receiptGame = last.game;
  els.receipt.innerHTML = `<small>Last Receipt</small><strong>${receiptGame}: ${last.detail}</strong><span>${last.win ? 'Win' : 'No win'} - ${multiplier(last.multiplier)} - ${last.seed}</span>`;
  els.ledger.innerHTML = state.ledger.map((item) => `<article class="ledger-item"><strong><span>${item.game}</span><span>${multiplier(item.multiplier)}</span></strong><p>${item.detail}</p><small><span>${money(item.stake)}</span><span>${money(item.payout)}</span><span>${item.seed}</span></small></article>`).join('');
}

function wireArenaActions() {
  document.querySelectorAll('[data-roulette]').forEach((button) => {
    button.addEventListener('click', () => {
      state.rouletteBet = button.dataset.roulette;
      renderArena();
    });
  });
  document.querySelectorAll('[data-keno]').forEach((button) => {
    button.addEventListener('click', () => {
      const value = Number(button.dataset.keno);
      state.kenoPicks = state.kenoPicks.includes(value) ? state.kenoPicks.filter((item) => item !== value) : state.kenoPicks.length >= 10 ? state.kenoPicks : [...state.kenoPicks, value].sort((a, b) => a - b);
      renderArena();
    });
  });
  document.querySelectorAll('[data-hilo]').forEach((button) => button.addEventListener('click', () => playHilo(button.dataset.hilo)));
  document.querySelectorAll('[data-mine]').forEach((button) => button.addEventListener('click', () => revealMine(Number(button.dataset.mine))));
  document.querySelector('[data-cashout-mines]')?.addEventListener('click', cashoutMines);
  document.querySelectorAll('[data-blackjack]').forEach((button) => button.addEventListener('click', () => button.dataset.blackjack === 'hit' ? hitBlackjack() : standBlackjack()));
  document.querySelectorAll('[data-bourre-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.bourre.mode = button.dataset.bourreMode;
      renderArena();
    });
  });
  document.querySelectorAll('[data-bourre-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.bourreAction;
      if (action === 'deal') dealBourreHand(stake());
      if (action === 'play') playBourreTrick();
      if (action === 'survival') armSurvivalSave();
      if (action === 'drop') dropBourreHand();
    });
  });
}

async function toggleFavoriteCurrent() {
  const game = currentGame();
  const exists = state.favorites.includes(game.id);
  state.favorites = exists ? state.favorites.filter((item) => item !== game.id) : [game.id, ...state.favorites].slice(0, 40);
  renderAll();
  if (!state.apiOnline) return;
  try {
    const payload = await apiFetch('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ memberId: state.memberId, gameId: game.id, active: !exists }),
    });
    applyMember(payload.member);
    renderAll();
  } catch (error) {
    state.apiOnline = false;
    state.apiMessage = 'Local Demo';
    renderSystemPanels();
  }
}

async function redeemVipCode() {
  const code = (els.vipCode?.value || '').trim();
  if (!code) return;
  if (!state.apiOnline) {
    state.vip = true;
    state.role = code.toUpperCase() === 'OSCAR-TOOLS' ? 'operator' : 'vip';
    if (els.vipResult) els.vipResult.textContent = `${code} accepted locally. Server API not connected.`;
    renderSystemPanels();
    return;
  }
  try {
    const payload = await apiFetch('/api/vip/redeem', {
      method: 'POST',
      body: JSON.stringify({ memberId: state.memberId, code }),
    });
    applyMember(payload.member);
    if (els.vipResult) els.vipResult.textContent = `${payload.invite.label} unlocked for ${state.memberName}.`;
    await loadAdminSummary();
    renderAll();
  } catch (error) {
    if (els.vipResult) els.vipResult.textContent = error.message;
  }
}

async function createCardPartyRoom() {
  const name = (els.roomName?.value || 'Card Party Room').trim();
  const localRoom = {
    id: `room-${Math.random().toString(16).slice(2, 6)}`,
    name,
    game: 'Ultimate Bourré',
    mode: state.bourre.mode,
    privacy: 'invite',
    seats: 7,
    viewers: 0,
    minAnte: Math.max(25, Number(els.bet.value) || 250),
    camera: true,
    status: 'locked',
    host: state.memberId,
  };
  state.rooms = [localRoom, ...state.rooms].slice(0, 20);
  renderRooms();
  if (!state.apiOnline) return;
  try {
    const payload = await apiFetch('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ ...localRoom, memberId: state.memberId }),
    });
    state.rooms = payload.rooms || state.rooms;
    await loadAdminSummary();
    renderAll();
  } catch (error) {
    state.apiOnline = false;
    state.apiMessage = 'Local Demo';
    renderSystemPanels();
  }
}

async function recordAdminAction() {
  const detail = (els.adminNote?.value || 'Routine security review').trim();
  const localAudit = { id: `audit-${Math.random().toString(16).slice(2, 6)}`, actor: state.memberId, action: 'operator-note', detail, createdAt: new Date().toISOString() };
  state.adminAudit = [localAudit, ...state.adminAudit].slice(0, 25);
  renderAdmin();
  if (!state.apiOnline) return;
  try {
    const payload = await apiFetch('/api/admin/action', {
      method: 'POST',
      headers: { 'X-Oscar-Key': 'oscar-demo-key' },
      body: JSON.stringify({ actor: state.memberId, action: 'operator-note', detail }),
    });
    state.adminSummary = payload.summary;
    state.adminAudit = payload.audit || state.adminAudit;
    state.compliance = payload.compliance || state.compliance;
    renderAll();
  } catch (error) {
    state.apiOnline = false;
    state.apiMessage = 'Local Demo';
    renderSystemPanels();
  }
}

async function loginAccount(mode = 'login') {
  const memberId = (els.loginMemberId?.value || 'demo-oscar').trim();
  const displayName = (els.loginName?.value || memberId).trim();
  const inviteCode = (els.vipCode?.value || '').trim();
  if (!memberId) return;
  if (!state.apiOnline) {
    state.memberId = memberId;
    state.memberName = displayName;
    state.activity = [{ action: `local-${mode}`, detail: 'Local demo account selected', createdAt: new Date().toISOString() }];
    if (els.vipResult) els.vipResult.textContent = mode === 'register' ? 'Demo account ready. Email-code verification is still pending provider setup.' : 'Signed in with the selected demo account.';
    renderAll();
    return;
  }
  try {
    const payload = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ memberId, displayName, inviteCode }),
    });
    applyMember(payload.member);
    state.rooms = payload.rooms || state.rooms;
    state.tournaments = payload.tournaments || state.tournaments;
    state.handHistory = payload.handHistory || state.handHistory;
    state.walletLedger = payload.walletLedger || state.walletLedger;
    state.adminSummary = payload.summary || state.adminSummary;
    if (els.vipResult) els.vipResult.textContent = mode === 'register' ? 'Account ready. Invite code access applied when valid.' : 'Signed in. Invite code access applied when valid.';
    renderAll();
  } catch (error) {
    if (els.accountSummary) els.accountSummary.innerHTML = `<div><strong>Login blocked</strong><span>${error.message}</span></div>`;
    if (els.vipResult) els.vipResult.textContent = `Access blocked: ${error.message}`;
  }
}

async function performRoomAction(roomId, action) {
  const room = state.rooms.find((item) => item.id === roomId);
  if (room) {
    if (action === 'watch') {
      room.spectators = (room.spectators || room.viewers || 0) + 1;
      room.viewers = room.spectators;
    }
    if (action === 'join') {
      room.players = Array.from(new Set([...(room.players || []), state.memberId])).slice(0, room.seats || 7);
      state.bourre.room = room.name;
      state.bourre.roomId = room.id;
      state.bourre.tableStatus = room.status;
    }
    if (action === 'camera') {
      room.camera = true;
      room.cameraStatus = room.cameraStatus === 'live' ? 'armed' : 'live';
      state.bourre.cameraStatus = room.cameraStatus;
    }
    renderAll();
  }
  if (!state.apiOnline) return;
  try {
    const payload = await apiFetch('/api/rooms/action', {
      method: 'POST',
      body: JSON.stringify({ memberId: state.memberId, roomId, action }),
    });
    applyMember(payload.member);
    state.rooms = payload.rooms || state.rooms;
    state.adminSummary = payload.summary || state.adminSummary;
    renderAll();
  } catch (error) {
    state.apiOnline = false;
    state.apiMessage = 'Local Demo';
    renderSystemPanels();
  }
}

async function performTournamentAction(action, tournamentId) {
  const localTournament = tournamentId ? state.tournaments.find((item) => item.id === tournamentId) : null;
  if (action === 'join' && localTournament) {
    const fee = (localTournament.buyIn || 0) + (localTournament.tableFee || 0);
    const alreadyIn = (localTournament.entrants || []).includes(state.memberId);
    if (!alreadyIn && state.balance >= fee) {
      state.balance = round(state.balance - fee);
      localTournament.entrants = Array.from(new Set([...(localTournament.entrants || []), state.memberId]));
      walletEvent('tournament-buy-in', `${localTournament.name} buy-in`, localTournament.buyIn || 0, 0, localTournament.tableFee || 0, 'Registered');
      renderAll();
    }
  }
  if (action === 'create') {
    const tournament = {
      id: `tour-${Math.random().toString(16).slice(2, 6)}`,
      name: (els.tournamentName?.value || 'Ultimate Bourré Card Party Cup').trim(),
      game: 'Ultimate Bourré',
      mode: state.bourre.mode,
      buyIn: Math.max(25, state.bet),
      tableFee: Math.max(1, round(state.bet * 0.04)),
      prizePool: Math.max(1000, state.bet * 16),
      entrants: [state.memberId],
      maxEntrants: 32,
      status: 'registering',
      startsAt: new Date(Date.now() + 5_400_000).toISOString(),
    };
    state.tournaments = [tournament, ...state.tournaments].slice(0, 20);
    renderAll();
  }
  if (!state.apiOnline) return;
  try {
    const payload = await apiFetch('/api/tournaments/action', {
      method: 'POST',
      body: JSON.stringify({
        memberId: state.memberId,
        action,
        tournamentId,
        name: els.tournamentName?.value,
        mode: state.bourre.mode,
        buyIn: Math.max(25, state.bet),
      }),
    });
    applyMember(payload.member);
    state.tournaments = payload.tournaments || state.tournaments;
    state.walletLedger = payload.walletLedger || state.walletLedger;
    state.adminSummary = payload.summary || state.adminSummary;
    renderAll();
  } catch (error) {
    state.apiOnline = false;
    state.apiMessage = 'Local Demo';
    renderSystemPanels();
  }
}

async function performSecurityAction(action) {
  const detail = action === 'create-backup' ? 'Create casino JSON backup' : 'Rotate Oscar admin key record';
  const localAudit = { id: `audit-${Math.random().toString(16).slice(2, 6)}`, actor: state.memberId, action, detail, createdAt: new Date().toISOString() };
  state.adminAudit = [localAudit, ...state.adminAudit].slice(0, 25);
  if (action === 'rotate-admin-key') {
    state.security.adminKeyVersion = (state.security.adminKeyVersion || 1) + 1;
    state.security.adminKeyFingerprint = Math.random().toString(16).slice(2, 14);
  }
  if (action === 'create-backup') {
    state.security.lastBackup = 'local-backup-ready';
  }
  renderAll();
  if (!state.apiOnline) return;
  try {
    const payload = await apiFetch('/api/admin/action', {
      method: 'POST',
      headers: { 'X-Oscar-Key': 'oscar-demo-key' },
      body: JSON.stringify({ actor: state.memberId, action, detail }),
    });
    state.adminSummary = payload.summary || state.adminSummary;
    state.adminAudit = payload.audit || state.adminAudit;
    state.security = payload.security || state.security;
    state.compliance = payload.compliance || state.compliance;
    renderAll();
  } catch (error) {
    state.apiOnline = false;
    state.apiMessage = 'Local Demo';
    renderSystemPanels();
  }
}

function replayHand(handId) {
  const hand = state.handHistory.find((item) => item.id === handId);
  if (!hand) return;
  state.selectedGame = 'ultimate-bourre';
  state.bourre = {
    ...state.bourre,
    phase: 'complete',
    mode: hand.mode || 'classic',
    trump: hand.trump || state.bourre.trump,
    pot: hand.pot || state.bourre.pot,
    trickWins: hand.tricksWon || 0,
    tricksPlayed: 5,
    room: hand.room || state.bourre.room,
    message: `Replaying ${hand.result}`,
    trickLog: hand.log || [hand.result],
    currentTrick: [],
  };
  renderAll();
  openGameRoute('ultimate-bourre');
}

function bindEvents() {
  document.getElementById('run-bet').addEventListener('click', play);
  document.getElementById('process-bank-action').addEventListener('click', processBankAction);
  els.loginAccount?.addEventListener('click', () => loginAccount('login'));
  els.registerAccount?.addEventListener('click', () => loginAccount('register'));
  els.favoriteCurrent?.addEventListener('click', toggleFavoriteCurrent);
  els.redeemVip?.addEventListener('click', redeemVipCode);
  els.createRoom?.addEventListener('click', createCardPartyRoom);
  els.createTournament?.addEventListener('click', () => performTournamentAction('create'));
  els.rotateAdminKey?.addEventListener('click', () => performSecurityAction('rotate-admin-key'));
  els.createBackup?.addEventListener('click', () => performSecurityAction('create-backup'));
  els.adminAction?.addEventListener('click', recordAdminAction);
  els.search?.addEventListener('input', () => {
    state.search = els.search.value || '';
    renderGames();
  });
  document.getElementById('reset-wallet').addEventListener('click', () => {
    state.balance = 25000;
    state.ledger = state.ledger.slice(-3).reverse();
    state.bank.pending = 0;
    renderAll();
  });
  els.bet.addEventListener('input', () => {
    state.bet = Number(els.bet.value) || 1;
  });
  els.cashout.addEventListener('input', () => {
    state.cashout = Number(els.cashout.value);
    renderAll();
  });
  els.dice.addEventListener('input', () => {
    state.diceTarget = Number(els.dice.value);
    renderAll();
  });
  document.querySelectorAll('[data-chip]').forEach((button) => button.addEventListener('click', () => {
    state.bet = Number(button.dataset.chip);
    els.bet.value = state.bet;
  }));
  document.querySelectorAll('[data-factor]').forEach((button) => button.addEventListener('click', () => {
    state.bet = round((Number(els.bet.value) || 1) * Number(button.dataset.factor));
    els.bet.value = state.bet;
  }));
  document.querySelector('[data-max]').addEventListener('click', () => {
    state.bet = Math.max(1, Math.floor(state.balance));
    els.bet.value = state.bet;
  });
  document.querySelectorAll('[data-risk]').forEach((button) => button.addEventListener('click', () => {
    state.risk = button.dataset.risk;
    document.querySelectorAll('[data-risk]').forEach((item) => item.classList.toggle('active', item.dataset.risk === state.risk));
    renderAll();
  }));
  document.addEventListener('click', (event) => {
    const lobbyLink = event.target.closest('[data-lobby-link]');
    const token = event.target.closest('[data-token]');
    const family = event.target.closest('[data-family]');
    const game = event.target.closest('[data-game]');
    const quickGame = event.target.closest('[data-quick-game]');
    const card = event.target.closest('[data-card-toggle]');
    const roomAction = event.target.closest('[data-room-action]');
    const tournamentAction = event.target.closest('[data-tournament-action]');
    const handReplay = event.target.closest('[data-hand-replay]');
    if (lobbyLink) {
      openLobbyRoute();
      return;
    }
    if (token) {
      state.token = token.dataset.token;
      renderAll();
    }
    if (family) {
      state.family = family.dataset.family;
      renderAll();
    }
    if (game) {
      openGameRoute(game.dataset.game);
      return;
    }
    if (quickGame) {
      openGameRoute(quickGame.dataset.quickGame);
      return;
    }
    if (card) {
      toggleCard(card.dataset.cardToggle);
    }
    if (roomAction) {
      performRoomAction(roomAction.dataset.roomId, roomAction.dataset.roomAction);
    }
    if (tournamentAction) {
      performTournamentAction(tournamentAction.dataset.tournamentAction, tournamentAction.dataset.tournamentId);
    }
    if (handReplay) {
      replayHand(handReplay.dataset.handReplay);
    }
  });

  window.addEventListener('popstate', () => {
    applyRouteFromLocation();
    renderAll();
  });
}

applyRouteFromLocation();
bindEvents();
renderAll();
loadBackend();
