import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Typography,
  CircularProgress,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CardMedia,
  TextField,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { fetchPostsByCarKind } from '../api';
import Geta3Create from './Geta3Create';
import Notification from './Notification';
import carKinds from './carKinds';
import './CarKindPage.css';

const conditions = ['new', 'used', 'like new'];

const CarKindPage = ({ user }) => {
  const { carKind } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [carModel, setCarModel] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [posts, setPosts] = useState([]);
  const [originalPosts, setOriginalPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const carLogo = carKinds.find(car => car.name.toLowerCase() === carKind.toLowerCase())?.logo;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetchPostsByCarKind(carKind);
        if (response && response.data) {
          const postsWithIndex = response.data.map(post => ({
            ...post,
            imgIndex: 0, // Initialize imgIndex to 0
          }));
          setPosts(postsWithIndex);
          setOriginalPosts(postsWithIndex);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [carKind]);

  useEffect(() => {
    filterPosts();
  }, [searchTerm, selectedConditions, carModel, minPrice, maxPrice]);

  const filterPosts = () => {
    const filteredPosts = originalPosts.filter((post) => {
      const matchesSearchTerm = post.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                post.carModel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(post.condition);
      const matchesCarModel = !carModel || post.carModel.toLowerCase().includes(carModel.toLowerCase());
      const matchesMinPrice = minPrice === '' || post.price >= parseFloat(minPrice);
      const matchesMaxPrice = maxPrice === '' || post.price <= parseFloat(maxPrice);

      return matchesSearchTerm && matchesCondition && matchesCarModel && matchesMinPrice && matchesMaxPrice;
    });
    setPosts(filteredPosts);
  };

  const handleConditionChange = (condition) => {
    setSelectedConditions(prev => 
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  };

  const handleCreatePost = () => {
    if (!user) {
      setNotification({ open: true, message: 'You need to login first.', severity: 'error' });
      navigate('/login');
      return;
    }
    setIsCreatePostOpen(true);
  };

  return (
    <Container className="container" sx={{ color: theme.palette.text.primary, maxWidth: '100%' }}>
      <Box className="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box className="header-title" sx={{ display: 'flex', alignItems: 'center' }}>
          {carLogo && <img src={carLogo} alt={`${carKind} logo`} style={{ marginRight: '10px', height: '50px' }} />}
          <Typography variant="h4" component="h1">
            {carKind.charAt(0).toUpperCase() + carKind.slice(1)} Posts
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#333',
            },
          }}
          onClick={handleCreatePost}
        >
          Create Post
        </Button>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Box className="sidebar" sx={{ padding: 2, borderRadius: 2, boxShadow: 1, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h6" gutterBottom>Filters</Typography>
            <TextField
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 3 }}
            />
            <Typography variant="subtitle1" gutterBottom>Condition</Typography>
              <FormControl component="fieldset">
                {conditions.map((condition) => (
                  <FormControlLabel
                    key={condition}
                    control={
                      <Checkbox
                        checked={selectedConditions.includes(condition)}
                        onChange={() => handleConditionChange(condition)}
                        name={condition}
                        sx={{ color: theme.palette.text.primary }}
                      />
                    }
                    label={condition}
                    sx={{ color: theme.palette.text.primary }}
                  />
                ))}
              </FormControl>
            <TextField
              label="Car Model"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 3 , mt:2}}
            />
            <TextField
              label="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 3 }}
            />
            <TextField
              label="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 3 }}
            />
            
          </Box>
        </Grid>
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post) => (
                  <Grid item key={post._id} xs={12} sm={6} md={4}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        borderRadius: 2,
                        boxShadow: 3,
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: 5,
                        },
                      }}
                      onClick={() => navigate(`/posts/${post._id}`)}
                    >
                   <CardMedia
  component="img"
  image={post.imgs && post.imgs.length > 0 ? post.imgs[0] : '/path/to/default-placeholder.png'}
  alt={post.Title}
  sx={{ height: 180, objectFit: 'cover' }}
/>

                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {post.Title}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                          Model: {post.carModel}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                          Condition: {post.condition}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                          {post.price.toLocaleString()} JOD
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', mt: 5 }}>
                  <Typography variant="h6">No posts available. Try adjusting your search criteria.</Typography>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
      <Geta3Create open={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Container>
  );
};

export default CarKindPage;
