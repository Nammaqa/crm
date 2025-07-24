'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddReminderForm from './Reminder';
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
import { format } from 'date-fns';
import { CalendarIcon, TrashIcon } from '@radix-ui/react-icons';

export default function ReminderDashboard() {
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;
      const res = await fetch(`${baseUrl}/api/reminders`);
      const data = await res.json();
      setReminders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;
      const res = await fetch(`${baseUrl}/api/reminders/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchReminders();
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const sortedReminders = reminders.sort((a, b) => 
    new Date(a.followUpDateTime) - new Date(b.followUpDateTime)
  );

  const now = new Date();
  const pastReminders = sortedReminders.filter(r => new Date(r.followUpDateTime) < now);
  const upcomingReminders = sortedReminders.filter(r => new Date(r.followUpDateTime) >= now);

  const ReminderTable = ({ reminders, showActions }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Contact Name</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Notes</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {reminders.map((reminder) => (
          <TableRow key={reminder.id}>
            <TableCell>{reminder.companyName}</TableCell>
            <TableCell>{reminder.lead?.spocs?.[0]?.name || 'N/A'}</TableCell>
            <TableCell>
              {format(new Date(reminder.followUpDateTime), 'MMM dd, yyyy HH:mm')}
            </TableCell>
            <TableCell>{reminder.phoneNumber || 'N/A'}</TableCell>
            <TableCell>{reminder.notes || 'N/A'}</TableCell>
            {showActions && (
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingReminder(reminder)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(reminder.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return <div>Loading reminders...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Reminder</DialogTitle>
            </DialogHeader>
            <AddReminderForm
              onSuccess={() => {
                setShowAddForm(false);
                fetchReminders();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
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
                fetchReminders();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-blue-600">
            Upcoming Reminders ({upcomingReminders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingReminders.length > 0 ? (
            <ReminderTable reminders={upcomingReminders} showActions={true} />
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming reminders</p>
          )}
        </CardContent>
      </Card>

      {/* Past Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-600">
            Past Reminders ({pastReminders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastReminders.length > 0 ? (
            <ReminderTable reminders={pastReminders} showActions={false} />
          ) : (
            <p className="text-gray-500 text-center py-4">No past reminders</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
