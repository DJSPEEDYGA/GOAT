/**
 * Load Real Catalog Data from CSV files
 * Parses FASTASSMAN and Harvey Miller catalogs
 */

const fs = require('fs');
const path = require('path');

// Parse CSV file with proper handling of quoted fields
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // Split by comma but respect quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].replace(/"/g, '') : '';
    });
    
    data.push(row);
  }
  
  return data;
}

// Load both catalogs
function loadCatalogs() {
  console.log('📊 Loading Real Catalog Data...\n');
  
  const fastassmanPath = path.join(__dirname, '..', 'WorksCatalogFASTASSMAN PUBLISHING INC ASCAP.csv');
  const harveyPath = path.join(__dirname, '..', 'WorksCatalog2 HARVEY L MILLER WRITERS.csv');
  
  console.log('Loading FASTASSMAN catalog...');
  const fastassman = parseCSV(fastassmanPath);
  console.log(`✅ Loaded ${fastassman.length} FASTASSMAN works`);
  
  console.log('Loading Harvey Miller catalog...');
  const harvey = parseCSV(harveyPath);
  console.log(`✅ Loaded ${harvey.length} Harvey Miller works`);
  
  // Combine and deduplicate
  const allWorks = [...fastassman, ...harvey];
  const uniqueWorks = [];
  const seenWorkIds = new Set();
  
  allWorks.forEach(work => {
    const workId = work['ASCAP Work ID'];
    if (workId && !seenWorkIds.has(workId)) {
      seenWorkIds.add(workId);
      uniqueWorks.push({
        workId: workId,
        title: work['Work Title'],
        memberName: work['Member Name'],
        interestedParties: work['Interested Parties'],
        ipiNumber: work['IPI Number'],
        role: work['Role'],
        society: work['Society'],
        ownPercent: work['Own%'],
        collectPercent: work['Collect%'],
        registrationDate: work['Registration Date'],
        status: work['Registration Status'],
        iswc: work['ISWC Number'],
        surveyed: work['Surveyed Work'],
        licenced: work['Work Licenced By ASCAP']
      });
    }
  });
  
  console.log(`\n📈 Total unique works: ${uniqueWorks.length}`);
  
  // Save to JSON for easy loading
  const outputPath = path.join(__dirname, '..', 'data', 'catalog-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(uniqueWorks, null, 2));
  console.log(`✅ Saved to: ${outputPath}`);
  
  // Generate summary statistics
  const summary = {
    totalWorks: uniqueWorks.length,
    fastassmanWorks: fastassman.length,
    harveyWorks: harvey.length,
    publishers: [...new Set(uniqueWorks.map(w => w.memberName))],
    societies: [...new Set(uniqueWorks.map(w => w.society))],
    activeWorks: uniqueWorks.filter(w => w.status === 'Accepted').length,
    surveyedWorks: uniqueWorks.filter(w => w.surveyed === 'Y').length
  };
  
  console.log('\n📊 Catalog Summary:');
  console.log(`   Total Works: ${summary.totalWorks}`);
  console.log(`   Active Works: ${summary.activeWorks}`);
  console.log(`   Surveyed Works: ${summary.surveyedWorks}`);
  console.log(`   Publishers: ${summary.publishers.length}`);
  console.log(`   Societies: ${summary.societies.join(', ')}`);
  
  return { works: uniqueWorks, summary };
}

// Run if called directly
if (require.main === module) {
  try {
    loadCatalogs();
    console.log('\n✅ Catalog data loaded successfully!');
  } catch (error) {
    console.error('❌ Error loading catalog data:', error);
    process.exit(1);
  }
}

module.exports = { loadCatalogs, parseCSV };