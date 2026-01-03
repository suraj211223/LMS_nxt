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
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Collapse
} from '@mui/material';
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
        sx={{ fontWeight: 'bold', textTransform: 'none', justifyContent: 'flex-start', mt: 1 }}
      >
        Add {label}
      </Button>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        {/* Allow collapsing if empty, or just visual header */}
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
            cursor: 'default', // Default cursor for the box, button has pointer
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


const CreateTopicmodal = ({ open, onClose, unitId }) => {
  const [data, setData] = useState({
    topicname: "",
    duration: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Separate State for each category
  const [pptFile, setPptFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [refFiles, setRefFiles] = useState([]);

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

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Failed to create topic");
      }

      // Topic created, now upload files if any exist
      if (pptFile || docFile || refFiles.length > 0) {
        const topicId = resData.topicId;
        const formData = new FormData();
        formData.append("topicId", topicId);
        formData.append("topicPrefix", "TEMP");

        if (pptFile) formData.append("ppt", pptFile);
        if (docFile) formData.append("courseMaterial", docFile);
        refFiles.forEach(r => formData.append("referenceMaterials", r));

        const uploadRes = await fetch("/api/teacher/upload-topic-materials", {
          method: "POST",
          body: formData
        });

        if (!uploadRes.ok) {
          console.error("File upload failed but topic created");
        }
      }

      // Success - close modal and reset form
      onClose();
      setData({ topicname: "", duration: "" });
      setPptFile(null);
      setDocFile(null);
      setRefFiles([]);

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
    setPptFile(null);
    setDocFile(null);
    setRefFiles([]);
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

            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Topic Materials</Typography>

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
                accept={undefined} // Accept all
                multiple={true}
                onDrop={(acceptedFiles) => setRefFiles(prev => [...prev, ...acceptedFiles])}
                files={refFiles}
                onDelete={(index) => setRefFiles(prev => prev.filter((_, i) => i !== index))}
              />
            </Box>

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
