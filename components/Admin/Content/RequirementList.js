import { useEffect, useState } from "react";
import { getRoleFromToken } from "@/lib/decodeRoleFromToken";

// Define the tabs and their keys
const TABS = [
  { key: "requirement", label: "Requirement" },
];

export default function AgreementList() {
  const [activeTab, setActiveTab] = useState("requirement");
  const [data, setData] = useState({
    requirement: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [modalFile, setModalFile] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all"); // Default search in all fields

  // Set your API base URL in .env as NEXT_PUBLIC_BASEAPIURL
  const BASE_URL = process.env.NEXT_PUBLIC_BASEAPIURL;

  // Fetch requirements from the API
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
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setRole(getRoleFromToken());
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  // Get priority text color
  const getPriorityColor = (priority) => {
    const colors = {
      High: "text-red-600",
      Medium: "text-yellow-600",
      Low: "text-green-600",
    };
    return colors[priority] || "text-gray-600";
  };

  // Filter data based on search term
  const filteredData = data[activeTab]?.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    if (searchField === "all") {
      // Search across all relevant fields
      return (
        (item.requirementId?.toLowerCase() || '').includes(searchLower) ||
        (item.requirementName?.toLowerCase() || '').includes(searchLower) ||
        (item.companyName?.toLowerCase() || '').includes(searchLower) ||
        (item.jobDescription?.toLowerCase() || '').includes(searchLower) ||
        (item.primarySkills?.toLowerCase() || '').includes(searchLower) ||
        (item.secondarySkills?.toLowerCase() || '').includes(searchLower) ||
        (item.requirementType?.toLowerCase() || '').includes(searchLower) ||
        (item.workLocation?.toLowerCase() || '').includes(searchLower) ||
        (item.priority?.toLowerCase() || '').includes(searchLower)
      );
    } else {
      // Search in specific field
      const fieldValue = item[searchField]?.toString().toLowerCase() || '';
      return fieldValue.includes(searchLower);
    }
  });

  // Pagination calculations
  const totalItems = filteredData?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredData?.slice(startIndex, endIndex) || [];

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchField]);

  // Search field options
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

  // Secure Document Viewer
  const SecureDocumentViewer = ({ fileUrl, onClose }) => {
    useEffect(() => {
      const handleKeyDown = (e) => {
        // Disable Ctrl+S, Ctrl+P, PrintScreen, etc.
        if ((e.ctrlKey && (e.key === 's' || e.key === 'p')) || e.key === 'PrintScreen') {
          e.preventDefault();
          alert('This action is disabled for security reasons.');
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isPDF = fileUrl.toLowerCase().endsWith('.pdf');

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-5xl w-full relative" style={{ minWidth: '80%' }}>
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
            onClick={onClose}
            aria-label="Close document viewer"
          >
            &times;
          </button>
          
          <div className="relative h-[70vh] overflow-hidden">
            <div className="absolute inset-0 bg-transparent pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" opacity="0.1">
                <text x="50%" y="50%" fontFamily="Arial" fontSize="20" fill="black" textAnchor="middle" dominantBaseline="middle" transform="rotate(-45, 200, 100)">
                  CONFIDENTIAL - VIEW ONLY
                </text>
              </svg>
            </div>
            {isPDF ? (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                title="Document Preview"
                className="w-full h-full border-none"
                sandbox="allow-same-origin allow-scripts"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <iframe
                src={fileUrl}
                title="Document Preview"
                className="w-full h-full border-none"
                sandbox="allow-same-origin"
                onContextMenu={(e) => e.preventDefault()}
              />
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            This document is for viewing purposes only. Right-click and download functions are disabled.
          </div>
        </div>
      </div>
    );
  };

  // Render the table for the selected tab
  function renderTable(tab) {
    const rows = currentItems;
    if (rows.length === 0) return <div className="py-4 text-gray-500">No data found.</div>;

    switch (tab) {
      case "requirement":
        return (
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Requirement ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Requirement Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Company Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Job Description</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Experience</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Notice Period</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Positions</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Primary Skills</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Secondary Skills</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Requirement Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Work Location</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Position Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Budget (INR)</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">Priority</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">JD Image/Doc</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {rows.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-blue-600 font-medium">{row.requirementId || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.requirementName || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.companyName || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.jobDescription || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.experience || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.noticePeriod || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.positions || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.primarySkills || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.secondarySkills || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.requirementType || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.workLocation || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.closePositions || ""}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.budget || ""}</td>
                  <td className={`border border-gray-300 px-4 py-2 font-medium ${getPriorityColor(row.priority)}`}>
                    {row.priority || "Medium"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {row.jdImage && (
                      <button
                        onClick={() => setModalFile(row.jdImage)}
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  }

  // Pagination controls component
  const PaginationControls = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-2 sm:space-y-0">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {endIndex} of {totalItems} entries
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Items per page selector */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          {/* Previous button */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {/* Page numbers */}
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-1 border text-sm ${
                currentPage === number
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              } rounded`}
            >
              {number}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-full px-6 py-4">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Requirement List</h2>
      
      {/* Search and Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          {/* Search Field Selector */}
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-auto"
          >
            {searchFields.map(field => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
          
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={`Search in ${searchFields.find(f => f.value === searchField)?.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {searchTerm ? `Found ${totalItems} results` : `Total: ${totalItems} items`}
        </div>
      </div>
      
      {/* Tab Buttons */}
      <div className="flex space-x-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-6 py-2 rounded-t font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Table Content */}
      <div className="bg-white border border-gray-300 rounded-b shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : error ? (
          <div className="text-red-600 py-8 text-center font-medium">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              {renderTable(activeTab)}
            </div>
            
            {/* Pagination Controls */}
            {totalItems > 0 && <PaginationControls />}
          </>
        )}
      </div>
      
      {modalFile && <SecureDocumentViewer fileUrl={modalFile} onClose={() => setModalFile(null)} />}
    </div>
  );
}