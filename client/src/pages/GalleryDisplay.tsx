import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Maximize2, Minimize2, Wifi, WifiOff, ImageIcon, Loader2 } from "lucide-react";

interface GalleryPhoto {
  id: string;
  fileUrl: string;
  uploaderName: string | null;
  uploadedAt: string | null;
}

interface GallerySession {
  id: string;
  eventName: string;
  isActive: boolean;
}

export default function GalleryDisplay() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [connected, setConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newPhotoIds, setNewPhotoIds] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError } = useQuery<{ session: GallerySession; photos: GalleryPhoto[] }>({
    queryKey: [`/api/gallery/${sessionId}`],
    queryFn: async () => {
      const res = await fetch(`/api/gallery/${sessionId}`);
      if (!res.ok) throw new Error("Session not found");
      return res.json();
    },
    retry: false,
  });

  // Load initial photos from API
  useEffect(() => {
    if (data?.photos) {
      setPhotos(data.photos);
    }
  }, [data]);

  // WebSocket connection
  const connect = useCallback(() => {
    if (!sessionId) return;
    let disposed = false;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/gallery?session=${sessionId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!disposed) setConnected(true);
    };

    ws.onmessage = (event) => {
      if (disposed) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "new_photo") {
          const photo: GalleryPhoto = msg.photo;
          setPhotos((prev) => {
            if (prev.find((p) => p.id === photo.id)) return prev;
            return [photo, ...prev];
          });
          // Highlight new photo briefly
          setNewPhotoIds((prev) => new Set(Array.from(prev).concat(photo.id)));
          setTimeout(() => {
            setNewPhotoIds((prev) => {
              const next = new Set(Array.from(prev));
              next.delete(photo.id);
              return next;
            });
          }, 3000);
        }
      } catch {}
    };

    ws.onclose = () => {
      if (disposed) return;
      setConnected(false);
      // Reconnect after 3s only if not disposed
      reconnectTimer.current = setTimeout(() => {
        if (!disposed) connect();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    return () => {
      disposed = true;
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.close();
    };
  }, [sessionId]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      cleanup?.();
    };
  }, [connect]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-white/50" />
      </div>
    );
  }

  if (isError || !data?.session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <ImageIcon className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">Gallery not found</p>
        </div>
      </div>
    );
  }

  const session = data.session;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur border-b border-white/10 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-wide">{session.eventName}</span>
          <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            {connected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-yellow-400">Reconnecting…</span>
              </>
            )}
          </div>
          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Gallery grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
            <div className="relative mb-6">
              <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-white/20" />
              </div>
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" />
            </div>
            <p className="text-white/50 text-lg font-light">Waiting for guests to share photos…</p>
            <p className="text-white/30 text-sm mt-2">Photos will appear here instantly</p>
          </div>
        ) : (
          <div
            className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3"
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`break-inside-avoid rounded-xl overflow-hidden border-2 transition-all duration-700 ${
                  newPhotoIds.has(photo.id)
                    ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-[1.02]"
                    : "border-white/5"
                }`}
                style={{
                  animation: newPhotoIds.has(photo.id) ? "none" : undefined,
                }}
              >
                <img
                  src={photo.fileUrl}
                  alt={photo.uploaderName ? `Photo by ${photo.uploaderName}` : "Guest photo"}
                  className="w-full object-cover"
                  loading="lazy"
                />
                {photo.uploaderName && (
                  <div className="bg-black/60 px-3 py-1.5">
                    <p className="text-xs text-white/70 truncate">📷 {photo.uploaderName}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom badge */}
      <div className="shrink-0 py-2 flex justify-center border-t border-white/5 bg-black/60">
        <span className="text-xs text-white/20">
          Powered by{" "}
          <a href="https://einvite.me" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">
            einvite.me
          </a>
        </span>
      </div>
    </div>
  );
}
