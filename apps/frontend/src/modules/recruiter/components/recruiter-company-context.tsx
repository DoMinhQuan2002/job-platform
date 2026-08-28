"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  recruiterJobsApi,
  type RecruiterCompany,
} from "@/services/recruiter-jobs.service";

type RecruiterCompanyContextValue = {
  company: RecruiterCompany | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

const RecruiterCompanyContext = createContext<RecruiterCompanyContextValue | null>(null);

export function RecruiterCompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<RecruiterCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    setLoading(true);
    setError(null);

    recruiterJobsApi
      .getCompany(controller.signal)
      .then((response) => {
        if (!ignore) setCompany(response.data);
      })
      .catch((reason: unknown) => {
        if (ignore) return;
        setCompany(null);
        setError(reason instanceof Error ? reason.message : "Không thể tải thông tin công ty.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const value = useMemo(
    () => ({ company, loading, error, reload }),
    [company, loading, error, reload],
  );

  return (
    <RecruiterCompanyContext.Provider value={value}>
      {children}
    </RecruiterCompanyContext.Provider>
  );
}

export function useRecruiterCompany() {
  const context = useContext(RecruiterCompanyContext);
  if (!context) {
    throw new Error("useRecruiterCompany phải được dùng bên trong RecruiterCompanyProvider");
  }
  return context;
}
