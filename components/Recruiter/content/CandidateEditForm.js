"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const CandidateEditForm = () => {
  const router = useRouter();
  const { id: candidateId } = useParams(); 
  const [formData, setFormData] = useState({});
  const [hasOffer, setHasOffer] = useState("No");

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
    "Comments": data.comments?.[0] || "",
    "Status": data.status,
    "Follow Ups": data.followUps,
    "Updated By": data.updatedBy,
    "Offers Any": data.offersAny ? "Yes" : "No",
    "Screening Comment (L2)": data.screeningComment,
    "Technical Skills": data.technicalSkills,
    "Relavant Experience": data.relevantExperience,
    "Relevant Experience in Primary Skill": data.primarySkillExp,
    "Relevant Experience in Secondary Skill": data.secondarySkillExp,
    "NammaQA update": data.nammaqaUpdate,
    "Client Interview Status": data.clientInterviewStatus,
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

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (field === "Offers Any") setHasOffer(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    for (const key in formData) {
      if (formData[key]) {
        form.append(key, formData[key]);
      }
    }

    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PUT",
        body: form,
      });

      if (res.ok) {
        alert("✅ Candidate updated successfully!");
        router.push("/recruiter");
      } else {
        alert("❌ Failed to update candidate.");
      }
    } catch (error) {
      console.error("PUT error:", error);
    }
  };


  const fields = [
    "Name", "Contact Number", "Alternate Contact Number", "Email ID", "Sourced From",
    "Employment Type", "Domain Experience (Primary)", "Current / Previous Company", "Role",
    "Current CTC (In LPA)", "Expected CTC (In LPA)", "Current Working Status", "Notice Period (In Days)",
    "Current Location (Nearest City)", "Ready to Relocate for Other Location", "Prefered Location (City)",
    "Availability for the Interview", "Client Name", "Demand Code", "Interview taken by",
    "Comments", "Status", "Follow Ups", "Updated By", "Offers Any",
    "Screening Comment (L2)", "Technical Skills", "Relavant Experience",
    "Relevant Experience in Primary Skill", "Relevant Experience in Secondary Skill",
    "NammaQA update", "Client Interview Status", "Feedback", "Upload Resume"
  ];

  const handleBack = () => {
    router.push('/recruiter');  
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Edit Candidate</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {fields.map((field, index) => {
          const isTextArea = field.toLowerCase().includes("skill");
          const isDropdown = field === "Offers Any";
          const isFile = field === "Upload Resume";

          return (
            <div key={index} style={styles.inputGroup}>
              <label style={styles.label}>{field}</label>
              {isDropdown ? (
                <select
                  value={formData[field] || ""}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  style={styles.input}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              ) : isFile ? (
                <div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleInputChange(field, e.target.files?.[0])}
                    style={styles.input}
                  />
                  {/* Show existing resume link if present */}
                  {formData["Upload Resume"] && typeof formData["Upload Resume"] === "string" && (
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={formData["Upload Resume"]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#003366", textDecoration: "underline", fontSize: "14px" }}
                      >
                        View Current Resume
                      </a>
                    </div>
                  )}
                </div>
              ) : isTextArea ? (
                <textarea
                  value={formData[field] || ""}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  rows={3}
                  style={styles.input}
                />
              ) : (
                <input
                  type="text"
                  value={formData[field] || ""}
                  placeholder={`Enter ${field}`}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  style={styles.input}
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
          <button
            type="submit"
            style={{ ...styles.button, minWidth: '180px', minHeight: '48px' }}
          >
            Update Candidate
          </button>
          <button
            type="button"
            style={{ ...styles.button, backgroundColor: '#888', minWidth: '180px', minHeight: '48px' }}
            onClick={handleBack}
          >
            Back
          </button>
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
    marginTop: '30px',
    padding: '12px 20px',
    fontSize: '16px',
    backgroundColor: '#003366',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

export default CandidateEditForm;