import { useState, useCallback, useEffect } from "react";
import { skillsApi } from "../api";
import type { CandidateSkill, SkillCategory } from "../types";

export const useSkills = () => {
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMySkills = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await skillsApi.listMine();
      if (res.success && res.data) {
        setSkills(res.data);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSkill = async (skillId: string, level?: string | null): Promise<void> => {
    const res = await skillsApi.upsertMine({ skillId, level });
    if (res.success && res.data) {
      await fetchMySkills();
      return;
    }
    throw new Error(res.message || "Thêm kỹ năng thất bại");
  };

  const removeSkill = async (id: string) => {
    try {
      const res = await skillsApi.removeMine(id);
      if (res.success) {
        setSkills((prev) => prev.filter((s) => s.id !== id));
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchMySkills();
  }, [fetchMySkills]);

  // Derived state to separate into columns
  const categorizedSkills = {
    SKILL: skills.filter((s) => s.category === "SKILL"),
    LANGUAGE: skills.filter((s) => s.category === "LANGUAGE"),
    CERTIFICATE: skills.filter((s) => s.category === "CERTIFICATE"),
  };

  return {
    skills,
    categorizedSkills,
    isLoading,
    error,
    addSkill,
    removeSkill,
    refetch: fetchMySkills,
  };
};
