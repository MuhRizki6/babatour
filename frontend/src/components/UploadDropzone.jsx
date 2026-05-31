import { useRef, useState, useCallback } from "react";
import { Upload, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const toAbs = (url) => (url?.startsWith("http") ? url : `${BACKEND_URL}${url}`);

export const UploadDropzone = ({ onUploaded, multiple = true, label = "Drag & drop images here" }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    setUploading(true);
    setProgress({ done: 0, total: arr.length });

    try {
      if (arr.length === 1) {
        const fd = new FormData();
        fd.append("file", arr[0]);
        const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        onUploaded?.([toAbs(data.url)]);
        toast.success("Image uploaded");
      } else {
        // Use bulk endpoint, max 20 per batch
        const urls = [];
        const chunkSize = 20;
        for (let i = 0; i < arr.length; i += chunkSize) {
          const chunk = arr.slice(i, i + chunkSize);
          const fd = new FormData();
          chunk.forEach((f) => fd.append("files", f));
          const { data } = await api.post("/admin/upload/bulk", fd, { headers: { "Content-Type": "multipart/form-data" } });
          (data.uploaded || []).forEach((u) => urls.push(toAbs(u.url)));
          (data.errors || []).forEach((e) => toast.error(`${e.filename}: ${e.error}`));
          setProgress({ done: Math.min(i + chunk.length, arr.length), total: arr.length });
        }
        if (urls.length > 0) {
          onUploaded?.(urls);
          toast.success(`Uploaded ${urls.length} image${urls.length > 1 ? "s" : ""}`);
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || "Upload failed";
      toast.error(typeof msg === "string" ? msg : "Upload failed");
    } finally {
      setUploading(false);
      setProgress({ done: 0, total: 0 });
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [onUploaded]);

  const onDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) handleFiles(files);
  };

  return (
    <div
      onDragEnter={onDrag}
      onDragOver={onDrag}
      onDragLeave={onDrag}
      onDrop={onDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      data-testid="upload-dropzone"
      className={`relative border-2 border-dashed rounded-2xl px-6 py-10 text-center transition cursor-pointer ${
        dragActive ? "border-accent bg-accent/5" : "border-soft hover:border-accent/60 bg-surface/50"
      } ${uploading ? "pointer-events-none opacity-80" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        data-testid="dropzone-file-input"
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <div className="text-sm text-primary font-medium">
            Uploading {progress.done} of {progress.total}...
          </div>
          <div className="w-48 h-2 bg-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-accent/10 grid place-items-center text-accent">
            <ImagePlus className="w-6 h-6" />
          </div>
          <div>
            <div className="font-serif-display text-primary text-lg">{label}</div>
            <div className="text-xs text-muted mt-1">
              or <span className="text-accent font-medium">click to browse</span> · max 10MB each · auto-converted to WebP @ 1600px
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
