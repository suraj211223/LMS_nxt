import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert
} from '@mui/material';

const Createunitmodal = ({ open, onClose, courseId }) => {
  const [data, setData] = useState({
    unitname: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formhandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("course_id", courseId);
      formData.append("unit_title", data.unitname);

      const res = await fetch("/api/teacher/create-unit", {
        method: "POST",
        body: formData, // Sending FormData to handle potential file uploads
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create unit");
      }

      // Success - close modal and reset form
      onClose();
      setData({ unitname: "" });

      // Refresh the page to show new unit
      window.location.reload();

    } catch (error) {
      console.error("Error creating unit:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setData({ unitname: "" });
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Unit</DialogTitle>
      <form onSubmit={submitHandler}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a new unit to organize related topics within this course.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              required
              label="Unit Name"
              name="unitname"
              value={data.unitname}
              onChange={formhandler}
              placeholder="e.g., Introduction to Computing"
              disabled={loading}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Unit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default Createunitmodal;
