import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
const jobData = [
    {
        date: "2025-03-10",
        requirementName: "Software Engineer",
        companyName: "TechCorp",
        jobDescription: "",
        jobdetailed: 'Managing SQL Server databases Configuring and maintaining database servers and processes.Monitoring system’s health and Perrformance.Ensuring high levels of performance, availability, sustainability and security.Analyzing solving and correcting issues in real-time.Providing suggestions for solutions.Refining and automating regular processes, tracking issues, and documenting changes.Assisting developers with query tuning and schema refinement.Performing scheduled maintenance and supporting release deployment activities after hours',
        primarySkills: "React, Node.js",
        secondarySkills: "Docker, Kubernetes",
        positionsToClose: 3,
        requirementType: "Full-Time",
        workLocation: "Remote",
        salary: "₹12,00,000 / year",
        experience: "2-4 years",
        contactEmail: "hr@techcorp.com"
    },
    {
        date: "2025-03-09",
        requirementName: "Data Scientist",
        companyName: "AI Solutions",
        jobDescription: "Analyze data and build machine learning models.",
        jobdetailed: 'Managing SQL Server databases Configuring and maintaining database servers and processes.Monitoring system’s health and Perrformance.Ensuring high levels of performance, availability, sustainability and security.Analyzing solving and correcting issues in real-time.Providing suggestions for solutions.Refining and automating regular processes, tracking issues, and documenting changes.Assisting developers with query tuning and schema refinement.Performing scheduled maintenance and supporting release deployment activities after hours',
        primarySkills: "Python, TensorFlow",
        secondarySkills: "SQL, AWS",
        positionsToClose: 2,
        requirementType: "Contract",
        workLocation: "On-Site",
        salary: "₹15,00,000 / year",
        experience: "3-5 years",
        contactEmail: "jobs@aisolutions.com"
    },
    {
        date: "2025-03-08",
        requirementName: "DevOps Engineer",
        companyName: "CloudTech",
        jobDescription: "Automate infrastructure and CI/CD pipelines.",
        jobdetailed: 'Managing SQL Server databases Configuring and maintaining database servers and processes.Monitoring system’s health and Perrformance.Ensuring high levels of performance, availability, sustainability and security.Analyzing solving and correcting issues in real-time.Providing suggestions for solutions.Refining and automating regular processes, tracking issues, and documenting changes.Assisting developers with query tuning and schema refinement.Performing scheduled maintenance and supporting release deployment activities after hours',
        primarySkills: "AWS, Terraform",
        secondarySkills: "Jenkins, Ansible",
        positionsToClose: 1,
        requirementType: "Full-Time",
        workLocation: "Hybrid",
        salary: "₹14,00,000 / year",
        experience: "4-6 years",
        contactEmail: "recruitment@cloudtech.com"
    }
];

function JobList() {
    const [selectedJob, setSelectedJob] = useState(null);
    const [profiles, setProfiles] = useState([]);

    const handleProfileUpload = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const fileType = file.type;

            setProfiles([
                ...profiles,
                { name: file.name, file, type: fileType }
            ]);
        }
    };

    return (
        <div className="p-4">
            <div className="overflow-x-auto">
                <Table className="w-full min-w-[900px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Requirement</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Primary Skills</TableHead>
                            <TableHead>Work Location</TableHead>
                            <TableHead>Salary</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>View</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobData.map((job, index) => (
                            <TableRow key={index}>
                                <TableCell>{job.date}</TableCell>

                                <TableCell>{job.requirementName}</TableCell>
                                <TableCell>{job.companyName}</TableCell>
                                <TableCell>{job.primarySkills}</TableCell>
                                <TableCell>{job.workLocation}</TableCell>
                                <TableCell>{job.salary}</TableCell>
                                <TableCell>{job.experience}</TableCell>
                                <TableCell>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" onClick={() => setSelectedJob(job)}>
                                                View
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-lg w-full p-4">
                                            <DialogHeader>
                                                <DialogTitle>Job Details</DialogTitle>
                                            </DialogHeader>
                                            {selectedJob && (
                                                <div className="space-y-3 text-sm">
                                                    <p><strong>Requirement:</strong> {selectedJob.requirementName}</p>
                                                    <p><strong>Company:</strong> {selectedJob.companyName}</p>
                                                    <p><strong>Description:</strong> {selectedJob.jobdetailed}</p>
                                                    {/* <p><strong>Primary Skills:</strong> {selectedJob.primarySkills}</p>
                                                    <p><strong>Secondary Skills:</strong> {selectedJob.secondarySkills}</p>
                                                    <p><strong>Positions to Close:</strong> {selectedJob.positionsToClose}</p>
                                                    <p><strong>Requirement Type:</strong> {selectedJob.requirementType}</p>
                                                    <p><strong>Work Location:</strong> {selectedJob.workLocation}</p>
                                                    <p><strong>Salary:</strong> {selectedJob.salary}</p>
                                                    <p><strong>Experience Required:</strong> {selectedJob.experience}</p>
                                                    <p><strong>Contact:</strong> <a href={`mailto:${selectedJob.contactEmail}`} className="text-blue-600 hover:underline">{selectedJob.contactEmail}</a></p> */}

                                                    {/* Profile Upload Section */}
                                                    <div className="mt-4 space-y-2">
                                                        <Label className="font-medium">Upload Profile</Label>
                                                        <Input type="file" accept=".pdf, .png, .jpg, .jpeg, .docx, .txt , .csv" onChange={handleProfileUpload} />

                                                        <Button className="mt-2">Add Profile</Button>

                                                        {/* Display Uploaded Profiles */}
                                                        {/* Display Uploaded Profiles */}
                                                        {profiles.length > 0 && (
                                                            <div className="mt-4">
                                                                <h3 className="text-lg font-medium">Uploaded Profiles</h3>
                                                                <ul className="list-disc pl-5 space-y-2">
                                                                    {profiles.map((profile, i) => (
                                                                        <li key={i} className="text-sm flex items-center gap-2">
                                                                            {/* Show Image Preview */}
                                                                            {profile.type.startsWith("image/") && (
                                                                                <Image src={URL.createObjectURL(profile.file)} alt={profile.name} className="w-12 h-12 rounded-md object-cover" />
                                                                            )}

                                                                            {/* Show PDF or Other Files */}
                                                                            <a
                                                                                href={URL.createObjectURL(profile.file)}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-600 hover:underline"
                                                                            >
                                                                                {profile.name}
                                                                            </a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default JobList;
