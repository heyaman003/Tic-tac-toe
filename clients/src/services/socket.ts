import { io, Socket } from "socket.io-client";

// Use relative path for Socket.IO through Nginx proxy
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket?.connected) {
      // Re-authenticate if socket exists but user changed
      this.socket.emit("authenticate", { userId });
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.socket?.emit("authenticate", { userId });
    });

    this.socket.on("authenticated", (data) => {
      console.log("Socket authenticated:", data);
      // Request online users after authentication
      this.socket?.emit("getOnlineUsers");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Online users
  getOnlineUsers(callback: (users: any[]) => void) {
    this.socket?.emit("getOnlineUsers");
    this.socket?.on("onlineUsers", callback);
  }

  // Invites
  sendInvite(senderId: string, receiverId: string) {
    this.socket?.emit("sendInvite", { senderId, receiverId });
  }

  acceptInvite(inviteId: string) {
    this.socket?.emit("acceptInvite", { inviteId });
  }

  rejectInvite(inviteId: string) {
    this.socket?.emit("rejectInvite", { inviteId });
  }

  onInviteReceived(callback: (data: any) => void) {
    this.socket?.on("inviteReceived", callback);
  }

  onInviteSent(callback: (data: any) => void) {
    this.socket?.on("inviteSent", callback);
  }

  onInviteError(callback: (data: any) => void) {
    this.socket?.on("inviteError", callback);
  }

  onInviteRejected(callback: (data: any) => void) {
    this.socket?.on("inviteRejected", callback);
  }

  // Game events
  onGameStarted(callback: (data: any) => void) {
    this.socket?.on("gameStarted", callback);
  }

  makeMove(gameId: string, userId: string, position: number) {
    this.socket?.emit("makeMove", { gameId, userId, position });
  }

  onGameUpdate(callback: (data: any) => void) {
    this.socket?.on("gameUpdate", callback);
  }

  onGameEnded(callback: (data: any) => void) {
    this.socket?.on("gameEnded", callback);
  }

  onMoveError(callback: (data: any) => void) {
    this.socket?.on("moveError", callback);
  }

  onOpponentDisconnected(callback: (data: any) => void) {
    this.socket?.on("opponentDisconnected", callback);
  }

  // Clean up listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export default new SocketService();
