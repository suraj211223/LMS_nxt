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

const CreateTopicmodal = ({ open, onClose, unitId }) => {
  const [data, setData] = useState({
    topicname: "",
    duration: ""
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
      const res = await fetch("/api/teacher/create-topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          unitId: unitId,
          topicName: data.topicname,
          duration: data.duration
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create topic");
      }

      // Success - close modal and reset form
      onClose();
      setData({ topicname: "", duration: "" });
      
      // Refresh the page to show new topic
      window.location.reload();

    } catch (error) {
      console.error("Error creating topic:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setData({ topicname: "", duration: "" });
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Topic</DialogTitle>
      <form onSubmit={submitHandler}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add a new topic to this unit. Topics represent specific learning content.
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
              label="Topic Name"
              name="topicname"
              value={data.topicname}
              onChange={formhandler}
              placeholder="e.g., Variables and Data Types"
              disabled={loading}
              fullWidth
            />

            <TextField
              label="Estimated Duration (minutes)"
              name="duration"
              type="number"
              value={data.duration}
              onChange={formhandler}
              placeholder="e.g., 45"
              disabled={loading}
              fullWidth
              inputProps={{ min: 0 }}
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
            {loading ? "Creating..." : "Create Topic"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateTopicmodal;
