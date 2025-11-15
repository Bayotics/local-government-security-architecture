import { connectToDatabase } from '../lib/mongodb'
import bcrypt from 'bcryptjs'
import { nigerianLGAs, nigerianStates } from '../lib/nigeria-data'

async function seedAllLGAs() {
  console.log('[v0] Starting complete LGA database seeding...')
  
  const db = await connectToDatabase()
  
  // Seed Admin Users (unchanged)
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
  
  await db.collection('adminUsers').deleteMany({})
  await db.collection('adminUsers').insertMany(adminUsers)
  console.log(`[v0] ✓ Created ${adminUsers.length} admin users`)
  
  // Seed ALL 774 LGAs
  console.log('[v0] Seeding ALL 774 LGAs to whitelist...')
  
  const lgaWhitelist = nigerianLGAs.map((lga) => {
    const state = nigerianStates.find(s => s.id === lga.state_id)
    return {
      lgaId: `${lga.state_id}-${lga.id}`,
      lgaName: lga.name,
      stateName: state?.name || 'Unknown',
      stateId: lga.state_id,
      chairmanName: `Hon. Chairman of ${lga.name}`,
      officialPhone: `+23480${String(lga.id).padStart(8, '0')}`,
      status: 'active',
      boundDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })
  
  await db.collection('lgaWhitelist').deleteMany({})
  await db.collection('lgaWhitelist').insertMany(lgaWhitelist)
  console.log(`[v0] ✓ Created ${lgaWhitelist.length} LGA whitelist entries`)
  
  console.log('\n[v0] Database seeding completed successfully!')
  console.log('\n[v0] Admin Credentials:')
  console.log('  Super Admin - Username: superadmin, Password: Admin@123')
  console.log('  Admin - Username: admin1, Password: Admin@456')
  console.log(`\n[v0] All ${lgaWhitelist.length} LGAs have been whitelisted`)
}

// Run the seed function
seedAllLGAs()
  .then(() => {
    console.log('\n[v0] Seeding process finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[v0] Error seeding database:', error)
    process.exit(1)
  })
