"use client";

import { useCallback, useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth-token";
import { applicationsApi } from "../api";
import type { Application, ApplicationStatus } from "../types";

export const APPLICATIONS_CHANGED_EVENT = "jp-applications-change";

type ApplicationRow = Application & { job_id?: string | number };

function isCandidateToken(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  try {
    const encodedPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(encodedPayload)) as {
      role?: string;
      exp?: number;
    };
    if (!payload.role || (payload.exp && payload.exp * 1000 <= Date.now())) {
      return false;
    }
    return payload.role === "CANDIDATE";
  } catch {
    return false;
  }
}

function applicationJobId(app: ApplicationRow): string {
  const raw = app.jobId ?? app.job_id;
  return raw == null ? "" : String(raw);
}

export function isActiveApplicationStatus(status: ApplicationStatus): boolean {
  return status !== "WITHDRAWN";
}

export function findApplicationForJob(
  apps: ApplicationRow[],
  jobId: string | number,
): ApplicationRow | undefined {
  return apps.find((app) => applicationJobId(app) === String(jobId));
}

/** jobId → applicationId (bỏ qua đơn đã rút) */
export function useAppliedJobsMap() {
  const [appliedJobs, setAppliedJobs] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    if (!isCandidateToken()) {
      setAppliedJobs({});
      return;
    }

    try {
      const res = await applicationsApi.list();
      const map: Record<string, string> = {};
      for (const app of (res.data ?? []) as ApplicationRow[]) {
        if (!isActiveApplicationStatus(app.status)) continue;
        const jobId = applicationJobId(app);
        if (!jobId) continue;
        map[jobId] = String(app.id);
      }
      setAppliedJobs(map);
    } catch {
      setAppliedJobs({});
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => void refresh();
    window.addEventListener(APPLICATIONS_CHANGED_EVENT, onChange);
    window.addEventListener("jp-auth-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(APPLICATIONS_CHANGED_EVENT, onChange);
      window.removeEventListener("jp-auth-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return appliedJobs;
}

export function notifyApplicationsChanged() {
  window.dispatchEvent(new Event(APPLICATIONS_CHANGED_EVENT));
}

export function getAppliedApplicationId(
  map: Record<string, string>,
  jobId: string | number,
): string | undefined {
  return map[String(jobId)];
}
