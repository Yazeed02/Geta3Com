import React, { useEffect, useState } from 'react';
import { fetchItemsToApprove, approveItem, unAuthorizeItem } from '../api';
import { Box, Grid, Typography, Card, CardContent, Button, Container } from '@mui/material';

const AdminPanel = () => {
  const [itemsToApprove, setItemsToApprove] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await fetchItemsToApprove();
        setItemsToApprove(data.Geta3s);
      } catch (error) {
        setError('Failed to fetch items to approve.');
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (itemId) => {
    try {
      await approveItem(itemId);
      setItemsToApprove(itemsToApprove.filter(item => item._id !== itemId));
    } catch (error) {
      alert('Failed to approve item.');
    }
  };

  const handleUnAuthorize = async (itemId) => {
    try {
      await unAuthorizeItem(itemId);
      setItemsToApprove(itemsToApprove.filter(item => item._id !== itemId));
    } catch (error) {
      alert('Failed to un-authorize item.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={2}>
        {itemsToApprove.length === 0 ? (
          <Typography variant="h6">No items to approve.</Typography>
        ) : (
          itemsToApprove.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{item.Title}</Typography>
                  <Typography variant="body2">{item.Description}</Typography>
                  <Typography variant="body2">Condition: {item.condition}</Typography>
                  <Typography variant="body2">Car Type: {item.carType}</Typography>
                  <Typography variant="body2">Car Model: {item.carModel}</Typography>
                  {item.Related_link && (
                    <Typography variant="body2">
                      <a href={item.Related_link} target="_blank" rel="noopener noreferrer">Related Link</a>
                    </Typography>
                  )}
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button onClick={() => handleApprove(item._id)} variant="contained" color="primary">Approve</Button>
                    <Button onClick={() => handleUnAuthorize(item._id)} variant="contained" color="secondary">UnAuthorize</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default AdminPanel;
