"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import SpocFields from "./SpocFields";
import RemarksField from "./RemarksField";
import { toast } from "sonner";

export default function QualifiedLeadForm({
  formData,
  setFormData,
  isEditMode,
  leads,
  handleMoveToExistingDeal,
  onSaveSuccess, // NEW: callback to refresh table
  onClearForm, // NEW: callback to clear form after save
}) {
  const [errors, setErrors] = useState({});
  const [spocErrors, setSpocErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const validateFields = () => {
    const newErrors = {};

    if (!formData.percentage || parseInt(formData.percentage, 10) < 10) {
      newErrors.percentage = "Percentage must be at least 10% for Qualified Lead";
    }

    if (formData.dealType === "replacement") {
      if (!formData.employeeName) newErrors.employeeName = "Employee Name is required";
      if (!formData.replacementReason)
        newErrors.replacementReason = "Replacement reason is required";
      if (!formData.replacementToDate)
        newErrors.replacementToDate = "Replacement To Date is required";
      if (!formData.replacementRequestDate)
        newErrors.replacementRequestDate = "Request Date is required";
    }

    if (formData.dealType === "new") {
      if (!formData.businessType) newErrors.businessType = "Business Type is required";
      if (!formData.companyNameGST)
        newErrors.companyNameGST = "Company Name (GST) is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMoveToDeal = () => {
    if (!validateFields()) {
      toast.error("Please fill all required fields");
      return;
    }

    const percentageValue = parseInt(formData.percentage, 10);
    if (percentageValue < 90) {
      toast.error("Percentage must be at least 90% to move to Deal");
      return;
    }

    handleMoveToExistingDeal();
  };

  const handleSpocsUpdate = (spocs) => {
    setFormData((prev) => ({ ...prev, spocs }));
  };

  // Save: sends to backend (PUT if id exists, otherwise POST)
  const handleSave = async () => {
    if (!validateFields()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      // Build payload: include expected keys and sanitize values
      const payload = {
        salesName: formData.salesName || null,
        leadType: formData.dealType || formData.leadType || "new",
        status: formData.status || "newlead",
        businessType: formData.businessType || null,
        companyName: formData.companyName || null,
        companysize: formData.companysize || null,
        companyID: formData.companyID || null,
        numberOfEmployees:
          formData.numberOfEmployees !== undefined && formData.numberOfEmployees !== ""
            ? Number(formData.numberOfEmployees)
            : undefined,
        employeeName: formData.employeeName || undefined,
        replacementReason:
          formData.replacementReason === "" ? null : formData.replacementReason || null,
        replacementToDate:
          formData.replacementToDate && formData.replacementToDate !== ""
            ? formData.replacementToDate
            : undefined,
        replacementRequestDate:
          formData.replacementRequestDate && formData.replacementRequestDate !== ""
            ? formData.replacementRequestDate
            : undefined,
        companySelect: formData.companySelect || null,
        companyNameGST: formData.companyNameGST || null,
        technology: formData.technology || null,
        industry: formData.industry || null,
        percentage:
          formData.percentage !== undefined && formData.percentage !== ""
            ? Number(formData.percentage)
            : undefined,
        remarks: formData.remarks || null,
        spocs: Array.isArray(formData.spocs) ? formData.spocs : [],
        companyType: formData.companyType || null,
        technologyOther: formData.technologyOther || null,
        industryOther: formData.industryOther || null,
      };

      // Remove undefined keys
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined) delete payload[k];
      });

      const isUpdate = !!formData.id;
      const url = isUpdate ? `/api/lead/${formData.id}` : "/api/lead";
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });

      // Attempt to parse JSON when possible
      let data = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = { message: text };
        }
      }

      if (!res.ok) {
        const message =
          (data && (data.error || data.message)) ||
          `Failed to save (status ${res.status})`;
        console.error("Save error response:", res.status, data);
        toast.error(message);
        setSaving(false);
        return;
      }

      if (data && typeof data === "object") {
        // Update local formData with returned data (server returns created/updated lead)
        setFormData((prev) => ({ ...prev, ...data }));
      }

      toast.success("Saved successfully");
      
      // NEW: Call the callback to refresh the table immediately
      if (onSaveSuccess) {
        onSaveSuccess(data);
      }

      // Clear form after successful submission
      if (onClearForm) {
        setTimeout(() => {
          onClearForm();
        }, 500);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-2xl font-bold">Qualified Lead</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name (Read-only) */}
        <div>
          <Label>Company Name</Label>
          <Input value={formData.companyName} disabled className="bg-gray-50" />
        </div>

        {/* Company ID (Read-only) */}
        <div>
          <Label>Company ID</Label>
          <Input value={formData.companyID} disabled className="bg-gray-50" />
        </div>

      {/* Conditional Fields for Replacement */}
      {formData.dealType === "replacement" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="col-span-full font-semibold">Replacement Details</h3>

          <div>
            <Label>Employee Name *</Label>
            <Input
              value={formData.employeeName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  employeeName: e.target.value,
                }))
              }
              placeholder="Enter employee name"
              className={errors.employeeName ? "border-red-500" : ""}
            />
            {errors.employeeName && (
              <p className="text-red-500 text-sm mt-1">{errors.employeeName}</p>
            )}
          </div>

          <div>
            <Label>Replacement Reason *</Label>
            <Select
              value={formData.replacementReason}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, replacementReason: value }))
              }
            >
              <SelectTrigger
                className={errors.replacementReason ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select reason" />
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
              <p className="text-red-500 text-sm mt-1">
                {errors.replacementReason}
              </p>
            )}
          </div>

          <div>
            <Label>Replacement To Date *</Label>
            <Input
              type="date"
              value={formData.replacementToDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  replacementToDate: e.target.value,
                }))
              }
              className={errors.replacementToDate ? "border-red-500" : ""}
            />
            {errors.replacementToDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.replacementToDate}
              </p>
            )}
          </div>

          <div>
            <Label>Replacement Request Date *</Label>
            <Input
              type="date"
              value={formData.replacementRequestDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  replacementRequestDate: e.target.value,
                }))
              }
              className={errors.replacementRequestDate ? "border-red-500" : ""}
            />
            {errors.replacementRequestDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.replacementRequestDate}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Conditional Fields for New Deal */}
      {formData.dealType === "new" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="col-span-full font-semibold">New Deal Details</h3>

          <div>
            <Label>Business Type *</Label>
            <Input
              value={formData.businessType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, businessType: e.target.value }))
              }
              placeholder="E.g., Consulting, IT Services"
              className={errors.businessType ? "border-red-500" : ""}
            />
            {errors.businessType && (
              <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>
            )}
          </div>

          <div>
            <Label>Company Name (GST) *</Label>
            <Input
              value={formData.companyNameGST}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  companyNameGST: e.target.value,
                }))
              }
              placeholder="Enter company name as per GST"
              className={errors.companyNameGST ? "border-red-500" : ""}
            />
            {errors.companyNameGST && (
              <p className="text-red-500 text-sm mt-1">
                {errors.companyNameGST}
              </p>
            )}
          </div>
        </div>
      )}

      {/* SPOCs */}
      <SpocFields
        spocs={formData.spocs}
        onChange={handleSpocsUpdate}
        errors={spocErrors}
        setErrors={setSpocErrors}
      />

      {/* Remarks */}
      <RemarksField
        value={formData.remarks}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, remarks: value }))
        }
      />
        
       {/* Percentage */}
        <div>
          <Label>Percentage *</Label>
          <RadioGroup
            value={formData.percentage?.toString()}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, percentage: parseInt(value, 10) }))
            }
            className="flex flex-wrap gap-4 mt-2"
          >
            {[30, 50, 70, 90].map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value.toString()} id={`percentage-${value}`} />
                <Label htmlFor={`percentage-${value}`}>{value}%</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.percentage && (
            <p className="text-red-500 text-sm mt-1">{errors.percentage}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Must be at least 90% to move to Deal
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 items-center">
        <Button
          onClick={handleMoveToDeal}
          variant="default"
          disabled={!formData.id || parseInt(formData.percentage, 10) < 90}
        >
          Move to Deal
        </Button>
        <Button onClick={handleSave} variant="primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        {parseInt(formData.percentage, 10) < 90 && (
          <p className="text-sm text-gray-500 flex items-center">
            Percentage must be at least 90% to enable this button
          </p>
        )}
      </div>
    </div>
  );
}
