"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Download, PencilIcon, TrashIcon, SearchIcon, FilterIcon, X, Mail, Phone, MapPin, Calendar, User, Building2, Briefcase, DollarSign, Clock, Wrench } from "lucide-react";

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
        const unique = Array.from(new Set(data.map((c) => c.clientName))).filter(Boolean);
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
  const currentCandidates = filteredAndSortedCandidates.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAndSortedCandidates.length / recordsPerPage);

  const toggleClientFilter = (client) => {
    setClientFilters((prev) =>
      prev.includes(client) ? prev.filter((c) => c !== client) : [...prev, client]
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
      Selected: "bg-green-100 text-green-700 border-green-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      default: "bg-blue-100 text-blue-700 border-blue-200"
    };
    return colors[status] || colors.default;
  };

  // Detail View Modal Component
  const DetailViewModal = ({ candidate, onClose }) => {
    if (!candidate) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{candidate.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">Candidate Profile</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField 
                    icon={<Mail className="w-4 h-4" />}
                    label="Email" 
                    value={candidate.email} 
                  />
                  <InfoField 
                    icon={<Phone className="w-4 h-4" />}
                    label="Contact Number" 
                    value={candidate.contactNumber} 
                  />
                  <InfoField 
                    icon={<MapPin className="w-4 h-4" />}
                    label="Location" 
                    value={candidate.location} 
                  />
                  <InfoField 
                    icon={<User className="w-4 h-4" />}
                    label="Screened By" 
                    value={candidate.updatedBy} 
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Professional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField 
                    icon={<Building2 className="w-4 h-4" />}
                    label="Client Name" 
                    value={candidate.clientName} 
                  />
                  <InfoField 
                    icon={<Briefcase className="w-4 h-4" />}
                    label="Experience" 
                    value={`${candidate.relevantExperience} years`} 
                  />
                  <InfoField 
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Current CTC" 
                    value={candidate.currentCTC} 
                  />
                  <InfoField 
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Expected CTC" 
                    value={candidate.expectedCTC} 
                  />
                  <InfoField 
                    icon={<Calendar className="w-4 h-4" />}
                    label="Notice Period" 
                    value={candidate.noticePeriod} 
                  />
                  <InfoField 
                    icon={<Clock className="w-4 h-4" />}
                    label="Status" 
                    value={
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    } 
                  />
                </div>
              </div>

              {/* Technical Skills */}
              {candidate.technicalSkills && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Technical Skills
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {candidate.technicalSkills}
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField 
                    icon={<Clock className="w-4 h-4" />}
                    label="Interview Availability" 
                    value={candidate.interviewAvailability} 
                  />
                  <InfoField 
                    icon={<Calendar className="w-4 h-4" />}
                    label="Added On" 
                    value={candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString("en-GB") : "—"}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                {candidate.resumeLink && (
                  <a
                    href={candidate.resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex-1"
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </a>
                )}
                <Link href={`/recruiter/${candidate.id}`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <PencilIcon className="w-4 h-4" />
                    Edit Candidate
                  </button>
                </Link>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this candidate?")) {
                      handleDelete(candidate.id);
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper Component
  const InfoField = ({ icon, label, value }) => (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      <div className="text-sm text-gray-900">{value || "—"}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total Candidates: {filteredAndSortedCandidates.length}
          </p>
        </div>
      </div>

      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by candidate name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all border ${
                showFilters || clientFilters.length > 0
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FilterIcon className="w-4 h-4" />
              Filters
              {clientFilters.length > 0 && (
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {clientFilters.length}
                </span>
              )}
            </button>

            {/* Records Per Page */}
            <select
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value={10}>10 per page</option>
              <option value={15}>15 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Filter Panel */}
          {showFilters && uniqueClients.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-900">Filter by Client</p>
                {clientFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-48 overflow-y-auto">
                {uniqueClients.map((client) => (
                  <label
                    key={client}
                    className="flex items-center gap-2 p-2 rounded hover:bg-white cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={clientFilters.includes(client)}
                      onChange={() => toggleClientFilter(client)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{client}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Candidate Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Resume
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{c.clientName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{c.contactNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{c.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{c.relevantExperience} yrs</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs truncate" title={c.technicalSkills}>
                          {c.technicalSkills}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
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
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedCandidate(c)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium">No candidates found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{indexOfFirst + 1}</span> to{" "}
                  <span className="font-semibold">
                    {Math.min(indexOfLast, filteredAndSortedCandidates.length)}
                  </span>{" "}
                  of <span className="font-semibold">{filteredAndSortedCandidates.length}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
                        className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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