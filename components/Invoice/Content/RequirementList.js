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
      case "requirement":
        return (
          <table className="min-w-full border text-xs">
            <thead>
              <tr>
                <th className="border px-2 py-1">Requirement Name</th>
                <th className="border px-2 py-1">Company Name</th>
                <th className="border px-2 py-1">Job Description</th>
                <th className="border px-2 py-1">Experience</th>
                <th className="border px-2 py-1">Notice Period</th>
                <th className="border px-2 py-1">Positions</th>
                <th className="border px-2 py-1">Primary Skills</th>
                <th className="border px-2 py-1">Secondary Skills</th>
                <th className="border px-2 py-1">Requirement Type</th>
                <th className="border px-2 py-1">Work Location</th>
                <th className="border px-2 py-1">Position Type</th>
                <th className="border px-2 py-1">Budget (INR)</th>
                <th className="border px-2 py-1">JD Image/Doc</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className="border px-2 py-1">{row.requirementName || ""}</td>
                  <td className="border px-2 py-1">{row.companyName || ""}</td>
                  <td className="border px-2 py-1">{row.jobDescription || ""}</td>
                  <td className="border px-2 py-1">{row.experience || ""}</td>
                  <td className="border px-2 py-1">{row.noticePeriod || ""}</td>
                  <td className="border px-2 py-1">{row.positions || ""}</td>
                  <td className="border px-2 py-1">{row.primarySkills || ""}</td>
                  <td className="border px-2 py-1">{row.secondarySkills || ""}</td>
                  <td className="border px-2 py-1">{row.requirementType || ""}</td>
                  <td className="border px-2 py-1">{row.workLocation || ""}</td>
                  <td className="border px-2 py-1">{row.closePositions || ""}</td>
                  <td className="border px-2 py-1">{row.budget || ""}</td>
                  <td className="border px-2 py-1">
                    {row.jdImage && (
                      <button
                        onClick={() => setModalFile(row.jdImage)}
                        className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                      >
                        View Document
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

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-4">Requirement List</h2>
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
      {modalFile && <SecureDocumentViewer fileUrl={modalFile} onClose={() => setModalFile(null)} />}
    </>
  );
}
