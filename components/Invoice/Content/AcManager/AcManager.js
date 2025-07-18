"use client";
import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const initialCandidates = [
    {
        id: 1,
        RecruitmentName: "Alice Johnson",
        CompanyName: "Tech Solutions",
        Work: "Software Engineer",
        Experience: "5 years",
        Status: "Pending",
        NoticePeriod: "2 Months",
        PrimaryRequirement: "React, Node.js, AWS",
        SecondaryRequirement: "Docker, Kubernetes",
        WorkType: "Remote",
        CTC: "12 LPA",
        pdfUrl: "/sample_resume.pdf"
    },
    {
        id: 2,
        RecruitmentName: "Bob Smith",
        CompanyName: "TechCorp",
        Work: "Product Manager",
        Experience: "8 years",
        Status: "Pending",
        NoticePeriod: "3 Months",
        PrimaryRequirement: "Leadership, Agile, Product Strategy",
        SecondaryRequirement: "UX Research, Data Analysis",
        WorkType: "Hybrid",
        CTC: "20 LPA",
        pdfUrl: "/sample_resume.pdf"
    }
];

export default function AcManagerTable() {
    const [candidates, setCandidates] = useState(initialCandidates);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [shortlistDate, setShortlistDate] = useState("");
    const [shortlistTime, setShortlistTime] = useState("");
    const [feedback, setFeedback] = useState("");

    // Handle View
    const handleView = (candidate) => {
        setSelectedCandidate(candidate);
    };

    // Handle Shortlist
    const handleShortlist = () => {
        if (!shortlistDate || !shortlistTime) {
            toast.error("Please select date and time.");
            return;
        }
        setCandidates(candidates.map(c => c.id === selectedCandidate.id ? { ...c, Status: "Shortlisted" } : c));
        toast.success("Candidate Shortlisted!");
        setSelectedCandidate({ ...selectedCandidate, Status: "Shortlisted" });
    };

    // Handle Reject
    const handleReject = () => {
        if (!feedback) {
            toast.error("Please provide feedback.");
            return;
        }
        setCandidates(candidates.map(c => c.id === selectedCandidate.id ? { ...c, Status: "Rejected" } : c));
        toast.error("Candidate Rejected.");
        setSelectedCandidate({ ...selectedCandidate, Status: "Rejected" });
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
                        <TableHead>Work</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.RecruitmentName}</TableCell>
                            <TableCell>{item.CompanyName}</TableCell>
                            <TableCell>{item.Work}</TableCell>
                            <TableCell>{item.Experience}</TableCell>
                            <TableCell className={`font-bold ${item.Status === "Shortlisted" ? "text-green-500" : item.Status === "Rejected" ? "text-red-500" : "text-yellow-500"}`}>
                                {item.Status}
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
                        <p><strong>Name:</strong> {selectedCandidate.RecruitmentName}</p>
                        <p><strong>Company:</strong> {selectedCandidate.CompanyName}</p>
                        <p><strong>Work:</strong> {selectedCandidate.Work}</p>
                        <p><strong>Experience:</strong> {selectedCandidate.Experience}</p>
                        <p><strong>Notice Period:</strong> {selectedCandidate.NoticePeriod}</p>
                        <p><strong>Primary Skills:</strong> {selectedCandidate.PrimaryRequirement}</p>
                        <p><strong>Secondary Skills:</strong> {selectedCandidate.SecondaryRequirement}</p>
                        <p><strong>Work Type:</strong> {selectedCandidate.WorkType}</p>
                        <p><strong>CTC:</strong> {selectedCandidate.CTC}</p>
                        <p><strong>Status:</strong> <span className={`font-bold ${selectedCandidate.Status === "Shortlisted" ? "text-green-500" : selectedCandidate.Status === "Rejected" ? "text-red-500" : "text-yellow-500"}`}>
                            {selectedCandidate.Status}
                        </span></p>
                    </div>

                    {/* Resume Section */}
                    <div className="mt-6">
                        <h2 className="text-sm font-semibold">Resume</h2>
                        <iframe src={selectedCandidate.pdfUrl} className="w-full h-[300px] border rounded-md mt-2" title="Resume Preview"></iframe>
                        <div className="mt-3">
                            <Button onClick={() => window.open(selectedCandidate.pdfUrl, "_blank")} variant="outline">
                                Open Resume in New Tab
                            </Button>
                        </div>
                    </div>

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
