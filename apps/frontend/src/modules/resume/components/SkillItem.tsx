"use client";

import React from "react";
import { X, Award } from "lucide-react";
import { toast } from "sonner";
import type { CandidateSkill } from "../types";

interface SkillItemProps {
  item: CandidateSkill;
  onRemove: (id: string) => Promise<void>;
}

export const SkillItem: React.FC<SkillItemProps> = ({ item, onRemove }) => {
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await onRemove(item.id);
      toast.success("Đã xóa kỹ năng!");
    } catch (error) {
      toast.error("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setIsRemoving(false);
    }
  };

  // Helper to parse level (1-5 dots) from string
  const getDots = (levelStr: string | null) => {
    let score = 0;
    if (levelStr) {
      // Find the first number in the string
      const match = levelStr.match(/\d/);
      if (match) {
        score = parseInt(match[0], 10);
        if (score > 5) score = 5;
        if (score < 1) score = 1;
      }
    }
    
    return (
      <div className="flex gap-1 mt-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-4 h-1.5 rounded-full ${
              i <= score ? "bg-primary" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  if (item.category === "SKILL") {
    return (
      <div className="relative group bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl px-4 py-3 border border-transparent hover:border-gray-200">
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          title="Xóa"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <p className="font-semibold text-foreground text-sm mb-1">{item.name}</p>
        {getDots(item.level)}
      </div>
    );
  }

  if (item.category === "LANGUAGE") {
    // For languages, it's a list item style
    return (
      <div className="relative group py-3 border-b border-gray-100 last:border-0">
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="absolute top-3 right-0 p-1 text-gray-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white rounded-full"
          title="Xóa"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex justify-between items-start mb-1 pr-6">
          <p className="font-semibold text-foreground">{item.name}</p>
          {getDots(item.level)}
        </div>
        
        {/* If level contains non-number text (like "IELTS 6.5"), show it */}
        {item.level && item.level.replace(/\d/g, "").trim().length > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{item.level.split("-")[0]?.trim()}</span>
            <span>{item.level.split("-")[1]?.trim()}</span>
          </div>
        )}
      </div>
    );
  }

  // CERTIFICATE
  return (
    <div className="relative group flex gap-4 py-3 border-b border-gray-100 last:border-0">
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="absolute top-3 right-0 p-1 text-gray-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white rounded-full"
        title="Xóa"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
        <Award className="w-5 h-5 text-primary" strokeWidth={2} />
      </div>
      <div className="pr-6">
        <p className="font-semibold text-foreground text-sm leading-tight mb-1">
          {item.name}
        </p>
        {item.level && (
          <p className="text-sm text-muted-foreground">{item.level}</p>
        )}
      </div>
    </div>
  );
};
