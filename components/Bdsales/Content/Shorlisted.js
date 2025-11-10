"use client";
import { useEffect, useState } from "react";

export default function ShortList() {
  const [candidates, setCandidates] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [clientNames, setClientNames] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);

  // Step 1: Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success && data.data?.userName) {
          setUserName(data.data.userName);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // Step 2: Fetch shortlisted candidates linked to this user's requirements
  useEffect(() => {
    if (!userName) return;
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/shortlisted-candidates?userName=${encodeURIComponent(userName)}`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCandidates(data.data);
          // Extract unique client names if available
          const uniqueClients = Array.from(
            new Set(data.data.map((c) => c.clientName).filter(Boolean))
          );
          setClientNames(uniqueClients);
        } else {
          setCandidates([]);
        }
      } catch (err) {
        console.error("Error fetching candidates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [userName]);

  // Step 3: Filter by client name
  const filteredCandidates =
    selectedClients.length === 0
      ? candidates
      : candidates.filter((c) => selectedClients.includes(c.clientName));

  const handleClientCheckbox = (client) => {
    setSelectedClients((prev) =>
      prev.includes(client)
        ? prev.filter((c) => c !== client)
        : [...prev, client]
    );
  };

  const handleViewResume = (link) => {
    if (link) window.open(link, "_blank");
  };

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
          Shortlisted Candidates (Your Requirements)
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading candidates...</p>
        ) : filteredCandidates.length === 0 ? (
          <p className="text-center text-gray-400 italic">
            No shortlisted candidates found for your requirements.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white shadow-sm">
              <thead className="bg-blue-100">
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
                    "Demand Code",
                    "Resume",
                  ].map((header) => (
                    <th key={header} className="border px-4 py-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((c) => (
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
                    <td className="border px-4 py-2">
                      {c.interviewAvailability}
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
