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
  Chip,
  Avatar,
  Divider,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Cancel,
  PictureAsPdf,
  Image,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';

// Custom styled components
const MainContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1600,
  margin: '32px auto',
  padding: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

const ShadowedPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  overflow: 'hidden',
}));

const AmountCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.success.dark,
}));

const ActionCell = styled(TableCell)(({ theme }) => ({
  minWidth: 120,
}));

const FilePreviewLink = styled('a')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  textDecoration: 'none',
  color: theme.palette.secondary.main,
  '&:hover': {
    textDecoration: 'underline',
  },
}));

export default function ExpensesPremium() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    item: '',
    description: '',
    amount: '',
    attachment: '',
  });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/Expences');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      handleSnackbarOpen('Failed to load expenses', 'error');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment' && files?.length > 0) {
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
    try {
      const res = await fetch('/api/Expences/upload', { method: 'POST', body: data });
      if (res.ok) {
        const { url } = await res.json();
        return url;
      }
      throw new Error('Upload failed');
    } catch (err) {
      handleSnackbarOpen('File upload failed', 'error');
      return '';
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let attachmentUrl = form.attachment;

    if (file) {
      attachmentUrl = await uploadFile();
      if (!attachmentUrl) return;
    }

    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      attachment: attachmentUrl,
    };

    try {
      const url = '/api/Expences';
      const method = editingId ? 'PUT' : 'POST';
      const body = JSON.stringify(editingId ? { ...payload, id: editingId } : payload);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) throw new Error('Request failed');

      handleSnackbarOpen(
        editingId ? 'Expense updated successfully' : 'Expense added successfully',
        'success'
      );

      resetForm();
      fetchExpenses();
    } catch (err) {
      handleSnackbarOpen('Failed to save expense', 'error');
    }
  };

  const handleEdit = (exp) => {
    setForm({
      date: exp.date.slice(0, 10),
      item: exp.item,
      description: exp.description || '',
      amount: exp.amount.toString(),
      attachment: exp.attachment || '',
    });
    setFile(null);
    setEditingId(exp.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      handleSnackbarOpen('Expense deleted successfully', 'success');
      fetchExpenses();
    } catch (err) {
      handleSnackbarOpen('Failed to delete expense', 'error');
    }
    setDeleteDialog({ open: false, id: null });
  };

  const resetForm = () => {
    setForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      item: '',
      description: '',
      amount: '',
      attachment: '',
    });
    setFile(null);
    setEditingId(null);
  };

  const handleSnackbarOpen = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter expenses based on search term and filterMonth / filterYear
  const filteredExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    const monthMatch = filterMonth ? expDate.getMonth() + 1 === parseInt(filterMonth) : true;
    const yearMatch = filterYear ? expDate.getFullYear() === parseInt(filterYear) : true;

    const searchMatch =
      exp.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      exp.amount.toString().includes(searchTerm);

    return monthMatch && yearMatch && searchMatch;
  });

  // Unique years from expenses for filter dropdown
  const years = Array.from(new Set(expenses.map(exp => new Date(exp.date).getFullYear()))).sort((a, b) => b - a);

  // Month options
  const monthOptions = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const renderFilePreview = () => {
    if (file) {
      return (
        <Chip
          label={file.name}
          onDelete={() => setFile(null)}
          deleteIcon={<Cancel />}
          variant="outlined"
          avatar={
            file.type.includes('pdf') ? (
              <Avatar><PictureAsPdf /></Avatar>
            ) : (
              <Avatar><Image /></Avatar>
            )
          }
        />
      );
    } else if (form.attachment) {
      const isPdf = form.attachment.toLowerCase().endsWith('.pdf');
      return (
        <FilePreviewLink href={form.attachment} target="_blank" rel="noopener noreferrer">
          {isPdf ? <PictureAsPdf fontSize="small" /> : <Image fontSize="small" />}
          <Typography variant="body2">
            {isPdf ? 'View PDF' : 'View Image'}
          </Typography>
        </FilePreviewLink>
      );
    }
    return null;
  };

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <MainContainer>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Expense Management
        </Typography>
        {/* <Typography variant="body1" color="text.secondary">
          Track and manage all business expenses in one place
        </Typography> */}
      </Box>

      {/* Form Section */}
      <StyledCard>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Uncomment below to display title with icon */}
            {/* {editingId ? <Edit color="primary" /> : <Add color="primary" />} */}
            {/* {editingId ? 'Edit Expense' : 'Add New Expense'} */}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 2 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  // Icons removed as requested
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Item"
                  name="item"
                  value={form.item}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  id="outlined-multiline-flexible"
                  label="Description"
                  multiline
                  maxRows={4}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant={file || form.attachment ? 'contained' : 'outlined'}
                  component="label"
                  color={file ? 'primary' : 'default'}
                >
                  {file ? 'Change File' : form.attachment ? 'Replace Attachment' : 'Upload Attachment'}
                  <input
                    type="file"
                    name="attachment"
                    hidden
                    onChange={handleChange}
                    accept="image/*,application/pdf"
                  />
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 1 }}>
                  {renderFilePreview()}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={uploading || loading}
                    startIcon={editingId ? <Edit /> : <Add />}
                  >
                    {uploading ? 'Uploading...' : editingId ? 'Update' : 'Add Expense'}
                  </Button>

                  {editingId && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={resetForm}
                      size="large"
                      fullWidth
                      startIcon={<Cancel />}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>

            {(uploading || loading) && <LinearProgress sx={{ mt: 2 }} />}
          </Box>
        </CardContent>
      </StyledCard>

      {/* Filter Section */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 140 }} size="small">
          <InputLabel id="filter-month-label">Filter by Month</InputLabel>
          <Select
            labelId="filter-month-label"
            id="filter-month"
            value={filterMonth}
            label="Filter by Month"
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            {monthOptions.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140 }} size="small">
          <InputLabel id="filter-year-label">Filter by Year</InputLabel>
          <Select
            labelId="filter-year-label"
            id="filter-year"
            value={filterYear}
            label="Filter by Year"
            onChange={(e) => setFilterYear(e.target.value)}
            disabled={years.length === 0}
          >
            <MenuItem value="">All Years</MenuItem>
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Expenses Table Section */}
      <ShadowedPaper>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 1 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Expense Records
          </Typography>

          <TextField
            variant="outlined"
            placeholder="Search expenses..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: null, // removed icon
            }}
            sx={{ width: isMobile ? '100%' : 300 }}
          />
        </Box>

        <Divider />

        <Box sx={{ p: 2, bgcolor: theme.palette.grey[100], display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Total: {totalAmount.toLocaleString(undefined, {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 2,
            })}
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="expenses table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Attachment</TableCell>
                <ActionCell align="center" sx={{ fontWeight: 700 }}>Actions</ActionCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <LinearProgress sx={{ width: '100%' }} />
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography color="text.secondary" sx={{ fontSize: 60, mb: 1 }}>
                        📄
                      </Typography>
                      <Typography color="text.secondary">
                        {searchTerm || filterMonth || filterYear ? 'No matching expenses found' : 'No expenses recorded yet'}
                      </Typography>
                      {(searchTerm || filterMonth || filterYear) && (
                        <Button onClick={() => {
                          setSearchTerm('');
                          setFilterMonth('');
                          setFilterYear('');
                        }} variant="text">
                          Clear filters
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((exp) => (
                  <TableRow
                    key={exp.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: theme.palette.action.hover },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {format(parseISO(exp.date), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>
                        {exp.item}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                        {exp.description || '—'}
                      </Typography>
                    </TableCell>

                    <AmountCell align="right">
                      {parseFloat(exp.amount).toLocaleString(undefined, {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 2,
                      })}
                    </AmountCell>

                    <TableCell>
                      {exp.attachment ? (
                        <FilePreviewLink href={exp.attachment} target="_blank" rel="noopener noreferrer">
                          {exp.attachment.toLowerCase().endsWith('.pdf') ? (
                            <PictureAsPdf fontSize="small" />
                          ) : (
                            <Image fontSize="small" />
                          )}
                          <Typography variant="body2">
                            View
                          </Typography>
                        </FilePreviewLink>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          None
                        </Typography>
                      )}
                    </TableCell>

                    <ActionCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(exp)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(exp.id)}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ActionCell>
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
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this expense record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, id: null })}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainContainer>
  );
}
// 
