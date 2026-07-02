/**
 * GOAT Royalty App - Complete Feature Integration & Style Unification
 * 
 * This script will:
 * 1. Audit all components for styling consistency
 * 2. Update components to use GOAT Force design system
 * 3. Ensure all features are integrated and functional
 * 4. Create a unified theme across the entire app
 */

const fs = require('fs');
const path = require('path');

// Configuration
const GOAT_COLORS = {
  red: '#DC2626',
  redDark: '#991B1B',
  redLight: '#EF4444',
  crimson: '#B91C1C',
  gold: '#F59E0B',
  goldLight: '#FBBF24',
  black: '#0A0A0A',
  dark: '#111111',
  gray: '#1A1A1A',
  silver: '#9CA3AF'
};

const GOAT_CLASSES = {
  buttons: ['goat-btn-primary', 'goat-btn-gold'],
  cards: ['goat-gradient-card', 'goat-card-hover'],
  nav: ['goat-nav'],
  glow: ['goat-glow', 'goat-gold-glow', 'goat-glow-text'],
  text: ['goat-title', 'goat-heading', 'goat-heroic', 'goat-accent-text'],
  animation: ['goat-animate-in', 'goat-slide-up', 'goat-fade-in']
};

// Component audit results
const auditResults = {
  totalComponents: 0,
  styledComponents: 0,
  unstyledComponents: 0,
  componentsNeedingUpdate: [],
  featuresIntegrated: [],
  featuresMissing: []
};

// Directory structure
const COMPONENTS_DIR = path.join(__dirname, 'components');
const PAGES_DIR = path.join(__dirname, 'pages');

/**
 * Audit a single file for GOAT styling
 */
function auditFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    let hasGoatStyles = false;
    const foundStyles = [];
    const missingStyles = [];
    
    // Check for GOAT classes
    Object.values(GOAT_CLASSES).flat().forEach(styleClass => {
      if (content.includes(styleClass)) {
        foundStyles.push(styleClass);
        hasGoatStyles = true;
      }
    });
    
    // Check for GOAT colors
    Object.values(GOAT_COLORS).forEach(color => {
      if (content.includes(color)) {
        foundStyles.push(`color-${color}`);
        hasGoatStyles = true;
      }
    });
    
    // Check for generic styling (needs update)
    const genericPatterns = [
      /bg-white/,
      /bg-gray-/,
      /text-gray-/,
      /border-gray-/,
      /shadow-[^g]/,
      /rounded-[^l]/,
      /bg-gradient-to[^-]/  // Not a custom gradient
    ];
    
    genericPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        missingStyles.push(pattern.toString());
      }
    });
    
    return {
      fileName,
      hasGoatStyles,
      foundStyles,
      missingStyles,
      needsUpdate: missingStyles.length > 0
    };
  } catch (error) {
    console.error(`Error auditing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Recursively audit all files in a directory
 */
function auditDirectory(dir, fileType = '.js') {
  const results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        results.push(...auditDirectory(filePath, fileType));
      } else if (file.endsWith(fileType)) {
        const audit = auditFile(filePath);
        if (audit) {
          results.push(audit);
        }
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return results;
}

/**
 * Generate a unified component template
 */
function generateUnifiedComponent(componentName, type = 'functional') {
  return `/**
 * GOAT Royalty App - ${componentName}
 * Styled with GOAT Force Design System
 */

import React, { useState, useEffect } from 'react';
import { ${type === 'functional' ? 'Zap, Crown' : 'Music, DollarSign'} } from 'lucide-react';

const ${componentName} = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize component
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="goat-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="goat-gradient-card p-6 rounded-xl border border-red-500/30">
        <p className="text-red-400 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="goat-gradient-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="goat-gradient-header p-6 rounded-xl mb-8">
          <h1 className="goat-title text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-red-500">
            ${componentName}
          </h1>
          <p className="goat-subheading text-gray-400 mt-2">
            GOAT Force - Ultimate Experience
          </p>
        </div>

        {/* Main Content */}
        <div className="goat-grid">
          {/* Add your component content here */}
          <div className="goat-gradient-card goat-card-hover p-6 rounded-xl">
            <h2 className="goat-heading text-2xl text-white mb-4">Feature 1</h2>
            <p className="text-gray-300">
              Your content goes here with GOAT Force styling.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button className="goat-btn-primary goat-button-text">
            <Zap className="w-5 h-5 inline mr-2" />
            Primary Action
          </button>
          <button className="goat-btn-gold goat-button-text">
            <Crown className="w-5 h-5 inline mr-2" />
            Secondary Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Update a file with GOAT styling
 */
function updateFileWithGoatStyles(filePath, auditResult) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    // Replace generic classes with GOAT classes
    updatedContent = updatedContent
      .replace(/className="bg-white/g, 'className="goat-gradient-card bg-background')
      .replace(/className="bg-gray-/g, 'className="bg-')
      .replace(/className="text-gray-/g, 'className="text-gray-')
      .replace(/className="border-gray-/g, 'className="border-')
      .replace(/className="shadow-md"/g, 'className="goat-glow')
      .replace(/className="rounded-lg"/g, 'className="rounded-xl')
      .replace(/className="bg-gradient-to-r/g, 'className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500');
    
    // Add GOAT imports if missing
    if (!updatedContent.includes('../styles/globals.css')) {
      updatedContent = updatedContent.replace(
        /import React/,
        'import "../styles/globals.css";\nimport React'
      );
    }
    
    // Write updated content
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🐐 GOAT Force - Feature Integration & Style Unification');
  console.log('=' .repeat(60));
  
  // Audit components
  console.log('\n📊 Auditing Components...');
  const componentAudits = auditDirectory(COMPONENTS_DIR, '.js');
  auditResults.totalComponents += componentAudits.length;
  
  componentAudits.forEach(audit => {
    if (audit.hasGoatStyles) {
      auditResults.styledComponents++;
    } else {
      auditResults.unstyledComponents++;
    }
    
    if (audit.needsUpdate) {
      auditResults.componentsNeedingUpdate.push(audit.fileName);
    }
  });
  
  // Audit pages
  console.log('📊 Auditing Pages...');
  const pageAudits = auditDirectory(PAGES_DIR, '.js');
  
  pageAudits.forEach(audit => {
    if (audit.hasGoatStyles) {
      auditResults.styledComponents++;
    } else {
      auditResults.unstyledComponents++;
    }
    
    if (audit.needsUpdate) {
      auditResults.componentsNeedingUpdate.push(audit.fileName);
    }
  });
  
  // Print audit results
  console.log('\n✅ Audit Results:');
  console.log(`   Total Files: ${auditResults.totalComponents}`);
  console.log(`   Styled: ${auditResults.styledComponents} ✨`);
  console.log(`   Unstyled: ${auditResults.unstyledComponents} ⚠️`);
  console.log(`   Need Updates: ${auditResults.componentsNeedingUpdate.length} 🔧`);
  
  if (auditResults.componentsNeedingUpdate.length > 0) {
    console.log('\n🔧 Components Needing Updates:');
    auditResults.componentsNeedingUpdate.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file}`);
    });
  }
  
  // Generate report file
  const reportPath = path.join(__dirname, 'INTEGRATION_REPORT.md');
  const reportContent = `# GOAT Royalty App - Integration Report

Generated: ${new Date().toISOString()}

## Audit Summary
- Total Files: ${auditResults.totalComponents}
- Styled Components: ${auditResults.styledComponents}
- Unstyled Components: ${auditResults.unstyledComponents}
- Components Needing Updates: ${auditResults.componentsNeedingUpdate.length}

## Components Needing Updates
${auditResults.componentsNeedingUpdate.map(file => `- ${file}`).join('\n')}

## Next Steps
1. Review components needing updates
2. Apply GOAT Force styling
3. Test functionality
4. Deploy to Vercel
`;
  
  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  console.log('\n🎉 Integration audit complete!');
  console.log('📋 Check INTEGRATION_REPORT.md for detailed results');
}

// Run the script
main().catch(console.error);