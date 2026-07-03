/**
 * Remove globals.css imports from individual pages
 * Only keep it in _app.js
 */

const fs = require('fs');
const path = require('path');

// Files that need global CSS removed (excluding _app.js)
const FILES_TO_FIX = [
  'components/AdobeIntegration.js',
  'components/AgentCodex008.js',
  'components/AnimatedHero.js',
  'components/AudioVisualizer.js',
  'components/CinemaCamera.js',
  'components/CodexEngine.js',
  'components/CodexEnginePanel.js',
  'components/CyberWarriorAgent.js',
  'components/DashboardWithRealData.js',
  'components/DocumentLibrary.js',
  'components/EnhancedDashboard.js',
  'components/EnhancedGOATRoyaltyApp.js',
  'components/EnhancedSpotifyIntegration.js',
  'components/EnhancedVideoBackground.js',
  'components/FingerprintAuth.js',
  'components/GOATRoyaltyAppEnhanced.js',
  'components/GeminiAICopilot.js',
  'components/GeminiAIPanel.js',
  'components/GoatBranding.js',
  'components/IPProtectionVault.js',
  'components/InstagramIntegration.js',
  'components/IntegrationsHub.js',
  'components/InteractiveFeatures.js',
  'components/InvestorAnalyticsDashboard.js',
  'components/LoadingScreen.js',
  'components/LogicProIntegration.js',
  'components/MainNavigation.js',
  'components/MediaGallery.js',
  'components/MoneypennyAI.js',
  'components/MsVanessaAI.js',
  'components/MusicPlayer.js',
  'components/MusicProductionMarketplace.js',
  'components/MusicStudio.js',
  'components/MusicStudioWithRealData.js',
  'components/NVIDIADGXCloudIntegration.js',
  'components/NativeInstrumentsHub.js',
  'components/OpenClawStudio.js',
  'components/PaymentProcessingHub.js',
  'components/ProductionDeploy.js',
  'components/ProtectedRoute.js',
  'components/RealDataDashboard.js',
  'components/SearchInput.js',
  'components/SecuritySandboxPanel.js',
  'components/SendMeP2PNetwork.js',
  'components/Sora2AIStudio.js',
  'components/SpotifyIntegration.js',
  'components/StreamingIntegration.js',
  'components/StreamingPlatformsHub.js',
  'components/SuperGOATMusicPlayer.js',
  'components/SuperGOATRoyaltyEngine.js',
  'components/SuperNinjaAI.js',
  'components/SuperNinjaPanel.js',
  'components/SuperheroArtwork.js',
  'components/TextToSpeechStudio.js',
  'components/TikTokIntegration.js',
  'components/TrackingDashboard.js',
  'components/UpStaxxTaxEngine.js',
  'components/VideoBackground.js',
  'components/VoiceStudio.js',
  'components/YouTubeIntegration.js',
  'components/ui/Alert.js',
  'components/ui/Button.js',
  'components/ui/Card.js',
  'components/ui/Input.js',
  'components/ui/badge.js',
  'components/ui/button.js',
  'components/ui/card.js',
  'components/ui/input.js',
  'components/ui/tabs.js',
  'pages/analytics.js',
  'pages/asap-catalog.js',
  'pages/cinema-camera.js',
  'pages/contact.js',
  'pages/copyright.js',
  'pages/cyber-warrior.js',
  'pages/fashion-store.js',
  'pages/index.js',
  'pages/login.js',
  'pages/nvidia-dgx.js',
  'pages/privacy.js',
  'pages/publishing.js',
  'pages/search.js',
  'pages/sora-ai-studio.js',
  'pages/terms.js',
  'pages/tracks.js'
];

function removeGlobalCSSImports(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove globals.css imports
    content = content.replace(/import\s+['"].*styles\/globals\.css['"];?\s*\n?/g, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

let fixedCount = 0;

FILES_TO_FIX.forEach((file, index) => {
  const fullPath = path.join(__dirname, file);
  const fixed = removeGlobalCSSImports(fullPath);
  if (fixed) {
    console.log(`✓ Fixed: ${file}`);
    fixedCount++;
  }
});

console.log(`\n✅ Removed global CSS imports from ${fixedCount} files`);