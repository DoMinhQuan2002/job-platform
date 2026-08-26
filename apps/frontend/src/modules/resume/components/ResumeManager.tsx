"use client";

import React from "react";
import { ResumeUploadBox } from "./ResumeUploadBox";
import { ResumeList } from "./ResumeList";
import { useResumes } from "../hooks/useResumes";

export const ResumeManager: React.FC = () => {
  const {
    resumes,
    isLoading,
    error,
    uploadResume,
    setDefault,
    deleteResume,
  } = useResumes();

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-destructive rounded-lg border border-red-200">
        Đã có lỗi xảy ra khi tải danh sách CV. Vui lòng tải lại trang.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Quản lý CV</h1>
        <p className="text-[15px] text-muted-foreground">
          Tải lên, quản lý và sử dụng CV của bạn khi ứng tuyển.
        </p>
      </div>

      <ResumeUploadBox
        onUpload={uploadResume}
        currentCount={resumes.length}
        maxFilesCount={5}
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded skeleton animate-pulse" />
          <div className="h-24 w-full bg-gray-200 rounded-xl skeleton animate-pulse" />
          <div className="h-24 w-full bg-gray-200 rounded-xl skeleton animate-pulse" />
        </div>
      ) : (
        <ResumeList
          resumes={resumes}
          onSetDefault={setDefault}
          onDelete={deleteResume}
        />
      )}
    </div>
  );
};
