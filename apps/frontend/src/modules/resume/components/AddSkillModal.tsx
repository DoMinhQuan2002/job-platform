"use client";

import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { skillsApi } from "../api";
import { SKILL_LEVELS } from "../lib/skills";
import type { Skill, SkillCategory, SkillLevel } from "../types";

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: SkillCategory;
  onAdd: (skillId: string, level: SkillLevel) => Promise<void>;
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  category,
  onAdd,
}) => {
  const [catalog, setCatalog] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [level, setLevel] = useState<SkillLevel>("INTERMEDIATE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    skillsApi.listCatalog({ category }).then((res) => {
      if (res.success && res.data) setCatalog(res.data);
    });
    setSearch("");
    setSelectedSkillId("");
    setLevel("INTERMEDIATE");
  }, [isOpen, category]);

  if (!isOpen) return null;

  const filteredCatalog = catalog.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    try {
      setIsSubmitting(true);
      await onAdd(selectedSkillId, level);
      toast.success("Thêm thành công!");
      onClose();
    } catch {
      toast.error("Thêm thất bại. Kiểm tra cấp độ hoặc skill đã tồn tại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const titles = {
    SKILL: "Thêm Kỹ năng mới",
    LANGUAGE: "Thêm Ngoại ngữ mới",
    CERTIFICATE: "Thêm Chứng chỉ mới",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-toastIn">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-foreground">{titles[category]}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Tìm kiếm từ hệ thống
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Gõ tên..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 p-1">
              {filteredCatalog.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Không tìm thấy kết quả phù hợp.
                </p>
              ) : (
                filteredCatalog.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkillId(skill.id)}
                    className={`cursor-pointer rounded-md px-3 py-2 text-sm transition-colors ${
                      selectedSkillId === skill.id
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground hover:bg-gray-100"
                    }`}
                  >
                    {skill.name}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">Cấp độ</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as SkillLevel)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {SKILL_LEVELS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-lg border-gray-200 px-5 text-foreground hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!selectedSkillId || isSubmitting}
              className="rounded-lg bg-primary px-6 text-white shadow-sm hover:bg-primary-hover"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu lại"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
