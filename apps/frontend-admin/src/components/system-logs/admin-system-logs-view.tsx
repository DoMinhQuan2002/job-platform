"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  ChevronDown,
  FileClock,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import {
  adminSystemLogsApi,
  type SystemLogItem,
  type PaginationMeta,
} from "@/services/admin-system-logs.service";
import {
  formatLogDateTime,
  formatOperationName,
  formatTargetTypeName,
  getActionCategory,
  getUserDisplayName,
  type ActivityCategory,
} from "./system-log-helpers";
import { SystemLogDrawer } from "./system-log-drawer";

export function AdminSystemLogsView() {
  // Data States
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategory>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Sort State (desc or asc)
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Selected Log for Details Drawer
  const [selectedLog, setSelectedLog] = useState<SystemLogItem | null>(null);

  // Fetch Logs Effect
  useEffect(() => {
    let isIgnored = false;
    const controller = new AbortController();

    adminSystemLogsApi
      .list(
        {
          page: pagination.page,
          limit: pagination.limit,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
        controller.signal
      )
      .then((res) => {
        if (!isIgnored) {
          setLogs(res.items);
          setPagination(res.pagination);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!isIgnored && !controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách nhật ký từ máy chủ."
          );
        }
      })
      .finally(() => {
        if (!isIgnored && !controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      isIgnored = true;
      controller.abort();
    };
  }, [pagination.page, pagination.limit, fromDate, toDate, reloadKey]);

  // Client-side filtering & sorting on the current page logs
  const filteredAndSortedLogs = useMemo(() => {
    let result = [...logs];

    // Filter by Activity Category (THÊM, SỬA, XÓA, ĐĂNG NHẬP, ĐĂNG XUẤT)
    if (categoryFilter !== "ALL") {
      result = result.filter((log) => {
        const cat = getActionCategory(log.action);
        return cat.key === categoryFilter;
      });
    }

    // Filter by Search Term (Nội dung, người thực hiện, đối tượng, action)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((log) => {
        const desc = (log.description || "").toLowerCase();
        const actionStr = (log.action || "").toLowerCase();
        const opName = formatOperationName(log.action).toLowerCase();
        const target = formatTargetTypeName(log.targetType, log.targetLabel).toLowerCase();
        const userName = (log.user?.fullName || "").toLowerCase();
        const userEmail = (log.user?.email || "").toLowerCase();
        const ip = (log.ipAddress || "").toLowerCase();

        return (
          desc.includes(q) ||
          actionStr.includes(q) ||
          opName.includes(q) ||
          target.includes(q) ||
          userName.includes(q) ||
          userEmail.includes(q) ||
          ip.includes(q)
        );
      });
    }

    // Sort order by Created Date
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [logs, categoryFilter, searchTerm, sortOrder]);

  // Handlers
  const handleApplyFilter = () => {
    setIsLoading(true);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setReloadKey((k) => k + 1);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setSearchTerm("");
    setCategoryFilter("ALL");
    setFromDate("");
    setToDate("");
    setSortOrder("desc");
    setPagination((prev) => ({ ...prev, page: 1 }));
    setReloadKey((k) => k + 1);
  };

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleSelectLog = (log: SystemLogItem) => {
    if (selectedLog?.id === log.id) {
      setSelectedLog(null);
    } else {
      setSelectedLog(log);
    }
  };

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  return (
    <div className="space-y-6">
      {/* BEGIN: Breadcrumbs & Page Heading */}
      <div>
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-slate-500 font-medium select-none mb-1.5"
        >
          <Link
            href="/admin"
            className="hover:text-blue-600 transition-colors"
          >
            Trang chủ
          </Link>
          <span className="text-slate-400">›</span>
          <span className="text-slate-800 font-semibold">Nhật ký hệ thống</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Nhật ký hệ thống
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xem log các hoạt động quan trọng được ghi nhận trong hệ thống.
            </p>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>
      {/* END: Breadcrumbs & Page Heading */}

      {/* BEGIN: Filter Panel Toolbar */}
      <section
        className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs"
        data-purpose="filter-bar"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search Input */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo người thực hiện, nội dung, hành động..."
                className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Thời gian (Từ ngày → Đến ngày)
            </label>
            <div className="relative flex items-center border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-0 text-xs border-0 focus:ring-0 text-slate-700 font-medium bg-transparent cursor-pointer"
                title="Từ ngày"
              />
              <span className="text-slate-400 px-1 text-xs select-none">→</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-0 text-xs border-0 focus:ring-0 text-slate-700 font-medium bg-transparent cursor-pointer"
                title="Đến ngày"
              />
              <span className="text-slate-400 ml-1 shrink-0 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Activity Type Selector */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Loại hoạt động
            </label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ActivityCategory)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-slate-700 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer font-medium"
              >
                <option value="ALL">Tất cả</option>
                <option value="CREATE">THÊM</option>
                <option value="UPDATE">SỬA</option>
                <option value="DELETE">XÓA</option>
                <option value="LOGIN">ĐĂNG NHẬP</option>
                <option value="LOGOUT">ĐĂNG XUẤT</option>
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Filter Submit Button */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={handleApplyFilter}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Lọc</span>
            </button>
          </div>
        </div>
      </section>
      {/* END: Filter Panel Toolbar */}

      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="font-semibold underline hover:text-rose-950 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      )}

      {/* BEGIN: Main Content Area (Table + Optional Details Drawer) */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Table Container */}
        <section
          className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex-1 w-full min-w-0 flex flex-col justify-between"
          data-purpose="log-list-table"
        >
          <div>
            {/* Table Header with Total Badge */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-slate-800">
                  Danh sách nhật ký
                </h3>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {pagination.total} bản ghi
                </span>
              </div>

              {selectedLog && (
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-md">
                  Đang xem chi tiết log #{selectedLog.id}
                </span>
              )}
            </div>

            {/* Table Element */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 min-w-[760px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center" scope="col">
                      STT
                    </th>
                    <th
                      className="py-3 px-4 whitespace-nowrap cursor-pointer hover:text-blue-600 transition-colors"
                      scope="col"
                      onClick={handleToggleSort}
                      title="Nhấn để đổi chiều sắp xếp thời gian"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Thời gian</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 whitespace-nowrap" scope="col">
                      Người thực hiện
                    </th>
                    <th className="py-3 px-4 whitespace-nowrap" scope="col">
                      Loại
                    </th>
                    <th className="py-3 px-4" scope="col">
                      Nội dung
                    </th>
                    <th className="py-3 px-4 whitespace-nowrap" scope="col">
                      Đối tượng
                    </th>
                    <th className="py-3 px-4 text-center w-16" scope="col">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    // Loading Skeletons
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-3.5 px-4 text-center">
                          <div className="h-3 w-4 bg-slate-200 rounded mx-auto" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="h-3 w-28 bg-slate-200 rounded" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
                            <div className="h-3 w-16 bg-slate-200 rounded" />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="h-4 w-12 bg-slate-200 rounded" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="h-3 w-48 bg-slate-200 rounded" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="h-3 w-24 bg-slate-200 rounded" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="h-4 w-4 bg-slate-200 rounded mx-auto" />
                        </td>
                      </tr>
                    ))
                  ) : filteredAndSortedLogs.length === 0 ? (
                    // Empty State
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileClock className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                          <span className="text-sm font-medium text-slate-600">
                            Không tìm thấy bản ghi nhật ký nào
                          </span>
                          <p className="text-xs text-slate-400 max-w-sm">
                            Thử điều chỉnh từ khóa tìm kiếm, khoảng thời gian hoặc loại hoạt động.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Log rows
                    filteredAndSortedLogs.map((log, idx) => {
                      const stt = (pagination.page - 1) * pagination.limit + idx + 1;
                      const category = getActionCategory(log.action);
                      const userDisplay = getUserDisplayName(log);
                      const targetName = formatTargetTypeName(log.targetType, log.targetLabel);
                      const formattedTime = formatLogDateTime(log.createdAt);
                      const isSelected = selectedLog?.id === log.id;

                      return (
                        <tr
                          key={log.id}
                          onClick={() => handleSelectLog(log)}
                          className={`transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-blue-50/80 hover:bg-blue-50"
                              : "hover:bg-slate-50/80"
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center font-medium text-slate-500">
                            {stt}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono">
                            {formattedTime}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                                {userDisplay.initials}
                              </span>
                              <span className="font-medium text-slate-800">
                                {userDisplay.primary}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${category.badgeClass}`}
                            >
                              {category.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate text-slate-700" title={log.description || ""}>
                            {log.description || formatOperationName(log.action)}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                            {targetName}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectLog(log);
                              }}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isSelected
                                  ? "text-blue-600 bg-blue-100"
                                  : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                              }`}
                              title="Xem chi tiết nhật ký"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* BEGIN: Pagination Footer */}
          <div
            className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 bg-white"
            data-purpose="table-pagination"
          >
            <div>
              {pagination.total > 0 ? (
                <>
                  Hiển thị{" "}
                  <span className="font-semibold text-slate-700">
                    {startIndex}
                  </span>{" "}
                  đến{" "}
                  <span className="font-semibold text-slate-700">
                    {endIndex}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-semibold text-slate-700">
                    {pagination.total}
                  </span>{" "}
                  bản ghi
                </>
              ) : (
                <span>Không có bản ghi nào</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Page size selector */}
              <div className="flex items-center gap-1.5">
                <span>Số dòng mỗi trang</span>
                <div className="relative inline-block">
                  <select
                    value={pagination.limit}
                    onChange={(e) => {
                      setIsLoading(true);
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(e.target.value),
                        page: 1,
                      }));
                    }}
                    className="text-xs bg-white border border-slate-200 rounded px-2.5 py-1 pr-6 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-1 font-medium">
                {/* First Page Button */}
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => {
                    setIsLoading(true);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Trang đầu"
                >
                  <span className="text-[10px] font-bold">|&lt;</span>
                </button>

                {/* Prev Button */}
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => {
                    setIsLoading(true);
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
                  }}
                  className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Trang trước"
                >
                  <span className="text-[10px]">&lt;</span>
                </button>

                {/* Numbered Page Buttons */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (pagination.totalPages <= 7) return true;
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const isCurrent = p === pagination.page;
                    const prevP = arr[idx - 1];
                    const showEllipsis = prevP && p - prevP > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="px-1 text-slate-400 font-bold">
                            ...
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isCurrent) {
                              setIsLoading(true);
                              setPagination((prev) => ({ ...prev, page: p }));
                            }
                          }}
                          className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? "border border-blue-600 bg-blue-600 text-white font-semibold shadow-xs"
                              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                {/* Next Button */}
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => {
                    setIsLoading(true);
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
                  }}
                  className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Trang sau"
                >
                  <span className="text-[10px]">&gt;</span>
                </button>

                {/* Last Page Button */}
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => {
                    setIsLoading(true);
                    setPagination((prev) => ({
                      ...prev,
                      page: pagination.totalPages,
                    }));
                  }}
                  className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Trang cuối"
                >
                  <span className="text-[10px] font-bold">&gt;|</span>
                </button>
              </div>
            </div>
          </div>
          {/* END: Pagination Footer */}
        </section>

        {/* Details Drawer Panel ("Chi tiết nhật ký") */}
        {selectedLog && (
          <SystemLogDrawer
            isOpen={Boolean(selectedLog)}
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </div>
      {/* END: Main Content Area */}
    </div>
  );
}
