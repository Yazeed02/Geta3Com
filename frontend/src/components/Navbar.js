import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = ({ user, onSignupOpen, onLoginOpen, onLogout, onToggleMode, currentMode, onChangeLanguage }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Hook to use translations

  return (
    <AppBar position="static" sx={{ backgroundColor: '#000000' }}>
      <Toolbar sx={{ height: 80 }}>
        <Box sx={{ flexGrow: 1 }}>
          <img
            src={require('../logos/Logo.png')}
            alt="Logo"
            style={{ cursor: 'pointer', height: 180, width: 'auto' }}
            onClick={() => navigate('/')}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Language Switcher Buttons */}
          <Button color="inherit" onClick={() => onChangeLanguage('en')}>English</Button>
          <Button color="inherit" onClick={() => onChangeLanguage('ar')}>العربية</Button>

          {/* Dark/Light Mode Switch as Icon */}
          <IconButton color="inherit" onClick={onToggleMode}>
            {currentMode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {user ? (
            <>
              <Button color="inherit" onClick={() => navigate(`/profile/${user.id}`)}>{t('profile')}</Button>
              {user.isAdmin && <Button color="inherit" onClick={() => navigate('/admin')}>{t('adminPanel')}</Button>}
              <Button color="inherit" onClick={onLogout}>{t('logout')}</Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={onSignupOpen}>{t('signup')}</Button>
              <Button color="inherit" onClick={onLoginOpen}>{t('login')}</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
