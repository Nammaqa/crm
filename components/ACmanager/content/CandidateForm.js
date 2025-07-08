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
  "Contract-based",
  "C2H (Contract to Hire)"
];

const relocateOptions = [
  "Yes",
  "No"
];

const CandidateForm = () => {
  const [hasOffer, setHasOffer] = useState('No');
  const [formData, setFormData] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [companyIds, setCompanyIds] = useState([]);
  const [selectedDemandCode, setSelectedDemandCode] = useState({});
  const router = useRouter();

  const handleInputChange = (field, value) => {
    if (field === "Upload Resume") {
      setFormData({ ...formData, [field]: value.target.files[0] });
    } else {
      setFormData({ ...formData, [field]: value });
      if (field === 'Offers Any') setHasOffer(value);
    }
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
    "Interview taken by",
    "Comments", 
    "Status",
    "Follow Ups", 
    "Updated By",
    "Offers Any",
    "Screening Comment (L2)",
    "Technical Skills",
    "Relavant Experience",
    "Relevant Experience in Primary Skill",
    "Relevant Experience in Secondary Skill",
    "NammaQA update", 
    // "Client Interview Status",
    "Feedback",
    "Upload Resume"
  ];

  // Status options for the dropbox
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

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Candidate Information Form</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        {fields.map((field, index) => {
          const isTextAreaField = field.toLowerCase().includes('skill');
          const isFileField = field === "Upload Resume";
          const isDropdownField = field === "Offers Any";
          const isStatusField = field === "Status";
          const isDemandCodeField = field === "Demand Code";

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
              ) : (
                <input
                  type="text"
                  id={field}
                  name={field}
                  placeholder={`Enter ${field}`}
                  style={styles.input}
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                />
              )}
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
  }
};

export default CandidateForm;