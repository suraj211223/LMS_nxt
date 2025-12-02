import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const schools = await prisma.schools.findMany({
      select: {
        school_id: true,
        school_name: true,
      },
    });
    return NextResponse.json(schools);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
