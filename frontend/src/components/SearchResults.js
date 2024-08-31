import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Grid, Typography, CircularProgress, Card, CardContent, CardMedia } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { searchGeta3 } from '../api';
import './SearchResults.css';

const SearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();  // Access the current theme
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = new URLSearchParams(location.search);
  const term = query.get('term');
  const carType = query.get('carType');
  const condition = query.get('condition');
  const carModel = query.get('carModel');

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await searchGeta3(term, carType, condition, carModel);
        if (response && response.data) {
          setPosts(response.data.Geta3_list);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [term, carType, condition, carModel]);

  return (
    <Container component="main" className="search-results-container" sx={{ color: theme.palette.text.primary }}>
      <Typography variant="h4" gutterBottom>
        Search Results for "{term}"
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(posts) && posts.length > 0 ? (
            posts.map((post) => (
              <Grid item key={post._id} xs={12} sm={6} md={4}>
                <Card
                  className="post-card"
                  onClick={() => navigate(`/posts/${post._id}`)}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                  }}
                >
                  <CardMedia
                    component="img"
                    className="card-media"
                    image={post.Cover || 'path_to_placeholder_image'}
                    alt={post.Title}
                    sx={{ height: 200, objectFit: 'cover' }} // Adjust the size of the image
                  />
                  <CardContent>
                    <Typography variant="h6">{post.Title}</Typography>
                    <Typography>{post.Description}</Typography>
                    <Typography variant="caption">Condition: {post.condition}</Typography>
                    <Typography variant="caption">Model: {post.carModel}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="h6">No posts found</Typography>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default SearchResults;
