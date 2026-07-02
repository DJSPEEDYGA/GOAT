/**
 * GOAT Royalty - Web3 Wallet Integration
 * Handles crypto wallet connections, NFT minting, and blockchain interactions
 * Supports Ethereum, Polygon, and Base networks
 */

const { ethers } = require('ethers');

// Contract ABIs (simplified for key functions)
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)'
];

const ERC721_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function safeMint(address to, string memory uri) returns (uint256)',
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function transferFrom(address from, address to, uint256 tokenId)'
];

const MARKETPLACE_ABI = [
    'function listItem(address nftContract, uint256 tokenId, uint256 price)',
    'function buyItem(address nftContract, uint256 tokenId) payable',
    'function cancelListing(address nftContract, uint256 tokenId)',
    'function getListing(address nftContract, uint256 tokenId) view returns (tuple(address seller, uint256 price))'
];

// Network configurations
const NETWORKS = {
    ethereum: {
        chainId: '0x1', // 1
        chainName: 'Ethereum Mainnet',
        rpcUrl: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
        blockExplorer: 'https://etherscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
    },
    polygon: {
        chainId: '0x89', // 137
        chainName: 'Polygon Mainnet',
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon.llamarpc.com',
        blockExplorer: 'https://polygonscan.com',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
    },
    base: {
        chainId: '0x2105', // 8453
        chainName: 'Base Mainnet',
        rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
        blockExplorer: 'https://basescan.org',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
    }
};

// Contract addresses (deployed contracts)
const CONTRACTS = {
    ethereum: {
        goatToken: process.env.ETH_GOAT_TOKEN,
        goatNFT: process.env.ETH_GOAT_NFT,
        marketplace: process.env.ETH_MARKETPLACE
    },
    polygon: {
        goatToken: process.env.POLYGON_GOAT_TOKEN,
        goatNFT: process.env.POLYGON_GOAT_NFT,
        marketplace: process.env.POLYGON_MARKETPLACE
    },
    base: {
        goatToken: process.env.BASE_GOAT_TOKEN,
        goatNFT: process.env.BASE_GOAT_NFT,
        marketplace: process.env.BASE_MARKETPLACE
    }
};

class GoatWeb3 {
    constructor() {
        this.providers = {};
        this.contracts = {};
        this.initializeProviders();
    }

    // ==================== INITIALIZATION ====================

    initializeProviders() {
        for (const [network, config] of Object.entries(NETWORKS)) {
            this.providers[network] = new ethers.JsonRpcProvider(config.rpcUrl);
            
            // Initialize contracts if addresses are set
            if (CONTRACTS[network]?.goatNFT) {
                this.contracts[network] = {
                    nft: new ethers.Contract(
                        CONTRACTS[network].goatNFT,
                        ERC721_ABI,
                        this.providers[network]
                    ),
                    token: CONTRACTS[network].goatToken ? new ethers.Contract(
                        CONTRACTS[network].goatToken,
                        ERC20_ABI,
                        this.providers[network]
                    ) : null,
                    marketplace: CONTRACTS[network].marketplace ? new ethers.Contract(
                        CONTRACTS[network].marketplace,
                        MARKETPLACE_ABI,
                        this.providers[network]
                    ) : null
                };
            }
        }
    }

    // ==================== WALLET CONNECTION ====================

    // Front-end wallet connection code (to be injected)
    getWalletConnectCode() {
        return `
// GOAT Wallet Connection - Inject this into frontend
async function connectWallet(preferredNetwork = 'polygon') {
    if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        // Switch to preferred network
        await switchNetwork(preferredNetwork);
        
        return {
            address: accounts[0],
            chainId: await window.ethereum.request({ method: 'eth_chainId' })
        };
    } catch (error) {
        console.error('Wallet connection failed:', error);
        throw error;
    }
}

async function switchNetwork(networkName) {
    const networks = ${JSON.stringify(NETWORKS)};
    const network = networks[networkName];
    
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: network.chainId }]
        });
    } catch (switchError) {
        // Network not added to wallet
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: network.chainId,
                    chainName: network.chainName,
                    rpcUrls: [network.rpcUrl],
                    blockExplorerUrls: [network.blockExplorer],
                    nativeCurrency: network.nativeCurrency
                }]
            });
        } else {
            throw switchError;
        }
    }
}

// Listen for account changes
window.ethereum?.on('accountsChanged', (accounts) => {
    console.log('Account changed:', accounts[0]);
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('walletAccountChanged', { 
        detail: { address: accounts[0] } 
    }));
});

// Listen for chain changes
window.ethereum?.on('chainChanged', (chainId) => {
    console.log('Chain changed:', chainId);
    window.dispatchEvent(new CustomEvent('walletChainChanged', { 
        detail: { chainId } 
    }));
});
`;
    }

    // ==================== BALANCE CHECKING ====================

    async getNativeBalance(address, network = 'polygon') {
        const provider = this.providers[network];
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    async getTokenBalance(walletAddress, tokenAddress, network = 'polygon') {
        const provider = this.providers[network];
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = await token.balanceOf(walletAddress);
        const decimals = 18; // Most ERC-20 tokens use 18 decimals
        return ethers.formatUnits(balance, decimals);
    }

    async getNFTBalance(walletAddress, nftAddress, network = 'polygon') {
        const provider = this.providers[network];
        const nft = new ethers.Contract(nftAddress, ERC721_ABI, provider);
        const balance = await nft.balanceOf(walletAddress);
        return balance.toString();
    }

    // ==================== NFT MINTING ====================

    async getMintTransaction(nftAddress, recipientAddress, tokenURI, network = 'polygon') {
        const nft = new ethers.Contract(nftAddress, ERC721_ABI, this.providers[network]);
        
        // Build the transaction
        const tx = await nft.safeMint.populateTransaction(recipientAddress, tokenURI);
        
        return {
            to: nftAddress,
            data: tx.data,
            value: '0x0'
        };
    }

    async mintNFTWithSigner(signer, nftAddress, recipientAddress, tokenURI, network = 'polygon') {
        const nft = new ethers.Contract(nftAddress, ERC721_ABI, signer);
        const tx = await nft.safeMint(recipientAddress, tokenURI);
        const receipt = await tx.wait();
        
        // Parse the Transfer event to get token ID
        const transferEvent = receipt.logs.find(log => {
            try {
                return nft.interface.parseLog(log)?.name === 'Transfer';
            } catch { return false; }
        });
        
        const tokenId = transferEvent ? 
            nft.interface.parseLog(transferEvent).args.tokenId.toString() : 
            null;

        return {
            transactionHash: receipt.hash,
            tokenId,
            blockNumber: receipt.blockNumber
        };
    }

    // ==================== NFT METADATA ====================

    async getNFTMetadata(nftAddress, tokenId, network = 'polygon') {
        const provider = this.providers[network];
        const nft = new ethers.Contract(nftAddress, ERC721_ABI, provider);
        
        const [owner, tokenURI] = await Promise.all([
            nft.ownerOf(tokenId),
            nft.tokenURI(tokenId)
        ]);

        // Fetch metadata from URI
        let metadata = null;
        try {
            const response = await fetch(tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/'));
            metadata = await response.json();
        } catch (e) {
            console.warn('Could not fetch metadata:', e);
        }

        return {
            tokenId: tokenId.toString(),
            owner,
            tokenURI,
            metadata
        };
    }

    // ==================== GAS ESTIMATION ====================

    async estimateGas(transaction, network = 'polygon') {
        const provider = this.providers[network];
        const gasEstimate = await provider.estimateGas(transaction);
        const feeData = await provider.getFeeData();
        
        const gasCost = gasEstimate * feeData.gasPrice;
        
        return {
            gasLimit: gasEstimate.toString(),
            gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei') + ' gwei',
            estimatedCost: ethers.formatEther(gasCost) + ' ETH/MATIC'
        };
    }

    // ==================== TRANSACTION STATUS ====================

    async getTransactionStatus(txHash, network = 'polygon') {
        const provider = this.providers[network];
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (!receipt) {
            return { status: 'pending' };
        }

        return {
            status: receipt.status === 1 ? 'success' : 'failed',
            blockNumber: receipt.blockNumber,
            confirmations: await provider.getBlockNumber() - receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        };
    }

    async waitForTransaction(txHash, network = 'polygon', confirmations = 1) {
        const provider = this.providers[network];
        const receipt = await provider.waitForTransaction(txHash, confirmations);
        return {
            status: receipt.status === 1 ? 'success' : 'failed',
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        };
    }

    // ==================== SIGNATURE VERIFICATION ====================

    async verifySignature(message, signature, expectedAddress) {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    }

    generateNonce() {
        // Generate a random nonce for signature verification
        return ethers.hexlify(ethers.randomBytes(32));
    }

    // ==================== GOAT TOKEN FUNCTIONS ====================

    async getGOATTokenPrice() {
        // In production, fetch from DEX or price oracle
        // For now, return a placeholder
        return {
            usd: 0.0420,
            eth: 0.000015,
            change24h: 5.2
        };
    }

    async getGOATTokenomics() {
        return {
            totalSupply: '1,000,000,000 GOAT',
            circulatingSupply: '420,069,000 GOAT',
            marketCap: '$17,644,898',
            holders: 1337,
            transactions: 50000
        };
    }

    // ==================== NFT COLLECTION INFO ====================

    async getGOATNFTCollectionStats(network = 'polygon') {
        // In production, query from blockchain or indexer
        return {
            name: 'GOAT Royalty NFT',
            totalSupply: 10000,
            floorPrice: '0.5 ETH',
            volumeTraded: '420 ETH',
            owners: 850
        };
    }

    // ==================== MULTI-SIG WALLET ====================

    async createMultiSigProposal(proposalData) {
        // For treasury/governance
        return {
            proposalId: ethers.hexlify(ethers.randomBytes(32)),
            requiredSignatures: 3,
            deadline: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
            data: proposalData
        };
    }
}

// Express.js middleware for Web3 authentication
function web3AuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        // Token format: { address, signature, message, timestamp }
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        
        // Verify timestamp (token valid for 1 hour)
        const oneHour = 3600000;
        if (Date.now() - decoded.timestamp > oneHour) {
            return res.status(401).json({ error: 'Token expired' });
        }

        // Verify signature
        const web3 = new GoatWeb3();
        const isValid = web3.verifySignature(decoded.message, decoded.signature, decoded.address);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        req.user = { address: decoded.address };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// API Routes for Express
function setupWeb3Routes(app) {
    const web3 = new GoatWeb3();

    // Get balance endpoint
    app.get('/api/web3/balance/:address', async (req, res) => {
        try {
            const { address } = req.params;
            const network = req.query.network || 'polygon';
            
            const [native, goat] = await Promise.all([
                web3.getNativeBalance(address, network),
                CONTRACTS[network]?.goatToken ? 
                    web3.getTokenBalance(address, CONTRACTS[network].goatToken, network) : 
                    Promise.resolve('0')
            ]);

            res.json({ native, goat, network });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get NFTs endpoint
    app.get('/api/web3/nfts/:address', async (req, res) => {
        try {
            const { address } = req.params;
            const network = req.query.network || 'polygon';
            
            const nftBalance = await web3.getNFTBalance(
                address, 
                CONTRACTS[network].goatNFT, 
                network
            );

            res.json({ nftBalance, network });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get transaction status
    app.get('/api/web3/tx/:hash', async (req, res) => {
        try {
            const { hash } = req.params;
            const network = req.query.network || 'polygon';
            
            const status = await web3.getTransactionStatus(hash, network);
            res.json(status);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Protected route example
    app.get('/api/web3/protected', web3AuthMiddleware, (req, res) => {
        res.json({ message: 'Access granted', address: req.user.address });
    });

    // Get wallet connection code for frontend
    app.get('/api/web3/client-code', (req, res) => {
        res.type('application/javascript').send(web3.getWalletConnectCode());
    });
}

// Export
module.exports = {
    GoatWeb3,
    web3AuthMiddleware,
    setupWeb3Routes,
    NETWORKS,
    CONTRACTS
};