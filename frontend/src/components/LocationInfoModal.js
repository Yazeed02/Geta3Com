import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const LocationInfoModal = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2">
          How to Get Your Location Link
        </Typography>
        <Typography sx={{ mt: 2 }}>
          1. Open Google Maps on your device.
        </Typography>
        <Typography sx={{ mt: 2 }}>
          2. Find your location by searching for an address or using your device's GPS.
        </Typography>
        <Typography sx={{ mt: 2 }}>
          3. Once you have found your location, right-click on the map and select "What's here?".
        </Typography>
        <Typography sx={{ mt: 2 }}>
          4. A small box will appear at the bottom with coordinates. Click on the coordinates.
        </Typography>
        <Typography sx={{ mt: 2 }}>
          5. A new panel will open on the left side of the screen with more details. Click the "Share" button.
        </Typography>
        <Typography sx={{ mt: 2 }}>
          6. Copy the link provided and paste it into the location field.
        </Typography>
        <Button onClick={onClose} variant="contained" color="primary" sx={{ mt: 2 }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default LocationInfoModal;
