"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoCircledIcon, PersonIcon, ReaderIcon } from "@radix-ui/react-icons";

interface Spoc {
  id: number;
  name: string;
  contact: string;
}

interface Client {
  id: number;
  companyName: string;
  spocs?: Spoc[];
}

interface ReminderFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export default function AddReminderForm({
  initialData,
  onSuccess,
}: ReminderFormProps) {
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    clientId: initialData?.clientId || "",
    companyName: initialData?.companyName || "",
    contactName: initialData?.contactName || "",
    phoneNumber: initialData?.phoneNumber || "",
    followUpDate: initialData?.followUpDateTime
      ? new Date(initialData.followUpDateTime).toLocaleDateString("en-CA")
      : "",
    followUpTime: initialData?.followUpDateTime
      ? new Date(initialData.followUpDateTime)
          .toTimeString()
          .slice(0, 5) // HH:mm
      : "09:30",
    notes: initialData?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchUser();                                               // NEW
  }, []);

  useEffect(() => {
    if (user) fetchClients(user);                              // CHANGED
  }, [user]);

  const fetchUser = async () => {                              // NEW
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;
      const res = await fetch(`${baseUrl}/api/users/me`, { method: "GET", credentials: "include" });
      const data = await res.json();
      if (res.ok) setUser(data?.data || data);
    } catch (e) {
      console.error("Error fetching user:", e);
    }
  };

  const fetchClients = async (currentUser: any) => {           // CHANGED: takes user
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;
      const res = await fetch(`${baseUrl}/api/lead`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();

      // Allowed lead statuses
      const allowed = new Set(["prospective", "newlead"]);

      // Normalize names for safe compare
      const uName = String(currentUser?.userName || "").trim().toLowerCase();
      const uEmail = String(currentUser?.wbEmailId || currentUser?.email || "").trim().toLowerCase();

      // Keep only leads that belong to this user
      const mine = (Array.isArray(data) ? data : []).filter((lead: any) => {
        const statusOk = allowed.has(String(lead?.status || "").toLowerCase());
        const byName   = String(lead?.salesName || "").trim().toLowerCase() === uName;
        const byEmail  = String(lead?.ownerEmail || lead?.creatorEmail || "")
                           .trim().toLowerCase() === uEmail; // optional fallback
        return statusOk && (byName || byEmail);
      });

      const clientsWithSpocs: Client[] = mine.map((lead: any) => ({
        id: lead.id,
        companyName: lead.companyName,
        spocs: lead.spocs || [],
      }));

      setClients(clientsWithSpocs);

      if (initialData?.clientId) {
        const client = clientsWithSpocs.find((c: Client) => c.id === initialData.clientId);
        if (client) setSelectedClient(client);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id.toString() === clientId);
    if (client) {
      setSelectedClient(client);
      const primarySpoc = client.spocs?.[0];
      setFormData((prev) => ({
        ...prev,
        clientId,
        companyName: client.companyName,
        contactName: primarySpoc?.name || "",
        phoneNumber: primarySpoc?.contact || "",
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;

      // Logged-in user
      const userRes = await fetch(`${baseUrl}/api/users/me`, {
        method: "GET",
        credentials: "include",
      });
      const userData = await userRes.json();
      if (!userRes.ok) {
        toast.error("Please log in to create reminders");
        return;
      }

      const creatorEmail = userData?.data?.wbEmailId || userData?.wbEmailId;
      if (!creatorEmail) {
        toast.error("User email not found. Please update your profile.");
        return;
      }

      const method = initialData ? "PATCH" : "POST";
      const url = initialData
        ? `${baseUrl}/api/reminders/${initialData.id}`
        : `${baseUrl}/api/reminders`;

      // Build local datetime and send as UTC ISO
      const followUpDateTime = new Date(
        `${formData.followUpDate}T${formData.followUpTime}`
      );

      const reminderRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          followUpDateTime: followUpDateTime.toISOString(),
          creatorEmail,
        }),
      });

      if (!reminderRes.ok) {
        const err = await reminderRes.json().catch(() => ({}));
        toast.error(err?.message || "Failed to save reminder");
        return;
      }

      // (Optional) schedule email
      fetch(`${baseUrl}/api/schedule-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: formData.companyName,
          contactName: formData.contactName,
          followUpDate: formData.followUpDate,
          followUpTime: formData.followUpTime,
          notes: formData.notes,
          phoneNumber: formData.phoneNumber,
          creatorEmail,
        }),
      }).catch(() => {});

      setSuccess(true);
      toast.success(initialData ? "Reminder updated!" : "Reminder saved!");

      // Reset
      setFormData({
        clientId: "",
        companyName: "",
        contactName: "",
        phoneNumber: "",
        followUpDate: "",
        followUpTime: "09:30",
        notes: "",
      });
      setSelectedClient(null);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving reminder:", error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <Card className="border rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ReaderIcon className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-2xl">Add / Update Follow-up</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a client, pick a date & time, and jot any quick notes.
          </p>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {/* Client */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <Select
              value={formData.clientId?.toString() || ""}
              onValueChange={handleClientChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Client (Prospective / Qualified only)" />
              </SelectTrigger>
              <SelectContent>
                {clients.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No eligible clients found
                  </div>
                )}
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact helper */}
          {selectedClient && (
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 text-blue-900 px-3 py-2 border border-blue-100">
              <PersonIcon className="mt-0.5 h-4 w-4" />
              <div className="text-sm">
                <span className="font-medium">Contact:&nbsp;</span>
                {formData.contactName || "N/A"}
                {formData.phoneNumber ? (
                  <span className="text-blue-800"> • {formData.phoneNumber}</span>
                ) : null}
              </div>
            </div>
          )}

          {/* Phone (read-only from SPOC) */}
          {/* <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              readOnly
            />
          </div> */}

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.followUpDate}
                onChange={(e) =>
                  setFormData({ ...formData, followUpDate: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={formData.followUpTime}
                onChange={(e) =>
                  setFormData({ ...formData, followUpTime: e.target.value })
                }
              />
            </div> */}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div className="rounded-md bg-gray-50 text-gray-600 text-xs px-3 py-2 flex items-start gap-2">
            <InfoCircledIcon className="mt-0.5 h-3.5 w-3.5" />
            <span>
              We’ll save your reminder and (optionally) email a follow-up at the
              chosen time.
            </span>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.clientId || !formData.followUpDate}
            className="w-full h-10"
          >
            {loading ? "Saving..." : initialData ? "Update Reminder" : "Save Reminder"}
          </Button>

          {success && !onSuccess && (
            <p className="text-green-600 text-center">
              Reminder {initialData ? "updated" : "added"} successfully!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
