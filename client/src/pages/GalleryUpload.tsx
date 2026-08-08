import { useState, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Camera, Upload, CheckCircle2, Loader2, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GallerySession {
  id: string;
  eventName: string;
  isActive: boolean;
}

export default function GalleryUpload() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [uploaderName, setUploaderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session, isLoading, isError } = useQuery<GallerySession>({
    queryKey: [`/api/gallery/${sessionId}`],
    queryFn: async () => {
      const res = await fetch(`/api/gallery/${sessionId}`);
      if (!res.ok) throw new Error("Session not found");
      const data = await res.json();
      return data.session;
    },
    retry: false,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setStatus("idle");
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setStatus("uploading");
    setErrorMsg("");
    try {
      const form = new FormData();
      form.append("photo", selectedFile);
      if (uploaderName.trim()) form.append("uploaderName", uploaderName.trim());
      const res = await fetch(`/api/gallery/${sessionId}/photos`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      setStatus("success");
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="text-center max-w-sm">
          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Gallery Not Found</h1>
          <p className="text-muted-foreground text-sm">This gallery link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  if (!session.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="text-center max-w-sm">
          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Gallery Closed</h1>
          <p className="text-muted-foreground text-sm">Photo uploads for this event have ended. Thank you for celebrating with us!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col items-center justify-start p-6 pb-16">
      {/* Header */}
      <div className="w-full max-w-sm mt-8 mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-1.5 text-xs font-medium text-purple-600 border border-purple-100 mb-4">
          📸 Live Photo Gallery
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{session.eventName}</h1>
        <p className="text-sm text-muted-foreground">Share your photos — they'll appear on the live screen instantly!</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-white/60 p-6 space-y-5">

        {/* Success state */}
        {status === "success" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-lg font-semibold mb-1">Photo Shared!</h2>
            <p className="text-sm text-muted-foreground mb-6">Your photo is now live on the display screen 🎉</p>
            <Button
              onClick={() => setStatus("idle")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Share Another Photo
            </Button>
          </div>
        ) : (
          <>
            {/* Name field */}
            <div className="space-y-1.5">
              <Label htmlFor="uploader-name" className="text-sm font-medium">
                Your Name <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="uploader-name"
                placeholder="e.g. Sarah"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Photo picker */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Photo</Label>
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={preview} alt="Selected" className="w-full h-56 object-cover" />
                  <button
                    onClick={handleRemove}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-400 transition-colors flex flex-col items-center justify-center gap-2 text-purple-500"
                >
                  <Camera className="h-8 w-8" />
                  <span className="text-sm font-medium">Tap to take or choose a photo</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WEBP up to 10MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Error */}
            {status === "error" && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{errorMsg}</p>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || status === "uploading"}
              className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl h-12 text-base font-semibold"
            >
              {status === "uploading" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sharing…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Share to Live Screen
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground">
        Powered by{" "}
        <a href="https://einvite.me" className="text-purple-500 hover:underline" target="_blank" rel="noopener noreferrer">
          einvite.me
        </a>
      </p>
    </div>
  );
}
