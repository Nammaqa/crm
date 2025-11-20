"use client";
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function AcManagerTable() {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [shortlistDate, setShortlistDate] = useState("");
    const [shortlistTime, setShortlistTime] = useState("");
    const [feedback, setFeedback] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [companyIds, setCompanyIds] = useState([]);
    const [selectedDemandCode, setSelectedDemandCode] = useState({});
    const [userName, setUserName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch logged-in user name
    useEffect(() => {
        fetch("/api/users/me")
            .then((res) => res.json())
            .then((resJson) => {
                if (resJson.success && resJson.data) {
                    setUserName(resJson.data.userName);
                }
            })
            .catch((err) => console.error("Failed to load user info", err));
    }, []);

    // Fetch candidates from API
    useEffect(() => {
        async function fetchCandidates() {
            setIsLoading(true);
            try {
                const res = await fetch("/api/ACmanager");
                const data = await res.json();
                setCandidates(data.filter(c => c.acmanagerStatus !== "Selected" && c.acmanagerStatus !== "Rejected"));
            } catch (err) {
                toast.error("Failed to fetch candidates");
            } finally {
                setIsLoading(false);
            }
        }
        fetchCandidates();
    }, []);

    // Fetch all company IDs from /api/company-ids endpoint
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
    }, []);

    // Calculate pagination
    const totalPages = Math.ceil(candidates.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentCandidates = candidates.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    // Handle rows per page change
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1); // Reset to first page
    };

    // Handle View
    const handleView = (candidate) => {
        setSelectedCandidate(candidate);
        setDialogOpen(true);
    };

    // Handle Shortlist (store as "Selected" and save userName in acupdateby)
    const handleShortlist = async () => {
        if (!shortlistDate || !shortlistTime) {
            toast.error("Please select date and time.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/ACmanager/${selectedCandidate.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    acmanagerStatus: "Selected",
                    demandCode: selectedDemandCode[selectedCandidate.id] || "",
                    acupdateby: userName
                }),
            });
            if (res.ok) {
                toast.success("Candidate Selected!");
                setCandidates(candidates.filter(c => c.id !== selectedCandidate.id));
                handleDialogClose();
            } else {
                toast.error("Failed to update status");
            }
        } catch {
            toast.error("Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Reject (store as "Rejected" and save userName in acupdateby)
    const handleReject = async () => {
        if (!feedback) {
            toast.error("Please provide feedback.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/ACmanager/${selectedCandidate.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    acmanagerStatus: "Rejected",
                    acupdateby: userName
                }),
            });
            if (res.ok) {
                toast.success("Candidate Rejected.");
                setCandidates(candidates.filter(c => c.id !== selectedCandidate.id));
                handleDialogClose();
            } else {
                toast.error("Failed to update status");
            }
        } catch {
            toast.error("Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedCandidate(null);
        setShortlistDate("");
        setShortlistTime("");
        setFeedback("");
    };

    // Handle Demand Code change per candidate
    const handleDemandCodeChange = (candidateId, value) => {
        setSelectedDemandCode(prev => ({
            ...prev,
            [candidateId]: value
        }));
    };

    const getStatusColor = (status) => {
        switch(status) {
            case "Selected": return "#10b981";
            case "Rejected": return "#ef4444";
            default: return "#f59e0b";
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.container}>
                {/* Header Section - Simplified */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.heading}>Pending Candidates</h1>
                        {userName && (
                            <p style={styles.subheading}>Manager: {userName}</p>
                        )}
                    </div>
                </div>

                {/* Table Section */}
                <div style={styles.tableContainer}>
                    {isLoading ? (
                        <div style={styles.loadingContainer}>
                            <CircularProgress size={40} />
                            <p style={styles.loadingText}>Loading candidates...</p>
                        </div>
                    ) : candidates.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p style={styles.emptyText}>No pending candidates found</p>
                        </div>
                    ) : (
                        <>
                            <Table style={styles.table}>
                                <TableHeader>
                                    <TableRow style={styles.tableHeaderRow}>
                                        <TableHead style={styles.tableHead}>ID</TableHead>
                                        <TableHead style={styles.tableHead}>Name</TableHead>
                                        <TableHead style={styles.tableHead}>Company</TableHead>
                                        <TableHead style={styles.tableHead}>Role</TableHead>
                                        <TableHead style={styles.tableHead}>Experience</TableHead>
                                        <TableHead style={styles.tableHead}>Status</TableHead>
                                        <TableHead style={styles.tableHead}>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentCandidates.map((item) => (
                                        <TableRow key={item.id} style={styles.tableRow}>
                                            <TableCell style={styles.tableCell}>{item.id}</TableCell>
                                            <TableCell style={styles.tableCell}>{item.name}</TableCell>
                                            <TableCell style={styles.tableCell}>{item.company || "-"}</TableCell>
                                            <TableCell style={styles.tableCell}>{item.role || "-"}</TableCell>
                                            <TableCell style={styles.tableCell}>
                                                {item.relevantExperience || item.experience || "-"}
                                            </TableCell>
                                            <TableCell style={styles.tableCell}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: `${getStatusColor(item.acmanagerStatus)}15`,
                                                    color: getStatusColor(item.acmanagerStatus)
                                                }}>
                                                    {item.acmanagerStatus || "Pending"}
                                                </span>
                                            </TableCell>
                                            <TableCell style={styles.tableCell}>
                                                <button 
                                                    onClick={() => handleView(item)} 
                                                    style={styles.viewButton}
                                                >
                                                    View Details
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination Controls */}
                            <div style={styles.paginationContainer}>
                                <div style={styles.paginationInfo}>
                                    <label style={styles.rowsPerPageLabel}>
                                        Rows per page:
                                        <select
                                            value={rowsPerPage}
                                            onChange={handleRowsPerPageChange}
                                            style={styles.rowsPerPageSelect}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </label>
                                    <span style={styles.paginationText}>
                                        Showing {startIndex + 1}-{Math.min(endIndex, candidates.length)} of {candidates.length}
                                    </span>
                                </div>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    color="primary"
                                    shape="rounded"
                                    showFirstButton
                                    showLastButton
                                    siblingCount={1}
                                    boundaryCount={1}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Candidate Details Dialog */}
            <Dialog
                open={dialogOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleDialogClose}
                aria-describedby="candidate-details-dialog"
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: styles.dialogPaper
                }}
            >
                <DialogTitle style={styles.dialogTitle}>
                    Candidate Details
                </DialogTitle>
                <DialogContent style={styles.dialogContent}>
                    {selectedCandidate && (
                        <div>
                            {/* Candidate Information Grid */}
                            <div style={styles.infoSection}>
                                <h3 style={styles.sectionTitle}>Personal Information</h3>
                                <div style={styles.infoGrid}>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Name:</span>
                                        <span style={styles.infoValue}>{selectedCandidate.name}</span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Client Name:</span>
                                        <span style={styles.infoValue}>{selectedCandidate.clientName || "-"}</span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Company:</span>
                                        <span style={styles.infoValue}>{selectedCandidate.company || "-"}</span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Role:</span>
                                        <span style={styles.infoValue}>{selectedCandidate.role || "-"}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.infoSection}>
                                <h3 style={styles.sectionTitle}>Professional Details</h3>
                                <div style={styles.infoGrid}>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Experience:</span>
                                        <span style={styles.infoValue}>
                                            {selectedCandidate.relevantExperience || selectedCandidate.experience || "-"}
                                        </span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Notice Period:</span>
                                        <span style={styles.infoValue}>
                                            {selectedCandidate.noticePeriod ? `${selectedCandidate.noticePeriod} days` : "-"}
                                        </span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Work Type:</span>
                                        <span style={styles.infoValue}>{selectedCandidate.employmentType || "-"}</span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Status:</span>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: `${getStatusColor(selectedCandidate.acmanagerStatus)}15`,
                                            color: getStatusColor(selectedCandidate.acmanagerStatus)
                                        }}>
                                            {selectedCandidate.acmanagerStatus || "Pending"}
                                        </span>
                                    </div>
                                    {/* <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Current CTC:</span>
                                        <span style={styles.infoValue}>
                                            {selectedCandidate.currentCTC ? `${selectedCandidate.currentCTC} LPA` : "-"}
                                        </span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Expected CTC:</span>
                                        <span style={styles.infoValue}>
                                            {selectedCandidate.expectedCTC ? `${selectedCandidate.expectedCTC} LPA` : "-"}
                                        </span>
                                    </div> */}
                                </div>
                            </div>

                            <div style={styles.infoSection}>
                                <h3 style={styles.sectionTitle}>Skills</h3>
                                <div style={styles.skillsContainer}>
                                    <div style={styles.skillItem}>
                                        <span style={styles.skillLabel}>Primary Skills:</span>
                                        <p style={styles.skillValue}>{selectedCandidate.technicalSkills || "-"}</p>
                                    </div>
                                    <div style={styles.skillItem}>
                                        <span style={styles.skillLabel}>Secondary Skills:</span>
                                        <p style={styles.skillValue}>{selectedCandidate.secondarySkillExp || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Resume Section */}
                            {selectedCandidate.resumeLink && (
                                <div style={styles.infoSection}>
                                    <h3 style={styles.sectionTitle}>Resume</h3>
                                    <iframe 
                                        src={selectedCandidate.resumeLink} 
                                        style={styles.resumeIframe}
                                        title="Resume Preview"
                                    />
                                    <button 
                                        onClick={() => window.open(selectedCandidate.resumeLink, "_blank")} 
                                        style={styles.openResumeButton}
                                    >
                                        Open Resume in New Tab
                                    </button>
                                </div>
                            )}

                            {/* Actions Section */}
                            <div style={styles.actionsSection}>
                                <h3 style={styles.sectionTitle}>Actions</h3>
                                
                                {/* Shortlist Section */}
                                <div style={styles.actionCard}>
                                    <h4 style={styles.actionCardTitle}>Select Candidate</h4>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Interview Date *</label>
                                        <input
                                            type="date"
                                            style={styles.formInput}
                                            value={shortlistDate}
                                            onChange={(e) => setShortlistDate(e.target.value)}
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Interview Time *</label>
                                        <input
                                            type="time"
                                            style={styles.formInput}
                                            value={shortlistTime}
                                            onChange={(e) => setShortlistTime(e.target.value)}
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>A/C Manager Name</label>
                                        <input
                                            type="text"
                                            style={styles.formInputReadonly}
                                            value={userName}
                                            readOnly
                                        />
                                    </div>
                                    <button 
                                        onClick={handleShortlist} 
                                        style={isSubmitting ? {...styles.successButton, ...styles.buttonDisabled} : styles.successButton}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <CircularProgress size={18} style={styles.buttonSpinner} />
                                                Processing...
                                            </>
                                        ) : (
                                            "Select Candidate"
                                        )}
                                    </button>
                                </div>

                                {/* Reject Section */}
                                <div style={styles.actionCard}>
                                    <h4 style={styles.actionCardTitle}>Reject Candidate</h4>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Rejection Feedback *</label>
                                        <textarea
                                            style={styles.formTextarea}
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder="Provide a reason for rejection"
                                            rows="4"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleReject} 
                                        style={isSubmitting ? {...styles.dangerButton, ...styles.buttonDisabled} : styles.dangerButton}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <CircularProgress size={18} style={styles.buttonSpinner} />
                                                Processing...
                                            </>
                                        ) : (
                                            "Reject Candidate"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions style={styles.dialogActions}>
                    <button onClick={handleDialogClose} style={styles.closeButton}>
                        Close
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f5f7fa',
        padding: '30px 20px',
        fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif"
    },
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        overflow: 'hidden'
    },
    header: {
        background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
        padding: '30px 40px',
        color: '#ffffff',
        borderBottom: '4px solid #002244'
    },
    heading: {
        margin: '0 0 8px 0',
        fontSize: '28px',
        fontWeight: '700'
    },
    subheading: {
        margin: 0,
        fontSize: '14px',
        opacity: 0.9
    },
    tableContainer: {
        padding: '30px'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '20px'
    },
    loadingText: {
        fontSize: '16px',
        color: '#64748b'
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px'
    },
    emptyText: {
        fontSize: '16px',
        color: '#64748b'
    },
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0
    },
    tableHeaderRow: {
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0'
    },
    tableHead: {
        padding: '16px',
        fontSize: '14px',
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    tableRow: {
        borderBottom: '1px solid #e2e8f0',
        transition: 'background-color 0.2s ease'
    },
    tableCell: {
        padding: '16px',
        fontSize: '14px',
        color: '#334155'
    },
    statusBadge: {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    viewButton: {
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#003366',
        backgroundColor: '#e0f2fe',
        border: '1px solid #bae6fd',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    paginationContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '2px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '16px'
    },
    paginationInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap'
    },
    rowsPerPageLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#475569',
        fontWeight: '500'
    },
    rowsPerPageSelect: {
        padding: '6px 12px',
        fontSize: '14px',
        border: '2px solid #e2e8f0',
        borderRadius: '6px',
        outline: 'none',
        cursor: 'pointer',
        backgroundColor: '#ffffff',
        color: '#334155',
        marginLeft: '8px'
    },
    paginationText: {
        fontSize: '14px',
        color: '#64748b'
    },
    dialogPaper: {
        borderRadius: '16px',
        maxHeight: '90vh'
    },
    dialogTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b',
        padding: '24px 32px',
        borderBottom: '2px solid #e2e8f0'
    },
    dialogContent: {
        padding: '32px'
    },
    infoSection: {
        marginBottom: '28px'
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '2px solid #e2e8f0'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    infoLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    infoValue: {
        fontSize: '15px',
        color: '#1e293b',
        fontWeight: '500'
    },
    skillsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    skillItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    skillLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#64748b'
    },
    skillValue: {
        fontSize: '14px',
        color: '#334155',
        lineHeight: '1.6',
        margin: 0,
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },
    resumeIframe: {
        width: '100%',
        height: '300px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '16px'
    },
    openResumeButton: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#003366',
        backgroundColor: '#e0f2fe',
        border: '1px solid #bae6fd',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    actionsSection: {
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '2px solid #e2e8f0'
    },
    actionCard: {
        backgroundColor: '#f8fafc',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0'
    },
    actionCardTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '20px'
    },
    formGroup: {
        marginBottom: '16px'
    },
    formLabel: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#475569',
        marginBottom: '8px'
    },
    formInput: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '14px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        fontFamily: 'inherit'
    },
    formInputReadonly: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '14px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#f1f5f9',
        color: '#64748b',
        fontFamily: 'inherit'
    },
    formTextarea: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '14px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: '1.5'
    },
    successButton: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 24px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: '#10b981',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginTop: '8px'
    },
    dangerButton: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 24px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: '#ef4444',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginTop: '8px'
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    buttonSpinner: {
        color: '#ffffff'
    },
    dialogActions: {
        padding: '16px 32px',
        borderTop: '2px solid #e2e8f0'
    },
    closeButton: {
        padding: '10px 24px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#64748b',
        backgroundColor: 'transparent',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    }
};
