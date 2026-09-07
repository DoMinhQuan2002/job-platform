"use client";

export function JobTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="h-5 w-40 skeleton" />
        <div className="h-5 w-24 skeleton" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white">
              <th className="py-4 pl-6 pr-2 w-10">
                <div className="w-4 h-4 rounded skeleton" />
              </th>
              <th className="py-4 px-3 w-12">
                <div className="w-6 h-3 mx-auto skeleton" />
              </th>
              <th className="py-4 px-4">
                <div className="w-16 h-3 skeleton" />
              </th>
              <th className="py-4 px-4">
                <div className="w-36 h-3 skeleton" />
              </th>
              <th className="py-4 px-4">
                <div className="w-28 h-3 skeleton" />
              </th>
              <th className="py-4 px-4">
                <div className="w-20 h-3 skeleton" />
              </th>
              <th className="py-4 px-4">
                <div className="w-20 h-3 skeleton" />
              </th>
              <th className="py-4 px-4">
                <div className="w-16 h-3 skeleton" />
              </th>
              <th className="py-4 pr-6 pl-4 text-center">
                <div className="w-14 h-3 mx-auto skeleton" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="py-4 pl-6 pr-2">
                  <div className="w-4 h-4 rounded skeleton" />
                </td>
                <td className="py-4 px-3 text-center">
                  <div className="w-4 h-3 mx-auto skeleton" />
                </td>
                <td className="py-4 px-4">
                  <div className="w-20 h-3.5 skeleton" />
                </td>
                <td className="py-4 px-4 space-y-1.5">
                  <div className="w-48 h-4 skeleton" />
                  <div className="w-24 h-2.5 skeleton" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg skeleton shrink-0" />
                    <div className="w-32 h-3.5 skeleton" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="w-20 h-3 skeleton" />
                </td>
                <td className="py-4 px-4">
                  <div className="w-20 h-3 skeleton" />
                </td>
                <td className="py-4 px-4">
                  <div className="w-16 h-5 rounded-md skeleton" />
                </td>
                <td className="py-4 pr-6 pl-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded skeleton" />
                    <div className="w-6 h-6 rounded skeleton" />
                    <div className="w-6 h-6 rounded skeleton" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
        <div className="w-32 h-4 skeleton" />
        <div className="w-48 h-6 skeleton" />
      </div>
    </div>
  );
}
