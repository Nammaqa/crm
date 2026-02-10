"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function RecruitmentForm() {
  const initialFormData = {
    requirementId: "",
    requirementName: "",
    companyName: "",
    jobDescription: "",
    jdImage: null,
    experience: "",
    noticePeriod: "",
    positions: "",
    primarySkills: "",
    secondarySkills: "",
    closePositions: "",
    requirementType: "",
    workLocation: "",
    budget: "",
    priority: "Medium",
    updatedBy: "",
  };

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [jdImagePreview, setJdImagePreview] = useState(null);
  const jdInputRef = useRef(null);

  const [companyOptions, setCompanyOptions] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [companyIdMap, setCompanyIdMap] = useState({});

  const [currentUserName, setCurrentUserName] = useState("");

  const isAlpha = (str) => /^[A-Za-z\s]+$/.test(str);
  const isAlphaOrComma = (str) => /^[A-Za-z\s,]+$/.test(str);
  const isNumeric = (str) => /^\d+$/.test(str);
  const isExperienceValid = (str) => /^(\d{1,2}(\.\d{0,1})?)?$/.test(str);

  // Fetch logged in user and autofill updatedBy
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        const name = data?.data?.userName || data?.userName || "";
        if (name) {
          setCurrentUserName(name);
          setFormData((prev) => ({ ...prev, updatedBy: name }));
        }
      } catch (err) {
        // silent
      }
    };
    fetchCurrentUser();
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.priority) {
      newErrors.priority = "Priority is required.";
    }

    if (!formData.requirementName.trim()) {
      newErrors.requirementName = "Requirement Name is required.";
    } else if (!isAlpha(formData.requirementName)) {
      newErrors.requirementName = "Only alphabets and spaces allowed.";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company Name is required.";
    }

    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Job Description is required.";
    } else if (!isAlphaOrComma(formData.jobDescription)) {
      newErrors.jobDescription = "Only alphabets, commas, and spaces allowed.";
    }

    if (!formData.primarySkills.trim()) {
      newErrors.primarySkills = "Primary Skills are required.";
    } else if (!isAlphaOrComma(formData.primarySkills)) {
      newErrors.primarySkills = "Only alphabets, commas, and spaces allowed.";
    }

    if (!formData.secondarySkills.trim()) {
      newErrors.secondarySkills = "Secondary Skills are required.";
    } else if (!isAlphaOrComma(formData.secondarySkills)) {
      newErrors.secondarySkills = "Only alphabets, commas, and spaces allowed.";
    }

    if (!formData.experience.toString().trim()) {
      newErrors.experience = "Experience is required.";
    } else if (!isExperienceValid(formData.experience)) {
      newErrors.experience = "Max 2 digits before decimal and 1 digit after decimal allowed.";
    }

    if (!formData.noticePeriod.toString().trim()) {
      newErrors.noticePeriod = "Notice Period is required.";
    } else if (!isNumeric(formData.noticePeriod)) {
      newErrors.noticePeriod = "Only whole numbers allowed.";
    }

    if (!formData.positions.toString().trim()) {
      newErrors.positions = "Number of Positions is required.";
    } else if (!isNumeric(formData.positions)) {
      newErrors.positions = "Only whole numbers allowed.";
    }

    if (!formData.budget.toString().trim()) {
      newErrors.budget = "Budget is required.";
    } else if (!isNumeric(formData.budget)) {
      newErrors.budget = "Only whole numbers allowed.";
    }

    if (!formData.requirementType) {
      newErrors.requirementType = "Recruitment Type is required.";
    }
    if (!formData.workLocation) {
      newErrors.workLocation = "Work Location is required.";
    }
    if (!formData.closePositions) {
      newErrors.closePositions = "Position Type is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleExperienceChange = (e) => {
    const { value } = e.target;
    if (value === "" || isExperienceValid(value)) {
      setFormData((prev) => ({
        ...prev,
        experience: value,
      }));
      setErrors((prev) => ({
        ...prev,
        experience: undefined,
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        experience: "Max 2 digits before decimal and 1 digit after decimal allowed.",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["noticePeriod", "positions", "budget"].includes(name) && value.includes(".")) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleJdImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (jdImagePreview) {
      try { URL.revokeObjectURL(jdImagePreview); } catch (err) {}
    }
    if (file) {
      setFormData((prev) => ({
        ...prev,
        jdImage: file,
      }));
      const previewUrl = URL.createObjectURL(file);
      setJdImagePreview(previewUrl);
    } else {
      setFormData((prev) => ({
        ...prev,
        jdImage: null,
      }));
      setJdImagePreview(null);
      if (jdInputRef.current) jdInputRef.current.value = "";
    }
  };

  const handleRemoveJdImage = () => {
    if (jdImagePreview) {
      try { URL.revokeObjectURL(jdImagePreview); } catch (err) {}
    }
    setFormData((prev) => ({
      ...prev,
      jdImage: null,
    }));
    setJdImagePreview(null);
    if (jdInputRef.current) jdInputRef.current.value = "";
  };

  useEffect(() => {
    const fetchCompanyIds = async () => {
      setIsLoadingCompanies(true);
      try {
        const response = await fetch("/api/company-ids?withIds=1");
        if (response.ok) {
          const data = await response.json();
          setCompanyOptions(data.map(c => c.companyName));
          const map = {};
          data.forEach(c => { map[c.companyName] = c.companyID; });
          setCompanyIdMap(map);
        } else {
          setCompanyOptions([]);
        }
      } catch {
        setCompanyOptions([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    fetchCompanyIds();
  }, []);

  const generateRequirementId = async (companyName) => {
    const companyID = companyIdMap[companyName];
    if (!companyID) return;
    try {
      const res = await fetch(`/api/requirements/next-seq?companyID=${encodeURIComponent(companyID)}`);
      const { nextSeq } = await res.json();
      const reqId = `${companyID}-REQ${String(nextSeq).padStart(3, "0")}`;
      setFormData(prev => ({ ...prev, requirementId: reqId }));
    } catch {
      setFormData(prev => ({ ...prev, requirementId: "" }));
    }
  };

  const handleCompanyChange = async (value) => {
    if (!value || value === "__no_companies") return;
    setFormData(prev => ({
      ...prev,
      companyName: value
    }));
    setErrors(prev => ({
      ...prev,
      companyName: undefined
    }));
    await generateRequirementId(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "jdImage" && value) {
          formDataToSend.append("jdImage", value);
        } else {
          formDataToSend.append(key, value == null ? "" : String(value));
        }
      });

      const response = await fetch("/api/requirements", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Requirement submitted successfully!");
        const newReqId = `COMPID-REQ${String(Date.now()).slice(-6)}`;
        setFormData({ ...initialFormData, requirementId: newReqId, priority: "Medium", updatedBy: currentUserName });
        setErrors({});
        setJdImagePreview(null);
      } else {
        throw new Error(data?.error || "Submission failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold">Recruitment Request Form</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill out the form below to submit a new recruitment requirement
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row 1: Company Name + Requirement ID + Updated By */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="companyName">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.companyName}
                  onValueChange={handleCompanyChange}
                  disabled={isLoadingCompanies || companyOptions.length === 0}
                >
                  <SelectTrigger className="w-full border rounded-md focus:ring-2 focus:ring-blue-500 transition-all">
                    <SelectValue placeholder={isLoadingCompanies ? "Loading companies..." : "Select a company"} />
                  </SelectTrigger>
                  <SelectContent>
                    {companyOptions.length > 0 ? (
                      companyOptions.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem key="none" value="__no_companies" disabled>
                        No companies available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.companyName && (
                  <span className="text-red-600 text-xs">{errors.companyName}</span>
                )}
                {!isLoadingCompanies && companyOptions.length === 0 && (
                  <span className="text-amber-600 text-xs">
                    No existing companies found for your account.
                  </span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="requirementId">
                  Requirement ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="requirementId"
                  name="requirementId"
                  value={formData.requirementId}
                  readOnly
                  className="bg-muted border rounded-md text-gray-700"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="updatedBy">
                  Updated By
                </Label>
                <Input
                  id="updatedBy"
                  name="updatedBy"
                  value={formData.updatedBy}
                  readOnly
                  className="bg-muted border rounded-md text-gray-700"
                />
              </div>
            </div>

            {/* Row 2: Priority + Requirement Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <Label>
                  Priority <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                  className="flex flex-row gap-6 pt-2"
                >
                  {["Low", "Medium", "High"].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={level}
                        id={`priority-${level}`}
                        className="h-4 w-4 border-gray-400 text-blue-600 focus:ring-blue-400"
                      />
                      <Label
                        htmlFor={`priority-${level}`}
                        className="font-normal cursor-pointer text-gray-700"
                      >
                        {level}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.priority && (
                  <span className="text-red-600 text-xs">{errors.priority}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="requirementName">
                  Requirement Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="requirementName"
                  name="requirementName"
                  value={formData.requirementName}
                  onChange={handleChange}
                  placeholder="e.g., Senior Software Engineer"
                  autoComplete="off"
                  className="border rounded-md"
                />
                {errors.requirementName && (
                  <span className="text-red-600 text-xs">{errors.requirementName}</span>
                )}
              </div>
            </div>

            {/* Row 3: Job Description - Full Width */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="jobDescription">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                placeholder="Brief description of the role"
                autoComplete="off"
                rows={4}
                className="border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.jobDescription && (
                <span className="text-red-600 text-xs">{errors.jobDescription}</span>
              )}
            </div>

            {/* Row 4: JD Image Upload - Full Width */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="jdImage">JD Image / Document (Optional)</Label>
              <Input
                ref={jdInputRef}
                id="jdImage"
                name="jdImage"
                type="file"
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleJdImageChange}
                className="cursor-pointer border border-gray-300 rounded-md hover:border-blue-400 transition-all"
              />
              {formData.jdImage && (
                <div className="mt-3 p-4 border rounded-lg bg-muted/40 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    {formData.jdImage.type && formData.jdImage.type.startsWith("image/") ? (
                      <Image
                        src={jdImagePreview}
                        alt="JD Preview"
                        width={80}
                        height={80}
                        className="h-20 w-20 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="h-20 w-20 flex items-center justify-center bg-background border rounded-md">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {formData.jdImage?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formData.jdImage?.type && formData.jdImage?.type.startsWith("image/")
                          ? "Image File"
                          : formData.jdImage?.type === "application/pdf"
                          ? "PDF Document"
                          : "Word Document"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveJdImage}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {/* Row 5: Primary Skills + Secondary Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="primarySkills">
                  Primary Skills <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="primarySkills"
                  name="primarySkills"
                  value={formData.primarySkills}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, MongoDB"
                  autoComplete="off"
                />
                {errors.primarySkills && (
                  <span className="text-red-600 text-xs">{errors.primarySkills}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="secondarySkills">
                  Secondary Skills <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="secondarySkills"
                  name="secondarySkills"
                  value={formData.secondarySkills}
                  onChange={handleChange}
                  placeholder="e.g., Docker, AWS, Git"
                  autoComplete="off"
                />
                {errors.secondarySkills && (
                  <span className="text-red-600 text-xs">{errors.secondarySkills}</span>
                )}
              </div>
            </div>

            {/* Row 6: Experience + Notice Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="experience">
                  Experience (Years) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleExperienceChange}
                  type="text"
                  inputMode="decimal"
                  maxLength={4}
                  placeholder="e.g., 3.5"
                  autoComplete="off"
                  pattern="\d{1,2}(\.\d{0,1})?"
                />
                {errors.experience && (
                  <span className="text-red-600 text-xs">{errors.experience}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="noticePeriod">
                  Notice Period (Days) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="noticePeriod"
                  name="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="1"
                  maxLength={4}
                  placeholder="e.g., 30"
                  autoComplete="off"
                />
                {errors.noticePeriod && (
                  <span className="text-red-600 text-xs">{errors.noticePeriod}</span>
                )}
              </div>
            </div>

            {/* Row 7: Number of Positions + Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="positions">
                  Number of Positions <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="positions"
                  name="positions"
                  value={formData.positions}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="1"
                  maxLength={4}
                  placeholder="e.g., 2"
                  autoComplete="off"
                />
                {errors.positions && (
                  <span className="text-red-600 text-xs">{errors.positions}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="budget">
                  Budget (INR) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g., 800000"
                  autoComplete="off"
                />
                {errors.budget && (
                  <span className="text-red-600 text-xs">{errors.budget}</span>
                )}
              </div>
            </div>

            {/* Row 8: Recruitment Type + Position Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <Label>
                  Recruitment Type <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.requirementType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, requirementType: value }))
                  }
                  className="flex flex-row gap-4 pt-2 flex-wrap"
                >
                  {["FullTime", "C2H", "Contract"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`type-${type}`} />
                      <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.requirementType && (
                  <span className="text-red-600 text-xs">{errors.requirementType}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Label>
                  Position Type <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.closePositions}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, closePositions: value }))
                  }
                  className="flex flex-row gap-6 pt-2"
                >
                  {["New", "Replacement"].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`closePositions-${option}`} />
                      <Label htmlFor={`closePositions-${option}`} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.closePositions && (
                  <span className="text-red-600 text-xs">{errors.closePositions}</span>
                )}
              </div>
            </div>

            {/* Row 9: Work Location - Full Width */}
            <div className="flex flex-col space-y-2">
              <Label>
                Work Location <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.workLocation}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, workLocation: value }))
                }
                className="flex flex-row gap-6 pt-2 flex-wrap"
              >
                {["WFO", "WFC", "Hybrid", "Remote"].map((loc) => (
                  <div key={loc} className="flex items-center space-x-2">
                    <RadioGroupItem value={loc} id={`loc-${loc}`} />
                    <Label htmlFor={`loc-${loc}`} className="font-normal cursor-pointer">
                      {loc === "WFO" ? "Work From Office" : loc === "WFC" ? "Work From Client" : loc}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.workLocation && (
                <span className="text-red-600 text-xs">{errors.workLocation}</span>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newReqId = `COMPID-REQ${String(Date.now()).slice(-6)}`;
                  if (jdImagePreview) {
                    try { URL.revokeObjectURL(jdImagePreview); } catch (err) {}
                  }
                  if (jdInputRef.current) jdInputRef.current.value = "";
                  setFormData({ ...initialFormData, requirementId: newReqId, priority: "Medium" });
                  setErrors({});
                  setJdImagePreview(null);
                }}
                disabled={loading}
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                className="min-w-[150px] flex items-center justify-center"
                disabled={loading}
              >
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
                {loading ? "Submitting..." : "Submit Requirement"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RecruitmentForm;
//