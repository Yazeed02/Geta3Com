import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate, BrowserRouter as Router } from 'react-router-dom';
import {
  Container,
  Box,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  CssBaseline,
  Button,
  TextField,
  MenuItem,
  CardMedia,
  Avatar,
  ListItemText,
  Paper
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';
import PostDetail from './components/PostDetail';
import Geta3Create from './components/Geta3Create';
import CarKindPage from './components/CarKindPage';
import SearchResults from './components/SearchResults';
import {
  fetchUser,
  logout,
  refresh_token,
  forgotPassword,
  fetchTopFavorites,
  fetchTopRetailers,
  searchGeta3,
} from './api';
import carKinds from './components/carKinds';
import Notification from './components/Notification';
import RetailerPosts from './components/RetailerPosts';
import TopRetailers from './components/TopRetailers';
import { useTheme } from '@mui/material/styles';

const MainContent = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const [topFavorites, setTopFavorites] = useState([]);
  const [topRetailers, setTopRetailers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);

  const handleShowMoreOrLess = () => {
    setShowMore(!showMore);
  };

  useEffect(() => {
    document.title = "Home - Your Site Name"; // Set the page title dynamically

    const loadTopFavorites = async () => {
      try {
        const favorites = await fetchTopFavorites();
        setTopFavorites(favorites);
      } catch (error) {
        console.error('Error fetching top favorites:', error);
      }
    };

    const loadTopRetailers = async () => {
      try {
        const retailers = await fetchTopRetailers();
        if (retailers.message === 'No top retailers found') {
          setTopRetailers([]); // Handle the case where no retailers are found
        } else {
          setTopRetailers(retailers);
        }
      } catch (error) {
        console.error('Error fetching top retailers:', error);
      }
    };

    loadTopFavorites();
    loadTopRetailers();
  }, []);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 2) {
      setLoading(true);
      try {
        const response = await searchGeta3(value);
        setSearchResults(response.results);
      } catch (error) {
        console.error('Error during search:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSelect = (post) => {
    navigate(`/posts/${post._id}`);
    setSearchTerm('');
    setSearchResults([]);
  };

  const scrollLeft = () => {
    scrollContainerRef.current.scrollBy({ left: -250, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current.scrollBy({ left: 250, behavior: 'smooth' });
  };

  return (
    <Container component="main" sx={{ flexGrow: 1, p: 0, backgroundColor: theme.palette.background.default }}>
      <Box sx={{ px: 2, py: 3 }}>
        <TextField
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t('searchPlaceholder')}
          variant="outlined"
          fullWidth
          sx={{ mb: 3, backgroundColor: theme.palette.background.paper, borderRadius: '8px' }}
          InputProps={{
            endAdornment: loading && <CircularProgress size={20} sx={{ color: theme.palette.text.primary }} />,
            style: { color: theme.palette.text.primary },
          }}
        />
        {searchResults.length > 0 && (
          <Paper sx={{ borderRadius: 2, maxHeight: 300, overflowY: 'auto', mb: 3 }}>
            {searchResults.map((post) => (
              <MenuItem key={post._id} onClick={() => handleSearchSelect(post)}>
                <Avatar src={post.Cover} alt={post.Title} sx={{ mr: 2 }} />
                <ListItemText primary={post.Title} secondary={`${post.brand} ${post.carModel}`} />
              </MenuItem>
            ))}
          </Paper>
        )}
      </Box>
      <Box sx={{ position: 'relative', textAlign: 'center', mb: 4 }}>
        <img
          src="welcomeBG.jpg"
          alt="Welcome"
          style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t('welcomeTitle')}
          </Typography>
          <Typography variant="h6">
            {t('welcomeSubtitle')}
          </Typography>
        </Box>
      </Box>
      <Typography variant="h5" gutterBottom sx={{ mt: 4, px: 2 }}>
        {t('carKinds')}
      </Typography>
      <Grid container spacing={2} sx={{ px: 2 }}>
        {carKinds.slice(0, showMore ? carKinds.length : 12).map((carKind) => (
          <Grid item xs={4} sm={3} md={2} key={carKind.name}>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                sx={{
                  display: 'block',
                  margin: 'auto',
                  padding: 2,
                  backgroundColor: '#ffffff',  // Ensure the background is always white
                  color: theme.palette.mode === 'dark' ? '#000000' : '#000000',
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#f0f0f0' : '#cccccc',
                    color: '#000000',
                  },
                }}
                onClick={() => navigate(`/car-kinds/${carKind.name.toLowerCase()}`)}
              >
                <img src={carKind.logo} alt={carKind.name} style={{ width: 50, height: 50 }} />
              </Button>
              <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>{carKind.name}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
            },
          }}
          onClick={handleShowMoreOrLess}
        >
          {showMore ? 'Show Less' : 'Show More'}
        </Button>
      </Box>
      <Typography variant="h5" gutterBottom sx={{ mt: 4, px: 2 }}>
        {t('topFavorites')}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', px: 2 }}>
        <IconButton onClick={scrollLeft} sx={{ position: 'absolute', left: 0, zIndex: 2 }}>
          <ArrowBackIos />
        </IconButton>
        <Grid
          container
          spacing={2}
          sx={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none', px: 4 }}
          ref={scrollContainerRef}
        >
          {topFavorites.map((geta3) => (
            <Grid item key={geta3._id} sx={{ minWidth: 250 }}>
              <Box
                sx={{
                  textAlign: 'center',
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: '12px',
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                }}
                onClick={() => navigate(`/posts/${geta3._id}`)}
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
                <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, mt: 1 }}>
                  {geta3.Title}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {geta3.Description}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Favorites: {geta3.favoritesCount}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <IconButton onClick={scrollRight} sx={{ position: 'absolute', right: 0, zIndex: 2 }}>
          <ArrowForwardIos />
        </IconButton>
      </Box>
      <Typography variant="h5" gutterBottom sx={{ mt: 4, px: 2 }}>
        {t('topRetailers')}
      </Typography>
      <TopRetailers topRetailers={topRetailers} />
    </Container>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      mode,
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#333333' : '#ffffff',
        secondary: mode === 'light' ? '#777777' : '#cccccc',
      },
    },
  });

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setIsLoginOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');

        if (storedUser && token) {
          setUser(storedUser);
        } else if (refreshToken) {
          const { data } = await refresh_token({ refreshToken });
          localStorage.setItem('token', data.accessToken);
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar
        user={user}
        onSignupOpen={() => setIsSignupOpen(true)}
        onLoginOpen={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onToggleMode={toggleMode}
        currentMode={mode}
        onChangeLanguage={changeLanguage}
      />
      <Signup open={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route
            path="/signup"
            element={<Signup open={isSignupOpen} onClose={() => setIsSignupOpen(false)} />}
          />
          <Route
            path="/login"
            element={
              <Login
                open={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onSuccess={handleLoginSuccess}
              />
            }
          />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route
            path="/admin"
            element={user && user.isAdmin ? <AdminPanel user={user} /> : <MainContent />}
          />
          <Route path="/posts/:postId" element={<PostDetail user={user} />} />
          <Route
            path="/create"
            element={<Geta3Create open={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />}
          />
          <Route path="/car-kinds/:carKind" element={<CarKindPage user={user} />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/retailer-posts/:userId" element={<RetailerPosts />} />
        </Routes>
      </Box>
      <Signup open={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
      <Login open={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
      <Geta3Create open={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
    </ThemeProvider>
  );
};

export default App;
