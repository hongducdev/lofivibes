import { pusherServer } from "@/lib/pusher";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const savedMessage = await prisma.message.create({
            data: {
                text: body.text,
                sender: body.sender,
                createdAt: body.timestamp ? new Date(body.timestamp) : new Date(),
            },
        });

        await pusherServer.trigger("chat", "message", savedMessage);

        return NextResponse.json(savedMessage);
    } catch (error) {
        console.error("Error saving message:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const messages = await prisma.message.findMany({
            take: 50,
            orderBy: {
                timestamp: "desc",
            },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
