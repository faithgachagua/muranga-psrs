require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const { sectors, wardsBySubCounty } = require('./seed');
const seedDemoData = require('./demo');

const DROP_ALL = `
  DROP TABLE IF EXISTS password_resets, notifications, feedback, complaint_updates, complaint_photos, complaint_attachments, complaints, users, wards, sectors CASCADE;
  DROP SEQUENCE IF EXISTS complaint_ref_seq;`;

// Safe to run on every start: tables use IF NOT EXISTS and reference data is upserted
async function migrate({ reset = false } = {}) {
  const client = await pool.connect();
  try {
    if (reset) {
      if (process.env.NODE_ENV === 'production') throw new Error('Refusing to reset a production database');
      await client.query(DROP_ALL);
    }
    await client.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

    for (const [slug, name, description] of sectors) {
      await client.query(
        `INSERT INTO sectors(slug,name,description) VALUES ($1,$2,$3)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [slug, name, description]
      );
    }
    for (const [subCounty, wards] of Object.entries(wardsBySubCounty)) {
      for (const name of wards) {
        await client.query('INSERT INTO wards(name,sub_county) VALUES ($1,$2) ON CONFLICT (name, sub_county) DO NOTHING', [name, subCounty]);
      }
    }

    const { ADMIN_EMAIL, ADMIN_PASSWORD, SEED_DEMO } = process.env;
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      await client.query(
        `INSERT INTO users(full_name,email,password_hash,role) VALUES ('County Administrator',lower($1),$2,'admin')
         ON CONFLICT (email) DO NOTHING`,
        [ADMIN_EMAIL, await bcrypt.hash(ADMIN_PASSWORD, 10)]
      );
    } else {
      console.warn('ADMIN_EMAIL and ADMIN_PASSWORD are not set, so no admin account was created');
    }

    if (SEED_DEMO === 'true') await seedDemoData(client);
    console.log('Database is up to date');
  } finally {
    client.release();
  }
}

module.exports = migrate;

if (require.main === module) {
  migrate({ reset: process.argv.includes('--reset') })
    .catch((err) => { console.error(err.message); process.exitCode = 1; })
    .finally(() => pool.end());
}
