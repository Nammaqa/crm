"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const defaultForm = {
  deviceType: "LAPTOP",
  employeeId: "",
  employeeName: "",
  employeeStatus: "",
  projectWorking: "",
  slNo: "",
  modelName: "",
  deviceId: "",
  deviceStatus: "",
  assignedDate: "",
  processor: "",
  ram: "",
  storage: "",
  osVersion: "",
  accessories: "",
  warrantyExpiry: "",
  color: "",
  config: "",
  imeiNumber: "",
  phoneNumber: "",
  simCardNumber: "",
  carrier: "",
  mdmEnrolled: "No",
  remarks: ""
};



export default function DeviceInventoryPage() {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ ...defaultForm });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch("/api/devices");
        if (!res.ok) throw new Error("Failed to load devices");
        const data = await res.json();
        setDevices(data);
      } catch (err) {
        alert("❌ " + err.message);
      }
    };

    fetchDevices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      slNo: form.slNo,
      assignedDate: new Date(form.assignedDate),
      warrantyExpiry: form.warrantyExpiry ? new Date(form.warrantyExpiry) : null,
      mdmEnrolled: form.mdmEnrolled === "Yes"
    };

    try {
      if (editIndex !== null) {
        const id = devices[editIndex].id;
        const res = await fetch(`/api/devices/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Update failed");
        }

        const updated = await res.json();
        const list = [...devices];
        list[editIndex] = updated;
        setDevices(list);
        setEditIndex(null);
      } else {
        const res = await fetch("/api/devices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Add failed");
        }

        const added = await res.json();
        setDevices([...devices, added]);
      }

      setForm({ ...defaultForm });
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  const handleEdit = (index) => {
    const device = devices[index];
    setForm({
      ...device,
      slNo: device.slNo,
      assignedDate: device.assignedDate?.slice(0, 10),
      warrantyExpiry: device.warrantyExpiry?.slice(0, 10),
      mdmEnrolled: device.mdmEnrolled ? "Yes" : "No"
    });
    setEditIndex(index);
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this device?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDevices(devices.filter((d) => d.id !== id));
    } else {
      alert("❌ Failed to delete device");
    }
  };

  const isLaptop = form.deviceType === "LAPTOP";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Device Inventory Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label>Device Type</Label>
          <select
            name="deviceType"
            value={form.deviceType}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="LAPTOP">Laptop</option>
            <option value="MOBILE">Mobile</option>
          </select>
        </div>

        {[
          "employeeId",
          "employeeName",
          "employeeStatus",
          "projectWorking",
          "slNo",
          "modelName",
          "deviceId",
          "deviceStatus",
          "assignedDate"
        ].map((key) => (
          <div key={key}>
            <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
            {key === "assignedDate" ? (
              <Input type="date" name={key} value={form[key]} onChange={handleChange} />
            ) : (
              <Input name={key} value={form[key]} onChange={handleChange} />
            )}
          </div>
        ))}

        {isLaptop ? (
          <>
            <div><Label>Processor</Label><Input name="processor" value={form.processor} onChange={handleChange} /></div>
            <div><Label>RAM</Label><Input name="ram" value={form.ram} onChange={handleChange} /></div>
            <div><Label>Storage</Label><Input name="storage" value={form.storage} onChange={handleChange} /></div>
            <div><Label>OS Version</Label><Input name="osVersion" value={form.osVersion} onChange={handleChange} /></div>
            <div><Label>Accessories</Label><Input name="accessories" value={form.accessories} onChange={handleChange} /></div>
            <div><Label>Warranty Expiry</Label><Input type="date" name="warrantyExpiry" value={form.warrantyExpiry} onChange={handleChange} /></div>
          </>
        ) : (
          <>
            <div><Label>Color</Label><Input name="color" value={form.color} onChange={handleChange} /></div>
            <div><Label>Config (RAM/Storage)</Label><Input name="config" value={form.config} onChange={handleChange} /></div>
            <div><Label>IMEI Number</Label><Input name="imeiNumber" value={form.imeiNumber} onChange={handleChange} /></div>
            <div><Label>Phone Number</Label><Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} /></div>
            <div><Label>SIM Card Number</Label><Input name="simCardNumber" value={form.simCardNumber} onChange={handleChange} /></div>
            <div><Label>Carrier</Label><Input name="carrier" value={form.carrier} onChange={handleChange} /></div>
            <div>
              <Label>MDM Enrolled</Label>
              <select name="mdmEnrolled" value={form.mdmEnrolled} onChange={handleChange} className="border rounded px-2 py-1 w-full">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </>
        )}

        <div className="md:col-span-3">
          <Label>Remarks</Label>
          <Input name="remarks" value={form.remarks} onChange={handleChange} />
        </div>
      </div>

      <Button onClick={handleSubmit} className="mb-6">
        {editIndex !== null ? "Update Device" : "Add Device"}
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sl No</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((d, i) => (
            <TableRow key={i}>
              <TableCell>{d.slNo}</TableCell>
              <TableCell>{d.deviceType}</TableCell>
              <TableCell>{d.employeeName} ({d.employeeId})</TableCell>
              <TableCell>{d.modelName}</TableCell>
              <TableCell>{d.deviceStatus}</TableCell>
              <TableCell>{new Date(d.assignedDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button size="sm" onClick={() => handleEdit(i)} className="mr-2">Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(d.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
