import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // Fetch user's videos from TikTok
    const videosResponse = await fetch('https://open.tiktokapis.com/v2/video/list/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_count: 20,
        fields: 'id,title,video_description,duration,cover_image_url,embed_link,share_url,like_count,comment_count,share_count,play_count,create_time',
      }),
    });

    const videosData = await videosResponse.json();

    if (videosData.error) {
      return res.status(400).json({ error: videosData.error.message });
    }

    // Store or update videos in local database
    if (videosData.data?.videos) {
      const videosToUpsert = videosData.data.videos.map(video => ({
        user_id: user.id,
        tiktok_video_id: video.id,
        title: video.title || '',
        description: video.video_description || '',
        video_url: video.share_url || '',
        thumbnail_url: video.cover_image_url || '',
        embed_url: video.embed_link || '',
        likes_count: video.like_count || 0,
        comments_count: video.comment_count || 0,
        shares_count: video.share_count || 0,
        views_count: video.play_count || 0,
        duration: video.duration || 0,
        posted_at: new Date(video.create_time * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from('tiktok_content')
        .upsert(videosToUpsert, { 
          onConflict: 'tiktok_video_id,user_id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Error storing videos:', upsertError);
      }
    }

    // Calculate analytics
    const totalVideos = videosData.data?.videos?.length || 0;
    const totalViews = videosData.data?.videos?.reduce((sum, video) => sum + (video.play_count || 0), 0) || 0;
    const totalLikes = videosData.data?.videos?.reduce((sum, video) => sum + (video.like_count || 0), 0) || 0;

    // Calculate estimated royalties (simplified calculation)
    const estimatedRoyalties = totalViews * 0.0005; // $0.0005 per view (example rate)

    res.status(200).json({
      success: true,
      videos: videosData.data?.videos || [],
      analytics: {
        totalVideos,
        totalViews,
        totalLikes,
        estimatedRoyalties: estimatedRoyalties.toFixed(2),
        averageViewsPerVideo: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0,
      },
      has_more: videosData.data?.has_more || false,
      cursor: videosData.data?.cursor || null,
    });

  } catch (error) {
    console.error('TikTok videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}