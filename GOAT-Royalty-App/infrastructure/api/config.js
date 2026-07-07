/**
 * GOAT Royalty API Configuration
 * Central configuration for all backend services
 */

const API_CONFIG = {
  // Base API Configuration
  baseUrl: process.env.API_BASE_URL || 'https://api.goatroyalty.app',
  version: 'v4',
  timeout: 30000,
  
  // Stripe Configuration
  stripe: {
    publicKey: process.env.STRIPE_PUBLIC_KEY || 'pk_live_xxxxx',
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_live_xxxxx',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: 'usd',
    products: {
      merch: 'prod_merch',
      subscription: 'prod_subscription',
      nft: 'prod_nft',
      tickets: 'prod_tickets'
    }
  },
  
  // Web3 Configuration
  web3: {
    networks: {
      ethereum: {
        chainId: 1,
        rpcUrl: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY',
        explorerUrl: 'https://etherscan.io'
      },
      polygon: {
        chainId: 137,
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com'
      },
      base: {
        chainId: 8453,
        rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
        explorerUrl: 'https://basescan.org'
      }
    },
    contracts: {
      nft: process.env.NFT_CONTRACT_ADDRESS,
      token: process.env.TOKEN_CONTRACT_ADDRESS,
      marketplace: process.env.MARKETPLACE_CONTRACT_ADDRESS
    }
  },
  
  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    tables: {
      users: 'users',
      profiles: 'profiles',
      content: 'content',
      analytics: 'analytics',
      orders: 'orders',
      subscriptions: 'subscriptions',
      nfts: 'nfts',
      events: 'events',
      deals: 'deals'
    }
  },
  
  // Social Media APIs
  social: {
    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      redirectUri: 'https://goatroyalty.app/auth/instagram/callback'
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      bearerToken: process.env.TWITTER_BEARER_TOKEN
    },
    tiktok: {
      clientKey: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET
    },
    youtube: {
      apiKey: process.env.YOUTUBE_API_KEY,
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET
    },
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    }
  },
  
  // AI/ML Services
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-turbo',
      embeddingModel: 'text-embedding-3-small'
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-opus-20240229'
    },
    replicate: {
      apiToken: process.env.REPLICATE_API_TOKEN,
      models: {
        sora: 'stability-ai/sdxl',
        musicgen: 'meta/musicgen',
        llama: 'meta/llama-2-70b-chat'
      }
    },
    local: {
      ollamaUrl: 'http://localhost:11434',
      models: ['llama3:70b', 'mistral:7b', 'codellama:34b']
    }
  },
  
  // Streaming & Media
  media: {
    cloudflare: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      streamApiKey: process.env.CLOUDFLARE_STREAM_KEY,
      imagesApiKey: process.env.CLOUDFLARE_IMAGES_KEY
    },
    mux: {
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET
    }
  },
  
  // Analytics
  analytics: {
    mixpanel: {
      token: process.env.MIXPANEL_TOKEN
    },
    plausible: {
      domain: 'goatroyalty.app'
    },
    posthog: {
      apiKey: process.env.POSTHOG_KEY,
      host: 'https://app.posthog.com'
    }
  },
  
  // Email & Notifications
  notifications: {
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: 'noreply@goatroyalty.app'
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER
    },
    push: {
      vapidKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY
    }
  },
  
  // Storage
  storage: {
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: 'us-east-1',
      bucket: 'goat-royalty-assets'
    },
    cloudflareR2: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      accessKeyId: process.env.R2_ACCESS_KEY,
      secretAccessKey: process.env.R2_SECRET_KEY,
      bucket: 'goat-royalty-cdn'
    }
  }
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}

// Browser global
if (typeof window !== 'undefined') {
  window.GOAT_API_CONFIG = API_CONFIG;
}