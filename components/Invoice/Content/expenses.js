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
  InputLabel,
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
  margin: '24px auto',
  padding: theme.spacing(2),
  fontSize: '0.875rem', // 14px everywhere
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1),
    fontSize: '0.8rem', // 12-13px
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

const ShadowedPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  overflow: 'hidden',
}));

const AmountCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.success.dark,
  fontSize: '0.875rem',
  padding: '4px 8px',
}));

const ActionCell = styled(TableCell)(({ theme }) => ({
  minWidth: 90,
  padding: '4px 8px',
}));

const FilePreviewLink = styled('a')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  textDecoration: 'none',
  color: theme.palette.secondary.main,
  fontSize: '0.85em',
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
  const [formErrors, setFormErrors] = useState({});
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
      const selectedFile = files[0];
      // Validate file type and size (max 5MB)
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(selectedFile.type)) {
        setFormErrors((prev) => ({ ...prev, attachment: 'Only PDF, JPG, or PNG files are allowed.' }));
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, attachment: 'File size must be less than 5MB.' }));
        setFile(null);
        return;
      }
      setFormErrors((prev) => ({ ...prev, attachment: undefined }));
      setFile(selectedFile);
    } else {
      setForm({ ...form, [name]: value });
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.date) errors.date = 'Date is required.';
    if (!form.item) errors.item = 'Item is required.';
    if (!form.amount) errors.amount = 'Amount is required.';
    else if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) errors.amount = 'Amount must be a positive number.';
    if (file && !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) errors.attachment = 'Only PDF, JPG, or PNG files are allowed.';
    if (file && file.size > 5 * 1024 * 1024) errors.attachment = 'File size must be less than 5MB.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      handleSnackbarOpen('Please fix the errors in the form.', 'error');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('date', form.date);
      formData.append('item', form.item);
      formData.append('description', form.description);
      formData.append('amount', form.amount);
      if (file) {
        formData.append('attachment', file);
      } else if (form.attachment) {
        formData.append('existingAttachment', form.attachment);
      }
      if (editingId) {
        formData.append('id', editingId);
      }
      const url = '/api/Expences';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || 'Request failed');
      }
      handleSnackbarOpen(
        editingId ? 'Expense updated successfully' : 'Expense added successfully',
        'success'
      );
      resetForm();
      fetchExpenses();
    } catch (err) {
      handleSnackbarOpen(err.message || 'Failed to save expense', 'error');
    } finally {
      setUploading(false);
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
    setFormErrors({});
  };

  const handleSnackbarOpen = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

  const years = Array.from(new Set(expenses.map(exp => new Date(exp.date).getFullYear()))).sort((a, b) => b - a);

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
          size="small"
          avatar={
            file.type.includes('pdf') ? (
              <Avatar sx={{ width: 24, height: 24 }}><PictureAsPdf fontSize="small" /></Avatar>
            ) : (
              <Avatar sx={{ width: 24, height: 24 }}><Image fontSize="small" /></Avatar>
            )
          }
          sx={{ fontSize: '0.87em', height: 28 }}
        />
      );
    } else if (form.attachment) {
      const isPdf = form.attachment.toLowerCase().endsWith('.pdf');
      return (
        <FilePreviewLink href={form.attachment} target="_blank" rel="noopener noreferrer">
          {isPdf ? <PictureAsPdf fontSize="small" /> : <Image fontSize="small" />}
          <Typography variant="body2" sx={{ fontSize: '0.9em' }}>
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontSize: '1.05rem' }}>
          Expense Management
        </Typography>
      </Box>

      {/* Form Section */}
      <StyledCard>
        <CardContent sx={{ p: 2 }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  name="date"
                  value={form.date}
                  size="small"
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.date}
                  helperText={formErrors.date}
                  sx={{ fontSize: '0.9em' }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Item"
                  name="item"
                  value={form.item}
                  size="small"
                  onChange={handleChange}
                  required
                  error={!!formErrors.item}
                  helperText={formErrors.item}
                  sx={{ fontSize: '0.9em' }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={form.amount}
                  size="small"
                  onChange={handleChange}
                  required
                  error={!!formErrors.amount}
                  helperText={formErrors.amount}
                  sx={{ fontSize: '0.9em' }}
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
                  size="small"
                  onChange={handleChange}
                  sx={{ fontSize: '0.9em' }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant={file || form.attachment ? 'contained' : 'outlined'}
                  component="label"
                  color={file ? 'primary' : 'default'}
                  size="small"
                  sx={{ fontSize: '0.89em', py: 0.8 }}
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
                {formErrors.attachment && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block', fontSize: '0.8em' }}>
                    {formErrors.attachment}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 1 }}>
                  {renderFilePreview()}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="small"
                    fullWidth
                    disabled={uploading || loading}
                    startIcon={editingId ? <Edit fontSize="small" /> : <Add fontSize="small" />}
                    sx={{ fontSize: '0.89em', py: 0.8 }}
                  >
                    {uploading ? 'Uploading...' : editingId ? 'Update' : 'Add Expense'}
                  </Button>
                  {editingId && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={resetForm}
                      size="small"
                      fullWidth
                      startIcon={<Cancel fontSize="small" />}
                      sx={{ fontSize: '0.89em' }}
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
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', fontSize: '0.95em' }}>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="filter-month-label" sx={{ fontSize: '0.9em' }}>Month</InputLabel>
          <Select
            labelId="filter-month-label"
            id="filter-month"
            value={filterMonth}
            label="Filter by Month"
            onChange={(e) => setFilterMonth(e.target.value)}
            size="small"
            sx={{ fontSize: '0.92em' }}
          >
            {monthOptions.map((m) => (
              <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.92em' }}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="filter-year-label" sx={{ fontSize: '0.9em' }}>Year</InputLabel>
          <Select
            labelId="filter-year-label"
            id="filter-year"
            value={filterYear}
            label="Filter by Year"
            onChange={(e) => setFilterYear(e.target.value)}
            disabled={years.length === 0}
            size="small"
            sx={{ fontSize: '0.92em' }}
          >
            <MenuItem value="" sx={{ fontSize: '0.92em' }}>All Years</MenuItem>
            {years.map((y) => (
              <MenuItem key={y} value={y} sx={{ fontSize: '0.92em' }}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Expenses Table Section */}
      <ShadowedPaper>
        <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 1 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1em' }}>
            Expense Records
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Search expenses..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: isMobile ? '100%' : 220, fontSize: '0.9em', background: "#fafafa" }}
            InputProps={{
              style: { fontSize: '0.92em', padding: 6 },
              startAdornment: null,
            }}
          />
        </Box>
        <Divider />
        <Box sx={{ p: 1.5, bgcolor: theme.palette.grey[100], display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.97em' }}>
            Total: {totalAmount.toLocaleString(undefined, {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 2,
            })}
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 420 }}>
          <Table stickyHeader aria-label="expenses table" size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.9em', p: '6px 8px' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.9em', p: '6px 8px' }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.9em', p: '6px 8px' }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.9em', p: '6px 8px' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.9em', p: '6px 8px' }}>Attachment</TableCell>
                <ActionCell align="center" sx={{ fontWeight: 700, fontSize: '0.9em', p: '6px 8px' }}>Actions</ActionCell>
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
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography color="text.secondary" sx={{ fontSize: 36, mb: 1 }}>
                        📄
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.95em' }}>
                        {searchTerm || filterMonth || filterYear ? 'No matching expenses found' : 'No expenses recorded yet'}
                      </Typography>
                      {(searchTerm || filterMonth || filterYear) && (
                        <Button onClick={() => {
                          setSearchTerm('');
                          setFilterMonth('');
                          setFilterYear('');
                        }} variant="text" size="small" sx={{ fontSize: '0.89em' }}>
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
                    <TableCell sx={{ fontSize: '0.89em', p: '4px 8px' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.91em' }}>
                        {format(parseISO(exp.date), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.89em', p: '4px 8px' }}>
                      <Typography fontWeight={600} sx={{ fontSize: '0.91em' }}>
                        {exp.item}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.86em', p: '4px 8px' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', fontSize: '0.88em' }}>
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
                    <TableCell sx={{ fontSize: '0.88em', p: '4px 8px' }}>
                      {exp.attachment ? (
                        <FilePreviewLink href={exp.attachment} target="_blank" rel="noopener noreferrer">
                          {exp.attachment.toLowerCase().endsWith('.pdf') ? (
                            <PictureAsPdf fontSize="small" />
                          ) : (
                            <Image fontSize="small" />
                          )}
                          <Typography variant="body2" sx={{ fontSize: '0.88em' }}>
                            View
                          </Typography>
                        </FilePreviewLink>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.88em' }}>
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
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1em' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.93em' }}>
            Are you sure you want to permanently delete this expense record? 
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, id: null })}
            variant="outlined"
            color="inherit"
            size="small"
            sx={{ fontSize: '0.89em' }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            autoFocus
            size="small"
            sx={{ fontSize: '0.89em' }}
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
          sx={{ width: '100%', fontSize: '0.95em' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainContainer>
  );
}
