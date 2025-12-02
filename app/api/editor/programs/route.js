import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const programs = await prisma.program.findMany({
            include: {
                school: true,
            }
        });

        const formattedPrograms = programs.map(program => ({
            program_id: program.id,
            program_name: program.programName,
            program_code: program.programCode,
            school_name: program.school?.name
        }));

        return NextResponse.json({ programs: formattedPrograms });
    } catch (error) {
        console.error("Error fetching programs:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
