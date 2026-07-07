/**
 * Blockchain Verification Service
 * Verifies royalty transactions and creates proof records
 */

const provider = require('./provider');

class BlockchainVerification {
  constructor() {
    this.verificationRecords = new Map();
  }

  /**
   * Verify a royalty payment on-chain
   */
  async verifyRoyalty(data) {
    const { txHash, network = 'ethereum', expectedAmount, recipient } = data;

    try {
      const txDetails = await provider.getTransaction(txHash, network);
      
      if (!txDetails) {
        return {
          verified: false,
          reason: 'Transaction not found'
        };
      }

      const verification = {
        txHash,
        network,
        verified: true,
        details: {
          from: txDetails.from,
          to: txDetails.to,
          value: txDetails.value,
          blockNumber: txDetails.blockNumber,
          timestamp: Date.now()
        },
        explorerUrl: txDetails.explorerUrl
      };

      // Verify recipient if provided
      if (recipient && txDetails.to?.toLowerCase() !== recipient.toLowerCase()) {
        verification.recipientMatch = false;
        verification.expectedRecipient = recipient;
        verification.actualRecipient = txDetails.to;
      } else {
        verification.recipientMatch = true;
      }

      // Verify amount if provided
      if (expectedAmount) {
        const actualValue = parseFloat(txDetails.value);
        verification.amountMatch = Math.abs(actualValue - expectedAmount) < 0.0001;
        verification.expectedAmount = expectedAmount;
        verification.actualAmount = actualValue;
      }

      // Store verification record
      this.verificationRecords.set(txHash, verification);

      return verification;
    } catch (error) {
      return {
        verified: false,
        error: error.message
      };
    }
  }

  /**
   * Create a royalty proof record
   */
  createRoyaltyProof(royaltyData) {
    const proofId = `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const proof = {
      id: proofId,
      type: 'RoyaltyVerificationProof',
      data: {
        workId: royaltyData.workId,
        amount: royaltyData.amount,
        recipient: royaltyData.recipient,
        timestamp: Date.now()
      },
      signature: this.generateSignature(royaltyData),
      verificationUrl: `https://verify.goatroyalty.com/proof/${proofId}`
    };

    return proof;
  }

  /**
   * Generate a cryptographic signature (simulated)
   */
  generateSignature(data) {
    const crypto = require('crypto');
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
    return `0x${hash}`;
  }

  /**
   * Get verification history
   */
  getVerificationHistory(limit = 50) {
    return Array.from(this.verificationRecords.values())
      .slice(-limit)
      .sort((a, b) => b.details.timestamp - a.details.timestamp);
  }
}

module.exports = new BlockchainVerification();