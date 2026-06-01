import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, API_BASE } from "../lib/api";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const UploadButton = ({ onUploaded, label = "Upload", className = "", testid = "upload-btn" }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      // Server returns /api/uploads/... — prepend backend URL to make it absolute
      const url = data.url?.startsWith("http") ? data.url : `${BACKEND_URL}${data.url}`;
      onUploaded?.(url);
      toast.success("Image uploaded");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Upload failed";
      toast.error(typeof msg === "string" ? msg : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        data-testid={testid}
        className={`bg-primary text-white hover:bg-primary/90 transition rounded-xl px-4 h-12 text-sm font-medium flex items-center gap-2 disabled:opacity-60 ${className}`}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? "Uploading..." : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={onChange}
        className="hidden"
      />
    </>
  );
};
