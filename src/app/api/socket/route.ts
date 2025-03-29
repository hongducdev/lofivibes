import { Server, Socket } from "socket.io";
import { NextResponse } from "next/server";

declare global {
    var io: Server | undefined;
}

let activeUsers = 0;

const SocketHandler = () => {
    if (global.io) {
        console.log("Socket is already running");
    } else {
        console.log("Socket is initializing");
        const io = new Server({
            path: "/api/socket",
            addTrailingSlash: false,
        });
        global.io = io;

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
