import { useEffect, useState } from "react";
import { getRoleFromToken } from "@/lib/decodeRoleFromToken";

const TABS = [{ key: "requirement", label: "Requirement" }];

export default function AgreementList() {
  const [activeTab, setActiveTab] = useState("requirement");
  const [data, setData] = useState({ requirement: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [modalFile, setModalFile] = useState(null);

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
      High: "text-red-600 font-semibold",
      Medium: "text-yellow-600 font-semibold",
      Low: "text-green-600 font-semibold",
    };
    return colors[priority] || "text-gray-700";
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-2xl w-[85%] max-w-5xl p-5 relative">
          <button
            className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            onClick={onClose}
          >
            ✖
          </button>

          <div className="h-[75vh] border rounded-lg overflow-hidden shadow-inner">
            {isPDF ? (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                className="w-full h-full"
              />
            ) : (
              <iframe src={fileUrl} className="w-full h-full" />
            )}
          </div>

          <p className="text-center text-xs mt-3 text-gray-500">
            Secure View Mode • Download Disabled
          </p>
        </div>
      </div>
    );
  };

  /** FIXED: renderTable MOVED BACK INSIDE */
  const renderTable = () => {
    if (!currentItems || currentItems.length === 0) {
      return <div className="text-center py-8 text-gray-500">No data found.</div>;
    }

    return (
      <table className="min-w-full text-sm border-collapse">
        <thead className="bg-gray-50 text-gray-700 border-b">
          <tr>
            {[
              "Req ID",
              "Name",
              "Company",
              "Description",
              "Experience",
              "Notice",
              "Positions",
              "Primary Skills",
              "Secondary Skills",
              "Type",
              "Location",
              "Pos Type",
              "Budget",
              "Priority",
              "JD File",
            ].map((header) => (
              <th key={header} className="px-4 py-3 border text-left font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
          {currentItems.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-100 transition">
              <td className="border px-4 py-2">{row.requirementId}</td>
              <td className="border px-4 py-2">{row.requirementName}</td>
              <td className="border px-4 py-2">{row.companyName}</td>
              <td className="border px-4 py-2">{row.jobDescription}</td>
              <td className="border px-4 py-2">{row.experience}</td>
              <td className="border px-4 py-2">{row.noticePeriod}</td>
              <td className="border px-4 py-2">{row.positions}</td>
              <td className="border px-4 py-2">{row.primarySkills}</td>
              <td className="border px-4 py-2">{row.secondarySkills}</td>
              <td className="border px-4 py-2">{row.requirementType}</td>
              <td className="border px-4 py-2">{row.workLocation}</td>
              <td className="border px-4 py-2">{row.closePositions}</td>
              <td className="border px-4 py-2">{row.budget}</td>
              <td className={`border px-4 py-2 ${getPriorityColor(row.priority)}`}>
                {row.priority}
              </td>
              <td className="border px-4 py-2">
                {row.jdImage && (
                  <button
                    onClick={() => setModalFile(row.jdImage)}
                    className="text-blue-600 hover:text-blue-800 underline"
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
  };

  const Pagination = () => (
    <div className="flex justify-between items-center py-4 px-2 text-sm w-full">
      <p className="text-gray-600">
        Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> to{" "}
        <b>{Math.min(currentPage * itemsPerPage, totalItems)}</b> of{" "}
        <b>{totalItems}</b>
      </p>

      <div className="flex items-center gap-2">
        <select
          className="border rounded px-2 py-1"
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
          className="border px-3 py-1 rounded disabled:opacity-40"
        >
          Prev
        </button>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="border px-3 py-1 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">

      <div className="w-full bg-white shadow-sm px-8 py-5 border-b">
        <h1 className="text-2xl font-semibold text-gray-800">Requirement List</h1>
      </div>

      <div className="w-full p-6">

        <div className="bg-white border rounded-xl shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">

            <div className="flex gap-3 w-full md:w-auto">
              <select
                className="border rounded-lg px-3 py-2 text-sm"
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
                placeholder="Search anything..."
                className="border rounded-lg px-3 py-2 text-sm w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="text-gray-700 text-sm">
              {searchTerm ? `Found: ${totalItems}` : `Total: ${totalItems}`}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-500">Loading…</div>
          ) : error ? (
            <div className="py-16 text-center text-red-600">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">{renderTable()}</div>
              <Pagination />
            </>
          )}
        </div>
      </div>

      {modalFile && (
        <SecureDocumentViewer fileUrl={modalFile} onClose={() => setModalFile(null)} />
      )}
    </div>
  );
}
