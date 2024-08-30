import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Box, Typography, Card, CardContent, CardMedia } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const TopRetailers = ({ topRetailers }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleRetailerClick = (userId) => {
    navigate(`/retailer-posts/${userId}`);
  };

  return (
    <Grid container spacing={4}>
      {topRetailers.length > 0 ? (
        topRetailers.map((retailer) => (
          <Grid item xs={12} sm={6} md={4} key={retailer._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: 2,
                boxShadow: 3,
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 5,
                },
              }}
              onClick={() => handleRetailerClick(retailer._id)}
            >
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {retailer.FirstName} {retailer.LastName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                  Username: {retailer.Username}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                  Email: {retailer.Email}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                  Phone: {retailer.PhoneNumber}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                  Posts: {retailer.postCount || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Typography variant="h6" align="center" sx={{ width: '100%', mt: 4 }}>
          No top retailers found.
        </Typography>
      )}
    </Grid>
  );
};

export default TopRetailers;
