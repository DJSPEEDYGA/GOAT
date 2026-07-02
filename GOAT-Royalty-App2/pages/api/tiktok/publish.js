import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoUrl, caption, privacyLevel = 'public' } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // Get Supabase client
    const supabase = createServerSupabaseClient(req, res);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user's TikTok account
    const { data: tiktokAccount, error: accountError } = await supabase
      .from('tiktok_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (accountError || !tiktokAccount) {
      return res.status(404).json({ error: 'TikTok account not connected' });
    }

    // Check if access token is expired and refresh if needed
    let accessToken = tiktokAccount.access_token;
    const expiresAt = new Date(tiktokAccount.expires_at);
    const now = new Date();

    if (now >= expiresAt) {
      // Refresh the access token
      const refreshResponse = await fetch('https://open.tiktokapis.com/v2/oauth/refresh_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_ID,
          client_secret: process.env.TIKTOK_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: tiktokAccount.refresh_token,
        }),
      });

      const refreshData = await refreshResponse.json();

      if (refreshData.error) {
        return res.status(400).json({ error: 'Failed to refresh access token' });
      }

      accessToken = refreshData.access_token;

      // Update the database with new tokens
      await supabase
        .from('tiktok_accounts')
        .update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token,
          expires_at: new Date(Date.now() + (refreshData.expires_in * 1000)).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', tiktokAccount.id);
    }

    // Prepare TikTok content publish request
    const publishData = {
      video_url: videoUrl,
      caption: caption || '',
      privacy_level: privacyLevel,
    };

    // Add hashtag if provided
    if (caption && caption.includes('#GOATRoyalty')) {
      // The hashtag is already in the caption
    }

    // Publish video to TikTok
    const publishResponse = await fetch('https://open.tiktokapis.com/v2/video/publish/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(publishData),
    });

    const publishDataResponse = await publishResponse.json();

    if (publishDataResponse.error) {
      return res.status(400).json({ 
        error: publishDataResponse.error.message || 'Failed to publish video to TikTok' 
      });
    }

    // Store the published content reference
    const { error: contentError } = await supabase
      .from('tiktok_content')
      .insert({
        user_id: user.id,
        tiktok_video_id: publishDataResponse.data?.video_id || null,
        title: caption || 'Published from GOAT Royalty App',
        description: caption || '',
        video_url: videoUrl,
        thumbnail_url: '', // Will be populated when video info is available
        posted_at: new Date().toISOString(),
        source: 'goat_royalty_app',
        status: 'published',
      });

    if (contentError) {
      console.error('Error storing published content:', contentError);
    }

    res.status(200).json({
      success: true,
      message: 'Video published successfully to TikTok',
      videoId: publishDataResponse.data?.video_id,
      publishTime: new Date().toISOString(),
    });

  } catch (error) {
    console.error('TikTok publish error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}