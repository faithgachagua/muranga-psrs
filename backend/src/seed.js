const sectors = [
  ['roads-transport', 'Roads & Transport', 'Potholes, damaged roads, bridges, street lighting, matatu stages'],
  ['water-sewerage', 'Water & Sewerage', 'Water shortages, burst pipes, sewer blockages'],
  ['environment-waste', 'Environment & Waste Management', 'Garbage collection, illegal dumping, pollution'],
  ['health-sanitation', 'Public Health & Sanitation', 'Clinics, hospitals, public toilets, health hazards'],
  ['trade-markets', 'Trade & Markets', 'Market stalls, hawking, weights and measures'],
  ['education-ecde', 'Education & ECDE', 'ECDE centres, bursaries, learning facilities'],
  ['agriculture-livestock', 'Agriculture & Livestock', 'Extension services, veterinary, farm inputs'],
  ['housing-urban', 'Housing & Urban Planning', 'County housing, urban planning, building approvals'],
  ['revenue-licensing', 'Revenue & Licensing', 'Business permits, rates, fees and levies'],
  ['public-infrastructure', 'Public Infrastructure', 'Public buildings, drainage, county facilities'],
  ['fire-disaster', 'Fire & Disaster Management', 'Fire, floods, landslides, emergency response'],
  ['social-services', 'Social Services', 'Social protection, youth, gender, PWD support'],
  ['county-administration', 'County Administration', 'Administration, staff conduct, service delivery'],
  ['land-planning', 'Land & Physical Planning', 'Land disputes, survey, zoning, physical planning'],
  ['parks-recreation', 'Parks & Recreation', 'Parks, stadiums, public recreation spaces'],
  ['public-participation', 'Public Participation', 'Budget forums, bills, community engagement'],
  ['other', 'Other County Services', 'Anything that does not fit the sectors above'],
];

const wardsBySubCounty = {
  Kiharu: ['Wangu', 'Mugoiri', 'Mbiri', 'Township', 'Murarandia', 'Gaturi'],
  Kangema: ['Kanyenya-ini', 'Muguru', 'Rwathia'],
  Mathioya: ['Gitugi', 'Kiru', 'Kamacharia'],
  Kigumo: ['Kinyona', 'Kahumbu', 'Muthithi', 'Kigumo'],
  Kahuro: ['Githiga', 'Ruchu', 'Ithiru'],
  Maragua: ['Kimorori/Wempa', 'Makuyu', 'Kambiti', 'Kamahuha', 'Ichagaki', 'Nginda'],
  Gatanga: ['Ithanga', 'Kakuzi/Mitubiri', 'Mugumo-ini', 'Kihumbu-ini', 'Gatanga', 'Kariara'],
};

module.exports = { sectors, wardsBySubCounty };
