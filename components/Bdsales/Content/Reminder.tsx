"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    clientId: initialData?.clientId || "",
    companyName: initialData?.companyName || "",
    contactName: initialData?.contactName || "",
    phoneNumber: initialData?.phoneNumber || "",
    followUpDate: initialData?.followUpDateTime
      ? new Date(initialData.followUpDateTime).toLocaleDateString("en-CA") // format YYYY-MM-DD
      : "",
    // Default follow-up time to 09:30
    followUpTime: "09:30",
    notes: initialData?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;
      const res = await fetch(`${baseUrl}/api/lead`);
      if (res.ok) {
        const data = await res.json();
        const clientsWithSpocs = data.map((lead: any) => ({
          id: lead.id,
          companyName: lead.companyName,
          spocs: lead.spocs || [],
        }));
        setClients(clientsWithSpocs);

        if (initialData?.clientId) {
          const client = clientsWithSpocs.find(
            (c: Client) => c.id === initialData.clientId
          );
          if (client) {
            setSelectedClient(client);
          }
        }
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

      // Get the logged-in user's email
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

      // Create date in local timezone (IST)
      const followUpDateTime = new Date(`${formData.followUpDate}T${formData.followUpTime}`);

      const reminderRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          followUpDateTime: followUpDateTime.toISOString(), // This preserves the correct IST time by converting to UTC
          creatorEmail,
        }),
      });

      if (reminderRes.ok) {
        await fetch(`${baseUrl}/api/schedule-reminder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: formData.companyName,
            contactName: formData.contactName,
            followUpDate: followUpDateTime.toLocaleDateString("en-CA"),
            followUpTime: formData.followUpTime, // Keep default "09:30"
            notes: formData.notes,
            phoneNumber: formData.phoneNumber,
            creatorEmail,
          }),
        });

        setSuccess(true);
        // Clear the form after success
        setFormData({
          clientId: "",
          companyName: "",
          contactName: "",
          phoneNumber: "",
          followUpDate: "",
          followUpTime: "09:30", // Default follow-up time
          notes: "",
        });
        setSelectedClient(null); // Clear selected client
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error saving reminder:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select value={formData.clientId.toString()} onValueChange={handleClientChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select Client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id.toString()}>
              {client.companyName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedClient?.spocs && selectedClient.spocs.length > 0 && (
        <Select
          value={formData.contactName}
          onValueChange={(name) => {
            const spoc = selectedClient.spocs?.find((s) => s.name === name);
            setFormData((prev) => ({
              ...prev,
              contactName: name,
              phoneNumber: spoc?.contact || "",
            }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Contact Person" />
          </SelectTrigger>
          <SelectContent>
            {selectedClient.spocs.map((spoc) => (
              <SelectItem key={spoc.id} value={spoc.name}>
                {spoc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Input
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        readOnly
      />

      <Input
        type="date"
        value={formData.followUpDate}
        onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
        min={new Date().toISOString().split("T")[0]}
        className="flex-1"
      />

      <Textarea
        placeholder="Notes (optional)"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />

      <Button
        onClick={handleSubmit}
        disabled={loading || !formData.clientId || !formData.followUpDate}
        className="w-full"
      >
        {loading ? "Saving..." : initialData ? "Update Reminder" : "Save Reminder"}
      </Button>

      {success && !onSuccess && (
        <p className="text-green-600 text-center">
          Reminder {initialData ? "updated" : "added"} successfully!
        </p>
      )}
    </div>
  );
}
