const { query } = require('../config/db');

/**
 * Fetch mock enrichment details from RandomUser API and update the lead.
 */
async function enrichLead(leadId) {
  try {
    const response = await fetch('https://randomuser.me/api/');
    if (!response.ok) {
      throw new Error(`RandomUser API returned status ${response.status}`);
    }
    const data = await response.json();
    const user = data.results[0];

    if (!user) {
      throw new Error('No user data returned from RandomUser API');
    }

    const enrichmentData = {
      avatar: user.picture.medium,
      gender: user.gender,
      location: {
        city: user.location.city,
        state: user.location.state,
        country: user.location.country
      },
      dob: user.dob.date,
      age: user.dob.age,
      cell: user.cell
    };

    const sql = `
      UPDATE leads
      SET enrichment_data = $1
      WHERE id = $2
    `;
    await query(sql, [JSON.stringify(enrichmentData), leadId]);
  } catch (error) {
    console.error(`Lead enrichment failed for lead ID ${leadId}:`, error.message);
  }
}

module.exports = {
  enrichLead
};
