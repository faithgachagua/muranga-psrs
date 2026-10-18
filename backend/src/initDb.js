require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const { sectors, wardsBySubCounty } = require('./seed');

(async () => {
  const client = await pool.connect();
  try {
    await client.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

    for (const [slug, name, desc] of sectors)
      await client.query('INSERT INTO sectors(slug,name,description) VALUES ($1,$2,$3)', [slug, name, desc]);

    for (const [sub, wards] of Object.entries(wardsBySubCounty))
      for (const w of wards)
        await client.query('INSERT INTO wards(name,sub_county) VALUES ($1,$2)', [w, sub]);

    const hash = (p) => bcrypt.hashSync(p, 10);

    await client.query(
      `INSERT INTO users(full_name,email,national_id,password_hash,role) VALUES ($1,$2,$3,$4,'admin')`,
      ['County Administrator', 'admin@muranga.go.ke', '10000000', hash('Admin@123')]
    );

    await client.query(
      `INSERT INTO users(full_name,email,national_id,phone,password_hash,role,ward_id)
       VALUES ('Faith Waruguru','faith@example.com','12345678','0700123456',$1,'citizen',1)`,
      [hash('Citizen@123')]
    );

    console.log('Database ready.\nAdmin:   admin@muranga.go.ke / Admin@123\nCitizen: faith@example.com (or ID 12345678) / Citizen@123');
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
