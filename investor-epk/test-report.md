# Test Report — Gated Living EPK with Oscar/GOAT merge

**Build:** Harvey's authentic multi-page Living EPK served behind the existing
password + TOTP 2FA + IP-audit gate, with the Oscar/Raspy product breakdown,
Anigo Alley, app catalog, and seed-deck documents merged in using his own
design tokens (no custom redesign).

**Environment:** local server `127.0.0.1:4610` (`REQUIRE_IP_APPROVAL=false` for
the local run only), investor `demo@goat.com`, TOTP via authenticator.

## Results — all passed

| # | Check | Result |
|---|-------|--------|
| 1 | Unauthenticated `/epk/*` page redirects to `/login` | PASS (302 → /login) |
| 2 | Password step then TOTP 2FA step gate access | PASS |
| 3 | `/portal` redirects to `goat-investor-living-epk.html` | PASS (302) |
| 4 | Authentic EPK renders (Royalty Recovery Data hero, gold metrics) | PASS |
| 5 | EPK audio (`old-school-chevy.mp3`) plays | PASS |
| 6 | Product Map: 15 Oscar/GOAT surfaces (Anigo Alley, Halito, Bourré…) | PASS |
| 7 | Data Room: 14 deck PDFs + product breakdown appendix | PASS |
| 8 | A deck PDF (Use of Funds) opens with chart + table | PASS |
| 9 | Money Breakdown page renders revenue lanes / ROI / tables | PASS |
| 10 | Asset 404 audit on main pages (images, media, data, js, pdfs) | PASS (0 non-200) |
| 11 | `npm run lint` (node --check server + src) | PASS |
| 12 | Missing sibling pages route back to main EPK (no dead-end) | PASS (302) |

## Notes / honest gaps

Three pages linked from the EPK nav/source cards were **not present in the
supplied bundle** and currently route back to the main Living EPK:
`goat-casino.html`, `goat-server-field-hub.html`, `protools-books-library.html`.
Send those HTML files and they drop straight into `/public/epk/`.
