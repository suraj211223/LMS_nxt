const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Start adding new editors and assigning courses...');

  // 1. Get the role ID for 'Editor'
  const editorRole = await prisma.role.findUnique({
    where: { roleName: 'Editor' },
  });

  if (!editorRole) {
    console.error('Editor role not found. Please seed the roles first.');
    return;
  }

  // 2. Get the course IDs
  const nlpCourse = await prisma.course.findUnique({
    where: { courseCode: 'MAI-OL526-2' },
  });

  const javaCourse = await prisma.course.findUnique({
    where: { courseCode: 'MAI-OL525-2' },
  });

  if (!nlpCourse || !javaCourse) {
    console.error('One or both courses not found. Please seed the courses first.');
    return;
  }

  // 3. Create 2 new editor users
  const editors = [
    {
      firstName: 'editor',
      lastName: '1',
      email: 'editor1@example.com',
      password: 'password123',
    },
    {
      firstName: 'editor',
      lastName: '2',
      email: 'editor2@example.com',
      password: 'password123',
    },
  ];

  for (const editorData of editors) {
    const passwordHash = bcrypt.hashSync(editorData.password, 10);
    const user = await prisma.user.create({
      data: {
        email: editorData.email,
        passwordHash: passwordHash,
        firstName: editorData.firstName,
        lastName: editorData.lastName,
        roleId: editorRole.id,
      },
    });

    console.log(`Created user: ${user.email}`);

    // 4. Assign courses to the new user
    await prisma.userCourseAssignment.createMany({
      data: [
        { userId: user.id, courseId: nlpCourse.id },
        { userId: user.id, courseId: javaCourse.id },
      ],
    });

    console.log(`Assigned courses to user with id: ${user.id}`);
  }

  console.log('Successfully added new editors and assigned courses.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });