import { useEffect, useState } from "react";
import { getRoleFromToken } from "@/lib/decodeRoleFromToken";

const TABS = [
  { key: "msa", label: "MSA" },
  { key: "nda", label: "NDA" },
  { key: "sow", label: "Statement of Work" },
  { key: "po", label: "Purchase Order" },
];

export default function AgreementList() {
  const [activeTab, setActiveTab] = useState("msa");
  const [data, setData] = useState({
    msa: [],
    nda: [],
    sow: [],
    po: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [modalFile, setModalFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setRole(getRoleFromToken());
  }, []);

  useEffect(() => {
    async function fetchAll() {
      const BASE_URL = process.env.NEXT_PUBLIC_BASEAPIURL;
      setLoading(true);
      setError("");
      try {
        const resAgreements = await fetch(`${BASE_URL}/api/agreements`);
        if (!resAgreements.ok) throw new Error("Failed to fetch agreements");
        const jsonAgreements = await resAgreements.json();

        const categorized = { msa: [], nda: [], sow: [], po: [] };

        if (Array.isArray(jsonAgreements.data)) {
          jsonAgreements.data.forEach((item) => {
            const type = (item.type || "").toLowerCase();
            if (categorized[type]) {
              categorized[type].push(item);
            }
          });
        }

        setData(categorized);
      } catch (err) {
        setError(err.message || "Error fetching agreement data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getFilteredData = () => {
    const rows = data[activeTab] || [];
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(q)
      )
    );
  };

  // reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const SecureDocumentViewer = ({ fileUrl, onClose }) => {
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (
          (e.ctrlKey && (e.key === "s" || e.key === "p")) ||
          e.key === "PrintScreen"
        ) {
          e.preventDefault();
          alert("This action is disabled for security reasons.");
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const isPDF = fileUrl.toLowerCase().endsWith(".pdf");

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Document Preview
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="flex-1 relative bg-gray-50">
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="text-gray-200 text-5xl font-bold transform -rotate-45 select-none opacity-10">
                CONFIDENTIAL
              </div>
            </div>
            {isPDF ? (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(
                  fileUrl
                )}&embedded=true`}
                title="Document Preview"
                className="w-full h-full"
                sandbox="allow-same-origin allow-scripts"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <iframe
                src={fileUrl}
                title="Document Preview"
                className="w-full h-full"
                sandbox="allow-same-origin"
                onContextMenu={(e) => e.preventDefault()}
              />
            )}
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t text-center text-xs text-gray-500">
            This document is for viewing purposes only. Download and print
            functions are disabled.
          </div>
        </div>
      </div>
    );
  };

  const allRows = getFilteredData();
  const totalItems = allRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const pageRows = allRows.slice(startIndex, startIndex + rowsPerPage);

  return (
    <>
      <div className="w-full min-h-screen bg-gray-50 flex flex-col">
        {/* Top bar: tabs + search, clearly visible */}
        <div className="w-full border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <nav className="flex gap-4 md:gap-8">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSearchTerm("");
                  }}
                  className={`py-2 px-2 md:px-3 border-b-2 text-sm md:text-base font-medium transition-colors ${
                    activeTab === tab.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Search agreements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table area with pagination */}
        <div className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-3">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-600 text-sm">
                {error}
              </div>
            ) : totalItems === 0 ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                {searchTerm ? "No matching results found" : "No data available"}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                  <table className="w-full text-sm text-left table-auto">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-700">
                          Client Name
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-700">
                          Employee
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-700">
                          Technology
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-700">
                          Start Date
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-700">
                          End Date
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-700">
                          PO Number
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pageRows.map((row, idx) => (
                        <tr
                          key={row.id || idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-gray-900">
                            {row.clientName || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {row.employeeName || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {row.technology === "other"
                              ? row.otherTechnology
                              : row.technology || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {formatDate(row.startDate)}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {formatDate(row.endDate)}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {row.poNumber || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {row.fileUpload ? (
                              role === "SUPERADMIN" ? (
                                <button
                                  onClick={() =>
                                    handleDownload(
                                      row.fileUpload,
                                      getFileName(
                                        row.fileUpload,
                                        row.clientName,
                                        activeTab.toUpperCase()
                                      )
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Download
                                </button>
                              ) : (
                                <button
                                  onClick={() => setModalFile(row.fileUpload)}
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  View
                                </button>
                              )
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
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                  <div>
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-900">
                      {Math.min(startIndex + rowsPerPage, totalItems)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {totalItems}
                    </span>{" "}
                    results
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
      </div>

      {modalFile && (
        <SecureDocumentViewer
          fileUrl={modalFile}
          onClose={() => setModalFile(null)}
        />
      )}
    </>
  );
}

const getFileName = (fileUrl, clientName = "", type = "") => {
  if (!fileUrl) return "document";
  try {
    const urlParts = fileUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    if (clientName && type) {
      const cleanClientName = clientName.replace(/\s+/g, "_");
      const fileExtension = fileName.includes(".")
        ? fileName.split(".").pop()
        : "pdf";
      return `${cleanClientName}_${type}_agreement.${fileExtension}`;
    }
    return fileName;
  } catch {
    return `${clientName || "agreement"}_${type || "document"}.pdf`;
  }
};

const handleDownload = (fileUrl, fileName) => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
