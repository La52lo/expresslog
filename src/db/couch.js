// src/db/couch.js
const Nano = require("nano");
const couch = Nano(process.env.COUCH_URL || "http://admin:password@127.0.0.1:5984");

async function useDb(dbName) {
  const list = await couch.db.list();
  if (!list.includes(dbName)) {
    await couch.db.create(dbName);
    console.log(`Created DB: ${dbName}`);
  }
  return couch.db.use(dbName);
}

module.exports = { useDb, couch };
