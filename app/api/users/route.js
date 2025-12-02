import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { name, department, role, email, password } = await req.json();

        if (!name || !role || !email || !password) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let user;
        if (role === 'teacher') {
            user = await prisma.teachers.create({
                data: {
                    teacher_name: name,
                    teacher_email: email,
                    password: hashedPassword,
                }
            });
        } else if (role === 'admin') {
            user = await prisma.admins.create({
                data: {
                    admin_name: name,
                    admin_email: email,
                    password: hashedPassword,
                }
            });
        } else if (role === 'editor') {
            user = await prisma.editors.create({
                data: {
                    editor_name: name,
                    editor_email: email,
                    password: hashedPassword,
                }
            });
        } else {
            return new NextResponse("Invalid role", { status: 400 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
