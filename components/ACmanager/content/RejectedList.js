"use client";
import { useEffect, useState } from "react";

export default function RejectedList() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetch("/api/ACmanager")
      .then(res => res.json())
      .then(data => setCandidates(data.filter(c => c.acmanagerStatus === "Rejected")));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rejected Candidates</h2>
      <ul className="list-disc pl-5">
        {candidates.map(c => (
          <li key={c.id}>{c.name} ({c.email})</li>
        ))}
      </ul>
    </div>
  );
}