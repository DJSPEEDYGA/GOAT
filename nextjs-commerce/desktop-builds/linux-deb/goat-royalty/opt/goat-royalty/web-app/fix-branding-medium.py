#!/usr/bin/env python3
"""
GOAT Branding Fixer - Medium Priority Pages
"""

import os
import re

# GOAT branding navigation template
GOAT_NAV_TEMPLATE = '''
<!-- Backgrounds -->
<div class="goat-bg"></div>
<div class="goat-bg-overlay"></div>

<!-- Navigation -->
<nav class="top-nav">
  <a href="index.html" class="logo">
    <img src="money-penny-logo.png" alt="Money Penny" class="nav-logo-mp">
    <img src="goat-logo.png" alt="GOAT" class="nav-logo-goat">
    <img src="logo.png" alt="Ms Money Penny">
    <span>Ms Money Penny</span>
    <span class="crown-badge">👑 GOAT</span>
  </a>
  <button class="hamburger" onclick="document.getElementById('navLinks').classList.toggle('open')" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
  <div class="nav-links" id="navLinks">
    <a href="index.html">🏠 Home</a>
    <a href="about.html">👑 About</a>
    <a href="contact.html">📧 Contact</a>
    <a href="crypto-mining.html">⛏️ Crypto Mining</a>
    <a href="models.html">🤖 AI Models</a>
    <a href="videos.html">🎬 Videos</a>
    <a href="shop.html">🛍️ Shop</a>
    <a href="studio.html">🎹 Studio DAW</a>
    <a href="beat-maker.html">🎵 Beat Maker</a>
    <a href="plugins.html">🔌 Plugins</a>
    <a href="downloads.html">📥 Downloads</a>
    <a href="tools.html">🛠️ Tools</a>
  </div>
</nav>
'''

# CSS links to add
GOAT_CSS = '''
<link rel="stylesheet" href="css/goat-theme.css">
<link rel="stylesheet" href="css/goat-brand.css">
'''

# Hamburger menu JS
HAMBURGER_JS = '''
<script>
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('open');
}
</script>
'''

def fix_page(filename):
    """Add GOAT branding to a single HTML page"""
    try:
        with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Skip if already has GOAT branding
        if 'money-penny-logo' in content and 'goat-logo' in content:
            print(f"✅ {filename} - Already has GOAT branding")
            return False
        
        # Add CSS if not present
        if 'css/goat-theme.css' not in content:
            # Find where to add CSS (after existing links or in head)
            if '</head>' in content:
                # Check if ninja-daytona-script exists
                if 'ninja-daytona-script' in content:
                    # Add CSS before the script
                    content = content.replace(
                        '<script src="https://sites.super.myninja.ai/_assets/ninja-daytona-script.js"></script>',
                        GOAT_CSS.strip() + '\n<script src="https://sites.super.myninja.ai/_assets/ninja-daytona-script.js"></script>'
                    )
                else:
                    # Add CSS before closing head
                    content = content.replace('</head>', GOAT_CSS + '</head>')
        
        # Add navigation after body tag
        if '<body' in content:
            # Find the body tag
            body_match = re.search(r'<body[^>]*>', content)
            if body_match:
                body_end = body_match.end()
                # Insert navigation after body tag
                content = content[:body_end] + GOAT_NAV_TEMPLATE + content[body_end:]
        
        # Add hamburger JS if not present
        if 'toggleMenu' not in content and 'function toggleMenu()' not in content:
            content = content.replace('</body>', HAMBURGER_JS + '</body>')
        
        # Write back
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ {filename} - GOAT branding added")
        return True
        
    except Exception as e:
        print(f"❌ {filename} - Error: {e}")
        return False

# Medium priority pages to fix
MEDIUM_PRIORITY_PAGES = [
    'ai-models-download.html',
    'unreal-copilot.html',
    'audio-fingerprinting.html',
    'royalty-calc.html',
    'api-vault.html',
    'api-download.html',
    'agents-brain.html',
    'intel.html',
    'network.html',
    'command-center.html',
    'autopilot.html',
    'the-architect-protocol.html',
    'ms-vanessa-bg-checks.html',
    'goat-royalty/index.html',
    'goat-autotune.html',
    'goat-channel-strip.html',
    'goath-installer-dashboard.html',
    'goath-mpc.html',
    'goath-plugin-rack.html',
    'goat-sampler.html',
    'goath-sound-library.html',
    'goat-crew-hub.html',
    'touch-hub.html',
    'touch-keys.html',
    'touch-mixer.html',
    'touch-pads.html',
    'touch-transport.html',
    'touch-xy.html',
    'touch-brain.html',
    'touch-deck.html',
    'moneypenny.html',
    'dating.html',
    'deploy-local.html',
]

if __name__ == '__main__':
    os.chdir('/workspace/nextjs-commerce/web-app')
    
    print("=" * 60)
    print("GOAT BRANDING FIXER - MEDIUM PRIORITY")
    print("=" * 60)
    print()
    
    fixed_count = 0
    skipped_count = 0
    
    for page in MEDIUM_PRIORITY_PAGES:
        if os.path.exists(page):
            if fix_page(page):
                fixed_count += 1
            else:
                skipped_count += 1
        else:
            print(f"⚠️  {page} - File not found")
    
    print()
    print("=" * 60)
    print(f"Fixed: {fixed_count} pages")
    print(f"Skipped: {skipped_count} pages")
    print("=" * 60)