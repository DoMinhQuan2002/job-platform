"use client";

import React, { useState } from "react";
import { Code, Globe, Award } from "lucide-react";
import { SkillColumn } from "./SkillColumn";
import { SkillItem } from "./SkillItem";
import { AddSkillModal } from "./AddSkillModal";
import { useSkills } from "../hooks/useSkills";
import type { SkillCategory } from "../types";

export const CandidateSkillsSection: React.FC = () => {
  const { categorizedSkills, isLoading, error, addSkill, removeSkill } = useSkills();
  const [modalCategory, setModalCategory] = useState<SkillCategory | null>(null);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-destructive rounded-lg border border-red-200">
        Không thể tải thông tin kỹ năng.
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-100 rounded-2xl skeleton animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-2xl skeleton animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-2xl skeleton animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Kỹ Năng */}
          <SkillColumn
            title="Kỹ năng"
            icon={<Code className="w-5 h-5 text-gray-700" strokeWidth={2.5} />}
            onAddClick={() => setModalCategory("SKILL")}
            gridMode={true}
          >
            {categorizedSkills.SKILL.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-2 py-4">Chưa có kỹ năng nào.</p>
            ) : (
              categorizedSkills.SKILL.map((item) => (
                <SkillItem key={item.id} item={item} onRemove={removeSkill} />
              ))
            )}
          </SkillColumn>

          {/* Column 2: Ngoại Ngữ */}
          <SkillColumn
            title="Ngoại ngữ"
            icon={<Globe className="w-5 h-5 text-gray-700" strokeWidth={2.5} />}
            onAddClick={() => setModalCategory("LANGUAGE")}
            gridMode={false}
          >
            {categorizedSkills.LANGUAGE.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Chưa có ngoại ngữ nào.</p>
            ) : (
              categorizedSkills.LANGUAGE.map((item) => (
                <SkillItem key={item.id} item={item} onRemove={removeSkill} />
              ))
            )}
          </SkillColumn>

          {/* Column 3: Chứng Chỉ */}
          <SkillColumn
            title="Chứng chỉ"
            icon={<Award className="w-5 h-5 text-gray-700" strokeWidth={2.5} />}
            onAddClick={() => setModalCategory("CERTIFICATE")}
            gridMode={false}
          >
            {categorizedSkills.CERTIFICATE.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Chưa có chứng chỉ nào.</p>
            ) : (
              categorizedSkills.CERTIFICATE.map((item) => (
                <SkillItem key={item.id} item={item} onRemove={removeSkill} />
              ))
            )}
          </SkillColumn>
        </div>
      )}

      {/* Reusable Modal */}
      <AddSkillModal
        isOpen={modalCategory !== null}
        onClose={() => setModalCategory(null)}
        category={modalCategory || "SKILL"}
        onAdd={addSkill}
      />
    </div>
  );
};
