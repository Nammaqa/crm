"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validateACmanager } from "@/actions/validateACmanager";

export default function ShortList() {
  const [candidates, setCandidates] = useState([]);
  const [userName, setUserName] = useState("");
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

  useEffect(() => {
    fetch("/api/ACmanager")
      .then((res) => res.json())
      .then((data) =>
        setCandidates(data.filter((c) => c.acmanagerStatus === "Selected"))
      );
  }, []);

  async function handleEdit(id) {
    // Navigate to the CandidateEditForm page for this candidate
    const isAdmin = await validateACmanager();
    if (!isAdmin) {
      router.push(`/recruiter/${id}`);
      return;
    }
    router.push(`/ACmanager/${id}`);
  }

  function handleReject(id) {
    if (confirm("Are you sure you want to reject this candidate?")) {
      fetch(`/api/candidates/${id}/reject`, {
        method: "PUT",
      })
        .then((res) => res.json())
        .then(() => {
          setCandidates((prev) => prev.filter((c) => c.id !== id));
        })
        .catch((err) => {
          console.error("Error rejecting candidate:", err);
        });
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
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
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-6 text-gray-400">
                    No shortlisted candidates found.
                  </td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50">
                    <td className="border px-4 py-2">{c.name}</td>
                    <td className="border px-4 py-2">{c.clientName}</td>
                    <td className="border px-4 py-2">{c.contactNumber}</td>
                    <td className="border px-4 py-2">{c.relevantExperience}</td>
                    <td className="border px-4 py-2">{c.technicalSkills}</td>
                    <td className="border px-4 py-2">{c.currentCTC}</td>
                    <td className="border px-4 py-2">{c.expectedCTC}</td>
                    <td className="border px-4 py-2">{c.noticePeriod}</td>
                    <td className="border px-4 py-2">{c.screeningComment}</td>
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
                        <a
                          href={c.resumeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="text-blue-600 hover:underline"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">No file</span>
                      )}
                    </td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(c.id)}
                        className={`px-3 py-1 rounded text-white ${
                          userName === c.acupdateby
                            ? "bg-yellow-400 hover:bg-yellow-500"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                        disabled={userName !== c.acupdateby}
                      >
                        Edit
                      </button>
                      {/* <button
                        onClick={() => handleReject(c.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button> */}
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