"use client";
import React, { useState, useRef } from "react";

export default function SOPForm() {
  const [formData, setFormData] = useState({
    clientName: "",
    employeeName: "",
    employeeId: "",
    startDate: "",
    endDate: "",
  });

  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Restrict input to letters and spaces only
  const handleAlphaInput = (e) => {
    if (e.nativeEvent && e.nativeEvent.data && !/[A-Za-z\s]/.test(e.nativeEvent.data)) {
      e.preventDefault();
    }
  };

  // Restrict input to alphanumeric, hyphen, and underscore only (no spaces or other special chars)
  const handleAlphaNumHyphenUnderscoreInput = (e) => {
    if (
      e.nativeEvent &&
      e.nativeEvent.data &&
      !/[A-Za-z0-9_-]/.test(e.nativeEvent.data)
    ) {
      e.preventDefault();
    }
  };

  // On blur, validate date format for both startDate and endDate
  const handleDateBlur = (e) => {
    const { name, value } = e.target;
    if (
      (name === "startDate" || name === "endDate") &&
      value &&
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name === "startDate" ? "Start Date" : "End Date"} must be in YYYY-MM-DD format.`,
      }));
    }
  };

  // Validation helper for a single field
  const validateField = (name, value, allValues = formData) => {
    switch (name) {
      case "clientName":
        if (!value.trim()) return "Client Name is required.";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Client Name can only contain letters and spaces.";
        return "";
      case "employeeName":
        if (!value.trim()) return "Employee Name is required.";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Employee Name can only contain letters and spaces.";
        if (value.trim().length < 3) return "Employee Name must be at least 3 characters.";
        if (value.trim().length > 30) return "Employee Name must be at most 30 characters.";
        return "";
      case "employeeId":
        if (!value.trim()) return "Employee ID is required.";
        if (!/^[A-Za-z0-9_-]+$/.test(value))
          return "Employee ID can only contain letters, numbers, hyphens (-), and underscores (_).";
        return "";
      case "startDate":
        if (!value) return "Start Date is required.";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Start Date must be in YYYY-MM-DD format.";
        if (allValues.endDate && value > allValues.endDate) return "Start Date cannot be after End Date.";
        return "";
      case "endDate":
        if (!value) return "End Date is required.";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "End Date must be in YYYY-MM-DD format.";
        if (allValues.startDate && value < allValues.startDate) return "End Date cannot be before Start Date.";
        return "";
      default:
        return "";
    }
  };

  // Validate all fields at once (for submit)
  const validateAll = (values = formData) => {
    const newErrors = {};
    Object.keys(values).forEach((key) => {
      const err = validateField(key, values[key], values);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // File validation on change
  const handleFileChange = (e) => {
    setFileError("");
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setFileError("Only PDF files are allowed.");
        setSelectedFile(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFileError("PDF file must be 2MB or less.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
    // If user cancels, do NOT clear selectedFile (keep previous)
    // So, do nothing if !file
  };

  // Remove the selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChooseFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Live validation on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    // Validate this field and update errors
    const errMsg = validateField(name, value, updatedForm);
    setErrors((prev) => ({
      ...prev,
      [name]: errMsg || undefined,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    if (!validateAll()) {
      setLoading(false);
      return;
    }

    // Validate file
    setFileError("");
    if (!selectedFile) {
      setFileError("PDF file is required.");
      setLoading(false);
      return;
    }
    if (selectedFile.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      setLoading(false);
      return;
    }
    if (selectedFile.size > 2 * 1024 * 1024) {
      setFileError("PDF file must be 2MB or less.");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("clientName", formData.clientName);
    formDataToSend.append("employeeName", formData.employeeName);
    formDataToSend.append("employeeId", formData.employeeId);
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.endDate);
    formDataToSend.append("type", "PO"); // SOP handled as PO

    if (selectedFile) {
      formDataToSend.append("fileUpload", selectedFile);
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/agreements", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        setLoading(false); // Stop spinner BEFORE alert
        alert("SOP (PO) submitted successfully!");

        // Clear form fields and file input after successful submission
        setFormData({
          clientName: "",
          employeeName: "",
          employeeId: "",
          startDate: "",
          endDate: "",
        });
        setErrors({});
        setSelectedFile(null);
        setFileError("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      } else {
        setLoading(false); // Stop spinner BEFORE alert
        alert(data.message || "Submission failed.");
        return;
      }
    } catch (error) {
      console.error("Error submitting SOP:", error);
      setLoading(false); // Stop spinner BEFORE alert
      alert("An error occurred while submitting the SOP form.");
      return;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto space-y-4 p-4 border rounded-lg shadow"
      noValidate
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">SOP (PO) Agreement</h2>
      <fieldset disabled={loading} className="space-y-4">
        {/* Client Name */}
        <label className="block font-medium mb-1" htmlFor="clientName">
          Client Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          onBeforeInput={handleAlphaInput}
          required
          className={`w-full p-2 border border-gray-400 rounded ${errors.clientName ? "border-red-500" : ""}`}
          placeholder="Enter client name"
          aria-invalid={!!errors.clientName}
          aria-describedby="clientName-error"
        />
        {errors.clientName && (
          <p id="clientName-error" className="text-red-600 text-xs mt-1 mb-3">{errors.clientName}</p>
        )}

        {/* Employee Name */}
        <label className="block font-medium mb-1" htmlFor="employeeName">
          Employee Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="employeeName"
          value={formData.employeeName}
          onChange={handleChange}
          onBeforeInput={handleAlphaInput}
          required
          minLength={3}
          maxLength={30}
          className={`w-full p-2 border border-gray-400 rounded ${errors.employeeName ? "border-red-500" : ""}`}
          placeholder="Enter employee name"
          aria-invalid={!!errors.employeeName}
          aria-describedby="employeeName-error"
        />
        {errors.employeeName && (
          <p id="employeeName-error" className="text-red-600 text-xs mt-1 mb-3">{errors.employeeName}</p>
        )}

        {/* Employee ID */}
        <label className="block font-medium mb-1" htmlFor="employeeId">
          Employee ID <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          onBeforeInput={handleAlphaNumHyphenUnderscoreInput}
          required
          className={`w-full p-2 border border-gray-400 rounded ${errors.employeeId ? "border-red-500" : ""}`}
          placeholder="Enter employee ID"
          aria-invalid={!!errors.employeeId}
          aria-describedby="employeeId-error"
        />
        {errors.employeeId && (
          <p id="employeeId-error" className="text-red-600 text-xs mt-1 mb-3">{errors.employeeId}</p>
        )}

        {/* Start Date */}
        <label className="block font-medium mb-1" htmlFor="startDate">
          Start Date <span className="text-red-600">*</span>
        </label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          onBlur={handleDateBlur}
          required
          className={`w-full p-2 border border-gray-400 rounded ${errors.startDate ? "border-red-500" : ""}`}
          aria-invalid={!!errors.startDate}
          aria-describedby="startDate-error"
        />
        {errors.startDate && (
          <p id="startDate-error" className="text-red-600 text-xs mt-1 mb-3">{errors.startDate}</p>
        )}

        {/* End Date */}
        <label className="block font-medium mb-1" htmlFor="endDate">
          End Date <span className="text-red-600">*</span>
        </label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          onBlur={handleDateBlur}
          required
          className={`w-full p-2 border border-gray-400 rounded ${errors.endDate ? "border-red-500" : ""}`}
          aria-invalid={!!errors.endDate}
          aria-describedby="endDate-error"
        />
        {errors.endDate && (
          <p id="endDate-error" className="text-red-600 text-xs mt-1 mb-3">{errors.endDate}</p>
        )}

        {/* File Upload */}
        <label className="block font-medium mb-1" htmlFor="fileUpload">
          Upload PDF File <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="fileUpload"
            name="fileUpload"
            ref={fileInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleChooseFile}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 border border-gray-400 text-gray-800"
          >
            {selectedFile ? "Change File" : "Choose File"}
          </button>
          {selectedFile && (
            <span className="flex items-center gap-1">
              <span className="text-sm text-gray-700">{selectedFile.name}</span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-1 text-red-500 hover:text-red-700"
                aria-label="Remove file"
              >
                {/* Inline SVG for X icon */}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fff"/>
                  <path stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
                </svg>
              </button>
            </span>
          )}
        </div>
        {fileError && (
          <p className="text-red-600 text-xs mt-1 mb-3">{fileError}</p>
        )}

        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </fieldset>
    </form>
  );
}