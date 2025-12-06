import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        if (!id) {
            return new NextResponse("User ID required", { status: 400 });
        }

        // Force delete user - CASCADE will handle assignments
        await prisma.user.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
    }
}
