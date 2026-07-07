/**
 * EVIDENCE LOG GENERATOR
 * Professional chain-of-custody / evidence preservation log for hard drives and data.
 * Designed for NIST-style documentation (per user's existing MASTER DOC forensics).
 * Goal: Complete verifiable inventory so physical drives do not need to be surrendered.
 *
 * Usage:
 *   const { EvidenceLog } = require('./evidence-log');
 *   const log = new EvidenceLog();
 *   log.recordFBIContact(); // or pass from HealthMonitor
 *   log.addDriveFromCurrentSystem('/Volumes/WFHD');
 *   log.addEvidenceItem({ id: 'EVID-001', description: '...', hash: 'sha256:...' });
 *   await log.generateAndWrite('post-fbi-preservation');
 *
 * Outputs:
 *   data/evidence-logs/evidence-log-YYYY-MM-DD-HHMM.json
 *   data/evidence-logs/evidence-log-YYYY-MM-DD-HHMM.html (printable report)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class EvidenceLog {
  constructor(collectorName = 'Harvey L. Miller Jr. (DJ Speedy / GOAT Systems)') {
    this.collector = collectorName;
    this.logId = `EVID-LOG-${Date.now()}`;
    this.createdAt = new Date().toISOString();
    this.purpose = 'Evidence Preservation & Chain of Custody - Hard Drive Inventory';
    this.drives = [];
    this.evidenceItems = [];
    this.chainOfCustody = [];
    this.notes = [];
    this.referencedContacts = []; // links to sensitive/FBI contacts
    this.integrityHash = null;
  }

  /**
   * Link to a recent sensitive agency contact (e.g. the FBI one we recorded).
   */
  addReferencedContact(contact) {
    if (contact) {
      this.referencedContacts.push({
        timestamp: contact.timestamp,
        source: contact.source,
        details: contact.details,
        context: contact.context || 'post-contact evidence preservation'
      });
      this.addNote(`This evidence log was generated following sensitive contact: ${contact.source} on ${contact.timestamp}`);
    }
  }

  /**
   * Record the fact that this log exists because of the FBI briefing.
   */
  recordPostFBIContext() {
    this.purpose = 'Evidence Preservation Log - Generated immediately after off-line contact with FBI agents';
    this.addNote('User reported "just got off the line with FBI agents". This log created to document drive contents for protection against potential seizure.');
    this.addChainEntry({
      action: 'LOG GENERATION',
      by: this.collector,
      timestamp: this.createdAt,
      location: 'Local secure workstation',
      notes: 'Post-FBI briefing evidence preservation protocol activated.'
    });
  }

  /**
   * Add a physical/logical drive to the inventory.
   * driveInfo can be manual or from auto-detect.
   */
  addDrive(driveInfo) {
    const entry = {
      id: `DRIVE-${this.drives.length + 1}`,
      mountPoint: driveInfo.mountPoint || 'unknown',
      volumeName: driveInfo.volumeName || driveInfo.name || 'Unnamed',
      size: driveInfo.size || 'unknown',
      used: driveInfo.used || 'unknown',
      avail: driveInfo.avail || 'unknown',
      filesystem: driveInfo.filesystem || 'unknown',
      identifier: driveInfo.identifier || driveInfo.device || 'unknown',
      serialOrUUID: driveInfo.serial || driveInfo.uuid || 'not captured',
      collectedAt: new Date().toISOString(),
      notes: driveInfo.notes || ''
    };
    this.drives.push(entry);
    return entry;
  }

  /**
   * Auto-detect and add current macOS drives (uses diskutil + df).
   * Call with specific paths like ['/Volumes/WFHD', '/Volumes/AGENT2']
   */
  addCurrentSystemDrives(specificPaths = []) {
    try {
      const pathsToCheck = specificPaths.length > 0 ? specificPaths : [
        '/Volumes/WFHD',
        '/Volumes/The C Room',
        '/Volumes/AGENT1',
        '/Volumes/AGENT2',
        '/Volumes/AGENT3'
      ];

      pathsToCheck.forEach(mount => {
        if (fs.existsSync(mount)) {
          try {
            // Get detailed info on mac
            let info = { mountPoint: mount };
            try {
              const diskUtilOut = execSync(`diskutil info "${mount}" 2>/dev/null || echo "no diskutil"`, { encoding: 'utf8' });
              const volNameMatch = diskUtilOut.match(/Volume Name:\s+(.+)/);
              const sizeMatch = diskUtilOut.match(/Total Size:\s+(.+?)\s+\(/);
              const fsMatch = diskUtilOut.match(/File System Personality:\s+(.+)/);
              const uuidMatch = diskUtilOut.match(/Volume UUID:\s+(.+)/i);
              const deviceMatch = diskUtilOut.match(/Device Identifier:\s+(.+)/);
              const protocolMatch = diskUtilOut.match(/Protocol:\s+(.+)/);
              if (volNameMatch) info.volumeName = volNameMatch[1].trim();
              if (sizeMatch) info.size = sizeMatch[1].trim();
              if (fsMatch) info.filesystem = fsMatch[1].trim();
              if (uuidMatch) info.serialOrUUID = uuidMatch[1].trim();
              if (deviceMatch) info.identifier = deviceMatch[1].trim();
              if (protocolMatch) info.notes = (info.notes || '') + ` Protocol: ${protocolMatch[1].trim()}.`;
            } catch (e) {}

            // Fallback/add df info
            try {
              const dfOut = execSync(`df -h "${mount}" | tail -1`, { encoding: 'utf8' });
              const cols = dfOut.trim().split(/\s+/);
              if (cols.length >= 4) {
                info.size = info.size || cols[1];
                info.used = cols[2];
                info.avail = cols[3];
              }
            } catch (e) {}

            info.notes = `Auto-detected on ${new Date().toISOString().split('T')[0]}. Labeled as potential evidence drive.`;
            this.addDrive(info);
          } catch (err) {
            this.addDrive({ mountPoint: mount, notes: 'Detected but details unavailable: ' + err.message });
          }
        }
      });
    } catch (e) {
      this.addNote('Auto-drive detection encountered error: ' + e.message);
    }
  }

  /**
   * Add a specific evidence item (file, folder, catalog, etc.).
   * Provide your own SHA-256 if you have it, or let the generator compute for a path.
   */
  addEvidenceItem(item) {
    const ev = {
      id: item.id || `EVID-${String(this.evidenceItems.length + 1).padStart(3, '0')}`,
      description: item.description || 'Untitled evidence item',
      sourcePath: item.sourcePath || item.path || 'not specified',
      hash: item.hash || 'pending-computation',
      hashAlgorithm: item.hashAlgorithm || 'SHA-256',
      collectionDate: item.collectionDate || new Date().toISOString(),
      collectionMethod: item.collectionMethod || 'User-provided / secure export',
      storageLocation: item.storageLocation || 'Original drive + this evidence log package',
      transferredTo: item.transferredTo || 'Retained by owner (Harvey L. Miller Jr.)',
      verificationStatus: item.verificationStatus || 'Hash recorded at time of log generation',
      notes: item.notes || ''
    };
    this.evidenceItems.push(ev);
    return ev;
  }

  /**
   * Compute SHA-256 for a file and add as evidence item.
   * Warning: slow for very large files or deep directories. Use for key files only.
   */
  addFileWithHash(filePath, description = '') {
    try {
      if (!fs.existsSync(filePath)) {
        return this.addEvidenceItem({ description: description || filePath, sourcePath: filePath, notes: 'File not found at generation time' });
      }
      const hash = this._computeFileHash(filePath);
      return this.addEvidenceItem({
        description: description || path.basename(filePath),
        sourcePath: filePath,
        hash: 'sha256:' + hash,
        collectionMethod: 'Direct file hash at time of evidence log generation',
        notes: `Size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`
      });
    } catch (e) {
      return this.addEvidenceItem({ description, sourcePath: filePath, notes: 'Hash computation failed: ' + e.message });
    }
  }

  /**
   * Add an IP address to the evidence log with public passive reconnaissance.
   * This is for documenting IPs you have legitimate reason to record (e.g. from your own server logs, API access, etc.)
   * as part of evidence preservation (e.g. post-agency contact).
   *
   * It runs local tools (whois, dig) + basic public info. No active scanning or illegal access.
   * "Reverse trace" here means reverse DNS + ownership lookup, not FBI-level attribution.
   */
  addIP(ip, context = '') {
    if (!ip || typeof ip !== 'string') {
      return this.addEvidenceItem({ description: 'Invalid IP', notes: 'Provided: ' + ip });
    }

    const evId = `EVID-IP-${String(this.evidenceItems.length + 1).padStart(3, '0')}`;
    let intel = {
      ip: ip.trim(),
      reverseDNS: 'not resolved',
      whois: 'not retrieved',
      geo: 'not available',
      org: 'unknown',
      notes: context || 'Documented for evidence purposes'
    };

    // Passive lookups using available macOS tools
    try {
      // Reverse DNS (PTR)
      const reverseOut = execSync(`dig -x ${ip} +short 2>/dev/null || nslookup ${ip} 2>/dev/null | grep -i 'name =' | head -1`, { encoding: 'utf8', timeout: 8000 });
      if (reverseOut && reverseOut.trim()) {
        intel.reverseDNS = reverseOut.trim().replace(/^.*=\s*/, '').replace(/\.$/, '');
      }
    } catch (e) { /* ignore */ }

    try {
      // WHOIS for owner / org info
      const whoisOut = execSync(`whois ${ip} 2>/dev/null | head -50`, { encoding: 'utf8', timeout: 10000 });
      if (whoisOut) {
        const orgMatch = whoisOut.match(/OrgName:\s*(.+)/i) || whoisOut.match(/Organization:\s*(.+)/i) || whoisOut.match(/owner:\s*(.+)/i);
        const netName = whoisOut.match(/NetName:\s*(.+)/i) || whoisOut.match(/netname:\s*(.+)/i);
        intel.org = (orgMatch ? orgMatch[1] : netName ? netName[1] : 'see full whois').trim();
        intel.whois = whoisOut.split('\n').slice(0, 15).join('\n').trim() + '\n... (truncated)';
      }
    } catch (e) { /* ignore */ }

    // Simple geo note (user can enhance with paid DB later)
    intel.geo = 'Use ipinfo.io / MaxMind for city-level (public tier available). Local tools give ASN/org above.';

    const item = this.addEvidenceItem({
      id: evId,
      description: `IP Address: ${ip} ${intel.reverseDNS !== 'not resolved' ? '(' + intel.reverseDNS + ')' : ''}`,
      sourcePath: 'Network log / API access / system event',
      hash: 'N/A (IP intel, not file)',
      collectionMethod: 'Passive public lookup (dig + whois) at time of evidence log generation',
      storageLocation: 'This evidence log + original source logs on secure drive',
      notes: `Reverse: ${intel.reverseDNS} | Org: ${intel.org} | Context: ${intel.notes}`
    });

    // Also store detailed intel for the report
    item.ipIntel = intel;

    this.addChainEntry({
      action: `IP DOCUMENTED: ${ip}`,
      notes: `Reverse DNS: ${intel.reverseDNS}, Org: ${intel.org}. ${context}`
    });

    return item;
  }

  /**
   * Convenience: Run a basic traceroute for an IP and attach to evidence.
   */
  addTraceroute(target, context = '') {
    try {
      const trace = execSync(`traceroute -m 15 -w 2 ${target} 2>/dev/null | head -20`, { encoding: 'utf8', timeout: 30000 });
      return this.addEvidenceItem({
        description: `Traceroute to ${target}`,
        sourcePath: 'Live network diagnostic',
        hash: 'N/A',
        collectionMethod: 'traceroute command during evidence collection',
        notes: context + '\n' + trace
      });
    } catch (e) {
      return this.addEvidenceItem({ description: `Traceroute to ${target} (failed)`, notes: e.message });
    }
  }

  _computeFileHash(filePath) {
    const hash = crypto.createHash('sha256');
    const data = fs.readFileSync(filePath);
    hash.update(data);
    return hash.digest('hex');
  }

  addChainEntry(entry) {
    this.chainOfCustody.push({
      timestamp: entry.timestamp || new Date().toISOString(),
      action: entry.action || 'DOCUMENTED',
      by: entry.by || this.collector,
      location: entry.location || 'Secure workstation',
      notes: entry.notes || ''
    });
  }

  addNote(note) {
    this.notes.push({ timestamp: new Date().toISOString(), text: note });
  }

  /**
   * Finalize the log: compute overall integrity hash of the structured data.
   */
  finalize() {
    const payload = JSON.stringify({
      logId: this.logId,
      createdAt: this.createdAt,
      collector: this.collector,
      purpose: this.purpose,
      drives: this.drives,
      evidenceItems: this.evidenceItems,
      chainOfCustody: this.chainOfCustody,
      referencedContacts: this.referencedContacts,
      notes: this.notes
    }, null, 2);

    this.integrityHash = crypto.createHash('sha256').update(payload).digest('hex');
    this.addChainEntry({
      action: 'LOG FINALIZED & HASHED',
      by: this.collector,
      notes: `Log integrity SHA-256: ${this.integrityHash}`
    });
    return this.integrityHash;
  }

  /**
   * Generate the full report object (ready for JSON or HTML rendering).
   */
  generateReport() {
    if (!this.integrityHash) this.finalize();

    return {
      logId: this.logId,
      createdAt: this.createdAt,
      collector: this.collector,
      purpose: this.purpose,
      referencedContacts: this.referencedContacts,
      drives: this.drives,
      evidenceItems: this.evidenceItems,
      chainOfCustody: this.chainOfCustody,
      notes: this.notes,
      integrity: {
        algorithm: 'SHA-256',
        hash: this.integrityHash,
        verification: 'Re-compute SHA-256 over the JSON payload (excluding this integrity section) to verify.'
      },
      legalNote: 'This document is created as a good-faith evidence preservation log. It is not a substitute for professional legal or forensic advice. Hashes provide integrity verification for the listed items at the time of generation.'
    };
  }

  /**
   * Write the log to disk (JSON + pretty HTML report).
   * Returns the paths written.
   */
  async writeLogFiles(baseFilename = 'evidence-log') {
    const report = this.generateReport();
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dir = path.join(__dirname, '../../data/evidence-logs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const jsonPath = path.join(dir, `${baseFilename}-${dateStr}.json`);
    const htmlPath = path.join(dir, `${baseFilename}-${dateStr}.html`);

    // Write JSON (the canonical verifiable version)
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Write a human-readable HTML report
    const html = this._renderHTMLReport(report);
    fs.writeFileSync(htmlPath, html);

    // Also write a simple text summary
    const txtPath = path.join(dir, `${baseFilename}-${dateStr}.txt`);
    fs.writeFileSync(txtPath, this._renderTextSummary(report));

    return { json: jsonPath, html: htmlPath, txt: txtPath, integrityHash: this.integrityHash };
  }

  _renderHTMLReport(report) {
    const escape = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Evidence Log ${escape(report.logId)}</title>
<style>body{font-family:monospace, sans-serif; background:#0a0a0a; color:#ddd; padding:20px; line-height:1.4}
h1,h2{color:#d4a03c} table{border-collapse:collapse; width:100%; margin:12px 0} th,td{border:1px solid #444; padding:6px; text-align:left} th{background:#1a1a1a}
pre{background:#111; padding:10px; overflow:auto} .hash{font-family:monospace; word-break:break-all; font-size:0.85em}
.note{background:#1f1a0a; padding:8px; border-left:4px solid #d4a03c; margin:8px 0}</style></head>
<body>
<h1>🛡️ EVIDENCE PRESERVATION & CHAIN OF CUSTODY LOG</h1>
<p><strong>Log ID:</strong> ${escape(report.logId)}<br>
<strong>Generated:</strong> ${escape(report.createdAt)}<br>
<strong>Collector:</strong> ${escape(report.collector)}<br>
<strong>Purpose:</strong> ${escape(report.purpose)}</p>

<h2>Referenced Sensitive Contacts</h2>
${report.referencedContacts.length ? report.referencedContacts.map(c => `<div class="note">📞 ${escape(c.source)} — ${escape(c.timestamp)}<br>${escape(c.details)}</div>`).join('') : '<p>None recorded.</p>'}

<h2>Drives Inventoried</h2>
<table><tr><th>ID</th><th>Mount</th><th>Volume</th><th>Size / Used / Avail</th><th>FS / UUID</th></tr>
${report.drives.map(d => `<tr><td>${escape(d.id)}</td><td>${escape(d.mountPoint)}</td><td>${escape(d.volumeName)}</td><td>${escape(d.size)} / ${escape(d.used)} / ${escape(d.avail)}</td><td>${escape(d.filesystem)}<br><span class="hash">${escape(d.serialOrUUID)}</span></td></tr>`).join('')}
</table>

<h2>Evidence Items</h2>
${report.evidenceItems.length ? report.evidenceItems.map(item => `
<div><strong>${escape(item.id)}</strong> — ${escape(item.description)}<br>
Path: <code>${escape(item.sourcePath)}</code><br>
Hash (${escape(item.hashAlgorithm)}): <span class="hash">${escape(item.hash)}</span><br>
Collected: ${escape(item.collectionDate)} via ${escape(item.collectionMethod)}<br>
Storage: ${escape(item.storageLocation)} | Transferred: ${escape(item.transferredTo)}
</div><hr>`).join('') : '<p>No individual items added yet. Add key files/catalogs using addEvidenceItem().</p>'}

<h2>Chain of Custody</h2>
<ol>${report.chainOfCustody.map(c => `<li><strong>${escape(c.action)}</strong> by ${escape(c.by)} @ ${escape(c.timestamp)}<br>${escape(c.notes || '')} (${escape(c.location)})</li>`).join('')}</ol>

<h2>Log Integrity</h2>
<p>Algorithm: ${escape(report.integrity.algorithm)}<br>
Hash: <span class="hash">${escape(report.integrity.hash)}</span><br>
To verify: Re-compute SHA-256 of the corresponding .json file contents (excluding the integrity section) and compare.</p>

<h2>Notes</h2>
${report.notes.map(n => `<div class="note">${escape(n.text)} <small>(${escape(n.timestamp)})</small></div>`).join('')}

<p style="font-size:0.8em; color:#666; margin-top:40px;">This is a good-faith preservation log. Hashes document content at time of generation. Consult legal counsel for official use. Generated by GOAT Royalty security tools.</p>
</body></html>`;
  }

  _renderTextSummary(report) {
    return `EVIDENCE PRESERVATION LOG
Log ID: ${report.logId}
Date: ${report.createdAt}
Collector: ${report.collector}
Purpose: ${report.purpose}

DRIVES:
${report.drives.map(d => `- ${d.id}: ${d.mountPoint} (${d.volumeName}) ${d.size} ${d.filesystem}`).join('\n')}

KEY EVIDENCE ITEMS:
${report.evidenceItems.map(i => `- ${i.id}: ${i.description} | ${i.hash}`).join('\n') || '(none added yet)'}

INTEGRITY HASH (SHA-256 of log): ${report.integrity.hash}

See the .json file for full machine-readable details and the .html for printable version.
`;
  }
}

module.exports = { EvidenceLog };
