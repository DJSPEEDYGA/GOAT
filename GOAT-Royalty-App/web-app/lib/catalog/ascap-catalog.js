/**
 * SUPER GOAT ROYALTIES - ASCAP Catalog Manager
 * Parses, indexes, and serves Harvey L. Miller's registered works
 * Supports full-text search, filtering, analytics, and AI-powered queries
 */

const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');

class ASCAPCatalog {
    constructor() {
        this.works = [];
        this.worksById = new Map();
        this.worksByTitle = new Map();
        this.writers = new Map();
        this.stats = null;
        this.cache = new NodeCache({ stdTTL: 3600 });
        this.loaded = false;
        this.sources = [];
    }

    /**
     * Parse ASCAP CSV file into structured data
     */
    parseCSV(csvContent, sourceName = 'unknown') {
        const lines = csvContent.split('\n');
        if (lines.length < 2) return [];

        const headerLine = lines[0];
        const headers = this._parseCSVLine(headerLine);

        const records = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = this._parseCSVLine(line);
            if (values.length < 6) continue;

            const record = {};
            headers.forEach((header, idx) => {
                record[header.trim().replace(/:/g, '')] = (values[idx] || '').trim();
            });

            // Normalize field names
            const work = {
                partyId: record['Party ID 1'] || record['Party ID'],
                totalWorks: parseInt(record['Total Number Of Works']) || 0,
                memberName: record['Member Name'] || '',
                title: record['Work Title'] || '',
                ascapWorkId: record['ASCAP Work ID'] || '',
                interestedParty: record['Interested Parties'] || '',
                ipiNumber: record['IPI Number'] || '',
                partyStatus: record['Interested Party Status'] || '',
                role: record['Role'] || '',
                society: record['Society'] || '',
                ownPercent: record['Own%'] || '',
                collectPercent: record['Collect%'] || '',
                registrationDate: record['Registration Date'] || '',
                registrationStatus: record['Registration Status'] || '',
                surveyedWork: record['Surveyed Work'] || '',
                iswcNumber: record['ISWC Number'] || '',
                licensedByASCAP: record['Work Licenced By ASCAP'] || '',
                shareLicensed: record['Share Licenced By ASCAP'] || '',
                source: sourceName
            };

            records.push(work);
        }

        return records;
    }

    /**
     * Parse a single CSV line respecting quoted fields
     */
    _parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }

    /**
     * Load catalogs from CSV files
     */
    async loadFromFiles(filePaths) {
        const allRecords = [];

        for (const filePath of filePaths) {
            try {
                const absolutePath = path.resolve(filePath);
                if (!fs.existsSync(absolutePath)) {
                    console.warn(`⚠ Catalog file not found: ${filePath}`);
                    continue;
                }

                const content = fs.readFileSync(absolutePath, 'utf-8');
                const sourceName = path.basename(filePath, '.csv');
                const records = this.parseCSV(content, sourceName);
                allRecords.push(...records);
                this.sources.push({ name: sourceName, records: records.length, path: filePath });
                console.log(`📀 Loaded ${records.length} records from ${sourceName}`);
            } catch (err) {
                console.error(`❌ Error loading catalog ${filePath}:`, err.message);
            }
        }

        this._indexRecords(allRecords);
        this.loaded = true;
        return this.getStats();
    }

    /**
     * Index all records for fast lookup
     */
    _indexRecords(records) {
        this.works = [];
        this.worksById.clear();
        this.worksByTitle.clear();
        this.writers.clear();

        // Group records by ASCAP Work ID to consolidate multi-writer works
        const workGroups = new Map();

        for (const record of records) {
            const workId = record.ascapWorkId;
            if (!workId) continue;

            if (!workGroups.has(workId)) {
                workGroups.set(workId, {
                    id: workId,
                    title: record.title,
                    iswcNumber: record.iswcNumber,
                    registrationDate: record.registrationDate,
                    registrationStatus: record.registrationStatus,
                    surveyedWork: record.surveyedWork === 'Y',
                    licensedByASCAP: record.licensedByASCAP === 'Y',
                    shareLicensed: record.shareLicensed === 'Y',
                    writers: [],
                    source: record.source
                });
            }

            const work = workGroups.get(workId);

            // Add writer info
            work.writers.push({
                name: record.interestedParty,
                ipiNumber: record.ipiNumber,
                status: record.partyStatus,
                role: record.role,
                society: record.society,
                ownPercent: record.ownPercent,
                collectPercent: record.collectPercent
            });

            // Track unique writers
            const writerKey = record.ipiNumber || record.interestedParty;
            if (writerKey && !this.writers.has(writerKey)) {
                this.writers.set(writerKey, {
                    name: record.interestedParty,
                    ipiNumber: record.ipiNumber,
                    society: record.society,
                    role: record.role,
                    workCount: 0
                });
            }
            if (writerKey) {
                this.writers.get(writerKey).workCount++;
            }
        }

        // Flatten to array and build indexes
        for (const [id, work] of workGroups) {
            this.works.push(work);
            this.worksById.set(id, work);

            const titleKey = work.title.toLowerCase();
            if (!this.worksByTitle.has(titleKey)) {
                this.worksByTitle.set(titleKey, []);
            }
            this.worksByTitle.get(titleKey).push(work);
        }

        // Sort by title
        this.works.sort((a, b) => a.title.localeCompare(b.title));

        // Build stats
        this._buildStats();
    }

    /**
     * Build catalog statistics
     */
    _buildStats() {
        const roles = {};
        const societies = {};
        const statuses = {};
        const years = {};
        let licensedCount = 0;
        let surveyedCount = 0;

        for (const work of this.works) {
            if (work.licensedByASCAP) licensedCount++;
            if (work.surveyedWork) surveyedCount++;

            // Parse registration year
            if (work.registrationDate) {
                const parts = work.registrationDate.split('/');
                const year = parts[2];
                if (year) years[year] = (years[year] || 0) + 1;
            }

            if (work.registrationStatus) {
                statuses[work.registrationStatus] = (statuses[work.registrationStatus] || 0) + 1;
            }

            for (const writer of work.writers) {
                if (writer.role) roles[writer.role] = (roles[writer.role] || 0) + 1;
                if (writer.society) societies[writer.society] = (societies[writer.society] || 0) + 1;
            }
        }

        this.stats = {
            totalWorks: this.works.length,
            totalWriters: this.writers.size,
            totalRecords: this.works.reduce((sum, w) => sum + w.writers.length, 0),
            licensedByASCAP: licensedCount,
            surveyedWorks: surveyedCount,
            roleBreakdown: roles,
            societyBreakdown: societies,
            statusBreakdown: statuses,
            registrationsByYear: years,
            sources: this.sources,
            topWriters: Array.from(this.writers.values())
                .sort((a, b) => b.workCount - a.workCount)
                .slice(0, 20)
                .map(w => ({ name: w.name, ipi: w.ipiNumber, works: w.workCount, role: w.role }))
        };
    }

    /**
     * Search works by title, writer, or general query
     */
    search(query, options = {}) {
        const cacheKey = `search:${query}:${JSON.stringify(options)}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        const {
            page = 1,
            limit = 20,
            sort = 'title',
            order = 'asc',
            role = null,
            status = null,
            licensed = null
        } = options;

        const q = query.toLowerCase().trim();
        let results = this.works;

        // Text search
        if (q) {
            results = results.filter(work => {
                if (work.title.toLowerCase().includes(q)) return true;
                if (work.id.includes(q)) return true;
                if (work.iswcNumber && work.iswcNumber.toLowerCase().includes(q)) return true;
                return work.writers.some(w =>
                    w.name.toLowerCase().includes(q) ||
                    (w.ipiNumber && w.ipiNumber.includes(q))
                );
            });
        }

        // Filters
        if (role) {
            results = results.filter(w => w.writers.some(wr => wr.role === role));
        }
        if (status) {
            results = results.filter(w => w.registrationStatus === status);
        }
        if (licensed !== null) {
            results = results.filter(w => w.licensedByASCAP === licensed);
        }

        // Sort
        results.sort((a, b) => {
            let cmp = 0;
            switch (sort) {
                case 'date':
                    cmp = (a.registrationDate || '').localeCompare(b.registrationDate || '');
                    break;
                case 'id':
                    cmp = a.id.localeCompare(b.id);
                    break;
                default:
                    cmp = a.title.localeCompare(b.title);
            }
            return order === 'desc' ? -cmp : cmp;
        });

        // Paginate
        const total = results.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginated = results.slice(offset, offset + limit);

        const result = {
            works: paginated,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        };

        this.cache.set(cacheKey, result);
        return result;
    }

    /**
     * Get a single work by ASCAP Work ID
     */
    getWork(workId) {
        return this.worksById.get(workId) || null;
    }

    /**
     * Get all works (paginated)
     */
    getAllWorks(page = 1, limit = 20) {
        return this.search('', { page, limit });
    }

    /**
     * Get catalog statistics
     */
    getStats() {
        return this.stats || { totalWorks: 0, loaded: false };
    }

    /**
     * Get unique writers
     */
    getWriters(page = 1, limit = 20) {
        const allWriters = Array.from(this.writers.values())
            .sort((a, b) => b.workCount - a.workCount);

        const total = allWriters.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        return {
            writers: allWriters.slice(offset, offset + limit),
            pagination: { page, limit, total, totalPages }
        };
    }

    /**
     * Get registration timeline data for charts
     */
    getTimeline() {
        if (!this.stats) return [];
        return Object.entries(this.stats.registrationsByYear)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([year, count]) => ({ year, count }));
    }

    /**
     * Export works as formatted text for RAG ingestion
     */
    toRAGDocuments() {
        const docs = [];

        // Summary document
        const summary = `Harvey L. Miller (DJ Speedy / DJSPEEDYGA) ASCAP Music Catalog Summary:
- Total registered works: ${this.stats?.totalWorks || 0}
- Total writers/collaborators: ${this.stats?.totalWriters || 0}
- Licensed by ASCAP: ${this.stats?.licensedByASCAP || 0}
- IPI Number: 348202968
- Party ID: 1596704
- Publishing: FASTASSMAN PUBLISHING INC
- Top collaborators: ${this.stats?.topWriters?.slice(0, 5).map(w => w.name).join(', ') || 'N/A'}`;

        docs.push({ id: 'catalog-summary', content: summary, metadata: { type: 'catalog-summary' } });

        // Batch works into chunks of 20 for RAG
        for (let i = 0; i < this.works.length; i += 20) {
            const batch = this.works.slice(i, i + 20);
            const content = batch.map(w => {
                const writers = w.writers.map(wr => `${wr.name} (${wr.role}, ${wr.ownPercent})`).join('; ');
                return `"${w.title}" [ASCAP ID: ${w.id}] - Writers: ${writers} - Registered: ${w.registrationDate} - ISWC: ${w.iswcNumber || 'N/A'}`;
            }).join('\n');

            docs.push({
                id: `catalog-works-${i}`,
                content: content,
                metadata: { type: 'catalog-works', startIndex: i, count: batch.length }
            });
        }

        return docs;
    }
}

module.exports = new ASCAPCatalog();