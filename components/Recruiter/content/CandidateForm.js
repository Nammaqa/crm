'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

const CandidateForm = () => {
  const [hasOffer, setHasOffer] = useState('No');
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [companyIds, setCompanyIds] = useState([]);
  const [userName, setUserName] = useState(""); // For Updated By
  const router = useRouter();

  // Fetch logged-in user name (same as Overview.js)
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

  const handleInputChange = (field, value) => {
    if (field === "Upload Resume") {
      setFormData({ ...formData, [field]: value.target.files[0] });
    } else {
      setFormData({ ...formData, [field]: value });
      if (field === 'Offers Any') setHasOffer(value);
    }
    setFormErrors(prev => ({ ...prev, [field]: null })); // Clear error on change
  };

  // Validation function for all fields
  const validateForm = () => {
    const errors = {};

    // Phone number validation
    const phonePattern = /^[6-9]\d{9}$/;
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Required fields based on Prisma schema (non-nullable)
    if (!formData["Name"] || !formData["Name"].trim())
      errors["Name"] = "Name is required";

    if (!formData["Contact Number"] || !formData["Contact Number"].trim())
      errors["Contact Number"] = "Contact Number is required";
    else if (!/^\d+$/.test(formData["Contact Number"]))
      errors["Contact Number"] = "Contact Number must contain only numbers";
    else if (!phonePattern.test(formData["Contact Number"]))
      errors["Contact Number"] = "Contact Number must start with 6-9 and be 10 digits";

    if (formData["Alternate Contact Number"] && formData["Alternate Contact Number"].trim()) {
      if (!/^\d+$/.test(formData["Alternate Contact Number"]))
        errors["Alternate Contact Number"] = "Alternate Contact Number must contain only numbers";
      else if (!phonePattern.test(formData["Alternate Contact Number"]))
        errors["Alternate Contact Number"] = "Alternate Contact Number must start with 6-9 and be 10 digits";
    }

    if (!formData["Email ID"] || !formData["Email ID"].trim())
      errors["Email ID"] = "Email ID is required";
    else if (!emailPattern.test(formData["Email ID"]))
      errors["Email ID"] = "Enter a valid email address (must contain @ and .)";

    if (!formData["Technical Skills"] || !formData["Technical Skills"].trim())
      errors["Technical Skills"] = "Technical Skills are required";

    if (!formData["Relavant Experience"] || !formData["Relavant Experience"].trim())
      errors["Relavant Experience"] = "Relevant Experience is required";

    if (!formData["Upload Resume"])
      errors["Upload Resume"] = "Resume is required";

    // You can add more required field checks here as per your business logic

    // Example: If Offers Any is Yes, Offer Details is required
    if (formData["Offers Any"] === "Yes" && (!formData["Offer Details"] || !formData["Offer Details"].trim())) {
      errors["Offer Details"] = "Offer Details are required when Offers Any is Yes";
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

  // Fetch company IDs for Demand Code dropdown
  useEffect(() => {
    async function fetchCompanyIds() {
      try {
        const res = await fetch("/api/company-ids");
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
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
        alert('Candidate submitted!');
        setFormData({});
        setHasOffer('No');
        fetchCandidates();
      } else {
        alert('Error submitting candidate');
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleBack = () => {
    router.push('/recruiter');  
  };

  const fields = [
    "Name",
    "Contact Number",
    "Alternate Contact Number", 
    "Email ID",
    "Sourced From",
    "Employment Type",
    "Domain Experience (Primary)",
    "Current / Previous Company",
    "Role",
    "Current CTC (In LPA)",
    "Expected CTC (In LPA)",
    "Current Working Status",
    "Notice Period (In Days)",
    "Current Location (Nearest City)",
    "Ready to Relocate for Other Location",
    "Prefered Location (City)",
    "Availability for the Interview",
    "Client Name",
    "Demand Code",
    "Updated By",
    "Offers Any",
    "Technical Skills",
    "Relavant Experience",
    "Relevant Experience in Primary Skill",
    "Relevant Experience in Secondary Skill",
    "NammaQA update", 
    "Feedback",
    "Upload Resume"
    // "Interview taken by",
    // "Status",
    // "Follow Ups", 
  ];

  const statusOptions = [
    "Screened",
    "Not Screened",
    "Internal Screening Rejected",
    "Internal Screening Selected",
    "L1 Accepted",
    "L1 Rejected",
    "L2 Accepted",
    "L2 Rejected",
    "Offer Accepted",
    "Didn't Accept Offer"
  ];

  const renderError = (field) => {
    return formErrors[field] && (
      <span style={styles.error}>{formErrors[field]}</span>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Candidate Information Form</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        {fields.map((field, index) => {
          const isTextAreaField = field.toLowerCase().includes('skill');
          const isFileField = field === "Upload Resume";
          const isNumberField = field === "Contact Number" || field === "Alternate Contact Number" || field === "Current CTC (In LPA)" || field === "Expected CTC (In LPA)" || field === "Notice Period (In Days)";
          const isDropdownField = field === "Offers Any";
          const isStatusField = field === "Status";
          const isDemandCodeField = field === "Demand Code";

          // Updated By: show as read-only and auto-filled
          if (field === "Updated By") {
            return (
              <div key={index} style={styles.inputGroup}>
                <label htmlFor={field} style={styles.label}>{field}</label>
                <input
                  type="text"
                  id={field}
                  name={field}
                  style={{ ...styles.input, backgroundColor: '#eee', color: '#888', cursor: 'not-allowed' }}
                  value={userName}
                  readOnly
                  tabIndex={-1}
                />
                {renderError(field)}
              </div>
            );
          }

          // Sourced From: dropdown
          if (field === "Sourced From") {
            return (
              <div key={index} style={styles.inputGroup}>
                <label htmlFor={field} style={styles.label}>{field}</label>
                <select
                  id={field}
                  name={field}
                  style={styles.input}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  value={formData[field] || ''}
                >
                  <option value="">Select Source</option>
                  {sourcedFromOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {renderError(field)}
              </div>
            );
          }

          // Employment Type: dropdown
          if (field === "Employment Type") {
            return (
              <div key={index} style={styles.inputGroup}>
                <label htmlFor={field} style={styles.label}>{field}</label>
                <select
                  id={field}
                  name={field}
                  style={styles.input}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  value={formData[field] || ''}
                >
                  <option value="">Select Employment Type</option>
                  {employmentTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {renderError(field)}
              </div>
            );
          }

          // Ready to Relocate for Other Location: dropdown
          if (field === "Ready to Relocate for Other Location") {
            return (
              <div key={index} style={styles.inputGroup}>
                <label htmlFor={field} style={styles.label}>{field}</label>
                <select
                  id={field}
                  name={field}
                  style={styles.input}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  value={formData[field] || ''}
                >
                  <option value="">Select Option</option>
                  {relocateOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {renderError(field)}
              </div>
            );
          }

          return (
            <div key={index} style={styles.inputGroup}>
              <label htmlFor={field} style={styles.label}>{field}</label>
              {isDropdownField ? (
                <select
                  id={field}
                  name={field}
                  style={styles.input}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  value={formData[field] || ''}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              ) : isStatusField ? (
                <select
                  id={field}
                  name={field}
                  style={styles.input}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  value={formData[field] || ''}
                >
                  <option value="">Select Status</option>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : isDemandCodeField ? (
                <select
                  id={field}
                  name={field}
                  style={styles.input}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  value={formData[field] || ''}
                >
                  <option value="">Select Demand Code</option>
                  {companyIds.length === 0 && (
                    <option disabled value="">No Company IDs</option>
                  )}
                  {companyIds.map(id => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              ) : isFileField ? (
                <input
                  type="file"
                  id={field}
                  name={field}
                  onChange={(e) => handleInputChange(field, e)}
                  style={styles.input}
                />
              ) : isTextAreaField ? (
                <textarea
                  id={field}
                  name={field}
                  rows="3"
                  style={styles.textarea}
                  placeholder={`Enter ${field}`}
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                />
              ) : isNumberField ? (
                <input
                  type="number"
                  id={field}
                  name={field}
                  style={styles.input}
                  placeholder={`Enter ${field}`}
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  id={field}
                  name={field}
                  style={styles.input}
                  placeholder={`Enter ${field}`}
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                />
              )}
              {renderError(field)}
            </div>
          );
        })}

        {hasOffer === 'Yes' && (
          <div style={styles.inputGroup}>
            <label htmlFor="Offer Details" style={styles.label}>Offer Details</label>
            <input
              type="text"
              id="Offer Details"
              name="Offer Details"
              placeholder="Enter offer details"
              style={styles.input}
              value={formData['Offer Details'] || ''}
              onChange={(e) => handleInputChange('Offer Details', e.target.value)}
            />
            {formErrors["Offer Details"] && (
              <span style={styles.error}>{formErrors["Offer Details"]}</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', marginTop: '30px' }}>
          <button type="submit" style={styles.button}>Submit</button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px'
  },
  inputGroup: {
    flex: '1 1 45%',
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '6px',
    fontWeight: 'bold'
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #ccc'
  },
  textarea: {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    resize: 'vertical'
  },
  button: {
    padding: '12px 20px',
    fontSize: '16px',
    backgroundColor: '#003366',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',    
    cursor: 'pointer'
  },
  error: {
    color: 'red',
    fontSize: '13px',
    marginTop: '4px'
  }
};

export default CandidateForm;

//this code is a React component for a candidate form that includes various fields, validation, and submission logic. It uses hooks to manage state and effects, and it provides a user-friendly interface for recruiters to input candidate information. The form includes error handling and dynamic field rendering based on the candidate's input.