"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Pencil } from "lucide-react";

export default function RejectedList() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Fetch data
  useEffect(() => {
    fetch("/api/ACmanager")
      .then((res) => res.json())
      .then((data) =>
        setCandidates(data.filter((c) => c.acmanagerStatus === "Rejected"))
      )
      .catch(console.error);
  }, []);

  // Filter by search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCandidates(candidates);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = candidates.filter((c) => {
      const fields = [
        c.name,
        c.email,
        c.clientName,
        c.contactNumber,
        c.technicalSkills,
        c.location,
        c.updatedBy,
        c.screeningComment,
      ];
      return fields.some((f) => f?.toString().toLowerCase().includes(term));
    });
    setFilteredCandidates(filtered);
  }, [searchTerm, candidates]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil((filteredCandidates.length || 1) / pageSize)
  );
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRows = filteredCandidates.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const handleEdit = (id) => {
    router.push(`/recruiter/${id}`);
  };

  const clearSearch = () => setSearchTerm("");

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-[1600px] mx-auto py-4 px-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header with title + search + count + page size */}
          <div className="px-5 py-3 border-b border-slate-200 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm md:text-base font-bold text-red-600">
                Rejected Candidates
              </h2>
              <p className="text-[11px] text-slate-500">
                View and manage candidates marked as rejected
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full md:w-auto">
              {/* Search */}
              <div className="flex-1 min-w-[200px] max-w-xs relative">
                <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg
                    className="h-3 w-3 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-7 pr-7 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center"
                  >
                    <svg
                      className="h-3 w-3 text-slate-400 hover:text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Count + page size */}
              <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px]">
                <div className="text-slate-500">
                  <span className="font-semibold text-slate-900">
                    {filteredCandidates.length}
                  </span>{" "}
                  {filteredCandidates.length === 1
                    ? "candidate"
                    : "candidates"}
                  {searchTerm && (
                    <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px]">
                      Filtered
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="text-xs border border-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-slate-600 uppercase tracking-wide">
                  {[
                    "Name",
                    "Client",
                    "Contact",
                    "YOE",
                    "Skills",
                    "CTC",
                    "ECTC",
                    "Notice",
                    "Screening",
                    "Screened By",
                    "Availability",
                    "Location",
                    "Added",
                    "Resume",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {currentRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={15}
                      className="py-10 text-center text-slate-400"
                    >
                      No rejected candidates found
                    </td>
                  </tr>
                ) : (
                  currentRows.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {c.name}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {c.clientName}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {c.contactNumber}
                      </td>
                      <td className="px-3 py-2">{c.relevantExperience}</td>
                      <td
                        className="px-3 py-2 max-w-[220px] truncate text-slate-700"
                        title={c.technicalSkills}
                      >
                        {c.technicalSkills || "—"}
                      </td>
                      <td className="px-3 py-2">{c.currentCTC || "—"}</td>
                      <td className="px-3 py-2">{c.expectedCTC || "—"}</td>
                      <td className="px-3 py-2">{c.noticePeriod || "—"}</td>
                      <td className="px-3 py-2">
                        {c.screeningComment || "—"}
                      </td>
                      <td className="px-3 py-2">{c.updatedBy || "—"}</td>
                      <td className="px-3 py-2">
                        {c.interviewAvailability || "—"}
                      </td>
                      <td className="px-3 py-2">{c.location || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {c.resumeLink ? (
                          <a
                            href={c.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Resume
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleEdit(c.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {filteredCandidates.length > 0 && totalPages > 1 && (
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <div className="text-slate-600">
                Showing{" "}
                {filteredCandidates.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(endIndex, filteredCandidates.length)} of{" "}
                {filteredCandidates.length} results
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() =>
                    handlePageChange(Math.max(currentPage - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-2 py-0.5 border border-slate-300 rounded-md text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2)
                    pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-2 py-0.5 border border-slate-300 rounded-md text-xs ${
                        currentPage === pageNum
                          ? "bg-blue-50 text-blue-600 border-blue-500"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-2 py-0.5 border border-slate-300 rounded-md text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
