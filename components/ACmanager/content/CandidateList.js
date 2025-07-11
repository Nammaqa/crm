"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DownloadIcon, PencilIcon, TrashIcon } from "lucide-react";

export default function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [clientFilters, setClientFilters] = useState([]);
  const [uniqueClients, setUniqueClients] = useState([]);

  useEffect(() => {
    fetch("/api/candidates")
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
        const unique = Array.from(new Set(data.map((c) => c.clientName))).filter(Boolean);
        setUniqueClients(unique);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCandidates((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete candidate");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const downloadCSV = () => {
    const headers = Object.keys(filteredAndSortedCandidates[0] || {});
    const rows = filteredAndSortedCandidates.map((c) =>
      headers.map((h) =>
        typeof c[h] === "object"
          ? JSON.stringify(c[h]).replace(/"/g, "'")
          : c[h] ?? ""
      )
    );
    const csvContent = [headers, ...rows]
      .map((e) => e.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "filtered_candidates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const filteredAndSortedCandidates = candidates
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) &&
      (clientFilters.length === 0 || clientFilters.includes(c.clientName))
    )
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentCandidates = filteredAndSortedCandidates.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAndSortedCandidates.length / recordsPerPage);

  const toggleClientFilter = (client) => {
    setClientFilters((prev) =>
      prev.includes(client) ? prev.filter((c) => c !== client) : [...prev, client]
    );
    setCurrentPage(1);
  };
  console.log(currentCandidates);
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
        All Candidates List
      </h2>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-64"
        />

        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="p-2 border border-gray-300 rounded"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={20}>25</option>
            <option value={20}>50</option>
            <option value={100}>100</option>
          </select>
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {uniqueClients.length > 0 && (
        <div className="bg-white p-3 mb-4 rounded border">
          <p className="font-semibold mb-2">Filter by Client:</p>
          <div className="flex flex-wrap gap-4 max-h-32 overflow-y-auto">
            {uniqueClients.map((client) => (
              <label key={client} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={clientFilters.includes(client)}
                  onChange={() => toggleClientFilter(client)}
                />
                {client}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse bg-white shadow-sm">
          <thead className="bg-gray-200">
            <tr>
              {[
                "Name",
                "Client Name",
                "Contact No",
                "YOE",
                "Skills",
                "Current CTC",
                "Expected CTC",
                "Notice",
                "Screening Status",
                "Screening By",
                "Availability",
                "Location",
                "Added On",
                "Resume",
                "Actions",
              ].map((title, index) => (
                <th
                  key={title}
                  className={`border px-4 py-2 whitespace-nowrap bg-gray-100 ${
                    index < 5 ? `sticky left-[${index * 120}px] bg-gray-100 z-10` : ""
                  }`}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentCandidates.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2 whitespace-nowrap sticky left-0 bg-white z-10">{c.name}</td>
                <td className="border px-4 py-2 whitespace-nowrap sticky left-[120px] bg-white z-10">{c.clientName}</td>
                <td className="border px-4 py-2 whitespace-nowrap sticky left-[240px] bg-white z-10">{c.contactNumber}</td>
                <td className="border px-4 py-2 whitespace-nowrap sticky left-[360px] bg-white z-10">{c.relevantExperience}</td>
                <td className="border px-4 py-2 whitespace-nowrap sticky left-[480px] bg-white z-10">{c.technicalSkills}</td>
                <td className="border px-4 py-2 whitespace-nowrap">{c.currentCTC}</td>
                <td className="border px-4 py-2 whitespace-nowrap">{c.expectedCTC}</td>
                <td className="border px-4 py-2 whitespace-nowrap">{c.noticePeriod}</td>
                <td className="border px-4 py-2 whitespace-nowrap">{c.status}</td>
                <td className="border px-4 py-2 whitespace-nowrap">{c.updatedBy}</td>
                <td className="border px-4 py-2 whitespace-nowrap">{c.interviewAvailability}</td>
                <td className="border px-4 py-2 whitespace-nowrap">{c.location}</td>
                <td className="border px-4 py-2 whitespace-nowrap">{new Date(c.createdAt).toISOString().split("T")[0]}</td>
                <td className="border px-4 py-2 whitespace-nowrap">
                  {c.resumeLink ? (
                    <a
                      href={c.resumeLink}
                      target = "_blank"
                      rel="noopener noreferrer"
                      download
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <DownloadIcon className="w-4 h-4 mr-1" /> Download
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">No file</span>
                  )}
                </td>
                <td className="border px-4 py-2 whitespace-nowrap flex gap-2">
                  <Link href={`/recruiter/${c.id}`}>
                    <button className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`px-3 py-1 rounded border ${
              currentPage === num ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}