/**
 * Blockchain Provider
 * Handles connections to various blockchain networks
 */

const { ethers } = require('ethers');

class BlockchainProvider {
  constructor() {
    this.networks = {
      ethereum: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: process.env.ETH_RPC || 'https://eth.llamarpc.com',
        explorer: 'https://etherscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
      },
      polygon: {
        chainId: 137,
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com',
        explorer: 'https://polygonscan.com',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
      },
      arbitrum: {
        chainId: 42161,
        name: 'Arbitrum One',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        explorer: 'https://arbiscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
      },
      base: {
        chainId: 8453,
        name: 'Base',
        rpcUrl: 'https://mainnet.base.org',
        explorer: 'https://basescan.org',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
      },
      sepolia: {
        chainId: 11155111,
        name: 'Sepolia Testnet',
        rpcUrl: 'https://rpc.sepolia.org',
        explorer: 'https://sepolia.etherscan.io',
        nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 }
      }
    };

    this.providers = new Map();
    this.contracts = new Map();
  }

  /**
   * Get or create a provider for a network
   */
  getProvider(network = 'ethereum') {
    if (this.providers.has(network)) {
      return this.providers.get(network);
    }

    const networkConfig = this.networks[network];
    if (!networkConfig) {
      throw new Error(`Unknown network: ${network}`);
    }

    const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    this.providers.set(network, provider);
    return provider;
  }

  /**
   * Get balance for an address
   */
  async getBalance(address, network = 'ethereum') {
    try {
      const provider = this.getProvider(network);
      const balance = await provider.getBalance(address);
      const formatted = ethers.formatEther(balance);
      
      return {
        address,
        network,
        balance: formatted,
        symbol: this.networks[network].nativeCurrency.symbol,
        chainId: this.networks[network].chainId
      };
    } catch (error) {
      console.error(`[Blockchain] Error getting balance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash, network = 'ethereum') {
    const provider = this.getProvider(network);
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      return null;
    }

    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      gasPrice: tx.gasPrice?.toString(),
      gasLimit: tx.gasLimit?.toString(),
      blockNumber: tx.blockNumber,
      network,
      explorerUrl: `${this.networks[network].explorer}/tx/${txHash}`
    };
  }

  /**
   * Get network info
   */
  getNetworkInfo(network = 'ethereum') {
    const config = this.networks[network];
    if (!config) {
      throw new Error(`Unknown network: ${network}`);
    }
    return config;
  }

  /**
   * List supported networks
   */
  listNetworks() {
    return Object.entries(this.networks).map(([id, config]) => ({
      id,
      ...config
    }));
  }
}

module.exports = new BlockchainProvider();