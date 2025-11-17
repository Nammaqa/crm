'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';

const sourcedFromOptions = [
  "LinkedIn", "Walk-in", "Email", "Naukri", "Glassdoor",
  "Foundit", "CutShort", "Indeed", "Shine", "Others"
];

const employmentTypeOptions = [
  "Permanent", "Contract-based", "C2H (Contract to Hire)"
];

const relocateOptions = ["Yes", "No"];

const CandidateForm = () => {
  const [hasOffer, setHasOffer] = useState('No');
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [companyIds, setCompanyIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleInputChange = (field, value) => {
    if (field === "Upload Resume") {
      setFormData({ ...formData, [field]: value.target.files[0] });
    } else {
      setFormData({ ...formData, [field]: value });
      if (field === 'Offers Any') setHasOffer(value);
    }
    setFormErrors({ ...formErrors, [field]: null });
  };

  const validateForm = () => {
    const errors = {};
    const phonePattern = /^[6-9]\d{9}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData["Name"]) errors["Name"] = "Name is required";
    if (!formData["Contact Number"] || !phonePattern.test(formData["Contact Number"]))
      errors["Contact Number"] = "Enter a valid 10-digit phone number starting with 6-9";

    if (formData["Alternate Contact Number"] &&
      !phonePattern.test(formData["Alternate Contact Number"]))
      errors["Alternate Contact Number"] = "Alternate number must be 10 digits starting with 6-9";

    if (!formData["Email ID"] || !emailPattern.test(formData["Email ID"]))
      errors["Email ID"] = "Enter a valid email address";

    if (!formData["Upload Resume"])
      errors["Upload Resume"] = "Resume is required";

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

  useEffect(() => {
    async function fetchCompanyIds() {
      try {
        const res = await fetch("/api/company-idss ");
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

    setIsSubmitting(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value ?? "");
      });

      const res = await fetch('/api/candidates', {
        method: 'POST',
        body: form
      });

      if (res.ok) {
        alert('Candidate submitted successfully!');
        setFormData({});
        setHasOffer('No');
        fetchCandidates();
      } else {
        alert('Error submitting candidate');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    "Name", "Contact Number", "Alternate Contact Number", "Email ID",
    "Sourced From", "Employment Type", "Domain Experience (Primary)",
    "Current / Previous Company", "Role", // "Current CTC (In LPA)",
    // "Expected CTC (In LPA)", 
    "Current Working Status", "Notice Period (In Days)",
    "Current Location (Nearest City)", "Ready to Relocate for Other Location",
    "Prefered Location (City)", "Availability for the Interview", "Client Name",
    "Demand Code", "Interview taken by", "Comments", "Status", "Follow Ups",
    "Updated By", "Offers Any", "Screening Comment (L2)", "Technical Skills", "Secondary Skill",
    "Relavant Experience", "Relevant Experience in Primary Skill",
    "Relevant Experience in Secondary Skill", "NammaQA update", "Feedback",
    "LinkedIn Profile", "Other Links", "Upload Resume"
  ];

  const statusOptions = [
    "Screened", "Not Screened", "Internal Screening Rejected",
    "Internal Screening Selected", "L1 Accepted", "L1 Rejected",
    "L2 Accepted", "L2 Rejected", "Offer Accepted", "Didn't Accept Offer"
  ];

  const renderError = (field) => {
    return formErrors[field] && (
      <span style={styles.error}>{formErrors[field]}</span>
    );
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.heading}>Candidate Information Form</h1>
          <p style={styles.subheading}>Please fill in all required fields marked with an asterisk (*)</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {fields.map((field, index) => {
            const isTextAreaField = field.toLowerCase().includes('skill') || field.toLowerCase().includes('comment') || field === 'Feedback';
            const isFileField = field === "Upload Resume";
            const isNumberField = field === "Contact Number" || field === "Alternate Contact Number" /* || field === "Current CTC (In LPA)" || field === "Expected CTC (In LPA)" */ || field === "Notice Period (In Days)";
            const isDropdownField = field === "Offers Any";
            const isStatusField = field === "Status";
            const isDemandCodeField = field === "Demand Code";
            const isRequired = ["Name", "Contact Number", "Email ID", "Upload Resume"].includes(field);

            if (field === "Sourced From") {
              return (
                <div key={index} style={styles.inputGroup}>
                  <label htmlFor={field} style={styles.label}>
                    {field}
                  </label>
                  <select 
                    id={field} 
                    name={field} 
                    style={formErrors[field] ? {...styles.input, ...styles.inputError} : styles.input}
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

            if (field === "Employment Type") {
              return (
                <div key={index} style={styles.inputGroup}>
                  <label htmlFor={field} style={styles.label}>
                    {field}
                  </label>
                  <select 
                    id={field} 
                    name={field} 
                    style={formErrors[field] ? {...styles.input, ...styles.inputError} : styles.input}
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

            if (field === "Ready to Relocate for Other Location") {
              return (
                <div key={index} style={styles.inputGroup}>
                  <label htmlFor={field} style={styles.label}>
                    {field}
                  </label>
                  <select 
                    id={field} 
                    name={field} 
                    style={formErrors[field] ? {...styles.input, ...styles.inputError} : styles.input}
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
                <label htmlFor={field} style={styles.label}>
                  {field}{isRequired && <span style={styles.required}> *</span>}
                </label>
                {isDropdownField ? (
                  <select 
                    id={field} 
                    name={field} 
                    style={formErrors[field] ? {...styles.input, ...styles.inputError} : styles.input}
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
                    style={formErrors[field] ? {...styles.input, ...styles.inputError} : styles.input}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    value={formData[field] || ''}
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : isDemandCodeField ? (
                  <select 
                    id={field} 
                    name={field} 
                    style={formErrors[field] ? {...styles.input, ...styles.inputError} : styles.input}
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
                  <div>
                    <input 
                      type="file" 
                      id={field} 
                      name={field}
                      onChange={(e) => handleInputChange(field, e)}
                      style={styles.fileInput}
                      accept=".pdf,.doc,.docx"
                    />
                    {formData[field] && (
                      <div style={styles.fileInfo}>
                        Selected: {formData[field].name}
                      </div>
                    )}
                  </div>
                ) : isTextAreaField ? (
                  <textarea 
                    id={field} 
                    name={field} 
                    rows="4" 
                    style={formErrors[field] ? {...styles.textarea, ...styles.inputError} : styles.textarea}
                    placeholder={`Enter ${field}`} 
                    value={formData[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                  />
                ) : isNumberField ? (
                  <input 
                    type="number" 
                    id={field} 
                    name={field} 
                    style={formErrors[field] ? {...styles.input, ...styles.inputError} : styles.input}
                    placeholder={`Enter ${field}`} 
                    value={formData[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    min="0"
                    step={field.includes("CTC") ? "0.1" : "1"}
                  />
                ) : (
                  <input 
                    type="text" 
                    id={field} 
                    name={field} 
                    style={formErrors[field] ? {...styles.input, ...styles.inputError} : styles.input}
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
              <textarea
                id="Offer Details" 
                name="Offer Details"
                placeholder="Enter offer details"
                rows="3"
                style={styles.textarea}
                value={formData['Offer Details'] || ''}
                onChange={(e) => handleInputChange('Offer Details', e.target.value)}
              />
            </div>
          )}

          <div style={styles.buttonContainer}>
            <button 
              type="submit" 
              style={isSubmitting ? {...styles.button, ...styles.buttonDisabled} : styles.button}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} style={styles.spinner} />
                  <span style={styles.buttonText}>Submitting...</span>
                </>
              ) : (
                'Submit Candidate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '40px 20px',
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica', sans-serif"
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden'
  },
  header: {
    background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
    padding: '40px 50px',
    color: '#ffffff',
    borderBottom: '4px solid #002244'
  },
  heading: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-0.5px'
  },
  subheading: {
    margin: 0,
    fontSize: '15px',
    opacity: 0.9,
    fontWeight: '400'
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '28px',
    padding: '50px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '2px',
    letterSpacing: '0.2px'
  },
  required: {
    color: '#e53e3e',
    fontWeight: '700'
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '2px solid #e2e8f0',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#2d3748'
  },
  textarea: {
    padding: '12px 16px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '2px solid #e2e8f0',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    color: '#2d3748',
    lineHeight: '1.5'
  },
  inputError: {
    borderColor: '#fc8181',
    backgroundColor: '#fff5f5'
  },
  fileInput: {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '2px dashed #cbd5e0',
    backgroundColor: '#f7fafc',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%'
  },
  fileInfo: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#4a5568',
    fontStyle: 'italic'
  },
  buttonContainer: {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px solid #e2e8f0'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 40px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#003366',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 51, 102, 0.3)',
    minWidth: '220px',
    letterSpacing: '0.3px'
  },
  buttonDisabled: {
    backgroundColor: '#718096',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  spinner: {
    color: '#ffffff'
  },
  buttonText: {
    marginLeft: '4px'
  },
  error: {
    color: '#e53e3e',
    fontSize: '13px',
    marginTop: '4px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center'
  }
};

export default CandidateForm;
