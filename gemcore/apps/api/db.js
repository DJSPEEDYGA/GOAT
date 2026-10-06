'use strict';
// SQLite driver shim — prefers the built-in node:sqlite (Node ≥22.13),
// falls back to better-sqlite3 (Node 20, or Node 22 builds where
// node:sqlite still needs --experimental-sqlite). Both expose the same
// exec/prepare().run|get|all surface used by store.js.

function open(file) {
  try {
    const { DatabaseSync } = require('node:sqlite');
    return new DatabaseSync(file);
  } catch {
    const Database = require('better-sqlite3');
    return new Database(file);
  }
}

module.exports = { open };
