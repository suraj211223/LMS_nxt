/**
 * prisma/seed.js - Seeding script for LMS_nxt
 * Generates random credentials and logs them to credentials.txt
 */

try { require('dotenv').config({ path: '.env.local' }); } catch (err) { /* ignore */ }
try { require('dotenv').config(); } catch (err) { /* ignore if dotenv missing */ }
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

function generatePassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

async function main() {
  console.log('Seeding base roles...')

  // Clear or create credentials file
  const credentialsPath = path.join(process.cwd(), 'credentials.txt');
  fs.writeFileSync(credentialsPath, "--- LMS Credentials Log ---\n\n");

  const logCredential = (role, email, password) => {
    const line = `Role: ${role.padEnd(20)} | Email: ${email.padEnd(30)} | Password: ${password}\n`;
    fs.appendFileSync(credentialsPath, line);
  };

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

  // Define users to create
  const demoUsers = [
    { role: 'admin', email: 'admin@CU.in', firstName: 'Admin', lastName: 'User' },
    { role: 'teacher', email: 'testteacher@CU.in', firstName: 'Test', lastName: 'Teacher' },

    // 2 Editors
    { role: 'editor', email: 'editor1@CU.in', firstName: 'Editor', lastName: 'One' },
    { role: 'editor', email: 'editor2@CU.in', firstName: 'Editor', lastName: 'Two' },

    // 2 Teaching Assistants
    { role: 'teaching assistant', email: 'ta1@CU.in', firstName: 'TA', lastName: 'One' },
    { role: 'teaching assistant', email: 'ta2@CU.in', firstName: 'TA', lastName: 'Two' },

    // 2 Publishers
    { role: 'publisher', email: 'publisher1@CU.in', firstName: 'Publisher', lastName: 'One' },
    { role: 'publisher', email: 'publisher2@CU.in', firstName: 'Publisher', lastName: 'Two' },
  ];

  for (const u of demoUsers) {
    const roleId = rolesMap[u.role.toLowerCase()];
    if (!roleId) continue;

    const password = generatePassword(8);
    const passwordHash = bcrypt.hashSync(password, 10);

    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, firstName: u.firstName, lastName: u.lastName, roleId },
      create: { email: u.email, passwordHash, firstName: u.firstName, lastName: u.lastName, roleId }
    });

    logCredential(u.role, u.email, password);
  }

  // --- LEGACY DATA IMPORT ---
  console.log('--- Starting Legacy Data Seed (Schools, Programs, Courses, Teachers) ---');
  let legacyData;
  try {
    legacyData = require('./seed-data');
  } catch (e) {
    console.warn('Could not load legacy data ./seed-data.js', e.message);
    legacyData = { schools: [], programs: [], courses: [], users: [], assignments: [] };
  }

  // 1. Seed Schools
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

  if (teacherRoleId) {
    console.log("Seeding legacy teachers...");
    for (const u of legacyData.users) {

      const password = generatePassword(8);
      const passwordHash = bcrypt.hashSync(password, 10);

      const createdUser = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          passwordHash: passwordHash, // Reset password on seed
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
      logCredential("Teacher (Legacy)", u.email, password);
    }
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
        // Ignore unique constraint errors
      }
    }
  }

  console.log(`Legacy Import Summary:
  - Users (Teachers): ${legacyData.users.length}
  - Assignments: ${assignmentCount}
  `);

  console.log('Seeding complete. Credentials saved to credentials.txt');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
