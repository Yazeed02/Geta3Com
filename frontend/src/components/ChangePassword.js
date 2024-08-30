import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import { useFormik } from 'formik';
import CloseIcon from '@mui/icons-material/Close';
import * as Yup from 'yup';
import { changePassword } from '../api';

const ChangePassword = ({ open, onClose, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await changePassword({ newPassword: values.password });
        onSuccess(values.password);
        onClose();
      } catch (error) {
        const errorMessage = error.response ? error.response.data.msg : error.message;
        onError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Modal open={open} onClose={onClose} BackdropProps={{ onClick: (e) => e.stopPropagation() }}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
        <Typography variant="h6" component="h2">
          Change Password
        </Typography>
        <form onSubmit={formik.handleSubmit}>
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
          <Button type="submit" variant="contained" sx={{ mt: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333' } }}>
            {loading ? 'Loading...' : 'Submit'}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default ChangePassword;
