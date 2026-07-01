/*
 * GOAT Force Crew — web 3D avatars that idle, walk, and talk.
 *
 * Self-contained: uses the vendored three.js (js/vendor/three.min.js) for the
 * 3D characters and the browser SpeechSynthesis API for the "talk" voice.
 * No build step, no network dependency at runtime — runs on any computer that
 * can open the gated EPK.
 */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.error('[goat-crew] three.js failed to load');
    return;
  }

  // ---- Crew definitions -------------------------------------------------
  // color = suit/body, accent = trim/hair, skin = head tone.
  const CREW = [
    {
      id: 'money-penny',
      name: 'Ms Money Penny',
      role: 'Money Engine · Royalties',
      color: 0xf2c766, accent: 0x8a5a12, skin: 0xd9a06b,
      launch: { label: 'Open Money Engine', href: 'super-goat-royalties.html' },
      line: "I'm Ms Money Penny. I run the money engine — royalties, splits, distribution, and payouts, all local first.",
    },
    {
      id: 'the-goat',
      name: 'The GOAT',
      role: 'Master Brain · Router',
      color: 0x14161c, accent: 0xf2c766, skin: 0xc98d5a,
      launch: { label: 'Open Agents Brain', href: 'agents-brain.html' },
      line: "I am The GOAT. I route every agent, tool, and autopilot across the whole platform.",
    },
    {
      id: 'sir-codex',
      name: 'Sir Codex',
      role: 'Build · Deploy · Ship',
      color: 0x2a6df4, accent: 0xf2c766, skin: 0xdca878,
      launch: { label: 'Open GOAT Apps', href: 'goat-apps.html' },
      line: "Sir Codex here. I build, deploy, and keep the code shipping across every GOAT surface.",
    },
    {
      id: 'ms-vanessa',
      name: 'Ms Vanessa',
      role: 'Compliance · Checks',
      color: 0x7b4bd6, accent: 0xe7d6ff, skin: 0xe0b48a,
      launch: { label: 'Open Cinema Forge', href: 'goat-cinema-forge.html' },
      line: "Ms Vanessa. I handle background checks, compliance, and keep the studio clean and covered.",
    },
    {
      id: 'agent-007',
      name: 'AGENT-007',
      role: 'Security · Local Models',
      color: 0x0b0b0f, accent: 0xd83a3a, skin: 0xbf835a,
      launch: { label: 'Open Virtual World', href: 'goat-virtual-world-rp.html' },
      line: "Agent double-oh-seven. Local models, security ops, and studio control — everything stays on your hardware.",
    },
  ];

  // ---- Scene setup ------------------------------------------------------
  const mount = document.getElementById('crew-stage');
  if (!mount) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080c);
  scene.fog = new THREE.Fog(0x07080c, 9, 20);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 2.2, 6.4);
  camera.lookAt(0, 1.4, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  mount.appendChild(renderer.domElement);

  function resize() {
    const w = mount.clientWidth;
    const h = mount.clientHeight || Math.round(w * 0.62);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffe7b0, 1.1);
  key.position.set(4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf2c766, 0.6);
  rim.position.set(-5, 4, -4);
  scene.add(rim);

  // Floor / stage disc
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 48),
    new THREE.MeshStandardMaterial({ color: 0x11131a, roughness: 0.9, metalness: 0.1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(3.9, 4.2, 48),
    new THREE.MeshBasicMaterial({ color: 0xf2c766, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  scene.add(ring);

  // ---- Avatar builder ---------------------------------------------------
  function mat(color, opts) {
    return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0.2 }, opts || {}));
  }

  function buildAvatar(def) {
    const g = new THREE.Group();
    const bodyMat = mat(def.color);
    const accentMat = mat(def.accent, { metalness: 0.4 });
    const skinMat = mat(def.skin, { metalness: 0.05, roughness: 0.7 });

    // Legs
    const legGeo = new THREE.CapsuleGeometry(0.16, 0.8, 4, 8);
    const legL = new THREE.Mesh(legGeo, bodyMat);
    const legR = new THREE.Mesh(legGeo, bodyMat);
    legL.position.set(-0.2, 0.6, 0);
    legR.position.set(0.2, 0.6, 0);
    [legL, legR].forEach((l) => { l.castShadow = true; g.add(l); });

    // Torso
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.7, 6, 12), bodyMat);
    torso.position.y = 1.55;
    torso.castShadow = true;
    g.add(torso);

    // Chest accent (belt/tie)
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.46), accentMat);
    belt.position.y = 1.2;
    g.add(belt);
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.05), accentMat);
    tie.position.set(0, 1.55, 0.4);
    g.add(tie);

    // Arms (pivot at shoulder so they swing)
    function makeArm(side) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.55, 1.85, 0);
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.7, 4, 8), bodyMat);
      arm.position.y = -0.4;
      arm.castShadow = true;
      pivot.add(arm);
      g.add(pivot);
      return pivot;
    }
    const armL = makeArm(-1);
    const armR = makeArm(1);

    function makeLegPivot(side, leg) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.2, 1.0, 0);
      g.remove(leg);
      leg.position.set(0, -0.4, 0);
      pivot.add(leg);
      g.add(pivot);
      return pivot;
    }
    const legLP = makeLegPivot(-1, legL);
    const legRP = makeLegPivot(1, legR);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 20), skinMat);
    head.position.y = 2.35;
    head.castShadow = true;
    g.add(head);

    // Hair / cap accent
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), accentMat);
    hair.position.y = 2.42;
    g.add(hair);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.045, 10, 10);
    const eyeMat = mat(0x0a0a0a, { metalness: 0, roughness: 0.4 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.12, 2.38, 0.3);
    eyeR.position.set(0.12, 2.38, 0.3);
    g.add(eyeL); g.add(eyeR);

    // Mouth (scales on Y when talking)
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.05), mat(0x5a2020));
    mouth.position.set(0, 2.22, 0.31);
    g.add(mouth);

    g.userData = { armL, armR, legLP, legRP, mouth, head };
    return g;
  }

  // ---- Character state --------------------------------------------------
  let current = null;
  let currentDef = null;
  let mode = 'idle'; // idle | walk | talk
  let talkUntil = 0;
  const clock = new THREE.Clock();

  function showCrew(def) {
    if (current) scene.remove(current);
    current = buildAvatar(def);
    currentDef = def;
    scene.add(current);
    mode = 'idle';
    document.querySelectorAll('[data-crew-id]').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-crew-id') === def.id);
    });
    const nameEl = document.getElementById('crew-name');
    const roleEl = document.getElementById('crew-role');
    const launchEl = document.getElementById('crew-launch');
    if (nameEl) nameEl.textContent = def.name;
    if (roleEl) roleEl.textContent = def.role;
    if (launchEl) { launchEl.textContent = def.launch.label; launchEl.href = def.launch.href; }
  }

  function speak(def) {
    mode = 'talk';
    talkUntil = performance.now() + 6000;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(def.line);
        // Vary pitch/rate per persona for a bit of character.
        const seed = def.id.length;
        u.pitch = 0.8 + (seed % 5) * 0.12;
        u.rate = 0.95 + (seed % 3) * 0.06;
        u.onend = () => { if (mode === 'talk') mode = 'idle'; };
        window.speechSynthesis.speak(u);
      }
    } catch (e) { /* speech optional */ }
  }

  // ---- Animation loop ---------------------------------------------------
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (current) {
      const u = current.userData;
      // slow turntable
      current.rotation.y = Math.sin(t * 0.3) * 0.5;

      if (mode === 'walk') {
        const swing = Math.sin(t * 6) * 0.7;
        u.legLP.rotation.x = swing;
        u.legRP.rotation.x = -swing;
        u.armL.rotation.x = -swing;
        u.armR.rotation.x = swing;
        current.position.y = Math.abs(Math.sin(t * 6)) * 0.08;
        current.rotation.y = Math.sin(t * 0.6) * 0.9; // stroll turning
      } else {
        // idle breathing
        const b = Math.sin(t * 1.8) * 0.05;
        u.legLP.rotation.x *= 0.9;
        u.legRP.rotation.x *= 0.9;
        u.armL.rotation.x = b;
        u.armR.rotation.x = -b;
        current.position.y = Math.sin(t * 1.8) * 0.02;
      }

      if (mode === 'talk' || performance.now() < talkUntil) {
        u.mouth.scale.y = 1 + Math.abs(Math.sin(t * 18)) * 3.2;
        u.head.rotation.z = Math.sin(t * 3) * 0.04;
      } else {
        u.mouth.scale.y += (1 - u.mouth.scale.y) * 0.3;
        u.head.rotation.z *= 0.9;
        if (mode === 'talk' && performance.now() >= talkUntil) mode = 'idle';
      }
    }
    renderer.render(scene, camera);
  }

  // ---- Wire up UI -------------------------------------------------------
  function buildCrewButtons() {
    const bar = document.getElementById('crew-select');
    if (!bar) return;
    CREW.forEach((def) => {
      const b = document.createElement('button');
      b.className = 'crew-chip';
      b.setAttribute('data-crew-id', def.id);
      b.innerHTML = '<span class="dot" style="background:#' +
        def.color.toString(16).padStart(6, '0') + '"></span>' + def.name;
      b.addEventListener('click', () => showCrew(def));
      bar.appendChild(b);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildCrewButtons();
    resize();
    showCrew(CREW[0]);
    animate();

    const walkBtn = document.getElementById('btn-walk');
    const talkBtn = document.getElementById('btn-talk');
    const idleBtn = document.getElementById('btn-idle');
    if (walkBtn) walkBtn.addEventListener('click', () => { mode = 'walk'; });
    if (idleBtn) idleBtn.addEventListener('click', () => { mode = 'idle'; window.speechSynthesis && window.speechSynthesis.cancel(); });
    if (talkBtn) talkBtn.addEventListener('click', () => currentDef && speak(currentDef));
  });

  window.addEventListener('resize', resize);
})();
