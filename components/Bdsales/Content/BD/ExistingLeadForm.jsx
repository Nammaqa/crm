"use client";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import SpocFields from "./SpocFields";

/**
 * ExistingLeadForm
 * @param {Object[]} leads - List of all leads
 * @param {Object} formData - Form state
 * @param {Function} setFormData - Setter for form state
 * @param {Function} handleMoveToDeal - Callback for form submit
 * @param {Object} selectedLead - Lead selected from table (for autofill)
 */
export default function ExistingLeadForm({
  leads,
  formData,
  setFormData,
  handleMoveToDeal,
  selectedLead
}) {
  // Always ensure existingLeadDetails is at least an empty object
  const existingLeadDetails = formData.existingLeadDetails || {};
  const [errors, setErrors] = useState({});

  // Autofill form when selectedLead changes
  useEffect(() => {
    if (selectedLead) {
      setFormData((prev) => ({
        ...prev,
        companyID: selectedLead.id ? String(selectedLead.id) : "",
        businessType: selectedLead.businessType || "",
        spocs: selectedLead.spocs || [],
        existingLeadDetails: {
          companySelect: selectedLead.id ? String(selectedLead.id) : "",
          companyNameGST: selectedLead.companyNameGST || "",
          employeeName: selectedLead.employeeName || "",
          replacementReason: selectedLead.replacementReason || "",
          replacementToDate: selectedLead.replacementToDate
            ? selectedLead.replacementToDate.slice(0, 10)
            : "",
          replacementRequestDate: selectedLead.replacementRequestDate
            ? selectedLead.replacementRequestDate.slice(0, 10)
            : ""
        }
      }));
    }
    // eslint-disable-next-line
  }, [selectedLead]);

  const validateFields = () => {
    const newErrors = {};

    if (formData.dealType === "replacement") {
      if (!existingLeadDetails.employeeName)
        newErrors.employeeName = "Employee Name is required";
      if (!existingLeadDetails.companySelect)
        newErrors.companySelect = "Select a company";
      if (!existingLeadDetails.replacementReason)
        newErrors.replacementReason = "Replacement reason is required";
      if (!existingLeadDetails.replacementToDate)
        newErrors.replacementToDate = "Replacement To Date is required";
      if (!existingLeadDetails.replacementRequestDate)
        newErrors.replacementRequestDate = "Request Date is required";
    }

    if (formData.dealType === "new") {
      if (!formData.businessType)
        newErrors.businessType = "Business Type is required";
      if (!existingLeadDetails.companySelect)
        newErrors.companySelect = "Select a company";
      if (!existingLeadDetails.companyNameGST)
        newErrors.companyNameGST = "Company Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- handle company select and autofill companyID and companyNameGST ---
  const handleCompanySelect = (value) => {
    const selected = leads.find((lead) => String(lead.id) === String(value));
    setFormData((prev) => ({
      ...prev,
      companyID: selected ? String(selected.id) : "",
      existingLeadDetails: {
        ...prev.existingLeadDetails,
        companySelect: value,
        companyNameGST: selected ? selected.companyNameGST || "" : ""
      }
    }));
  };

  // --- Flatten existingLeadDetails into main formData before submit ---
  const handleSubmit = async () => {
    if (!validateFields()) return;

    // Flatten fields for backend
    const payload = {
      ...formData,
      ...existingLeadDetails,
      companySelect: existingLeadDetails.companySelect,
      companyNameGST: existingLeadDetails.companyNameGST,
      employeeName: existingLeadDetails.employeeName,
      replacementReason: existingLeadDetails.replacementReason,
      replacementToDate: existingLeadDetails.replacementToDate,
      replacementRequestDate: existingLeadDetails.replacementRequestDate,
      existingLeadDetails: undefined
    };

    // Send to backend
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        setErrors({ submit: err.error || "Failed to save lead" });
      } else {
        setErrors({});
        handleMoveToDeal(payload); // Optionally update parent state/UI
      }
    } catch (e) {
      setErrors({ submit: "Network error" });
    }
  };

  return (
    <div className="mb-4 p-5 border rounded-md shadow-md overflow-hidden">
      <h3 className="text-lg font-semibold">Existing Lead Details</h3>

      <div className="mb-4">
        <Label>Type:</Label>
        <RadioGroup
          className="mt-2"
          value={formData.dealType}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, dealType: value }))
          }
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <RadioGroupItem
                id="replacement"
                value="replacement"
                className="border-black"
              />
              <Label htmlFor="replacement" className="ml-2">
                Replacement
              </Label>
            </div>
            <div className="flex items-center">
              <RadioGroupItem
                id="new"
                value="new"
                className="border-black"
              />
              <Label htmlFor="new" className="ml-2">
                New
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Replacement Fields */}
      {formData.dealType === "replacement" && (
        <div className="mb-4 p-4 border rounded-md shadow-sm space-y-2">
          <Input
            placeholder="Employee Name"
            value={existingLeadDetails.employeeName || ""}
            required
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Z\s]*$/.test(value)) {
                setFormData((prev) => ({
                  ...prev,
                  existingLeadDetails: {
                    ...prev.existingLeadDetails,
                    employeeName: value
                  }
                }));
                setErrors((prev) => ({ ...prev, employeeName: "" }));
              } else {
                setErrors((prev) => ({
                  ...prev,
                  employeeName: "Only alphabets and spaces allowed"
                }));
              }
            }}
          />
          {errors.employeeName && (
            <p className="text-red-500 text-sm">{errors.employeeName}</p>
          )}

          {/* --- NEW: Select Company Dropdown (above Select Reason) --- */}
          <Label htmlFor="companySelect">Select Company:</Label>
          <Select
            value={existingLeadDetails.companySelect || ""}
            onValueChange={handleCompanySelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Company" />
            </SelectTrigger>
            <SelectContent>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={String(lead.id)}>
                  {lead.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companySelect && (
            <p className="text-red-500 text-sm">{errors.companySelect}</p>
          )}

          <Select
            value={existingLeadDetails.replacementReason || ""}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                existingLeadDetails: {
                  ...prev.existingLeadDetails,
                  replacementReason: value
                }
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resigned">Resigned</SelectItem>
              <SelectItem value="performance_issue">
                Performance Issue
              </SelectItem>
              <SelectItem value="employee_concern">
                Employee Concern
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.replacementReason && (
            <p className="text-red-500 text-sm">{errors.replacementReason}</p>
          )}

          <Input
            type="date"
            value={existingLeadDetails.replacementToDate || ""}
            required
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                existingLeadDetails: {
                  ...prev.existingLeadDetails,
                  replacementToDate: e.target.value
                }
              }))
            }
          />
          {errors.replacementToDate && (
            <p className="text-red-500 text-sm">{errors.replacementToDate}</p>
          )}

          <Input
            type="date"
            value={existingLeadDetails.replacementRequestDate || ""}
            required
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                existingLeadDetails: {
                  ...prev.existingLeadDetails,
                  replacementRequestDate: e.target.value
                }
              }))
            }
          />
          {errors.replacementRequestDate && (
            <p className="text-red-500 text-sm">
              {errors.replacementRequestDate}
            </p>
          )}
        </div>
      )}

      {/* Qualified Lead Fields */}
      {formData.dealType === "new" && (
        <div className="mb-4 p-4 border rounded-md shadow-sm space-y-2">
          <Label htmlFor="businessType">Business Type:</Label>
          <Select
            value={formData.businessType || ""}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, businessType: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Business Type" />
            </SelectTrigger>
            <SelectContent>
              {["Managed", "Staffing", "Permanent", "Crowd Testing"].map(
                (type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          {errors.businessType && (
            <p className="text-red-500 text-sm">{errors.businessType}</p>
          )}

          <h3 className="text-lg font-semibold">Primary SPOC</h3>
          <SpocFields
            spocs={formData.spocs}
            setSpocs={(spocs) =>
              setFormData((prev) => ({ ...prev, spocs }))
            }
          />

          <Label htmlFor="companySelect">Select Company:</Label>
          <Select
            value={existingLeadDetails.companySelect || ""}
            onValueChange={handleCompanySelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Company" />
            </SelectTrigger>
            <SelectContent>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={String(lead.id)}>
                  {lead.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companySelect && (
            <p className="text-red-500 text-sm">{errors.companySelect}</p>
          )}

          <Label htmlFor="companyNameGST">Company Name (as per GST):</Label>
          <Input
            id="companyNameGST"
            placeholder="Enter GST Company Name"
            value={existingLeadDetails.companyNameGST || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                existingLeadDetails: {
                  ...prev.existingLeadDetails,
                  companyNameGST: e.target.value
                }
              }))
            }
          />
          {errors.companyNameGST && (
            <p className="text-red-500 text-sm">{errors.companyNameGST}</p>
          )}

          <Label htmlFor="companyID">Company ID:</Label>
          <Input id="companyID" value={formData.companyID || ""} readOnly />

          <Button variant="outline" onClick={handleSubmit}>
            Move to Deal
          </Button>
          {errors.submit && (
            <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
          )}
        </div>
      )}
    </div>
  );
}