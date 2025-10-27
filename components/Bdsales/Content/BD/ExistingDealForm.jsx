"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

export default function ExistingDealForm({ formData, setFormData, isEditMode }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (formData.dealType === "replacement") {
      if (!formData.employeeName?.trim()) {
        return "Employee Name is required for replacement deals";
      }
      if (!formData.replacementReason) {
        return "Replacement Reason is required";
      }
      if (!formData.replacementToDate) {
        return "Replacement To Date is required";
      }
      if (!formData.replacementRequestDate) {
        return "Replacement Request Date is required";
      }
    }
    return null;
  };

  // Save handler — updates lead via PUT /api/lead/:id
  const handleSave = async () => {
    if (!isEditMode) return;
    setSaving(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const payload = {
      dealType: formData.dealType,
      employeeName: formData.employeeName ? [formData.employeeName] : [],
      companySelect: formData.companySelect || null,
      replacementReason: formData.replacementReason || null,
      replacementToDate: formData.replacementToDate || null,
      replacementRequestDate: formData.replacementRequestDate || null,
      remarks: formData.remarks || null,
      spocs: Array.isArray(formData.spocs) ? formData.spocs : [],
    };

    const method = formData.id ? "PUT" : "POST";
    const endpoint = formData.id ? `/api/lead/${formData.id}` : "/api/lead";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Update local state with returned lead (if API returns it)
      if (data && typeof data === "object") {
        setFormData((prev) => ({ ...prev, ...data }));
      }
      alert("Saved successfully.");
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 mb-8 max-w-5xl w-full mx-auto">
      <h2 className="text-2xl font-semibold">Existing Lead Details</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <Card className="w-full">
        <CardHeader className="bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-green-900 text-xl">
                Deal Closed Successfully
              </CardTitle>
              <p className="text-sm text-green-700 mt-1">
                This lead has been moved to Existing Deal stage and is now finalized
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Company Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">
                Company Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Sales Owner</Label>
                <p className="text-sm font-semibold text-gray-900">
                  {formData.salesName || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Company Name</Label>
                <p className="text-sm font-semibold text-gray-900">
                  {formData.companyName || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Company ID</Label>
                <p className="text-sm font-semibold text-gray-900">
                  {formData.companyID || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Company Size</Label>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {formData.companysize || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Company Type</Label>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {formData.companyType || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Industry</Label>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {formData.industry || "N/A"}
                  {formData.industryOther && ` - ${formData.industryOther}`}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Technology</Label>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {formData.technology || "N/A"}
                  {formData.technologyOther && ` - ${formData.technologyOther}`}
                </p>
              </div>

              {/* Commenting out the Number of Employees field */}
              {/* <div className="space-y-1">
                <Label className="text-xs text-gray-500">Number of Employees</Label>
                <p className="text-sm font-semibold text-gray-900">
                  {formData.numberOfEmployees || "N/A"}
                </p>
              </div> */}

              {/* Commenting out the Success Percentage field */}
              {/* <div className="space-y-1">
                <Label className="text-xs text-gray-500">Success Percentage</Label>
                <Badge
                  variant="default"
                  className="bg-green-600 text-white text-sm px-3 py-1"
                >
                  {formData.percentage || 0}%
                </Badge>
              </div> */}

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Lead Status</Label>
                <Badge
                  variant="outline"
                  className="border-green-600 text-green-700 text-xs px-3 py-1"
                >
                  Existing Deal (Closed)
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Deal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-purple-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">
                Deal Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-3">
              {/* Deal Type intentionally commented out in this page */}
              {/* <div className="space-y-1">
                <Label className="text-xs text-gray-500">Deal Type</Label>
                <Badge
                  variant="secondary"
                  className="text-sm px-3 py-1 capitalize"
                >
                  {formData.dealType || "N/A"}
                </Badge>
              </div> */}

              {formData.businessType && (
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">
                    Business Type
                  </Label>
                  <p className="text-sm font-semibold text-gray-900">
                    {formData.businessType}
                  </p>
                </div>
              )}

              {formData.companyNameGST && (
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">
                    Company Name (GST)
                  </Label>
                  <p className="text-sm font-semibold text-gray-900">
                    {formData.companyNameGST}
                  </p>
                </div>
              )}

              {/* Replacement Details */}
              {formData.dealType === "replacement" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      Employee Name
                    </Label>
                    <p className="text-sm font-semibold text-gray-900">
                      {formData.employeeName || "N/A"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      Replacement Reason
                    </Label>
                    <p className="text-sm font-semibold text-gray-900">
                      {formData.replacementReason || "N/A"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      Replacement To Date
                    </Label>
                    <p className="text-sm font-semibold text-gray-900">
                      {formData.replacementToDate
                        ? new Date(formData.replacementToDate).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )
                        : "N/A"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Request Date</Label>
                    <p className="text-sm font-semibold text-gray-900">
                      {formData.replacementRequestDate
                        ? new Date(
                            formData.replacementRequestDate
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>

                  {formData.companySelect && (
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">
                        Selected Company
                      </Label>
                      <p className="text-sm font-semibold text-gray-900">
                        {formData.companySelect}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* SPOC Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-orange-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">
                Single Point of Contact (SPOC)
              </h3>
            </div>
            <div className="pl-3">
              {formData.spocs && formData.spocs.length > 0 ? (
                <div className="space-y-4">
                  {formData.spocs.map((spoc, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {spoc.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-base text-gray-900">
                            {spoc.name || "N/A"}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {spoc.designation || "N/A"}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          SPOC {idx + 1}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-200">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Email</Label>
                          <p className="text-xs font-medium text-gray-900 break-all">
                            {spoc.email || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">
                            Contact Number
                          </Label>
                          <p className="text-xs font-medium text-gray-900">
                            {spoc.contact || "N/A"}
                          </p>
                        </div>
                        {spoc.altContact && (
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">
                              Alternate Contact
                            </Label>
                            <p className="text-xs font-medium text-gray-900">
                              {spoc.altContact}
                            </p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Location</Label>
                          <p className="text-xs font-medium text-gray-900">
                            {spoc.location || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                  <svg
                    className="h-10 w-10 mx-auto mb-2 text-gray-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <p className="text-sm font-medium">No SPOC information available</p>
                </div>
              )}
            </div>
          </div>

          {/* Remarks Section */}
          {formData.remarks && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-green-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Remarks & Notes
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 pl-3 ml-3">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {formData.remarks}
                  </p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Information Notice */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">
                  Read-Only Record
                </h4>
                <p className="text-xs text-blue-700">
                  This record is in the final stage (Existing Deal - Closed) and
                  cannot be modified. All information is displayed for reference
                  purposes only.
                </p>
              </div>
            </div>
          </div>

          {/* Replacement Section */}
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-yellow-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">
                Replacement Details
              </h3>
            </div>

            <div className="pl-3">
              {/* Deal Type */}
              <div className="mb-6">
                <Label className="text-xs text-gray-500">Deal Type</Label>
                <div className="mt-2">
                  <RadioGroup
                    value={formData.dealType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, dealType: value }))
                    }
                    disabled={!isEditMode}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="replacement"
                        id="replacement"
                        disabled={!isEditMode}
                      />
                      <Label htmlFor="replacement">Replacement</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Replacement fields */}
              {formData.dealType === "replacement" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Employee Name */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Employee Name</Label>
                    <Input
                      placeholder="Employee Name"
                      value={formData.employeeName || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ 
                          ...prev, 
                          employeeName: e.target.value 
                        }))
                      }
                      disabled={!isEditMode}
                      className="mt-1"
                    />
                  </div>

                  {/* Select Company */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Select Company</Label>
                    <select
                      value={formData.companySelect || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ 
                          ...prev, 
                          companySelect: e.target.value 
                        }))
                      }
                      disabled={!isEditMode}
                      className="w-full border rounded px-3 py-2 bg-white mt-1"
                      aria-label="Select Company"
                    >
                      <option value="" disabled>
                        Select company
                      </option>
                      {formData.companySelect ? (
                        <option value={formData.companySelect}>
                          {formData.companyName || `Company ${formData.companySelect}`}
                        </option>
                      ) : (
                        <option value="">
                          {formData.companyName || "No company available"}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Select Reason */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Select Reason</Label>
                    <select
                      value={formData.replacementReason || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ 
                          ...prev, 
                          replacementReason: e.target.value 
                        }))
                      }
                      disabled={!isEditMode}
                      className="w-full border rounded px-3 py-2 bg-white mt-1"
                      aria-label="Select Replacement Reason"
                    >
                      <option value="" disabled>
                        Select Reason
                      </option>
                      <option value="resignation">Resignation</option>
                      <option value="termination">Termination</option>
                      <option value="performance">Performance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Replacement To Date */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Replacement To Date</Label>
                    <Input
                      type="date"
                      value={formData.replacementToDate || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ 
                          ...prev, 
                          replacementToDate: e.target.value 
                        }))
                      }
                      disabled={!isEditMode}
                      className="mt-1"
                    />
                  </div>

                  {/* Replacement Request Date */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Request Date</Label>
                    <Input
                      type="date"
                      value={formData.replacementRequestDate || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ 
                          ...prev, 
                          replacementRequestDate: e.target.value 
                        }))
                      }
                      disabled={!isEditMode}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save action - only visible when editing is allowed */}
          {isEditMode && (
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className={saving ? "opacity-50 cursor-not-allowed" : ""}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
