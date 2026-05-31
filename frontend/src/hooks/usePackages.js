import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Hook to fetch all public packages (with fallback to empty array)
export function usePackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    api.get("/packages/public")
      .then((r) => { if (!cancel) setPackages(r.data || []); })
      .catch((e) => { if (!cancel) setError(e); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, []);

  return { packages, loading, error };
}

// Hook to fetch single package by id
export function usePackage(id) {
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    let cancel = false;
    api.get(`/packages/public/${id}`)
      .then((r) => { if (!cancel) setPkg(r.data); })
      .catch((e) => { if (!cancel) setNotFound(e?.response?.status === 404); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [id]);

  return { pkg, loading, notFound };
}
