"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Grid,
  IconButton,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip
} from "@mui/material";
import { Edit, Visibility, ExpandMore, VideoCall, Upload, CheckCircle } from "@mui/icons-material";

const EditorDash = () => {
  const [stats, setStats] = useState({
    totalTopics: 0,
    published: 0,
    inEditing: 0,
    scripted: 0,
    underReview: 0,
    readyForVideo: 0
  });
  const [topicsInProgress, setTopicsInProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [videoLink, setVideoLink] = useState("");

  // Workflow steps for progress bar
  const workflowSteps = [
    { id: 'Planned', label: 'Planned', color: '#64748b' },
    { id: 'Scripted', label: 'Scripted', color: '#3b82f6' },
    { id: 'Editing', label: 'Editing', color: '#f59e0b' },
    { id: 'Post-Editing', label: 'Post-Editing', color: '#f59e0b' },
    { id: 'Ready_for_Video_Prep', label: 'Ready for Video', color: '#10b981' },
    { id: 'Under_Review', label: 'Under Review', color: '#8b5cf6' },
    { id: 'Published', label: 'Published', color: '#22c55e' }
  ];

  // Filter topics to show those in "Editing", "Scripted", "Post-Editing", "Ready_for_Video_Prep", "Under_Review", or "Published" status
  const editingTopics = topicsInProgress.filter(topic =>
    ['Scripted', 'Editing', 'Post-Editing', 'Ready_for_Video_Prep', 'Under_Review', 'Published'].includes(topic.workflow_status)
  );

  // Handle record button click
  const handleRecordClick = async (topic) => {
    if (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') {
      // Update status to Post-Editing
      try {
        const res = await fetch(`/api/topics/update-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topicId: topic.content_id,
            newStatus: 'Post-Editing'
          }),
        });

        if (res.ok) {
          // Refresh data
          fetchDashboardData();
        }
      } catch (error) {
        console.error('Error updating status:', error);
      }
    } else if (['Post-Editing', 'Ready_for_Video_Prep', 'Under_Review'].includes(topic.workflow_status)) {
      // Show upload modal for initial upload OR editing existing link
      setCurrentTopic(topic);
      setVideoLink(topic.video_link || ""); // Pre-fill if exists (need to ensure API returns video_link)
      setUploadModalOpen(true);
    }
  };

  // Handle video upload
  const handleVideoUpload = async () => {
    if (!videoLink || !currentTopic) return;

    try {
      const res = await fetch(`/api/editor/upload-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: currentTopic.content_id,
          videoLink: videoLink,
          newStatus: 'Ready_for_Video_Prep'
        }),
      });

      if (res.ok) {
        setUploadModalOpen(false);
        setVideoLink('');
        setCurrentTopic(null);
        // Refresh data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  // Calculate progress percentage based on workflow status
  const getWorkflowProgress = (status) => {
    const stepIndex = workflowSteps.findIndex(step => step.id === status);
    return stepIndex >= 0 ? ((stepIndex + 1) / workflowSteps.length) * 100 : 0;
  };

  // Get color for current workflow status
  const getStatusColor = (status) => {
    const step = workflowSteps.find(step => step.id === status);
    return step ? step.color : '#64748b';
  };

  // Fetch data for dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/editor/dashboard");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      console.log("Dashboard data received:", data);

      if (data.stats) {
        setStats(data.stats);
      }
      if (data.topicsInProgress) {
        setTopicsInProgress(data.topicsInProgress);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
      <h2 className="pt-20 pl-20 text-4xl font-bold">Editor Dashboard</h2>

      {error && (
        <div className="pt-4 pl-20 text-red-500">
          Error loading dashboard: {error}
        </div>
      )}

      {loading ? (
        <div className="pt-8 pl-20">Loading dashboard...</div>
      ) : (
        <>
          {/* DASHBOARD CARDS */}
          <Grid container spacing={3} direction="row" className="pt-8 px-20">
            {[
              { label: "Total Topics", value: stats.totalTopics, bg: "rgba(59,130,246,0.1)", color: "#1d4ed8", borderColor: "#3b82f6" },
              { label: "Published", value: stats.published, bg: "rgba(34,197,94,0.1)", color: "#15803d", borderColor: "#22c55e" },
              { label: "In Editing", value: stats.inEditing + (stats.scripted || 0), bg: "rgba(251,146,60,0.1)", color: "#c2410c", borderColor: "#fb923c" },
              { label: "Under Review", value: stats.underReview, bg: "rgba(168,85,247,0.1)", color: "#7c2d12", borderColor: "#a855f7" },
              { label: "Ready for Video", value: stats.readyForVideo, bg: "rgba(6,182,212,0.1)", color: "#0e7490", borderColor: "#06b6d4" },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                <Card
                  sx={{
                    p: 3,
                    border: `2px solid ${item.borderColor}`,
                    borderRadius: "16px",
                    background: `linear-gradient(135deg, ${item.bg} 0%, rgba(255,255,255,0.9) 100%)`,
                    height: "140px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                    }
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: item.color,
                      fontWeight: 600,
                      textAlign: "center",
                      fontSize: "1rem",
                      mb: 1
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "#000",
                      fontWeight: 700,
                      fontSize: "2.5rem"
                    }}
                  >
                    {item.value || 0}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* TOPICS IN EDITING SECTION */}
          <Box sx={{ mx: 20, mt: 8 }}>
            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3
            }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: "#374151" }}>
                Topics in Editing
              </Typography>
              <Chip
                label={`${editingTopics.length} Active`}
                sx={{

                  color: "black",
                  fontWeight: 600
                }}
              />
            </Box>

            {/* ACCORDION TOPIC LAYOUT */}
            <Paper sx={{
              p: 3,
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.05)"
            }}>
              {editingTopics.length > 0 ? (
                <div className="space-y-4">
                  {editingTopics.map((topic, index) => (
                    <Accordion
                      key={topic.content_id}
                      expanded={expandedTopic === topic.content_id}
                      onChange={() =>
                        setExpandedTopic(expandedTopic === topic.content_id ? null : topic.content_id)
                      }
                      sx={{
                        border: `2px solid ${getStatusColor(topic.workflow_status)}`,
                        borderRadius: "12px !important",
                        "&:before": { display: "none" },
                        "&.Mui-expanded": { margin: "0 0 16px 0" }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{
                          backgroundColor: `${getStatusColor(topic.workflow_status)}10`,
                          borderRadius: "12px",
                          "&.Mui-expanded": { borderRadius: "12px 12px 0 0" }
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Chip
                              label={`Topic ${index + 1}`}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(topic.workflow_status),
                                color: "white",
                                fontWeight: 600
                              }}
                            />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {topic.topic_title}
                            </Typography>
                            <Chip
                              label={topic.workflow_status.replace('_', ' ')}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: getStatusColor(topic.workflow_status),
                                color: getStatusColor(topic.workflow_status)
                              }}
                            />
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 2 }}>
                            {topic.estimated_duration_min && (
                              <Chip
                                label={`${topic.estimated_duration_min} min`}
                                size="small"
                                sx={{ backgroundColor: "#e5e7eb", color: "#374151" }}
                              />
                            )}
                          </Box>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ backgroundColor: "#f9fafb", borderRadius: "0 0 12px 12px" }}>
                        <Box sx={{ p: 2 }}>
                          {/* Topic Details */}
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: "#374151", fontWeight: 600 }}>
                                  Topic Information
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                                    <strong>Course:</strong> {topic.course_title}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                                    <strong>Unit:</strong> {topic.unit_title}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                                    <strong>Program:</strong> {topic.program_name}
                                  </Typography>
                                  {topic.estimated_duration_min && (
                                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                                      <strong>Duration:</strong> {topic.estimated_duration_min} min
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              {/* Workflow Progress */}
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: "#374151", fontWeight: 600 }}>
                                  Workflow Progress
                                </Typography>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: "#6b7280" }}>
                                    Current Status
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: getStatusColor(topic.workflow_status)
                                    }}
                                  >
                                    {Math.round(getWorkflowProgress(topic.workflow_status))}% Complete
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={getWorkflowProgress(topic.workflow_status)}
                                  sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: "#e5e7eb",
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: getStatusColor(topic.workflow_status),
                                      borderRadius: 5
                                    }
                                  }}
                                />
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Action Buttons */}
                          <Box sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 2,
                            pt: 3,
                            borderTop: "1px solid #e5e7eb"
                          }}>
                            <Tooltip title="Edit Topic">
                              <IconButton
                                size="medium"
                                sx={{
                                  backgroundColor: "#3b82f6",
                                  color: "white",
                                  "&:hover": { backgroundColor: "#2563eb" }
                                }}
                                onClick={() => console.log('Edit topic:', topic.content_id)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="View Topic Details">
                              <IconButton
                                size="medium"
                                sx={{
                                  backgroundColor: "#10b981",
                                  color: "white",
                                  "&:hover": { backgroundColor: "#059669" }
                                }}
                                onClick={() => console.log('View topic:', topic.content_id)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>

                            <Tooltip
                              title={
                                (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted')
                                  ? "Start Recording"
                                  : (topic.workflow_status === 'Post-Editing' ? "Upload Video" : (topic.workflow_status === 'Published' ? "Complete Task" : "Edit Video Link"))
                              }
                            >
                              <Button
                                variant="contained"
                                startIcon={
                                  (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') ? <VideoCall /> : (topic.workflow_status === 'Published' ? <CheckCircle /> : <Upload />)
                                }
                                onClick={() => {
                                  if (topic.workflow_status === 'Published') {
                                    if (window.confirm("Mark this task as fully complete? This will remove it from your active list.")) {
                                      // Here we would ideally update status to 'Completed', but since we can't change schema,
                                      // we'll just filter it out locally or refresh to show it's done. 
                                      // For now, let's just alert.
                                      alert("Great job! Task marked as complete.");
                                      // Optionally, we could trigger a refresh or local state update to hide it.
                                      setTopicsInProgress(prev => prev.filter(t => t.content_id !== topic.content_id));
                                    }
                                  } else {
                                    handleRecordClick(topic);
                                  }
                                }}
                                sx={{
                                  backgroundColor: (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') ? "#dc2626" : (topic.workflow_status === 'Published' ? "#10b981" : "#7c3aed"),
                                  "&:hover": {
                                    backgroundColor: (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') ? "#b91c1c" : (topic.workflow_status === 'Published' ? "#059669" : "#6d28d9")
                                  },
                                  fontWeight: 600
                                }}
                              >
                                {(topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') ? "Record" : (topic.workflow_status === 'Post-Editing' ? "Upload Video" : (topic.workflow_status === 'Published' ? "Finish" : "Edit Video Link"))}
                              </Button>
                            </Tooltip>

                            {/* Feedback Button - Only show if review notes exist */}
                            {topic.review_notes && (
                              <Tooltip title="View Teacher Feedback">
                                <Button
                                  variant="outlined"
                                  startIcon={<Visibility />}
                                  onClick={() => alert(`Feedback: ${topic.review_notes}`)} // Replace with a proper modal if needed
                                  sx={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                                >
                                  Feedback
                                </Button>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </div>
              ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography variant="h6" sx={{ color: "#6b7280", mb: 1 }}>
                    No topics currently in editing
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                    Topics in "Editing" status will appear here
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>

          {/* VIDEO UPLOAD MODAL */}
          <Dialog
            open={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 600, color: "#374151" }}>
              Upload Video Link
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
                Upload the video link for: <strong>{currentTopic?.topic_title}</strong>
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Video Link (URL)"
                type="url"
                fullWidth
                variant="outlined"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://example.com/video-link"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px"
                  }
                }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button
                onClick={() => setUploadModalOpen(false)}
                variant="outlined"
                sx={{ borderRadius: "8px" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVideoUpload}
                variant="contained"
                disabled={!videoLink}
                startIcon={<Upload />}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 600
                }}
              >
                Upload Video
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default EditorDash;
