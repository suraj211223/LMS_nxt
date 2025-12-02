const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'testteacher@CU.in';

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log('User not found');
        return;
    }

    // Find some courses
    const courses = await prisma.course.findMany({ take: 3 });
    if (courses.length === 0) {
        console.log('No courses found');
        return;
    }

    console.log(`Assigning ${courses.length} courses to ${email}...`);

    for (const course of courses) {
        try {
            await prisma.userCourseAssignment.create({
                data: {
                    userId: user.id,
                    courseId: course.id
                }
            });
            console.log(`Assigned ${course.title}`);
        } catch (e) {
            if (e.code === 'P2002') {
                console.log(`Already assigned ${course.title}`);
            } else {
                console.error(e);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
