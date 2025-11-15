import { connectToDatabase } from '../lib/mongodb'
import bcrypt from 'bcryptjs'

async function seedDatabase() {
  console.log('[v0] Starting database seeding...')
  
  const db = await connectToDatabase()
  
  // Seed Admin Users
  console.log('[v0] Seeding admin users...')
  
  const adminUsers = [
    {
      username: 'superadmin',
      passwordHash: await bcrypt.hash('Admin@123', 10),
      role: 'super_admin',
      createdAt: new Date(),
    },
    {
      username: 'admin1',
      passwordHash: await bcrypt.hash('Admin@456', 10),
      role: 'admin',
      createdAt: new Date(),
    },
  ]
  
  await db.collection('adminUsers').deleteMany({}) // Clear existing
  await db.collection('adminUsers').insertMany(adminUsers)
  console.log(`[v0] ✓ Created ${adminUsers.length} admin users`)
  
  // Seed LGA Whitelist - Sample LGAs from different states
  console.log('[v0] Seeding LGA whitelist...')
  
  const lgaWhitelist = [
    // Lagos State
    {
      lgaId: '25-510',
      lgaName: 'Ikeja',
      stateName: 'Lagos',
      stateId: 25,
      chairmanName: 'Hon. Adewale Johnson',
      officialPhone: '+2348012345678',
      representativePhone: '+2348098765432',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      lgaId: '25-513',
      lgaName: 'Lagos Island',
      stateName: 'Lagos',
      stateId: 25,
      chairmanName: 'Hon. Chinyere Okafor',
      officialPhone: '+2348023456789',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // FCT (Abuja)
    {
      lgaId: '15-281',
      lgaName: 'Municipal Area Council',
      stateName: 'FCT',
      stateId: 15,
      chairmanName: 'Hon. Muhammed Bello',
      officialPhone: '+2348034567890',
      representativePhone: '+2348087654321',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      lgaId: '15-277',
      lgaName: 'Bwari',
      stateName: 'FCT',
      stateId: 15,
      chairmanName: 'Hon. Aisha Ibrahim',
      officialPhone: '+2348045678901',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Kano State
    {
      lgaId: '20-390',
      lgaName: 'Kano Municipal',
      stateName: 'Kano',
      stateId: 20,
      chairmanName: 'Hon. Usman Abdullahi',
      officialPhone: '+2348056789012',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      lgaId: '20-381',
      lgaName: 'Fagge',
      stateName: 'Kano',
      stateId: 20,
      chairmanName: 'Hon. Fatima Umar',
      officialPhone: '+2348067890123',
      representativePhone: '+2348076543210',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Rivers State
    {
      lgaId: '33-676',
      lgaName: 'Port Harcourt',
      stateName: 'Rivers',
      stateId: 33,
      chairmanName: 'Hon. Emeka Nwosu',
      officialPhone: '+2348078901234',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      lgaId: '33-677',
      lgaName: 'Obio/Akpor',
      stateName: 'Rivers',
      stateId: 33,
      chairmanName: 'Hon. Blessing Ihejirika',
      officialPhone: '+2348089012345',
      representativePhone: '+2348065432109',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Kaduna State
    {
      lgaId: '19-355',
      lgaName: 'Kaduna North',
      stateName: 'Kaduna',
      stateId: 19,
      chairmanName: 'Hon. Ibrahim Yusuf',
      officialPhone: '+2348090123456',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      lgaId: '19-356',
      lgaName: 'Kaduna South',
      stateName: 'Kaduna',
      stateId: 19,
      chairmanName: 'Hon. Grace Akpan',
      officialPhone: '+2348001234567',
      representativePhone: '+2348054321098',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Oyo State
    {
      lgaId: '31-631',
      lgaName: 'Ibadan North',
      stateName: 'Oyo',
      stateId: 31,
      chairmanName: 'Hon. Adekunle Adeyemi',
      officialPhone: '+2348012345098',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Enugu State
    {
      lgaId: '14-262',
      lgaName: 'Enugu North',
      stateName: 'Enugu',
      stateId: 14,
      chairmanName: 'Hon. Chioma Nnamani',
      officialPhone: '+2348023456098',
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]
  
  await db.collection('lgaWhitelist').deleteMany({}) // Clear existing
  await db.collection('lgaWhitelist').insertMany(lgaWhitelist)
  console.log(`[v0] ✓ Created ${lgaWhitelist.length} LGA whitelist entries`)
  
  console.log('\n[v0] Database seeding completed successfully!')
  console.log('\n[v0] Admin Credentials:')
  console.log('  Super Admin - Username: superadmin, Password: Admin@123')
  console.log('  Admin - Username: admin1, Password: Admin@456')
  console.log('\n[v0] Sample LGAs whitelisted:')
  lgaWhitelist.forEach((lga) => {
    console.log(`  - ${lga.lgaName}, ${lga.stateName} (${lga.chairmanName}, ${lga.officialPhone})`)
  })
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('\n[v0] Seeding process finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[v0] Error seeding database:', error)
    process.exit(1)
  })
