"use client";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import SpocFields from "./SpocFields";
import RemarksField from "./RemarksField";
import { toast } from "sonner";

const INDUSTRY_ENUMS = ["it", "finance", "healthcare", "manufacturing", "retail", "education", "telecom", "automobile", "realestate", "logistics", "media", "government", "energy", "consulting", "other"];
const INDUSTRY_LABELS = { it: "IT", finance: "Finance", healthcare: "Healthcare", manufacturing: "Manufacturing", retail: "Retail", education: "Education", telecom: "Telecom", automobile: "Automobile", realestate: "Real Estate", logistics: "Logistics", media: "Media", government: "Government", energy: "Energy", consulting: "Consulting", other: "Other" };

const TECHNOLOGY_ENUMS = ["development", "testing", "devops", "ai_ml", "ai", "digital_marketing", "data_analytics", "other"];
const TECHNOLOGY_LABELS = { development: "Development", testing: "Testing", devops: "DevOps", ai_ml: "AI/ML", ai: "AI", digital_marketing: "Digital Marketing", data_analytics: "Data Analytics", other: "Other" };

const COMPANY_TYPE_ENUMS = ["product", "service", "both"];
const COMPANY_TYPE_LABELS = { product: "Product Based", service: "Service Based", both: "Both" };

const BUSINESS_TYPE_ENUMS = ["staffing", "permanent", "managed", "crowd_testing"];
const BUSINESS_TYPE_LABELS = { staffing: "Staffing", permanent: "Permanent", managed: "Managed", crowd_testing: "Crowd Testing" };

function generateCompanyID(companyName) {
  if (!companyName) return "";
  const cleanName = companyName.replace(/[^a-zA-Z]/g, "").toUpperCase();
  const firstFour = cleanName.substring(0, 4).padEnd(4, "X");
  const lastTwo = cleanName.length > 4 ? cleanName.slice(-2) : "";
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}${firstFour}${lastTwo}${mm}${dd}`;
}

function generateUpdatedCompanyID(companyName, originalCompanyID) {
  if (!companyName || !originalCompanyID) return "";
  let originalMMDD;
  if (originalCompanyID.includes("-U")) {
    const baseID = originalCompanyID.split("-U")[0];
    originalMMDD = baseID.slice(-4);
  } else {
    originalMMDD = originalCompanyID.slice(-4);
  }
  const cleanName = companyName.replace(/[^a-zA-Z]/g, "").toUpperCase();
  const firstFour = cleanName.substring(0, 4).padEnd(4, "X");
  const lastTwo = cleanName.length > 4 ? cleanName.slice(-2) : "";
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const currentMMDD = mm + dd;
  const newBaseID = `${yyyy}${firstFour}${lastTwo}${originalMMDD}`;
  if (originalMMDD === currentMMDD) return newBaseID;
  return `${newBaseID}-U${currentMMDD}`;
}

function isAlpha(value) { return /^[a-zA-Z\s]+$/.test(value); }
function isNumeric(value) { return /^\d+$/.test(value); }
function isAlphanumeric(value) { return /^[a-zA-Z0-9\-]+$/.test(value); }
function isValidPhoneNumber(value) { return /^[6789]\d{9}$/.test(value); }
function isValidEmail(value) { return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value); }

async function checkCompanyIDUnique(companyID) {
  if (!companyID) return { unique: true };
  try {
    const res = await fetch(`/api/check-company-id?companyID=${companyID}`);
    return await res.json();
  } catch (err) {
    console.error("Error checking company ID:", err);
    return { unique: true };
  }
}

// Add this function after the existing validation functions
async function checkCompanyNameUnique(companyName) {
  if (!companyName) return { unique: true };
  try {
    const res = await fetch(`/api/check-company?companyName=${encodeURIComponent(companyName)}`);
    return await res.json();
  } catch (err) {
    console.error("Error checking company name:", err);
    return { unique: true };
  }
}

export default function ProspectiveLeadForm({ formData, setFormData, isEditMode, handleSubmit, handleMoveToQualifiedLead }) {
  const [errors, setErrors] = useState({ companyName: "", companysize: "", companyID: "", spocs: [], technologyOther: "", industryOther: "", businessType: "", companyType: "" });
  const [spocErrors, setSpocErrors] = useState([]);
  const [originalCompanyID, setOriginalCompanyID] = useState(formData.companyID || "");
  const [showTechnologyOther, setShowTechnologyOther] = useState(formData.technology === "other");
  const [showIndustryOther, setShowIndustryOther] = useState(formData.industry === "other");

  useEffect(() => {
    if (isEditMode && formData.companyID) setOriginalCompanyID(formData.companyID);
  }, []);

  useEffect(() => { setShowTechnologyOther(formData.technology === "other"); }, [formData.technology]);
  useEffect(() => { setShowIndustryOther(formData.industry === "other"); }, [formData.industry]);

  useEffect(() => {
    if (formData.companyName) {
      if (isEditMode && originalCompanyID) {
        setFormData((prev) => ({ ...prev, companyID: generateUpdatedCompanyID(formData.companyName, originalCompanyID) }));
      } else if (!isEditMode) {
        setFormData((prev) => ({ ...prev, companyID: generateCompanyID(formData.companyName) }));
      }
    }
  }, [formData.companyName, isEditMode, originalCompanyID, setFormData]);

  const validateForm = async () => {
    let valid = true;
    let newErrors = { companyName: "", companysize: "", companyID: "", spocs: [], technologyOther: "", industryOther: "", businessType: "", companyType: "" };

    if (!formData.companyName || !isAlpha(formData.companyName)) { newErrors.companyName = "Company name must contain only alphabets and spaces."; valid = false; }
    if (!formData.companysize || !isNumeric(formData.companysize)) { newErrors.companysize = "Company size must be numeric."; valid = false; }
    
    if (!formData.companyID || !isAlphanumeric(formData.companyID)) {
      newErrors.companyID = "Company ID must be alphanumeric (auto-generated).";
      valid = false;
    } else if (!isEditMode) {
      const { unique, addedBy } = await checkCompanyIDUnique(formData.companyID);
      if (!unique) { newErrors.companyID = `The company ID already exists. Contact "${addedBy}" for further information.`; valid = false; }
    }

    if (!formData.businessType || formData.businessType.trim() === "") { newErrors.businessType = "Business Type is required."; valid = false; }
    if (!formData.companyType || formData.companyType.trim() === "") { newErrors.companyType = "Company Type is required."; valid = false; }
    if (showTechnologyOther && (!formData.technologyOther || formData.technologyOther.trim() === "")) { newErrors.technologyOther = "Please specify the technology."; valid = false; }
    if (showIndustryOther && (!formData.industryOther || formData.industryOther.trim() === "")) { newErrors.industryOther = "Please specify the industry."; valid = false; }

    newErrors.spocs = formData.spocs.map((spoc) => {
      let spocErr = {};
      if (!spoc.name || !isAlpha(spoc.name)) { spocErr.name = "Name must contain only alphabets and spaces."; valid = false; }
      if (!spoc.email || !isValidEmail(spoc.email)) { spocErr.email = "Invalid email address."; valid = false; }
      if (!spoc.contact || !isValidPhoneNumber(spoc.contact)) { spocErr.contact = "Contact must be 10 digits, start with 6/7/8/9."; valid = false; }
      if (spoc.altContact && !isValidPhoneNumber(spoc.altContact)) { spocErr.altContact = "Alt Contact must be 10 digits, start with 6/7/8/9."; valid = false; }
      if (spoc.designation && !isAlpha(spoc.designation)) { spocErr.designation = "Designation must contain only alphabets and spaces."; valid = false; }
      if (spoc.location && !isAlpha(spoc.location)) { spocErr.location = "Location must contain only alphabets and spaces."; valid = false; }
      return spocErr;
    });

    setErrors(newErrors);
    return valid;
  };

  // Add debounce function to prevent too many API calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Add company name check
  const checkCompanyNameDebounced = debounce(async (name) => {
    if (name && isAlpha(name)) {
      const { unique, addedBy } = await checkCompanyNameUnique(name);
      if (!unique) {
        setErrors(prev => ({
          ...prev,
          companyName: `This company is already added by "${addedBy}". Please contact them for further information.`
        }));
        toast.error("Company already exists!");
      } else {
        setErrors(prev => ({ ...prev, companyName: "" }));
      }
    }
  }, 500);

  // Modify the company name input handler
  const handleCompanyNameChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value === "" || isAlpha(value.toLowerCase())) {
      setFormData((prev) => ({ ...prev, companyName: value }));
      if (!isEditMode) {
        checkCompanyNameDebounced(value);
      }
    }
  };

  const handleSaveProspective = async () => { if (await validateForm()) await handleSubmit(false); };
  const handleMoveToQualified = async () => { if (await validateForm()) { const saved = await handleSubmit(false); if (saved) handleMoveToQualifiedLead(); } };

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-2xl font-bold">{isEditMode ? "Edit Prospective Lead" : "Add Prospective Lead"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Company Name *</Label>
          <Input 
            value={formData.companyName}
            onChange={handleCompanyNameChange}
            placeholder="ENTER COMPANY NAME" 
            className={errors.companyName ? "border-red-500" : ""} 
            style={{ textTransform: 'uppercase' }}
          />
          {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
        </div>

        <div>
          <Label>Company Size (Number of Employees) *</Label>
          <Input value={formData.companysize} onChange={(e) => { const v = e.target.value; if (v === "" || isNumeric(v)) setFormData((p) => ({ ...p, companysize: v })); }} placeholder="Enter company size" className={errors.companysize ? "border-red-500" : ""} />
          {errors.companysize && <p className="text-red-500 text-sm mt-1">{errors.companysize}</p>}
        </div>

        <div>
          <Label>Company ID *</Label>
          <Input value={formData.companyID} readOnly placeholder="Auto-generated" className={errors.companyID ? "border-red-500" : "bg-gray-50"} />
          {errors.companyID && <p className="text-red-500 text-sm mt-1">{errors.companyID}</p>}
          {isEditMode && <p className="text-gray-500 text-xs mt-1">ID updates automatically when company name changes</p>}
        </div>
      </div>

      {/* ALL 4 FIELDS IN ONE ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <Label>Business Type *</Label>
          <Select value={formData.businessType} onValueChange={(v) => setFormData((p) => ({ ...p, businessType: v }))}>
            <SelectTrigger className={errors.businessType ? "border-red-500" : ""}><SelectValue placeholder="Select business type" /></SelectTrigger>
            <SelectContent>{BUSINESS_TYPE_ENUMS.map((t) => <SelectItem key={t} value={t}>{BUSINESS_TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
          </Select>
          {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
        </div>

        <div>
          <Label>Company Type *</Label>
          <Select value={formData.companyType} onValueChange={(v) => setFormData((p) => ({ ...p, companyType: v }))}>
            <SelectTrigger className={errors.companyType ? "border-red-500" : ""}><SelectValue placeholder="Select company type" /></SelectTrigger>
            <SelectContent>{COMPANY_TYPE_ENUMS.map((t) => <SelectItem key={t} value={t}>{COMPANY_TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
          </Select>
          {errors.companyType && <p className="text-red-500 text-sm mt-1">{errors.companyType}</p>}
        </div>

        <div>
          <Label>Industry</Label>
          <Select value={formData.industry} onValueChange={(v) => { setFormData((p) => ({ ...p, industry: v, industryOther: v === "other" ? p.industryOther || "" : "" })); setShowIndustryOther(v === "other"); }}>
            <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
            <SelectContent>{INDUSTRY_ENUMS.map((i) => <SelectItem key={i} value={i}>{INDUSTRY_LABELS[i]}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div>
          <Label>Technology</Label>
          <Select value={formData.technology} onValueChange={(v) => { setFormData((p) => ({ ...p, technology: v, technologyOther: v === "other" ? p.technologyOther || "" : "" })); setShowTechnologyOther(v === "other"); }}>
            <SelectTrigger><SelectValue placeholder="Select technology" /></SelectTrigger>
            <SelectContent>{TECHNOLOGY_ENUMS.map((t) => <SelectItem key={t} value={t}>{TECHNOLOGY_LABELS[t]}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {(showTechnologyOther || showIndustryOther) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {showTechnologyOther && (
            <div>
              <Label>Specify Technology *</Label>
              <Input value={formData.technologyOther} onChange={(e) => setFormData((p) => ({ ...p, technologyOther: e.target.value }))} placeholder="Specify technology" className={errors.technologyOther ? "border-red-500" : ""} />
              {errors.technologyOther && <p className="text-red-500 text-sm mt-1">{errors.technologyOther}</p>}
            </div>
          )}
          {showIndustryOther && (
            <div>
              <Label>Specify Industry *</Label>
              <Input value={formData.industryOther} onChange={(e) => setFormData((p) => ({ ...p, industryOther: e.target.value }))} placeholder="Specify industry" className={errors.industryOther ? "border-red-500" : ""} />
              {errors.industryOther && <p className="text-red-500 text-sm mt-1">{errors.industryOther}</p>}
            </div>
          )}
        </div>
      )}

      <SpocFields spocs={formData.spocs} onChange={(spocs) => setFormData((p) => ({ ...p, spocs }))} errors={spocErrors} setErrors={setSpocErrors} />
      <RemarksField value={formData.remarks} onChange={(value) => setFormData((p) => ({ ...p, remarks: value }))} />

      <div className="flex gap-4">
        <Button onClick={handleSaveProspective} variant="default">{isEditMode ? "Update Prospective Lead" : "Save Prospective Lead"}</Button>
        {formData.id && <Button onClick={handleMoveToQualified} variant="secondary">Move to Qualified Lead</Button>}
      </div>
    </div>
  );
}
