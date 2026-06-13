const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  try {
    console.log('Seeding database...');

    // Clear existing data (optional, but good for clean seed)
    await pool.query('TRUNCATE TABLE audit_logs, activity_logs, leads, refresh_tokens, users RESTART IDENTITY CASCADE');

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('adminpassword', 10);
    const managerPasswordHash = await bcrypt.hash('managerpassword', 10);
    const agentPasswordHash = await bcrypt.hash('agentpassword', 10);

    // Insert Users
    console.log('Inserting default users...');
    const usersResult = await pool.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES 
        ('System Admin', 'admin@company.com', $1, 'admin'),
        ('Sales Manager', 'manager@company.com', $2, 'manager'),
        ('Agent Alice', 'alice@company.com', $3, 'agent'),
        ('Agent Bob', 'bob@company.com', $4, 'agent'),
        ('Agent Charlie', 'charlie@company.com', $5, 'agent')
      RETURNING id, name, email, role
    `, [adminPasswordHash, managerPasswordHash, agentPasswordHash, agentPasswordHash, agentPasswordHash]);

    const users = usersResult.rows;
    console.log(`Inserted ${users.length} users successfully.`);

    const alice = users.find(u => u.email === 'alice@company.com');
    const bob = users.find(u => u.email === 'bob@company.com');
    const charlie = users.find(u => u.email === 'charlie@company.com');
    const manager = users.find(u => u.role === 'manager');

    // Insert Leads
    console.log('Inserting default leads...');
    const leadsResult = await pool.query(`
      INSERT INTO leads (name, email, phone, source, status, assigned_to, notes)
      VALUES 
        ('John Doe', 'john@gmail.com', '+1234567890', 'web', 'new', $1, 'Interested in cloud computing services. Prefers email communication.'),
        ('Jane Smith', 'jane@yahoo.com', '+1987654321', 'referral', 'contacted', $2, 'Referred by partner. Needs a demo scheduled for next Tuesday.'),
        ('Robert Johnson', 'robert@outlook.com', '+1122334455', 'advertisement', 'qualified', $1, 'Budget approved. Looking for a custom plan quote.'),
        ('Emily Davis', 'emily@company.com', '+1555666777', 'web', 'new', $3, 'Contact form inquiry regarding enterprise features.'),
        ('Michael Brown', 'michael@test.com', '+1999888777', 'web', 'won', $2, 'Deal finalized. Contract signed on June 12th.')
      RETURNING id, name
    `, [alice.id, bob.id, charlie.id]);

    const leads = leadsResult.rows;
    console.log(`Inserted ${leads.length} leads successfully.`);

    // Insert Initial Activity Logs for the leads
    console.log('Inserting default activity logs...');
    for (const lead of leads) {
      await pool.query(`
        INSERT INTO activity_logs (lead_id, user_id, activity_type, details)
        VALUES ($1, $2, 'lead_created', $3)
      `, [lead.id, manager.id, `Lead '${lead.name}' created during database seeding.`]);
    }
    console.log('Activity logs seeded successfully.');

    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
