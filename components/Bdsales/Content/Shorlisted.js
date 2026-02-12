"use client";
import { useEffect, useState } from "react";

export default function ShortList() {
  const [candidates, setCandidates] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [clientNames, setClientNames] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success && data.data?.userName) {
          setUserName(data.data.userName);
        } else {
          setError("Failed to fetch user information");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Error fetching user");
      }
    };
    fetchUser();
  }, []);

  // Fetch shortlisted candidates
  useEffect(() => {
    if (!userName) return;
    const fetchCandidates = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/shortlisted-candidates?userName=${encodeURIComponent(
            userName
          )}`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCandidates(data.data);
          const uniqueClients = Array.from(
            new Set(data.data.map((c) => c.clientName).filter(Boolean))
          );
          setClientNames(uniqueClients.sort());
        } else {
          setCandidates([]);
          setError(data.message || "No candidates found");
        }
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setError("Error fetching candidates");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [userName]);

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesClient =
      selectedClients.length === 0 || selectedClients.includes(c.clientName);
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      q === "" ||
      c.name?.toLowerCase().includes(q) ||
      c.technicalSkills?.toLowerCase().includes(q);
    return matchesClient && matchesSearch;
  });

  // Reset page on filters
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClients]);

  const handleClientCheckbox = (client) => {
    setSelectedClients((prev) =>
      prev.includes(client)
        ? prev.filter((c) => c !== client)
        : [...prev, client]
    );
  };

  const handleViewResume = (link) => {
    if (link) window.open(link, "_blank");
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const closeDetailsModal = () => {
    setSelectedCandidate(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Selected":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // pagination math
  const totalItems = filteredCandidates.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const pageRows = filteredCandidates.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 space-y-4">
        {/* Header + search */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Shortlisted Candidates
            </h1>
            {userName && (
              <p className="text-xs md:text-sm text-gray-600">
                Requirements by: {userName}
              </p>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-end w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs md:text-sm text-gray-600">
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Client Filter */}
        {clientNames.length > 0 && (
          <div className="bg-white rounded shadow px-4 py-3">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">
              Filter by Client
            </h3>
            <div className="flex flex-wrap gap-3">
              {clientNames.map((client) => (
                <label
                  key={client}
                  className="inline-flex items-center cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    checked={selectedClients.includes(client)}
                    onChange={() => handleClientCheckbox(client)}
                  />
                  <span className="ml-2 text-gray-700">{client}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Table + pagination */}
        <div className="bg-white rounded shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">Loading candidates...</p>
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">
                No shortlisted candidates found.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Client Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Experience
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Skills
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Current CTC
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Expected CTC
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Notice Period
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Demand Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Resume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pageRows.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">
                          <button
                            onClick={() => handleViewDetails(c)}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            {c.name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {c.clientName || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {c.contactNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {c.relevantExperience || "—"} yrs
                        </td>
                        <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                          {c.technicalSkills || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {c.currentCTC || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {c.expectedCTC || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {c.noticePeriod || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {c.location || "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {c.demandCodeAssignments?.[0]?.demandCode || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {c.resumeLink ? (
                            <button
                              onClick={() => handleViewResume(c.resumeLink)}
                              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                              View
                            </button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50 text-xs text-gray-600">
                <div>
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {totalItems === 0 ? 0 : startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min(startIndex + rowsPerPage, totalItems)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {totalItems}
                  </span>{" "}
                  candidates
                </div>
                <div className="flex items-center gap-2">
                  <span>Rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <span>
                    Page{" "}
                    <span className="font-semibold text-gray-900">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {totalPages}
                    </span>
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details modal (you can design this later if needed) */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedCandidate.name}
              </h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            {/* Basic example content, adapt to your fields */}
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Client:</span>{" "}
                {selectedCandidate.clientName || "—"}
              </p>
              <p>
                <span className="font-semibold">Skills:</span>{" "}
                {selectedCandidate.technicalSkills || "—"}
              </p>
              <p>
                <span className="font-semibold">Location:</span>{" "}
                {selectedCandidate.location || "—"}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(
                    selectedCandidate.status
                  )}`}
                >
                  {selectedCandidate.status || "—"}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
//