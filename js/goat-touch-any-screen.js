(function () {
  const macros = [
    ["Transport", "Play / Stop", "Owner-approved DAW shortcut lane"],
    ["Transport", "Record Arm", "Confirm track and input first"],
    ["UA Apollo", "Mic Chain Check", "Preamp, cue, inserts, headphone"],
    ["UA Apollo", "Cue Mix Check", "Headphone mix and monitor path"],
    ["Slate VMR", "Vocal Chain", "VMR-style vocal chain note"],
    ["Slate VMR", "Drum Bus", "Drum bus chain note"],
    ["GOAT", "Open Beat Lab", "Launch beat tools"],
    ["GOAT", "Open Wooh Training", "Training page"],
    ["AGENT-007", "Session Log", "Save decision notes"],
    ["Oscar", "Ops Brain", "Open Oscar if server route is live"],
    ["Halito", "Room Check", "Open field chat"],
    ["Safety", "Owner Approval", "Pause before computer control"]
  ];

  function nowStamp() {
    return new Date().toLocaleString([], {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function log(text) {
    const box = document.querySelector("[data-touch-log]");
    if (!box) return;
    const line = `[${nowStamp()}] ${text}`;
    box.value = box.value ? `${line}\n${box.value}` : line;
    localStorage.setItem("goatTouchAnyScreenLog", box.value);
  }

  function setStatus(text) {
    const status = document.querySelector("[data-touch-status]");
    if (status) status.textContent = text;
  }

  function action(label, note) {
    if (navigator.vibrate) navigator.vibrate(18);
    log(`${label} - ${note}`);
    setStatus(`${label}: queued as a safe macro note`);
  }

  function openLocal(url, label) {
    action(label, `opening ${url}`);
    window.location.href = url;
  }

  function renderMacros() {
    const grid = document.querySelector("[data-touch-macros]");
    if (!grid) return;
    grid.innerHTML = macros.map(([lane, label, note], index) => `
      <button class="goat-touch-macro" type="button" data-macro-index="${index}">
        ${label}
        <small>${lane} · ${note}</small>
      </button>
    `).join("");
    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-macro-index]");
      if (!button) return;
      const [lane, label, note] = macros[Number(button.dataset.macroIndex)];
      action(`${lane}: ${label}`, note);
    });
  }

  function setup() {
    renderMacros();
    const logBox = document.querySelector("[data-touch-log]");
    if (logBox) {
      logBox.value = localStorage.getItem("goatTouchAnyScreenLog") || "";
      logBox.addEventListener("input", () => {
        localStorage.setItem("goatTouchAnyScreenLog", logBox.value);
      });
    }

    document.querySelectorAll("[data-open-local]").forEach((button) => {
      button.addEventListener("click", () => openLocal(button.dataset.openLocal, button.textContent.trim()));
    });

    const fullscreen = document.querySelector("[data-touch-fullscreen]");
    if (fullscreen) {
      fullscreen.addEventListener("click", async () => {
        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            action("Fullscreen", "touch surface expanded");
          } else {
            await document.exitFullscreen();
            action("Fullscreen", "touch surface restored");
          }
        } catch (error) {
          setStatus("Fullscreen blocked by browser until tapped again.");
        }
      });
    }

    const clear = document.querySelector("[data-touch-clear]");
    if (clear) {
      clear.addEventListener("click", () => {
        localStorage.removeItem("goatTouchAnyScreenLog");
        if (logBox) logBox.value = "";
        setStatus("Touch log cleared locally.");
      });
    }

    setStatus("GOAT Touch Any Screen ready.");
  }

  document.addEventListener("DOMContentLoaded", setup);
})();
