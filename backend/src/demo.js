const bcrypt = require('bcryptjs');

const DAY = 24 * 60 * 60 * 1000;

const CITIZENS = [
  ['Jane Wanjiru', 'jane@example.com', '12345678'],
  ['Peter Kamau', 'peter@example.com', '23456789'],
  ['Mary Njeri', 'mary@example.com', '34567890'],
];

const SAMPLES = [
  ['roads-transport', 'Pothole near the Murang\'a stage', 'A deep pothole on the main road has been damaging vehicles for weeks.'],
  ['roads-transport', 'Broken streetlight on the market road', 'The streetlight has been out for two weeks and the road is unsafe at night.'],
  ['water-sewerage', 'No water supply for five days', 'Our estate has had no piped water since Monday.'],
  ['water-sewerage', 'Blocked sewer behind the shopping centre', 'Sewage is overflowing onto the footpath.'],
  ['environment-waste', 'Garbage not collected', 'Waste has not been collected in our street for two weeks.'],
  ['environment-waste', 'Illegal dumping by the river', 'People are dumping rubbish on the river bank.'],
  ['health-sanitation', 'Public toilets in poor condition', 'The public toilets at the bus park are dirty and have no water.'],
  ['trade-markets', 'Market stalls flooding when it rains', 'Traders lose stock whenever there is heavy rain.'],
  ['education-ecde', 'ECDE classroom roof leaking', 'The roof leaks and children cannot use the room in the rain.'],
  ['agriculture-livestock', 'Request for a veterinary officer', 'Cattle in our area need vaccination and there is no officer.'],
  ['housing-urban', 'Unapproved building on the road reserve', 'A structure is being built on the road reserve.'],
  ['revenue-licensing', 'Delay in business permit renewal', 'My permit application has been pending for a month.'],
  ['public-infrastructure', 'Collapsed drainage culvert', 'The culvert has collapsed and water is flooding the road.'],
  ['fire-disaster', 'Landslide risk near homes', 'Cracks are appearing on the slope above our homes.'],
  ['social-services', 'Support for elderly persons programme', 'Our elderly neighbours have not received their support.'],
  ['county-administration', 'Long queues at the county offices', 'Services at the offices are slow and queues are very long.'],
  ['land-planning', 'Boundary dispute on a public plot', 'A public plot has been fenced off by a private owner.'],
  ['parks-recreation', 'Playground equipment broken', 'Swings at the public park are broken and unsafe for children.'],
  ['public-participation', 'Request for a budget forum in our ward', 'We would like a forum to discuss next year\'s budget.'],
  ['other', 'Request for a public notice board', 'Our ward has no place to display public notices.'],
];

const COMMENTS = ['Quick response, thank you.', 'The issue was fixed but it took a while.', 'Very happy with the service.', 'Fixed properly.'];
const STATUSES = ['submitted', 'under_review', 'in_progress', 'in_progress', 'resolved', 'resolved', 'resolved', 'rejected'];
const STEPS = {
  submitted: [],
  under_review: ['under_review'],
  in_progress: ['under_review', 'in_progress'],
  resolved: ['under_review', 'in_progress', 'resolved'],
  rejected: ['under_review', 'rejected'],
};
const NOTES = {
  under_review: 'A county officer is reviewing the request.',
  in_progress: 'Work has started.',
  resolved: 'The issue has been resolved.',
  rejected: 'This request falls outside county services.',
};

// Sample citizens and requests so the dashboards have data. Skipped if requests already exist.
async function seedDemoData(client) {
  const { rows: [{ count }] } = await client.query('SELECT COUNT(*)::int AS count FROM complaints');
  if (count > 0) return;

  let seed = 42;
  const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const pick = (list) => list[Math.floor(rand() * list.length)];

  const hash = await bcrypt.hash('Citizen@123', 10);
  const citizenIds = [];
  for (const [name, email, nationalId] of CITIZENS) {
    const { rows: [u] } = await client.query(
      `INSERT INTO users(full_name,email,national_id,phone,password_hash,role,ward_id)
       VALUES ($1,$2,$3,'0700000000',$4,'citizen',(SELECT id FROM wards ORDER BY id LIMIT 1))
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id`,
      [name, email, nationalId, hash]
    );
    citizenIds.push(u.id);
  }

  const { rows: sectors } = await client.query('SELECT id, slug FROM sectors');
  const { rows: wards } = await client.query('SELECT id FROM wards');
  const { rows: [admin] } = await client.query("SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1");

  for (const [slug, title, description] of SAMPLES) {
    const citizenId = pick(citizenIds);
    const status = pick(STATUSES);
    const point = rand() > 0.3 ? [-0.721 + (rand() - 0.5) * 0.1, 37.1526 + (rand() - 0.5) * 0.1].map((n) => Number(n.toFixed(6))) : [null, null];
    const created = new Date(Date.now() - (Math.floor(rand() * 60) + 3) * DAY);

    const { rows: [c] } = await client.query(
      `INSERT INTO complaints(reference,citizen_id,sector_id,ward_id,title,description,status,created_at,updated_at,latitude,longitude)
       VALUES ('MCG-'||to_char($7::timestamptz,'YYYY')||'-'||lpad(nextval('complaint_ref_seq')::text,6,'0'),$1,$2,$3,$4,$5,$6,$7,$7,$8,$9)
       RETURNING id`,
      [citizenId, sectors.find((s) => s.slug === slug).id, pick(wards).id, title, description, status, created, ...point]
    );

    await client.query('INSERT INTO complaint_updates(complaint_id,status,note,updated_by,created_at) VALUES ($1,$2,$3,$4,$5)',
      [c.id, 'submitted', 'Request received', citizenId, created]);

    let last = created;
    for (const [i, step] of STEPS[status].entries()) {
      last = new Date(Math.min(Date.now(), created.getTime() + (i + 1) * 2 * DAY));
      await client.query('INSERT INTO complaint_updates(complaint_id,status,note,updated_by,created_at) VALUES ($1,$2,$3,$4,$5)',
        [c.id, step, NOTES[step], admin?.id ?? null, last]);
      await client.query('INSERT INTO notifications(user_id,complaint_id,title,message,is_read,created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [citizenId, c.id, 'Request updated', NOTES[step], rand() > 0.4, last]);
    }

    await client.query('UPDATE complaints SET updated_at=$1, resolved_at=$2 WHERE id=$3', [last, status === 'resolved' ? last : null, c.id]);

    if (status === 'resolved' && rand() > 0.3) {
      await client.query('INSERT INTO feedback(complaint_id,citizen_id,rating,comment) VALUES ($1,$2,$3,$4)',
        [c.id, citizenId, 3 + Math.floor(rand() * 3), pick(COMMENTS)]);
    }
  }
}

module.exports = seedDemoData;
