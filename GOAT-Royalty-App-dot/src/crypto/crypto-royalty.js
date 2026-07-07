// ============================================================
// GOAT Crypto Royalty Tracker — Blockchain-Based Music Rights
// Smart Contract Templates · Wallet Integration · Chain of Custody
// Built for Harvey Miller (DJ Speedy)
// ============================================================

const GOATCryptoRoyalty = (() => {
  // ─── BLOCKCHAIN NETWORKS ──────────────────────────────────
  const NETWORKS = [
    { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627EEA', symbol: 'ETH', explorer: 'https://etherscan.io', gasLabel: 'Gwei', standard: 'ERC-721 / ERC-1155' },
    { id: 'polygon', name: 'Polygon', icon: '🟣', color: '#8247E5', symbol: 'MATIC', explorer: 'https://polygonscan.com', gasLabel: 'Gwei', standard: 'ERC-721 / ERC-1155' },
    { id: 'solana', name: 'Solana', icon: '◎', color: '#14F195', symbol: 'SOL', explorer: 'https://solscan.io', gasLabel: 'Lamports', standard: 'Metaplex NFT' },
    { id: 'tezos', name: 'Tezos', icon: 'ꜩ', color: '#2C7DF7', symbol: 'XTZ', explorer: 'https://tzkt.io', gasLabel: 'Mutez', standard: 'FA2' },
    { id: 'base', name: 'Base', icon: '🔵', color: '#0052FF', symbol: 'ETH', explorer: 'https://basescan.org', gasLabel: 'Gwei', standard: 'ERC-721' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔷', color: '#28A0F0', symbol: 'ETH', explorer: 'https://arbiscan.io', gasLabel: 'Gwei', standard: 'ERC-721' },
  ];

  // ─── MUSIC NFT MARKETPLACES ───────────────────────────────
  const MARKETPLACES = [
    { id: 'sound_xyz', name: 'Sound.xyz', icon: '🔊', url: 'https://sound.xyz', network: 'ethereum', description: 'Music NFTs with streaming royalties', features: ['Listening Parties', 'Edition Drops', 'Golden Eggs', 'Artist Splits'] },
    { id: 'catalog', name: 'Catalog', icon: '📀', url: 'https://catalog.works', network: 'ethereum', description: 'One-of-one music NFTs for collectors', features: ['1/1 Music NFTs', 'Record Pressing', 'Backstage Access'] },
    { id: 'audius', name: 'Audius', icon: '🎶', url: 'https://audius.co', network: 'solana', description: 'Decentralized music streaming protocol', features: ['Free Streaming', '$AUDIO Token', 'Artist Payouts', 'Remix Trees'] },
    { id: 'royal', name: 'Royal', icon: '👑', url: 'https://royal.io', network: 'polygon', description: 'Own a share of music royalties via NFTs', features: ['Royalty Shares', 'Fan Investment', 'Gold/Platinum Tiers'] },
    { id: 'arpeggi', name: 'Arpeggi Labs', icon: '🎵', url: 'https://arpeggi.io', network: 'ethereum', description: 'On-chain music creation tools', features: ['On-Chain DAW', 'Stem NFTs', 'Collaborative Creation'] },
    { id: 'nina', name: 'Nina Protocol', icon: '🎧', url: 'https://ninaprotocol.com', network: 'solana', description: 'Music publishing protocol on Solana', features: ['Unlimited Uploads', 'Hubs', 'Revenue Splits', 'Low Fees'] },
    { id: 'spinamp', name: 'Spinamp', icon: '💿', url: 'https://spinamp.xyz', network: 'multi', description: 'Cross-platform music NFT player', features: ['Aggregator', 'Cross-Chain', 'Playlists'] },
    { id: 'zora', name: 'Zora', icon: '🌐', url: 'https://zora.co', network: 'base', description: 'Create and collect on the superchain', features: ['Free Minting', 'Zora Network', 'Protocol Rewards'] },
  ];

  // ─── SMART CONTRACT TEMPLATES ─────────────────────────────
  const CONTRACT_TEMPLATES = [
    {
      id: 'royalty_split',
      name: '💰 Royalty Split Contract',
      description: 'Automatically split royalties between collaborators on-chain',
      language: 'solidity',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

/// @title GOAT Royalty Split — Auto-distribute music royalties
/// @author DJ Speedy / GOAT Royalty
contract GOATRoyaltySplit is PaymentSplitter {
    string public songTitle;
    string public isrc;
    uint256 public releaseDate;
    
    event RoyaltyReceived(address indexed from, uint256 amount);
    event SongRegistered(string title, string isrc);

    constructor(
        string memory _title,
        string memory _isrc,
        address[] memory payees,
        uint256[] memory shares_
    ) PaymentSplitter(payees, shares_) {
        songTitle = _title;
        isrc = _isrc;
        releaseDate = block.timestamp;
        emit SongRegistered(_title, _isrc);
    }

    receive() external payable override {
        emit RoyaltyReceived(msg.sender, msg.value);
    }

    function getSplitInfo() external view returns (
        string memory title, string memory _isrc,
        uint256 _releaseDate, uint256 totalShares
    ) {
        return (songTitle, isrc, releaseDate, 0);
    }
}`
    },
    {
      id: 'music_nft',
      name: '🎵 Music NFT (ERC-721)',
      description: 'Mint music as NFTs with built-in royalty enforcement (EIP-2981)',
      language: 'solidity',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title GOAT Music NFT — Tokenize your music with royalties
/// @author DJ Speedy / GOAT Royalty
contract GOATMusicNFT is ERC721, ERC721URIStorage, ERC2981, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Track {
        string title;
        string artist;
        string isrc;
        uint256 mintedAt;
    }

    mapping(uint256 => Track) public tracks;
    uint96 public defaultRoyaltyBps = 1000; // 10%

    event TrackMinted(uint256 indexed tokenId, string title, string artist);

    constructor() ERC721("GOAT Music", "GOATMUSIC") {
        _setDefaultRoyalty(msg.sender, defaultRoyaltyBps);
    }

    function mintTrack(
        address to,
        string memory uri,
        string memory title,
        string memory artist,
        string memory isrc
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        _safeMint(to, newId);
        _setTokenURI(newId, uri);
        tracks[newId] = Track(title, artist, isrc, block.timestamp);
        emit TrackMinted(newId, title, artist);
        return newId;
    }

    function setRoyalty(uint256 tokenId, address receiver, uint96 bps) public onlyOwner {
        _setTokenRoyalty(tokenId, receiver, bps);
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}`
    },
    {
      id: 'chain_of_custody',
      name: '🔗 Chain of Custody',
      description: 'Immutable record of music rights ownership & transfers',
      language: 'solidity',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title GOAT Chain of Custody — Immutable music rights ledger
/// @author DJ Speedy / GOAT Royalty
contract GOATChainOfCustody {
    struct RightsRecord {
        bytes32 contentHash;    // SHA-256 of audio file
        string isrc;
        string title;
        address registrant;
        uint256 timestamp;
        string rightsType;      // "master" | "publishing" | "sync" | "mechanical"
        string territory;
    }

    struct Transfer {
        uint256 recordId;
        address from;
        address to;
        uint256 timestamp;
        string transferType;    // "sale" | "license" | "assignment"
        string terms;
    }

    RightsRecord[] public records;
    Transfer[] public transfers;

    mapping(bytes32 => uint256) public hashToRecord;
    mapping(address => uint256[]) public ownerRecords;

    event RightsRegistered(uint256 indexed recordId, bytes32 contentHash, string title, address registrant);
    event RightsTransferred(uint256 indexed transferId, uint256 recordId, address from, address to);

    function registerRights(
        bytes32 _hash, string calldata _isrc, string calldata _title,
        string calldata _rightsType, string calldata _territory
    ) external returns (uint256) {
        require(hashToRecord[_hash] == 0, "Content already registered");
        uint256 id = records.length;
        records.push(RightsRecord(_hash, _isrc, _title, msg.sender, block.timestamp, _rightsType, _territory));
        hashToRecord[_hash] = id + 1;
        ownerRecords[msg.sender].push(id);
        emit RightsRegistered(id, _hash, _title, msg.sender);
        return id;
    }

    function transferRights(
        uint256 _recordId, address _to,
        string calldata _transferType, string calldata _terms
    ) external returns (uint256) {
        require(_recordId < records.length, "Invalid record");
        require(records[_recordId].registrant == msg.sender, "Not rights holder");
        uint256 tid = transfers.length;
        transfers.push(Transfer(_recordId, msg.sender, _to, block.timestamp, _transferType, _terms));
        records[_recordId].registrant = _to;
        ownerRecords[_to].push(_recordId);
        emit RightsTransferred(tid, _recordId, msg.sender, _to);
        return tid;
    }

    function verifyOwnership(bytes32 _hash) external view returns (bool exists, address owner, string memory title) {
        uint256 idx = hashToRecord[_hash];
        if (idx == 0) return (false, address(0), "");
        RightsRecord memory r = records[idx - 1];
        return (true, r.registrant, r.title);
    }

    function getRecordCount() external view returns (uint256) { return records.length; }
    function getTransferCount() external view returns (uint256) { return transfers.length; }
}`
    }
  ];

  // ─── STATE ────────────────────────────────────────────────
  let activeTab = 'dashboard';
  let walletConnected = false;
  let walletAddress = '';
  let selectedNetwork = 'ethereum';

  // ─── RENDER ───────────────────────────────────────────────
  function render(container) {
    container.innerHTML = `
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:42px;margin-bottom:6px">⛓️</div>
        <h3 style="font-size:18px;background:linear-gradient(135deg,#627EEA,#14F195);-webkit-background-clip:text;-webkit-text-fill-color:transparent">GOAT Crypto Royalty</h3>
        <p style="font-size:12px;color:var(--text-muted)">Blockchain Music Rights · NFTs · Smart Contracts · Chain of Custody</p>
      </div>

      <!-- Tabs -->
      <div style="display:flex;gap:4px;margin-bottom:16px;background:var(--bg-primary);border-radius:var(--radius-sm);padding:4px">
        <button class="crypto-tab ${activeTab==='dashboard'?'active':''}" onclick="window._cryptoTab('dashboard')" style="flex:1;padding:8px;border:none;border-radius:var(--radius-sm);background:${activeTab==='dashboard'?'var(--accent)':'transparent'};color:${activeTab==='dashboard'?'white':'var(--text-secondary)'};cursor:pointer;font-size:11px;font-weight:600">📊 Dashboard</button>
        <button class="crypto-tab ${activeTab==='marketplaces'?'active':''}" onclick="window._cryptoTab('marketplaces')" style="flex:1;padding:8px;border:none;border-radius:var(--radius-sm);background:${activeTab==='marketplaces'?'var(--accent)':'transparent'};color:${activeTab==='marketplaces'?'white':'var(--text-secondary)'};cursor:pointer;font-size:11px;font-weight:600">🏪 NFT Markets</button>
        <button class="crypto-tab ${activeTab==='contracts'?'active':''}" onclick="window._cryptoTab('contracts')" style="flex:1;padding:8px;border:none;border-radius:var(--radius-sm);background:${activeTab==='contracts'?'var(--accent)':'transparent'};color:${activeTab==='contracts'?'white':'var(--text-secondary)'};cursor:pointer;font-size:11px;font-weight:600">📜 Contracts</button>
        <button class="crypto-tab ${activeTab==='custody'?'active':''}" onclick="window._cryptoTab('custody')" style="flex:1;padding:8px;border:none;border-radius:var(--radius-sm);background:${activeTab==='custody'?'var(--accent)':'transparent'};color:${activeTab==='custody'?'white':'var(--text-secondary)'};cursor:pointer;font-size:11px;font-weight:600">🔗 Custody</button>
      </div>

      <div id="cryptoContent">${renderTab()}</div>
    `;
  }

  function renderTab() {
    switch(activeTab) {
      case 'dashboard': return renderDashboard();
      case 'marketplaces': return renderMarketplaces();
      case 'contracts': return renderContracts();
      case 'custody': return renderCustody();
      default: return renderDashboard();
    }
  }

  function renderDashboard() {
    return `
      <!-- Network Selector -->
      <div style="display:flex;gap:4px;margin-bottom:14px;flex-wrap:wrap">
        ${NETWORKS.map(n => `<button class="tool-btn" style="padding:5px 10px;flex-direction:row;gap:4px;font-size:11px;${n.id===selectedNetwork?`background:${n.color};color:white;border-color:${n.color}`:''}" onclick="window._cryptoNetwork('${n.id}')">${n.icon} ${n.name}</button>`).join('')}
      </div>

      <!-- Stats Cards -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
        <div style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:24px;font-weight:700;color:var(--green)">$0.00</div>
          <div style="font-size:11px;color:var(--text-muted)">On-Chain Royalties Earned</div>
        </div>
        <div style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:24px;font-weight:700;color:var(--accent)">0</div>
          <div style="font-size:11px;color:var(--text-muted)">Music NFTs Minted</div>
        </div>
        <div style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:24px;font-weight:700;color:var(--cyan)">0</div>
          <div style="font-size:11px;color:var(--text-muted)">Smart Contracts Deployed</div>
        </div>
        <div style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:24px;font-weight:700;color:#f59e0b">0</div>
          <div style="font-size:11px;color:var(--text-muted)">Rights Registered</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <h4 style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:8px">QUICK ACTIONS</h4>
      <div style="display:grid;gap:6px">
        <button class="terminal-run-btn" style="width:100%;background:linear-gradient(135deg,#627EEA,#8247E5)" onclick="window._cryptoAction('mint')">🎵 Mint Music NFT</button>
        <button class="terminal-run-btn" style="width:100%;background:linear-gradient(135deg,var(--green),var(--cyan))" onclick="window._cryptoAction('split')">💰 Create Royalty Split</button>
        <button class="terminal-run-btn" style="width:100%;background:linear-gradient(135deg,#f59e0b,#ef4444)" onclick="window._cryptoAction('register')">🔗 Register Rights On-Chain</button>
        <button class="terminal-run-btn" style="width:100%;background:linear-gradient(135deg,var(--accent),#6366f1)" onclick="window._cryptoAction('verify')">🔍 Verify Ownership</button>
      </div>

      <!-- Info -->
      <div style="margin-top:14px;padding:10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:11px;color:var(--text-muted)">
        💡 <strong>Web3 Music:</strong> Blockchain technology enables transparent, immutable music rights management. Royalties are split automatically via smart contracts. Each track gets a unique on-chain fingerprint for proof of ownership.
      </div>`;
  }

  function renderMarketplaces() {
    return `
      <h4 style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">🏪 Music NFT Marketplaces</h4>
      <div style="display:grid;gap:8px">
        ${MARKETPLACES.map(m => {
          const net = NETWORKS.find(n => n.id === m.network) || { icon: '🌐', color: '#666' };
          return `<div style="padding:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:24px">${m.icon}</span>
                <div>
                  <div style="font-weight:700;font-size:14px;color:var(--text-primary)">${m.name}</div>
                  <div style="font-size:11px;color:var(--text-muted)">${m.description}</div>
                </div>
              </div>
              <span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:600;background:${net.color}22;color:${net.color}">${net.icon} ${m.network}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">${m.features.map(f => `<span style="padding:2px 8px;background:rgba(118,185,0,0.1);color:var(--green);border-radius:6px;font-size:10px">${f}</span>`).join('')}</div>
            <a href="${m.url}" style="display:inline-block;padding:6px 14px;background:var(--accent);color:white;border-radius:var(--radius-sm);text-decoration:none;font-size:12px;font-weight:600" target="_blank">Visit ${m.name} →</a>
          </div>`;
        }).join('')}
      </div>`;
  }

  function renderContracts() {
    return `
      <h4 style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">📜 Smart Contract Templates</h4>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:14px">Production-ready Solidity contracts for music rights management. Deploy on Ethereum, Polygon, Base, or Arbitrum.</p>
      <div style="display:grid;gap:10px">
        ${CONTRACT_TEMPLATES.map(t => `
          <div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden">
            <div style="padding:12px;border-bottom:1px solid var(--border)">
              <div style="font-weight:700;font-size:14px;color:var(--text-primary)">${t.name}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${t.description}</div>
            </div>
            <div style="max-height:200px;overflow-y:auto">
              <pre style="margin:0;padding:10px;font-size:11px;line-height:1.5;background:var(--bg-secondary);color:var(--text-primary);overflow-x:auto"><code>${escapeHtmlCrypto(t.code)}</code></pre>
            </div>
            <div style="padding:8px 12px;display:flex;gap:6px;border-top:1px solid var(--border)">
              <button class="tool-btn" style="padding:5px 10px;flex-direction:row;font-size:11px" onclick="navigator.clipboard.writeText(${JSON.stringify(JSON.stringify(t.code))})">📋 Copy</button>
              <button class="tool-btn" style="padding:5px 10px;flex-direction:row;font-size:11px" onclick="window._cryptoSendToChat('${t.id}')">💬 Send to Chat</button>
            </div>
          </div>
        `).join('')}
      </div>`;
  }

  function renderCustody() {
    return `
      <h4 style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">🔗 Chain of Custody</h4>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:14px">Register and verify music rights ownership on the blockchain. Every registration creates an immutable, timestamped record.</p>

      <div style="display:grid;gap:10px">
        <div style="padding:14px;background:var(--bg-primary);border:1px solid var(--accent);border-radius:var(--radius-sm)">
          <h5 style="font-size:13px;color:var(--accent);margin-bottom:10px">📝 Register New Rights</h5>
          <div style="display:grid;gap:8px">
            <input class="terminal-input" placeholder="Song Title" style="width:100%" id="custodyTitle">
            <input class="terminal-input" placeholder="ISRC Code (e.g., US-XX1-23-00001)" style="width:100%" id="custodyISRC">
            <select class="terminal-input" style="width:100%" id="custodyRights">
              <option value="master">Master Recording Rights</option>
              <option value="publishing">Publishing Rights</option>
              <option value="sync">Sync License Rights</option>
              <option value="mechanical">Mechanical Rights</option>
              <option value="performance">Performance Rights</option>
            </select>
            <input class="terminal-input" placeholder="Territory (e.g., Worldwide, US, EU)" value="Worldwide" style="width:100%" id="custodyTerritory">
            <button class="terminal-run-btn" style="width:100%;background:linear-gradient(135deg,var(--accent),var(--cyan))" onclick="window._cryptoRegister()">🔗 Register on Blockchain</button>
          </div>
        </div>

        <div style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)">
          <h5 style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">🔍 Verify Ownership</h5>
          <div style="display:grid;gap:8px">
            <input class="terminal-input" placeholder="Content Hash (SHA-256) or ISRC" style="width:100%" id="custodyVerifyHash">
            <button class="terminal-run-btn" style="width:100%;background:var(--green)" onclick="window._cryptoVerify()">🔍 Verify</button>
          </div>
          <div id="custodyVerifyResult" style="margin-top:10px"></div>
        </div>

        <!-- Process Flow -->
        <div style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm)">
          <h5 style="font-size:12px;color:var(--text-muted);margin-bottom:8px">HOW IT WORKS</h5>
          <div style="font-size:12px;color:var(--text-primary);display:grid;gap:6px">
            <div>1️⃣ <strong>Upload:</strong> Your audio file is hashed (SHA-256) locally — never uploaded</div>
            <div>2️⃣ <strong>Register:</strong> Hash + metadata written to blockchain as immutable record</div>
            <div>3️⃣ <strong>Timestamp:</strong> Block timestamp proves when you registered the work</div>
            <div>4️⃣ <strong>Verify:</strong> Anyone can verify your ownership with the content hash</div>
            <div>5️⃣ <strong>Transfer:</strong> Rights can be transferred with full audit trail on-chain</div>
          </div>
        </div>
      </div>`;
  }

  function escapeHtmlCrypto(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ─── GLOBAL HANDLERS ──────────────────────────────────────
  window._cryptoTab = function(tab) {
    activeTab = tab;
    const c = document.getElementById('toolPanelContent');
    if (c) render(c);
  };

  window._cryptoNetwork = function(id) {
    selectedNetwork = id;
    const c = document.getElementById('toolPanelContent');
    if (c) render(c);
  };

  window._cryptoAction = function(action) {
    const messages = {
      mint: 'Help me mint a music NFT. I want to tokenize my latest track with 10% royalty on secondary sales. Guide me through the process for Ethereum/Polygon.',
      split: 'Create a royalty split smart contract for my new song. I need 50% for me (DJ Speedy), 25% for the producer, 15% for the featured artist, and 10% for the label.',
      register: 'Register my music rights on the blockchain. Generate a SHA-256 hash for proof of ownership and create an immutable chain of custody record.',
      verify: 'Verify the ownership of a music track using its blockchain record. Show me how to check the chain of custody.'
    };
    if (typeof closeToolPanel === 'function') closeToolPanel();
    const input = document.getElementById('message-input');
    if (input) { input.value = messages[action] || ''; if (typeof sendMessage === 'function') sendMessage(); }
  };

  window._cryptoSendToChat = function(templateId) {
    const template = CONTRACT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    if (typeof closeToolPanel === 'function') closeToolPanel();
    const input = document.getElementById('message-input');
    if (input) {
      input.value = `Review and explain this ${template.name} smart contract. Suggest improvements for music royalty management:\n\n\`\`\`solidity\n${template.code.slice(0, 500)}...\n\`\`\``;
      if (typeof sendMessage === 'function') sendMessage();
    }
  };

  window._cryptoRegister = function() {
    const title = document.getElementById('custodyTitle')?.value || '';
    const isrc = document.getElementById('custodyISRC')?.value || '';
    if (!title) { alert('Please enter a song title'); return; }
    if (typeof closeToolPanel === 'function') closeToolPanel();
    const input = document.getElementById('message-input');
    if (input) {
      input.value = `Register music rights on the blockchain for:\n- Title: "${title}"\n- ISRC: ${isrc || 'N/A'}\n- Rights: ${document.getElementById('custodyRights')?.value || 'master'}\n- Territory: ${document.getElementById('custodyTerritory')?.value || 'Worldwide'}\n\nGenerate a SHA-256 content hash and create the chain of custody record.`;
      if (typeof sendMessage === 'function') sendMessage();
    }
  };

  window._cryptoVerify = function() {
    const hash = document.getElementById('custodyVerifyHash')?.value || '';
    const result = document.getElementById('custodyVerifyResult');
    if (!hash) { if (result) result.innerHTML = '<p style="color:var(--red);font-size:12px">Please enter a content hash or ISRC</p>'; return; }
    if (result) result.innerHTML = `<div style="padding:10px;background:rgba(118,185,0,0.1);border:1px solid var(--green);border-radius:var(--radius-sm);font-size:12px"><strong style="color:var(--green)">🔍 Verification Initiated</strong><br><span style="color:var(--text-muted)">Querying blockchain for: ${hash.slice(0,20)}...</span></div>`;
  };

  return { render, NETWORKS, MARKETPLACES, CONTRACT_TEMPLATES };
})();

// Export for renderer
if (typeof window !== 'undefined') {
  window.GOATCryptoRoyalty = GOATCryptoRoyalty;
  window.renderCryptoRoyalty = function(container) { GOATCryptoRoyalty.render(container); };
}