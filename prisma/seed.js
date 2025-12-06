/**
 * prisma/seed.js - Example seeding script for LMS_nxt
 * Use `node prisma/seed.js` or configure "prisma" -> "seed" in package.json to run.
 */

try { require('dotenv').config({ path: '.env.local' }); } catch (err) { /* ignore */ }
try { require('dotenv').config(); } catch (err) { /* ignore if dotenv missing */ }
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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

  // --- STANDARD DEMO USERS ---
  console.log('Seeding demo users...')
  const rolesMap = {};
  const allRoles = await prisma.role.findMany();
  allRoles.forEach(r => { rolesMap[r.roleName.toLowerCase()] = r.id });

  const bcrypt = require('bcryptjs');

  const demoUsers = [
    { role: 'teacher', email: 'testteacher@CU.in', password: 'dummy', firstName: 'Test', lastName: 'Teacher' },
    { role: 'admin', email: 'admin@CU.in', password: 'dummy', firstName: 'Admin', lastName: 'User' },
    { role: 'editor', email: 'editor@CU.in', password: 'dummy', firstName: 'Editor', lastName: 'User' },

    // Extra Accounts
    { role: 'editor', email: 'editor1@CU.in', password: 'dummy', firstName: 'Editor', lastName: 'One' },
    { role: 'editor', email: 'editor2@CU.in', password: 'dummy', firstName: 'Editor', lastName: 'Two' },
    { role: 'teaching assistant', email: 'ta1@CU.in', password: 'dummy', firstName: 'TA', lastName: 'One' },
    { role: 'teaching assistant', email: 'ta2@CU.in', password: 'dummy', firstName: 'TA', lastName: 'Two' },
    { role: 'publisher', email: 'publisher1@CU.in', password: 'dummy', firstName: 'Publisher', lastName: 'One' },
    { role: 'publisher', email: 'publisher2@CU.in', password: 'dummy', firstName: 'Publisher', lastName: 'Two' },
  ];

  for (const u of demoUsers) {
    const roleId = rolesMap[u.role.toLowerCase()];
    if (!roleId) continue;

    const passwordHash = bcrypt.hashSync(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, firstName: u.firstName, lastName: u.lastName, roleId },
      create: { email: u.email, passwordHash, firstName: u.firstName, lastName: u.lastName, roleId }
    });
  }

  // --- LEGACY DATA IMPORT ---
  console.log('--- Starting Legacy Data Seed (Schools, Programs, Courses, Teachers) ---');
  let legacyData;
  try {
    // Must use valid relative path
    legacyData = require('./seed-data');
  } catch (e) {
    console.warn('Could not load legacy data ./seed-data.js', e.message);
    legacyData = { schools: [], programs: [], courses: [], users: [], assignments: [] };
  }

  // 1. Seed Schools
  // Map oldId -> newId so we can link them correctly
  const schoolIDMap = {};
  for (const s of legacyData.schools) {
    const createdSchool = await prisma.school.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name }
    });
    schoolIDMap[s.id] = createdSchool.id;
  }

  // 2. Seed Programs
  const programIDMap = {};
  for (const p of legacyData.programs) {
    const newSchoolId = schoolIDMap[p.schoolId];
    if (!newSchoolId) {
      console.log(`Skipping program ${p.name} - School ID ${p.schoolId} not found`);
      continue;
    }

    const code = p.code || `PROG-${Date.now()}`;
    const createdProgram = await prisma.program.upsert({
      where: { programCode: code },
      update: {},
      create: {
        programName: p.name,
        programCode: code,
        schoolId: newSchoolId
      }
    });
    programIDMap[p.id] = createdProgram.id;
  }

  // 3. Seed Courses
  const courseIDMap = {};
  for (const c of legacyData.courses) {
    const newProgramId = programIDMap[c.programId];
    if (!newProgramId) {
      console.log(`Skipping course ${c.title} - Program ID ${c.programId} not found`);
      continue;
    }

    const createdCourse = await prisma.course.upsert({
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
    courseIDMap[c.id] = createdCourse.id;
  }

  // 4. Seed Legacy Users (Teachers)
  const teacherRoleId = rolesMap['teacher'];
  const userIDMap = {};

  for (const u of legacyData.users) {
    if (!teacherRoleId) break;

    // Default password for all migrated teachers
    const passwordHash = bcrypt.hashSync('password123', 10);

    // We intentionally UPSERT. If user exists (e.g. maria), we update them to ensure they have the hashed password and correct Role.
    const createdUser = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash: passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        roleId: teacherRoleId
      },
      create: {
        email: u.email,
        passwordHash: passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        roleId: teacherRoleId
      }
    });
    userIDMap[u.id] = createdUser.id;
  }

  // 5. Seed Assignments
  let assignmentCount = 0;
  for (const a of legacyData.assignments) {
    const newUserId = userIDMap[a.userId];
    const newCourseId = courseIDMap[a.courseId];

    if (newUserId && newCourseId) {
      try {
        await prisma.userCourseAssignment.upsert({
          where: {
            user_course_unique: {
              userId: newUserId,
              courseId: newCourseId
            }
          },
          update: {},
          create: {
            userId: newUserId,
            courseId: newCourseId
          }
        });
        assignmentCount++;
      } catch (err) {
        // Ignore unique constraint errors or just warn
      }
    }
  }

  console.log(`Legacy Import Summary:
  - Schools: ${legacyData.schools.length}
  - Programs: ${legacyData.programs.length}
  - Courses: ${legacyData.courses.length}
  - Users (Teachers): ${legacyData.users.length}
  - Assignments: ${assignmentCount}
  `);

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
