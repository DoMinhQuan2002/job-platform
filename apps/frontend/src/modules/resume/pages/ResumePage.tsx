"use client";

import React from "react";
import { ResumeManager } from "../components/ResumeManager";
import { CandidateSkillsSection } from "../components/CandidateSkillsSection";

export const ResumePage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* 
        - ResumeManager: Dành cho màn Quản lý CV
        - CandidateSkillsSection: Dành cho màn Tổng quan hồ sơ
      */}
      
      <div className="mb-12">
        <ResumeManager />
      </div>

      <div className="border-t border-gray-200 pt-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">Thử nghiệm Component Kỹ năng (Dành cho Bình export)</h2>
          <p className="text-muted-foreground text-sm">Component CandidateSkillsSection bên dưới có thể được đem nhúng vào trang Tổng quan hồ sơ.</p>
        </div>
        <CandidateSkillsSection />
      </div>
    </div>
  );
};
