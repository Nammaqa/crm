"use client";
import React, { useState, useRef } from "react";

export default function Msa() {
  const [formData, setFormData] = useState({
    clientName: "",
    startDate: "",
    endDate: "",
  });

  const fileInputRef = useRef(null); // For file input reference

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object to handle file uploads
    const formDataToSend = new FormData();
    formDataToSend.append("clientName", formData.clientName);
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.endDate);

    // Append file only if it's selected
    if (fileInputRef.current.files[0]) {
      formDataToSend.append("fileUpload", fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch("http://localhost:8082/api/msa/create", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      alert(data.message); // Show success message
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting the form!");
    }
  };

  return (
    <form id="msaForm" onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 p-4 border rounded-lg shadow">
      <div className="text-2xl  text-gray-800   ">
        MSA Details
      </div>
      <label htmlFor="clientName" className="block font-medium">Client Name</label>
      <input
        type="text"
        id="clientName"
        name="clientName"
        placeholder="Enter client name"
        required
        value={formData.clientName}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <label htmlFor="startDate" className="block font-medium">Start Date</label>
      <input
        type="date"
        id="startDate"
        name="startDate"
        required
        value={formData.startDate}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <label htmlFor="endDate" className="block font-medium">End Date</label>
      <input
        type="date"
        id="endDate"
        name="endDate"
        required
        value={formData.endDate}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <label htmlFor="fileUpload" className="block font-medium">Upload File</label>
      <input
        type="file"
        id="fileUpload"
        name="fileUpload"
        ref={fileInputRef}
        className="w-full p-2 border rounded"
      />

      <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Submit
      </button>
    </form>
  );
}
