'use strict';
/* Staff intelligence: show verified records, never imply a browser reload
   performs a new source review. Research and delivery health are separate. */
window.GemCoreWatch = (() => {
  const companies = ['PSA', 'TAG', 'Beckett', 'CGC'];
  const categories = {
    'grading-technology': 'Grading technology', authentication: 'Authentication',
    inspection: 'Inspection', 'evidence-report': 'Evidence reports', pricing: 'Pricing',
  };
  const officialDomains = ['psacard.com', 'taggrading.com', 'beckett.com', 'cgccards.com'];
  const escape = value => String(value ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function officialUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
        officialDomains.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain))
        ? url.href : null;
    } catch { return null; }
  }
  function sourceLink(url, label) {
    const safe = officialUrl(url);
    return safe ? `<a href="${escape(safe)}" target="_blank" rel="noopener noreferrer">${escape(label)} <span aria-hidden="true">↗</span></a>`
      : `<span class="muted">${escape(label)} — source unavailable</span>`;
  }
  function date(value, fallback = 'Not stated') {
    if (!value) return fallback;
    // Preserve calendar dates: a UTC timestamp must not shift the announcement day.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return escape(value);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback : escape(parsed.toLocaleString());
  }
  function compare(entry) {
    return `<div class="watch-table-wrap" tabindex="0" role="region" aria-label="Competitor comparison">
      <table><caption>Relevant competitor comparison</caption><thead><tr><th scope="col">Company</th><th scope="col">Capability or equivalent service</th><th scope="col">Evidence</th></tr></thead>
        <tbody>${companies.map(company => {
          const item = (entry.comparisons || []).find(value => value.company === company);
          return `<tr><th scope="row">${company}</th><td>${escape(item?.summary || 'Not verified for this announcement.')}</td>
            <td>${item?.status === 'documented' ? sourceLink(item.sourceUrl, 'Official source') : '<span class="muted">Not verified</span>'}</td></tr>`;
        }).join('')}</tbody></table></div>`;
  }
  function opportunities(entry) {
    const items = [...(entry.opportunities || [])].sort((a, b) => a.priority - b.priority);
    return `<section class="watch-opportunities" aria-label="GemCore opportunities"><h3>Opportunities for GemCore</h3>
      <ol>${items.map(item => `<li><span class="watch-priority">Priority ${escape(item.priority)}</span>
        <h4>${escape(item.action)}</h4><p>${escape(item.rationale)}</p>
        <p><b>Next step:</b> ${escape(item.nextStep)}</p>
        ${item.impact ? `<p><b>Impact:</b> ${escape(item.impact)}</p>` : ''}
        ${item.effort ? `<p><b>Effort:</b> ${escape(item.effort)}</p>` : ''}
        ${item.dependencies ? `<p><b>Dependencies:</b> ${escape(item.dependencies)}</p>` : ''}
        ${item.validation ? `<p><b>Validation:</b> ${escape(item.validation)}</p>` : ''}
      </li>`).join('')}</ol></section>`;
  }
  function pricing(entry) {
    if (!entry.pricing) return '';
    const p = entry.pricing;
    const amount = value => value == null ? 'Not documented' : escape(value);
    return `<section class="watch-pricing"><h3>Pricing context</h3><dl class="watch-dates">
      <div><dt>Service tier</dt><dd>${escape(p.tier)}</dd></div>
      <div><dt>Region / currency</dt><dd>${escape(p.region)} / ${escape(p.currency)}</dd></div>
      <div><dt>Previous price</dt><dd>${amount(p.before)}</dd></div>
      <div><dt>New price</dt><dd>${amount(p.after)}</dd></div></dl>
      <p class="muted">${escape(p.conditions)}</p></section>`;
  }
  function card(entry) {
    return `<article class="panel watch-card">
      <div class="watch-card-meta"><span class="badge">${escape(entry.company)}</span>
        <span class="watch-category">${escape(categories[entry.category] || entry.category)}</span>
        <span class="badge ${entry.significance === 'high' ? 'warn' : ''}">${escape(entry.significance)} significance</span></div>
      <h2>${escape(entry.title)}</h2>
      <dl class="watch-dates"><div><dt>Announced</dt><dd>${date(entry.announcementDate)}</dd></div>
        <div><dt>Effective / available</dt><dd>${date(entry.effectiveDate)}</dd></div>
        <div><dt>First observed</dt><dd>${date(entry.firstObservedAt)}</dd></div></dl>
      ${entry.dateNote ? `<p class="watch-note">${escape(entry.dateNote)}</p>` : ''}
      <p class="watch-summary">${escape(entry.summary)}</p>
      <p><b>Why it matters:</b> ${escape(entry.whyMeaningful)}</p>
      <p class="watch-source">${sourceLink(entry.source?.url, entry.source?.title || 'Official announcement')}
        ${entry.source?.claimType === 'verified-page-change' ? ' · Verified page change' : ' · Company announcement'}</p>
      ${pricing(entry)}${compare(entry)}${opportunities(entry)}
    </article>`;
  }
  function researchOverdue(monitor) {
    if (!monitor || monitor.status === 'awaiting-first-check' || !monitor.lastCheckedAt) return false;
    const checkedAt = Date.parse(monitor.lastCheckedAt);
    return Number.isFinite(checkedAt) && Date.now() - checkedAt > 48 * 60 * 60 * 1000;
  }
  function statusPanel(data) {
    const monitor = data.monitoring || {};
    const delivery = data.delivery || {};
    const overdue = researchOverdue(monitor);
    const labels = { 'awaiting-first-check': 'Awaiting first source check', ok: 'Latest source check complete',
      partial: 'Some sources could not be checked', error: 'Source check needs attention' };
    const status = overdue ? 'Source check overdue' : labels[monitor.status] || 'Source check status unavailable';
    const checked = (monitor.checks || []).filter(item => item.status === 'ok').length;
    const deliveryLabel = delivery.status === 'ok' ? 'Feed received' : delivery.status === 'error' ? 'Feed delivery failed' : 'Dashboard delivery not connected';
    return `<section class="panel watch-status" aria-label="Monitoring status">
      <div><div class="watch-label">SOURCE RESEARCH</div><h2>${status}</h2>
        <p class="muted">Last checked: ${date(monitor.lastCheckedAt, 'No verified check yet')}</p>
        ${overdue ? '<p class="watch-error" role="status">The last source check is over 48 hours old. These records may be out of date, even if the feed was just received.</p>' : ''}
        <p>${escape(monitor.message || 'No verified source review has reached this dashboard yet.')}</p></div>
      <div class="watch-delivery"><div class="watch-label">DASHBOARD DELIVERY</div>
        <strong>${deliveryLabel}</strong><p class="muted">Last received: ${date(delivery.lastSuccessAt, 'Not received yet')}</p>
        ${delivery.error ? `<p class="watch-error">${escape(delivery.error)}</p>` : ''}
        ${delivery.status === 'error' && data.entries?.length ? '<p class="muted">Showing the last available feed. It may be out of date.</p>' : ''}</div>
      <div class="watch-checks">${companies.map(company => {
        const check = (monitor.checks || []).find(value => value.company === company);
        const state = check?.status === 'ok' ? 'Checked' : check?.status === 'error' ? 'Check failed' : 'Not checked';
        return `<div><b>${company}</b><span class="${check?.status === 'error' ? 'watch-error' : 'muted'}">${state}</span>
          <small>${date(check?.checkedAt, 'No verified check')}</small>
          ${check?.detail ? `<p>${escape(check.detail)}</p>` : ''}
          ${check?.url ? sourceLink(check.url, 'Source') : ''}</div>`;
      }).join('')}</div>
      <p class="watch-coverage">${checked} of 4 companies checked successfully in the latest recorded review.</p>
    </section>`;
  }
  async function render(root) {
    const host = document.createElement('div');
    host.className = 'page watch-page';
    root.replaceChildren(host);
    let data = null;
    let company = 'all';
    let category = 'all';
    let pending = false;
    let error = '';
    function paint() {
      if (!host.isConnected) return;
      const entries = (data?.entries || []).filter(entry =>
        (company === 'all' || entry.company === company) && (category === 'all' || entry.category === category));
      host.innerHTML = `<div class="eyebrow">GEMCORE • OFFICIAL SOURCE INTELLIGENCE</div>
        <div class="watch-heading"><div><h1>Competitor Watch</h1>
          <p class="muted">Meaningful changes from PSA, TAG, Beckett and CGC — with opportunities for GemCore.</p></div>
          <button type="button" class="primary" id="watchReload" ${pending ? 'disabled' : ''}>${pending ? 'Loading feed…' : 'Reload feed'}</button></div>
        <p class="watch-refresh-note muted">Reload shows the latest delivered records. Source checks run separately.</p>
        ${error ? `<div role="alert" class="panel watch-error-panel"><b>Could not load the feed</b><p>${escape(error)}</p>${data ? '<p>Previously loaded records remain below.</p>' : ''}</div>` : ''}
        ${data ? statusPanel(data) : `<div class="panel watch-empty" role="status">${pending ? 'Loading monitoring status…' : 'Monitoring status is unavailable. Use Reload feed to try again.'}</div>`}
        <div class="watch-filters"><label for="watchCompany">Company<select id="watchCompany"><option value="all">All companies</option>${companies.map(value => `<option value="${value}" ${company === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
          <label for="watchCategory">Area<select id="watchCategory"><option value="all">All areas</option>${Object.entries(categories).map(([value, label]) => `<option value="${value}" ${category === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
          <p id="watchCount" class="muted" aria-live="polite">${entries.length} ${entries.length === 1 ? 'announcement' : 'announcements'}</p></div>
        <section class="watch-results" aria-label="Verified announcements">${entries.length ? entries.map(card).join('') : data ? `<div class="panel watch-empty"><h2>${data.entries.length ? 'No announcements match these filters' : 'No verified changes in this feed yet'}</h2>
          <p class="muted">${data.entries.length ? 'Choose another company or area to see the delivered records.' : researchOverdue(data.monitoring) ? 'A recent source review is overdue. This empty feed does not establish that nothing has changed.' : data.monitoring?.status === 'ok' ? 'The latest recorded source review found no meaningful new changes.' : 'Await a completed source review before interpreting this as no change.'}</p></div>` : ''}</section>
        <p class="watch-footer muted">Company claims are not independent proof of performance. Compare equivalent service tiers and conditions. Market value remains separate from GemCore grading.</p>`;
      host.querySelector('#watchReload').onclick = load;
      host.querySelector('#watchCompany').onchange = event => { company = event.target.value; paint(); host.querySelector('#watchCompany').focus(); };
      host.querySelector('#watchCategory').onchange = event => { category = event.target.value; paint(); host.querySelector('#watchCategory').focus(); };
    }
    async function load() {
      if (pending) return;
      pending = true; error = ''; paint();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch('/api/competitor-watch', {
          headers: { 'x-staff-key': localStorage.getItem('gemcore.staff') || '' },
          cache: 'no-store', signal: controller.signal,
        });
        if (!response.ok) throw new Error(response.status === 403 ? 'Staff access is required. Check your staff sign-in in Settings.' : 'The dashboard feed is unavailable. Try again later.');
        const next = await response.json();
        if (next.schemaVersion !== 1 || !Array.isArray(next.entries) || !next.monitoring || !next.delivery) throw new Error('The feed format could not be read. Previously loaded records were retained.');
        data = next;
      } catch (cause) {
        error = cause.name === 'AbortError' ? 'The feed request timed out. Try Reload feed again.' : cause.message;
      } finally { clearTimeout(timeout); pending = false; paint(); }
    }
    await load();
  }
  return { render };
})();
