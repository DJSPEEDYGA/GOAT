/**
 * GOAT Royalty App - ASCAP Catalog API
 * Provides access to Harvey Miller's comprehensive ASCAP publishing catalog
 */

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGetASAPCatalog(req, res);
        break;
      case 'POST':
        await handleSearchCatalog(req, res);
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('ASAP Catalog API Error:', error);
    res.status(500).json({ 
      error: 'ASAP Catalog operation failed',
      details: error.message 
    });
  }
}

async function handleGetASAPCatalog(req, res) {
  try {
    const catalogPath = path.join(process.cwd(), 'processed-catalogs', 'comprehensive-asap-catalog.json');
    
    if (!fs.existsSync(catalogPath)) {
      return res.status(404).json({ error: 'ASAP catalog not found. Please process the CSV files first.' });
    }

    const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    
    // Add summary statistics
    const summary = generateCatalogSummary(catalogData);
    
    res.status(200).json({
      success: true,
      catalog: catalogData,
      summary: summary,
      last_updated: catalogData.processed_at
    });

  } catch (error) {
    console.error('Error reading ASAP catalog:', error);
    res.status(500).json({ error: 'Failed to read ASAP catalog' });
  }
}

async function handleSearchCatalog(req, res) {
  try {
    const { searchTerm, filterBy, sortBy } = req.body;
    
    const catalogPath = path.join(process.cwd(), 'processed-catalogs', 'comprehensive-asap-catalog.json');
    
    if (!fs.existsSync(catalogPath)) {
      return res.status(404).json({ error: 'ASAP catalog not found' });
    }

    const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    let works = [...catalogData.works];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      works = works.filter(work => 
        work.work_title.toLowerCase().includes(term) ||
        work.ascap_work_id.toLowerCase().includes(term) ||
        work.iswc_number.toLowerCase().includes(term)
      );
    }
    
    // Apply additional filters
    if (filterBy) {
      if (filterBy.catalogType) {
        works = works.filter(work => work.source_catalogs.includes(filterBy.catalogType));
      }
      if (filterBy.minParties) {
        works = works.filter(work => work.interested_parties.length >= parseInt(filterBy.minParties));
      }
    }
    
    // Apply sorting
    if (sortBy) {
      works.sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.work_title.localeCompare(b.work_title);
          case 'date':
            return new Date(b.registration_date) - new Date(a.registration_date);
          case 'parties':
            return b.interested_parties.length - a.interested_parties.length;
          default:
            return 0;
        }
      });
    }
    
    res.status(200).json({
      success: true,
      results: works,
      total_found: works.length,
      total_catalog: catalogData.works.length
    });

  } catch (error) {
    console.error('Error searching ASAP catalog:', error);
    res.status(500).json({ error: 'Failed to search ASAP catalog' });
  }
}

function generateCatalogSummary(catalogData) {
  const works = catalogData.works;
  
  // Calculate statistics
  const totalWorks = works.length;
  const totalInterestedParties = works.reduce((sum, work) => sum + work.interested_parties.length, 0);
  const avgPartiesPerWork = totalInterestedParties / totalWorks;
  
  // Distribution by catalog type
  const catalogTypeDistribution = {};
  works.forEach(work => {
    work.source_catalogs.forEach(source => {
      catalogTypeDistribution[source] = (catalogTypeDistribution[source] || 0) + 1;
    });
  });
  
  // Top interested parties
  const partyCount = {};
  works.forEach(work => {
    work.interested_parties.forEach(party => {
      const partyName = party.interested_party;
      partyCount[partyName] = (partyCount[partyName] || 0) + 1;
    });
  });
  
  const topParties = Object.entries(partyCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  // Registration status distribution
  const statusDistribution = {};
  works.forEach(work => {
    const status = work.registration_status || 'Unknown';
    statusDistribution[status] = (statusDistribution[status] || 0) + 1;
  });
  
  return {
    total_unique_works: totalWorks,
    total_interested_parties: totalInterestedParties,
    average_parties_per_work: Math.round(avgPartiesPerWork * 100) / 100,
    harvey_writers_count: catalogData.harvey_writers_count,
    fastassman_publisher_count: catalogData.fastassman_publisher_count,
    catalog_type_distribution: catalogTypeDistribution,
    top_interested_parties: topParties,
    registration_status_distribution: statusDistribution,
    estimated_total_royalties: catalogData.estimated_total_royalties,
    source_files: catalogData.source_files
  };
}
