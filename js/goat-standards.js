(function () {
  "use strict";

  const storageKey = "goatStandardsRegistry";
  const starterRecords = [
    {
      type: "GS1 GTIN",
      title: "GOAT Force Lifetime Membership",
      identifier: "GS1 / GTIN placeholder",
      owner: "Life Imitates Art Inc.",
      status: "Needs assignment",
      notes: "Use for VIP membership product, merch bundle, or shop SKU."
    },
    {
      type: "GS1 Digital Link",
      title: "GOAT Casino Night VIP Pass",
      identifier: "GS1 Digital Link placeholder",
      owner: "Life Imitates Art Inc.",
      status: "Needs assignment",
      notes: "Use for private Casino Night invite, membership landing page, reward proof, or QR pass."
    },
    {
      type: "US ISRC",
      title: "GOAT Royalty Theme Recording",
      identifier: "US-XXX-26-00001",
      owner: "DJ Speedy / Life Imitates Art Inc.",
      status: "Template",
      notes: "Replace with assigned ISRC for the master recording or music video."
    },
    {
      type: "US ISRC",
      title: "Casino Night Soundtrack Drop",
      identifier: "US-XXX-26-00002",
      owner: "DJ Speedy / Life Imitates Art Inc.",
      status: "Template",
      notes: "Use for original music, promo videos, and reward-linked content inside the casino room."
    },
    {
      type: "GS1 GLN",
      title: "GOAT Royalty Casino Operator Entity",
      identifier: "GLN placeholder",
      owner: "Life Imitates Art Inc.",
      status: "Needs assignment",
      notes: "Use to identify legal entity/location in B2B and payment documentation."
    }
  ];

  const $ = (selector) => document.querySelector(selector);

  function loadRecords() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      return Array.isArray(saved) && saved.length ? saved : starterRecords;
    } catch {
      return starterRecords;
    }
  }

  function saveRecords(records) {
    localStorage.setItem(storageKey, JSON.stringify(records));
  }

  let records = loadRecords();

  function tagClass(type) {
    if (/isrc/i.test(type)) return "isrc";
    if (/gln/i.test(type)) return "gln";
    if (/rights/i.test(type)) return "rights";
    return "";
  }

  function renderRecords() {
    const body = $("#registryRows");
    body.innerHTML = "";
    records.forEach((record, index) => {
      const row = document.createElement("div");
      row.className = "registry-row";
      row.innerHTML = `
        <div><span class="tag ${tagClass(record.type)}">${record.type}</span></div>
        <div><strong>${escapeHtml(record.title)}</strong>${escapeHtml(record.notes || "")}</div>
        <div><strong>${escapeHtml(record.identifier)}</strong>${escapeHtml(record.owner || "")}</div>
        <div>
          <strong>${escapeHtml(record.status || "Active")}</strong>
          <button class="btn" type="button" data-remove="${index}">Remove</button>
        </div>
      `;
      body.appendChild(row);
    });

    body.querySelectorAll("[data-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        records.splice(Number(button.dataset.remove), 1);
        saveRecords(records);
        renderRecords();
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function addRecord(event) {
    event.preventDefault();
    const record = {
      type: $("#standardType").value,
      title: $("#assetTitle").value.trim(),
      identifier: $("#standardId").value.trim(),
      owner: $("#rightsOwner").value.trim(),
      status: $("#standardStatus").value,
      notes: $("#standardNotes").value.trim()
    };
    if (!record.title || !record.identifier) return;
    records.unshift(record);
    saveRecords(records);
    event.currentTarget.reset();
    $("#standardStatus").value = "Active";
    renderRecords();
  }

  function exportRegistry() {
    const payload = JSON.stringify(records, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "goat-standards-registry.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#registryForm").addEventListener("submit", addRecord);
    $("#exportRegistry").addEventListener("click", exportRegistry);
    $("#resetRegistry").addEventListener("click", () => {
      records = starterRecords.slice();
      saveRecords(records);
      renderRecords();
    });
    renderRecords();
  });
}());
