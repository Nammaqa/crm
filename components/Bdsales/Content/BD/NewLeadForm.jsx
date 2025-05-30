"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import SpocFields from "./SpocFields";
import RemarksField from "./RemarksField";

// Helper for live input restriction
function allowAlpha(value) {
  return value.replace(/[^a-zA-Z\s]/g, "");
}

export default function QualifiedLeadForm({ formData, setFormData, handleMoveToDeal, handleSubmitLead }) {
  const [error, setError] = useState("");

  // Validate company name: required, alphabets and spaces only
  const validateCompanyName = () => {
    if (!formData.companyName || formData.companyName.trim() === "") {
      setError("Company name is required.");
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.companyName)) {
      setError("Company name must contain only alphabets and spaces.");
      return false;
    }
    setError("");
    return true;
  };

  // Live input restriction
  const handleCompanyNameChange = (e) => {
    const value = allowAlpha(e.target.value);
    setFormData((prev) => ({ ...prev, companyName: value }));
    // Optionally clear error as user types
    if (error) setError("");
  };

  // Handle submit for both buttons
  const handleFormSubmit = async (e) => {
    e.preventDefault();  // Prevent default form submission

    if (validateCompanyName()) {
      if (formData.percentage === 90) {
        // Move to Deal/Closure logic
        handleMoveToDeal(e);
      } else {
        // Submit Qualified Lead logic
        // await handleSubmitLead(formData);
        console.log(formData)
      }
    }
  };

  return (
    <div className="mb-4 p-5 border rounded-md shadow-md space-y-4">
      <h2 className="text-xl font-bold mb-2">Qualified Lead</h2>
      <Label htmlFor="companyName">Company Name :</Label>
      <Input
        id="companyName"
        placeholder="Enter company name"
        value={formData.companyName}
        onChange={handleCompanyNameChange}
        required
      />
      {error && (
        <span className="text-red-500 text-xs">{error}</span>
      )}

      {/* Business Type */}
      <div>
        <Label>Business Type:</Label>
        <RadioGroup
          className="mt-2"
          value={formData.businessType || ""}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, businessType: value }))}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <RadioGroupItem id="managed" value="Managed" />
              <Label htmlFor="managed" className="ml-2">Managed</Label>
            </div>
            <div className="flex items-center">
              <RadioGroupItem id="staffing" value="Staffing" />
              <Label htmlFor="staffing" className="ml-2">Staffing</Label>
            </div>
            <div className="flex items-center">
              <RadioGroupItem id="permanent" value="Permanent" />
              <Label htmlFor="permanent" className="ml-2">Permanent</Label>
            </div>
            <div className="flex items-center">
              <RadioGroupItem id="crowd-testing" value="Crowd Testing" />
              <Label htmlFor="crowd-testing" className="ml-2">Crowd Testing</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <h3 className="text-lg font-semibold">Primary SPOC</h3>
      <SpocFields spocs={formData.spocs} setSpocs={(spocs) => setFormData(prev => ({ ...prev, spocs }))} />

      <RemarksField value={formData.remarks || ""} onChange={(value) => setFormData(prev => ({ ...prev, remarks: value }))} />

      {/* Percentage */}
      <div className="space-y-2">
        <Label>Percentage</Label>
        <RadioGroup
          className="space-y-2 flex flex-row gap-4"
          value={String(formData.percentage) || ""}
          onValueChange={(value) => setFormData(prev => ({ ...prev, percentage: parseInt(value, 10) }))}>
          {[10, 30, 50, 70, 90].map((value) => (
            <div key={value} className="flex items-center space-x-2">
              <RadioGroupItem value={String(value)} id={`percentage-${value}`} />
              <Label htmlFor={`percentage-${value}`}>{value}%</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          id="move-to-deal"
          variant="outline"
          onClick={handleFormSubmit}
        >
          {formData.percentage === 90 ? "Move to Deal/Closure" : "Save Qualified Lead"}
        </Button>
      </div>
    </div>
  );
}