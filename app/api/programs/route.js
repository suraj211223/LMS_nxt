import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const programs = await prisma.program.findMany({
            include: {
                school: true, // Correct relation name is singular 'school' based on schema
            }
        });

        return NextResponse.json(programs);
    } catch (error) {
        console.error("Error fetching programs:", error);
        return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
    }
}
