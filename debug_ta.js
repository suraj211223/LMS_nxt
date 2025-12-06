const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'ta2@CU.in';
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: true,
            assignedCourses: {
                include: { course: true }
            }
        }
    });

    if (!user) {
        console.log(`User ${email} not found.`);
        return;
    }

    console.log(`User: ${user.firstName} ${user.lastName} (ID: ${user.id})`);
    console.log(`Role: ${user.role ? user.role.roleName : 'None'} (ID: ${user.roleId})`);
    console.log(`Password Hash: ${user.passwordHash}`); // Just to see format/length

    if (user.assignedCourses.length === 0) {
        console.log("No courses assigned.");
    } else {
        console.log("Assigned Courses:");
        user.assignedCourses.forEach(a => {
            console.log(` - ID: ${a.course.id}, Code: ${a.course.courseCode}, Title: ${a.course.title}`);
        });
    }

    // Also check available courses to verify if "AI&ML" exists
    const aiml = await prisma.course.findFirst({
        where: { title: { contains: 'AI' } }
    });
    if (aiml) {
        console.log(`Found potential AI course: ${aiml.title} (ID: ${aiml.id})`);
    } else {
        console.log("No course with 'AI' in title found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
