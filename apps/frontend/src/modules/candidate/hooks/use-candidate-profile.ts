"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api-error";
import { candidateApi } from "../api";
import type {
  AccountUser,
  CandidateProfile,
  EducationFormInput,
  UpdateCandidateProfileInput,
  WorkExperienceFormInput,
} from "../types";

type UseCandidateProfileResult = {
  profile: CandidateProfile | null;
  account: AccountUser | null;
  loading: boolean;
  error: string | null;
  unauthorized: boolean;
  saving: boolean;
  refresh: () => Promise<void>;
  updateProfile: (input: UpdateCandidateProfileInput) => Promise<void>;
  createEducation: (input: EducationFormInput) => Promise<void>;
  updateEducation: (id: string, input: Partial<EducationFormInput>) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  createWorkExperience: (input: WorkExperienceFormInput) => Promise<void>;
  updateWorkExperience: (
    id: string,
    input: Partial<WorkExperienceFormInput>,
  ) => Promise<void>;
  deleteWorkExperience: (id: string) => Promise<void>;
};

export function useCandidateProfile(): UseCandidateProfileResult {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);
    setUnauthorized(false);
    try {
      const [profileRes, accountRes] = await Promise.all([
        candidateApi.getMe(),
        candidateApi.getAccountMe().catch(() => null),
      ]);
      setProfile(profileRes.data);
      if (accountRes?.data) {
        setAccount(accountRes.data);
      }
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setUnauthorized(true);
        setError("Bạn cần đăng nhập để xem hồ sơ nghề nghiệp.");
      } else {
        setError(err instanceof Error ? err.message : "Không tải được hồ sơ");
      }
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runMutation = async (
    action: () => Promise<void>,
    options?: { skipRefresh?: boolean },
  ) => {
    setSaving(true);
    setError(null);
    try {
      await action();
      if (!options?.skipRefresh) {
        await refresh({ silent: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thao tác thất bại");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    account,
    loading,
    error,
    unauthorized,
    saving,
    refresh,
    updateProfile: (input) =>
      runMutation(
        async () => {
          const response = await candidateApi.updateMe(input);
          setProfile(response.data);
        },
        { skipRefresh: true },
      ),
    createEducation: (input) =>
      runMutation(async () => {
        await candidateApi.createEducation(input);
      }),
    updateEducation: (id, input) =>
      runMutation(async () => {
        await candidateApi.updateEducation(id, input);
      }),
    deleteEducation: (id) =>
      runMutation(async () => {
        await candidateApi.deleteEducation(id);
      }),
    createWorkExperience: (input) =>
      runMutation(async () => {
        await candidateApi.createWorkExperience(input);
      }),
    updateWorkExperience: (id, input) =>
      runMutation(async () => {
        await candidateApi.updateWorkExperience(id, input);
      }),
    deleteWorkExperience: (id) =>
      runMutation(async () => {
        await candidateApi.deleteWorkExperience(id);
      }),
  };
}
