const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.log('Please provide an email');
        return;
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            assignedCourses: {
                include: {
                    course: true
                }
            }
        }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log(`User: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`Role ID: ${user.roleId}`);
    console.log(`Assigned Courses: ${user.assignedCourses.length}`);
    user.assignedCourses.forEach(a => {
        console.log(`- ${a.course.title} (${a.course.courseCode})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
