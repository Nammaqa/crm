// app/components/BdSales.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899"];

type Lead = {
  id: string;
  companyName: string;
  companyID: string;
  leadType: string;
  technology: string;
  numberOfEmployees?: number;
  createdAt: string;
  remarks?: string;
  companySize?: string;
  industry?: string;
  spocs?: {
    name: string;
    designation?: string;
    email?: string;
    contact?: string;
  }[];
};

type Stats = {
  today: number;
  week: number;
  month: number;
  quarter: number;
  halfYear: number;
  year: number;
};

const statLabels: Record<keyof Stats, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  quarter: "Quarter",
  halfYear: "Half Year",
  year: "This Year",
};

export default function BdSales({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  const [salesUsers, setSalesUsers] = useState<{ id: string; userName: string }[]>([]);
  const [selectedSales, setSelectedSales] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    today: 0,
    week: 0,
    month: 0,
    quarter: 0,
    halfYear: 0,
    year: 0,
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASEAPIURL;

  useEffect(() => {
    const fetchSalesUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const res = await fetch(`${BASE_URL}/api/users?role=SALES`);
        const data = await res.json();
        setSalesUsers(data ?? []);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setSalesUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (BASE_URL) fetchSalesUsers();
  }, [BASE_URL]);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!selectedSales || !BASE_URL) return;
      try {
        setIsLoadingLeads(true);
        const res = await fetch(
          `${BASE_URL}/api/admin/lead?salesName=${encodeURIComponent(selectedSales)}`
        );
        const data: Lead[] = await res.json();
        let filtered = data ?? [];

        if (selectedMonth !== "all") {
          filtered = filtered.filter(
            (lead) => new Date(lead.createdAt).getMonth() + 1 === Number(selectedMonth)
          );
        }

        setLeads(filtered);
        calculateStats(filtered);
      } catch (err) {
        console.error("Failed to fetch leads", err);
        setLeads([]);
        calculateStats([]);
      } finally {
        setIsLoadingLeads(false);
      }
    };

    fetchLeads();
  }, [selectedSales, selectedMonth, BASE_URL]);

  const calculateStats = (leadList: Lead[]) => {
    const now = new Date();

    const startOf = (period: keyof Omit<Stats, "today">) => {
      const d = new Date();
      if (period === "week") d.setDate(d.getDate() - d.getDay());
      if (period === "month") d.setDate(1);
      if (period === "quarter") d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1);
      if (period === "halfYear") d.setMonth(d.getMonth() >= 6 ? 6 : 0, 1);
      if (period === "year") d.setMonth(0, 1);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const nextStats: Stats = {
      today: leadList.filter(
        (l) => new Date(l.createdAt).toDateString() === now.toDateString()
      ).length,
      week: leadList.filter((l) => new Date(l.createdAt) >= startOf("week")).length,
      month: leadList.filter((l) => new Date(l.createdAt) >= startOf("month")).length,
      quarter: leadList.filter((l) => new Date(l.createdAt) >= startOf("quarter")).length,
      halfYear: leadList.filter(
        (l) => new Date(l.createdAt) >= startOf("halfYear")
      ).length,
      year: leadList.filter((l) => new Date(l.createdAt) >= startOf("year")).length,
    };

    setStats(nextStats);
  };

  const chartData = useMemo(
    () =>
      Object.entries(stats).map(([label, count]) => ({
        label,
        count,
      })),
    [stats]
  );

  const leadTypeData = useMemo(
    () =>
      Object.entries(
        leads.reduce<Record<string, number>>((acc, lead) => {
          acc[lead.leadType || "Unknown"] = (acc[lead.leadType || "Unknown"] || 0) + 1;
          return acc;
        }, {})
      ).map(([type, value]) => ({ name: type, value })),
    [leads]
  );

  const technologyData = useMemo(
    () =>
      Object.entries(
        leads.reduce<Record<string, number>>((acc, lead) => {
          acc[lead.technology || "Unknown"] =
            (acc[lead.technology || "Unknown"] || 0) + 1;
          return acc;
        }, {})
      ).map(([tech, value]) => ({ name: tech, value })),
    [leads]
  );

  const hasData = leads.length > 0;

  return (
    <div
      className={cn(
        "transition-all duration-300 flex-1 w-full px-4 py-4 md:px-6 lg:px-8",
        isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
      )}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top bar + filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              BD / Sales Overview
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track leads performance by sales user, time range, and lead attributes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Sales user
              </Label>
              <Select
                value={selectedSales}
                onValueChange={(value) => {
                  setSelectedSales(value);
                  setExpandedLeadId(null);
                }}
              >
                <SelectTrigger className="w-48 md:w-60">
                  <SelectValue
                    placeholder={isLoadingUsers ? "Loading users..." : "Select Sales User"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {salesUsers.map((user) => (
                    <SelectItem key={user.id} value={user.userName}>
                      {user.userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Month
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats row */}
        {selectedSales && (
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {Object.entries(stats).map(([key, value]) => (
              <Card
                key={key}
                className="border-none bg-gradient-to-b from-slate-950/5 to-slate-950/0 shadow-sm"
              >
                <CardContent className="px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {statLabels[key as keyof Stats]}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts */}
        {selectedSales && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="border-none bg-card/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Leads by time window
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-0">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tickFormatter={(v) => statLabels[v as keyof Stats] ?? v}
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                      />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} />
                      <Tooltip
                        cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}
                        formatter={(value: number) => [`${value} leads`, "Count"]}
                      />
                      <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        fill="hsl(var(--primary))"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState />
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-card/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lead types</CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-0">
                {leadTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadTypeData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={3}
                      >
                        {leadTypeData.map((entry, index) => (
                          <Cell
                            key={`type-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        verticalAlign="bottom"
                        height={32}
                        iconType="circle"
                        formatter={(value: string) => (
                          <span className="text-xs text-muted-foreground">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState />
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-card/80 backdrop-blur md:col-span-2 xl:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Technologies</CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-0">
                {technologyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={technologyData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={3}
                      >
                        {technologyData.map((entry, index) => (
                          <Cell
                            key={`tech-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        verticalAlign="bottom"
                        height={32}
                        iconType="circle"
                        formatter={(value: string) => (
                          <span className="text-xs text-muted-foreground">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Table */}
        <Card className="border-none bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Leads list
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {isLoadingLeads
                  ? "Loading leads..."
                  : hasData
                  ? `${leads.length} leads found`
                  : selectedSales
                  ? "No leads for this selection yet."
                  : "Select a sales user to view leads."}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {hasData ? (
              <div className="relative">
                <div className="max-h-[420px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                      <TableRow className="border-b border-border/60">
                        <TableHead className="min-w-[180px]">Company</TableHead>
                        <TableHead>Company ID</TableHead>
                        <TableHead>Lead type</TableHead>
                        <TableHead>Technology</TableHead>
                        <TableHead className="text-right">
                          No. of employees
                        </TableHead>
                        <TableHead className="w-24 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => {
                        const isExpanded = expandedLeadId === lead.id;
                        return (
                          <React.Fragment key={lead.id}>
                            <TableRow className="border-b border-border/40">
                              <TableCell className="font-medium">
                                {lead.companyName}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {lead.companyID || "-"}
                              </TableCell>
                              <TableCell>{lead.leadType || "-"}</TableCell>
                              <TableCell>{lead.technology || "-"}</TableCell>
                              <TableCell className="text-right">
                                {lead.numberOfEmployees ?? "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant={isExpanded ? "secondary" : "outline"}
                                  onClick={() =>
                                    setExpandedLeadId(isExpanded ? null : lead.id)
                                  }
                                >
                                  {isExpanded ? "Hide" : "View"}
                                </Button>
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow className="bg-muted/40">
                                <TableCell colSpan={6} className="align-top">
                                  <div className="grid gap-3 text-xs md:grid-cols-3">
                                    <div className="space-y-1">
                                      <p className="font-semibold text-muted-foreground">
                                        Details
                                      </p>
                                      <p>
                                        <span className="font-medium">Industry:</span>{" "}
                                        {lead.industry || "-"}
                                      </p>
                                      <p>
                                        <span className="font-medium">Company size:</span>{" "}
                                        {lead.companySize || "-"}
                                      </p>
                                      <p>
                                        <span className="font-medium">Created at:</span>{" "}
                                        {new Date(lead.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                      <p className="font-semibold text-muted-foreground">
                                        SPOCs
                                      </p>
                                      {lead.spocs && lead.spocs.length > 0 ? (
                                        <div className="space-y-1.5">
                                          {lead.spocs.map((spoc, idx) => (
                                            <div
                                              key={idx}
                                              className="rounded-md border border-border/60 bg-background/80 px-3 py-2"
                                            >
                                              <p className="text-sm font-medium">
                                                {spoc.name}{" "}
                                                {spoc.designation && (
                                                  <span className="text-xs text-muted-foreground">
                                                    · {spoc.designation}
                                                  </span>
                                                )}
                                              </p>
                                              <p className="mt-0.5 text-xs text-muted-foreground">
                                                {spoc.email && <span>{spoc.email}</span>}
                                                {spoc.email && spoc.contact && " · "}
                                                {spoc.contact && <span>{spoc.contact}</span>}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground">No SPOCs added.</p>
                                      )}
                                      <div className="mt-3 space-y-1">
                                        <p className="font-semibold text-muted-foreground">
                                          Remarks
                                        </p>
                                        <p className="text-muted-foreground">
                                          {lead.remarks || "No remarks yet."}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
      <span className="rounded-full bg-muted px-2 py-1 text-[10px] uppercase tracking-wide">
        No data
      </span>
      <p>Adjust filters or add leads to see insights.</p>
    </div>
  );
}
