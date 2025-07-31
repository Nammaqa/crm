"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Your Candidate Interface
interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  client?: string;
  createdAt: string;
  updatedBy?: string; // <- make sure this is present as per your data
}

interface CandidateListProps {
  initialSearchTerm?: string;
  initialStatusFilter?: string;
}

export default function Overview({
  initialSearchTerm = "",
  initialStatusFilter = "",
}: CandidateListProps) {
  const [userName, setUserName] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState({ total: 0, shortlisted: 0, rejected: 0, pending: 0 });

  useEffect(() => {
    // Step 1: Fetch user info first
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success && resJson.data) {
          setUserName(resJson.data.userName);
          
          // Step 2: Then fetch all candidates and filter
          fetch("/api/ACmanager")
            .then((res) => res.json())
            .then((data) => {
              // Only candidates updated by current user
              const filtered = data.filter(
                (c: Candidate) => c.updatedBy === resJson.data.userName
              );
              setCandidates(filtered);
              // stats
              const shortlisted = filtered.filter((c) => c.status === "Selected").length;
              const rejected = filtered.filter((c) => c.status === "Rejected").length;
              const pending = filtered.filter((c) => c.status === "Pending").length;
              const total = filtered.length;
              setStats({ total, shortlisted, rejected, pending });
            })
            .catch((err) => console.error("Failed to load candidates", err));
        }
      })
      .catch((err) => console.error("Failed to load user info", err));
  }, []);

  const chartData = [
    { name: "Shortlisted", value: stats.shortlisted, fill: "#4CAF50" },
    { name: "Pending", value: stats.pending, fill: "#FFEB3B" },
    { name: "Rejected", value: stats.rejected, fill: "#F44336" },
  ];

  const barChartData = [
    { name: "Total", candidates: stats.total },
    { name: "Shortlisted", candidates: stats.shortlisted },
    { name: "Pending", candidates: stats.pending },
    { name: "Rejected", candidates: stats.rejected },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      {/* Header: Logo & Welcome Message */}
      <div className="w-full max-w-6xl bg-white p-6 m-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between">
        <div className="logo-container flex flex-col items-center gap-4">
          <Image
            src="/Wizzybox Logo.png"
            alt="CRM Logo"
            width={150}
            height={50}
            className="w-auto max-w-full"
          />
          <h1
            id="welcome-message"
            className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left"
          >
            Welcome, {userName}
          </h1>
        </div>
      </div>

      {/* Dashboard Summary Section */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="summary-box bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
          <div className="summary-title text-lg font-semibold">Total Candidates</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="summary-box bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
          <div className="summary-title text-lg font-semibold">Shortlisted</div>
          <div className="text-3xl font-bold">{stats.shortlisted}</div>
        </div>
        <div className="summary-box bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
          <div className="summary-title text-lg font-semibold">Pending</div>
          <div className="text-3xl font-bold">{stats.pending}</div>
        </div>
        <div className="summary-box bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
          <div className="summary-title text-lg font-semibold">Rejected</div>
          <div className="text-3xl font-bold">{stats.rejected}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold mb-4">Candidates Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold mb-4">Candidate Status Bar Chart</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="candidates" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
