import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Avatar, Button, CircularProgress, Grid, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, TextField, CardMedia
} from '@mui/material';
import {
  CheckCircle, Error as ErrorIcon, Edit as EditIcon, Save as SaveIcon, Delete as DeleteIcon, LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { deleteProfile, verifyEmail, sendPhoneVerification, updateUserLocation, fetchUser, deleteGeta3 } from '../api';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';
import ChangePassword from './ChangePassword';
import VerificationModal from './VerificationModal';
import LocationInfoModal from './LocationInfoModal';
import { useTheme } from '@mui/material/styles';

const ITEMS_PER_PAGE = 6;

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [userGeta3s, setUserGeta3s] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [verificationType, setVerificationType] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [isLocationInfoOpen, setIsLocationInfoOpen] = useState(false);
  const [selectedGeta3Id, setSelectedGeta3Id] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [geta3Page, setGeta3Page] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const data = await fetchUser();
        setProfile(data.profile);

        // Process images for user posts with safe checks
        const processedUserGeta3s = data.UserGeta3s.map(post => ({
          ...post,
          imgs: Array.isArray(post.imgs) ? post.imgs.map(img => `http://localhost:3000/uploads/${img.split('/').pop()}`) : [],
          Cover: post.Cover ? `http://localhost:3000/uploads/${post.Cover.split('/').pop()}` : '',
        }));

        // Process and filter out empty favorites
        const processedUserFavorites = data.userFavorites
          .map(fav => ({
            ...fav,
            imgs: Array.isArray(fav?.imgs) ? fav.imgs.map(img => `http://localhost:3000/uploads/${img.split('/').pop()}`) : [],
            Cover: fav?.Cover ? `http://localhost:3000/uploads/${fav.Cover.split('/').pop()}` : '',
          }))
          .filter(fav => fav.Title && (fav.imgs.length > 0 || fav.Cover)); // Remove empty cards

        setUserGeta3s(processedUserGeta3s);
        setUserFavorites(processedUserFavorites);
        setNewLocation(data.profile.Location || '');
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setNotification({ open: true, message: 'Failed to load user profile', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleVerificationSuccess = () => {
    setNotification({ open: true, message: 'Verification successful.', severity: 'success' });
    setIsVerificationOpen(false);
    if (verificationType === 'email') {
      setProfile({ ...profile, IsEmailVerified: true });
    } else if (verificationType === 'phone') {
      setProfile({ ...profile, IsPhoneVerified: true });
    }
  };

  const handleVerificationError = (errorMessage) => {
    setNotification({ open: true, message: errorMessage, severity: 'error' });
  };

  const handleDeleteProfile = async () => {
    setLoading(true);
    try {
      await deleteProfile(profile._id);
      setNotification({ open: true, message: 'Profile deleted successfully.', severity: 'success' });
      navigate('/'); // Redirect to home or another page after profile deletion
    } catch (error) {
      const errorMessage = error.response ? error.response.data.msg : error.message;
      setNotification({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      await verifyEmail({ Email: profile.Email });
      setVerificationType('email');
      setIsVerificationOpen(true);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.msg : error.message;
      setNotification({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    setLoading(true);
    try {
      await sendPhoneVerification({ PhoneNumber: profile.PhoneNumber });
      setVerificationType('phone');
      setIsVerificationOpen(true);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.msg : error.message;
      setNotification({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    setLoading(true);
    try {
      await updateUserLocation({ Location: newLocation });
      setNotification({ open: true, message: 'Location updated successfully.', severity: 'success' });
      setProfile({ ...profile, Location: newLocation });
      setIsEditingLocation(false);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.msg : error.message;
      setNotification({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGeta3Click = (geta3Id) => {
    navigate(`/posts/${geta3Id}`);
  };

  const handleDeleteGeta3 = async () => {
    setLoading(true);
    try {
      await deleteGeta3(selectedGeta3Id);
      setUserGeta3s(userGeta3s.filter(geta3 => geta3._id !== selectedGeta3Id));
      setNotification({ open: true, message: 'Geta3 deleted successfully.', severity: 'success' });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.msg : error.message;
      setNotification({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (geta3Id) => {
    setSelectedGeta3Id(geta3Id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setSelectedGeta3Id(null);
    setIsDeleteDialogOpen(false);
  };

  const showMoreGeta3s = () => {
    setGeta3Page(geta3Page + 1);
  };

  const showLessGeta3s = () => {
    setGeta3Page(1);
  };

  const showMoreFavorites = () => {
    setFavoritesPage(favoritesPage + 1);
  };

  const showLessFavorites = () => {
    setFavoritesPage(1);
  };

  const displayedGeta3s = userGeta3s.slice(0, geta3Page * ITEMS_PER_PAGE);
  const displayedFavorites = userFavorites.slice(0, favoritesPage * ITEMS_PER_PAGE);

  if (loading) {
    return <CircularProgress />;
  }

  if (!profile) {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>
        <Typography variant="body1">Loading user information...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        User Profile
      </Typography>
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 2 }}>{profile.Username.charAt(0)}</Avatar>
            <Box>
              <Typography variant="h6">Username: {profile.Username}</Typography>
              <Typography variant="h6">Posts: {profile.postCount}</Typography>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Email: {profile.Email}</Typography>
                {profile.IsEmailVerified ? (
                  <CheckCircle color="success" sx={{ ml: 1 }} />
                ) : (
                  <>
                    <ErrorIcon color="error" sx={{ ml: 1 }} />
                    <Button variant="contained" color="primary" onClick={handleVerifyEmail} sx={{ ml: 2 }}>
                      {loading ? <CircularProgress size={24} /> : 'Verify Email'}
                    </Button>
                  </>
                )}
              </Box>
              <Box display="flex" alignItems="center">
                <Typography variant="h6">Phone: {profile.PhoneNumber}</Typography>
                {profile.IsPhoneVerified ? (
                  <CheckCircle color="success" sx={{ ml: 1 }} />
                ) : (
                  <>
                    <ErrorIcon color="error" sx={{ ml: 1 }} />
                    <Button variant="contained" color="primary" onClick={handleVerifyPhone} sx={{ ml: 2 }}>
                      {loading ? <CircularProgress size={24} /> : 'Verify Phone'}
                    </Button>
                  </>
                )}
              </Box>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Location: </Typography>
                <Link href={profile.Location} target="_blank" rel="noopener noreferrer" sx={{ ml: 1 }}>
                  View Location
                </Link>
                <IconButton onClick={() => setIsEditingLocation(!isEditingLocation)}>
                  <EditIcon />
                </IconButton>
                <LocationOnIcon color="primary" sx={{ ml: 1 }} />
                <Button variant="outlined" color="primary" onClick={() => setIsLocationInfoOpen(true)}>
                  How to Get Location Link
                </Button>
                {isEditingLocation && (
                  <Box display="flex" alignItems="center">
                    <TextField
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Enter new location"
                      size="small"
                    />
                    <IconButton onClick={handleUpdateLocation}>
                      <SaveIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Button
        variant="contained"
        onClick={() => setIsChangePasswordOpen(true)}
        sx={{
          mb: 4,
          backgroundColor: '#000000',
          color: 'white',
          '&:hover': {
            backgroundColor: '#333333',
          },
        }}
      >
        {loading ? <CircularProgress size={24} /> : 'Change Password'}
      </Button>
      <Button variant="contained" color="error" onClick={handleDeleteProfile} disabled={loading} sx={{ mb: 4, ml: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Delete Profile'}
      </Button>
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Geta3s
        </Typography>
        {displayedGeta3s && displayedGeta3s.length > 0 ? (
          <Grid container spacing={4}>
            {displayedGeta3s.map((geta3) => (
              <Grid item xs={12} sm={6} md={4} key={geta3._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 5,
                    },
                  }}
                  onClick={() => handleGeta3Click(geta3._id)}
                >
                  <CardMedia
                    component="img"
                    image={geta3.imgs && geta3.imgs.length > 0 ? geta3.imgs[0] : geta3.Cover}  // Display the first image
                    alt={geta3.Title}
                    sx={{
                      height: 200,
                      objectFit: 'cover',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {geta3.Title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                      {geta3.Description}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="textSecondary">
                        Condition: {geta3.condition}
                      </Typography>
                      <IconButton onClick={(e) => { e.stopPropagation(); openDeleteDialog(geta3._id); }} aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No Geta3s found.</Typography>
        )}
        {userGeta3s.length > displayedGeta3s.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              sx={{
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                },
              }}
              onClick={showMoreGeta3s}
            >
              Show More
            </Button>
            <Button
              sx={{
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                },
                ml: 2,
              }}
              onClick={showLessGeta3s}
            >
              Show Less
            </Button>
          </Box>
        )}
      </Box>
      <Box>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
          Favorites
        </Typography>
        {displayedFavorites && displayedFavorites.length > 0 ? (
          <Grid container spacing={4}>
            {displayedFavorites.map((fav) => (
              <Grid item xs={12} sm={6} md={4} key={fav._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 5,
                    },
                  }}
                  onClick={() => handleGeta3Click(fav._id)}
                >
                  <CardMedia
                    component="img"
                    image={fav.imgs && fav.imgs.length > 0 ? fav.imgs[0] : fav.Cover}  // Display the first image
                    alt={fav.Title}
                    sx={{
                      height: 200,
                      objectFit: 'cover',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {fav.Title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                      {fav.Description}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Condition: {fav.condition}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No favorites found.</Typography>
        )}
        {userFavorites.length > displayedFavorites.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              sx={{
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                },
              }}
              onClick={showMoreFavorites}
            >
              Show More
            </Button>
            <Button
              sx={{
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                },
                ml: 2,
              }}
              onClick={showLessFavorites}
            >
              Show Less
            </Button>
          </Box>
        )}
      </Box>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
      <ChangePassword
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={() => setNotification({ open: true, message: 'Password changed successfully.', severity: 'success' })}
        onError={(errorMessage) => setNotification({ open: true, message: errorMessage, severity: 'error' })}
      />
      <VerificationModal
        open={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        email={profile.Email}
        phoneNumber={profile.PhoneNumber}
        type={verificationType}
        onSuccess={handleVerificationSuccess}
        onError={handleVerificationError}
      />
      <LocationInfoModal open={isLocationInfoOpen} onClose={() => setIsLocationInfoOpen(false)} />
      <Dialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Delete Geta3</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Geta3? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteGeta3} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;
