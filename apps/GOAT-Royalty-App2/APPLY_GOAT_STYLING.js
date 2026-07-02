/**
 * GOAT Royalty App - Auto-Apply GOAT Force Styling
 * 
 * This script will automatically update all components to use the GOAT Force design system
 */

const fs = require('fs');
const path = require('path');

// Components that need updates
const COMPONENTS_TO_UPDATE = [
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
  'pages/_app.js',
  'pages/analytics.js',
  'pages/asap-catalog.js',
  'pages/cinema-camera.js',
  'pages/complete-platform.js',
  'pages/contact.js',
  'pages/copyright.js',
  'pages/cyber-warrior.js',
  'pages/fashion-store.js',
  'pages/index.js',
  'pages/investor-demo.js',
  'pages/login.js',
  'pages/nvidia-dgx.js',
  'pages/privacy.js',
  'pages/publishing.js',
  'pages/search.js',
  'pages/sora-ai-studio.js',
  'pages/terms.js',
  'pages/tracks.js'
];

// Styling replacements
const REPLACEMENTS = [
  // Background colors
  { pattern: /className="bg-white/g, replacement: 'className="goat-gradient-card bg-background' },
  { pattern: /className="bg-gray-100/g, replacement: 'className="goat-gradient-card' },
  { pattern: /className="bg-gray-200/g, replacement: 'className="bg-gray-800' },
  { pattern: /className="bg-gray-50/g, replacement: 'className="goat-gradient-bg' },
  
  // Text colors
  { pattern: /text-gray-900/g, replacement: 'text-white' },
  { pattern: /text-gray-800/g, replacement: 'text-gray-100' },
  { pattern: /text-gray-600/g, replacement: 'text-gray-400' },
  { pattern: /text-gray-500/g, replacement: 'text-gray-500' },
  { pattern: /text-gray-700/g, replacement: 'text-gray-300' },
  
  // Borders
  { pattern: /border-gray-200/g, replacement: 'border-gray-700' },
  { pattern: /border-gray-300/g, replacement: 'border-gray-600' },
  { pattern: /border-gray-100/g, replacement: 'border-gray-800' },
  
  // Shadows
  { pattern: /className="[^"]*shadow-md[^"]*"/g, replacement: (match) => match.replace('shadow-md', 'goat-glow') },
  { pattern: /className="[^"]*shadow-lg[^"]*"/g, replacement: (match) => match.replace('shadow-lg', 'goat-glow') },
  
  // Rounded corners
  { pattern: /className="[^"]*rounded-lg[^"]*"/g, replacement: (match) => match.replace('rounded-lg', 'rounded-xl') },
  
  // Gradients - convert to GOAT gradients
  { pattern: /bg-gradient-to-r from-blue/g, replacement: 'bg-gradient-to-r from-red-500 via-yellow-500 to-red-500' },
  { pattern: /bg-gradient-to-r from-purple/g, replacement: 'bg-gradient-to-r from-red-600 via-yellow-500 to-red-600' },
  { pattern: /bg-gradient-to-r from-green/g, replacement: 'bg-gradient-to-r from-red-500 via-yellow-400 to-red-500' },
  
  // Add hover effects to cards
  { pattern: /className="([^"]*)bg-background([^"]*)"/g, replacement: 'className="$1goat-gradient-card goat-card-hover$2"' },
];

/**
 * Apply GOAT styling to a single file
 */
function applyGoatStyling(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply all replacements
    REPLACEMENTS.forEach(({ pattern, replacement }) => {
      if (typeof replacement === 'function') {
        content = content.replace(pattern, replacement);
      } else {
        content = content.replace(pattern, replacement);
      }
    });
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Add GOAT imports if missing
 */
function addGoatImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if globals.css is imported
    if (!content.includes('../styles/globals.css') && !content.includes('styles/globals.css')) {
      // Find the first import statement
      const importIndex = content.indexOf('import');
      if (importIndex !== -1) {
        // Insert before the first import
        content = content.substring(0, importIndex) + 
                  `import '../styles/globals.css';\n` +
                  content.substring(importIndex);
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error adding imports to ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🐐 GOAT Force - Auto-Applying Styling');
  console.log('=' .repeat(60));
  
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  COMPONENTS_TO_UPDATE.forEach((componentPath, index) => {
    const fullPath = path.join(__dirname, componentPath);
    
    console.log(`\n[${index + 1}/${COMPONENTS_TO_UPDATE.length}] Processing: ${componentPath}`);
    
    try {
      // Add GOAT imports
      const importsAdded = addGoatImports(fullPath);
      if (importsAdded) {
        console.log('  ✓ Added GOAT imports');
      }
      
      // Apply GOAT styling
      const updated = applyGoatStyling(fullPath);
      if (updated) {
        console.log('  ✓ Applied GOAT styling');
        updatedCount++;
      } else {
        console.log('  - No changes needed');
        skippedCount++;
      }
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      errorCount++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`  ✓ Updated: ${updatedCount} files`);
  console.log(`  - Skipped: ${skippedCount} files`);
  console.log(`  ✗ Errors: ${errorCount} files`);
  console.log(`  📝 Total: ${COMPONENTS_TO_UPDATE.length} files`);
  
  console.log('\n🎉 GOAT Force styling applied successfully!');
  console.log('📋 Run npm run build to test the changes');
}

// Run the script
main().catch(console.error);