'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularProgress from '@/components/CircularIndeterminate';

const sourcedFromOptions = [
  "LinkedIn", "Walk-in","Email","Naukri","Glassdoor","Foundit","CutShort","Indeed","Shine","Others"
];

const employmentTypeOptions = [
  "Permanent","Contract","C2H (Contract to Hire)"
];

const relocateOptions = [
  "Yes",
  "No"
];

const statusOptions = [
  "Screened","Not Screened","Internal Screening Rejected","Internal Screening Selected","L1 Accepted","L1 Rejected",
  "L2 Accepted",
  "L2 Rejected",
  "Offer Accepted",
  "Didn't Accept Offer"
];

const CandidateForm = () => {
  const [hasOffer, setHasOffer] = useState('No');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    "Offers Any": "No"
  });
  const [formErrors, setFormErrors] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [companyIds, setCompanyIds] = useState([]);
  const [userName, setUserName] = useState("");
  const [touched, setTouched] = useState({});
  const [demandCodes, setDemandCodes] = useState([]);
  const [currentDemandCode, setCurrentDemandCode] = useState({
    demandCode: "",
    status: "",
    feedback: "",
    clientInterviewStatus: ""
  });
  const router = useRouter();

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success && resJson.data) {
          setUserName(resJson.data.userName);
          setFormData(prev => ({ ...prev, "Updated By": resJson.data.userName }));
        }
      })
      .catch((err) => console.error("Failed to load user info", err));
  }, []);

  // Auto-save demand code when fields are filled
  useEffect(() => {
    if (currentDemandCode.demandCode && currentDemandCode.demandCode.trim()) {
      const existingIndex = demandCodes.findIndex(
        dc => dc.demandCode === currentDemandCode.demandCode
      );

      if (existingIndex >= 0) {
        setDemandCodes(prev => prev.map((dc, idx) => 
          idx === existingIndex ? { ...currentDemandCode, id: dc.id } : dc
        ));
      } else {
        const newAssignment = {
          id: Date.now(),
          ...currentDemandCode
        };
        setDemandCodes(prev => [...prev, newAssignment]);
      }
    }
  }, [currentDemandCode]);

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

  const handleDemandCodeChange = (field, value) => {
    setCurrentDemandCode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errors = validateField(field, formData[field]);
    if (errors) {
      setFormErrors(prev => ({ ...prev, [field]: errors }));
    }
  };

  const handleClearForm = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all form fields? This action cannot be undone."
    );
    
    if (confirmClear) {
      setFormData({ "Offers Any": "No", "Updated By": userName });
      setHasOffer('No');
      setDemandCodes([]);
      setCurrentDemandCode({
        demandCode: "",
        status: "",
        feedback: "",
        clientInterviewStatus: ""
      });
      setTouched({});
      setFormErrors({});
      
      const fileInput = document.getElementById("Upload Resume");
      if (fileInput) {
        fileInput.value = "";
      }
      
      alert("Form cleared successfully");
    }
  };

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
        if (!value) return "Resume is required";
        if (value instanceof File) {
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
      "Upload Resume",
      "Sourced From",
      "Employment Type"
    ];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    if (formData["Offers Any"] === "Yes") {
      const offerError = validateField("Offer Details", formData["Offer Details"]);
      if (offerError) errors["Offer Details"] = offerError;
    }

    if (demandCodes.length === 0) {
      errors["Demand Code"] = "Please add at least one demand code assignment";
    }

    return errors;
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/candidates');
      const data = await res.json();
      setCandidates(data);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  const removeDemandCode = (demandCodeValue) => {
    setDemandCodes(demandCodes.filter(dc => dc.demandCode !== demandCodeValue));
    
    if (currentDemandCode.demandCode === demandCodeValue) {
      setCurrentDemandCode({
        demandCode: "",
        status: "",
        feedback: "",
        clientInterviewStatus: ""
      });
    }
  };

  const editDemandCode = (demandCodeValue) => {
    const dcToEdit = demandCodes.find(dc => dc.demandCode === demandCodeValue);
    if (dcToEdit) {
      setCurrentDemandCode({
        demandCode: dcToEdit.demandCode,
        status: dcToEdit.status,
        feedback: dcToEdit.feedback,
        clientInterviewStatus: dcToEdit.clientInterviewStatus
      });
    }
  };

  const clearCurrentDemandCode = () => {
    setCurrentDemandCode({
      demandCode: "",
      status: "",
      feedback: "",
      clientInterviewStatus: ""
    });
  };

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
    fetchCandidates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allFields = [
      "Name", "Contact Number", "Alternate Contact Number", "Email ID",
      "Sourced From", "Employment Type", "Domain Experience (Primary)",
      "Current / Previous Company", "Role", "Current CTC (In LPA)",
      "Expected CTC (In LPA)", "Current Working Status", "Notice Period (In Days)",
      "Current Location (Nearest City)", "Ready to Relocate for Other Location",
      "Prefered Location (City)", "Availability for the Interview", "Client Name",
      "Updated By", "Offers Any", "Technical Skills", "Secondary Skill",
      "Relavant Experience", "Relevant Experience in Primary Skill",
      "Relevant Experience in Secondary Skill", "NammaQA update", "Feedback",
      "LinkedIn Profile", "Other Links", "Upload Resume"
    ];
    const touchedFields = {};
    allFields.forEach(field => touchedFields[field] = true);
    setTouched(touchedFields);

    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      alert('Please fix all validation errors before submitting');
      return;
    }

    if (demandCodes.length === 0) {
      alert('Please add at least one demand code');
      return;
    }

    setIsSubmitting(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "Upload Resume" && value instanceof File) {
          form.append(key, value);
        } else {
          form.append(key, value ?? "");
        }
      });

      const res = await fetch('/api/candidates', {
        method: 'POST',
        body: form
      });

      if (res.ok) {
        const candidateData = await res.json();
        
        for (const dc of demandCodes) {
          await fetch('/api/demand-code-assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateId: candidateData.id,
              demandCode: dc.demandCode,
              status: dc.status || null,
              feedback: dc.feedback || null,
              clientInterviewStatus: dc.clientInterviewStatus || null,
              updatedBy: userName
            })
          });
        }

        alert('Candidate submitted successfully!');
        setFormData({ "Offers Any": "No", "Updated By": userName });
        setHasOffer('No');
        setDemandCodes([]);
        setCurrentDemandCode({
          demandCode: "",
          status: "",
          feedback: "",
          clientInterviewStatus: ""
        });
        setTouched({});
        setFormErrors({});
        
        const fileInput = document.getElementById("Upload Resume");
        if (fileInput) {
          fileInput.value = "";
        }
        
        fetchCandidates();
      } else {
        alert('Error submitting candidate. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        {["Name", "Contact Number", "Email ID", "Technical Skills", "Relavant Experience", "Upload Resume", "Sourced From", "Employment Type"].includes(field) && 
          <span style={styles.required}> *</span>
        }
      </label>
      <input
        type={type}
        id={field}
        name={field}
        style={{
          ...styles.input,
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

  const renderTextArea = (field, placeholder) => (
    <div style={styles.inputGroupFull}>
      <label htmlFor={field} style={styles.label}>
        {field}
        {["Technical Skills"].includes(field) && <span style={styles.required}> *</span>}
      </label>
      <textarea
        id={field}
        name={field}
        rows="3"
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
          <h1 style={styles.heading}>Candidate Information Form</h1>
          <p style={styles.subheading}>Please fill in all required fields marked with *</p>
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

          {/* Professional Links Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Professional Links</h2>
            <div style={styles.formGrid}>
              {renderInput("LinkedIn Profile", "https://linkedin.com/in/yourprofile", "url")}
              {renderInput("Other Links", "GitHub, Portfolio, etc. (comma separated)", "text")}
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
            <h2 style={styles.sectionTitle}>Requirement & Demand Code Assignments</h2>
            
            {/* Add/Edit Demand Code Form */}
            <div style={{ ...styles.formGrid, marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={styles.inputGroup}>
                <label htmlFor="Demand Code" style={styles.label}>
                  Demand Code<span style={styles.required}> *</span>
                </label>
                <select
                  id="Demand Code"
                  name="Demand Code"
                  style={styles.select}
                  onChange={(e) => handleDemandCodeChange("demandCode", e.target.value)}
                  value={currentDemandCode.demandCode || ''}
                >
                  <option value="">Select requirement code</option>
                  {companyIds.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <p style={styles.helpText}>Auto-saves when you select a code</p>
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="Status" style={styles.label}>Status</label>
                <select
                  id="Status"
                  name="Status"
                  style={styles.select}
                  onChange={(e) => handleDemandCodeChange("status", e.target.value)}
                  value={currentDemandCode.status || ''}
                  disabled={!currentDemandCode.demandCode}
                >
                  <option value="">Select status</option>
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="Client Interview Status" style={styles.label}>Client Interview Status</label>
                <input
                  type="text"
                  id="Client Interview Status"
                  name="Client Interview Status"
                  style={styles.input}
                  placeholder="e.g., Pending, Completed, Selected"
                  value={currentDemandCode.clientInterviewStatus || ''}
                  onChange={(e) => handleDemandCodeChange("clientInterviewStatus", e.target.value)}
                  disabled={!currentDemandCode.demandCode}
                />
              </div>

              <div style={styles.inputGroupFull}>
                <label htmlFor="Feedback" style={styles.label}>Feedback</label>
                <textarea
                  id="Feedback"
                  name="Feedback"
                  rows="2"
                  style={styles.textarea}
                  placeholder="Enter feedback for this demand code"
                  value={currentDemandCode.feedback || ''}
                  onChange={(e) => handleDemandCodeChange("feedback", e.target.value)}
                  disabled={!currentDemandCode.demandCode}
                />
              </div>

              {currentDemandCode.demandCode && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <button
                    type="button"
                    onClick={clearCurrentDemandCode}
                    style={styles.clearDemandButton}
                  >
                    Clear to Add Another
                  </button>
                </div>
              )}
            </div>

            {/* Display Added Demand Codes */}
            {demandCodes.length > 0 && (
              <div style={styles.demandCodesList}>
                <h3 style={styles.listTitle}>Added Demand Code Assignments ({demandCodes.length})</h3>
                {demandCodes.map((dc) => (
                  <div key={dc.id} style={styles.demandCodeItem}>
                    <div style={styles.demandCodeHeader}>
                      <div>
                        <p style={styles.demandCodeLabel}><strong>Demand Code:</strong> {dc.demandCode}</p>
                        {dc.status && <p style={styles.demandCodeLabel}><strong>Status:</strong> {dc.status}</p>}
                        {dc.clientInterviewStatus && <p style={styles.demandCodeLabel}><strong>Interview Status:</strong> {dc.clientInterviewStatus}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => editDemandCode(dc.demandCode)}
                          style={styles.editButton}
                          title="Edit this assignment"
                        >
                          ✎ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDemandCode(dc.demandCode)}
                          style={styles.removeButton}
                          title="Remove this assignment"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                    {dc.feedback && (
                      <p style={styles.demandCodeFeedback}><strong>Feedback:</strong> {dc.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {formErrors["Demand Code"] && (
              <span style={{ ...styles.error, gridColumn: '1 / -1', marginBottom: '12px' }}>{formErrors["Demand Code"]}</span>
            )}

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label htmlFor="Client Name" style={styles.label}>Client Name</label>
                <input
                  type="text"
                  id="Client Name"
                  name="Client Name"
                  style={styles.input}
                  placeholder="Enter client name"
                  value={formData["Client Name"] || ''}
                  onChange={(e) => handleInputChange("Client Name", e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="Updated By" style={styles.label}>Updated By</label>
                <input
                  type="text"
                  id="Updated By"
                  name="Updated By"
                  style={styles.inputReadOnly}
                  value={userName}
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
              {renderTextArea("NammaQA update", "Enter any updates or notes from NammaQA team")}
              {renderTextArea("Feedback", "Enter feedback or additional comments")}
            </div>
          </div>

          {/* Resume Upload Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Resume Upload</h2>
            <div style={styles.inputGroupFull}>
              <label htmlFor="Upload Resume" style={styles.label}>
                Upload Resume<span style={styles.required}> *</span>
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
              {renderError("Upload Resume")}
            </div>
          </div>

          {/* Submit and Clear Buttons */}
          <div style={styles.buttonContainer}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                ...(isSubmitting ? styles.submitButtonDisabled : {})
              }}
            >
              {isSubmitting ? (
                <div style={styles.buttonContent}>
                  <CircularProgress />
                  <span style={styles.loadingText}>Submitting...</span>
                </div>
              ) : (
                'Submit Candidate'
              )}
            </button>
            <button 
              type="button" 
              onClick={handleClearForm}
              disabled={isSubmitting}
              style={{
                ...styles.clearButton,
                ...(isSubmitting ? styles.clearButtonDisabled : {})
              }}
            >
              Clear Form
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
    backgroundColor: '#f8f9fa',
    padding: '0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  header: {
    backgroundColor: '#003366',
    color: '#ffffff',
    padding: '20px 24px',
    borderBottom: '3px solid #0055a5'
  },
  heading: {
    margin: '0 0 4px 0',
    fontSize: '22px',
    fontWeight: '600',
    letterSpacing: '-0.3px'
  },
  subheading: {
    margin: 0,
    fontSize: '13px',
    color: '#e0e7ff',
    fontWeight: '400'
  },
  section: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 0,
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #e5e7eb'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
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
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center'
  },
  required: {
    color: '#dc2626',
    marginLeft: '2px'
  },
  input: {
    padding: '9px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    outline: 'none'
  },
  select: {
    padding: '9px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px'
  },
  textarea: {
    padding: '9px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    minHeight: '70px'
  },
  fileInput: {
    padding: '9px 12px',
    fontSize: '14px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  inputReadOnly: {
    padding: '9px 12px',
    fontSize: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
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
    fontSize: '12px',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500'
  },
  helpText: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    fontStyle: 'italic'
  },
  buttonContainer: {
    padding: '20px 24px',
    backgroundColor: '#f9fafb',
    display: 'flex',
    justifyContent: 'center',
    gap: '12px'
  },
  submitButton: {
    padding: '10px 32px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#003366',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px rgba(0, 51, 102, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.6,
    boxShadow: 'none'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  loadingText: {
    marginLeft: '8px'
  },
  clearButton: {
    padding: '10px 32px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#ffffff',
    color: '#6b7280',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  clearButtonDisabled: {
    backgroundColor: '#f9fafb',
    cursor: 'not-allowed',
    opacity: 0.6,
    borderColor: '#e5e7eb'
  },
  clearDemandButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '4px'
  },
  demandCodesList: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f0fdf4',
    borderRadius: '6px',
    border: '1px solid #bbf7d0'
  },
  listTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 0,
    marginBottom: '12px'
  },
  demandCodeItem: {
    backgroundColor: '#ffffff',
    padding: '10px 12px',
    borderRadius: '5px',
    marginBottom: '10px',
    border: '1px solid #d1d5db',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
  },
  demandCodeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '6px'
  },
  demandCodeLabel: {
    margin: '0 0 4px 0',
    fontSize: '13px',
    color: '#374151',
    fontWeight: '500'
  },
  demandCodeFeedback: {
    margin: '6px 0 0 0',
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic'
  },
  editButton: {
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  removeButton: {
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  }
};

export default CandidateForm;
