"use client";

import React from "react";
import { Info } from "lucide-react";
import { ResumeCard } from "./ResumeCard";
import type { Resume } from "../types";

interface ResumeListProps {
  resumes: Resume[];
  onSetDefault: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ResumeList: React.FC<ResumeListProps> = ({
  resumes,
  onSetDefault,
  onDelete,
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">
        Danh sách CV ({resumes.length})
      </h2>
      
      <div className="mb-8">
        {resumes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-border text-muted-foreground">
            Chưa có CV nào được tải lên.
          </div>
        ) : (
          resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onSetDefault={onSetDefault}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 flex gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-foreground/80">
          <p className="font-medium text-foreground mb-2">Lưu ý:</p>
          <ul className="list-disc pl-4 space-y-1.5">
            <li>CV mặc định sẽ được tự động đính kèm khi bạn ứng tuyển.</li>
            <li>Bạn có thể tạo nhiều phiên bản CV để phù hợp với từng vị trí ứng tuyển khác nhau.</li>
            <li>Hệ thống chỉ hỗ trợ định dạng PDF với dung lượng tối đa 10MB.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
