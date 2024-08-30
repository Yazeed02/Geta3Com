// src/components/ResetPasswordModal.js
import React, { useState } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

const ResetPasswordModal = ({ open, onClose, onSubmit }) => {
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = () => {
    setLoading(true);
    onSubmit(otpCode, newPassword).finally(() => setLoading(false));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
        <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="h2">
          Reset Password
        </Typography>
        <TextField
          label="OTP Code"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          variant="outlined"
          margin="normal"
          fullWidth
        />
        <TextField
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          variant="outlined"
          margin="normal"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </Box>
    </Modal>
  );
};

export default ResetPasswordModal;
