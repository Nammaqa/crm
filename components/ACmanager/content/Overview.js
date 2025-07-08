"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { FaUserCheck, FaUserTimes, FaUserClock } from "react-icons/fa";

const COLORS = ["#3498db", "#e74c3c", "#f39c12"];

export default function Overview() {
  const [candidates, setCandidates] = useState([]);
  const [uniqueClients, setUniqueClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [stats, setStats] = useState({ total: 0, shortlisted: 0, rejected: 0, pending: 0 });
  const [userName, setUser] = useState("");

  useEffect(() => {
    fetch("/api/candidates")
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
        const clients = Array.from(new Set(data.map((c) => c.clientName))).filter(Boolean);
        setUniqueClients(clients);
        updateStats(data, "");
      })
      .catch((err) => console.error("Failed to load candidates", err));

    fetch("/api/users/me")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success && resJson.data) {
          setUser(resJson.data.userName);
        }
      })
      .catch((err) => console.error("Failed to load user info", err));

  }, []);

  const updateStats = (data, client) => {
    const filtered = client ? data.filter((c) => c.clientName === client) : data;
    const shortlisted = filtered.filter((c) => c.acmanagerStatus === "Selected").length;
    const rejected = filtered.filter((c) => c.acmanagerStatus === "Rejected").length;
    const pending = filtered.filter((c) => c.acmanagerStatus === "Pending").length;
    const total = filtered.length;
    setStats({ total, shortlisted, rejected, pending });
  };

  const handleClientChange = (e) => {
    const client = e.target.value;
    setSelectedClient(client);
    updateStats(candidates, client);
  };

  const chartData = [
    { name: "Shortlisted", value: stats.shortlisted },
    { name: "Rejected", value: stats.rejected },
    { name: "Pending", value: stats.pending },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      {/* Header */}
      <div className="w-full max-w-6xl bg-white p-6 m-6 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-between">
        <div className="logo-container flex flex-col items-center gap-4">
          <Image
            src="/Wizzybox Logo.png"
            alt="CRM Logo"
            width={150}
            height={50}
            className="w-auto max-w-full"
          />
          <h1 className="text-2xl font-bold text-gray-800 text-center sm:text-left">
            Welcome, {userName}
          </h1>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full max-w-6xl bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Candidate Summary</h2>
          <select
            value={selectedClient}
            onChange={handleClientChange}
            className="border border-gray-300 p-2 rounded shadow-sm hover:shadow-md transition"
          >
            <option value="">All Clients</option>
            {uniqueClients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 border rounded bg-blue-50 text-center shadow hover:shadow-lg transition">
            <FaUserCheck className="text-4xl text-blue-700 mb-2" />
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-gray-600">Total Candidates</p>
          </div>
          <div className="p-4 border rounded bg-green-50 text-center shadow hover:shadow-lg transition">
            <FaUserCheck className="text-4xl text-green-700 mb-2" />
            <p className="text-2xl font-bold text-green-700">{stats.shortlisted}</p>
            <p className="text-gray-600">Shortlisted</p>
          </div>
          <div className="p-4 border rounded bg-red-50 text-center shadow hover:shadow-lg transition">
            <FaUserTimes className="text-4xl text-red-700 mb-2" />
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            <p className="text-gray-600">Rejected</p>
          </div>
          <div className="p-4 border rounded bg-yellow-50 text-center shadow hover:shadow-lg transition">
            <FaUserClock className="text-4xl text-yellow-700 mb-2" />
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-gray-600">Pending</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded p-4 shadow-lg">
            <h3 className="text-md font-semibold mb-2">Candidate Status Pie Chart</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border rounded p-4 shadow-lg">
            <h3 className="text-md font-semibold mb-2">Candidate Status Bar Chart</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4b9cd3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
