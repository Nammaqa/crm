"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validateACmanager } from "@/actions/validateACmanager";

export default function ShortList() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();

  // Calculate pagination
  const totalPages = Math.ceil(filteredCandidates.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCandidates = filteredCandidates.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Fetch logged-in user name
  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success && resJson.data) {
          setUserName(resJson.data.userName);
        }
      });
  }, []);

  // Fetch candidates
  useEffect(() => {
    setLoading(true);
    fetch("/api/ACmanager")
      .then((res) => res.json())
      .then((data) => {
        const shortlistedCandidates = data.filter((c) => c.acmanagerStatus === "Selected");
        setCandidates(shortlistedCandidates);
        setFilteredCandidates(shortlistedCandidates);
      })
      .catch((err) => {
        console.error("Error fetching candidates:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCandidates(candidates);
      return;
    }

    const filtered = candidates.filter((candidate) => {
      const searchFields = [
        candidate.name,
        candidate.email,
        candidate.clientName,
        candidate.contactNumber,
        candidate.technicalSkills,
        candidate.location,
        candidate.updatedBy,
        candidate.screeningComment
      ];

      return searchFields.some((field) =>
        field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    setFilteredCandidates(filtered);
  }, [searchTerm, candidates]);

  async function handleEdit(id) {
    const isAdmin = await validateACmanager();
    if (!isAdmin) {
      router.push(`/recruiter/${id}`);
      return;
    }
    router.push(`/ACmanager/${id}`);
  }

  function handleReject(id) {
    if (confirm("Are you sure you want to reject this candidate?")) {
      fetch(`/api/candidates/${id}/reject`, {
        method: "PUT",
      })
        .then((res) => res.json())
        .then(() => {
          setCandidates((prev) => prev.filter((c) => c.id !== id));
        })
        .catch((err) => {
          console.error("Error rejecting candidate:", err);
        });
    }
  }

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="py-3">
            <h1 className="text-xl font-semibold text-gray-900">Shortlisted Candidates</h1>
            <p className="mt-1 text-xs text-gray-600">
              Manage and review candidates who have been shortlisted for interviews
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-3">
        {/* Toolbar */}
        <div className="bg-white rounded-lg border border-gray-200 mb-3">
          <div className="p-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-8 pr-8 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center"
                    >
                      <svg className="h-3 w-3 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center text-xs text-gray-500">
                <span className="font-medium text-gray-900">{filteredCandidates.length}</span>
                <span className="ml-1">
                  {filteredCandidates.length === 1 ? 'candidate' : 'candidates'}
                </span>
                {searchTerm && (
                  <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px]">
                    Filtered
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center px-2 py-1 font-semibold leading-6 text-xs text-gray-900">
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Skills
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Current CTC
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Expected CTC
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Notice Period
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Resume
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-3 py-8 text-center">
                          <div className="text-gray-500">
                            <svg className="mx-auto h-6 w-6 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-sm font-medium text-gray-900 mb-1">
                              {searchTerm ? 'No candidates found' : 'No shortlisted candidates'}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {searchTerm ? 'Try adjusting your search terms.' : 'Shortlisted candidates will appear here.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentCandidates.map((candidate, index) => (
                        <tr key={candidate.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="font-medium text-xs text-gray-900">{candidate.name}</div>
                            <div className="text-[10px] text-gray-500">
                              Screened by {candidate.updatedBy}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 max-w-[120px]">
                            <div className="truncate" title={candidate.email}>
                              {candidate.email || 'No email'}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {candidate.clientName}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {candidate.contactNumber}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {candidate.relevantExperience} years
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900 max-w-[150px]">
                            <div className="truncate" title={candidate.technicalSkills}>
                              {candidate.technicalSkills}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {candidate.currentCTC}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {candidate.expectedCTC}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {candidate.noticePeriod}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {candidate.location}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">
                            {candidate.resumeLink ? (
                              <a
                                href={candidate.resumeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M7 7h10a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                                </svg>
                                View
                              </a>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">
                            <button
                              onClick={() => handleEdit(candidate.id)}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-2 py-2 border-t border-gray-200 sm:px-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-700 mr-2">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredCandidates.length)} of {filteredCandidates.length} results
                      </span>
                      <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 py-0.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-2 py-0.5 text-xs font-medium border border-gray-300 rounded-md ${
                              currentPage === pageNum
                                ? 'bg-blue-50 text-blue-600 border-blue-500'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-0.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
