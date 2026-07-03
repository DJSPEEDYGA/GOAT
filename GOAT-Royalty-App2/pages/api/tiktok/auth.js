import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_ID,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TIKTOK_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    // Get user information
    const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (userData.error) {
      return res.status(400).json({ error: userData.error.message });
    }

    // Get Supabase client
    const supabase = createServerSupabaseClient(req, res);

    // Store TikTok connection in database
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Insert or update TikTok account connection
    const { error: dbError } = await supabase
      .from('tiktok_accounts')
      .upsert({
        user_id: user.id,
        tiktok_user_id: userData.data.user.open_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        display_name: userData.data.user.display_name,
        avatar_url: userData.data.user.avatar_url,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      return res.status(500).json({ error: 'Failed to store TikTok connection' });
    }

    res.status(200).json({
      success: true,
      user: userData.data.user,
      expires_in: tokenData.expires_in,
    });

  } catch (error) {
    console.error('TikTok auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}