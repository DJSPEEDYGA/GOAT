# Oscar GOAT and Anigo Server Ops

Updated: 2026-06-21

## Apps

- GOAT Royalty public app: http://goat.72.61.193.184.nip.io/
- GOAT Royalty server root: `/var/www/html`
- GOAT nginx config: `/etc/nginx/sites-available/goat-royalty`
- Anigo Alley public app: https://anigoalley.com/
- Anigo Alley server app: `127.0.0.1:3100`
- Anigo nginx active config: `/etc/nginx/sites-enabled/anigoalley.conf`
- Crypto Casino standalone root: `/srv/crypto-casino`
- Crypto Casino public app: http://casino.72.61.193.184.nip.io/
- Secret VIP casino route on GOAT: `/royalty-vip-622501560fe0e185/`
- Secret VIP casino route on Anigo: `/royalty-vip-622501560fe0e185/`

## Oscar Tool Bridges

- Oscar UI/service on the VPS: `127.0.0.1:3333`
- Public GOAT bridge to Oscar: `http://goat.72.61.193.184.nip.io/api/oscar/`
- GOAT intel service on the VPS: `127.0.0.1:5500`
- Public GOAT bridge to intel tools: `http://goat.72.61.193.184.nip.io/api/intel/`

## Maintenance Checks

Run these on the VPS as root:

```sh
nginx -t
systemctl reload nginx
curl -I http://goat.72.61.193.184.nip.io/
curl -I http://goat.72.61.193.184.nip.io/health
curl -I http://casino.72.61.193.184.nip.io/
curl -I https://anigoalley.com/
curl -I http://goat.72.61.193.184.nip.io/api/oscar/
curl -I http://goat.72.61.193.184.nip.io/api/intel/
```

## Security Rules

- Keep the VIP route unlinked from public navigation.
- Keep `X-Robots-Tag: noindex, nofollow, noarchive` on VIP casino locations.
- Do not publish SSH keys, API tokens, `.env` files, wallet seeds, or database URLs in public web roots.
- Make config backups before nginx edits: `/root/nginx-backups/YYYYMMDD-HHMMSS/`.
- Validate nginx before reload and verify each public URL after reload.
- If GOAT returns 404 at the root, confirm nginx still serves `/var/www/html` and has `server_name goat.72.61.193.184.nip.io`.
- If Anigo stops loading, confirm `127.0.0.1:3100` is listening before changing nginx.
