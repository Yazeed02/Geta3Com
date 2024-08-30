import React from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { changePassword } from '../api';

const ForgotPassword = ({ open, onClose, onSuccess, onError, isLoggedIn }) => {
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
      otpCode: '' // Add OTP code field
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
      otpCode: Yup.string().when('isLoggedIn', {
        is: false,
        then: Yup.string().required('OTP code is required'),
      }),
    }),
    onSubmit: async (values) => {
      try {
        if (isLoggedIn) {
          // Handle change password directly if user is logged in
          await changePassword({ newPassword: values.password });
        } else {
          // Handle forgot password flow
          await changePassword({ otpCode: values.otpCode, newPassword: values.password });
        }
        onSuccess(values.password);
        onClose();
      } catch (error) {
        const errorMessage = error.response ? error.response.data.msg : error.message;
        onError(errorMessage);
      }
    }
  });

  return (
    <Modal open={open} onClose={onClose} BackdropProps={{ onClick: (e) => e.stopPropagation() }}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
        <Typography variant="h6" component="h2">
          {isLoggedIn ? 'Change Password' : 'Forgot Password'}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          {!isLoggedIn && (
            <TextField
              label="OTP Code"
              name="otpCode"
              value={formik.values.otpCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              variant="outlined"
              margin="normal"
              fullWidth
              error={formik.touched.otpCode && Boolean(formik.errors.otpCode)}
              helperText={formik.touched.otpCode && formik.errors.otpCode}
            />
          )}
          <TextField
            label="New Password"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            variant="outlined"
            margin="normal"
            fullWidth
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            variant="outlined"
            margin="normal"
            fullWidth
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Submit</Button>
        </form>
      </Box>
    </Modal>
  );
};

export default ForgotPassword;
