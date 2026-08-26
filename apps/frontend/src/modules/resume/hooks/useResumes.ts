import { useState, useCallback, useEffect } from "react";
import { resumeApi } from "../api";
import type { Resume } from "../types";

export const useResumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await resumeApi.list();
      if (res.success && res.data) {
        setResumes(res.data);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadResume = async (file: File) => {
    try {
      // First resume is default automatically if it's the only one, handled by backend.
      const res = await resumeApi.upload(file);
      if (res.success && res.data) {
        // Optimistic update or refetch
        await fetchResumes();
        return res;
      }
      throw new Error(res.message);
    } catch (err: any) {
      throw err;
    }
  };

  const setDefault = async (id: string) => {
    try {
      // Optimistic update
      setResumes((prev) =>
        prev.map((r) => ({ ...r, isDefault: r.id === id }))
      );
      const res = await resumeApi.setDefault(id);
      if (!res.success) {
        // Revert on failure
        await fetchResumes();
        throw new Error(res.message);
      }
    } catch (err: any) {
      await fetchResumes();
      throw err;
    }
  };

  const deleteResume = async (id: string) => {
    try {
      const res = await resumeApi.remove(id);
      if (res.success) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  return {
    resumes,
    isLoading,
    error,
    uploadResume,
    setDefault,
    deleteResume,
    refetch: fetchResumes,
  };
};
