"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,Download,PencilIcon,TrashIcon,SearchIcon,FilterIcon,X,Mail,Phone,MapPin,Calendar,Building2,
  Briefcase,Clock,FileText,
} from "lucide-react";

export default function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [clientFilters, setClientFilters] = useState([]);
  const [uniqueClients, setUniqueClients] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetch("/api/candidates/filter")
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
        const unique = Array.from(
          new Set(data.map((c) => c.clientName))
        ).filter(Boolean);
        setUniqueClients(unique);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCandidates((prev) => prev.filter((c) => c.id !== id));
        setSelectedCandidate(null);
      } else {
        alert("Failed to delete candidate");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredAndSortedCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) &&
      (clientFilters.length === 0 || clientFilters.includes(c.clientName))
  );

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentCandidates = filteredAndSortedCandidates.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedCandidates.length / recordsPerPage)
  );

  const toggleClientFilter = (client) => {
    setClientFilters((prev) =>
      prev.includes(client)
        ? prev.filter((c) => c !== client)
        : [...prev, client]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setClientFilters([]);
    setSearch("");
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    const colors = {
      Selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Rejected: "bg-rose-50 text-rose-700 border-rose-200",
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      default: "bg-sky-50 text-sky-700 border-sky-200",
    };
    return colors[status] || colors.default;
  };

  const DetailViewModal = ({ candidate, onClose }) => {
    if (!candidate) return null;

    useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }, []);

    return (
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-blue-500">
            <div className="px-5 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <h2 className="text-lg font-bold text-gray-900 truncate">
                    {candidate.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{candidate.contactNumber}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{candidate.location || "—"}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg p-1.5 transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-4 space-y-5">
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2.5">
                <StatCard
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Experience"
                  value={`${candidate.relevantExperience} Yrs`}
                  bgColor="bg-blue-50"
                  iconColor="text-blue-600"
                />
                <StatCard
                  icon={<Clock className="w-4 h-4" />}
                  label="Notice"
                  value={candidate.noticePeriod || "—"}
                  bgColor="bg-purple-50"
                  iconColor="text-purple-600"
                />
                <StatCard
                  icon={<FileText className="w-4 h-4" />}
                  label="Status"
                  value={
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getStatusColor(
                        candidate.status
                      )}`}
                    >
                      {candidate.status || "Active"}
                    </span>
                  }
                  bgColor="bg-green-50"
                  iconColor="text-green-600"
                />
              </div>

              {/* Professional summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-700" />
                  Professional Summary
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  <DataRow label="Client" value={candidate.clientName} />
                  <DataRow
                    label="Experience"
                    value={`${candidate.relevantExperience} years`}
                  />
                  <DataRow label="Current CTC" value={candidate.currentCTC} />
                  <DataRow label="Expected CTC" value={candidate.expectedCTC} />
                  <DataRow
                    label="Interview Availability"
                    value={candidate.interviewAvailability}
                  />
                  <DataRow label="Screened By" value={candidate.updatedBy} />
                  <DataRow
                    label="Added On"
                    value={
                      candidate.createdAt
                        ? new Date(
                            candidate.createdAt
                          ).toLocaleDateString("en-GB")
                        : "—"
                    }
                  />
                  <DataRow
                    label="Notice Period"
                    value={candidate.noticePeriod}
                  />
                </div>
              </div>

              {/* Technical skills */}
              {candidate.technicalSkills && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2.5 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Technical Skills
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {candidate.technicalSkills}
                  </p>
                </div>
              )}

              {/* Demand code assignments */}
              {candidate.demandCodeAssignments &&
                candidate.demandCodeAssignments.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-700" />
                        Demand Code Assignments
                      </h3>
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                        {candidate.demandCodeAssignments.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {candidate.demandCodeAssignments.map((dc) => (
                        <div
                          key={dc.id}
                          className="bg-white border-l-4 border-blue-500 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-xs truncate">
                                {dc.demandCode}
                              </h4>
                              <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(
                                  dc.assignedDate
                                ).toLocaleDateString("en-GB")}
                              </p>
                            </div>
                            {dc.status && (
                              <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200 font-medium whitespace-nowrap">
                                {dc.status}
                              </span>
                            )}
                          </div>
                          {dc.clientInterviewStatus && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <p className="text-xs text-gray-700">
                                <span className="font-semibold text-gray-900">
                                  Interview:
                                </span>{" "}
                                {dc.clientInterviewStatus}
                              </p>
                            </div>
                          )}
                          {dc.feedback && (
                            <div className="mt-1.5 bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-700">
                                <span className="font-semibold text-gray-900">
                                  Feedback:
                                </span>{" "}
                                {dc.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">
            <div className="flex flex-wrap gap-2">
              {candidate.resumeLink && (
                <a
                  href={candidate.resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Resume
                </a>
              )}
              <Link href={`/recruiter/${candidate.id}`} className="flex-1 min-w-[120px]">
                <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow">
                  <PencilIcon className="w-3.5 h-3.5" />
                  Edit
                </button>
              </Link>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to delete this candidate?"
                    )
                  ) {
                    handleDelete(candidate.id);
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ icon, label, value, bgColor, iconColor }) => (
    <div className={`${bgColor} rounded-lg p-2.5 border border-gray-200`}>
      <div className={`flex items-center gap-1 ${iconColor} mb-1`}>
        {icon}
        <span className="text-[9px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-base font-bold text-gray-900">{value}</div>
    </div>
  );

  const DataRow = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-xs font-semibold text-gray-900 mt-0.5 truncate">
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Title bar with search + filter + per-page */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Candidate Management
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Total Candidates: {filteredAndSortedCandidates.length}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
            {/* Search */}
            <div className="flex-1 md:w-64 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by candidate name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-md transition-all border ${
                showFilters || clientFilters.length > 0
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FilterIcon className="w-4 h-4" />
              Filters
              {clientFilters.length > 0 && (
                <span className="bg-white text-blue-600 px-1.5 py-0.5 rounded-full text-xs font-semibold">
                  {clientFilters.length}
                </span>
              )}
            </button>

            {/* Records per page */}
            <select
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value={10}>10 per page</option>
              <option value={15}>15 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-[1600px] mx-auto">
        {/* Filter panel below title bar */}
        {showFilters && uniqueClients.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-900 text-sm">
                Filter by Client
              </p>
              {clientFilters.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-40 overflow-y-auto">
              {uniqueClients.map((client) => (
                <label
                  key={client}
                  className="flex items-center gap-1.5 p-1.5 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={clientFilters.includes(client)}
                    onChange={() => toggleClientFilter(client)}
                    className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">{client}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Candidate Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Client
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Location
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Experience
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Skills
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Resume
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentCandidates.length > 0 ? (
                  currentCandidates.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-gray-900">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {c.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-700">
                          {c.clientName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-700">
                          {c.contactNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-700">
                          {c.location}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-700">
                          {c.relevantExperience} yrs
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="text-xs text-gray-700 max-w-xs truncate"
                          title={c.technicalSkills}
                        >
                          {c.technicalSkills}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.resumeLink ? (
                          <a
                            href={c.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-medium transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => setSelectedCandidate(c)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="text-gray-500">
                        <svg
                          className="mx-auto h-10 w-10 text-gray-400 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <p className="text-sm font-medium">No candidates found</p>
                        <p className="text-xs mt-1">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredAndSortedCandidates.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-700">
                  Showing{" "}
                  <span className="font-semibold">
                    {filteredAndSortedCandidates.length === 0
                      ? 0
                      : indexOfFirst + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(
                      indexOfLast,
                      filteredAndSortedCandidates.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {filteredAndSortedCandidates.length}
                  </span>{" "}
                  results
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedCandidate && (
        <DetailViewModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}


// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { DownloadIcon, PencilIcon, TrashIcon } from "lucide-react";

// export default function CandidateList() {
//   const [candidates, setCandidates] = useState([]);
//   const [search, setSearch] = useState("");
//   const [sortKey, setSortKey] = useState("createdAt");
//   const [sortAsc, setSortAsc] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [recordsPerPage, setRecordsPerPage] = useState(10);
//   const [clientFilters, setClientFilters] = useState([]);
//   const [uniqueClients, setUniqueClients] = useState([]);

//   useEffect(() => {
//     fetch("/api/candidates/filter")
//       .then((res) => res.json())
//       .then((data) => {
//         setCandidates(data);
//         const unique = Array.from(new Set(data.map((c) => c.clientName))).filter(Boolean);
//         setUniqueClients(unique); 
//       })
//       .catch((err) => console.error("Fetch error:", err));
//   }, []);

//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure you want to delete this candidate?")) return;

//     try {
//       const res = await fetch(`/api/candidates/${id}`, {
//         method: "DELETE",
//       });
//       if (res.ok) {
//         setCandidates((prev) => prev.filter((c) => c.id !== id));
//       } else {
//         alert("Failed to delete candidate");
//       }
//     } catch (err) {
//       console.error("Delete error:", err);
//     }
//   };

//   const handleSort = (key) => {
//     if (key === sortKey) {
//       setSortAsc(!sortAsc);
//     } else {
//       setSortKey(key);
//       setSortAsc(true);
//     }
//   };

//   const downloadCSV = () => {
//     const headers = Object.keys(filteredAndSortedCandidates[0] || {});
//     const rows = filteredAndSortedCandidates.map((c) =>
//       headers.map((h) =>
//         typeof c[h] === "object"
//           ? JSON.stringify(c[h]).replace(/"/g, "'")
//           : c[h] ?? ""
//       )
//     );
//     const csvContent = [headers, ...rows]
//       .map((e) => e.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", "filtered_candidates.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };


//   const filteredAndSortedCandidates = candidates
//     .filter((c) =>
//       c.name.toLowerCase().includes(search.toLowerCase()) &&
//       (clientFilters.length === 0 || clientFilters.includes(c.clientName))
//     )
//     .sort((a, b) => {
//       const valA = a[sortKey];
//       const valB = b[sortKey];
//       return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
//     });

//   const indexOfLast = currentPage * recordsPerPage;
//   const indexOfFirst = indexOfLast - recordsPerPage;
//   const currentCandidates = filteredAndSortedCandidates.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredAndSortedCandidates.length / recordsPerPage);

//   const toggleClientFilter = (client) => {
//     setClientFilters((prev) =>
//       prev.includes(client) ? prev.filter((c) => c !== client) : [...prev, client]
//     );
//     setCurrentPage(1);
//   };

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
//         All Candidates List
//       </h2>

//       <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
//         <input
//           type="text"
//           placeholder="Search by name"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="p-2 border border-gray-300 rounded w-full md:w-64"
//         />

//         <div className="flex gap-2 items-center flex-wrap">
//           <select
//             value={recordsPerPage}
//             onChange={(e) => {
//               setRecordsPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//             className="p-2 border border-gray-300 rounded"
//           >
//             <option value={10}>10</option>
//             <option value={15}>15</option>
//             <option value={20}>20</option>
//             <option value={20}>25</option>
//             <option value={20}>50</option>
//             <option value={100}>100</option>
//           </select>
//           {/* <button
//             onClick={downloadCSV}
//             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//           >
//             Export CSV
//           </button> */}
//         </div>
//       </div>

//       {uniqueClients.length > 0 && (
//         <div className="bg-white p-3 mb-4 rounded border">
//           <p className="font-semibold mb-2">Filter by Client:</p>
//           <div className="flex flex-wrap gap-4 max-h-32 overflow-y-auto">
//             {uniqueClients.map((client) => (
//               <label key={client} className="flex items-center gap-1 text-sm">
//                 <input
//                   type="checkbox"
//                   checked={clientFilters.includes(client)}
//                   onChange={() => toggleClientFilter(client)}
//                 />
//                 {client}
//               </label>
//             ))}
//           </div>
//         </div>
//       )}

//       <div className="overflow-x-auto">
//         <table className="min-w-full border-collapse bg-white shadow-sm">
//           <thead className="bg-gray-200">
//             <tr>
//               {[
//                 "Name",
//                 "Client Name",
//                 "Contact No",
//                 "YOE",
//                 "Skills",
//                 "Current CTC",
//                 "Expected CTC",
//                 "Notice",
//                 "Screening Status",
//                 "Screening By",
//                 "Availability",
//                 "Location",
//                 "Added On",
//                 "Resume",
//                 "Actions",
//               ].map((title, index) => (
//                 <th
//                   key={title}
//                   className={`border px-4 py-2 whitespace-nowrap bg-gray-100 ${
//                     index < 5 ? `sticky left-[${index * 120}px] bg-gray-100 z-10` : ""
//                   }`}
//                 >
//                   {title}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {currentCandidates.map((c) => (
//               <tr key={c.id} className="hover:bg-gray-50">
//                 <td className="border px-4 py-2 whitespace-nowrap sticky left-0 bg-white z-10">{c.name}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap sticky left-[120px] bg-white z-10">{c.clientName}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap sticky left-[240px] bg-white z-10">{c.contactNumber}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap sticky left-[360px] bg-white z-10">{c.relevantExperience}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap sticky left-[480px] bg-white z-10">{c.technicalSkills}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap">{c.currentCTC}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap">{c.expectedCTC}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap">{c.noticePeriod}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap">{c.status}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap">{c.updatedBy}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap">{c.interviewAvailability}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap">{c.location}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap">{new Date(c.createdAt).toISOString().split("T")[0]}</td>
//                 <td className="border px-4 py-2 whitespace-nowrap">
//                   {c.resumeLink ? (
//                     <a
//                       href={c.resumeLink}
//                       target = "_blank"
//                       rel="noopener noreferrer"
//                       download
//                       className="text-blue-600 hover:underline flex items-center"
//                     >
//                       <DownloadIcon className="w-4 h-4 mr-1" /> Download
//                     </a>
//                   ) : (
//                     <span className="text-gray-400 italic">No file</span>
//                   )}
//                 </td>
//                 <td className="border px-4 py-2 whitespace-nowrap flex gap-2">
//                   <Link href={`/recruiter/${c.id}`}>
//                     <button className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
//                       <PencilIcon className="w-4 h-4" />
//                     </button>
//                   </Link>
//                   <button
//                     onClick={() => handleDelete(c.id)}
//                     className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
//                   >
//                     <TrashIcon className="w-4 h-4" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
//         {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
//           <button
//             key={num}
//             onClick={() => setCurrentPage(num)}
//             className={`px-3 py-1 rounded border ${
//               currentPage === num ? "bg-blue-600 text-white" : "bg-white"
//             }`}
//           >
//             {num}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }



// // "use client";

// // import { useEffect, useState } from "react";
// // import Link from "next/link";
// // import { DownloadIcon, PencilIcon, TrashIcon } from "lucide-react";

// // export default function CandidateList() {
// //   const [candidates, setCandidates] = useState([]);
// //   const [search, setSearch] = useState("");
// //   const [sortKey, setSortKey] = useState("createdAt");
// //   const [sortAsc, setSortAsc] = useState(false);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [recordsPerPage, setRecordsPerPage] = useState(10);
// //   const [clientFilters, setClientFilters] = useState([]);
// //   const [uniqueClients, setUniqueClients] = useState([]);

// //   useEffect(() => {
// //     fetch("/api/candidates/filter")
// //       .then((res) => res.json())
// //       .then((data) => {
// //         setCandidates(data);
// //         const unique = Array.from(new Set(data.map((c) => c.clientName))).filter(Boolean);
// //         setUniqueClients(unique);
// //       })
// //       .catch((err) => console.error("Fetch error:", err));
// //   }, []);

// //   const handleDelete = async (id) => {
// //     if (!confirm("Are you sure you want to delete this candidate?")) return;

// //     try {
// //       const res = await fetch(`/api/candidates/${id}`, {
// //         method: "DELETE",
// //       });
// //       if (res.ok) {
// //         setCandidates((prev) => prev.filter((c) => c.id !== id));
// //       } else {
// //         alert("Failed to delete candidate");
// //       }
// //     } catch (err) {
// //       console.error("Delete error:", err);
// //     }
// //   };

// //   const handleSort = (key) => {
// //     if (key === sortKey) {
// //       setSortAsc(!sortAsc);
// //     } else {
// //       setSortKey(key);
// //       setSortAsc(true);
// //     }
// //   };

// //   const downloadCSV = () => {
// //     const headers = Object.keys(filteredAndSortedCandidates[0] || {});
// //     const rows = filteredAndSortedCandidates.map((c) =>
// //       headers.map((h) =>
// //         typeof c[h] === "object"
// //           ? JSON.stringify(c[h]).replace(/"/g, "'")
// //           : c[h] ?? ""
// //       )
// //     );
// //     const csvContent = [headers, ...rows]
// //       .map((e) => e.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
// //       .join("\n");

// //     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
// //     const url = URL.createObjectURL(blob);
// //     const link = document.createElement("a");
// //     link.href = url;
// //     link.setAttribute("download", "filtered_candidates.csv");
// //     document.body.appendChild(link);
// //     link.click();
// //     document.body.removeChild(link);
// //   };


// //   const filteredAndSortedCandidates = candidates
// //     .filter((c) =>
// //       c.name.toLowerCase().includes(search.toLowerCase()) &&
// //       (clientFilters.length === 0 || clientFilters.includes(c.clientName))
// //     )
// //     .sort((a, b) => {
// //       const valA = a[sortKey];
// //       const valB = b[sortKey];
// //       return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
// //     });

// //   const indexOfLast = currentPage * recordsPerPage;
// //   const indexOfFirst = indexOfLast - recordsPerPage;
// //   const currentCandidates = filteredAndSortedCandidates.slice(indexOfFirst, indexOfLast);
// //   const totalPages = Math.ceil(filteredAndSortedCandidates.length / recordsPerPage);

// //   const toggleClientFilter = (client) => {
// //     setClientFilters((prev) =>
// //       prev.includes(client) ? prev.filter((c) => c !== client) : [...prev, client]
// //     );
// //     setCurrentPage(1);
// //   };

// //   return (
// //     <div className="p-8 bg-gray-50 min-h-screen">
// //       <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
// //         All Candidates List
// //       </h2>

// //       <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
// //         <input
// //           type="text"
// //           placeholder="Search by name"
// //           value={search}
// //           onChange={(e) => setSearch(e.target.value)}
// //           className="p-2 border border-gray-300 rounded w-full md:w-64"
// //         />

// //         <div className="flex gap-2 items-center flex-wrap">
// //           <select
// //             value={recordsPerPage}
// //             onChange={(e) => {
// //               setRecordsPerPage(Number(e.target.value));
// //               setCurrentPage(1);
// //             }}
// //             className="p-2 border border-gray-300 rounded"
// //           >
// //             <option value={10}>10</option>
// //             <option value={15}>15</option>
// //             <option value={20}>20</option>
// //             <option value={20}>25</option>
// //             <option value={20}>50</option>
// //             <option value={100}>100</option>
// //           </select>
// //           <button
// //             onClick={downloadCSV}
// //             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
// //           >
// //             Export CSV
// //           </button>
// //         </div>
// //       </div>

// //       {uniqueClients.length > 0 && (
// //         <div className="bg-white p-3 mb-4 rounded border">
// //           <p className="font-semibold mb-2">Filter by Client:</p>
// //           <div className="flex flex-wrap gap-4 max-h-32 overflow-y-auto">
// //             {uniqueClients.map((client) => (
// //               <label key={client} className="flex items-center gap-1 text-sm">
// //                 <input
// //                   type="checkbox"
// //                   checked={clientFilters.includes(client)}
// //                   onChange={() => toggleClientFilter(client)}
// //                 />
// //                 {client}
// //               </label>
// //             ))}
// //           </div>
// //         </div>
// //       )}

// //       <div className="overflow-x-auto">
// //         <table className="min-w-full border-collapse bg-white shadow-sm">
// //           <thead className="bg-gray-200">
// //             <tr>
// //               {[
// //                 "Name",
// //                 "Client Name",
// //                 "Contact No",
// //                 "YOE",
// //                 "Skills",
// //                 "Current CTC",
// //                 "Expected CTC",
// //                 "Notice",
// //                 "Screening Status",
// //                 "Screening By",
// //                 "Availability",
// //                 "Location",
// //                 "Added On",
// //                 "Resume",
// //                 "Actions",
// //               ].map((title, index) => (
// //                 <th
// //                   key={title}
// //                   className={`border px-4 py-2 whitespace-nowrap bg-gray-100 ${
// //                     index < 5 ? `sticky left-[${index * 120}px] bg-gray-100 z-10` : ""
// //                   }`}
// //                 >
// //                   {title}
// //                 </th>
// //               ))}
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {currentCandidates.map((c) => (
// //               <tr key={c.id} className="hover:bg-gray-50">
// //                 <td className="border px-4 py-2 whitespace-nowrap sticky left-0 bg-white z-10">{c.name}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap sticky left-[120px] bg-white z-10">{c.clientName}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap sticky left-[240px] bg-white z-10">{c.contactNumber}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap sticky left-[360px] bg-white z-10">{c.relevantExperience}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap sticky left-[480px] bg-white z-10">{c.technicalSkills}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap">{c.currentCTC}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap">{c.expectedCTC}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap">{c.noticePeriod}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap">{c.screeningComment}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap">{c.updatedBy}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap">{c.interviewAvailability}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap">{c.location}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap">{new Date(c.createdAt).toISOString().split("T")[0]}</td>
// //                 <td className="border px-4 py-2 whitespace-nowrap">
// //                   {c.resumeLink ? (
// //                     <a
// //                       href={c.resumeLink}
// //                       target = "_blank"
// //                       rel="noopener noreferrer"
// //                       download
// //                       className="text-blue-600 hover:underline flex items-center"
// //                     >
// //                       <DownloadIcon className="w-4 h-4 mr-1" /> Download
// //                     </a>
// //                   ) : (
// //                     <span className="text-gray-400 italic">No file</span>
// //                   )}
// //                 </td>
// //                 <td className="border px-4 py-2 whitespace-nowrap flex gap-2">
// //                   <Link href={`/recruiter/${c.id}`}>
// //                     <button className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
// //                       <PencilIcon className="w-4 h-4" />
// //                     </button>
// //                   </Link>
// //                   <button
// //                     onClick={() => handleDelete(c.id)}
// //                     className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
// //                   >
// //                     <TrashIcon className="w-4 h-4" />
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
// //         {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
// //           <button
// //             key={num}
// //             onClick={() => setCurrentPage(num)}
// //             className={`px-3 py-1 rounded border ${
// //               currentPage === num ? "bg-blue-600 text-white" : "bg-white"
// //             }`}
// //           >
// //             {num}
// //           </button>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }