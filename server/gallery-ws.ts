import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

// Map of sessionId → set of connected WebSocket clients
const rooms = new Map<string, Set<WebSocket>>();

export function setupGalleryWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/gallery" });

  wss.on("connection", (ws, req) => {
    // Client sends ?session=<sessionId> as query param
    const url = new URL(req.url || "", "http://localhost");
    const sessionId = url.searchParams.get("session");

    if (!sessionId) {
      ws.close(1008, "session required");
      return;
    }

    // Join room
    if (!rooms.has(sessionId)) rooms.set(sessionId, new Set());
    rooms.get(sessionId)!.add(ws);

    ws.on("close", () => {
      rooms.get(sessionId)?.delete(ws);
      if (rooms.get(sessionId)?.size === 0) rooms.delete(sessionId);
    });

    ws.on("error", () => {
      rooms.get(sessionId)?.delete(ws);
    });

    // Send a welcome ping
    ws.send(JSON.stringify({ type: "connected", sessionId }));
  });

  return wss;
}

/** Broadcast a new-photo event to all clients watching a session */
export function broadcastNewPhoto(
  sessionId: string,
  photo: { id: string; fileUrl: string; uploaderName: string | null; uploadedAt: Date | null }
) {
  const clients = rooms.get(sessionId);
  if (!clients) return;
  const msg = JSON.stringify({ type: "new_photo", photo });
  Array.from(clients).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}
