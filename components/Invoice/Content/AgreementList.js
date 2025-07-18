import { useEffect, useState } from "react";
import { getRoleFromToken } from "@/lib/decodeRoleFromToken";

// Define the tabs and their keys
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

  // Set your API base URL in .env as NEXT_PUBLIC_BASEAPIURL
  const BASE_URL = process.env.NEXT_PUBLIC_BASEAPIURL;

  useEffect(() => {
    setRole(getRoleFromToken());
  }, []);

  // Fetch all agreements and requirements from the API and categorize by type
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError("");
      try {
        // Fetch agreements
        const resAgreements = await fetch(`${BASE_URL}/api/agreements`);
        if (!resAgreements.ok) throw new Error("Failed to fetch agreements");
        const jsonAgreements = await resAgreements.json();

        // Categorize agreements
        const categorized = {
          msa: [],
          nda: [],
          sow: [],
          po: [],
        };
        
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
    // eslint-disable-next-line
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
    const rows = data[tab] || [];
    if (rows.length === 0) return <div className="py-4 text-gray-500">No data found.</div>;

    switch (tab) {
      case "msa":
      case "nda":
      case "sow":
      case "po":
        return (
          <table className="min-w-full border text-xs">
            <thead>
              <tr>
                <th className="border px-2 py-1">Client Name</th>
                <th className="border px-2 py-1">Employee Name</th>
                <th className="border px-2 py-1">Technology</th>
                <th className="border px-2 py-1">Start Date</th>
                <th className="border px-2 py-1">End Date</th>
                <th className="border px-2 py-1">PO Number</th>
                <th className="border px-2 py-1">File</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className="border px-2 py-1">{row.clientName || ""}</td>
                  <td className="border px-2 py-1">{row.employeeName || ""}</td>
                  <td className="border px-2 py-1">
                    {row.technology === 'other' ? row.otherTechnology : row.technology || ""}
                  </td>
                  <td className="border px-2 py-1">{formatDate(row.startDate)}</td>
                  <td className="border px-2 py-1">{formatDate(row.endDate)}</td>
                  <td className="border px-2 py-1">{row.poNumber || ""}</td>
                  <td className="border px-2 py-1">
                    {row.fileUpload ? (
                      role === "SUPERADMIN" ? (
                        <button
                          onClick={() => handleDownload(row.fileUpload, getFileName(row.fileUpload, row.clientName, tab.toUpperCase()))}
                          className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                        >
                          Download
                        </button>
                      ) : (
                        <button
                          onClick={() => setModalFile(row.fileUpload)}
                          className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                        >
                          View Only
                        </button>
                      )
                    ) : (
                      "N/A"
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

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-4">Agreement List</h2>
        
        {/* Tab Buttons */}
        <div className="flex space-x-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-t transition-colors ${
                activeTab === tab.key 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Table Content */}
        <div className="bg-white border rounded-b shadow p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-600">Loading...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 py-4 text-center">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              {renderTable(activeTab)}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal for file preview */}
      {modalFile && (
        <SecureDocumentViewer fileUrl={modalFile} onClose={() => setModalFile(null)} />
      )}
    </>
  );
}

// Function to get file name from URL
const getFileName = (fileUrl, clientName = '', type = '') => {
  if (!fileUrl) return 'document';
  
  try {
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    // If we have client name and type, create a meaningful filename
    if (clientName && type) {
      const cleanClientName = clientName.replace(/\s+/g, '_');
      const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : 'pdf';
      return `${cleanClientName}_${type}_agreement.${fileExtension}`;
    }
    
    return fileName;
  } catch (error) {
    return `${clientName || 'agreement'}_${type || 'document'}.pdf`;
  }
};
