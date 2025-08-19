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

export default function ExistingLeadForm({ leads, formData, setFormData, handleMoveToDeal }) {
  const { existingLeadDetails } = formData;
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    
    if (formData.dealType === "replacement") {
      if (!existingLeadDetails.employeeName) newErrors.employeeName = "Employee Name is required";
      if (!existingLeadDetails.companySelect) newErrors.companySelect = "Select a company";
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

  const handleCompanySelect = (value) => {
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

  const handleSubmit = () => {
    if (!validateFields()) return;

    // Merge all top-level form fields AND nested existingLeadDetails
    const payload = {
      ...formData, 
      ...existingLeadDetails, // flatten nested details
      spocs: formData.spocs || [], // always include
    };

    // Remove nested object to avoid API confusion
    delete payload.existingLeadDetails;

    // Clean up undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    console.log("Final payload to backend:", payload);
    handleMoveToDeal(payload);
  };

  return (
    <div className="mb-4 p-5 border rounded-md shadow-md overflow-hidden">
      <h3 className="text-lg font-semibold">Existing Lead Details</h3>

      {/* Type Selector */}
      <div className="mb-4">
        <Label>Type:</Label>
        <RadioGroup
          className="mt-2"
          value={formData.dealType}
          onValueChange={(value) => setFormData(prev => ({ ...prev, dealType: value }))}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <RadioGroupItem id="replacement" value="replacement" className="border-black" />
              <Label htmlFor="replacement" className="ml-2">Replacement</Label>
            </div>
            {/* <div className="flex items-center">
              <RadioGroupItem id="new" value="new" className="border-black" />
              <Label htmlFor="new" className="ml-2">New</Label>
            </div> */}
          </div>
        </RadioGroup>
      </div>

      {/* Replacement Fields */}
      {formData.dealType === "replacement" && (
        <div className="mb-4 p-4 border rounded-md shadow-sm space-y-2">
          <Input
            placeholder="Employee Name"
            value={existingLeadDetails.employeeName}
            required
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

          {/* Company Select */}
          <Label>Select Company:</Label>
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

          {/* Replacement Reason */}
          <Label>Select Reason:</Label>
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
              <SelectItem value="performance_issue">Performance Issue</SelectItem>
              <SelectItem value="employee_concern">Employee Concern</SelectItem>
            </SelectContent>
          </Select>
          {errors.replacementReason && <p className="text-red-500 text-sm">{errors.replacementReason}</p>}

          <Label>Replacement To Date:</Label>
          <Input
            type="date"
            value={existingLeadDetails.replacementToDate}
            required
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                existingLeadDetails: { ...prev.existingLeadDetails, replacementToDate: e.target.value }
              }))
            }
          />
          {errors.replacementToDate && <p className="text-red-500 text-sm">{errors.replacementToDate}</p>}

          <Label>Request Date:</Label>
          <Input
            type="date"
            value={existingLeadDetails.replacementRequestDate}
            required
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

      {/* New Deal Fields */}
      {formData.dealType === "new" && (
        <div className="mb-4 p-4 border rounded-md shadow-sm space-y-2">
          <Label>Business Type:</Label>
          <Select
            value={formData.businessType}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, businessType: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Business Type" />
            </SelectTrigger>
            <SelectContent>
              {["Managed", "Staffing", "Permanent", "Crowd Testing"].map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.businessType && <p className="text-red-500 text-sm">{errors.businessType}</p>}

          {/* SPOCs */}
          <h3 className="text-lg font-semibold">Primary SPOC</h3>
          <SpocFields spocs={formData.spocs} setSpocs={(spocs) => setFormData(prev => ({ ...prev, spocs }))} />

          {/* Company Select */}
          <Label>Select Company:</Label>
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

          <Label>Company Name (GST):</Label>
          <Input
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

          <Label>Company ID:</Label>
          <Input value={formData.companyID} readOnly />
        </div>
      )}

      {/* Submit */}
      {/* <div className="mt-4">
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={!formData.dealType}
        >
          Save
        </Button>
      </div> */}
    </div>
  );
}
