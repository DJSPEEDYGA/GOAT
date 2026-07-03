/**
 * GOAT Royalty App - ASCAP Catalog Processor
 * Processes Harvey Miller's ASCAP publishing catalogs
 */

const fs = require('fs');
const path = require('path');

function processASCAPOperations() {
  const harveyWritersPath = path.join(__dirname, '../WorksCatalog2 HARVEY L MILLER WRITERS.csv');
  const fastassmanPublisherPath = path.join(__dirname, '../WorksCatalogFASTASSMAN PUBLISHING INC ASCAP.csv');
  
  // Process Harvey Miller Writers Catalog
  const harveyCatalog = processCSVFile(harveyWritersPath, 'harvey-writers');
  
  // Process FASTASSMAN Publisher Catalog  
  const fastassmanCatalog = processCSVFile(fastassmanPublisherPath, 'fastassman-publisher');
  
  // Create comprehensive catalog
  const comprehensiveCatalog = createComprehensiveCatalog(harveyCatalog, fastassmanCatalog);
  
  // Save processed catalogs
  saveProcessedCatalogs(harveyCatalog, fastassmanCatalog, comprehensiveCatalog);
  
  console.log('📋 ASCAP Catalog Processing Complete!');
  console.log(`🎵 Harvey Miller Writers: ${harveyCatalog.works.length} works`);
  console.log(`🏢 FASTASSMAN Publisher: ${fastassmanCatalog.works.length} works`);
  console.log(`📊 Comprehensive Catalog: ${comprehensiveCatalog.works.length} unique works`);
  
  return comprehensiveCatalog;
}

function processCSVFile(filePath, catalogType) {
  try {
    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const works = [];
    const workMap = new Map(); // To group by work title
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = parseCSVLine(lines[i]);
        const work = {};
        
        headers.forEach((header, index) => {
          work[header.replace(/\s+/g, '_').toLowerCase()] = values[index] || '';
        });
        
        // Add processing metadata
        work.catalog_type = catalogType;
        work.processed_date = new Date().toISOString();
        work.work_id = `${catalogType}_${i}`;
        
        // Extract key information
        const workTitle = work.work_title || '';
        if (workTitle) {
          if (!workMap.has(workTitle)) {
            workMap.set(workTitle, {
              work_title: workTitle,
              ascap_work_id: work.ascap_work_id,
              iswc_number: work.iswc_number,
              registration_date: work.registration_date,
              registration_status: work.registration_status,
              interested_parties: [],
              total_ownership: 0,
              catalog_type: catalogType
            });
          }
          
          // Add interested party
          workMap.get(workTitle).interested_parties.push({
            interested_party: work.interested_parties,
            ipi_number: work.ipi_number,
            role: work.role,
            society: work.society,
            own_percent: parseFloat(work.own_percent) || 0,
            collect_percent: parseFloat(work.collect_percent) || 0,
            interested_party_status: work.interested_party_status
          });
          
          // Calculate total ownership
          workMap.get(workTitle).total_ownership += parseFloat(work.own_percent) || 0;
        }
      }
    }
    
    return {
      catalog_type: catalogType,
      total_records: lines.length - 1,
      unique_works: workMap.size,
      works: Array.from(workMap.values()),
      processed_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { catalog_type: catalogType, works: [], error: error.message };
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(item => item.replace(/^"|"$/g, ''));
}

function createComprehensiveCatalog(harveyCatalog, fastassmanCatalog) {
  const allWorks = new Map();
  
  // Add Harvey Miller works
  harveyCatalog.works.forEach(work => {
    const key = `${work.work_title}_${work.iswc_number}`;
    allWorks.set(key, {
      ...work,
      source_catalogs: ['harvey-writers']
    });
  });
  
  // Add FASTASSMAN works and merge duplicates
  fastassmanCatalog.works.forEach(work => {
    const key = `${work.work_title}_${work.iswc_number}`;
    
    if (allWorks.has(key)) {
      // Merge with existing work
      const existing = allWorks.get(key);
      existing.interested_parties = [...existing.interested_parties, ...work.interested_parties];
      existing.source_catalogs.push('fastassman-publisher');
      existing.catalog_type = 'merged';
    } else {
      // Add new work
      allWorks.set(key, {
        ...work,
        source_catalogs: ['fastassman-publisher']
      });
    }
  });
  
  // Calculate statistics
  const mergedWorks = Array.from(allWorks.values());
  const totalRoyalties = calculateEstimatedRoyalties(mergedWorks);
  
  return {
    catalog_type: 'comprehensive',
    total_unique_works: allWorks.size,
    harvey_writers_count: harveyCatalog.unique_works,
    fastassman_publisher_count: fastassmanCatalog.unique_works,
    works: mergedWorks,
    estimated_total_royalties: totalRoyalties,
    processed_at: new Date().toISOString(),
    source_files: [
      'WorksCatalog2 HARVEY L MILLER WRITERS.csv',
      'WorksCatalogFASTASSMAN PUBLISHING INC ASCAP.csv'
    ]
  };
}

function calculateEstimatedRoyalties(works) {
  // Estimate royalties based on work count and average values
  const avgRoyaltyPerWork = 2500; // Estimated average royalty per work
  return works.length * avgRoyaltyPerWork;
}

function saveProcessedCatalogs(harveyCatalog, fastassmanCatalog, comprehensiveCatalog) {
  const outputDir = path.join(__dirname, '../processed-catalogs');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save Harvey Miller catalog
  fs.writeFileSync(
    path.join(outputDir, 'harvey-miller-writers-catalog.json'),
    JSON.stringify(harveyCatalog, null, 2)
  );
  
  // Save FASTASSMAN catalog
  fs.writeFileSync(
    path.join(outputDir, 'fastassman-publisher-catalog.json'),
    JSON.stringify(fastassmanCatalog, null, 2)
  );
  
  // Save comprehensive catalog
  fs.writeFileSync(
    path.join(outputDir, 'comprehensive-asap-catalog.json'),
    JSON.stringify(comprehensiveCatalog, null, 2)
  );
  
  // Create CSV summary for easy viewing
  createSummaryCSV(comprehensiveCatalog, outputDir);
}

function createSummaryCSV(comprehensiveCatalog, outputDir) {
  const csvHeaders = [
    'Work Title',
    'ASCAP Work ID', 
    'ISWC Number',
    'Registration Date',
    'Total Interested Parties',
    'Total Ownership %',
    'Source Catalogs'
  ];
  
  const csvRows = comprehensiveCatalog.works.map(work => [
    work.work_title,
    work.ascap_work_id,
    work.iswc_number,
    work.registration_date,
    work.interested_parties.length,
    work.total_ownership,
    work.source_catalogs.join('; ')
  ]);
  
  const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
  
  fs.writeFileSync(
    path.join(outputDir, 'asap-catalog-summary.csv'),
    csvContent
  );
}

// Run the processor
if (require.main === module) {
  processASCAPOperations();
}

module.exports = { processASCAPOperations, processCSVFile, createComprehensiveCatalog };