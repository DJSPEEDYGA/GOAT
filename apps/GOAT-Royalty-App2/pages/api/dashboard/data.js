export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeRange = '30days' } = req.query;

    // Mock data - in a real implementation, this would come from your database
    const mockData = {
      totalRevenue: 45678.90,
      revenueChange: 12.5,
      totalStreams: 2847563,
      streamsChange: 8.3,
      activeContent: 156,
      contentChange: 15.2,
      audienceReach: 4839274,
      audienceChange: 22.1,
      platformPerformance: [
        {
          name: 'TikTok',
          icon: <Video className="w-5 h-5 text-black" />,
          contentCount: 45,
          revenue: 12567.80,
          views: 1245678
        },
        {
          name: 'YouTube',
          icon: <Play className="w-5 h-5 text-red-600" />,
          contentCount: 38,
          revenue: 18934.20,
          views: 892456
        },
        {
          name: 'Instagram',
          icon: <Camera className="w-5 h-5 text-pink-600" />,
          contentCount: 32,
          revenue: 8923.40,
          views: 567234
        },
        {
          name: 'Spotify',
          icon: <Music className="w-5 h-5 text-green-600" />,
          contentCount: 28,
          revenue: 5253.50,
          views: 142195
        }
      ],
      revenueBreakdown: [
        {
          category: 'Streaming Royalties',
          amount: 28456.70,
          percentage: 62.3
        },
        {
          category: 'Content ID',
          amount: 8923.40,
          percentage: 19.5
        },
        {
          category: 'Branded Content',
          amount: 5678.90,
          percentage: 12.4
        },
        {
          category: 'Other Sources',
          amount: 2619.90,
          percentage: 5.8
        }
      ],
      recentActivity: [
        {
          type: 'revenue',
          title: 'New royalty payment received',
          description: 'YouTube Content ID revenue for December 2024',
          amount: 2345.67,
          timestamp: '2024-12-15T10:30:00Z'
        },
        {
          type: 'content',
          title: 'New video uploaded to TikTok',
          description: 'Summer Vibes - Official Music Video',
          amount: null,
          timestamp: '2024-12-14T15:45:00Z'
        },
        {
          type: 'alert',
          title: 'Content usage spike detected',
          description: '150% increase in streams for "Midnight Dreams"',
          amount: null,
          timestamp: '2024-12-13T09:15:00Z'
        },
        {
          type: 'revenue',
          title: 'Monthly Spotify payment',
          description: 'Streaming royalties for November 2024',
          amount: 1234.56,
          timestamp: '2024-12-12T14:20:00Z'
        }
      ],
      topContent: [
        {
          title: 'Summer Vibes - Official Music Video',
          platform: 'TikTok',
          views: 567890,
          revenue: 5678.90,
          thumbnailUrl: 'https://picsum.photos/seed/tiktok1/400/300.jpg'
        },
        {
          title: 'Midnight Dreams - Acoustic Version',
          platform: 'YouTube',
          views: 234567,
          revenue: 2345.67,
          thumbnailUrl: 'https://picsum.photos/seed/youtube1/400/300.jpg'
        },
        {
          title: 'City Lights - Instagram Reel',
          platform: 'Instagram',
          views: 123456,
          revenue: 1234.56,
          thumbnailUrl: 'https://picsum.photos/seed/instagram1/400/300.jpg'
        },
        {
          title: 'Electric Feel - Spotify Track',
          platform: 'Spotify',
          views: 89012,
          revenue: 890.12,
          thumbnailUrl: 'https://picsum.photos/seed/spotify1/400/300.jpg'
        },
        {
          title: 'Dance Floor - TikTok Challenge',
          platform: 'TikTok',
          views: 67890,
          revenue: 678.90,
          thumbnailUrl: 'https://picsum.photos/seed/tiktok2/400/300.jpg'
        },
        {
          title: 'Golden Hour - YouTube Cover',
          platform: 'YouTube',
          views: 45678,
          revenue: 456.78,
          thumbnailUrl: 'https://picsum.photos/seed/youtube2/400/300.jpg'
        }
      ]
    };

    res.status(200).json(mockData);

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}