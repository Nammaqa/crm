import { useEffect, useState } from "react";

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

  // Set your API base URL in .env as NEXT_PUBLIC_BASEAPIURL
  const BASE_URL = process.env.NEXT_PUBLIC_BASEAPIURL;

  // Function to handle file download/view
  const handleDownload = async (fileUrl, fileName = null) => {
    if (!fileUrl) {
      alert('No file available for download');
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      if (fileName) {
        link.download = fileName;
      } else {
        const urlParts = fileUrl.split('/');
        const defaultName = urlParts[urlParts.length - 1] || 'jd_document';
        link.download = defaultName;
      }
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      window.open(fileUrl, '_blank', 'noopener noreferrer');
    }
  };

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
                    {row.jdImage ? (
                      <button
                        onClick={() => handleDownload(row.jdImage, row.requirementName ? `${row.requirementName}_JD` : undefined)}
                        className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                      >
                          View
                      </button>
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
  );
}