import React, { useState } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton as MuiIconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { checkEmail, login, forgotPassword, resetPassword } from '../api';
import VerificationModal from './VerificationModal';
import Notification from './Notification';
import ResetPasswordModal from './ResetPasswordModal';
import { useTranslation } from 'react-i18next';

const Login = ({ open, onClose, onSuccess, onError }) => {
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
 
  

  
  const formik = useFormik({
    initialValues: {
      LoginIdentifier: '',
      Password: ''
    },
    validationSchema: Yup.object({
      LoginIdentifier: Yup.string()
        .required('Email, Phone Number, or Username is required'),
      Password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await login(values);
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        if (!response.user.IsEmailVerified) {
          setUserEmail(response.user.Email);
          setIsVerificationOpen(true);
        } else {
          onSuccess(response.user);
          setNotification({ open: true, message: 'Login successful.', severity: 'success' });
          setTimeout(() => onClose(), 2000);
        }
      } catch (error) {
        const errorMessage = error.response ? error.response.data.msg : error.message;
        setNotification({ open: true, message: errorMessage, severity: 'error' });
        onError && onError(errorMessage);
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
          <Typography variant="h6" component="h2">
            Login
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              label="Email, Phone Number, or Username"
              name="LoginIdentifier"
              value={formik.values.LoginIdentifier}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              variant="outlined"
              margin="normal"
              fullWidth
              error={formik.touched.LoginIdentifier && Boolean(formik.errors.LoginIdentifier)}
              helperText={formik.touched.LoginIdentifier && formik.errors.LoginIdentifier}
            />
            <TextField
              label="Password"
              name="Password"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.Password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              variant="outlined"
              margin="normal"
              fullWidth
              error={formik.touched.Password && Boolean(formik.errors.Password)}
              helperText={formik.touched.Password && formik.errors.Password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <MuiIconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </MuiIconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button type="submit" variant="contained" sx={{ mt: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333' } }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
         
        </Box>
      </Modal>
      <VerificationModal
        open={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        email={userEmail}
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

export default Login;
