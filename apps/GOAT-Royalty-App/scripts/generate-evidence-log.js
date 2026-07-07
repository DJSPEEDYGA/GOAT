#!/usr/bin/env node
/**
 * Quick runner for Evidence Log generation.
 * Run from project root or with node:
 *   node scripts/generate-evidence-log.js
 *
 * Or specify drives:
 *   node scripts/generate-evidence-log.js /Volumes/WFHD /Volumes/AGENT2
 *
 * This will create dated .json + .html + .txt files in data/evidence-logs/
 * The log is designed so you can hand the digital copies to lawyers/FBI
 * while keeping your physical hard drives (with full documented chain of custody).
 */

const { HealthMonitor } = require('../web-app/lib/monitoring/health-check'); // re-uses the singleton

async function main() {
  const args = process.argv.slice(2);
  const targetDrives = [];
  const ipsToLog = [];

  for (const arg of args) {
    if (/^\d+\.\d+\.\d+\.\d+$/.test(arg) || arg.includes(':')) {
      ipsToLog.push(arg);
    } else if (arg.startsWith('/')) {
      targetDrives.push(arg);
    }
  }

  if (targetDrives.length === 0) {
    targetDrives.push('/Volumes/WFHD', '/Volumes/AGENT2', '/Volumes/AGENT3'); // defaults from your system
  }

  console.log('🛡️  EVIDENCE LOG GENERATOR');
  console.log('   Post-FBI contact / hard drive protection mode\n');

  const { EvidenceLog } = require('../web-app/lib/monitoring/evidence-log');
  const health = require('../web-app/lib/monitoring/health-check');

  try {
    // Start with the drive-focused generation (re-uses FBI contact)
    const result = await health.generateEvidenceLog(targetDrives);

    // Now add any IPs you passed on the command line (or hardcode ones from your logs)
    if (ipsToLog.length > 0) {
      const evLog = new EvidenceLog();
      // Re-attach the recent FBI context if available
      if (health.sensitiveContacts && health.sensitiveContacts[0]) {
        evLog.addReferencedContact(health.sensitiveContacts[0]);
      }
      ipsToLog.forEach(ip => evLog.addIP(ip, 'Documented from user-provided context / logs (post-FBI contact)'));
      const ipFiles = await evLog.writeLogFiles('ip-forensics-' + Date.now());
      console.log('\nAdditional IP forensics log written:', ipFiles.json);
    }

    console.log('\n✅ EVIDENCE LOG CREATED SUCCESSFULLY');
    console.log('JSON (canonical/verifiable):', result.json);
    console.log('HTML (printable report):   ', result.html);
    console.log('TXT (quick summary):       ', result.txt);
    console.log('\nIntegrity SHA-256:', result.integrityHash);
    console.log('\n' + result.message);

    console.log('\nIP / Reverse Trace capability:');
    console.log('  - Public passive only: whois (owner/org), reverse DNS (dig -x), basic path info.');
    console.log('  - Not FBI-level (no ISP subscriber data without legal process).');
    console.log('  - Usage: node scripts/generate-evidence-log.js 8.8.8.8 1.1.1.1 /Volumes/WFHD');
    console.log('  - Or call evLog.addIP("x.x.x.x", "from my server logs") in code.');

    console.log('\nNext steps you can tell your lawyer/FBI contact:');
    console.log('  1. Here is the complete drive inventory + key asset hashes.');
    console.log('  2. Original media remains in my possession.');
    console.log('  3. Full chain-of-custody is documented and timestamped.');
    console.log('  4. I can provide additional file-level hashes, IP logs, or images on request.');
  } catch (err) {
    console.error('Failed to generate evidence log:', err);
    process.exit(1);
  }
}

main();