"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, TrashIcon } from "@radix-ui/react-icons";
import { FaPen } from "react-icons/fa";
import { format } from 'date-fns';
import AddReminderForm from './Reminder';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function Overview() {
  // Store full user object
  const [user, setUser] = useState<{ userName?: string; wbEmailId?: string } | null>(null);
  const [stats, setStats] = useState({
    prospective: 0,
    newlead: 0,
    existing: 0,
    deal: 0,
    total: 0
  });
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  // Fetch user info
  const fetchUser = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;
      const res = await fetch(`${baseUrl}/api/users/me`, { 
        method: "GET",
        credentials: "include"
      });

      const data = await res.json();
      if (res.ok && data?.data) {
        setUser(data.data);
      } else {
        setUser(null);
        console.warn("User fetch failed:", data.message);
      }
    } catch (err) {
      setUser(null);
      console.error("Error fetching user info:", err);
    }
  };

  // Fetch leads only for current user (salesName === userName)
  const fetchLeadStats = async (userName) => {
    if (!userName) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;
      // Fetch all leads, then filter by salesName === userName
      const res = await fetch(`${baseUrl}/api/lead`);
      const data = await res.json();

      if (res.ok) {
        // Filter leads by salesName
        const filteredLeads = data.filter(lead => lead.salesName === userName);

        const leadStats = filteredLeads.reduce((acc, lead) => {
          acc[lead.status] = (acc[lead.status] || 0) + 1;
          acc.total += 1;
          return acc;
        }, { prospective: 0, newlead: 0, existing: 0, deal: 0, total: 0 });

        setStats(leadStats);

        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 5);

        const monthlyData = {};
        for (let d = new Date(sixMonthsAgo); d <= today; d.setMonth(d.getMonth() + 1)) {
          const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
          monthlyData[monthKey] = { month: monthKey, prospective: 0, qualified: 0, deal: 0 };
        }

        filteredLeads.forEach(lead => {
          const leadDate = new Date(lead.createdAt);
          if (leadDate >= sixMonthsAgo) {
            const monthKey = leadDate.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (monthlyData[monthKey]) {
              if (lead.status === 'prospective') monthlyData[monthKey].prospective++;
              if (lead.status === 'newlead') monthlyData[monthKey].qualified++;
              if (lead.status === 'deal') monthlyData[monthKey].deal++;
            }
          }
        });

        setMonthlyStats(Object.values(monthlyData));
      }
    } catch (err) {
      console.error("Error fetching lead stats:", err);
    }
  };

  // Fetch reminders only for current user (salesName === userName)
  const fetchReminders = async (userName) => {
    if (!userName) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;
      const res = await fetch(`${baseUrl}/api/reminders`);
      if (res.ok) {
        const data = await res.json();
        // Filter reminders where salesName === userName
        const filteredReminders = data.filter(reminder => reminder.salesName === userName);
        setReminders(filteredReminders);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;
      const res = await fetch(`${baseUrl}/api/reminders/${id}`, {
        method: 'DELETE',
      });

      if (res.ok && user?.userName) {
        fetchReminders(user.userName);
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  // Fetch user first, then fetch leads/reminders for that user
  useEffect(() => {
    fetchUser();
  }, []);

  // When user is loaded, fetch stats and reminders for that user
  useEffect(() => {
    if (user?.userName) {
      fetchLeadStats(user.userName);
      fetchReminders(user.userName);

      // Refresh stats and reminders every 5 minutes
      const interval = setInterval(() => {
        fetchLeadStats(user.userName);
        fetchReminders(user.userName);
      }, 300000);

      return () => clearInterval(interval);
    }
  }, [user?.userName]);

  const summaryData = [
    { 
      title: "Prospective Leads", 
      value: stats.prospective,
      content: `You have ${stats.prospective} prospective leads to follow up.`
    },
    { 
      title: "New Leads", 
      value: stats.newlead,
      content: `You have ${stats.newlead} new leads in progress.`
    },
    { 
      title: "Deals Closed", 
      value: stats.deal,
      content: `Congratulations! You've closed ${stats.deal} deals.`
    },
  ];

  const pieData = [
    { name: 'Prospective', value: stats.prospective },
    { name: 'New Leads', value: stats.newlead },
    { name: 'Deals', value: stats.deal },
  ];

  const now = new Date();
  const upcomingReminders = reminders
    .filter(r => new Date(r.followUpDateTime) >= now)
    .sort((a, b) => new Date(a.followUpDateTime) - new Date(b.followUpDateTime));

  const pastReminders = reminders
    .filter(r => new Date(r.followUpDateTime) < now)
    .sort((a, b) => new Date(b.followUpDateTime) - new Date(a.followUpDateTime));

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full max-w-6xl bg-white p-6 m-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/Wizzybox Logo.png"
            alt="CRM Logo"
            width={150}
            height={50}
            className="w-auto max-w-full"
          />
          <div className="flex flex-col items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
              {user?.userName
                ? user.userName.charAt(0).toUpperCase() + user.userName.slice(1)
                : "Fetching User..."}
            </h1>
            {user?.wbEmailId && (
              <span className="text-sm text-gray-500">{user.wbEmailId}</span>
            )}
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="text-sm text-gray-600">Total Leads</div>
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className={`bg-gradient-to-r ${
              index === 0 ? 'from-yellow-500 to-yellow-600' :
              index === 1 ? 'from-blue-500 to-blue-600' :
              'from-green-500 to-green-600'
            } text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105`}
          >
            <div className="text-lg font-semibold">{item.title}</div>
            <div className="text-3xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Monthly Trends Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Lead Trends</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="prospective" fill="#f59e0b" name="Prospective" />
                <Bar dataKey="qualified" fill="#3b82f6" name="Qualified" />
                <Bar dataKey="deal" fill="#10b981" name="Deals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lead Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
            <p className="text-base text-gray-600 mt-2">{item.content}</p>
          </div>
        ))}
      </div>

      {/* Reminders Section */}
      <div className="w-full max-w-6xl space-y-6 mt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Follow-up Reminders</h2>
          <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
            <DialogTrigger asChild>
              <Button>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" description="Add a new reminder for follow-up">
              <DialogHeader>
                <DialogTitle>Add New Reminder</DialogTitle>
              </DialogHeader>
              <AddReminderForm
                onSuccess={() => {
                  setShowAddReminder(false);
                  if (user?.userName) fetchReminders(user.userName);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Reminder Dialog */}
        <Dialog 
          open={!!editingReminder} 
          onOpenChange={(open) => !open && setEditingReminder(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Reminder</DialogTitle>
            </DialogHeader>
            {editingReminder && (
              <AddReminderForm
                initialData={editingReminder}
                onSuccess={() => {
                  setEditingReminder(null);
                  if (user?.userName) fetchReminders(user.userName);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Upcoming Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">
              Upcoming Follow-ups ({upcomingReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact Name</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingReminders.slice(0, 5).map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell className="font-medium">{reminder.companyName}</TableCell>
                      <TableCell>{reminder.lead?.spocs?.[0]?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {format(new Date(reminder.followUpDateTime), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{reminder.notes || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingReminder(reminder)}
                          >
                            <FaPen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteReminder(reminder.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming follow-ups</p>
            )}
          </CardContent>
        </Card>

        {/* Past Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-600">
              Recent Follow-ups ({pastReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pastReminders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact Name</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastReminders.slice(0, 5).map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell className="font-medium">{reminder.companyName}</TableCell>
                      <TableCell>{reminder.lead?.spocs?.[0]?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {format(new Date(reminder.followUpDateTime), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{reminder.notes || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-4">No past follow-ups</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}