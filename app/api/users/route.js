import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: { role: true, school: true },
            orderBy: { id: 'desc' }
        });

        const formatted = users.map(u => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
            email: u.email,
            role: u.role ? u.role.roleName.toLowerCase() : 'unknown',
            department: u.school ? u.school.name : 'N/A'
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Error fetching users:", error);
        return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { name, department, role, email, password } = await req.json();

        if (!name || !role || !email || !password) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        let targetRoleName = role;

        const roles = await prisma.role.findMany();
        const roleRecord = roles.find(r => r.roleName.toLowerCase() === targetRoleName.toLowerCase());

        if (!roleRecord) {
            return new NextResponse(`Invalid role: ${targetRoleName}. Available roles: ${roles.map(r => r.roleName).join(', ')}`, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                passwordHash: hashedPassword,
                roleId: roleRecord.id,
                schoolId: department ? parseInt(department) : null
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
    }
}
