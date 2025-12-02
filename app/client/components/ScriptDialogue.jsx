"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Chip,
  Box
} from "@mui/material";

const ScriptDialogue = ({ open, onClose, topic, onUploadSuccess }) => {
  const [files, setFiles] = useState({
    ppt: null,
    courseMaterial: null,
    referenceMaterials: [], // Changed to array for multiple files
  });

  useEffect(() => {
    if (!open) {
      setFiles({ ppt: null, courseMaterial: null, referenceMaterials: [] });
    }
  }, [open]);

  const handleFileChange = (e) => {
    if (e.target.name === "referenceMaterials") {
      // Append new files to existing array
      setFiles({
        ...files,
        referenceMaterials: [...files.referenceMaterials, ...Array.from(e.target.files)],
      });
    } else {
      setFiles({
        ...files,
        [e.target.name]: e.target.files[0],
      });
    }
  };

  const removeReferenceFile = (index) => {
    const newFiles = [...files.referenceMaterials];
    newFiles.splice(index, 1);
    setFiles({ ...files, referenceMaterials: newFiles });
  };

  const handleSubmit = async () => {
    if (!topic) {
      console.error("No topic selected!");
      onClose();
      return;
    }
    const formData = new FormData();
    if (files.ppt) formData.append("ppt", files.ppt);
    if (files.courseMaterial) formData.append("courseMaterial", files.courseMaterial);

    // Append all reference materials
    files.referenceMaterials.forEach((file) => {
      formData.append("referenceMaterials", file);
    });

    formData.append("topicId", topic.content_id);

    // Updated naming scheme: U{unit}V{topic}
    const topicPrefix = `U${topic.unitIndex + 1}V${topic.topicIndex + 1}`;
    formData.append("topicPrefix", topicPrefix);

    try {
      const response = await fetch("/api/teacher/upload-topic-materials", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed:", response.status, errorText);
        alert(`Upload failed: ${errorText}`);
      } else {
        console.log("Upload success");
        alert("Materials uploaded successfully!");
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert(`Error uploading: ${error.message}`);
    }
    onClose();
  };

  const getFileName = (file) => (file ? file.name : "");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: {
          style: {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      <DialogTitle>
        Upload Materials for:
        {topic ? (
          <span style={{ display: "block", color: "#1976d2", fontSize: "0.9em" }}>
            {`U${topic.unitIndex + 1}T${topic.topicIndex + 1}: ${topic.name}`}
          </span>
        ) : (
          "Topic"
        )}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* PPT Input */}
          <TextField
            label="PPT File (.ppt, .pptx)"
            name="ppt"
            value={getFileName(files.ppt)}
            disabled
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                "-webkit-text-fill-color": "#000",
                opacity: 1,
                cursor: "default",
              },
              "& .MuiInputBase-root": {
                paddingRight: "120px",
              },
            }}
            InputProps={{
              endAdornment: (
                <Button
                  variant="contained"
                  component="label"
                  sx={{ position: "absolute", right: 14 }}
                >
                  Choose File
                  <input
                    type="file"
                    name="ppt"
                    accept=".ppt,.pptx"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
              ),
            }}
          />

          {/* Course Material Input */}
          <TextField
            label="Course Material (.pdf, .doc)"
            name="courseMaterial"
            value={getFileName(files.courseMaterial)}
            disabled
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                "-webkit-text-fill-color": "#000",
                opacity: 1,
                cursor: "default",
              },
              "& .MuiInputBase-root": {
                paddingRight: "120px",
              },
            }}
            InputProps={{
              endAdornment: (
                <Button
                  variant="contained"
                  component="label"
                  sx={{ position: "absolute", right: 14 }}
                >
                  Choose File
                  <input
                    type="file"
                    name="courseMaterial"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
              ),
            }}
          />

          {/* Reference Material Input (Multiple) */}
          <Box>
            <TextField
              label="Reference Materials (Multiple)"
              name="referenceMaterials"
              value={`${files.referenceMaterials.length} files selected`}
              disabled
              fullWidth
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  "-webkit-text-fill-color": "#000",
                  opacity: 1,
                  cursor: "default",
                },
                "& .MuiInputBase-root": {
                  paddingRight: "120px",
                },
              }}
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ position: "absolute", right: 14 }}
                  >
                    Add Files
                    <input
                      type="file"
                      name="referenceMaterials"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
                      onChange={handleFileChange}
                      multiple // Allow multiple files
                      hidden
                    />
                  </Button>
                ),
              }}
            />
            {/* Display selected files as chips */}
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {files.referenceMaterials.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() => removeReferenceFile(index)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScriptDialogue;