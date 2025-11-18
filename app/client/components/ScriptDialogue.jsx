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
} from "@mui/material";

const ScriptDialogue = ({ open, onClose, topic }) => {
  const [files, setFiles] = useState({
    ppt: null,
    courseMaterial: null,
    referenceMaterial: null,
  });

  useEffect(() => {
    if (!open) {
      setFiles({ ppt: null, courseMaterial: null, referenceMaterial: null });
    }
  }, [open]);

  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSubmit = async () => {
    if (!topic) {
      console.error("No topic selected!");
      onClose();
      return;
    }
    const formData = new FormData();
    formData.append("ppt", files.ppt);
    formData.append("courseMaterial", files.courseMaterial);
    formData.append("referenceMaterial", files.referenceMaterial);
    formData.append("topicId", topic.id || topic.content_id);
    const topicPrefix = `U${topic.unitIndex + 1}T${topic.topicIndex + 1}`;
    formData.append("topicPrefix", topicPrefix);

    try {
      const response = await fetch("______", { // <---API route
        method: "POST",
        body: formData,
      });
      if (!response.ok) console.error("Upload failed");
      else console.log("Upload success");
    } catch (error) {
      console.error("Error uploading:", error);
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

          {/* Reference Material Input */}
          <TextField
            label="Reference Material (Any)"
            name="referenceMaterial"
            value={getFileName(files.referenceMaterial)}
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
                    name="referenceMaterial"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
              ),
            }}
          />
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