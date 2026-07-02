(function () {
  "use strict";

  const startBalance = 25000;
  const tiers = [
    { name: "VIP Freshman", threshold: 0 },
    { name: "VIP Gold Room", threshold: 2000 },
    { name: "VIP Platinum Booth", threshold: 7500 },
    { name: "VIP Crown Suite", threshold: 18000 },
    { name: "GOAT Royalty Whale", threshold: 42000 }
  ];

  const state = {
    balance: Number(localStorage.getItem("goatCasinoBalance") || startBalance),
    wagered: Number(localStorage.getItem("goatCasinoWagered") || 0),
    plays: Number(localStorage.getItem("goatCasinoPlays") || 0),
    wins: Number(localStorage.getItem("goatCasinoWins") || 0),
    ledger: JSON.parse(localStorage.getItem("goatCasinoLedger") || "[]"),
    nightCode: localStorage.getItem("goatCasinoNightCode") || "",
    nightName: localStorage.getItem("goatCasinoNightName") || "GOAT Royalty Casino Night",
    realMode: localStorage.getItem("goatCasinoRealMode") === "on",
    roulettePick: "red",
    blackjack: null,
    crash: null
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const money = (amount) => `${Math.round(amount).toLocaleString()} VIP`;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const slotSymbols = [
    { key: "CROWN", label: "Crown", mark: "CR" },
    { key: "GOAT", label: "GOAT", mark: "GT" },
    { key: "007", label: "007", mark: "07" },
    { key: "MONEY", label: "Money", mark: "MP" },
    { key: "LLM", label: "LLM", mark: "AI" },
    { key: "VIP", label: "VIP", mark: "VP" },
    { key: "STAR", label: "Star", mark: "ST" }
  ];

  function saveState() {
    localStorage.setItem("goatCasinoBalance", String(Math.round(state.balance)));
    localStorage.setItem("goatCasinoWagered", String(Math.round(state.wagered)));
    localStorage.setItem("goatCasinoPlays", String(state.plays));
    localStorage.setItem("goatCasinoWins", String(state.wins));
    localStorage.setItem("goatCasinoLedger", JSON.stringify(state.ledger.slice(0, 24)));
  }

  function saveNightState() {
    localStorage.setItem("goatCasinoNightCode", state.nightCode);
    localStorage.setItem("goatCasinoNightName", state.nightName);
  }

  function getWager() {
    const input = $("#wagerInput");
    const value = Number(input ? input.value : 100);
    return clamp(Number.isFinite(value) ? Math.round(value) : 100, 10, 5000);
  }

  function setResult(id, text, status) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.classList.remove("win", "loss");
    if (status) el.classList.add(status);
  }

  function addLedger(title, delta, details) {
    state.ledger.unshift({
      title,
      delta: Math.round(delta),
      details,
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    });
    state.ledger = state.ledger.slice(0, 24);
  }

  function activeTier() {
    let tier = tiers[0];
    for (const candidate of tiers) {
      if (state.wagered >= candidate.threshold) tier = candidate;
    }
    const next = tiers[tiers.indexOf(tier) + 1] || tier;
    const span = Math.max(1, next.threshold - tier.threshold);
    const progress = next === tier ? 100 : ((state.wagered - tier.threshold) / span) * 100;
    return { tier, next, progress: clamp(progress, 0, 100) };
  }

  function updateUI() {
    const tierInfo = activeTier();
    $("#balanceText").textContent = money(state.balance);
    setText("topBalanceText", money(state.balance));
    $("#wageredText").textContent = money(state.wagered);
    $("#playsText").textContent = String(state.plays);
    $("#winRateText").textContent = state.plays ? `${Math.round((state.wins / state.plays) * 100)}%` : "0%";
    $("#tierText").textContent = tierInfo.tier.name;
    $("#nextTierText").textContent = tierInfo.next === tierInfo.tier ? "Max tier" : `${money(tierInfo.next.threshold - state.wagered)} to ${tierInfo.next.name}`;
    $("#tierFill").style.width = `${tierInfo.progress}%`;
    updateRealModeUI();

    const ledger = $("#ledger");
    ledger.innerHTML = "";
    if (!state.ledger.length) {
      ledger.innerHTML = '<div class="ledger-entry"><b>Casino ready</b><strong>Prototype credits loaded</strong></div>';
    } else {
      for (const item of state.ledger) {
        const entry = document.createElement("div");
        entry.className = `ledger-entry ${item.delta >= 0 ? "win" : "loss"}`;
        entry.innerHTML = `<div><b>${item.title}</b><br>${item.details} at ${item.time}</div><strong>${item.delta >= 0 ? "+" : ""}${money(item.delta)}</strong>`;
        ledger.appendChild(entry);
      }
    }
    syncNightPass();
    saveState();
  }

  function settle(game, multiplier, resultText, resultId) {
    const bet = getWager();
    if (bet > state.balance) {
      setResult(resultId, "Not enough VIP prototype credits for that wager.", "loss");
      return null;
    }
    const payout = Math.round(bet * multiplier);
    const profit = payout - bet;
    state.balance -= bet;
    state.balance += payout;
    state.wagered += bet;
    state.plays += 1;
    if (profit > 0) state.wins += 1;
    addLedger(game, profit, resultText);
    updateUI();
    setResult(resultId, `${resultText} ${profit >= 0 ? "Won" : "Lost"} ${money(Math.abs(profit))}.`, profit >= 0 ? "win" : "loss");
    return { bet, payout, profit };
  }

  function resetCasino() {
    state.balance = startBalance;
    state.wagered = 0;
    state.plays = 0;
    state.wins = 0;
    state.ledger = [];
    updateUI();
    setResult("slotResult", "Prototype casino reset. Fresh VIP credits are loaded.", "win");
  }

  function quickBet(multiplier) {
    const input = $("#wagerInput");
    if (!input) return;
    const current = getWager();
    input.value = multiplier === "max" ? Math.min(5000, Math.max(10, Math.floor(state.balance))) : clamp(current * multiplier, 10, 5000);
  }

  function activateGame(target, shouldScroll) {
    $$(".casino-tab").forEach((item) => item.classList.toggle("active", item.dataset.game === target));
    $$(".casino-game").forEach((panel) => panel.classList.toggle("active", panel.id === `game-${target}`));
    if (shouldScroll) {
      const floor = $("#casino-floor");
      if (floor) floor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function initTabs() {
    $$(".casino-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        activateGame(tab.dataset.game, false);
      });
    });
  }

  function renderSlotReel(reel, symbol) {
    reel.dataset.symbol = symbol.key.toLowerCase();
    reel.innerHTML = `<span class="slot-symbol">${symbol.mark}</span><small>${symbol.label}</small>`;
  }

  function initSlotReels() {
    $$(".slot-reel").forEach((reel, index) => renderSlotReel(reel, slotSymbols[index % slotSymbols.length]));
  }

  function spinSlots() {
    const reels = $$(".slot-reel");
    const landed = reels.map(() => slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
    reels.forEach((reel, index) => {
      renderSlotReel(reel, landed[index]);
      reel.style.transform = "scale(0.96)";
      setTimeout(() => { reel.style.transform = "scale(1)"; }, 120 + index * 45);
    });

    const counts = landed.reduce((map, symbol) => {
      map[symbol.key] = (map[symbol.key] || 0) + 1;
      return map;
    }, {});
    const best = Math.max(...Object.values(counts));
    const crownCount = counts.CROWN || 0;
    let multiplier = 0;
    let label = "No match.";
    if (best === 5) {
      multiplier = landed[0].key === "CROWN" ? 50 : 25;
      label = `Five ${landed[0].label} symbols.`;
    } else if (best === 4) {
      multiplier = 10;
      label = "Four of a kind.";
    } else if (best === 3) {
      multiplier = 4;
      label = "Three of a kind.";
    } else if (crownCount >= 2) {
      multiplier = 2;
      label = "Two crown symbols.";
    }
    settle("Crown Slots", multiplier, label, "slotResult");
  }

  function rollDice() {
    const target = Number($("#diceTarget").value);
    const mode = $("#diceMode").value;
    const roll = Math.floor(Math.random() * 100) + 1;
    const won = mode === "over" ? roll > target : roll < target;
    const chance = mode === "over" ? 100 - target : target - 1;
    const multiplier = won ? clamp((98 / Math.max(1, chance)), 1.05, 12) : 0;
    $("#diceFace").textContent = String(roll);
    settle("Royal Dice", multiplier, `${mode.toUpperCase()} ${target}, rolled ${roll}.`, "diceResult");
  }

  function updateDiceLabel() {
    $("#diceTargetLabel").textContent = $("#diceTarget").value;
  }

  function pickRoulette(color) {
    state.roulettePick = color;
    $$(".pick-button").forEach((button) => button.classList.toggle("active", button.dataset.pick === color));
  }

  function spinRoulette() {
    const number = Math.floor(Math.random() * 37);
    const color = number === 0 ? "gold" : number % 2 === 0 ? "black" : "red";
    const won = state.roulettePick === color;
    const multiplier = won ? (color === "gold" ? 14 : 2) : 0;
    $("#rouletteNumber").textContent = String(number);
    $(".roulette-wheel").dataset.color = color;
    settle("GOAT Roulette", multiplier, `Picked ${state.roulettePick}, landed ${color} ${number}.`, "rouletteResult");
  }

  function createDeck() {
    const suits = ["S", "H", "D", "C"];
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const deck = [];
    for (const suit of suits) {
      for (const rank of ranks) deck.push({ rank, suit });
    }
    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function cardValue(card) {
    if (card.rank === "A") return 11;
    if (["K", "Q", "J"].includes(card.rank)) return 10;
    return Number(card.rank);
  }

  function scoreHand(hand) {
    let score = hand.reduce((total, card) => total + cardValue(card), 0);
    let aces = hand.filter((card) => card.rank === "A").length;
    while (score > 21 && aces) {
      score -= 10;
      aces -= 1;
    }
    return score;
  }

  function renderCards() {
    const game = state.blackjack;
    const suits = { S: "♠", H: "♥", D: "♦", C: "♣" };
    const renderHand = (hand, target, hideFirst) => {
      const el = $(target);
      el.innerHTML = "";
      hand.forEach((card, index) => {
        const div = document.createElement("div");
        div.className = `card-face ${["H", "D"].includes(card.suit) ? "red-card" : ""} ${hideFirst && index === 0 ? "card-back" : ""}`;
        div.innerHTML = hideFirst && index === 0
          ? "<span>GOAT</span>"
          : `<b>${card.rank}</b><span>${suits[card.suit]}</span><small>${card.rank}</small>`;
        el.appendChild(div);
      });
    };
    renderHand(game.player, "#playerCards", false);
    renderHand(game.dealer, "#dealerCards", !game.done);
    $("#playerScore").textContent = String(scoreHand(game.player));
    $("#dealerScore").textContent = game.done ? String(scoreHand(game.dealer)) : "?";
    $("#blackjackHit").disabled = game.done;
    $("#blackjackStand").disabled = game.done;
  }

  function blackjackDeal() {
    const bet = getWager();
    if (bet > state.balance) {
      setResult("blackjackResult", "Not enough VIP prototype credits for that blackjack wager.", "loss");
      return;
    }
    state.balance -= bet;
    state.wagered += bet;
    state.plays += 1;
    state.blackjack = {
      bet,
      deck: createDeck(),
      player: [],
      dealer: [],
      done: false
    };
    const game = state.blackjack;
    game.player.push(game.deck.pop(), game.deck.pop());
    game.dealer.push(game.deck.pop(), game.deck.pop());
    renderCards();
    const playerScore = scoreHand(game.player);
    if (playerScore === 21) blackjackFinish("blackjack");
    else setResult("blackjackResult", "Cards are live. Hit or stand.", "");
    updateUI();
  }

  function blackjackHit() {
    const game = state.blackjack;
    if (!game || game.done) return;
    game.player.push(game.deck.pop());
    if (scoreHand(game.player) > 21) blackjackFinish("bust");
    else renderCards();
  }

  function blackjackStand() {
    const game = state.blackjack;
    if (!game || game.done) return;
    while (scoreHand(game.dealer) < 17) game.dealer.push(game.deck.pop());
    blackjackFinish("stand");
  }

  function blackjackFinish(reason) {
    const game = state.blackjack;
    game.done = true;
    const player = scoreHand(game.player);
    const dealer = scoreHand(game.dealer);
    let payout = 0;
    let message = "";
    if (reason === "blackjack") {
      payout = Math.round(game.bet * 2.5);
      message = "Blackjack. Money Penny approves.";
    } else if (player > 21) {
      payout = 0;
      message = `Player busts at ${player}.`;
    } else if (dealer > 21 || player > dealer) {
      payout = game.bet * 2;
      message = `Player ${player}, dealer ${dealer}.`;
    } else if (player === dealer) {
      payout = game.bet;
      message = `Push at ${player}.`;
    } else {
      payout = 0;
      message = `Dealer ${dealer} beats player ${player}.`;
    }
    state.balance += payout;
    const profit = payout - game.bet;
    if (profit > 0) state.wins += 1;
    addLedger("Studio Blackjack", profit, message);
    renderCards();
    updateUI();
    setResult("blackjackResult", `${message} ${profit >= 0 ? "Returned" : "Lost"} ${money(Math.abs(profit))}.`, profit >= 0 ? "win" : "loss");
  }

  function buildPlinkoBoard() {
    const board = $("#plinkoBoard");
    board.innerHTML = "";
    for (let row = 0; row < 8; row += 1) {
      const line = document.createElement("div");
      line.className = "plinko-row";
      for (let col = 0; col <= row; col += 1) {
        const cell = document.createElement("div");
        cell.className = "plinko-cell";
        line.appendChild(cell);
      }
      board.appendChild(line);
    }
    const chip = document.createElement("div");
    chip.className = "plinko-chip";
    chip.textContent = "VIP";
    board.appendChild(chip);
  }

  function dropPlinko() {
    const bins = [5, 2.4, 1.4, 0.6, 0.2, 0.6, 1.4, 2.4, 5];
    let index = 4;
    $$(".plinko-cell").forEach((cell) => cell.classList.remove("hit"));
    $$(".plinko-bin").forEach((bin) => bin.classList.remove("active"));
    const chip = $(".plinko-chip");
    if (chip) {
      chip.classList.remove("drop");
      chip.style.setProperty("--chip-x", "50%");
      void chip.offsetWidth;
      chip.classList.add("drop");
    }
    const rows = $$(".plinko-row");
    rows.forEach((row, rowIndex) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      index = clamp(index + direction, 0, bins.length - 1);
      const cells = Array.from(row.children);
      const hit = cells[Math.min(cells.length - 1, Math.max(0, Math.round((index / 8) * rowIndex)))];
      if (hit) setTimeout(() => hit.classList.add("hit"), rowIndex * 70);
    });
    setTimeout(() => {
      const bin = $$(".plinko-bin")[index];
      if (bin) bin.classList.add("active");
      if (chip) chip.style.setProperty("--chip-x", `${8 + index * 10.5}%`);
      settle("Royal Plinko", bins[index], `Dropped into ${bins[index]}x bin.`, "plinkoResult");
    }, 650);
  }

  function startCrash() {
    if (state.crash && state.crash.running) return;
    const bet = getWager();
    if (bet > state.balance) {
      setResult("crashResult", "Not enough VIP prototype credits for that crash wager.", "loss");
      return;
    }
    state.balance -= bet;
    state.wagered += bet;
    state.plays += 1;
    const crashPoint = Math.max(1.04, Math.round((1 + Math.pow(Math.random(), 2.4) * 14) * 100) / 100);
    state.crash = { bet, multiplier: 1, crashPoint, running: true, cashed: false };
    $("#crashStart").disabled = true;
    $("#crashCashout").disabled = false;
    setResult("crashResult", "Multiplier climbing. Cash out before the crown falls.", "");
    state.crash.timer = setInterval(() => {
      const game = state.crash;
      game.multiplier = Math.round((game.multiplier + 0.04 + game.multiplier * 0.018) * 100) / 100;
      $("#crashValue").textContent = `${game.multiplier.toFixed(2)}x`;
      $(".crash-meter").style.setProperty("--crash-fill", `${Math.min(100, game.multiplier * 9)}%`);
      $(".crash-meter").style.setProperty("--crash-line", `${Math.min(92, 12 + game.multiplier * 6)}%`);
      if (game.multiplier >= game.crashPoint) crashBust();
    }, 110);
    updateUI();
  }

  function crashBust() {
    const game = state.crash;
    if (!game || !game.running) return;
    clearInterval(game.timer);
    game.running = false;
    $("#crashStart").disabled = false;
    $("#crashCashout").disabled = true;
    addLedger("Crown Crash", -game.bet, `Crashed at ${game.crashPoint.toFixed(2)}x`);
    setResult("crashResult", `Crashed at ${game.crashPoint.toFixed(2)}x. Lost ${money(game.bet)}.`, "loss");
    updateUI();
  }

  function cashoutCrash() {
    const game = state.crash;
    if (!game || !game.running) return;
    clearInterval(game.timer);
    game.running = false;
    game.cashed = true;
    const payout = Math.round(game.bet * game.multiplier);
    const profit = payout - game.bet;
    state.balance += payout;
    if (profit > 0) state.wins += 1;
    $("#crashStart").disabled = false;
    $("#crashCashout").disabled = true;
    addLedger("Crown Crash", profit, `Cashed at ${game.multiplier.toFixed(2)}x`);
    setResult("crashResult", `Cashed out at ${game.multiplier.toFixed(2)}x. Won ${money(profit)}.`, "win");
    updateUI();
  }

  function playHighCard() {
    const crew = $("#crewPick").value;
    const player = Math.floor(Math.random() * 13) + 2;
    const house = Math.floor(Math.random() * 13) + 2;
    $("#crewCard").textContent = cardLabel(player);
    $("#houseCard").textContent = cardLabel(house);
    const multiplier = player > house ? 2 : player === house ? 1 : 0;
    const label = player > house ? `${crew} beats the house.` : player === house ? `${crew} pushes the hand.` : `House beats ${crew}.`;
    settle("Crew High Card", multiplier, `${label} ${cardLabel(player)} vs ${cardLabel(house)}.`, "highCardResult");
  }

  function cardLabel(value) {
    return ({ 11: "J", 12: "Q", 13: "K", 14: "A" }[value] || String(value));
  }

  const liveWinNames = ["Money Penny", "AGENT-007", "Oscar", "Lexi", "GOAT Force", "VIP Room", "Studio Host"];
  const liveWinGames = ["Royal Dice", "Crown Crash", "Royal Plinko", "GOAT Roulette", "Crown Slots", "Studio Blackjack"];

  function buildLiveWin() {
    const name = liveWinNames[Math.floor(Math.random() * liveWinNames.length)];
    const game = liveWinGames[Math.floor(Math.random() * liveWinGames.length)];
    const payout = Math.floor(250 + Math.random() * 9750);
    return { name, game, payout };
  }

  function renderLiveWins() {
    const target = $("#liveWins");
    if (!target) return;
    const wins = Array.from({ length: 7 }, buildLiveWin);
    target.innerHTML = "";
    wins.forEach((win) => {
      const row = document.createElement("div");
      row.className = "live-win";
      row.innerHTML = `<b>${win.name}</b><small>${win.game}</small><span>+${money(win.payout)}</span>`;
      target.appendChild(row);
    });
  }

  function pushLiveWin() {
    const target = $("#liveWins");
    if (!target) return;
    const win = buildLiveWin();
    const row = document.createElement("div");
    row.className = "live-win";
    row.innerHTML = `<b>${win.name}</b><small>${win.game}</small><span>+${money(win.payout)}</span>`;
    target.prepend(row);
    while (target.children.length > 7) target.lastElementChild.remove();
  }

  function filterLobby(category) {
    $$(".lobby-chip").forEach((chip) => chip.classList.toggle("active", chip.dataset.filter === category));
    $$(".game-tile").forEach((tile) => {
      const tags = tile.dataset.category || "";
      tile.hidden = category !== "all" && !tags.includes(category);
    });
  }

  function updateRealModeUI() {
    const toggle = $("#realModeToggle");
    if (toggle) toggle.checked = state.realMode;
    setText("realModeState", state.realMode ? "Real Gate Armed" : "Fun Play");
    setText("realModePill", state.realMode ? "ARMED" : "OFF");
    setText(
      "realModeStatus",
      state.realMode
        ? "Owner gate is armed for planning. Real deposits, withdrawals, cash prizes, and crypto wagering still require GOAT legal, KYC/AML, wallet custody, security, and audit approval before activation."
        : "Fun Play is active. Real deposits, withdrawals, cash prizes, and crypto wagering are off."
    );
  }

  function setRealMode(enabled) {
    state.realMode = enabled;
    localStorage.setItem("goatCasinoRealMode", enabled ? "on" : "off");
    updateRealModeUI();
    setResult(
      "nightStatus",
      enabled
        ? "Owner real-money gate armed for planning only. Money movement still stays locked behind GOAT approvals."
        : "Fun Play is active. Prototype credits only.",
      enabled ? "win" : ""
    );
  }

  function activateActivity(tabName) {
    $$(".activity-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.activity === tabName));
    $$(".activity-table").forEach((panel) => panel.classList.toggle("active", panel.id === `activity-${tabName}`));
  }

  function verifyFairnessShell() {
    const stamp = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setText("fairnessStatus", `Verification shell checked at ${stamp}. Full provably-fair crypto hash verification is still locked until the regulated engine is installed.`);
  }

  function buildNightCode() {
    const now = new Date();
    const stamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("");
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `GOAT-VIP-${stamp}-${suffix}`;
  }

  function setText(id, value) {
    const target = document.getElementById(id);
    if (target) target.textContent = value;
  }

  function syncNightPass() {
    const input = $("#nightNameInput");
    if (input && input.value !== state.nightName) input.value = state.nightName;
    const tierInfo = activeTier();
    setText("casinoNightCode", state.nightCode || "GOAT-VIP-PENDING");
    setText("nightHolder", state.nightName || "GOAT Royalty Casino Night");
    setText("nightTier", tierInfo.tier.name);
    setText("nightBalance", money(state.balance));
    setText("nightStamp", "Prototype locked");
  }

  function generateNightPass() {
    state.nightCode = buildNightCode();
    const input = $("#nightNameInput");
    if (input) state.nightName = input.value.trim() || "GOAT Royalty Casino Night";
    saveNightState();
    syncNightPass();
    setResult("nightStatus", `VIP night pass ${state.nightCode} is ready.`, "win");
  }

  function copyFallback(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }

  async function copyNightPass() {
    const payload = [
      `GOAT Royalty Casino Night Pass: ${state.nightCode || "GOAT-VIP-PENDING"}`,
      `Holder: ${state.nightName || "GOAT Royalty Casino Night"}`,
      `Status: ${activeTier().tier.name}`,
      "Mode: prototype credits only; real-money gate locked"
    ].join("\n");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(payload);
      } else {
        copyFallback(payload);
      }
      setResult("nightStatus", "VIP pass copied for the private invite.", "win");
    } catch {
      setResult("nightStatus", "Copy was blocked by the browser. Use Save snapshot instead.", "loss");
    }
  }

  function saveNightSnapshot() {
    const payload = {
      product: "GOAT Royalty Casino Night",
      mode: "prototype-credits-only",
      realMoneyGate: "locked until GOAT legal, licensing, KYC/AML, wallet custody, security, and audit approval",
      pass: state.nightCode || "GOAT-VIP-PENDING",
      holder: state.nightName || "GOAT Royalty Casino Night",
      tier: activeTier().tier.name,
      balance: Math.round(state.balance),
      wagered: Math.round(state.wagered),
      plays: state.plays,
      wins: state.wins,
      rails: [
        "GOAT Security VIP allowlist",
        "GOAT Wallet and payments",
        "GOAT Banking and background checks",
        "GOAT API vault",
        "GOAT Standards Registry GS1 / ISRC",
        "GOAT Royalties"
      ],
      prizeStandards: [
        "GS1 GTIN / UPC for membership, merch, packs, and physical prizes",
        "GS1 GLN for operator/entity/location references",
        "US ISRC for recordings and music videos tied to rewards or promotions"
      ],
      recentLedger: state.ledger.slice(0, 12),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(state.nightCode || "goat-casino-night").toLowerCase()}-snapshot.json`;
    link.click();
    URL.revokeObjectURL(url);
    setResult("nightStatus", "Casino Night snapshot saved for partner review.", "win");
  }

  function wireEvents() {
    $("#resetCasino").addEventListener("click", resetCasino);
    $("#halfBet").addEventListener("click", () => quickBet(0.5));
    $("#doubleBet").addEventListener("click", () => quickBet(2));
    $("#maxBet").addEventListener("click", () => quickBet("max"));
    $("#slotSpin").addEventListener("click", spinSlots);
    $("#diceRoll").addEventListener("click", rollDice);
    $("#diceTarget").addEventListener("input", updateDiceLabel);
    $$(".pick-button").forEach((button) => button.addEventListener("click", () => pickRoulette(button.dataset.pick)));
    $("#rouletteSpin").addEventListener("click", spinRoulette);
    $("#blackjackDeal").addEventListener("click", blackjackDeal);
    $("#blackjackHit").addEventListener("click", blackjackHit);
    $("#blackjackStand").addEventListener("click", blackjackStand);
    $("#plinkoDrop").addEventListener("click", dropPlinko);
    $("#crashStart").addEventListener("click", startCrash);
    $("#crashCashout").addEventListener("click", cashoutCrash);
    $("#highCardPlay").addEventListener("click", playHighCard);
    $$(".game-tile").forEach((tile) => {
      tile.addEventListener("click", () => activateGame(tile.dataset.game, true));
    });
    $$(".lobby-chip").forEach((chip) => {
      chip.addEventListener("click", () => filterLobby(chip.dataset.filter));
    });
    $$(".mini-game-list button").forEach((button) => {
      button.addEventListener("click", () => activateGame(button.dataset.game, true));
    });
    $$(".activity-tab").forEach((tab) => {
      tab.addEventListener("click", () => activateActivity(tab.dataset.activity));
    });
    $("#realModeToggle").addEventListener("change", (event) => setRealMode(event.target.checked));
    $("#verifyFairness").addEventListener("click", verifyFairnessShell);
    $("#generateNightPass").addEventListener("click", generateNightPass);
    $("#copyNightPass").addEventListener("click", copyNightPass);
    $("#saveNightSnapshot").addEventListener("click", saveNightSnapshot);
    $("#nightNameInput").addEventListener("input", (event) => {
      state.nightName = event.target.value.trim() || "GOAT Royalty Casino Night";
      saveNightState();
      syncNightPass();
    });
  }

  function initBins() {
    const bins = [5, 2.4, 1.4, 0.6, 0.2, 0.6, 1.4, 2.4, 5];
    const target = $("#plinkoBins");
    target.innerHTML = "";
    bins.forEach((value) => {
      const bin = document.createElement("div");
      bin.className = "plinko-bin";
      bin.textContent = `${value}x`;
      target.appendChild(bin);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initSlotReels();
    buildPlinkoBoard();
    initBins();
    if (!state.nightCode) generateNightPass();
    const input = $("#nightNameInput");
    if (input) input.value = state.nightName;
    wireEvents();
    renderLiveWins();
    setInterval(pushLiveWin, 5200);
    pickRoulette("red");
    updateDiceLabel();
    updateUI();
  });
}());
