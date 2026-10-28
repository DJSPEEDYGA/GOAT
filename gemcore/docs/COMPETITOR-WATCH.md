# Competitor Watch

GemCore's staff dashboard displays meaningful official PSA, TAG, Beckett, and CGC announcements about grading technology, authentication, inspection, evidence reports, and pricing. It keeps announcement dates separate from effective dates and the first time a page change was observed. Each entry includes a four-company comparison and practical GemCore improvements.

## Delivery and ownership

The ChatGPT task **GemCore competitor watch** performs daily research and alerts the owner only when it verifies a meaningful change. It also maintains the public research feed at `gemcore/config/competitor-feed.json` on the dedicated `gemcore-competitor-feed` branch of `DJSPEEDYGA/GOAT`.

The GemCore server retrieves that one fixed feed, validates it, and caches the last good result in its persistent data directory. A dashboard refresh retrieves the current feed; it does not trigger a fresh web-research run. The interface distinguishes research coverage from feed delivery health. An empty feed before the first research check is explicitly labelled as such.

The feed branch is public. Store only public-source research and recommendations based on public GemCore code. Never include private conversations, studio details, credentials, customer information, unpublished business strategy, or internal deployment addresses. Sensitive recommendations belong in the private ChatGPT alert.

## Research rules

- Monitor official company announcements, help pages, and service/fee pages. Use third-party coverage only to discover official sources.
- Treat company accuracy and performance claims as claims unless independently substantiated. A help-page edit date is not a product launch date.
- Compare equivalent service tiers, currencies, regions, order minimums, membership discounts, declared-value limits, turnaround estimates, and report/subgrade inclusions.
- Preserve existing entries and deduplicate announcements. Do not invent an old price or assume an undated page represents a new release.
- Retain source failures in per-company coverage. Failed access must not become a successful “no change” check.
- Monitoring begins October 28, 2026. Earlier capabilities form the baseline rather than new alerts.
- Keep competitor news and market pricing separate from GemCore's condition-grade calculation, authentication decision, and human QC gates.

## Local verification

From `gemcore/`, run `npm ci`, then `npm test`. Start the app with `npm start`, open the existing staff dashboard, and choose **Competitor Watch**. A direct link is `/#competitors`.

The research task and the app are separate services: research continues when the studio computer is offline. The GemCore dashboard needs its server running and this code deployed to receive the feed.

## Runtime configuration

- `GEMCORE_DATA_DIR`: existing persistent data location; the validated cache is `competitor-watch.json`.
- `GEMCORE_WATCH_FEED_URL`: omitted by default to use the fixed public feed. Set to `off` to disable remote retrieval. Other URLs are rejected; the server is not an arbitrary URL proxy.
- `GEMCORE_STAFF_KEY`: existing staff access control for the dashboard API. Configure it on shared installations.
- `GEMCORE_WATCH_INGEST_KEY`: optional separate credential for `POST /api/competitor-watch/import`, supplied in `x-watch-ingest-key`. Import is disabled when this variable is unset. The daily GitHub feed workflow does not need this credential.

The server checks on startup and on dashboard requests, at most once every 15 minutes. Requests time out after eight seconds; redirects are refused, and responses are limited to 1 MiB. A failed or older feed never replaces newer validated data. Import validates the same schema and writes atomically.

The schema is implemented in `packages/competitor-watch/index.js`. The shared file contains `schemaVersion`, `monitoring`, `entries`, and optional `baselines`; `delivery` is derived by the server. Up to 500 announcements and 40 public factual baselines (20 key/value facts each) are supported. Baselines support before/after comparisons for otherwise undated pricing or service pages.

Preserve stable entry IDs when correcting titles or dates: use `psa-`, `tag-`, `beckett-`, or `cgc-`, followed by an alphanumeric character and lowercase letters, digits, hyphens or underscores, up to 96 characters total. Corrections replace the same entry and preserve its earliest observation. Research more than 48 hours old is visibly overdue even when the download itself succeeds.

## Release status

This change prepares the dashboard integration. A GitHub commit or successful local test does not establish that the studio or Ubuntu installation has been updated. Verify the intended host, current checkout, persistent data path, service configuration, and staff authentication before deployment. Follow the repository's production approval requirement.
