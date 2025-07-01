// app/components/BdSales.js
"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899"];

export default function BdSales({ isSidebarOpen }) {
  const [salesUsers, setSalesUsers] = useState([]);
  const [selectedSales, setSelectedSales] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [leads, setLeads] = useState([]);
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, quarter: 0, halfYear: 0, year: 0 });

  const BASE_URL = process.env.NEXT_PUBLIC_BASEAPIURL;

  useEffect(() => {
    const fetchSalesUsers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/users?role=SALES`);
        const data = await res.json();
        setSalesUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setSalesUsers([]);
      }
    };
    fetchSalesUsers();
  }, [BASE_URL]);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!selectedSales) return;
      try {
        const res = await fetch(`${BASE_URL}/api/admin/lead?salesName=${encodeURIComponent(selectedSales)}`);
        const data = await res.json();
        let filtered = data;
        if (selectedMonth !== "all") {
          filtered = data.filter(lead => new Date(lead.createdAt).getMonth() + 1 === Number(selectedMonth));
        }
        setLeads(filtered);
        calculateStats(filtered);
      } catch (err) {
        console.error("Failed to fetch leads", err);
        setLeads([]);
      }
    };
    fetchLeads();
  }, [selectedSales, selectedMonth]);

  const calculateStats = (leads) => {
    const now = new Date();
    const startOf = (period) => {
      const d = new Date();
      if (period === "week") d.setDate(d.getDate() - d.getDay());
      if (period === "month") d.setDate(1);
      if (period === "quarter") d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1);
      if (period === "halfYear") d.setMonth(d.getMonth() >= 6 ? 6 : 0, 1);
      if (period === "year") d.setMonth(0, 1);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const stats = {
      today: leads.filter(l => new Date(l.createdAt).toDateString() === now.toDateString()).length,
      week: leads.filter(l => new Date(l.createdAt) >= startOf("week")).length,
      month: leads.filter(l => new Date(l.createdAt) >= startOf("month")).length,
      quarter: leads.filter(l => new Date(l.createdAt) >= startOf("quarter")).length,
      halfYear: leads.filter(l => new Date(l.createdAt) >= startOf("halfYear")).length,
      year: leads.filter(l => new Date(l.createdAt) >= startOf("year")).length,
    };

    setStats(stats);
  };

  const chartData = Object.entries(stats).map(([label, count]) => ({ label, count }));

  const leadTypeData = Object.entries(
    leads.reduce((acc, lead) => {
      acc[lead.leadType] = (acc[lead.leadType] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ name: type, value: count }));

  const technologyData = Object.entries(
    leads.reduce((acc, lead) => {
      acc[lead.technology] = (acc[lead.technology] || 0) + 1;
      return acc;
    }, {})
  ).map(([tech, count]) => ({ name: tech, value: count }));

  const statLabels = {
    today: "Today",
    week: "Week",
    month: "Month",
    quarter: "Quarter",
    halfYear: "HalfYear",
    year: "Year"
  };

  return (
    <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:pl-64" : "lg:pl-20"} pl-0 flex-1 w-full p-4`}>
      <Card className="mx-auto">
        <CardHeader>
          <CardTitle>BD/Sales Lead Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex gap-4 items-end">
            <div>
              <Label htmlFor="salesName">Select Sales User:</Label>
              <Select value={selectedSales} onValueChange={setSelectedSales}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select Sales User" />
                </SelectTrigger>
                <SelectContent>
                  {salesUsers.map((user) => (
                    <SelectItem key={user.id} value={user.userName}>{user.userName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monthFilter">Filter by Month:</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stat Counters */}
          {selectedSales && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="rounded bg-slate-100 p-4 text-center">
                  <p className="text-sm font-medium">{statLabels[key]}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Charts */}
          {selectedSales && (
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div>
                <h4 className="text-lg font-semibold mb-2">Leads Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Lead Types</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={leadTypeData} dataKey="value" nameKey="name" outerRadius={100}>
                      {leadTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Technology</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={technologyData} dataKey="value" nameKey="name" outerRadius={100}>
                      {technologyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Leads Table */}
          {leads.length > 0 && (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Company ID</TableHead>
                    <TableHead>Lead Type</TableHead>
                    <TableHead>Technology</TableHead>
                    <TableHead>No. of Employees</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <React.Fragment key={lead.id}>
                      <TableRow>
                        <TableCell>{lead.companyName}</TableCell>
                        <TableCell>{lead.companyID}</TableCell>
                        <TableCell>{lead.leadType}</TableCell>
                        <TableCell>{lead.technology}</TableCell>
                        <TableCell>{lead.numberOfEmployees}</TableCell>
                        <TableCell>
                          <Button variant="outline" onClick={() => setExpandedLeadId(lead.id === expandedLeadId ? null : lead.id)}>
                            {expandedLeadId === lead.id ? "Hide" : "View More"}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedLeadId === lead.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50">
                            <div className="text-sm">
                              <p><strong>Remarks:</strong> {lead.remarks || "-"}</p>
                              <p><strong>Created At:</strong> {new Date(lead.createdAt).toLocaleString()}</p>
                              <p><strong>Company Size:</strong> {lead.companySize || "-"}</p>
                              <p><strong>Industry:</strong> {lead.industry || "-"}</p>
                              <p><strong>SPOCs:</strong></p>
                              {lead.spocs?.map((spoc, idx) => (
                                <div key={idx} className="ml-4 mt-1">
                                  - {spoc.name} ({spoc.designation})<br />
                                  <span className="text-xs text-gray-600">{spoc.email} | {spoc.contact}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}