"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";

function RecruitmentForm() {
  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [jdImagePreview, setJdImagePreview] = useState(null);

  // Validation functions
  const isAlpha = (str) => /^[A-Za-z\s]+$/.test(str);
  const isAlphaOrComma = (str) => /^[A-Za-z\s,]+$/.test(str);
  const isNumeric = (str) => /^\d+$/.test(str);
  // Experience: up to 2 digits before decimal, optional 1 digit after decimal
  const isExperienceValid = (str) => /^(\d{1,2}(\.\d{0,1})?)?$/.test(str);

  const validate = () => {
    const newErrors = {};

    // Alphabetic validations
    if (!formData.requirementName.trim()) {
      newErrors.requirementName = "Requirement Name is required.";
    } else if (!isAlpha(formData.requirementName)) {
      newErrors.requirementName = "Only alphabets and spaces allowed.";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company Name is required.";
    } else if (!isAlpha(formData.companyName)) {
      newErrors.companyName = "Only alphabets and spaces allowed.";
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

    // Numeric validations
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

    // Required radio/select fields
    if (!formData.requirementType) {
      newErrors.requirementType = "Recruitment Type is required.";
    }
    if (!formData.workLocation) {
      newErrors.workLocation = "Work Location is required.";
    }
    if (!formData.closePositions) {
      newErrors.closePositions = "Position Type is required.";
    }

    // JD Image is optional, so no validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Restrict experience input at the keyboard level
  const handleExperienceChange = (e) => {
    const { value } = e.target;
    // Allow only valid pattern or empty string
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
    // Prevent decimals for integer fields except experience
    if (
      ["noticePeriod", "positions", "budget"].includes(name) &&
      value.includes(".")
    ) {
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

  // Handle JD Image change
  const handleJdImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        jdImage: file,
      }));
      setJdImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({
        ...prev,
        jdImage: null,
      }));
      setJdImagePreview(null);
    }
  };

  // Remove JD Image
  const handleRemoveJdImage = () => {
    setFormData((prev) => ({
      ...prev,
      jdImage: null,
    }));
    setJdImagePreview(null);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recruitment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!validate()) return;
              setLoading(true);

              try {
                // Use FormData if jdImage is present, else JSON
                let body;
                let headers;
                if (formData.jdImage) {
                  body = new FormData();
                  Object.entries(formData).forEach(([key, value]) => {
                    if (key === "jdImage" && value) {
                      body.append("jdImage", value);
                    } else {
                      body.append(key, value);
                    }
                  });
                  // Don't set Content-Type for FormData
                  headers = {};
                } else {
                  body = JSON.stringify({
                    ...formData,
                    experience: Number(formData.experience),
                    noticePeriod: Number(formData.noticePeriod),
                    positions: Number(formData.positions),
                    budget: Number(formData.budget),
                  });
                  headers = { "Content-Type": "application/json" };
                }

                const res = await fetch("/api/requirements", {
                  method: "POST",
                  headers,
                  body,
                });

                const data = await res.json();

                if (res.ok) {
                  alert("Requirement submitted successfully!");
                  // Log form data to console
                  console.log("Submitted Recruitment Data:", formData);
                  // Clear form fields
                  setFormData(initialFormData);
                  setErrors({});
                  setJdImagePreview(null);
                } else {
                  alert(data?.error || "Submission failed.");
                }
              } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while submitting the form.");
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-6"
          >
            {/* Alphabetic fields */}
            <div className="flex flex-col mb-5">
              <Label htmlFor="requirementName" className="mb-2">
                Requirement Name: <span className="text-red-500">*</span>
              </Label>
              <Input
                id="requirementName"
                name="requirementName"
                value={formData.requirementName}
                onChange={handleChange}
                type="text"
                placeholder="Enter requirement name"
                autoComplete="off"
              />
              {errors.requirementName && (
                <span className="text-red-600 text-xs mt-1">{errors.requirementName}</span>
              )}
            </div>
            <div className="flex flex-col mb-5">
              <Label htmlFor="companyName" className="mb-2">
                Company Name: <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                type="text"
                placeholder="Enter company name"
                autoComplete="off"
              />
              {errors.companyName && (
                <span className="text-red-600 text-xs mt-1">{errors.companyName}</span>
              )}
            </div>
            <div className="flex flex-col mb-5">
              <Label htmlFor="jobDescription" className="mb-2">
                Job Description: <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                type="text"
                placeholder="Enter job description"
                autoComplete="off"
              />
              {errors.jobDescription && (
                <span className="text-red-600 text-xs mt-1">{errors.jobDescription}</span>
              )}
            </div>
            {/* JD Image Upload (Optional) */}
            <div className="flex flex-col mb-5">
              <Label htmlFor="jdImage" className="mb-2">
                JD Image (optional):
              </Label>
              <Input
                id="jdImage"
                name="jdImage"
                type="file"
                accept="image/*"
                onChange={handleJdImageChange}
              />
              {jdImagePreview && (
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={jdImagePreview}
                    alt="JD Preview"
                    width={96}
                    height={96}
                    className="h-24 w-auto rounded border"
                  />
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
            {/* ...rest of the form fields remain unchanged... */}
            {/* Primary Skills, Secondary Skills, Experience, Notice Period, Positions, etc. */}
            <div className="flex flex-col mb-5">
              <Label htmlFor="primarySkills" className="mb-2">
                Primary Skills: <span className="text-red-500">*</span>
              </Label>
              <Input
                id="primarySkills"
                name="primarySkills"
                value={formData.primarySkills}
                onChange={handleChange}
                type="text"
                placeholder="Enter primary skills"
                autoComplete="off"
              />
              {errors.primarySkills && (
                <span className="text-red-600 text-xs mt-1">{errors.primarySkills}</span>
              )}
            </div>
            <div className="flex flex-col mb-5">
              <Label htmlFor="secondarySkills" className="mb-2">
                Secondary Skills: <span className="text-red-500">*</span>
              </Label>
              <Input
                id="secondarySkills"
                name="secondarySkills"
                value={formData.secondarySkills}
                onChange={handleChange}
                type="text"
                placeholder="Enter secondary skills"
                autoComplete="off"
              />
              {errors.secondarySkills && (
                <span className="text-red-600 text-xs mt-1">{errors.secondarySkills}</span>
              )}
            </div>
            <div className="flex flex-col mb-5">
              <Label htmlFor="experience" className="mb-2">
                Experience (years): <span className="text-red-500">*</span>
              </Label>
              <Input
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleExperienceChange}
                type="text"
                inputMode="decimal"
                maxLength={4}
                autoComplete="off"
                pattern="\d{1,2}(\.\d{0,1})?"
              />
              {errors.experience && (
                <span className="text-red-600 text-xs mt-1">{errors.experience}</span>
              )}
            </div>
            <div className="flex flex-col mb-5">
              <Label htmlFor="noticePeriod" className="mb-2">
                Notice Period (days): <span className="text-red-500">*</span>
              </Label>
              <Input
                id="noticePeriod"
                name="noticePeriod"
                value={formData.noticePeriod}
                onChange={handleChange}
                type="number"
                min="0"
                step="1"
                autoComplete="off"
              />
              {errors.noticePeriod && (
                <span className="text-red-600 text-xs mt-1">{errors.noticePeriod}</span>
              )}
            </div>
            <div className="flex flex-col mb-5">
              <Label htmlFor="positions" className="mb-2">
                Number of Positions: <span className="text-red-500">*</span>
              </Label>
              <Input
                id="positions"
                name="positions"
                value={formData.positions}
                onChange={handleChange}
                type="number"
                min="0"
                step="1"
                autoComplete="off"
              />
              {errors.positions && (
                <span className="text-red-600 text-xs mt-1">{errors.positions}</span>
              )}
            </div>
            {/* Requirement Type */}
            <div className="flex flex-col mb-5">
              <Label className="mb-2">
                Recruitment Type: <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.requirementType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, requirementType: value }))
                }
                className="flex flex-row gap-6"
              >
                {["FullTime", "C2H", "Contract"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={`type-${type}`} />
                    <Label htmlFor={`type-${type}`}>{type}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.requirementType && (
                <span className="text-red-600 text-xs mt-1">{errors.requirementType}</span>
              )}
            </div>
            {/* Work Location */}
            <div className="flex flex-col mb-5">
              <Label className="mb-2">
                Work Location: <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.workLocation}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, workLocation: value }))
                }
                className="flex flex-row gap-6"
              >
                {["WFO", "WFC", "Hybrid", "Remote"].map((loc) => (
                  <div key={loc} className="flex items-center space-x-2">
                    <RadioGroupItem value={loc} id={`loc-${loc}`} />
                    <Label htmlFor={`loc-${loc}`}>{loc}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.workLocation && (
                <span className="text-red-600 text-xs mt-1">{errors.workLocation}</span>
              )}
            </div>
            {/* Position Type (New / Replacement) as Radio Buttons */}
            <div className="flex flex-col mb-5">
              <Label className="mb-2">
                Position Type: <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.closePositions}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, closePositions: value }))
                }
                className="flex flex-row gap-8"
              >
                {["New", "Replacement"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`closePositions-${option}`} />
                    <Label htmlFor={`closePositions-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.closePositions && (
                <span className="text-red-600 text-xs mt-1">{errors.closePositions}</span>
              )}
            </div>
            {/* Budget */}
            <div className="flex flex-col mb-5">
              <Label htmlFor="budget" className="mb-2">
                Budget (in INR): <span className="text-red-500">*</span>
              </Label>
              <Input
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                type="number"
                min="0"
                step="1"
                placeholder="Enter budget"
                autoComplete="off"
              />
              {errors.budget && (
                <span className="text-red-600 text-xs mt-1">{errors.budget}</span>
              )}
            </div>
            <Button type="submit" className="w-full flex items-center justify-center" disabled={loading}>
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
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RecruitmentForm;