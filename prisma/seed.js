/**
 * prisma/seed.js - Example seeding script for LMS_nxt
 * Use `node prisma/seed.js` or configure "prisma" -> "seed" in package.json to run.
 */

// Load .env* files so seeds can run locally (e.g. .env.local)
// Prefer .env.local for local dev, fall back to .env
try { require('dotenv').config({ path: '.env.local' }); } catch (err) { /* ignore */ }
try { require('dotenv').config(); } catch (err) { /* ignore if dotenv missing */ }
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding base roles...')

  const roles = [
    { roleName: 'Admin', canEditCourses: true, canManageSystem: true, canUploadContent: true },
    { roleName: 'Teacher', canEditCourses: true, canManageSystem: false, canUploadContent: true },
    { roleName: 'Editor', canEditCourses: false, canManageSystem: false, canUploadContent: true }
  ]

  for (const r of roles) {
    await prisma.role.upsert({
      where: { roleName: r.roleName },
      update: {},
      create: r
    })
  }

  console.log('Seeding a sample school & program...')
  const school = await prisma.school.upsert({
    where: { name: 'School of Management' },
    update: {},
    create: { name: 'School of Management' }
  })

  await prisma.program.upsert({
    where: { programCode: 'BCOM' },
    update: {},
    create: { programName: 'Bachelor of Commerce', programCode: 'BCOM', schoolId: school.id }
  })

  // Create demo users for development login (matches insert_teacher.sql)
  console.log('Seeding demo users (admin/testteacher/editor)')

  const rolesMap = {};
  const allRoles = await prisma.role.findMany();
  allRoles.forEach(r => { rolesMap[r.roleName.toLowerCase()] = r.id });

  // we'll hash passwords using bcryptjs to make dev safer
  const bcrypt = require('bcryptjs');
  const demoUsers = [
    { role: 'teacher', email: 'testteacher@CU.in', password: 'dummy', firstName: 'Test', lastName: 'Teacher' },
    { role: 'admin', email: 'admin@CU.in', password: 'dummy', firstName: 'Admin', lastName: 'User' },
    { role: 'editor', email: 'editor@CU.in', password: 'dummy', firstName: 'Editor', lastName: 'User' },
  ];

  for (const u of demoUsers) {
    const roleId = rolesMap[u.role];
    if (!roleId) continue;

    const passwordHash = bcrypt.hashSync(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, firstName: u.firstName, lastName: u.lastName, roleId },
      create: { email: u.email, passwordHash, firstName: u.firstName, lastName: u.lastName, roleId }
    });
  }

  console.log('Seeding complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
