"use client";

import React from "react";
import { Plus } from "lucide-react";

interface SkillColumnProps {
  title: string;
  icon: React.ReactNode;
  onAddClick: () => void;
  children: React.ReactNode;
  gridMode?: boolean;
}

export const SkillColumn: React.FC<SkillColumnProps> = ({
  title,
  icon,
  onAddClick,
  children,
  gridMode = false,
}) => {
  return (
    <div className="bg-[#fcfaf8] border border-gray-100 rounded-2xl p-5 md:p-6 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-foreground">
          {icon}
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm
        </button>
      </div>

      <div
        className={`flex-1 ${
          gridMode ? "grid grid-cols-2 gap-3" : "flex flex-col gap-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};
