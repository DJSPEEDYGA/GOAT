/**
 * GOAT Force — Build All Agent Apps
 * Builds separate macOS .app for each agent using electron-builder
 */
const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const BUILD_DIR  = path.join(__dirname, 'dist');
const ICONS_DIR  = path.join(__dirname, 'icons');
const WEB_APP    = '/Users/be100radio/GOAT-Royalty-App/web-app';

// ── Agent definitions ────────────────────────────────────────
const APPS = [
  {
    id: 'index',
    name: 'GOAT Royalty App',
    appId: 'com.goatforce.royalty-app',
    icon: 'goat-royalty',
    category: 'public.app-category.music',
  },
  {
    id: 'the-goat',
    name: 'THE GOAT',
    appId: 'com.goatforce.the-goat',
    icon: 'the-goat',
    category: 'public.app-category.business',
  },
  {
    id: 'moneypenny',
    name: 'Ms. Money Penny',
    appId: 'com.goatforce.moneypenny',
    icon: 'moneypenny',
    category: 'public.app-category.business',
  },
  {
    id: 'dr-devin',
    name: 'Dr. Devin',
    appId: 'com.goatforce.dr-devin',
    icon: 'dr-devin',
    category: 'public.app-category.developer-tools',
  },
  {
    id: 'master-oscar',
    name: 'Master Oscar',
    appId: 'com.goatforce.master-oscar',
    icon: 'master-oscar',
    category: 'public.app-category.business',
  },
  {
    id: 'nexus',
    name: 'Nexus',
    appId: 'com.goatforce.nexus',
    icon: 'nexus',
    category: 'public.app-category.business',
  },
  {
    id: 'lexi',
    name: 'Lexi',
    appId: 'com.goatforce.lexi',
    icon: 'lexi',
    category: 'public.app-category.music',
  },
  {
    id: 'sir-codex',
    name: 'Sir Codex',
    appId: 'com.goatforce.sir-codex',
    icon: 'sir-codex',
    category: 'public.app-category.developer-tools',
  },
];

// Which apps to build (from CLI arg or all)
const target = process.argv[2];
const toBuild = target ? APPS.filter(a => a.id === target) : APPS;

if (toBuild.length === 0) {
  console.error(`Unknown target: ${target}. Options: ${APPS.map(a => a.id).join(', ')}`);
  process.exit(1);
}

// ── Icon helper ───────────────────────────────────────────────
function getIconPath(iconName) {
  // Try specific icon first, fall back to goat-royalty
  const candidates = [
    path.join(ICONS_DIR, `${iconName}.icns`),
    path.join(ICONS_DIR, 'goat-royalty.icns'),
    path.join(WEB_APP, 'img', 'goat-hero-icon.png'), // fallback png
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

// ── Build each app ────────────────────────────────────────────
(async () => {
  fs.mkdirSync(BUILD_DIR, { recursive: true });

  for (const appDef of toBuild) {
    console.log(`\n🔨 Building: ${appDef.name}...`);

    const iconPath = getIconPath(appDef.icon);
    const outDir   = path.join(BUILD_DIR, appDef.id);

    const ebConfig = {
      appId:       appDef.appId,
      productName: appDef.name,
      copyright:   'Copyright © 2025 Harvey Miller (DJ Speedy) — GOAT Force Records',
      directories: {
        output:         outDir,
        buildResources: path.join(__dirname, 'build-resources'),
      },
      files: [
        'main.js',
        'package.json',
      ],
      extraMetadata: {
        main: 'main.js',
      },
      mac: {
        target:   [{ target: 'dir', arch: ['arm64', 'x64'] }],
        category: appDef.category,
        icon:     iconPath || undefined,
      },
      // Inject the GOAT_APP_TARGET so main.js knows which agent it is
      extraResources: [],
      afterSign: null,
    };

    // Write temp electron-builder config
    const cfgPath = path.join(__dirname, `.eb-${appDef.id}.json`);
    fs.writeFileSync(cfgPath, JSON.stringify(ebConfig, null, 2));

    // Set env and run electron-builder
    const env = {
      ...process.env,
      GOAT_APP_TARGET: appDef.id,
    };

    // We need to embed GOAT_APP_TARGET into the packaged app
    // Write a wrapper main that sets env then requires main.js
    const wrapperPath = path.join(__dirname, `launcher-${appDef.id}.js`);
    fs.writeFileSync(wrapperPath, `process.env.GOAT_APP_TARGET = '${appDef.id}';\nrequire('./main.js');\n`);

    // Update the config to use the wrapper as main
    ebConfig.files = [`launcher-${appDef.id}.js`, 'main.js', 'package.json'];
    ebConfig.extraMetadata = { main: `launcher-${appDef.id}.js` };
    fs.writeFileSync(cfgPath, JSON.stringify(ebConfig, null, 2));

    const result = spawnSync(
      path.join(__dirname, 'node_modules', '.bin', 'electron-builder'),
      ['--config', cfgPath, '--mac', '--dir'],
      { env, cwd: __dirname, stdio: 'inherit' }
    );

    if (result.status === 0) {
      // Find the built .app
      const appPath = fs.readdirSync(outDir + '/mac-arm64')
        .find(f => f.endsWith('.app'));
      const fullPath = path.join(outDir, 'mac-arm64', appPath || '');

      if (appPath && fs.existsSync(fullPath)) {
        const dest = `/Applications/${appDef.name}.app`;
        console.log(`✅ Built: ${fullPath}`);
        console.log(`📦 Installing to: ${dest}`);
        try {
          execSync(`rm -rf "${dest}"`, { stdio: 'inherit' });
          execSync(`cp -R "${fullPath}" "${dest}"`, { stdio: 'inherit' });
          execSync(`touch "${dest}"`, { stdio: 'inherit' });
          console.log(`🐐 ${appDef.name} installed!`);
        } catch(e) {
          console.error(`Install failed: ${e.message}`);
        }
      }
    } else {
      console.error(`❌ Build failed for ${appDef.name}`);
    }

    // Cleanup
    fs.unlinkSync(cfgPath);
    fs.unlinkSync(wrapperPath);
  }

  console.log('\n🐐 ALL GOAT FORCE APPS BUILT AND INSTALLED\n');
})();
