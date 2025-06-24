import { useEffect, useState } from "react";
import { getRoleFromToken } from "@/lib/decodeRoleFromToken";

// Define the tabs and their keys
const TABS = [
  // { key: "bdsales", label: "BD/Sales" },
  { key: "msa", label: "MSA" },
  { key: "nda", label: "NDA" },
  { key: "sow", label: "Statement of Work" },
  { key: "po", label: "Purchase Order" },
];

export default function AgreementList() {
  const [activeTab, setActiveTab] = useState("msa");
  const [data, setData] = useState({
    // bdsales: [],
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

  // Function to handle file download
  const handleDownload = async (fileUrl, fileName = null) => {
    if (!fileUrl) {
      alert('No file available for download');
      return;
    }

    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      
      // Set download attribute with filename if available
      if (fileName) {
        link.download = fileName;
      } else {
        // Extract filename from URL or use default
        const urlParts = fileUrl.split('/');
        const defaultName = urlParts[urlParts.length - 1] || 'agreement_document';
        link.download = defaultName;
      }
      
      // Set target to _blank to handle CORS issues
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(fileUrl, '_blank', 'noopener noreferrer');
    }
  };

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
        return `${cleanClientName}_${type}_agreement.${fileExtension};`
      }
      
      return fileName;
    } catch (error) {
      return `${clientName || 'agreement'}_${type || 'document'}.pdf;`
    }
  };

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

        // Fetch requirements
        const resRequirements = await fetch(`${BASE_URL}/api/requirements`);
        if (!resRequirements.ok) throw new Error("Failed to fetch requirements");
        const jsonRequirements = await resRequirements.json();

        // Categorize agreements
        const categorized = {
          // bdsales: [],
          msa: [],
          nda: [],
          requirement: [],
          sow: [],
          po: [],
        };
        
        if (Array.isArray(jsonAgreements.data)) {
          jsonAgreements.data.forEach((item) => {
            // Normalize type to lower case for matching
            const type = (item.type || "").toLowerCase();
            if (categorized[type]) {
              categorized[type].push(item);
            }
          });
        }
        
        // Add requirements to the requirement tab
        if (Array.isArray(jsonRequirements)) {
          categorized.requirement = jsonRequirements;
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

  // Render the table for the selected tab
  function renderTable(tab) {
    const rows = data[tab] || [];
    if (rows.length === 0) return <div className="py-4 text-gray-500">No data found.</div>;

    switch (tab) {
      case "bdsales":
        return (
          <table className="min-w-full border text-xs">
            <thead>
              <tr>
                <th className="border px-2 py-1">Sales Name</th>
                <th className="border px-2 py-1">Lead Type</th>
                <th className="border px-2 py-1">Deal Type</th>
                <th className="border px-2 py-1">Company Name</th>
                <th className="border px-2 py-1">No. Employees</th>
                <th className="border px-2 py-1">SPOCs</th>
                <th className="border px-2 py-1">Lead Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className="border px-2 py-1">{row.salesName || ""}</td>
                  <td className="border px-2 py-1">{row.leadType || ""}</td>
                  <td className="border px-2 py-1">{row.dealType || ""}</td>
                  <td className="border px-2 py-1">{row.companyName || ""}</td>
                  <td className="border px-2 py-1">{row.numEmployees || row.numberOfEmployees || ""}</td>
                  <td className="border px-2 py-1">
                    {Array.isArray(row.spocs)
                      ? row.spocs.map((spoc, i) => (
                          <div key={i}>
                            {spoc.name} ({spoc.email})
                          </div>
                        ))
                      : ""}
                  </td>
                  <td className="border px-2 py-1">
                    {row.leadType === "existing"
                      ? JSON.stringify(row.existingLeadDetails)
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
        
      case "msa":
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
                          onClick={() => handleDownload(
                            row.fileUpload, 
                            getFileName(row.fileUpload, row.clientName, 'MSA')
                          )}
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
        
      case "nda":
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
                          onClick={() => handleDownload(
                            row.fileUpload, 
                            getFileName(row.fileUpload, row.clientName, 'NDA')
                          )}
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
                </tr>
              ))}
            </tbody>
          </table>
        );
        
      case "sow":
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
                          onClick={() => handleDownload(
                            row.fileUpload, 
                            getFileName(row.fileUpload, row.clientName, 'SOW')
                          )}
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
        
      case "po":
        return (
          <table className="min-w-full border text-xs">
            <thead>
              <tr>
                <th className="border px-2 py-1">PO Number</th>
                <th className="border px-2 py-1">Client Name</th>
                <th className="border px-2 py-1">Employee Name</th>
                <th className="border px-2 py-1">Technology</th>
                <th className="border px-2 py-1">Start Date</th>
                <th className="border px-2 py-1">End Date</th>
                <th className="border px-2 py-1">File</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className="border px-2 py-1">{row.poNumber || ""}</td>
                  <td className="border px-2 py-1">{row.clientName || ""}</td>
                  <td className="border px-2 py-1">{row.employeeName || ""}</td>
                  <td className="border px-2 py-1">
                    {row.technology === 'other' ? row.otherTechnology : row.technology || ""}
                  </td>
                  <td className="border px-2 py-1">{formatDate(row.startDate)}</td>
                  <td className="border px-2 py-1">{formatDate(row.endDate)}</td>
                  <td className="border px-2 py-1">
                    {row.fileUpload ? (
                      role === "SUPERADMIN" ? (
                        <button
                          onClick={() => handleDownload(
                            row.fileUpload, 
                            getFileName(row.fileUpload, row.clientName, 'PO')
                          )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
              onClick={() => setModalFile(null)}
            >
              &times;
            </button>
            <iframe
              src={modalFile}
              title="Document Preview"
              className="w-full h-[70vh] border rounded"
            />
          </div>
        </div>
      )}
    </>
  );
}