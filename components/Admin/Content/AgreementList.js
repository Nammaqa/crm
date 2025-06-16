import { useEffect, useState } from "react";

// Define the tabs and their keys
const TABS = [
  // { key: "bdsales", label: "BD/Sales" },
  { key: "msa", label: "MSA" },
  { key: "nda", label: "NDA" },
  { key: "requirement", label: "Requirement" },
  { key: "sow", label: "Statement of Work" },
  { key: "po", label: "Purchase Order" },
];

export default function AgreementList() {
  const [activeTab, setActiveTab] = useState("bdsales");
  const [data, setData] = useState({
    // bdsales: [],
    msa: [],
    nda: [],
    requirement: [],
    sow: [],
    po: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set your API base URL in .env as NEXT_PUBLIC_BASEAPIURL
  const BASE_URL = process.env.NEXT_PUBLIC_BASEAPIURL;

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
                <th className="border px-2 py-1">Start Date</th>
                <th className="border px-2 py-1">End Date</th>
                <th className="border px-2 py-1">File</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className="border px-2 py-1">{row.clientName || ""}</td>
                  <td className="border px-2 py-1">{row.startDate || ""}</td>
                  <td className="border px-2 py-1">{row.endDate || ""}</td>
                  <td className="border px-2 py-1">
                    {row.fileUpload ? (
                      <a href={row.fileUpload} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        Download
                      </a>
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
                <th className="border px-2 py-1">Start Date</th>
                <th className="border px-2 py-1">End Date</th>
                <th className="border px-2 py-1">File</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className="border px-2 py-1">{row.clientName || ""}</td>
                  <td className="border px-2 py-1">{row.startDate || ""}</td>
                  <td className="border px-2 py-1">{row.endDate || ""}</td>
                  <td className="border px-2 py-1">
                    {row.fileUpload ? (
                      <a href={row.fileUpload} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        Download
                      </a>
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
                <th className="border px-2 py-1">SOW Name</th>
                <th className="border px-2 py-1">Client</th>
                <th className="border px-2 py-1">Start Date</th>
                <th className="border px-2 py-1">End Date</th>
                <th className="border px-2 py-1">File</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className="border px-2 py-1">{row.sowName || row.clientName || ""}</td>
                  <td className="border px-2 py-1">{row.clientName || ""}</td>
                  <td className="border px-2 py-1">{row.startDate || ""}</td>
                  <td className="border px-2 py-1">{row.endDate || ""}</td>
                  <td className="border px-2 py-1">
                    {row.fileUpload ? (
                      <a href={row.fileUpload} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        Download
                      </a>
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
                <th className="border px-2 py-1">Client</th>
                <th className="border px-2 py-1">Amount</th>
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
                  <td className="border px-2 py-1">{row.amount || ""}</td>
                  <td className="border px-2 py-1">{row.startDate || ""}</td>
                  <td className="border px-2 py-1">{row.endDate || ""}</td>
                  <td className="border px-2 py-1">
                    {row.fileUpload ? (
                      <a href={row.fileUpload} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        Download
                      </a>
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
      <h2 className="text-2xl font-bold mb-4">Agreement List</h2>
      {/* Tab Buttons */}
      <div className="flex space-x-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-t ${activeTab === tab.key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Table Content */}
      <div className="bg-white border rounded-b shadow p-4">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          renderTable(activeTab)
        )}
      </div>
    </div>
  );
}