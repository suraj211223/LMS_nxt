"use client";

import React, { useState, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  Paper,
} from "@mui/material";

const VideoUploadModal = ({ open, onClose, topic, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Handle drag drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  // Manual file upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
    }
  };

  // Submit file to API
  const handleSubmit = async () => {
    if (!file) return alert("Please select a video first.");

    const formData = new FormData();
    formData.append("video", file);
    if (topic?.content_id) {
      formData.append("topicId", topic.content_id);
    }

    try {
      const res = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      alert("Uploaded successfully!");
      setFile(null);
      
      // Call the completion callback to update workflow
      if (onUploadComplete) {
        onUploadComplete();
      }
      
      onClose();
    } catch (err) {
      alert("Error uploading video");
      console.error(err);
    }
  };

  return (
    <Modal open={open} onClose={onClose} keepMounted>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 3,
          box boxShadow: 24,
        }}
      >
        <Typography variant="h6" mb={2} fontWeight={600}>
          Upload Video {topic?.name && `- ${topic.name}`}
        </Typography>

        {/* DRAG & DROP AREA */}
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: "center",
            borderStyle: "dashed",
            borderColor: "#9ca3af",
            background: "#f9fafb",
            cursor: "pointer",
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current.click()}
        >
          <Typography variant="body1" color="text.secondary" mb={1}>
            Drag & Drop your video here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to upload
          </Typography>

          <input
            type="file"
            hidden
            accept="video/*"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </Paper>

        {/* SHOW SELECTED FILE */}
        {file && (
          <Box mt={3} p={2} border="1px solid #e5e7eb" borderRadius={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Selected File:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {file.name} — {(file.size / (1024 * 1024)).toFixed(2)} MB
            </Typography>
          </Box>
        )}

        {/* BUTTONS */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={!file}
            onClick={handleSubmit}
          >
            Upload
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default VideoUploadModal;
