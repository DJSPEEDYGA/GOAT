# GOAT Royalty App - API Documentation

## Overview

The GOAT Royalty App provides a comprehensive RESTful API for managing royalty tracking, platform integrations, and analytics. This documentation covers all available endpoints, authentication methods, and usage examples.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints require authentication using NextAuth.js session cookies or bearer tokens.

### Session Authentication
```javascript
// Automatic with browser sessions
const response = await fetch('/api/dashboard/data', {
  credentials: 'include'
});
```

### Bearer Token Authentication
```javascript
const response = await fetch('/api/dashboard/data', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Rate Limiting

- Standard endpoints: 100 requests per minute
- File upload endpoints: 10 requests per minute
- Analytics endpoints: 50 requests per minute

## Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-12-01T12:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {}
  },
  "timestamp": "2024-12-01T12:00:00.000Z"
}
```

## Dashboard APIs

### Get Dashboard Data

Retrieves comprehensive dashboard analytics and metrics.

**Endpoint:** `GET /api/dashboard/data`

**Query Parameters:**
- `timeRange` (optional): `7days`, `30days`, `90days`, `1year` (default: `30days`)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 45678.90,
    "revenueChange": 12.5,
    "totalStreams": 2847563,
    "streamsChange": 8.3,
    "activeContent": 156,
    "contentChange": 15.2,
    "audienceReach": 4839274,
    "audienceChange": 22.1,
    "platformPerformance": [
      {
        "name": "TikTok",
        "contentCount": 45,
        "revenue": 12567.80,
        "views": 1245678
      }
    ],
    "revenueBreakdown": [
      {
        "category": "Streaming Royalties",
        "amount": 28456.70,
        "percentage": 62.3
      }
    ],
    "recentActivity": [
      {
        "type": "revenue",
        "title": "New royalty payment received",
        "description": "YouTube Content ID revenue for December 2024",
        "amount": 2345.67,
        "timestamp": "2024-12-15T10:30:00Z"
      }
    ],
    "topContent": [
      {
        "title": "Summer Vibes - Official Music Video",
        "platform": "TikTok",
        "views": 567890,
        "revenue": 5678.90,
        "thumbnailUrl": "https://example.com/thumbnail.jpg"
      }
    ]
  }
}
```

**Example Request:**
```javascript
const response = await fetch('/api/dashboard/data?timeRange=90days', {
  credentials: 'include'
});
const data = await response.json();
```

## TikTok Integration APIs

### Authentication

#### Check Connection Status
**Endpoint:** `GET /api/tiktok/check-connection`

**Response:**
```json
{
  "success": true,
  "connected": true,
  "profile": {
    "open_id": "1234567890",
    "display_name": "Creator Name",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

#### OAuth Callback
**Endpoint:** `POST /api/tiktok/auth`

**Request Body:**
```json
{
  "code": "authorization_code_from_tiktok",
  "state": "random_state_string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "open_id": "1234567890",
    "display_name": "Creator Name",
    "avatar_url": "https://example.com/avatar.jpg"
  },
  "expires_in": 86400
}
```

#### Disconnect Account
**Endpoint:** `POST /api/tiktok/disconnect`

**Response:**
```json
{
  "success": true,
  "message": "Successfully disconnected from TikTok"
}
```

### Content Management

#### Get User Videos
**Endpoint:** `GET /api/tiktok/videos`

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "7080213458555737986",
      "title": "Video Title",
      "video_description": "Video description",
      "duration": 15,
      "cover_image_url": "https://example.com/cover.jpg",
      "embed_link": "https://www.tiktok.com/embed/video/123",
      "share_url": "https://www.tiktok.com/@user/video/123",
      "like_count": 1000,
      "comment_count": 100,
      "share_count": 50,
      "views_count": 10000,
      "create_time": 1703011200
    }
  ],
  "analytics": {
    "totalVideos": 25,
    "totalViews": 250000,
    "totalLikes": 15000,
    "estimatedRoyalties": "125.00",
    "averageViewsPerVideo": 10000
  },
  "has_more": true,
  "cursor": 1703011200000
}
```

#### Publish Video
**Endpoint:** `POST /api/tiktok/publish`

**Request Body:**
```json
{
  "videoUrl": "https://example.com/video.mp4",
  "caption": "Video caption with #hashtag",
  "privacyLevel": "public"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video published successfully to TikTok",
  "videoId": "7080213458555737986",
  "publishTime": "2024-12-01T12:00:00.000Z"
}
```

### Royalty Tracking

#### Get Royalty Data
**Endpoint:** `GET /api/tiktok/royalties`

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_content_videos": 25,
    "eligible_videos": 20,
    "total_views": 250000,
    "total_likes": 15000,
    "total_comments": 1500,
    "total_estimated_royalty": "125.00",
    "average_engagement_rate": "6.0",
    "royalty_rate_per_view": 0.0005,
    "minimum_views_threshold": 1000
  },
  "monthly_breakdown": [
    {
      "month": "2024-11",
      "total_views": 50000,
      "total_likes": 3000,
      "total_comments": 300,
      "total_royalty": "25.00",
      "video_count": 5,
      "avg_engagement_rate": "6.0"
    }
  ],
  "top_performing_videos": [
    {
      "content_id": "123",
      "tiktok_video_id": "7080213458555737986",
      "title": "Top Performing Video",
      "views": 50000,
      "likes": 3000,
      "comments": 300,
      "estimated_royalty": "25.00",
      "engagement_rate": "6.0",
      "posted_at": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

## YouTube Integration APIs

### Authentication

#### Check Connection Status
**Endpoint:** `GET /api/youtube/check-connection`

#### OAuth Callback
**Endpoint:** `POST /api/youtube/auth`

#### Disconnect Account
**Endpoint:** `POST /api/youtube/disconnect`

### Content Management

#### Get Channel Videos
**Endpoint:** `GET /api/youtube/videos`

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "videoId123",
      "title": "Video Title",
      "description": "Video description",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "viewCount": 10000,
      "likeCount": 500,
      "commentCount": 100,
      "publishedAt": "2024-11-15T10:00:00.000Z",
      "duration": "PT5M30S"
    }
  ]
}
```

### Analytics

#### Get Channel Analytics
**Endpoint:** `GET /api/youtube/analytics`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalViews": 100000,
    "totalWatchTimeMinutes": 50000,
    "subscribersGained": 100,
    "estimatedRevenue": 250.00
  }
}
```

### Content ID and Royalties

#### Get Royalty Data
**Endpoint:** `GET /api/youtube/royalties`

**Response:**
```json
{
  "success": true,
  "contentIdMatches": 15,
  "monthlyRevenue": "250.00",
  "recentClaims": [
    {
      "videoTitle": "Claimed Video",
      "views": 5000,
      "revenue": "12.50"
    }
  ]
}
```

## Instagram Integration APIs

### Authentication

#### Check Connection Status
**Endpoint:** `GET /api/instagram/check-connection`

#### OAuth Callback
**Endpoint:** `POST /api/instagram/auth`

#### Disconnect Account
**Endpoint:** `POST /api/instagram/disconnect`

### Content Management

#### Get User Posts
**Endpoint:** `GET /api/instagram/posts`

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post123",
      "caption": "Post caption",
      "mediaUrl": "https://example.com/image.jpg",
      "likeCount": 1000,
      "commentCount": 50,
      "shareCount": 25,
      "timestamp": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

### Analytics

#### Get Account Analytics
**Endpoint:** `GET /api/instagram/analytics`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "followers": 10000,
    "following": 500,
    "posts": 150,
    "engagementRate": 5.5
  }
}
```

### Branded Content

#### Get Royalty Data
**Endpoint:** `GET /api/instagram/royalties`

**Response:**
```json
{
  "success": true,
  "brandedPosts": 10,
  "estimatedEarnings": "500.00",
  "avgPostValue": "50.00",
  "recentBrandedPosts": [
    {
      "brand": "Brand Name",
      "estimatedValue": "75.00",
      "likes": 2000,
      "engagementRate": 6.0
    }
  ]
}
```

## Spotify Integration APIs

### Authentication

#### Check Connection Status
**Endpoint:** `GET /api/spotify/check-connection`

#### OAuth Callback
**Endpoint:** `POST /api/spotify/auth`

#### Disconnect Account
**Endpoint:** `POST /api/spotify/disconnect`

### Content Management

#### Get User Tracks
**Endpoint:** `GET /api/spotify/tracks`

**Response:**
```json
{
  "success": true,
  "tracks": [
    {
      "id": "track123",
      "name": "Track Name",
      "artists": [
        {
          "id": "artist123",
          "name": "Artist Name"
        }
      ],
      "album": {
        "id": "album123",
        "name": "Album Name",
        "images": [
          {
            "url": "https://example.com/album.jpg"
          }
        ]
      },
      "duration": 180000,
      "popularity": 85,
      "streamCount": 50000
    }
  ]
}
```

### Playlists

#### Get User Playlists
**Endpoint:** `GET /api/spotify/playlists`

**Response:**
```json
{
  "success": true,
  "playlists": [
    {
      "id": "playlist123",
      "name": "Playlist Name",
      "description": "Playlist description",
      "public": true,
      "followers": {
        "total": 1000
      },
      "tracks": {
        "total": 50
      }
    }
  ]
}
```

### Analytics and Royalties

#### Get Streaming Analytics
**Endpoint:** `GET /api/spotify/analytics`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalStreams": 500000,
    "monthlyListeners": 25000,
    "streamsByCountry": {
      "US": 200000,
      "UK": 100000,
      "DE": 50000
    }
  }
}
```

#### Get Royalty Data
**Endpoint:** `GET /api/spotify/royalties`

**Response:**
```json
{
  "success": true,
  "streamingRevenue": "1500.00",
  "mechanicalRoyalties": "300.00",
  "performanceRoyalties": "200.00",
  "monthlyBreakdown": [
    {
      "month": "2024-11",
      "revenue": "200.00",
      "streams": 10000,
      "listeners": 5000
    }
  ]
}
```

## Adobe Creative Cloud APIs

### Authentication

#### Check Connection Status
**Endpoint:** `GET /api/adobe/check-connection`

#### OAuth Callback
**Endpoint:** `POST /api/adobe/auth`

#### Disconnect Account
**Endpoint:** `POST /api/adobe/disconnect`

### Project Management

#### Get User Projects
**Endpoint:** `GET /api/adobe/projects`

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": "project123",
      "name": "Project Name",
      "type": "premiere-pro",
      "modifiedDate": "2024-11-15T10:00:00.000Z",
      "duration": 300,
      "assetCount": 15
    }
  ],
  "activeProjects": [
    {
      "id": "active123",
      "name": "Active Project",
      "type": "after-effects"
    }
  ]
}
```

### Analytics

#### Get Usage Analytics
**Endpoint:** `GET /api/adobe/analytics`

**Response:**
```json
{
  "success": true,
  "toolUsage": [
    {
      "tool": "premiere-pro",
      "projectCount": 10,
      "totalHours": 50,
      "estimatedRoyalties": "75.00"
    }
  ]
}
```

### Royalties

#### Get Creative Royalties
**Endpoint:** `GET /api/adobe/royalties`

**Response:**
```json
{
  "success": true,
  "byTool": [
    {
      "tool": "premiere-pro",
      "totalRoyalties": "75.00",
      "projectCount": 10,
      "totalHours": 50,
      "avgPerProject": "7.50"
    }
  ]
}
```

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | User not authenticated | 401 |
| `PERMISSION_DENIED` | Insufficient permissions | 403 |
| `RESOURCE_NOT_FOUND` | Resource does not exist | 404 |
| `VALIDATION_ERROR` | Invalid request parameters | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `PLATFORM_ERROR` | Platform-specific error | 502 |
| `INTERNAL_ERROR` | Internal server error | 500 |

## SDK and Client Libraries

### JavaScript/TypeScript
```bash
npm install @goat-royalty/sdk
```

```javascript
import { GOATRoyaltyAPI } from '@goat-royalty/sdk';

const api = new GOATRoyaltyAPI({
  baseURL: 'https://your-domain.com/api',
  token: 'your-auth-token'
});

const dashboard = await api.getDashboardData({ timeRange: '30days' });
const tikTokVideos = await api.getTikTokVideos();
```

### Python
```bash
pip install goat-royalty-python
```

```python
from goat_royalty import GOATRoyaltyAPI

api = GOATRoyaltyAPI(
    base_url='https://your-domain.com/api',
    token='your-auth-token'
)

dashboard = api.get_dashboard_data(time_range='30days')
tiktok_videos = api.get_tiktok_videos()
```

## Webhooks

### Configure Webhooks
Send POST requests to your webhook URL with event data.

#### Webhook Events
- `user.connected` - User connected a platform
- `content.published` - New content published
- `royalty.calculated` - Royalties calculated
- `payment.received` - Payment received

#### Webhook Payload
```json
{
  "event": "content.published",
  "data": {
    "platform": "tiktok",
    "contentId": "123",
    "userId": "456"
  },
  "timestamp": "2024-12-01T12:00:00.000Z",
  "signature": "webhook-signature"
}
```

## Testing

### Test Environment
- URL: `https://test-api.goat-royalty.com`
- Use test API keys for development
- Rate limits: 1000 requests per hour

### Mock Data
Use the `/mock` endpoints for testing without real platform connections:

```javascript
// Get mock dashboard data
const response = await fetch('/api/dashboard/data?mock=true');
```

## Support

- Documentation: https://docs.goat-royalty.com
- Support Email: support@goat-royalty.com
- Status Page: https://status.goat-royalty.com
- GitHub Issues: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2/issues

## Changelog

### v1.0.0 (2024-12-01)
- Initial API release
- TikTok, YouTube, Instagram, Spotify, Adobe integrations
- Dashboard analytics
- Royalty tracking

### v1.1.0 (Planned)
- Advanced analytics endpoints
- Bulk operations
- Enhanced webhook system
- Performance optimizations