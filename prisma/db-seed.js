// Lightweight seed script using Prisma ORM
// - idempotent upserts for roles and demo users
// - hashes passwords using bcryptjs

try { require('dotenv').config({ path: '.env.local' }); } catch (e) {}
try { require('dotenv').config(); } catch (e) {}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database using Prisma Client');

  // roles
  const roles = [
    { role_name: 'Admin', can_edit_courses: 1, can_manage_system: 1, can_upload_content: 1 },
    { role_name: 'Teacher', can_edit_courses: 1, can_manage_system: 0, can_upload_content: 1 },
    { role_name: 'Editor', can_edit_courses: 0, can_manage_system: 0, can_upload_content: 1 },
  ];

  for (const r of roles) {
    await prisma.roles.upsert({
      where: { role_name: r.role_name },
      update: {},
      create: {
        role_name: r.role_name,
        can_edit_courses: r.can_edit_courses,
        can_manage_system: r.can_manage_system,
        can_upload_content: r.can_upload_content,
      },
    });
  }

  const roleMap = {};
  const allRoles = await prisma.roles.findMany();
  for (const role of allRoles) {
    roleMap[role.role_name.toLowerCase()] = role.role_id;
  }

  console.log('Roles present:', roleMap);

  // demo users
  const demoUsers = [
    { role: 'teacher', email: 'testteacher@CU.in', password: 'dummy', first_name: 'Test', last_name: 'Teacher' },
    { role: 'admin', email: 'admin@CU.in', password: 'dummy', first_name: 'Admin', last_name: 'User' },
    { role: 'editor', email: 'editor@CU.in', password: 'dummy', first_name: 'Editor', last_name: 'User' },
  ];

  for (const u of demoUsers) {
    const roleId = roleMap[u.role];
    if (!roleId) continue;
    const passwordHash = bcrypt.hashSync(u.password, 10);

    await prisma.users.upsert({
      where: { email: u.email },
      update: {
        password_hash: passwordHash,
        first_name: u.first_name,
        last_name: u.last_name,
        role_id: roleId,
      },
      create: {
        email: u.email,
        password_hash: passwordHash,
        first_name: u.first_name,
        last_name: u.last_name,
        role_id: roleId,
      },
    });
  }

  console.log('Seed complete. Verifying demo accounts...');
  const users = await prisma.users.findMany({
    where: { email: { in: ['testteacher@CU.in', 'admin@CU.in', 'editor@CU.in'] } },
    select: { user_id: true, email: true, password_hash: true },
  });
  console.table(
    users.map((u) => ({
      id: u.user_id,
      email: u.email,
      hashStartsWith: u.password_hash && u.password_hash.slice(0, 4),
    }))
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
