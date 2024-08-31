import React, { useState } from 'react';
import {
  Modal, Box, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl, IconButton, CircularProgress, Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { createGeta3 } from '../api'; // Ensure this API call is properly defined
import Notification from './Notification';

const carTypes = [
  'AlfaRomeo', 'Audi', 'BMW', 'BYD', 'Cadillac', 'Chevrolet', 'Chrysler', 'Citroen', 'Dodge',
  'Fiat', 'Ford', 'GAC', 'GMC', 'Haval', 'Honda', 'Hyundai', 'Isuzu', 'Jeep', 'KIA', 'Land Rover',
  'Lexus', 'Mazda', 'Mercedes', 'MG', 'Mitsubishi', 'Nissan', 'Peugeot', 'Porsche', 'Renault',
  'Skoda', 'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'VW', 'Other'
];

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  width: {
    xs: '90%',  // 90% width on extra-small screens
    sm: '70%',  // 70% width on small screens
    md: '60%',  // 60% width on medium screens
    lg: '50%',  // 50% width on large screens
    xl: '40%',  // 40% width on extra-large screens
  },
  maxHeight: '90vh',
  overflowY: 'auto',
};

const Geta3Create = ({ open, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [relatedLink, setRelatedLink] = useState('');
  const [condition, setCondition] = useState('');
  const [carType, setCarType] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carManufacturingYear, setCarManufacturingYear] = useState('');
  const [price, setPrice] = useState('');
  const [customCarType, setCustomCarType] = useState('');
  const [imgs, setImgs] = useState([]);
  const [imgPreviews, setImgPreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return false;
      } else if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Only JPEG, PNG, and GIF files are allowed');
        return false;
      }
      return true;
    });

    setImgs(validFiles);
    setError('');

    const filePreviews = validFiles.map(file => URL.createObjectURL(file));
    setImgPreviews(filePreviews);
  };

  const handleRemoveImage = (index) => {
    const newImgs = [...imgs];
    const newImgPreviews = [...imgPreviews];
    newImgs.splice(index, 1);
    newImgPreviews.splice(index, 1);
    setImgs(newImgs);
    setImgPreviews(newImgPreviews);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title || !description || !condition || !carType || !carModel || !carManufacturingYear || !price || imgs.length === 0) {
      setError('All fields are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('related_link', relatedLink);
    formData.append('condition', condition);
    formData.append('carType', carType === 'Other' ? customCarType : carType);
    formData.append('carModel', carModel);
    formData.append('carManufacturingYear', carManufacturingYear);
    formData.append('price', price);
    imgs.forEach(img => formData.append('img', img));

    try {
      setLoading(true);
      await createGeta3(formData); // Assuming this function handles the API call
      setNotification({ open: true, message: 'Post created successfully.', severity: 'success' });
      onClose();
    } catch (error) {
      setNotification({ open: true, message: 'Failed to create post. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} BackdropProps={{ onClick: (e) => e.stopPropagation() }}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Create a New Post
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            helperText="Enter a descriptive title."
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            multiline
            rows={4}
            helperText="Enter a detailed description of the item."
          />
          <TextField
            label="Related Link"
            value={relatedLink}
            onChange={(e) => setRelatedLink(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            helperText="Enter a related link (optional)."
          />
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Condition</InputLabel>
            <Select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="used">Used</MenuItem>
              <MenuItem value="like new">Like New</MenuItem>
            </Select>
            <Typography variant="caption">Select the condition of the item.</Typography>
          </FormControl>
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Car Type</InputLabel>
            <Select
              value={carType}
              onChange={(e) => setCarType(e.target.value)}
            >
              {carTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption">Select the type of car.</Typography>
          </FormControl>
          {carType === 'Other' && (
            <TextField
              label="Custom Car Type"
              value={customCarType}
              onChange={(e) => setCustomCarType(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
              helperText="Enter the custom car type."
            />
          )}
          <TextField
            label="Car Model"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            helperText="Enter the car model."
          />
          <TextField
            label="Car Manufacturing Year"
            value={carManufacturingYear}
            onChange={(e) => setCarManufacturingYear(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            helperText="Enter the car's manufacturing year."
          />
          <TextField
            label="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            type="number"
            helperText="Enter the price of the item."
          />
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mt: 2, backgroundColor: '#000000', color: 'white', '&:hover': { backgroundColor: '#333333' } }}
          >
            Upload Images
            <input
              type="file"
              hidden
              accept="image/jpeg,image/png,image/gif"
              multiple
              onChange={handleFileChange}
            />
          </Button>
          <Typography variant="caption">Upload JPEG, PNG, or GIF images (max 5MB each).</Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {imgPreviews.map((src, index) => (
              <Grid item xs={6} sm={4} md={3} key={index} sx={{ position: 'relative' }}>
                <img src={src} alt={`Preview ${index + 1}`} style={{ width: '100%', height: 'auto' }} />
                <IconButton
                  onClick={() => handleRemoveImage(index)}
                  sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            ))}
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, backgroundColor: '#000000', color: 'white', '&:hover': { backgroundColor: '#333333' } }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </form>
        <Notification
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          onClose={handleNotificationClose}
        />
      </Box>
    </Modal>
  );
};

export default Geta3Create;
