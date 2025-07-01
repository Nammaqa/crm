
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DeviceInventoryPage() {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    employeeName: "",
    employeeStatus: "",
    project: "",
    serialNo: "",
    modelName: "",
    deviceId: "",
    deviceStatus: "",
    assignedDate: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setDevices([...devices, { ...form, id: devices.length + 1 }]);
    setForm({
      employeeId: "",
      employeeName: "",
      employeeStatus: "",
      project: "",
      serialNo: "",
      modelName: "",
      deviceId: "",
      deviceStatus: "",
      assignedDate: ""
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Device Assignment Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {Object.entries(form).map(([key, value]) => (
          <div key={key}>
            <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
            <Input name={key} value={value} onChange={handleChange} />
          </div>
        ))}
      </div>

      <Button onClick={handleAdd} className="mb-6">Add Device</Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sl No</TableHead>
            <TableHead>Employee Id</TableHead>
            <TableHead>Employee Name</TableHead>
            <TableHead>Employee Status</TableHead>
            <TableHead>Project Working</TableHead>
            <TableHead>Serial No.</TableHead>
            <TableHead>Model Name</TableHead>
            <TableHead>Device ID</TableHead>
            <TableHead>Device Status</TableHead>
            <TableHead>Assigned Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{device.employeeId}</TableCell>
              <TableCell>{device.employeeName}</TableCell>
              <TableCell>{device.employeeStatus}</TableCell>
              <TableCell>{device.project}</TableCell>
              <TableCell>{device.serialNo}</TableCell>
              <TableCell>{device.modelName}</TableCell>
              <TableCell>{device.deviceId}</TableCell>
              <TableCell>{device.deviceStatus}</TableCell>
              <TableCell>{device.assignedDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
