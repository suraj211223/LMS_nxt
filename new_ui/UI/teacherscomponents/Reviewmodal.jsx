"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";

const VideoPlayerModal = ({ open, onClose, videoId, onApprove }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch video link from API
  const fetchVideo = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/videos/${videoId}`);
      if (!res.ok) throw new Error("Failed to load video");

      const data = await res.json();
      setVideoUrl(data.videoUrl); 
      setError("");
    } catch (err) {
      setError(err.message);
      setVideoUrl("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && videoId) fetchVideo();
  }, [open, videoId]);

  const handleSubmit = () => {
    console.log("Approving topic:", videoId);
    // Call the approval callback
    if (onApprove) {
      onApprove();
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} keepMounted>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" mb={2}>
          Review Video for Approval
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center">
            {error}
          </Typography>
        ) : (
          <video
            src={videoUrl}
            controls
            style={{
              width: "100%",
              height: "320px",
              borderRadius: "8px",
              background: "#000",
            }}
          />
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || error}
            color="success"
            sx={{ fontWeight: 600 }}
          >
            Approve Topic
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default VideoPlayerModal;
