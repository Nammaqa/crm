"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ShortList() {
  const [candidates, setCandidates] = useState([]);
  const [userName, setUserName] = useState("");
  const [clientNames, setClientNames] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const router = useRouter();

  // Fetch logged-in user name
  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success && resJson.data) {
          setUserName(resJson.data.userName);
        }
      });
  }, []);

  // Fetch all shortlisted candidates for this user using the new API
  useEffect(() => {
    if (!userName) return;
    fetch(`/api/shortlisted-candidates?userName=${encodeURIComponent(userName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCandidates(data.data);
          // Extract unique client names for filter
          const uniqueClients = Array.from(new Set(data.data.map((c) => c.clientName).filter(Boolean)));
          setClientNames(uniqueClients);
        } else {
          setCandidates([]);
          setClientNames([]);
        }
      });
  }, [userName]);

  // Filter candidates by selected client names
  const filteredCandidates = selectedClients.length === 0
    ? candidates
    : candidates.filter((c) => selectedClients.includes(c.clientName));

  const handleClientCheckbox = (client) => {
    setSelectedClients((prev) =>
      prev.includes(client)
        ? prev.filter((c) => c !== client)
        : [...prev, client]
    );
  };

  // Filter UI and table
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Filter Section */}
      <div className="max-w-7xl mx-auto bg-white rounded shadow-md p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Filter by Client Name</h3>
        <div className="flex flex-wrap gap-4">
          {clientNames.length === 0 ? (
            <span className="text-gray-400">No clients found.</span>
          ) : (
            clientNames.map((client) => (
              <label key={client} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={selectedClients.includes(client)}
                  onChange={() => handleClientCheckbox(client)}
                />
                <span className="ml-2 text-gray-700">{client}</span>
              </label>
            ))
          )}
        </div>
      </div>
      {/* Table Section */}
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
                <th className="border px-4 py-2">Demand Code</th>
                <th className="border px-4 py-2">Resume</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={16} className="text-center py-6 text-gray-400">
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
                    <td className="border px-4 py-2">{c.demandCode}</td>
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