"use client";
import { useState } from "react";
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

export default function ExistingLeadForm({ formData, setFormData, leads, handleMoveToDeal }) {
  const { existingLeadDetails } = formData;
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (formData.dealType === "replacement") {
      if (!existingLeadDetails.employeeName) newErrors.employeeName = "Employee Name is required";
      if (!existingLeadDetails.replacementReason) newErrors.replacementReason = "Replacement reason is required";
      if (!existingLeadDetails.replacementToDate) newErrors.replacementToDate = "Replacement To Date is required";
      if (!existingLeadDetails.replacementRequestDate) newErrors.replacementRequestDate = "Request Date is required";
    }

    if (formData.dealType === "new") {
      if (!formData.businessType) newErrors.businessType = "Business Type is required";
      if (!existingLeadDetails.companySelect) newErrors.companySelect = "Select a company";
      if (!existingLeadDetails.companyNameGST) newErrors.companyNameGST = "Company Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- NEW: handle company select and autofill companyID and companyNameGST ---
  const handleCompanySelect = (value) => {
    // Find the selected lead
    const selectedLead = leads.find((lead) => String(lead.id) === String(value));
    setFormData(prev => ({
      ...prev,
      companyID: selectedLead ? String(selectedLead.id) : "",
      existingLeadDetails: {
        ...prev.existingLeadDetails,
        companySelect: value,
        companyNameGST: selectedLead ? selectedLead.companyNameGST || "" : "",
      }
    }));
  };

  return (
    <div className="mb-4 p-5 border rounded-md shadow-md">
      <h3 className="text-lg font-semibold">Existing Lead Details</h3>

      <div className="mb-4">
        <Label>Type:</Label>
        <RadioGroup
          className="mt-2"
          value={formData.dealType}
          onValueChange={(value) => setFormData(prev => ({ ...prev, dealType: value }))}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <RadioGroupItem id="replacement" value="replacement" />
              <Label htmlFor="replacement" className="ml-2">Replacement</Label>
            </div>
            <div className="flex items-center">
              <RadioGroupItem id="new" value="new" />
              <Label htmlFor="new" className="ml-2">New</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Replacement Fields */}
      {formData.dealType === "replacement" && (
        <div className="mb-4 p-4 border rounded-md shadow-sm space-y-2">
          <Input
            placeholder="Employee Name"
            value={existingLeadDetails.employeeName}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Z\s]*$/.test(value)) {
                setFormData(prev => ({
                  ...prev,
                  existingLeadDetails: { ...prev.existingLeadDetails, employeeName: value }
                }));
                setErrors(prev => ({ ...prev, employeeName: "" }));
              } else {
                setErrors(prev => ({ ...prev, employeeName: "Only alphabets and spaces allowed" }));
              }
            }}
          />
          {errors.employeeName && <p className="text-red-500 text-sm">{errors.employeeName}</p>}

          <Select
            value={existingLeadDetails.replacementReason}
            onValueChange={(value) =>
              setFormData(prev => ({
                ...prev,
                existingLeadDetails: { ...prev.existingLeadDetails, replacementReason: value }
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resigned">Resigned</SelectItem>
              <SelectItem value="performance-issue">Performance Issue</SelectItem>
              <SelectItem value="employee-concern">Employee Concern</SelectItem>
            </SelectContent>
          </Select>
          {errors.replacementReason && <p className="text-red-500 text-sm">{errors.replacementReason}</p>}

          <Input
            type="date"
            value={existingLeadDetails.replacementToDate}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                existingLeadDetails: { ...prev.existingLeadDetails, replacementToDate: e.target.value }
              }))
            }
          />
          {errors.replacementToDate && <p className="text-red-500 text-sm">{errors.replacementToDate}</p>}

          <Input
            type="date"
            value={existingLeadDetails.replacementRequestDate}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                existingLeadDetails: { ...prev.existingLeadDetails, replacementRequestDate: e.target.value }
              }))
            }
          />
          {errors.replacementRequestDate && <p className="text-red-500 text-sm">{errors.replacementRequestDate}</p>}
        </div>
      )}

      {/* Qualified Lead Fields */}
      {formData.dealType === "new" && (
        <div className="mb-4 p-4 border rounded-md shadow-sm space-y-2">
          <Label htmlFor="businessType">Business Type:</Label>
          <Select
            value={formData.businessType}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, businessType: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Business Type" />
            </SelectTrigger>
            <SelectContent>
              {["Managed", "Staffing", "Permanent", "Crowd Testing"].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.businessType && <p className="text-red-500 text-sm">{errors.businessType}</p>}

          <h3 className="text-lg font-semibold">Primary SPOC</h3>
          <SpocFields spocs={formData.spocs} setSpocs={(spocs) => setFormData(prev => ({ ...prev, spocs }))} />

          <Label htmlFor="companySelect">Select Company:</Label>
          <Select
            value={existingLeadDetails.companySelect}
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
          {errors.companySelect && <p className="text-red-500 text-sm">{errors.companySelect}</p>}

          <Label htmlFor="companyNameGST">Company Name (as per GST):</Label>
          <Input
            id="companyNameGST"
            placeholder="Enter GST Company Name"
            value={existingLeadDetails.companyNameGST}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                existingLeadDetails: { ...prev.existingLeadDetails, companyNameGST: e.target.value }
              }))
            }
          />
          {errors.companyNameGST && <p className="text-red-500 text-sm">{errors.companyNameGST}</p>}

          <Label htmlFor="companyID">Company ID:</Label>
          <Input id="companyID" value={formData.companyID} readOnly />

          <Button
            variant="outline"
            onClick={() => {
              if (validateFields()) {
                handleMoveToDeal();
              }
            }}
          >
            Move to Deal
          </Button>
        </div>
      )}
    </div>
  );
}