import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CandidateList() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetch('/api/candidates')
      .then((res) => res.json())
      .then(setCandidates)
      .catch((err) => console.error('Fetch error:', err));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCandidates((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert('Failed to delete candidate');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Submitted Candidates</h2>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
        <thead>
            <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Contact No</th>
            <th style={styles.th}>YOE</th>
            <th style={styles.th}>Skills</th>
            <th style={styles.th}>Current CTC</th>
            <th style={styles.th}>Expected CTC</th>
            <th style={styles.th}>Notice</th>
            <th style={styles.th}>Screening Status</th>
            <th style={styles.th}>Screening By</th>
            <th style={styles.th}>Availability</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Client Name</th>
            <th style={styles.th}>Added On</th>
            <th style={styles.th}>Actions</th>
            </tr>
        </thead>
        <tbody>
            {candidates.map((c) => (
            <tr key={c.id}>
                <td style={styles.td}>{c.name}</td>
                <td style={styles.td}>{c.contactNumber}</td>
                <td style={styles.td}>{c.relevantExperience}</td>
                <td style={styles.td}>{c.technicalSkills}</td>
                <td style={styles.td}>{c.currentCTC}</td>
                <td style={styles.td}>{c.expectedCTC}</td>
                <td style={styles.td}>{c.noticePeriod}</td>
                <td style={styles.td}>{c.screeningComment}</td>
                <td style={styles.td}>{c.updatedBy}</td>
                <td style={styles.td}>{c.interviewAvailability}</td>
                <td style={styles.td}>{c.location}</td>
                <td style={styles.td}>{c.clientName}</td>
                <td style={styles.td}>{new Date(c.createdAt).toISOString().split('T')[0]}</td>
                <td style={{ ...styles.td, ...styles.actions }}>
                <Link href={`/recruiter/${c.id}`}>
                    <button style={styles.editBtn}>Edit</button>
                </Link>
                <button style={styles.deleteBtn} onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
            </tr>
            ))}
        </tbody>
        </table>

      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    backgroundColor: '#f4f6f8',
    fontFamily: 'Segoe UI, sans-serif',
  },
  heading: {
    textAlign: 'center',
    fontSize: '26px',
    color: '#003366',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    border: '1px solid #ccc', // outer border
  },
  th: {
    border: '1px solid #ccc',
    padding: '10px',
    backgroundColor: '#f1f5f9',
    fontWeight: '600',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  td: {
    border: '1px solid #ccc',
    padding: '10px',
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    gap: '6px',
  },
  addButton: {
    padding: '12px 24px',
    backgroundColor: '#003366',
    color: '#fff',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  editBtn: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
  }
};
