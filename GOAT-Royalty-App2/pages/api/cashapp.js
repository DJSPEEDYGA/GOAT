/**
 * Cash App API Endpoint for GOAT Royalty App
 * Handles wallet linking, Bitcoin operations, and royalty payments
 */

import { CashAppClient, PayoutStatus } from '../../lib/cashapp-integration.js';

// Initialize client (in production, use proper session management)
const clients = new Map();

function getClient(sessionId) {
  if (!clients.has(sessionId)) {
    clients.set(sessionId, new CashAppClient());
  }
  return clients.get(sessionId);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, sessionId, ...data } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action is required' });
  }

  const client = getClient(sessionId || 'default');

  try {
    let result;

    switch (action) {
      case 'link':
        if (!data.cashtag) {
          return res.status(400).json({ error: 'Cashtag is required' });
        }
        result = client.linkWallet(data.cashtag);
        res.status(200).json({
          success: true,
          wallet: {
            cashtag: result.cashtag,
            linked: result.linked
          }
        });
        break;

      case 'getAddress':
        if (!data.cashtag) {
          return res.status(400).json({ error: 'Cashtag is required' });
        }
        result = client.getBitcoinAddress(data.cashtag);
        res.status(200).json({
          success: true,
          address: result
        });
        break;

      case 'getLightning':
        if (!data.cashtag) {
          return res.status(400).json({ error: 'Cashtag is required' });
        }
        result = client.getLightningAddress(data.cashtag);
        res.status(200).json({
          success: true,
          lightningAddress: result
        });
        break;

      case 'send':
        if (!data.amount || !data.address) {
          return res.status(400).json({ error: 'Amount and address are required' });
        }
        result = await client.sendBitcoin(
          parseFloat(data.amount),
          data.address,
          data.note
        );
        res.status(200).json({
          success: true,
          payout: {
            id: result.id,
            amountBtc: result.amountBtc,
            address: result.address,
            status: result.status,
            createdAt: result.createdAt
          }
        });
        break;

      case 'setApiKey':
        if (!data.apiKey) {
          return res.status(400).json({ error: 'API key is required' });
        }
        client.setApiKey(data.apiKey);
        res.status(200).json({
          success: true,
          message: 'API key configured'
        });
        break;

      case 'getPrice':
        result = await client.getBtcPrice();
        res.status(200).json({
          success: true,
          price: result
        });
        break;

      case 'convert':
        if (!data.amount || !data.direction) {
          return res.status(400).json({ error: 'Amount and direction are required' });
        }
        if (data.direction === 'btc_to_usd') {
          result = await client.btcToUsd(parseFloat(data.amount));
        } else {
          result = await client.usdToBtc(parseFloat(data.amount));
        }
        res.status(200).json({
          success: true,
          result: result,
          direction: data.direction
        });
        break;

      case 'wallets':
        result = client.listWallets();
        res.status(200).json({
          success: true,
          wallets: result.map(w => ({
            cashtag: w.cashtag,
            linked: w.linked,
            balance: w.balance
          }))
        });
        break;

      case 'balance':
        if (!data.cashtag) {
          return res.status(400).json({ error: 'Cashtag is required' });
        }
        const wallets = client.listWallets();
        const wallet = wallets.find(w => 
          w.cashtag === data.cashtag.replace('$', '').toLowerCase()
        );
        if (!wallet) {
          return res.status(404).json({ error: 'Wallet not found' });
        }
        res.status(200).json({
          success: true,
          balance: wallet.balance
        });
        break;

      case 'royalty':
        if (!data.cashtag || !data.amountUsd || !data.trackName) {
          return res.status(400).json({ error: 'Cashtag, amountUsd, and trackName are required' });
        }
        result = await client.processRoyaltyPayment(
          data.cashtag,
          parseFloat(data.amountUsd),
          data.trackName
        );
        res.status(200).json({
          success: true,
          payout: result.payout,
          btcAmount: result.btcAmount,
          usdAmount: result.usdAmount
        });
        break;

      case 'history':
        result = client.getPayoutHistory();
        res.status(200).json({
          success: true,
          payouts: result
        });
        break;

      case 'updateBalance':
        if (!data.cashtag || data.btcAmount === undefined) {
          return res.status(400).json({ error: 'Cashtag and btcAmount are required' });
        }
        result = client.updateWalletBalance(data.cashtag, parseFloat(data.btcAmount));
        res.status(200).json({
          success: true,
          balance: result
        });
        break;

      default:
        res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error('[CashApp API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}