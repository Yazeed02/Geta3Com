import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, IconButton, CircularProgress, InputAdornment, IconButton as MuiIconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { signup } from '../api';
import VerificationModal from './VerificationModal';
import Notification from './Notification';
import { useTranslation } from 'react-i18next';

const Signup = ({ open, onClose, onSuccess, onError }) => {
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useTranslation();

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownConfirmPassword = (event) => {
    event.preventDefault();
  };

  const formik = useFormik({
    initialValues: {
      FirstName: '',
      LastName: '',
      Email: '',
      PhoneNumber: '',
      Username: '',
      Password: '',
      ConfirmPassword: ''
    },
    validationSchema: Yup.object({
      FirstName: Yup.string()
        .min(1, 'First name must be provided')
        .required('First name is required'),
      LastName: Yup.string()
        .min(1, 'Last name must be provided')
        .required('Last name is required'),
      Email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      PhoneNumber: Yup.string()
        .required('Phone number is required'),
      Username: Yup.string()
        .min(1, 'Username must be provided')
        .required('Username is required'),
      Password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      ConfirmPassword: Yup.string()
        .oneOf([Yup.ref('Password'), null], 'Passwords must match')
        .required('Confirm password is required')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await signup(values);
        setUserEmail(values.Email);
        setUserPhone(values.PhoneNumber);
        setIsVerificationOpen(true);
        setNotification({ open: true, message: 'User registered successfully. Please verify your email.', severity: 'success' });
        formik.resetForm();
        onClose();
      } catch (error) {
        const errorMessage = error.response ? error.response.data.msg : error.message;
        setNotification({ open: true, message: errorMessage, severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <>
      <Modal open={open} onClose={onClose} BackdropProps={{ onClick: (e) => e.stopPropagation() }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Signup
          </Typography>
          <form onSubmit={formik.handleSubmit}>
  <TextField
    fullWidth
    id="FirstName"
    name="FirstName"
    label={t('First name')}
    value={formik.values.FirstName}
    onChange={formik.handleChange}
    error={formik.touched.FirstName && Boolean(formik.errors.FirstName)}
    helperText={formik.touched.FirstName && formik.errors.FirstName}
    sx={{ mb: 2 }}
  />
  <TextField
    fullWidth
    id="LastName"
    name="LastName"
    label={t('Last name')}
    value={formik.values.LastName}
    onChange={formik.handleChange}
    error={formik.touched.LastName && Boolean(formik.errors.LastName)}
    helperText={formik.touched.LastName && formik.errors.LastName}
    sx={{ mb: 2 }}
  />
  <TextField
    fullWidth
    id="Email"
    name="Email"
    label={t('Email')}
    value={formik.values.Email}
    onChange={formik.handleChange}
    error={formik.touched.Email && Boolean(formik.errors.Email)}
    helperText={formik.touched.Email && formik.errors.Email}
    sx={{ mb: 2 }}
  />
  <TextField
    fullWidth
    id="PhoneNumber"
    name="PhoneNumber"
    label={t('Phone number')}
    value={formik.values.PhoneNumber}
    onChange={formik.handleChange}
    error={formik.touched.PhoneNumber && Boolean(formik.errors.PhoneNumber)}
    helperText={formik.touched.PhoneNumber && formik.errors.PhoneNumber}
    sx={{ mb: 2 }}
  />
  <TextField
    fullWidth
    id="Username"
    name="Username"
    label={t('Username')}
    value={formik.values.Username}
    onChange={formik.handleChange}
    error={formik.touched.Username && Boolean(formik.errors.Username)}
    helperText={formik.touched.Username && formik.errors.Username}
    sx={{ mb: 2 }}
  />
  <TextField
    fullWidth
    id="Password"
    name="Password"
    label={t('Password')}
    type={showPassword ? 'text' : 'password'}
    value={formik.values.Password}
    onChange={formik.handleChange}
    error={formik.touched.Password && Boolean(formik.errors.Password)}
    helperText={formik.touched.Password && formik.errors.Password}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
    sx={{ mb: 2 }}
  />
  <TextField
    fullWidth
    id="ConfirmPassword"
    name="ConfirmPassword"
    label={t('Confirm password')}
    type={showConfirmPassword ? 'text' : 'password'}
    value={formik.values.ConfirmPassword}
    onChange={formik.handleChange}
    error={formik.touched.ConfirmPassword && Boolean(formik.errors.ConfirmPassword)}
    helperText={formik.touched.ConfirmPassword && formik.errors.ConfirmPassword}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={handleClickShowConfirmPassword} onMouseDown={handleMouseDownConfirmPassword}>
            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
    sx={{ mb: 2 }}
  />
</form>

          <form onSubmit={formik.handleSubmit}>
            {/* All other form fields */}
            <Button type="submit" variant="contained" sx={{ mt: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333' } }}>
              {loading ? <CircularProgress size={24} /> : 'Signup'}
            </Button>
          </form>
        </Box>
      </Modal>
      <VerificationModal
        open={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        email={userEmail}
        phoneNumber={userPhone}
        onSuccess={() => {
          setIsVerificationOpen(false);
          onSuccess();
          onClose();
        }}
        onError={(msg) => setNotification({ open: true, message: msg, severity: 'error' })}
      />
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
    </>
  );
};

export default Signup;
