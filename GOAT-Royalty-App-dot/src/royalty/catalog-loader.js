/**
 * GOAT Royalty Catalog Loader
 * Integrates Harvey Miller / FASTASSMAN Publishing catalogs
 * Works with Ms. Vanessa for fingerprinting & royalty tracking
 */

const GOATCatalogLoader = (() => {
  // Catalog state
  const catalogState = {
    works: [],
    isrcIndex: {},
    titleIndex: {},
    totalWorks: 0,
    totalISRCs: 0,
    loadedAt: null
  };

  // Publisher info
  const PUBLISHER_INFO = {
    name: 'FASTASSMAN PUBLISHING INC.',
    ipi: '00348585814',
    mlcNumber: 'P0041X',
    writer: {
      name: 'Harvey Miller',
      ipi: '00348202968',
      ascapId: '1596704',
      role: 'CA' // Composer Author
    },
    society: 'ASCAP'
  };

  // Parse CSV data
  function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const works = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = parseCSVLine(lines[i]);
      if (values.length < 3) continue;

      const work = {};
      headers.forEach((header, idx) => {
        work[header] = values[idx] || '';
      });

      works.push(work);
    }

    return works;
  }

  // Parse CSV line handling quotes
  function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
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

    return values;
  }

  // Load FASTASSMAN catalog
  function loadFASTASSMANCatalog(csvText) {
    const works = parseCSV(csvText);
    
    works.forEach(work => {
      const processedWork = {
        title: work['Song Title'] || work['Work Title'],
        writer: work['Writer Name'] || 'Harvey Miller',
        writerIPI: work['Writer IPI'] || PUBLISHER_INFO.writer.ipi,
        publisher: work['Publisher Name'] || PUBLISHER_INFO.name,
        publisherIPI: work['Publisher IPI'] || PUBLISHER_INFO.ipi,
        mlcPublisherNumber: work['MLC Publisher Number'] || PUBLISHER_INFO.mlcNumber,
        album: work['Album'] || '',
        trackNumber: work['Track Number'] || '',
        isrc: work['ISRC'] || '',
        duration: work['Duration'] || '',
        artistSplit: work['Artist Split'] || 'Harvey Miller 100%',
        publishingSplit: work['Publishing Split'] || 'Ruthless 75% / FAST ASS 25%',
        source: 'FASTASSMAN_CATALOG'
      };

      if (processedWork.isrc) {
        catalogState.isrcIndex[processedWork.isrc] = processedWork;
      }
      if (processedWork.title) {
        catalogState.titleIndex[processedWork.title.toLowerCase()] = processedWork;
      }

      catalogState.works.push(processedWork);
    });

    catalogState.loadedAt = new Date().toISOString();
    return works.length;
  }

  // Load ASCAP works catalog
  function loadASCAPCatalog(csvText) {
    const works = parseCSV(csvText);
    let uniqueWorks = new Set();

    works.forEach(work => {
      const title = work['Work Title'] || '';
      if (!title) return;

      const ascapId = work['ASCAP Work ID'] || '';
      const iswc = work['ISWC Number'] || '';
      
      // Create unique work key
      const workKey = `${title}_${ascapId}`;
      if (uniqueWorks.has(workKey)) return;
      uniqueWorks.add(workKey);

      const processedWork = {
        title: title,
        ascapWorkId: ascapId,
        iswc: iswc,
        writer: work['MILLER, HARVEY L'] || work['Interested Parties'] || 'Harvey Miller',
        writerIPI: work['IPI Number'] || PUBLISHER_INFO.writer.ipi,
        publisher: PUBLISHER_INFO.name,
        publisherIPI: PUBLISHER_INFO.ipi,
        ownPercent: work['Own%'] || '50%',
        collectPercent: work['Collect%'] || '50%',
        registrationDate: work['Registration Date'] || '',
        registrationStatus: work['Registration Status'] || '',
        surveyed: work['Surveyed Work'] === 'Y',
        society: 'ASCAP',
        source: 'ASCAP_CATALOG'
      };

      catalogState.works.push(processedWork);
    });

    return uniqueWorks.size;
  }

  // Get catalog stats
  function getStats() {
    const isrcCount = Object.keys(catalogState.isrcIndex).length;
    const titleCount = Object.keys(catalogState.titleIndex).length;

    return {
      totalWorks: catalogState.works.length,
      isrcIndexed: isrcCount,
      titleIndexed: titleCount,
      loadedAt: catalogState.loadedAt,
      publisher: PUBLISHER_INFO
    };
  }

  // Search by ISRC
  function findByISRC(isrc) {
    return catalogState.isrcIndex[isrc] || null;
  }

  // Search by title
  function findByTitle(title) {
    return catalogState.titleIndex[title.toLowerCase()] || null;
  }

  // Search works
  function searchWorks(query) {
    const lowerQuery = query.toLowerCase();
    return catalogState.works.filter(work => 
      work.title?.toLowerCase().includes(lowerQuery) ||
      work.isrc?.toLowerCase().includes(lowerQuery) ||
      work.album?.toLowerCase().includes(lowerQuery)
    );
  }

  // Get all works
  function getAllWorks() {
    return catalogState.works;
  }

  // Export for Ms. Vanessa
  function exportForVanessa() {
    return {
      publisher: PUBLISHER_INFO,
      stats: getStats(),
      works: catalogState.works.slice(0, 100), // First 100 for display
      isrcIndex: catalogState.isrcIndex
    };
  }

  return {
    parseCSV,
    loadFASTASSMANCatalog,
    loadASCAPCatalog,
    getStats,
    findByISRC,
    findByTitle,
    searchWorks,
    getAllWorks,
    exportForVanessa,
    PUBLISHER_INFO
  };
})();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GOATCatalogLoader;
}