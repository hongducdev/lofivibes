import { Server, Socket } from "socket.io";
import { NextResponse } from "next/server";

let activeUsers = 0;

const SocketHandler = (req: Request) => {
    if ((global as any).io) {
        console.log("Socket is already running");
    } else {
        console.log("Socket is initializing");
        const io = new Server({
            path: "/api/socket",
            addTrailingSlash: false,
        });
        (global as any).io = io;

        io.on("connection", (socket: Socket) => {
            activeUsers++;
            io.emit("activeUsers", activeUsers);

            socket.on("disconnect", () => {
                activeUsers--;
                io.emit("activeUsers", activeUsers);
            });
        });
    }

    return NextResponse.json({ success: true });
};

export { SocketHandler as GET, SocketHandler as POST };
