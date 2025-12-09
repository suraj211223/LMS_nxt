/**
 * prisma/seed.js - Seeding script for LMS_nxt
 * 
 * Uses static credentials from seed-users.js
 */

try { require('dotenv').config({ path: '.env.local' }); } catch (err) { /* ignore */ }
try { require('dotenv').config(); } catch (err) { /* ignore if dotenv missing */ }

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs');

// Import static users list
let usersToSeed = [];
try {
  usersToSeed = require('./seed-users.js');
} catch (e) {
  console.warn("Could not load seed-users.js, please ensure credentials are generated.", e.message);
  process.exit(1);
}

async function main() {
  console.log('Seeding base roles...')

  const roles = [
    { roleName: 'Admin', canEditCourses: true, canManageSystem: true, canUploadContent: true, canApproveContent: true, canPublishContent: true },
    { roleName: 'Teacher', canEditCourses: true, canManageSystem: false, canUploadContent: true, canApproveContent: true, canPublishContent: true },
    { roleName: 'Editor', canEditCourses: false, canManageSystem: false, canUploadContent: true, canApproveContent: false, canPublishContent: false },
    { roleName: 'Publisher', canEditCourses: false, canManageSystem: false, canUploadContent: false, canApproveContent: true, canPublishContent: true },
    { roleName: 'Teaching Assistant', canEditCourses: false, canManageSystem: false, canUploadContent: true, canApproveContent: false, canPublishContent: false }
  ]

  for (const r of roles) {
    await prisma.role.upsert({
      where: { roleName: r.roleName },
      update: r,
      create: r
    })
  }

  // Reload roles map
  const rolesMap = {};
  const allRoles = await prisma.role.findMany();
  allRoles.forEach(r => { rolesMap[r.roleName.toLowerCase()] = r.id });

  // SEED USERS
  console.log(`Seeding ${usersToSeed.length} users from seed-users.js...`);
  const userIDMapByEmail = {};

  for (const u of usersToSeed) {
    const roleId = rolesMap[u.role.toLowerCase()];
    if (!roleId) {
      console.warn(`Role not found for ${u.email}: ${u.role}`);
      continue;
    }

    const passwordHash = bcrypt.hashSync(u.password, 10);

    const createdUser = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        roleId
      },
      create: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        roleId
      }
    });

    userIDMapByEmail[u.email] = createdUser.id;
  }

  // LEGACY DATA (Schools, Programs, Courses Only)
  // We use legacy data to populate courses, but map assignments to our freshly seeded users.
  console.log('--- Starting Legacy Data Seed (Schools, Programs, Courses) ---');
  let legacyData = { schools: [], programs: [], courses: [], users: [], assignments: [] };
  try {
    legacyData = require('./seed-data');
  } catch (e) {
    console.warn('Could not load legacy data ./seed-data.js', e.message);
  }

  // 1. Seed Schools
  const schoolIDMap = {};
  for (const s of legacyData.schools) {
    const created = await prisma.school.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name }
    });
    schoolIDMap[s.id] = created.id;
  }

  // 2. Seed Programs
  const programIDMap = {};
  for (const p of legacyData.programs) {
    const newSchoolId = schoolIDMap[p.schoolId];
    if (newSchoolId) {
      const code = p.code || `PROG-${Date.now()}-${p.id}`;
      const created = await prisma.program.upsert({
        where: { programCode: code },
        update: {},
        create: {
          programName: p.name,
          programCode: code,
          schoolId: newSchoolId
        }
      });
      programIDMap[p.id] = created.id;
    }
  }

  // 3. Seed Courses
  const courseIDMap = {};
  for (const c of legacyData.courses) {
    const newProgramId = programIDMap[c.programId];
    if (newProgramId) {
      const created = await prisma.course.upsert({
        where: { courseCode: c.code },
        update: {
          title: c.title,
          programId: newProgramId
        },
        create: {
          title: c.title,
          courseCode: c.code,
          programId: newProgramId,
          status: 'Active'
        }
      });
      courseIDMap[c.id] = created.id;
    }
  }

  // 4. Assignments
  // We map legacy assignments using email matching
  const legacyIdToEmail = {};
  legacyData.users.forEach(u => { legacyIdToEmail[u.id] = u.email });

  let assignmentCount = 0;
  for (const a of legacyData.assignments) {
    const userEmail = legacyIdToEmail[a.userId];
    if (!userEmail) continue;

    const newUserId = userIDMapByEmail[userEmail];
    const newCourseId = courseIDMap[a.courseId];

    if (newUserId && newCourseId) {
      try {
        await prisma.userCourseAssignment.upsert({
          where: {
            user_course_unique: { userId: newUserId, courseId: newCourseId }
          },
          update: {},
          create: { userId: newUserId, courseId: newCourseId }
        });
        assignmentCount++;
      } catch (err) { /* ignore */ }
    }
  }

  console.log(`Seeding complete.`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
