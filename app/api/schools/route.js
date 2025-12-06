import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const schools = await prisma.school.findMany();
        return NextResponse.json(schools);
    } catch (error) {
        console.error("Error fetching schools:", error);
        return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { name } = await req.json();

        if (!name) {
            return new NextResponse("School name is required", { status: 400 });
        }

        const newSchool = await prisma.school.create({
            data: {
                name: name,
            },
        });

        return NextResponse.json(newSchool);
    } catch (error) {
        console.error("Error creating school:", error);
        return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
    }
}
