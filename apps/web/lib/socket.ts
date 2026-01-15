import { io } from "socket.io-client";

let socketInstance: ReturnType<typeof io> | null = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000", {
      transports: ["websocket"]
    });
  }
  return socketInstance;
};
