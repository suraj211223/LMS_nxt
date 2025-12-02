import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const schools = await prisma.schools.findMany();
        return NextResponse.json(schools);
    } catch (error) {
        console.error("Error fetching schools:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
