"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validateACmanager } from "@/actions/validateACmanager";

export default function ShortList() {
  const [candidates, setCandidates] = useState([]);
  const [userName, setUserName] = useState("");
  const [demandCodes, setDemandCodes] = useState([]);
  const [selectedDemandCode, setSelectedDemandCode] = useState("");
  const router = useRouter();

  // Fetch logged-in user name
  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success && resJson.data) {
          setUserName(resJson.data.userName);
        }
      }).then((res) => {
        fetchDemandCodes();
      });
  }, []);
  async function fetchDemandCodes() {
    const res = await fetch("/api/demand-code");
    const data = await res.json();
    // If the API returns { data: [...], success: true }
    if (data.success && Array.isArray(data.data)) {
      console.log('fff ', data.data);
      setDemandCodes(data.data);
    }
  }
  // useEffect(() => {
  //   fetchDemandCodes();
  // }, [])

  // Fetch all shortlisted candidates
  useEffect(() => {
    fetch("/api/ACmanager")
      .then((res) => res.json())
      .then((data) => {
        const shortlisted = data.filter((c) => c.acmanagerStatus === "Selected");
        setCandidates(shortlisted);

        // Filter demand codes where userName === salesName
        const codes = [
          ...new Set(
            shortlisted
              .filter((c) => c.salesName === userName && c.demandCode)
              .map((c) => c.demandCode)
          ),
        ];
        setDemandCodes(codes);
      });
  }, [userName]);

  // Filtered candidates by demand code
  const filteredCandidates = selectedDemandCode
    ? candidates.filter((c) => c.demandCode === selectedDemandCode)
    : candidates.filter((c) => c.salesName === userName);

  // Handler for viewing resume in a new tab
  const handleViewResume = (resumeLink) => {
    if (resumeLink) {
      window.open(resumeLink, "_blank", "noopener,noreferrer");
    }
  };
  const handleDemandCodeChange = async (code) => {
    setSelectedDemandCode(code);
    try {
      const res = await fetch(`/api/demand-code/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId: code }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCandidates(data.data);
      }
    } catch (error) {
      console.error("Error fetching filtered candidates:", error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Container 1: Demand Code Dropdown */}
      <div className="max-w-2xl mx-auto bg-white rounded shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Filter by Demand Code</h2>
        <select
          className="border rounded px-4 py-2 w-full"
          value={selectedDemandCode}
          onChange={(e) => { handleDemandCodeChange(e.target.value) }}
        >
          <option value="">All Demand Codes</option>
          {demandCodes && demandCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      {/* Container 2: Table */}
      <div className="max-w-7xl mx-auto bg-white rounded shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Shortlisted Candidates
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white shadow-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Client Name</th>
                <th className="border px-4 py-2">Contact No</th>
                <th className="border px-4 py-2">YOE</th>
                <th className="border px-4 py-2">Skills</th>
                <th className="border px-4 py-2">Current CTC</th>
                <th className="border px-4 py-2">Expected CTC</th>
                <th className="border px-4 py-2">Notice</th>
                <th className="border px-4 py-2">Screening Status</th>
                <th className="border px-4 py-2">Screening By</th>
                <th className="border px-4 py-2">Availability</th>
                <th className="border px-4 py-2">Location</th>
                <th className="border px-4 py-2">Added On</th>
                <th className="border px-4 py-2">Resume</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-6 text-gray-400">
                    No shortlisted candidates found.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50">
                    <td className="border px-4 py-2">{c.name}</td>
                    <td className="border px-4 py-2">{c.clientName}</td>
                    <td className="border px-4 py-2">{c.contactNumber}</td>
                    <td className="border px-4 py-2">{c.relevantExperience}</td>
                    <td className="border px-4 py-2">{c.technicalSkills}</td>
                    <td className="border px-4 py-2">{c.currentCTC}</td>
                    <td className="border px-4 py-2">{c.expectedCTC}</td>
                    <td className="border px-4 py-2">{c.noticePeriod}</td>
                    <td className="border px-4 py-2">{c.status}</td>
                    <td className="border px-4 py-2">{c.updatedBy}</td>
                    <td className="border px-4 py-2">{c.interviewAvailability}</td>
                    <td className="border px-4 py-2">{c.location}</td>
                    <td className="border px-4 py-2">
                      {c.createdAt
                        ? new Date(c.createdAt).toISOString().split("T")[0]
                        : ""}
                    </td>
                    <td className="border px-4 py-2">
                      {c.resumeLink ? (
                        <button
                          onClick={() => handleViewResume(c.resumeLink)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">No file</span>
                      )}
                    </td>
                    <td className="border px-4 py-2 space-x-2">
                      {c.resumeLink ? (
                        <button
                          onClick={() => handleViewResume(c.resumeLink)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">No Action</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}