"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Dropdown options
const sourcedFromOptions = [
  "LinkedIn",
  "Walk-in",
  "Email",
  "Naukri",
  "Glassdoor",
  "Foundit",
  "CutShort",
  "Indeed",
  "Shine",
  "Others"
];

const employmentTypeOptions = [
  "Permanent",
  "Contract",
  "C2H (Contract to Hire)"
];

const relocateOptions = [
  "Yes",
  "No"
];

const CandidateEditForm = () => {
  const router = useRouter();
  const { id: candidateId } = useParams(); 
  const [formData, setFormData] = useState({});
  const [hasOffer, setHasOffer] = useState("No");
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [companyIds, setCompanyIds] = useState([]);

  const mapBackendToFrontend = (data) => ({
    "Name": data.name,
    "Contact Number": data.contactNumber,
    "Alternate Contact Number": data.alternateContactNumber,
    "Email ID": data.email,
    "Sourced From": data.sourcedFrom,
    "Employment Type": data.employmentType,
    "Domain Experience (Primary)": data.domainExperience,
    "Current / Previous Company": data.company,
    "Role": data.role,
    "Current CTC (In LPA)": data.currentCTC,
    "Expected CTC (In LPA)": data.expectedCTC,
    "Current Working Status": data.workingStatus,
    "Notice Period (In Days)": data.noticePeriod,
    "Current Location (Nearest City)": data.location,
    "Ready to Relocate for Other Location": data.relocate ? "Yes" : "No",
    "Prefered Location (City)": data.preferredLocation,
    "Availability for the Interview": data.interviewAvailability,
    "Client Name": data.clientName,
    "Demand Code": data.demandCode,
    "Interview taken by": data.interviewTakenBy,
    "Follow Ups": data.followUps,
    "Updated By": data.updatedBy,
    "Offers Any": data.offersAny ? "Yes" : "No",
    "Technical Skills": data.technicalSkills,
    "Relavant Experience": data.relevantExperience,
    "Relevant Experience in Primary Skill": data.primarySkillExp,
    "Relevant Experience in Secondary Skill": data.secondarySkillExp,
    "NammaQA update": data.nammaqaUpdate,
    "Feedback": data.feedback,
    "Upload Resume": data.resumeLink,
    "Offer Details": data.offerDetails || ""
  });

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await fetch(`/api/candidates/${candidateId}`);
        const data = await res.json();
        const mapped = mapBackendToFrontend(data);
        setFormData(mapped);
        setHasOffer(mapped["Offers Any"]);
      } catch (err) {
        console.error("Error fetching candidate:", err);
      }
    };

    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  useEffect(() => {
    async function fetchCompanyIds() {
      try {
        const res = await fetch("/api/company-idss");
        const data = await res.json();
        setCompanyIds(Array.isArray(data) ? data : []);
      } catch (err) {
        setCompanyIds([]);
      }
    }
    fetchCompanyIds();
  }, []);

  const validateField = (field, value) => {
    const phonePattern = /^[6-9]\d{9}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (field) {
      case "Name":
        if (!value || !value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Name can only contain letters and spaces";
        break;

      case "Contact Number":
        if (!value || !value.trim()) return "Contact Number is required";
        if (!/^\d+$/.test(value)) return "Contact Number must contain only numbers";
        if (!phonePattern.test(value)) return "Enter a valid 10-digit number starting with 6-9";
        break;

      case "Alternate Contact Number":
        if (value && value.trim()) {
          if (!/^\d+$/.test(value)) return "Alternate Contact Number must contain only numbers";
          if (!phonePattern.test(value)) return "Enter a valid 10-digit number starting with 6-9";
        }
        break;

      case "Email ID":
        if (!value || !value.trim()) return "Email ID is required";
        if (!emailPattern.test(value)) return "Enter a valid email address";
        break;

      case "Technical Skills":
        if (!value || !value.trim()) return "Technical Skills are required";
        if (value.trim().length < 3) return "Please provide more details about technical skills";
        break;

      case "Relavant Experience":
        if (!value || !value.trim()) return "Relevant Experience is required";
        break;

      case "Current CTC (In LPA)":
        if (value && (isNaN(value) || parseFloat(value) < 0)) return "Enter a valid CTC amount";
        if (value && parseFloat(value) > 200) return "Please enter a realistic CTC amount";
        break;

      case "Expected CTC (In LPA)":
        if (value && (isNaN(value) || parseFloat(value) < 0)) return "Enter a valid CTC amount";
        if (value && parseFloat(value) > 200) return "Please enter a realistic CTC amount";
        break;

      case "Notice Period (In Days)":
        if (value && (isNaN(value) || parseInt(value) < 0)) return "Enter a valid number of days";
        if (value && parseInt(value) > 365) return "Notice period seems unusually long";
        break;

      case "Upload Resume":
        if (value && value instanceof File) {
          const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
          if (!allowedTypes.includes(value.type)) return "Only PDF and Word documents are allowed";
          if (value.size > 5 * 1024 * 1024) return "File size should not exceed 5MB";
        }
        break;

      case "Offer Details":
        if (formData["Offers Any"] === "Yes" && (!value || !value.trim())) {
          return "Offer Details are required when candidate has offers";
        }
        break;

      case "Sourced From":
        if (!value || !value.trim()) return "Please select a source";
        break;

      case "Employment Type":
        if (!value || !value.trim()) return "Please select employment type";
        break;

      case "Demand Code":
        if (!value || !value.trim()) return "Please select a requirement code";
        break;

      default:
        return null;
    }
    return null;
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "Name",
      "Contact Number",
      "Email ID",
      "Technical Skills",
      "Relavant Experience",
      "Sourced From",
      "Employment Type",
      "Demand Code"
    ];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    if (formData["Offers Any"] === "Yes") {
      const offerError = validateField("Offer Details", formData["Offer Details"]);
      if (offerError) errors["Offer Details"] = offerError;
    }

    return errors;
  };

  const handleInputChange = (field, value) => {
    if (field === "Upload Resume") {
      setFormData({ ...formData, [field]: value.target.files[0] });
    } else {
      setFormData({ ...formData, [field]: value });
      if (field === 'Offers Any') setHasOffer(value);
    }
   
    if (touched[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errors = validateField(field, formData[field]);
    if (errors) {
      setFormErrors(prev => ({ ...prev, [field]: errors }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allFields = [
      "Name", "Contact Number", "Alternate Contact Number", "Email ID",
      "Sourced From", "Employment Type", "Technical Skills", "Relavant Experience",
      "Demand Code"
    ];
    const touchedFields = {};
    allFields.forEach(field => touchedFields[field] = true);
    setTouched(touchedFields);

    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      alert('⚠️ Please fix all validation errors before submitting');
      return;
    }

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "Upload Resume" && value instanceof File) {
          form.append(key, value);
        } else {
          form.append(key, value ?? "");
        }
      });

      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PUT",
        body: form,
      });

      if (res.ok) {
        alert('✅ Candidate updated successfully!');
        router.push("/recruiter");
      } else {
        alert('❌ Error updating candidate. Please try again.');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('❌ An error occurred. Please try again.');
    }
  };

  const handleBack = () => {
    router.push("/recruiter");
  };

  const renderError = (field) => {
    return touched[field] && formErrors[field] && (
      <span style={styles.error}>{formErrors[field]}</span>
    );
  };

  const renderInput = (field, placeholder, type = "text") => (
    <div style={styles.inputGroup}>
      <label htmlFor={field} style={styles.label}>
        {field}
        {["Name", "Contact Number", "Email ID", "Technical Skills", "Relavant Experience", "Sourced From", "Employment Type", "Demand Code"].includes(field) && 
          <span style={styles.required}> *</span>
        }
      </label>
      <input
        type={type}
        id={field}
        name={field}
        style={{
          ...styles.input,
          ...(touched[field] && formErrors[field] ? styles.inputError : {}),
          ...(field === "Updated By" ? styles.inputReadOnly : {})
        }}
        placeholder={placeholder}
        value={formData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        onBlur={() => handleBlur(field)}
        readOnly={field === "Updated By"}
        disabled={field === "Updated By"}
      />
      {renderError(field)}
    </div>
  );

  const renderTextArea = (field, placeholder) => (
    <div style={styles.inputGroupFull}>
      <label htmlFor={field} style={styles.label}>
        {field}
        {["Technical Skills"].includes(field) && <span style={styles.required}> *</span>}
      </label>
      <textarea
        id={field}
        name={field}
        rows="4"
        style={{
          ...styles.textarea,
          ...(touched[field] && formErrors[field] ? styles.inputError : {})
        }}
        placeholder={placeholder}
        value={formData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        onBlur={() => handleBlur(field)}
      />
      {renderError(field)}
    </div>
  );

  const renderSelect = (field, options, placeholder, isRequired = false) => (
    <div style={styles.inputGroup}>
      <label htmlFor={field} style={styles.label}>
        {field}
        {isRequired && <span style={styles.required}> *</span>}
      </label>
      <select
        id={field}
        name={field}
        style={{
          ...styles.select,
          ...(touched[field] && formErrors[field] ? styles.inputError : {})
        }}
        onChange={(e) => handleInputChange(field, e.target.value)}
        onBlur={() => handleBlur(field)}
        value={formData[field] || ''}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {renderError(field)}
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.heading}>Edit Candidate Information</h1>
          <p style={styles.subheading}>Update candidate details below. Required fields are marked with *</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Personal Information</h2>
            <div style={styles.formGrid}>
              {renderInput("Name", "Enter full name")}
              {renderInput("Contact Number", "Enter 10-digit mobile number", "tel")}
              {renderInput("Alternate Contact Number", "Enter alternate number (optional)", "tel")}
              {renderInput("Email ID", "Enter email address", "email")}
            </div>
          </div>

          {/* Professional Information Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Professional Details</h2>
            <div style={styles.formGrid}>
              {renderSelect("Sourced From", sourcedFromOptions, "Select source", true)}
              {renderSelect("Employment Type", employmentTypeOptions, "Select employment type", true)}
              {renderInput("Domain Experience (Primary)", "e.g., Banking, Healthcare, E-commerce")}
              {renderInput("Current / Previous Company", "Enter company name")}
              {renderInput("Role", "e.g., Software Engineer, QA Lead")}
              {renderInput("Current CTC (In LPA)", "Enter current CTC", "number")}
              {renderInput("Expected CTC (In LPA)", "Enter expected CTC", "number")}
              {renderInput("Current Working Status", "e.g., Employed, Notice Period, Immediate Joiner")}
              {renderInput("Notice Period (In Days)", "Enter notice period in days", "number")}
            </div>
          </div>

          {/* Location Preferences Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Location Preferences</h2>
            <div style={styles.formGrid}>
              {renderInput("Current Location (Nearest City)", "Enter current city")}
              {renderSelect("Ready to Relocate for Other Location", relocateOptions, "Select option")}
              {renderInput("Prefered Location (City)", "Enter preferred cities (comma separated)")}
              {renderInput("Availability for the Interview", "e.g., Immediate, After 3 days, Weekends only")}
            </div>
          </div>

          {/* Technical Skills Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Technical Skills & Experience</h2>
            {renderTextArea("Technical Skills", "List all technical skills (e.g., Java, Python, Selenium, API Testing)")}
            <div style={styles.formGrid}>
              {renderInput("Relavant Experience", "Total relevant experience (e.g., 5 years)")}
              {renderInput("Relevant Experience in Primary Skill", "Experience in primary skill (e.g., 3 years)")}
              {renderInput("Relevant Experience in Secondary Skill", "Experience in secondary skill (optional)")}
            </div>
          </div>

          {/* Requirement Information Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Requirement Details</h2>
            <div style={styles.formGrid}>
              {renderInput("Client Name", "Enter client name")}
              {renderSelect("Demand Code", companyIds, "Select requirement code", true)}
              {renderInput("Interview taken by", "Enter interviewer name")}
              
              <div style={styles.inputGroup}>
                <label htmlFor="Updated By" style={styles.label}>Updated By</label>
                <input
                  type="text"
                  id="Updated By"
                  name="Updated By"
                  style={styles.inputReadOnly}
                  value={formData["Updated By"] || ''}
                  readOnly
                  tabIndex={-1}
                />
              </div>
            </div>
          </div>

          {/* Offer Details Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Offer & Status Information</h2>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label htmlFor="Offers Any" style={styles.label}>Offers Any</label>
                <select
                  id="Offers Any"
                  name="Offers Any"
                  style={styles.select}
                  onChange={(e) => handleInputChange("Offers Any", e.target.value)}
                  value={formData["Offers Any"] || "No"}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {hasOffer === 'Yes' && (
                <div style={styles.inputGroupFull}>
                  <label htmlFor="Offer Details" style={styles.label}>
                    Offer Details<span style={styles.required}> *</span>
                  </label>
                  <input
                    type="text"
                    id="Offer Details"
                    name="Offer Details"
                    placeholder="Enter offer details (company, CTC, joining date)"
                    style={{
                      ...styles.input,
                      ...(touched["Offer Details"] && formErrors["Offer Details"] ? styles.inputError : {})
                    }}
                    value={formData['Offer Details'] || ''}
                    onChange={(e) => handleInputChange('Offer Details', e.target.value)}
                    onBlur={() => handleBlur('Offer Details')}
                  />
                  {renderError("Offer Details")}
                </div>
              )}
            </div>

            <div style={styles.formGrid}>
              {renderTextArea("Follow Ups", "Enter follow-up notes or action items")}
              {renderTextArea("NammaQA update", "Enter any updates or notes from NammaQA team")}
              {renderTextArea("Feedback", "Enter feedback or additional comments")}
            </div>
          </div>

          {/* Resume Upload Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Resume Upload</h2>
            <div style={styles.inputGroupFull}>
              <label htmlFor="Upload Resume" style={styles.label}>
                Upload Resume
              </label>
              <input
                type="file"
                id="Upload Resume"
                name="Upload Resume"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleInputChange("Upload Resume", e)}
                onBlur={() => handleBlur("Upload Resume")}
                style={{
                  ...styles.fileInput,
                  ...(touched["Upload Resume"] && formErrors["Upload Resume"] ? styles.inputError : {})
                }}
              />
              <p style={styles.helpText}>Accepted formats: PDF, DOC, DOCX (Max size: 5MB)</p>
              {formData["Upload Resume"] && typeof formData["Upload Resume"] === "string" && (
                <div style={{ marginTop: 8 }}>
                  <a
                    href={formData["Upload Resume"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#003366',
                      textDecoration: 'underline',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    📄 View Current Resume
                  </a>
                </div>
              )}
              {renderError("Upload Resume")}
            </div>
          </div>

          {/* Submit and Back Buttons */}
          <div style={styles.buttonContainer}>
            <button type="submit" style={styles.submitButton}>
              💾 Update Candidate
            </button>
            <button type="button" onClick={handleBack} style={styles.clearButton}>
              ← Back to List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden'
  },
  header: {
    backgroundColor: '#003366',
    color: '#ffffff',
    padding: '32px 40px',
    borderBottom: '4px solid #0055a5'
  },
  heading: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '600',
    letterSpacing: '-0.5px'
  },
  subheading: {
    margin: 0,
    fontSize: '14px',
    color: '#e0e7ff',
    fontWeight: '400'
  },
  section: {
    padding: '32px 40px',
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 0,
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  inputGroupFull: {
    display: 'flex',
    flexDirection: 'column',
    gridColumn: '1 / -1'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center'
  },
  required: {
    color: '#dc2626',
    marginLeft: '2px'
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    outline: 'none'
  },
  select: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    paddingRight: '40px'
  },
  textarea: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    minHeight: '100px'
  },
  fileInput: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  inputReadOnly: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    cursor: 'not-allowed'
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2'
  },
  error: {
    color: '#dc2626',
    fontSize: '13px',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500'
  },
  helpText: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '6px',
    fontStyle: 'italic'
  },
  buttonContainer: {
    padding: '32px 40px',
    backgroundColor: '#f9fafb',
    display: 'flex',
    justifyContent: 'center',
    gap: '16px'
  },
  submitButton: {
    padding: '14px 48px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#003366',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 51, 102, 0.2)'
  },
  clearButton: {
    padding: '14px 48px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#ffffff',
    color: '#6b7280',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default CandidateEditForm;
