const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const rolesData = [
    { id: 1, roleName: 'Admin', canEditCourses: true, canManageSystem: true, canUploadContent: true },
    { id: 2, roleName: 'Teacher', canEditCourses: true, canManageSystem: false, canUploadContent: true },
    { id: 3, roleName: 'Editor', canEditCourses: false, canManageSystem: false, canUploadContent: true }
];

const schoolsData = [
    { id: 1, name: 'School of Management' },
    { id: 4, name: 'School of Science' },
    { id: 8, name: 'School of Social Sciences' }
];

const programsData = [
    { id: 1, schoolId: 1, programName: 'Bachelor of Commerce', programCode: 'BCOM' },
    { id: 4, schoolId: 4, programName: 'Master of Science in Artificial Intelligence', programCode: 'MAI' },
    { id: 5, schoolId: 4, programName: 'Master of Computer Applications', programCode: 'MCA' },
    { id: 6, schoolId: 4, programName: 'Bachelor of Computer Applications', programCode: 'BCA' },
    { id: 7, schoolId: 4, programName: 'Master of Science in Data Science', programCode: 'MDS' },
    { id: 8, schoolId: 8, programName: 'Master of Arts in Economics', programCode: 'MAECO' }
];

const coursesData = [
    { id: 1, programId: 1, title: 'Banking Law & Operations - COM0101 - 2', courseCode: 'COM0101 - 2', status: 'Active' },
    { id: 2, programId: 1, title: 'Business Mathematics  Statistics', courseCode: 'BCOM-002', status: 'Active' },
    { id: 3, programId: 1, title: 'Communicative English - II', courseCode: 'BCOM-003', status: 'Active' },
    { id: 4, programId: 1, title: 'Corporate  Accounting - COMO201 - 2', courseCode: 'COMO201 - 2', status: 'Active' },
    { id: 5, programId: 1, title: 'Corporate Law & Administration - COMO102 - 2', courseCode: 'COMO102 - 2', status: 'Active' },
    { id: 6, programId: 1, title: 'Positive  Psychology', courseCode: 'BCOM-006', status: 'Active' },
    { id: 7, programId: 1, title: 'Spreadsheet for Business COMO161 - 2', courseCode: 'COMO161 - 2', status: 'Active' },
    { id: 22, programId: 4, title: 'Computational Mathematics - II', courseCode: 'MAI-OL404-2', status: 'Active' },
    { id: 23, programId: 4, title: 'Data Structures and Algorithm', courseCode: 'MAI-OL405-2', status: 'Active' },
    { id: 24, programId: 4, title: 'Deep Learining', courseCode: 'MAI-OL424-2', status: 'Active' },
    { id: 25, programId: 4, title: 'Java Programming', courseCode: 'MAI-OL525-2', status: 'Active' },
    { id: 26, programId: 4, title: 'Natural Language Processing', courseCode: 'MAI-OL526-2', status: 'Active' },
    { id: 27, programId: 5, title: 'Artificial Intelligence & Machine Learning', courseCode: 'MCA-OL-501-2', status: 'Active' },
    { id: 28, programId: 5, title: 'Data Communication & Computer Networks', courseCode: 'MCA-OL-402-2', status: 'Active' },
    { id: 29, programId: 5, title: 'Data Structures & Algorithms', courseCode: 'MCA-OL-403-2', status: 'Active' },
    { id: 30, programId: 5, title: 'Full Stack Development', courseCode: 'MCA-OL-404-2', status: 'Active' },
    { id: 31, programId: 5, title: 'Java Programming', courseCode: 'MCA-OL-405-2', status: 'Active' },
    { id: 32, programId: 6, title: 'Discrete mathematics', courseCode: 'BCA-OL-105-2', status: 'Active' },
    { id: 33, programId: 6, title: 'OPERATING SYSTEM', courseCode: 'BCA-OL-106-2', status: 'Active' },
    { id: 34, programId: 6, title: 'OBJECT ORIENTED PROGRAMMING USING C++', courseCode: 'BCA-OL-107-2', status: 'Active' },
    { id: 35, programId: 6, title: 'PRINCIPLES OF SOFTWARE DEVELOPMENT', courseCode: 'BCA-OL-108-2', status: 'Active' },
    { id: 36, programId: 6, title: 'FULL STACK DEVELOPMENT', courseCode: 'BCA-OL-209-2', status: 'Active' },
    { id: 37, programId: 7, title: 'Applied Regression Analysis', courseCode: 'MDSO405-2', status: 'Active' },
    { id: 38, programId: 7, title: 'Data Structures & Algorithms', courseCode: 'MDSO503-3', status: 'Active' },
    { id: 39, programId: 7, title: 'Data Visualization', courseCode: 'MDSO461-2', status: 'Active' },
    { id: 40, programId: 7, title: 'Database Technologies', courseCode: 'MDSO404-2', status: 'Active' },
    { id: 41, programId: 7, title: 'Machine Learning', courseCode: 'MDSO502-2', status: 'Active' },
    { id: 42, programId: 7, title: 'Machine Learning Lab', courseCode: 'MDSO512-2', status: 'Active' },
    { id: 43, programId: 8, title: 'Econometric Methods', courseCode: 'ECO409-2', status: 'Active' },
    { id: 44, programId: 8, title: 'Economics of Growth and Development', courseCode: 'ECO406-2', status: 'Active' },
    { id: 45, programId: 8, title: 'History of Economic Thought', courseCode: 'ECO408-2', status: 'Active' },
    { id: 46, programId: 8, title: 'International Trade and Finance', courseCode: 'ECO410-2', status: 'Active' },
    { id: 47, programId: 8, title: 'Public Finance and policy', courseCode: 'ECO407-2', status: 'Active' }
];

const usersData = [
    { id: 9, roleId: 1, email: 'admin1@clg.edu', firstName: 'Admin', lastName: '1' },
    { id: 10, roleId: 2, email: 'maria.fulgen@clg.edu', firstName: 'Maria', lastName: 'Fulgen' },
    { id: 11, roleId: 2, email: 'pooja.jain@clg.edu', firstName: 'Pooja', lastName: 'Jain' },
    { id: 12, roleId: 2, email: 'sudhanshu.n@clg.edu', firstName: 'Sudhanshu', lastName: 'N' },
    { id: 13, roleId: 2, email: 'lakshmi.b@clg.edu', firstName: 'Lakshmi', lastName: 'B' },
    { id: 14, roleId: 2, email: 'shaeril.michael.almeida@christuniversity.in', firstName: 'Shaeril', lastName: 'Almeida' },
    { id: 15, roleId: 2, email: 'Jagadesh.chander@christuniversity.in', firstName: 'Jagadeesh', lastName: '' },
    { id: 16, roleId: 2, email: 'geetanjali.purswani@clg.edu', firstName: 'Geetanjali', lastName: 'Purswani' },
    { id: 25, roleId: 2, email: 'jinny.john@christuniversity.in', firstName: 'Jinny', lastName: 'John' },
    { id: 26, roleId: 2, email: 'james.joseph@christuniversity.in', firstName: 'James', lastName: 'Joseph' },
    { id: 27, roleId: 2, email: 'vaidhehi.v@christuniversity.in', firstName: 'Vaidhehi', lastName: 'V' },
    { id: 28, roleId: 2, email: 'binayak.dutta@christuniversity.in', firstName: 'Binayak', lastName: 'Dutta' },
    { id: 29, roleId: 2, email: 'suresh.kalaimani@christuniversity.in', firstName: 'Suresh', lastName: 'Kalaimani' },
    { id: 30, roleId: 2, email: 'cynthia.t@christuniversity.in', firstName: 'Cynthia', lastName: 'T' },
    { id: 31, roleId: 2, email: 'nizar.banu@christuniversity.in', firstName: 'Nizar', lastName: 'Banu' },
    { id: 32, roleId: 2, email: 'nisha.varghese@christuniversity.in', firstName: 'Nisha', lastName: 'Varghese' },
    { id: 33, roleId: 2, email: 'manasa.kulkarni@christuniversity.in', firstName: 'Manasa', lastName: 'Kulkarni' },
    { id: 34, roleId: 2, email: 'thirunavukkarasu.v@christuniversity.in', firstName: 'Thirunavukkarasu', lastName: 'V' },
    { id: 35, roleId: 2, email: 'rohini.v@christuniversity.in', firstName: 'Rohini', lastName: 'V' },
    { id: 36, roleId: 2, email: 'deepa.v.jose@christuniversity.in', firstName: 'Deepa', lastName: 'V Jose' },
    { id: 37, roleId: 2, email: 'sandeep.j@christuniversity.in', firstName: 'Sandeep', lastName: 'J' },
    { id: 43, roleId: 2, email: 'puneeth.v@christuniversity.in', firstName: 'Puneeth', lastName: 'V' },
    { id: 44, roleId: 2, email: 'sangeetha.g@christuniversity.in', firstName: 'Sangeetha', lastName: 'G' },
    { id: 45, roleId: 2, email: 'beaulah.s@christuniversity.in', firstName: 'Beaulah', lastName: 'S' },
    { id: 46, roleId: 2, email: 'sridevi.r@christuniversity.in', firstName: 'Sridevi', lastName: 'R' },
    { id: 47, roleId: 2, email: 'nismon.rio@christuniversity.in', firstName: 'Nismon', lastName: 'Rio' },
    { id: 48, roleId: 2, email: 'laxmi.basappa@christuniversity.in', firstName: 'Laxmi', lastName: 'Basappa' },
    { id: 49, roleId: 2, email: 'manimekala.b@christuniversity.in', firstName: 'Manimekala', lastName: 'B' },
    { id: 50, roleId: 2, email: 'balakrishnan.c@christuniversity.in', firstName: 'Balakrishnan', lastName: 'C' },
    { id: 51, roleId: 2, email: 'deepa.s@christuniversity.in', firstName: 'Deepa', lastName: 'S' },
    { id: 52, roleId: 2, email: 'jayapriya.j@christuniversity.in', firstName: 'Jayapriya', lastName: 'J' },
    { id: 53, roleId: 2, email: 'umamaheswari.d@christuniversity.in', firstName: 'Umamaheswari', lastName: 'D' },
    { id: 56, roleId: 2, email: 'arpita.teacher@clg.edu', firstName: 'Arpita', lastName: '' },
    { id: 57, roleId: 2, email: 'anjali.pk@clg.edu', firstName: 'Anjali', lastName: 'PK' },
    { id: 59, roleId: 2, email: 'gerard.rassendren@clg.edu', firstName: 'Gerard', lastName: 'Rassendren' },
    { id: 60, roleId: 2, email: 'sankar.varma@clg.edu', firstName: 'Sankar', lastName: 'Varma' },
    { id: 62, roleId: 2, email: 'aleena.teacher@clg.edu', firstName: 'Aleena', lastName: '' }
];

const assignmentsData = [
    { id: 8, userId: 10, courseId: 1 },
    { id: 9, userId: 11, courseId: 2 },
    { id: 10, userId: 12, courseId: 3 },
    { id: 11, userId: 13, courseId: 4 },
    { id: 12, userId: 14, courseId: 5 },
    { id: 13, userId: 15, courseId: 6 },
    { id: 14, userId: 16, courseId: 7 },
    { id: 15, userId: 25, courseId: 22 },
    { id: 16, userId: 26, courseId: 22 },
    { id: 17, userId: 27, courseId: 23 },
    { id: 28, userId: 27, courseId: 29 },
    { id: 18, userId: 28, courseId: 23 },
    { id: 29, userId: 28, courseId: 29 },
    { id: 19, userId: 29, courseId: 24 },
    { id: 30, userId: 29, courseId: 30 },
    { id: 20, userId: 30, courseId: 24 },
    { id: 31, userId: 30, courseId: 30 },
    { id: 32, userId: 30, courseId: 31 },
    { id: 21, userId: 31, courseId: 25 },
    { id: 22, userId: 32, courseId: 26 },
    { id: 23, userId: 33, courseId: 26 },
    { id: 24, userId: 34, courseId: 27 },
    { id: 25, userId: 35, courseId: 27 },
    { id: 26, userId: 36, courseId: 28 },
    { id: 27, userId: 37, courseId: 28 },
    { id: 33, userId: 43, courseId: 32 },
    { id: 34, userId: 44, courseId: 33 },
    { id: 35, userId: 45, courseId: 34 },
    { id: 36, userId: 46, courseId: 35 },
    { id: 37, userId: 47, courseId: 36 },
    { id: 38, userId: 48, courseId: 37 },
    { id: 39, userId: 49, courseId: 38 },
    { id: 40, userId: 50, courseId: 40 },
    { id: 41, userId: 51, courseId: 40 },
    { id: 42, userId: 52, courseId: 41 },
    { id: 44, userId: 52, courseId: 42 },
    { id: 43, userId: 53, courseId: 41 },
    { id: 45, userId: 53, courseId: 42 },
    { id: 46, userId: 56, courseId: 43 },
    { id: 48, userId: 56, courseId: 44 },
    { id: 51, userId: 56, courseId: 46 },
    { id: 47, userId: 57, courseId: 44 },
    { id: 49, userId: 59, courseId: 45 },
    { id: 50, userId: 60, courseId: 45 },
    { id: 52, userId: 62, courseId: 47 }
];

async function main() {
    // ... (rest of main implementation from previous attempt)
    console.log('Clearing existing data...');
    // Delete in reverse dependency order
    await prisma.userCourseAssignment.deleteMany({});
    await prisma.unitMaterial.deleteMany({});
    await prisma.contentscript.deleteMany({});
    await prisma.contentItem.deleteMany({});
    await prisma.courseSection.deleteMany({});
    await prisma.courseSemester.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.program.deleteMany({});
    await prisma.school.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});

    console.log('Restoring data from SQL dump info...');

    // 1. Schools
    for (const s of schoolsData) {
        await prisma.school.create({ data: s });
    }

    // 2. Roles
    for (const r of rolesData) {
        await prisma.role.create({ data: r });
    }

    // 3. Programs
    for (const p of programsData) {
        await prisma.program.create({ data: p });
    }

    // 4. Courses
    for (const c of coursesData) {
        await prisma.course.create({ data: c });
    }

    // 5. Users
    const passwordHash = await bcrypt.hash('password123', 10);
    for (const u of usersData) {
        await prisma.user.create({
            data: {
                id: u.id,
                roleId: u.roleId,
                email: u.email,
                passwordHash,
                firstName: u.firstName,
                lastName: u.lastName
            }
        });
    }

    // 6. Assignments
    for (const a of assignmentsData) {
        await prisma.userCourseAssignment.create({
            data: {
                id: a.id,
                userId: a.userId,
                courseId: a.courseId
            }
        });
    }

    console.log('Finished restoring data.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
