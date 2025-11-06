"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DownloadIcon, PencilIcon, TrashIcon, SearchIcon, FilterIcon } from "lucide-react";

export default function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [clientFilters, setClientFilters] = useState([]);
  const [uniqueClients, setUniqueClients] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

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
      } else {
        alert("Failed to delete candidate");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const downloadCSV = () => {
    const headers = Object.keys(filteredAndSortedCandidates[0] || {});
    const rows = filteredAndSortedCandidates.map((c) =>
      headers.map((h) =>
        typeof c[h] === "object"
          ? JSON.stringify(c[h]).replace(/"/g, "'")
          : c[h] ?? ""
      )
    );
    const csvContent = [headers, ...rows]
      .map((e) => e.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "filtered_candidates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedCandidates = candidates
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) &&
      (clientFilters.length === 0 || clientFilters.includes(c.clientName))
    )
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto px-2 sm:px-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidate Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Total Records: {filteredAndSortedCandidates.length}
              </p>
            </div>
            <button
              onClick={downloadCSV}
              disabled={filteredAndSortedCandidates.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
            >
              <DownloadIcon className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
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

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors border ${
                showFilters || clientFilters.length > 0
                  ? "bg-blue-600 text-white border-blue-600"
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

            <select
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value={10}>10 per page</option>
              <option value={15}>15 per page</option>
              <option value={20}>20 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
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

        {/* Table Section with Horizontal Scroll */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-700">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Candidate Name
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Client
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Contact
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Location
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Experience
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Skills
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Current CTC
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Expected CTC
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Notice Period
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Screened By
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Availability
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Added On
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Resume
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCandidates.length > 0 ? (
                  currentCandidates.map((c, index) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{c.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{c.clientName}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{c.contactNumber}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{c.location}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{c.relevantExperience} yrs</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700 max-w-xs truncate" title={c.technicalSkills}>
                          {c.technicalSkills}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{c.currentCTC}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{c.expectedCTC}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{c.noticePeriod}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                            c.status === "Selected"
                              ? "bg-green-100 text-green-800"
                              : c.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : c.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{c.updatedBy}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{c.interviewAvailability}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {new Date(c.createdAt).toLocaleDateString("en-GB")}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {c.resumeLink ? (
                          <a
                            href={c.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <DownloadIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">View</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/recruiter/${c.id}`}>
                            <button
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                              title="Edit"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="px-4 py-12 text-center">
                      <div className="text-gray-500">
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
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLast, filteredAndSortedCandidates.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredAndSortedCandidates.length}</span> results
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white font-semibold"
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
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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