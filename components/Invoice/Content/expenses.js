import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Paper,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { Add, Edit, Delete, AttachFile, Cancel, MonetizationOn, CloudUpload } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

const MainContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1400,
  margin: '32px auto',
  padding: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    maxWidth: '98vw',
    padding: theme.spacing(1),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  boxShadow: theme.shadows[8],
  borderRadius: theme.spacing(2),
  background: 'rgba(245,248,252,0.96)',
}));

const ShadowedPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
}));

const AmountAdornment = () => (
  <InputAdornment position="start">
    <MonetizationOn color="action" sx={{ opacity: 0.7 }} />
  </InputAdornment>
);

export default function ExpensesPremium() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    date: '',
    item: '',
    description: '',
    amount: '',
    attachment: '',
  });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/Expences');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load expenses.', severity: 'error' });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment' && files.length > 0) {
      setFile(files[0]);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const uploadFile = async () => {
    if (!file) return form.attachment;
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    const res = await fetch('/api/Expences/upload', { method: 'POST', body: data });
    setUploading(false);
    if (res.ok) {
      const { url } = await res.json();
      return url;
    }
    setSnackbar({ open: true, message: 'File upload failed.', severity: 'error' });
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let attachmentUrl = form.attachment;
    if (file) {
      attachmentUrl = await uploadFile();
    }
    const payload = { ...form, attachment: attachmentUrl };
    try {
      if (editingId) {
        await fetch('/api/Expences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
        setSnackbar({ open: true, message: 'Expense updated!', severity: 'success' });
      } else {
        await fetch('/api/Expences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setSnackbar({ open: true, message: 'Expense added!', severity: 'success' });
      }
      setForm({ date: '', item: '', description: '', amount: '', attachment: '' });
      setFile(null);
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save expense.', severity: 'error' });
    }
  };

  const handleEdit = (exp) => {
    setForm({
      date: exp.date.slice(0, 10),
      item: exp.item,
      description: exp.description || '',
      amount: exp.amount,
      attachment: exp.attachment || '',
    });
    setFile(null);
    setEditingId(exp.id);
  };

  const handleDelete = (id) => {
    setDeleteDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await fetch('/api/Expences', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteDialog.id }),
      });
      setSnackbar({ open: true, message: 'Expense deleted!', severity: 'success' });
      fetchExpenses();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete expense.', severity: 'error' });
    }
    setDeleteDialog({ open: false, id: null });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ date: '', item: '', description: '', amount: '', attachment: '' });
    setFile(null);
  };

  const renderFilePreview = () => {
    if (file) {
      return (
        <Tooltip title={file.name}>
          <Typography variant="body2" color="primary">
            Selected: {file.name}
          </Typography>
        </Tooltip>
      );
    } else if (form.attachment) {
      const isPdf = form.attachment.toLowerCase().endsWith('.pdf');
      return (
        <Tooltip title="View existing attachment">
          <a
            href={form.attachment}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline', color: '#3469ed', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {isPdf ? (
              <>
                <AttachFile fontSize="small" color="action" />
                PDF Attachment
              </>
            ) : (
              <>
                <AttachFile fontSize="small" color="action" />
                Image Attachment
              </>
            )}
          </a>
        </Tooltip>
      );
    }
    return null;
  };

  return (
    <MainContainer>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="h2" fontWeight={800} color={theme.palette.primary.dark} sx={{ letterSpacing: 1 }}>
        Expenses
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
        
        </Typography>
      </Box>
      <StyledCard>
        <CardContent sx={{ py: isMobile ? 2 : 4 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <TextField
              label="Date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, minWidth: 150 }}
              size="small"
            />
            <TextField
              label="Item"
              name="item"
              value={form.item}
              onChange={handleChange}
              required
              sx={{ flex: 2, minWidth: 170 }}
              size="small"
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              sx={{ flex: 3, minWidth: 220 }}
              size="small"
            />
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              required
              // InputProps={{ startAdornment: <AmountAdornment /> }}
              sx={{ flex: 1, minWidth: 120 }}
              size="small"
            />
            <Box sx={{ flex: 2, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1 }}>
              <Button
                variant={file ? 'contained' : 'outlined'}
                component="label"
                startIcon={<CloudUpload />}
                sx={{ width: '100%', mb: file || form.attachment ? 1 : 0, whiteSpace: 'nowrap' }}
                color="secondary"
              >
                {file
                  ? 'Change File'
                  : form.attachment
                  ? 'Change '
                  : 'Upload '
                }
                <input
                  type="file"
                  name="attachment"
                  hidden
                  onChange={handleChange}
                  accept="image/*,application/pdf"
                />
              </Button>
              {renderFilePreview()}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto' }}>
              <Button
                type="submit"
                variant="contained"
                color={editingId ? 'secondary' : 'primary'}
                startIcon={editingId ? <Edit /> : <Add />}
                disabled={uploading || loading}
                sx={{ minWidth: 120, fontWeight: 600 }}
                size="large"
              >
                {uploading ? 'Uploading...' : editingId ? 'Update' : 'Add'}
              </Button>
              {editingId && (
                <Tooltip title="Cancel Edit">
                  <IconButton color="error" onClick={handleCancelEdit}>
                    <Cancel />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </form>
          {(uploading || loading) && <LinearProgress sx={{ mt: 2 }} />}
        </CardContent>
      </StyledCard>
      <ShadowedPaper>
        <TableContainer sx={{ maxHeight: 600, borderRadius: 2 }}>
          <Table stickyHeader aria-label="expenses table">
            <TableHead>
              <TableRow sx={{ background: theme.palette.background.paper }}>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, minWidth: 95 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Attachment</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center"><LinearProgress sx={{ width: '100%' }} /></TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No expenses found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((exp, idx) => (
                  <TableRow
                    key={exp.id}
                    sx={{
                      backgroundColor: idx % 2 === 0 ? theme.palette.grey[100] : '#fff',
                      '&:hover': { backgroundColor: 'rgba(52,105,237,0.07)' },
                      transition: 'background 0.2s'
                    }}
                  >
                    <TableCell>
                      <b>{exp.date.slice(0, 10)}</b>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600} color="primary">
                        {exp.item}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{exp.description || <span style={{ color: '#bbb' }}>—</span>}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {Number(exp.amount).toLocaleString(undefined, {
                        style: 'currency',
                        currency: 'INR',
                        // minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      {exp.attachment ? (
                        <Tooltip title="View Attachment">
                          <a href={exp.attachment} target="_blank" rel="noopener noreferrer">
                            <AttachFile fontSize="small" sx={{ color: theme.palette.secondary.main }} />
                            <span style={{ fontSize: 13, verticalAlign: 1 }}>View</span>
                          </a>
                        </Tooltip>
                      ) : (
                        <Typography color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEdit(exp)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(exp.id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ShadowedPaper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle fontWeight={700}>Delete Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to <b>delete</b> this expense? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, id: null })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
          sx={{ width: '100%', fontWeight: 600, fontSize: 16 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainContainer>
  );
}
