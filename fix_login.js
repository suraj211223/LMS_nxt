const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const email = 'manasa.kulkarni@christuniversity.in';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true }
    });

    if (user) {
        console.log('User found:', user);
        // Reset password to 'password123' just in case
        const passwordHash = await bcrypt.hash('password123', 10);
        await prisma.user.update({
            where: { email },
            data: { passwordHash }
        });
        console.log('Password updated to password123');
    } else {
        console.log('User NOT found. Creating...');
        // Create the user
        // First ensure Teacher role exists
        let role = await prisma.role.findUnique({ where: { roleName: 'Teacher' } });
        if (!role) {
            role = await prisma.role.create({
                data: { roleName: 'Teacher', canEditCourses: true, canUploadContent: true }
            });
        }

        const passwordHash = await bcrypt.hash('password123', 10);
        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName: 'Manasa',
                lastName: 'Kulkarni',
                roleId: role.id
            }
        });
        console.log('User created:', newUser);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
