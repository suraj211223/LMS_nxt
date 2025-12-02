"use client";
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';

const AddUnitdialogue = ({ open, onClose, onAddUnit }) => {
  const [unitData, setUnitData] = useState({
    name: '',
    description: ''
  });

  const handleInputChange = (field) => (event) => {
    setUnitData({
      ...unitData,
      [field]: event.target.value
    });
  };

  const handleSubmit = () => {
    if (unitData.name.trim()) {
      // Generate a unique ID for the new unit
      const newUnit = {
        id: `u${Date.now()}`,
        name: unitData.name.trim(),
        description: unitData.description.trim(),
        topics: []
      };
      
      onAddUnit(newUnit);
      handleClose();
    }
  };

  const handleClose = () => {
    setUnitData({ name: '', description: '' });
    onClose();
  };

  const isFormValid = unitData.name.trim().length > 0;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Add New Unit
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="normal"
            label="Unit Name"
            placeholder="e.g., Introduction to Algorithms"
            fullWidth
            variant="outlined"
            value={unitData.name}
            onChange={handleInputChange('name')}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="normal"
            label="Unit Description"
            placeholder="Brief description of the unit (optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={unitData.description}
            onChange={handleInputChange('description')}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid}
        >
          Add Unit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUnitdialogue;
