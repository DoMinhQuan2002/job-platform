import { useState, useCallback, useEffect } from "react";
import { skillsApi } from "../api";
import type { CandidateSkill, SkillLevel } from "../types";

export const useSkills = () => {
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMySkills = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await skillsApi.listMine();
      if (res.success && res.data) {
        setSkills(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load skills"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSkill = async (skillId: string, level: SkillLevel): Promise<void> => {
    const res = await skillsApi.attachMine({ skillId, level });
    if (res.success && res.data) {
      await fetchMySkills();
      return;
    }
    throw new Error(res.message || "Thêm kỹ năng thất bại");
  };

  const updateSkillLevel = async (id: string, level: SkillLevel): Promise<void> => {
    const res = await skillsApi.updateLevel(id, { level });
    if (res.success && res.data) {
      setSkills((prev) => prev.map((s) => (s.id === id ? res.data! : s)));
      return;
    }
    throw new Error(res.message || "Cập nhật cấp độ thất bại");
  };

  const removeSkill = async (id: string): Promise<void> => {
    const res = await skillsApi.removeMine(id);
    if (res.success) {
      setSkills((prev) => prev.filter((s) => s.id !== id));
      return;
    }
    throw new Error(res.message || "Xóa kỹ năng thất bại");
  };

  useEffect(() => {
    void fetchMySkills();
  }, [fetchMySkills]);

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
    updateSkillLevel,
    removeSkill,
    refetch: fetchMySkills,
  };
};
