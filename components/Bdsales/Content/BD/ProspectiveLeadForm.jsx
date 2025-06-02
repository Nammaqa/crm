
"use client";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import SpocFields from "./SpocFields";
import RemarksField from "./RemarksField";

// Enum arrays and label maps
const INDUSTRY_ENUMS = [
  "it",
  "finance",
  "healthcare",
  "manufacturing",
  "retail",
  "education",
  "telecom",
  "automobile",
  "realestate",
  "logistics",
  "media",
  "government",
  "energy",
  "consulting",
  "other",
];
const INDUSTRY_LABELS = {
  it: "IT",
  finance: "Finance",
  healthcare: "Healthcare",
  manufacturing: "Manufacturing",
  retail: "Retail",
  education: "Education",
  telecom: "Telecom",
  automobile: "Automobile",
  realestate: "Real Estate",
  logistics: "Logistics",
  media: "Media",
  government: "Government",
  energy: "Energy",
  consulting: "Consulting",
  other: "Other",
};

const TECHNOLOGY_ENUMS = [
  "development",
  "testing",
  "devops",
  "ai_ml",
  "ai",
  "digital_marketing",
  "data_analytics",
  "other",
];
const TECHNOLOGY_LABELS = {
  development: "Development",
  testing: "Testing",
  devops: "DevOps",
  ai_ml: "AI/ML",
  ai: "AI",
  digital_marketing: "Digital Marketing",
  data_analytics: "Data Analytics",
  other: "Other",
};

// Utility function to generate random Company ID (alphanumeric)
function generateCompanyID() {
  return (
    "COMP-" +
    Math.random()
      .toString(36)
      .replace(/[^a-z0-9]+/gi, "")
      .substr(2, 8)
      .toUpperCase()
  );
}

// Validation helpers
function isAlpha(value) {
  return /^[a-zA-Z\s]+$/.test(value);
}
function isNumeric(value) {
  return /^\d+$/.test(value);
}
function isAlphanumeric(value) {
  return /^[a-zA-Z0-9\-]+$/.test(value);
}
function isValidPhoneNumber(value) {
  return /^[6789]\d{9}$/.test(value);
}
function isValidEmail(value) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(value);
}

export default function ProspectiveLeadForm({ formData, setFormData, handleMoveToLead }) {
  const [errors, setErrors] = useState({
    companyName: "",
    companysize: "",
    companyID: "",
    spocs: [],
    technologyOther: "",
    industryOther: "",
  });

  // Track if "Other" is selected for Technology/Industry
  const [showTechnologyOther, setShowTechnologyOther] = useState(formData.technology === "other");
  const [showIndustryOther, setShowIndustryOther] = useState(formData.industry === "other");

  useEffect(() => {
    setShowTechnologyOther(formData.technology === "other");
  }, [formData.technology]);

  useEffect(() => {
    setShowIndustryOther(formData.industry === "other");
  }, [formData.industry]);

  // Validate all fields before moving to lead
  const validateForm = () => {
    let valid = true;
    let newErrors = {
      companyName: "",
      companysize: "",
      companyID: "",
      spocs: [],
      technologyOther: "",
      industryOther: "",
    };

    if (!formData.companyName || !isAlpha(formData.companyName)) {
      newErrors.companyName = "Company name must contain only alphabets and spaces.";
      valid = false;
    }

    if (!formData.companysize || !isNumeric(formData.companysize)) {
      newErrors.companysize = "Company size must be numeric.";
      valid = false;
    }

    if (!formData.companyID || !isAlphanumeric(formData.companyID)) {
      newErrors.companyID = "Company ID must be alphanumeric (auto-generated).";
      valid = false;
    }

    if (showTechnologyOther && (!formData.technologyOther || formData.technologyOther.trim() === "")) {
      newErrors.technologyOther = "Please specify the technology.";
      valid = false;
    }

    if (showIndustryOther && (!formData.industryOther || formData.industryOther.trim() === "")) {
      newErrors.industryOther = "Please specify the industry.";
      valid = false;
    }

    newErrors.spocs = formData.spocs.map((spoc) => {
      let spocErr = {};
      if (!spoc.name || !isAlpha(spoc.name)) {
        spocErr.name = "Name must contain only alphabets and spaces.";
        valid = false;
      }
      if (!spoc.email || !isValidEmail(spoc.email)) {
        spocErr.email = "Invalid email address.";
        valid = false;
      }
      if (!spoc.contact || !isValidPhoneNumber(spoc.contact)) {
        spocErr.contact = "Contact must be 10 digits, start with 6/7/8/9.";
        valid = false;
      }
      if (spoc.altContact && !isValidPhoneNumber(spoc.altContact)) {
        spocErr.altContact = "Alt Contact must be 10 digits, start with 6/7/8/9.";
        valid = false;
      }
      if (spoc.designation && !isAlpha(spoc.designation)) {
        spocErr.designation = "Designation must contain only alphabets and spaces.";
        valid = false;
      }
      if (spoc.location && !isAlpha(spoc.location)) {
        spocErr.location = "Location must contain only alphabets and spaces.";
        valid = false;
      }
      return spocErr;
    });

    setErrors(newErrors);
    return valid;
  };

  // On submit
  const handleMoveToLeadWithValidation = () => {
    if (validateForm()) {
      handleMoveToLead();
    }
  };

  const handleCompanyNameChange = (e) => {
    const value = e.target.value;
    if (value === "" || isAlpha(value)) {
      setFormData((prev) => ({ ...prev, companyName: value }));
    }
  };

  const handleCompanySizeChange = (e) => {
    const value = e.target.value;
    if (value === "" || isNumeric(value)) {
      setFormData((prev) => ({ ...prev, companysize: value }));
    }
  };

  const handleCompanyIDChange = (e) => {
    const value = e.target.value;
    if (value === "" || isAlphanumeric(value)) {
      setFormData((prev) => ({ ...prev, companyID: value }));
    }
  };

  const handleSpocsUpdate = (spocs) => {
    setFormData((prev) => ({ ...prev, spocs }));
  };

  // Technology select handler
  const handleTechnologyChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      technology: value,
      technologyOther: value === "other" ? (prev.technologyOther || "") : "",
    }));
    setShowTechnologyOther(value === "other");
  };

  // Industry select handler
  const handleIndustryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      industry: value,
      industryOther: value === "other" ? (prev.industryOther || "") : "",
    }));
    setShowIndustryOther(value === "other");
  };

  return (
    <div className="mb-4 p-5 border rounded-md shadow-md space-y-4">
      <div className="space-y-1">
        <Label>Company Name</Label>
        <Input
          value={formData.companyName}
          onChange={handleCompanyNameChange}
          required
          placeholder="Enter company name (alphabets only)"
        />
        {errors.companyName && (
          <span className="text-red-500 text-xs">{errors.companyName}</span>
        )}
      </div>

      <div className="space-y-1">
        <Label>Company Size</Label>
        <Input
          value={formData.companysize}
          onChange={handleCompanySizeChange}
          required
          placeholder="Enter company size (numeric only)"
        />
        {errors.companysize && (
          <span className="text-red-500 text-xs">{errors.companysize}</span>
        )}
      </div>

      <div className="space-y-1">
        <Label>Company ID</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Auto-generated or enter manually"
            value={formData.companyID}
            onChange={handleCompanyIDChange}
            required
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                companyID: generateCompanyID(),
              }))
            }
          >
            Generate
          </Button>
        </div>
        {errors.companyID && (
          <span className="text-red-500 text-xs">{errors.companyID}</span>
        )}
      </div>

      <div className="space-y-1">
        <Label>Business Type</Label>
        <Input
          placeholder="e.g. Staffing, Permanent"
          value={formData.dealType}
          onChange={(e) => setFormData((prev) => ({ ...prev, dealType: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <Label>No. of Employees</Label>
        <Input
          type="number"
          value={formData.numEmployees}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, numEmployees: e.target.value }))
          }
        />
      </div>

      <h3 className="text-lg font-semibold">Primary SPOC</h3>
      <SpocFields
        spocs={formData.spocs}
        setSpocs={handleSpocsUpdate}
        errors={errors.spocs}
      />

      <div className="space-y-2">
        <Label>Technology</Label>
        <Select
          value={formData.technology}
          onValueChange={handleTechnologyChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Technology" />
          </SelectTrigger>
          <SelectContent>
            {TECHNOLOGY_ENUMS.map((value) => (
              <SelectItem key={value} value={value}>
                {TECHNOLOGY_LABELS[value] || value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showTechnologyOther && (
          <div className="mt-2">
            <Input
              placeholder="Please specify technology"
              value={formData.technologyOther || ""}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  technologyOther: e.target.value,
                }))
              }
            />
            {errors.technologyOther && (
              <span className="text-red-500 text-xs">{errors.technologyOther}</span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Industry</Label>
        <Select
          value={formData.industry}
          onValueChange={handleIndustryChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_ENUMS.map((value) => (
              <SelectItem key={value} value={value}>
                {INDUSTRY_LABELS[value] || value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showIndustryOther && (
          <div className="mt-2">
            <Input
              placeholder="Please specify industry"
              value={formData.industryOther || ""}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  industryOther: e.target.value,
                }))
              }
            />
            {errors.industryOther && (
              <span className="text-red-500 text-xs">{errors.industryOther}</span>
            )}
          </div>
        )}
      </div>

      <RemarksField
        value={formData.remarks || ""}
        onChange={(value) => setFormData((prev) => ({ ...prev, remarks: value }))}
      />

      <div className="pt-4 text-right">
        <Button type="button" onClick={handleMoveToLeadWithValidation}>
          Move to Lead
        </Button>
      </div>
    </div>
  );
}