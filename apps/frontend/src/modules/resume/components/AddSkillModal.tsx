"use client";

import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { skillsApi } from "../api";
import type { Skill, SkillCategory } from "../types";

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: SkillCategory;
  onAdd: (skillId: string, level?: string) => Promise<void>;
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  category,
  onAdd,
}) => {
  const [catalog, setCatalog] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch catalog for this category
      skillsApi.listCatalog({ category }).then((res) => {
        if (res.success && res.data) setCatalog(res.data);
      });
      // Reset state
      setSearch("");
      setSelectedSkillId("");
      setLevel("");
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const filteredCatalog = catalog.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    try {
      setIsSubmitting(true);
      await onAdd(selectedSkillId, level || undefined);
      toast.success("Thêm thành công!");
      onClose();
    } catch (error) {
      toast.error("Thêm thất bại. Vui lòng thử lại.");
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
          <h2 className="text-lg font-bold text-foreground">
            {titles[category]}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Tìm kiếm từ hệ thống
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Gõ tên..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>

            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-100 rounded-lg bg-gray-50/50 p-1">
              {filteredCatalog.length === 0 ? (
                <p className="text-sm text-center py-4 text-muted-foreground">
                  Không tìm thấy kết quả phù hợp.
                </p>
              ) : (
                filteredCatalog.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkillId(skill.id)}
                    className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                      selectedSkillId === skill.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-gray-100 text-foreground"
                    }`}
                  >
                    {skill.name}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Thông tin bổ sung (Điểm, Cấp độ, Năm cấp)
            </label>
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder={category === "SKILL" ? "Ví dụ: 4" : category === "LANGUAGE" ? "Ví dụ: IELTS 6.5 - Khá" : "Ví dụ: 2023"}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-lg px-5 border-gray-200 text-foreground hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!selectedSkillId || isSubmitting}
              className="rounded-lg px-6 bg-primary text-white hover:bg-primary-hover shadow-sm"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu lại"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
