import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const socketId = formData.get("socket_id") as string;
        const channel = formData.get("channel_name") as string;

        if (!socketId || !channel) {
            throw new Error("Missing required fields");
        }

        const authResponse = pusherServer.authorizeChannel(socketId, channel, {
            user_id: Math.random().toString(),
            user_info: {},
        });

        return NextResponse.json(authResponse);
    } catch (error) {
        console.error("Pusher auth error:", error);
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 400 }
        );
    }
}
