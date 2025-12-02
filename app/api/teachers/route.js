import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const teachers = await prisma.teachers.findMany();
        return NextResponse.json(teachers);
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
