/**
 * GOAT Royalty - Real Catalog Search API
 * =======================================
 * Searches actual ASCAP works and master tracks from CSV data.
 * 
 * Query params:
 *   q       - search query (title, artist, ISRC, etc.)
 *   type    - 'all' | 'ascap' | 'masters' (default: 'all')
 *   page    - page number (default: 1)
 *   limit   - results per page (default: 20)
 *   stats   - if 'true', return catalog stats only
 */

import { CatalogManager, GOAT_FORCE_CONFIG } from '../../../lib/goatForceEngine';

let catalogManager = null;

function getCatalog() {
  if (!catalogManager) {
    catalogManager = new CatalogManager();
    catalogManager.loadFromCSV();
  }
  return catalogManager;
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q, type = 'all', page = '1', limit = '20', stats } = req.query;
    const catalog = getCatalog();

    // Stats-only mode
    if (stats === 'true') {
      return res.status(200).json({
        success: true,
        data: catalog.getStats()
      });
    }

    // Search mode
    if (!q || q.trim().length === 0) {
      // Return overview if no query
      const allStats = catalog.getStats();
      return res.status(200).json({
        success: true,
        data: {
          message: 'Provide a search query using ?q=your+search+term',
          catalogStats: allStats,
          examples: [
            '/api/catalog/search?q=better+plan',
            '/api/catalog/search?q=USUM72301134&type=masters',
            '/api/catalog/search?q=miller&type=ascap',
            '/api/catalog/search?stats=true'
          ]
        }
      });
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const searchResults = catalog.search(q.trim(), type);

    // Paginate
    const allResults = [...searchResults.results.ascap.map(w => ({ ...w, source: 'ascap' })), 
                        ...searchResults.results.masters.map(t => ({ ...t, source: 'master' }))];
    const totalResults = allResults.length;
    const totalPages = Math.ceil(totalResults / pageSize);
    const start = (pageNum - 1) * pageSize;
    const paginatedResults = allResults.slice(start, start + pageSize);

    return res.status(200).json({
      success: true,
      data: {
        query: q.trim(),
        type,
        results: paginatedResults,
        pagination: {
          page: pageNum,
          limit: pageSize,
          totalResults,
          totalPages,
          hasMore: pageNum < totalPages
        },
        catalogStats: searchResults.catalogStats
      }
    });

  } catch (error) {
    console.error('[Catalog Search] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search catalog',
      details: error.message
    });
  }
}