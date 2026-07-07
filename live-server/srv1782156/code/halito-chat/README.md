# Halito Chat

Standalone prototype for a FireChat-style coordination tool.

What works now:

- Installable static web app with service-worker offline caching.
- Local identity and local packet history in browser storage.
- Direct browser-to-browser WebRTC DataChannel links after manual offer/answer exchange.
- Multi-hop message gossip with packet IDs, TTL, dedupe, and visible hop counts.
- Export/import packet bundles for manual relay when live links are unavailable.

What still needs native work:

- Bluetooth LE mesh, Wi-Fi Direct, nearby discovery, and background radio operation require native iOS/Android code.
- Production safety needs real cryptographic identity, end-to-end encryption, forward secrecy, key rotation, abuse controls, disappearing rooms, and traffic analysis defenses.
- Browser WebRTC on a local network may need LAN reachability. This prototype intentionally has no STUN/TURN server so it does not depend on cloud infrastructure.

Run locally:

```sh
node server.js
```

Then open `http://127.0.0.1:4177`.

Phone build:

- Desktop/control room: `http://127.0.0.1:4177/`
- Phone field UI: `http://127.0.0.1:4177/phone.html`
- From another device on the same Wi-Fi/LAN, replace `127.0.0.1` with the host machine IP.

Pair two devices:

1. Device A clicks **Create Offer** and sends the generated signal to Device B.
2. Device B pastes that signal and clicks **Create Answer**.
3. Device B sends the generated answer back to Device A.
4. Device A pastes the answer and clicks **Accept Answer**.

Messages sent by either device are gossiped to every linked peer.
