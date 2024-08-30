import React from 'react';
import { Modal, Box, TextField, Button, Typography, IconButton } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import { verifyEmail, verifyPhoneNumber } from '../api';
import { useTranslation } from 'react-i18next';

const VerificationModal = ({ open, onClose, email, phoneNumber, type, onSuccess, onError }) => {
  const { t } = useTranslation();
  const formik = useFormik({
    initialValues: {
      code: ''
    },
    validationSchema: Yup.object({
      code: Yup.string().required('Verification code is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (type === 'email') {
          await verifyEmail({ Email: email, code: values.code });
        } else if (type === 'phone') {
          await verifyPhoneNumber({ PhoneNumber: phoneNumber, code: values.code });
        }
        onSuccess();
      } catch (error) {
        const errorMessage = error.response ? error.response.data.msg : error.message;
        onError(errorMessage);
      }
    }
  });

  return (
    <Modal open={open} onClose={onClose} BackdropProps={{ onClick: (e) => e.stopPropagation() }}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="h2">
          Verify Your {type === 'email' ? 'Email' : 'Phone'}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            label="Verification Code"
            name="code"
            value={formik.values.code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            variant="outlined"
            margin="normal"
            fullWidth
            error={formik.touched.code && Boolean(formik.errors.code)}
            helperText={formik.touched.code && formik.errors.code}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333' } }}>Verify</Button>
        </form>
      </Box>
    </Modal>
  );
};

export default VerificationModal;
