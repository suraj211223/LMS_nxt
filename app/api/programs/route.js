import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const programs = await prisma.programs.findMany({
            include: {
                schools: true,
            }
        });

        return NextResponse.json(programs);
    } catch (error) {
        console.error("Error fetching programs:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
