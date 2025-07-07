"use client";
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function AcManagerTable() {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [shortlistDate, setShortlistDate] = useState("");
    const [shortlistTime, setShortlistTime] = useState("");
    const [feedback, setFeedback] = useState("");

    // Fetch candidates from API
    useEffect(() => {
        async function fetchCandidates() {
            try {
                const res = await fetch("/api/ACmanager");
                const data = await res.json();
                setCandidates(data);
            } catch (err) {
                toast.error("Failed to fetch candidates");
            }
        }
        fetchCandidates();
    }, []);

    // Handle View
    const handleView = (candidate) => {
        setSelectedCandidate(candidate);
    };

    // Handle Shortlist
    const handleShortlist = async () => {
        if (!shortlistDate || !shortlistTime) {
            toast.error("Please select date and time.");
            return;
        }
        try {
            const res = await fetch(`/api/ACmanager/${selectedCandidate.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ acmanagerStatus: "Shortlisted" }),
            });
            if (res.ok) {
                toast.success("Candidate Shortlisted!");
                setCandidates(candidates.map(c => c.id === selectedCandidate.id ? { ...c, acmanagerStatus: "Shortlisted" } : c));
                setSelectedCandidate({ ...selectedCandidate, acmanagerStatus: "Shortlisted" });
            } else {
                toast.error("Failed to update status");
            }
        } catch {
            toast.error("Failed to update status");
        }
    };

    // Handle Reject
    const handleReject = async () => {
        if (!feedback) {
            toast.error("Please provide feedback.");
            return;
        }
        try {
            const res = await fetch(`/api/ACmanager/${selectedCandidate.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ acmanagerStatus: "Rejected" }),
            });
            if (res.ok) {
                toast.error("Candidate Rejected.");
                setCandidates(candidates.map(c => c.id === selectedCandidate.id ? { ...c, acmanagerStatus: "Rejected" } : c));
                setSelectedCandidate({ ...selectedCandidate, acmanagerStatus: "Rejected" });
            } else {
                toast.error("Failed to update status");
            }
        } catch {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">A/C Manager</h1>

            {/* Table Section */}
            <Table className="border rounded-lg">
                <TableHeader>
                    <TableRow className="bg-gray-100">
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.company}</TableCell>
                            <TableCell>{item.role}</TableCell>
                            <TableCell>{item.relevantExperience || item.experience || "-"}</TableCell>
                            <TableCell className={`font-bold ${item.acmanagerStatus === "Shortlisted" ? "text-green-500" : item.acmanagerStatus === "Rejected" ? "text-red-500" : "text-yellow-500"}`}>
                                {item.acmanagerStatus || "Pending"}
                            </TableCell>
                            <TableCell className="flex gap-2">
                                <Button onClick={() => handleView(item)} variant="outline" className="text-sm">
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Candidate Details Section */}
            {selectedCandidate && (
                <div className="mt-6 p-6 border rounded-lg shadow-md bg-white">
                    <h2 className="text-xl font-semibold text-center mb-4">Candidate Details</h2>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                        <p><strong>Name:</strong> {selectedCandidate.name}</p>
                        <p><strong>Company:</strong> {selectedCandidate.company}</p>
                        <p><strong>Role:</strong> {selectedCandidate.role}</p>
                        <p><strong>Experience:</strong> {selectedCandidate.relevantExperience || selectedCandidate.experience || "-"}</p>
                        <p><strong>Notice Period:</strong> {selectedCandidate.noticePeriod || "-"}</p>
                        <p><strong>Primary Skills:</strong> {selectedCandidate.technicalSkills}</p>
                        <p><strong>Secondary Skills:</strong> {selectedCandidate.secondarySkillExp}</p>
                        <p><strong>Work Type:</strong> {selectedCandidate.employmentType}</p>
                        <p><strong>CTC:</strong> {selectedCandidate.currentCTC ? `${selectedCandidate.currentCTC} LPA` : "-"}</p>
                        <p><strong>Status:</strong> <span className={`font-bold ${selectedCandidate.acmanagerStatus === "Shortlisted" ? "text-green-500" : selectedCandidate.acmanagerStatus === "Rejected" ? "text-red-500" : "text-yellow-500"}`}>
                            {selectedCandidate.acmanagerStatus || "Pending"}
                        </span></p>
                    </div>

                    {/* Resume Section */}
                    {selectedCandidate.resumeLink && (
                        <div className="mt-6">
                            <h2 className="text-sm font-semibold">Resume</h2>
                            <iframe src={selectedCandidate.resumeLink} className="w-full h-[300px] border rounded-md mt-2" title="Resume Preview"></iframe>
                            <div className="mt-3">
                                <Button onClick={() => window.open(selectedCandidate.resumeLink, "_blank")} variant="outline">
                                    Open Resume in New Tab
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Shortlist & Reject Actions */}
                    <div className="mt-6 bg-gray-100 p-4 rounded-md">
                        <h2 className="text-lg font-semibold">Actions</h2>

                        {/* Shortlist Section */}
                        <div className="mt-3">
                            <label className="block text-sm font-semibold">Shortlist Date:</label>
                            <input
                                type="date"
                                className="border p-2 rounded w-full"
                                value={shortlistDate}
                                onChange={(e) => setShortlistDate(e.target.value)}
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-semibold">Shortlist Time:</label>
                            <input
                                type="time"
                                className="border p-2 rounded w-full"
                                value={shortlistTime}
                                onChange={(e) => setShortlistTime(e.target.value)}
                            />
                        </div>
                        <div className="mt-4">
                            <Button onClick={handleShortlist} className="bg-green-500 hover:bg-green-700 text-white w-full">
                                Shortlist Candidate
                            </Button>
                        </div>

                        {/* Reject Section */}
                        <div className="mt-4">
                            <label className="block text-sm font-semibold">Rejection Feedback:</label>
                            <textarea
                                className="border p-2 rounded w-full"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide a reason for rejection"
                            />
                        </div>
                        <div className="mt-4">
                            <Button onClick={handleReject} className="bg-red-500 hover:bg-red-700 text-white w-full">
                                Reject Candidate
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}