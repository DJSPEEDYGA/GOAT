# 🐐⚡ GOAT Royalty App — Quick Deploy Commands
## Paste these DIRECTLY into each Hostinger VPS Web Terminal

---

## 🔥 SERVER 1: KVM2 PRIMARY (72.61.193.184)

**Paste this entire block into the KVM2 terminal:**

```bash
cd ~ && \
([ -d GOAT-Royalty-App2 ] && cd GOAT-Royalty-App2 && git fetch origin GOAT-APP && git reset --hard origin/GOAT-APP || git clone -b GOAT-APP https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git && cd GOAT-Royalty-App2) && \
cd ~/GOAT-Royalty-App2 && \
npm install --legacy-peer-deps && \
npm run build && \
(command -v pm2 >/dev/null || npm install -g pm2) && \
pm2 delete goat-app 2>/dev/null; \
pm2 start npm --name goat-app -- start -- -p 3000 && \
pm2 save && \
echo "✅ KVM2 PRIMARY DEPLOYED! → http://72.61.193.184:3000"
```

---

## 🔥 SERVER 2: KVM8 BACKUP (93.127.214.171)

**Paste this entire block into the KVM8 terminal:**

```bash
cd ~ && \
([ -d GOAT-Royalty-App2 ] && cd GOAT-Royalty-App2 && git fetch origin GOAT-APP && git reset --hard origin/GOAT-APP || git clone -b GOAT-APP https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git && cd GOAT-Royalty-App2) && \
cd ~/GOAT-Royalty-App2 && \
npm install --legacy-peer-deps && \
npm run build && \
(command -v pm2 >/dev/null || npm install -g pm2) && \
pm2 delete goat-app 2>/dev/null; \
pm2 start npm --name goat-app -- start -- -p 3000 && \
pm2 save && \
echo "✅ KVM8 BACKUP DEPLOYED! → http://93.127.214.171:3000"
```

---

## ⚠️ FIRST-TIME SETUP (if Node.js/PM2 not installed yet)

Run this FIRST on a fresh server before the deploy commands above:

```bash
apt update -y && apt install -y curl git nginx build-essential && \
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
apt install -y nodejs && \
npm install -g pm2 && \
pm2 startup systemd && \
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 3000/tcp && ufw --force enable && \
echo "✅ Server ready for GOAT deployment!"
```

---

## 📋 After Deploy — Useful Commands

```bash
pm2 status                    # Check if app is running
pm2 logs goat-app             # View live logs
pm2 restart goat-app          # Restart the app
pm2 monit                     # Monitor CPU/RAM
curl http://localhost:3000    # Test locally
```

## 🔄 Quick Re-deploy (after pushing new code to GitHub)

```bash
cd ~/GOAT-Royalty-App2 && git pull origin GOAT-APP && npm install --legacy-peer-deps && npm run build && pm2 restart goat-app
```

---

⚠️ **WARNING**: KVM8 (93.127.214.171) expires **2026-03-20** — RENEW IMMEDIATELY!

🐐 GOAT Royalty × SuperNinja AI × MoneyPenny