const bcrypt = require('bcryptjs');
const { query } = require('../src/config/db');

async function seedDatabase() {
  console.log('🌱 Starting Database Seeding Process...');

  try {
    // 1. Ensure Roles
    const roles = [
      { id: 1, name: 'SYSTEM_ADMIN', description: 'Full administrative access' },
      { id: 2, name: 'NORMAL_USER', description: 'Can view stores and submit ratings' },
      { id: 3, name: 'STORE_OWNER', description: 'Can view own store dashboard and rating analytics' }
    ];

    for (const role of roles) {
      const [existing] = await query('SELECT id FROM roles WHERE name = ?', [role.name]);
      if (existing && existing.length > 0) {
        await query('UPDATE roles SET description = ? WHERE name = ?', [role.description, role.name]);
      } else {
        await query('INSERT INTO roles (id, name, description) VALUES (?, ?, ?)', [role.id, role.name, role.description]);
      }
    }
    console.log('✅ Roles seeded successfully.');

    // Passwords hashed with bcrypt
    const adminPass = await bcrypt.hash('Admin@1234', 10);
    const owner1Pass = await bcrypt.hash('Owner@1234', 10);
    const owner2Pass = await bcrypt.hash('Owner@5678', 10);
    const user1Pass = await bcrypt.hash('User@12345', 10);
    const user2Pass = await bcrypt.hash('User@67890', 10);
    const user3Pass = await bcrypt.hash('User@99999', 10);

    // 2. Seed Users (Names must be 20-60 characters long)
    const users = [
      {
        name: 'System Administrator Account', // 28 chars
        email: 'admin@storerating.com',
        password: adminPass,
        address: '100 Executive Boulevard, Suite 400, Silicon Valley, CA 94025',
        role_id: 1
      },
      {
        name: 'Grand Supermarket Store Owner', // 30 chars
        email: 'owner.grand@storerating.com',
        password: owner1Pass,
        address: '456 Commercial Plaza, Retail District, New York, NY 10001',
        role_id: 3
      },
      {
        name: 'Tech World Store Manager Owner', // 31 chars
        email: 'owner.tech@storerating.com',
        password: owner2Pass,
        address: '789 Innovation Parkway, Tech Zone, Austin, TX 78701',
        role_id: 3
      },
      {
        name: 'Johnathan Edward Resident User', // 30 chars
        email: 'johnathan.user@gmail.com',
        password: user1Pass,
        address: '123 Maple Street, Apartment 4B, Boston, MA 02108',
        role_id: 2
      },
      {
        name: 'Samantha Marie Customer Account', // 32 chars
        email: 'samantha.user@gmail.com',
        password: user2Pass,
        address: '555 Oak Ridge Avenue, Unit 12, Seattle, WA 98101',
        role_id: 2
      },
      {
        name: 'Robert Alexander Shopping User', // 30 chars
        email: 'robert.user@gmail.com',
        password: user3Pass,
        address: '888 Pine Tree Boulevard, Chicago, IL 60601',
        role_id: 2
      }
    ];

    const userIdMap = {};
    for (const u of users) {
      const [existing] = await query('SELECT id FROM users WHERE email = ?', [u.email]);
      if (existing && existing.length > 0) {
        userIdMap[u.email] = existing[0].id;
        await query(
          'UPDATE users SET name = ?, password = ?, address = ?, role_id = ? WHERE email = ?',
          [u.name, u.password, u.address, u.role_id, u.email]
        );
      } else {
        const [res] = await query(
          'INSERT INTO users (name, email, password, address, role_id) VALUES (?, ?, ?, ?, ?)',
          [u.name, u.email, u.password, u.address, u.role_id]
        );
        userIdMap[u.email] = res.insertId;
      }
    }
    console.log('✅ Users seeded successfully.');

    // 3. Seed Stores
    const stores = [
      {
        name: 'Grand Supermarket Central',
        email: 'contact@grandmarket.com',
        address: '456 Commercial Plaza, Retail District, New York, NY 10001',
        owner_email: 'owner.grand@storerating.com'
      },
      {
        name: 'Tech World Electronics',
        email: 'support@techworld.com',
        address: '789 Innovation Parkway, Tech Zone, Austin, TX 78701',
        owner_email: 'owner.tech@storerating.com'
      },
      {
        name: 'Green Leaf Organic Groceries',
        email: 'info@greenleafgroceries.com',
        address: '321 Eco Way, Garden District, Portland, OR 97201',
        owner_email: null
      },
      {
        name: 'Apex Fitness Gear Store',
        email: 'sales@apexfitness.com',
        address: '654 Athletic Drive, Sports Complex, Denver, CO 80202',
        owner_email: null
      }
    ];

    const storeIdMap = {};
    for (const s of stores) {
      const ownerId = s.owner_email ? userIdMap[s.owner_email] : null;
      const [existing] = await query('SELECT id FROM stores WHERE name = ?', [s.name]);
      if (existing && existing.length > 0) {
        storeIdMap[s.name] = existing[0].id;
        await query(
          'UPDATE stores SET email = ?, address = ?, owner_id = ? WHERE name = ?',
          [s.email, s.address, ownerId, s.name]
        );
      } else {
        const [res] = await query(
          'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
          [s.name, s.email, s.address, ownerId]
        );
        storeIdMap[s.name] = res.insertId;
      }
    }
    console.log('✅ Stores seeded successfully.');

    // 4. Seed Ratings
    const sampleRatings = [
      { user_email: 'johnathan.user@gmail.com', store_name: 'Grand Supermarket Central', rating: 5 },
      { user_email: 'samantha.user@gmail.com', store_name: 'Grand Supermarket Central', rating: 4 },
      { user_email: 'robert.user@gmail.com', store_name: 'Grand Supermarket Central', rating: 5 },
      { user_email: 'johnathan.user@gmail.com', store_name: 'Tech World Electronics', rating: 4 },
      { user_email: 'samantha.user@gmail.com', store_name: 'Tech World Electronics', rating: 3 },
      { user_email: 'robert.user@gmail.com', store_name: 'Green Leaf Organic Groceries', rating: 5 }
    ];

    for (const r of sampleRatings) {
      const uId = userIdMap[r.user_email];
      const sId = storeIdMap[r.store_name];
      if (uId && sId) {
        const [existing] = await query('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [uId, sId]);
        if (existing && existing.length > 0) {
          await query('UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?', [r.rating, uId, sId]);
        } else {
          await query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [uId, sId, r.rating]);
        }
      }
    }
    console.log('✅ Ratings seeded successfully.');
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    process.exit(1);
  }
}

seedDatabase();
