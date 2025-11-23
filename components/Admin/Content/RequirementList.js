import { useEffect, useState } from "react";
import { getRoleFromToken } from "@/lib/decodeRoleFromToken";

const TABS = [{ key: "requirement", label: "Requirement" }];

export default function AgreementList() {
  const [activeTab] = useState("requirement");
  const [data, setData] = useState({ requirement: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [modalFile, setModalFile] = useState(null);
  const [detailView, setDetailView] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");

  const BASE_URL = process.env.NEXT_PUBLIC_BASEAPIURL;

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError("");
      try {
        const resRequirements = await fetch(`${BASE_URL}/api/requirements`);
        if (!resRequirements.ok) throw new Error("Failed to fetch requirements");
        const jsonRequirements = await resRequirements.json();
        setData({ requirement: Array.isArray(jsonRequirements) ? jsonRequirements : [] });
      } catch (err) {
        setError(err.message || "Error fetching requirement data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    setRole(getRoleFromToken());
  }, []);

  const getPriorityColor = (priority) => {
    const colors = {
      High: "bg-red-50 text-red-700 border border-red-100",
      Medium: "bg-yellow-50 text-yellow-700 border border-yellow-100",
      Low: "bg-green-50 text-green-700 border border-green-100",
    };
    return colors[priority] || "bg-gray-50 text-gray-700 border border-gray-100";
  };

  const filteredData = data[activeTab]?.filter((item) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    if (searchField === "all") {
      return (
        item.requirementId?.toLowerCase().includes(s) ||
        item.requirementName?.toLowerCase().includes(s) ||
        item.companyName?.toLowerCase().includes(s) ||
        item.primarySkills?.toLowerCase().includes(s) ||
        item.secondarySkills?.toLowerCase().includes(s) ||
        item.requirementType?.toLowerCase().includes(s) ||
        item.workLocation?.toLowerCase().includes(s) ||
        item.priority?.toLowerCase().includes(s)
      );
    } else {
      return item[searchField]?.toString().toLowerCase().includes(s);
    }
  });

  const totalItems = filteredData?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = filteredData?.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage
  ) || [];

  useEffect(() => setCurrentPage(1), [searchTerm, searchField]);

  const searchFields = [
    { value: "all", label: "All Fields" },
    { value: "requirementId", label: "Requirement ID" },
    { value: "requirementName", label: "Requirement Name" },
    { value: "companyName", label: "Company Name" },
    { value: "primarySkills", label: "Primary Skills" },
    { value: "secondarySkills", label: "Secondary Skills" },
    { value: "workLocation", label: "Work Location" },
    { value: "priority", label: "Priority" },
  ];

  const SecureDocumentViewer = ({ fileUrl, onClose }) => {
    const isPDF = fileUrl?.toLowerCase().endsWith(".pdf");
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-2">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl flex flex-col max-h-[96vh]">
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <h3 className="text-lg font-medium">Document Viewer</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1" aria-label="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-2 overflow-hidden">
            <div className="h-full border border-gray-200 rounded">
              {isPDF ? (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                  className="w-full h-full"
                  title="Document Viewer"
                />
              ) : (
                <iframe src={fileUrl} className="w-full h-full" title="Document Viewer" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DetailViewModal = ({ requirement, onClose }) => {
    if (!requirement) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-5">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
          <div className="flex items-center justify-between px-8 py-5 border-b">
            <h2 className="text-2xl font-semibold text-gray-900">Requirement Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Column */}
              <div>
                <section className="mb-8">
                  <h3 className="uppercase tracking-wide text-xs font-bold text-gray-500 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 border border-gray-100 bg-gray-50 rounded-lg p-6">
                    <LabelValue label="Requirement ID" value={requirement.requirementId} />
                    <LabelValue label="Requirement Name" value={requirement.requirementName} />
                    <LabelValue label="Company Name" value={requirement.companyName} />
                    <LabelValue
                      label="Priority"
                      value={
                        <span
                          className={`inline-flex px-4 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                            requirement.priority
                          )}`}
                        >
                          {requirement.priority}
                        </span>
                      }
                    />
                    <LabelValue label="Experience Required" value={requirement.experience} />
                    <LabelValue label="Notice Period" value={requirement.noticePeriod} />
                    <LabelValue label="Number of Positions" value={requirement.positions} />
                    <LabelValue label="Position Type" value={requirement.closePositions} />
                    <LabelValue label="Budget" value={requirement.budget} />
                    <LabelValue label="Requirement Type" value={requirement.requirementType} />
                    <LabelValue label="Work Location" value={requirement.workLocation} />
                  </div>
                </section>
                <section>
                  <h3 className="uppercase tracking-wide text-xs font-bold text-gray-500 mb-4">Skills</h3>
                  <div className="grid grid-cols-1 gap-y-4 border border-gray-100 bg-gray-50 rounded-lg p-6">
                    <LabelValue label="Primary Skills" value={requirement.primarySkills || "Not specified"} />
                    <LabelValue label="Secondary Skills" value={requirement.secondarySkills || "Not specified"} />
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div>
                <section className="mb-6">
                  <h3 className="uppercase tracking-wide text-xs font-bold text-gray-500 mb-4">Job Description</h3>
                  <div className="border border-gray-100 rounded-lg bg-gray-50 p-6 min-h-[130px] whitespace-pre-wrap text-gray-800 text-sm">
                    {requirement.jobDescription || <span className="text-gray-400">No description provided</span>}
                  </div>
                </section>

                {requirement.jdImage && (
                  <section>
                    <button
                      onClick={() => {
                        setDetailView(null);
                        setModalFile(requirement.jdImage);
                      }}
                      className="w-full px-6 py-3 bg-blue-600 rounded-lg text-white font-semibold text-base hover:bg-blue-700 transition-colors"
                    >
                      View JD Document
                    </button>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  function LabelValue({ label, value }) {
    return (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="text-sm text-gray-900 mt-1">{value || "—"}</span>
      </div>
    );
  }

  const renderTable = () => {
    if (!currentItems || currentItems.length === 0) {
      return (
        <div className="text-center py-10">
          <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-sm">No requirements found</p>
        </div>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase">Req ID</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase">Name</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase">Company</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase">Experience</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase">Primary Skills</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase">Secondary Skills</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase">Priority</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700 uppercase">JD File</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {currentItems.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-semibold text-gray-900">{row.requirementId}</td>
                <td className="px-4 py-2">{row.requirementName}</td>
                <td className="px-4 py-2">{row.companyName}</td>
                <td className="px-4 py-2">{row.experience}</td>
                <td className="px-4 py-2">{row.primarySkills}</td>
                <td className="px-4 py-2">{row.secondarySkills}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(row.priority)}`}>
                    {row.priority}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  {row.jdImage ? (
                    <button
                      onClick={() => setModalFile(row.jdImage)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => setDetailView(row)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-2 py-2 bg-gray-100 border-t">
      <div className="text-xs text-gray-600">
        Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
        <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
        <span className="font-bold text-gray-900">{totalItems}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">Rows:</span>
        <select
          className="border border-gray-300 rounded px-2 py-1 text-xs bg-white"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[5, 10, 20, 50].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-2 py-1 border border-gray-300 rounded text-xs bg-white hover:bg-gray-50 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-2 py-1 border border-gray-300 rounded text-xs bg-white hover:bg-gray-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-10 py-4 max-w-[1800px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Requirement List</h1>
          <p className="text-gray-500 text-base">Manage and view all job requirements</p>
        </div>
      </div>

      <div className="p-5 max-w-[1800px] mx-auto">
        {/* Search Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-col md:flex-row items-center gap-3 shadow-sm w-full">
          <div className="flex gap-3 w-full md:w-auto items-center">
            <select
              className="border border-gray-300 rounded px-3 py-2 text-base bg-white"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              {searchFields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search requirements..."
              className="border border-gray-300 rounded px-3 py-2 text-base w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded border border-indigo-100 text-base">
            <span className="font-semibold text-indigo-900">
              {searchTerm ? `Found: ${totalItems}` : `Total: ${totalItems}`}
            </span>
          </div>
        </div>
        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm w-full">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-gray-500 text-lg">Loading requirements...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <svg className="mx-auto h-8 w-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-600 font-semibold text-lg">{error}</p>
            </div>
          ) : (
            <>
              {renderTable()}
              <Pagination />
            </>
          )}
        </div>
      </div>
      {/* Modals */}
      {modalFile && (
        <SecureDocumentViewer fileUrl={modalFile} onClose={() => setModalFile(null)} />
      )}
      {detailView && (
        <DetailViewModal requirement={detailView} onClose={() => setDetailView(null)} />
      )}
    </div>
  );
}
