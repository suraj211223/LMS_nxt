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
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Typography
} from "@mui/material";
import { useDropzone } from 'react-dropzone';
import { CloudUpload, Delete, InsertDriveFile, Description, Slideshow, Close, Add } from '@mui/icons-material';

const FileUploadBox = ({ label, accept, onDrop, file, onDelete, multiple = false, files = [] }) => {
  const [expanded, setExpanded] = useState(false);

  // Auto-expand if files exist
  React.useEffect(() => {
    if (file || (multiple && files.length > 0)) {
      setExpanded(true);
    }
  }, [file, files, multiple]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    multiple,
    noClick: true, // We will bind click to the specific button
    noKeyboard: true
  });

  if (!expanded && !file && (!files || files.length === 0)) {
    return (
      <Button
        startIcon={<Add />}
        onClick={() => setExpanded(true)}
        sx={{ fontWeight: 'bold', textTransform: 'none', justifyContent: 'flex-start' }}
      >
        Add {label}
      </Button>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        {!file && (!files || files.length === 0) && (
          <IconButton size="small" onClick={() => setExpanded(false)}><Close fontSize="small" /></IconButton>
        )}
      </Box>

      {/* Dropzone Area */}
      {(!file && !multiple) || (multiple) ? (
        <Paper
          variant="outlined"
          {...getRootProps()}
          sx={{
            p: 3,
            textAlign: 'center',
            backgroundColor: isDragActive ? '#f0f7ff' : '#fafafa',
            borderStyle: 'dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            cursor: 'default',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}
        >
          <input {...getInputProps()} />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Drag and drop {multiple ? "files" : "file"} here
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: 'block' }}>
            - OR -
          </Typography>
          <Button variant="outlined" size="small" onClick={open}>
            Browse Files
          </Button>
        </Paper>
      ) : null}

      {/* Selected File(s) Display */}
      {(file || (files && files.length > 0)) && (
        <List dense sx={{ bgcolor: 'background.paper', border: '1px solid #eee', borderRadius: 1, mt: 1 }}>
          {!multiple && file && (
            <ListItem
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={onDelete}>
                  <Delete />
                </IconButton>
              }
            >
              <ListItemIcon><InsertDriveFile /></ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                primaryTypographyProps={{ noWrap: true, maxWidth: '200px' }}
              />
            </ListItem>
          )}
          {multiple && files.map((f, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => onDelete(index)}>
                  <Delete />
                </IconButton>
              }
            >
              <ListItemIcon><InsertDriveFile /></ListItemIcon>
              <ListItemText
                primary={f.name}
                secondary={`${(f.size / 1024 / 1024).toFixed(2)} MB`}
                primaryTypographyProps={{ noWrap: true, maxWidth: '200px' }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

const ScriptDialogue = ({ open, onClose, topic, onUploadSuccess }) => {
  const [pptFile, setPptFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [refFiles, setRefFiles] = useState([]);

  useEffect(() => {
    if (!open) {
      setPptFile(null);
      setDocFile(null);
      setRefFiles([]);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!topic) {
      console.error("No topic selected!");
      onClose();
      return;
    }
    const formData = new FormData();

    if (pptFile) formData.append("ppt", pptFile);
    if (docFile) formData.append("courseMaterial", docFile);
    refFiles.forEach(r => formData.append("referenceMaterials", r));

    formData.append("topicId", topic.content_id);

    // Updated naming scheme: U{unit}V{topic}
    const unitPadded = (topic.unitIndex + 1).toString().padStart(2, "0");
    const topicPadded = (topic.topicIndex + 1).toString().padStart(2, "0");
    const topicPrefix = `U${unitPadded}V${topicPadded}`;
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
        <Stack spacing={1} sx={{ mt: 2 }}>

          {/* PPT Upload */}
          <FileUploadBox
            label="Presentation (PPT)"
            accept={{ 'application/vnd.ms-powerpoint': ['.ppt'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] }}
            onDrop={(acceptedFiles) => { if (acceptedFiles[0]) setPptFile(acceptedFiles[0]); }}
            file={pptFile}
            onDelete={() => setPptFile(null)}
          />

          {/* Doc Upload */}
          <FileUploadBox
            label="Course Material (PDF/Doc)"
            accept={{ 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }}
            onDrop={(acceptedFiles) => { if (acceptedFiles[0]) setDocFile(acceptedFiles[0]); }}
            file={docFile}
            onDelete={() => setDocFile(null)}
          />

          {/* Reference Upload */}
          <FileUploadBox
            label="Reference Materials (Zip/Any)"
            accept={undefined}
            multiple={true}
            onDrop={(acceptedFiles) => setRefFiles(prev => [...prev, ...acceptedFiles])}
            files={refFiles}
            onDelete={(index) => setRefFiles(prev => prev.filter((_, i) => i !== index))}
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