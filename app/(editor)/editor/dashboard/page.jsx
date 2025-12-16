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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { Edit, Visibility, ExpandMore, VideoCall, Upload, CheckCircle, Description, Slideshow, FolderZip, ReportProblem, Search } from "@mui/icons-material";

const EditorDash = () => {
  const [stats, setStats] = useState({
    totalTopics: 0,
    published: 0,
    inEditing: 0,
    scripted: 0,
    underReview: 0,
    readyForVideo: 0,
    approved: 0
  });
  const [topicsInProgress, setTopicsInProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [additionalLink, setAdditionalLink] = useState(""); // New State
  const [viewedFeedbackTopics, setViewedFeedbackTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [canPublish, setCanPublish] = useState(false);

  const editingTopics = (topicsInProgress || []).filter(topic => {
    // Filter by status
    if (filterStatus !== "All") {
      if (filterStatus === "In Editing" && !['Editing', 'Scripted', 'Post_Editing'].includes(topic.workflow_status)) return false;
      if (filterStatus === "Under Review" && !['Under_Review', 'ReadyForVideoPrep'].includes(topic.workflow_status)) return false;
      if (filterStatus === "Approved" && topic.workflow_status !== 'Approved') return false;
    }

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (topic.assigned_editor_name && topic.assigned_editor_name.toLowerCase().includes(query)) ||
      (topic.topic_title && topic.topic_title.toLowerCase().includes(query))
    );
  });

  const workflowSteps = [
    { id: 'Planned', label: 'Planned', color: '#64748b' },
    { id: 'Scripted', label: 'Scripted', color: '#3b82f6' },
    { id: 'Editing', label: 'Editing', color: '#f59e0b' },
    { id: 'Post_Editing', label: 'Post-Editing', color: '#f59e0b' },
    { id: 'ReadyForVideoPrep', label: 'Ready for Video', color: '#10b981' },
    { id: 'Under_Review', label: 'Under Review', color: '#8b5cf6' },
    { id: 'Approved', label: 'Approved', color: '#059669' },
    { id: 'Published', label: 'Published', color: '#22c55e' }
  ];

  // ... (existing code)

  const handleRecordClick = async (topic) => {
    if (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') {
      try {
        const res = await fetch(`/api/topics/update-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topicId: topic.content_id,
            newStatus: 'Post_Editing'
          }),
        });

        if (res.ok) {
          fetchDashboardData();
        }
      } catch (error) {
        console.error('Error updating status:', error);
      }
    } else if (['Post_Editing', 'ReadyForVideoPrep', 'Under_Review'].includes(topic.workflow_status)) {
      // Show upload modal for initial upload OR editing existing link
      setCurrentTopic(topic);
      setVideoLink(topic.video_link || "");
      setAdditionalLink(topic.additional_link || "");
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
          additionalLink: additionalLink, // Send to API
          newStatus: 'Under_Review'
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

  // Handle publish topic
  const handlePublish = async (topic) => {
    if (!window.confirm("Are you sure you want to publish this topic?")) return;

    try {
      const res = await fetch(`/api/topics/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: topic.content_id,
          newStatus: 'Published'
        }),
      });

      if (res.ok) {
        fetchDashboardData();
      } else {
        alert("Failed to publish topic");
      }
    } catch (error) {
      console.error('Error publishing topic:', error);
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
      if (data.canPublish !== undefined) {
        setCanPublish(data.canPublish);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-8 px-20">
            {[
              { label: "Total Topics", value: stats.totalTopics, bg: "rgba(59,130,246,0.1)", color: "#1d4ed8", borderColor: "#3b82f6" },
              { label: "In Progress", value: stats.inEditing, bg: "rgba(251,146,60,0.1)", color: "#c2410c", borderColor: "#fb923c" },
              { label: "Under Review", value: stats.underReview, bg: "rgba(168,85,247,0.1)", color: "#7c2d12", borderColor: "#a855f7" },
              { label: "Approved", value: stats.approved, bg: "rgba(16,185,129,0.1)", color: "#047857", borderColor: "#10b981" },
              { label: "Published", value: stats.published, bg: "rgba(34,197,94,0.1)", color: "#15803d", borderColor: "#22c55e" },
            ].map((item, index) => (
              <div key={index}>
                <Card
                  sx={{
                    p: 3,
                    border: `2px solid ${item.borderColor}`,
                    borderRadius: "16px",
                    background: `linear-gradient(135deg, ${item.bg} 0%, rgba(255,255,255,0.9) 100%)`,
                    height: "100%",
                    minHeight: "140px",
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
              </div>
            ))}
          </div>

          {/* TOPICS IN EDITING SECTION */}
          <Box sx={{ mx: 20, mt: 8 }}>
            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#374151" }}>
                  Topics in Progress
                </Typography>
                <Chip
                  label={`${editingTopics.length} Active`}
                  sx={{
                    backgroundColor: "#f3f4f6",
                    color: "#1f2937",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    height: "32px",
                    "& .MuiChip-label": {
                      px: 2
                    }
                  }}
                />
              </Box>

              <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white', borderRadius: 1 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter by Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="In Editing">In Progress</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Search by Editor Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{
                  width: 300,
                  backgroundColor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& input::placeholder': {
                      color: '#4b5563',
                      opacity: 1
                    }
                  }
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
                        border: topic.review_notes ? `2px solid #ef4444` : `2px solid ${getStatusColor(topic.workflow_status)}`,
                        borderRadius: "12px !important",
                        backgroundColor: topic.review_notes ? '#fef2f2' : 'transparent',
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
                            {topic.assigned_editor_name && (
                              <Chip
                                label={`Editor: ${topic.assigned_editor_name}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: "#8b5cf6",
                                  color: "#8b5cf6",
                                  fontWeight: 500
                                }}
                              />
                            )}
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
                          {/* Action Buttons */}
                          <Box sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 2,
                            pt: 3,
                            borderTop: "1px solid #e5e7eb"
                          }}>
                            {/* Download Buttons */}
                            <Box sx={{ display: 'flex', gap: 1, mr: 'auto' }}>
                              {topic.has_doc && (
                                <Tooltip title="Download Script (DOC)">
                                  <IconButton
                                    size="medium"
                                    sx={{
                                      backgroundColor: "#2563eb",
                                      color: "white",
                                      "&:hover": { backgroundColor: "#1d4ed8" }
                                    }}
                                    onClick={() => window.open(`/api/download-topic-material?topicId=${topic.content_id}&type=doc`, '_blank')}
                                  >
                                    <Description />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {topic.has_ppt && (
                                <Tooltip title="Download Slides (PPT)">
                                  <IconButton
                                    size="medium"
                                    sx={{
                                      backgroundColor: "#ea580c",
                                      color: "white",
                                      "&:hover": { backgroundColor: "#c2410c" }
                                    }}
                                    onClick={() => window.open(`/api/download-topic-material?topicId=${topic.content_id}&type=ppt`, '_blank')}
                                  >
                                    <Slideshow />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {topic.has_zip && (
                                <Tooltip title="Download Materials (ZIP)">
                                  <IconButton
                                    size="medium"
                                    sx={{
                                      backgroundColor: "#7c3aed",
                                      color: "white",
                                      "&:hover": { backgroundColor: "#6d28d9" }
                                    }}
                                    onClick={() => window.open(`/api/download-topic-material?topicId=${topic.content_id}&type=zip`, '_blank')}
                                  >
                                    <FolderZip />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {/* View Links Button - Show only if links exist (Approved) */}
                              {(topic.workflow_status === 'Approved') && (
                                <Tooltip title="View Current Links">
                                  <IconButton
                                    size="medium"
                                    sx={{
                                      backgroundColor: "#0ea5e9",
                                      color: "white",
                                      "&:hover": { backgroundColor: "#0284c7" }
                                    }}
                                    onClick={() => {
                                      setCurrentTopic(topic);
                                      setVideoLink(topic.video_link || "");
                                      setAdditionalLink(topic.additional_link || "");
                                      setUploadModalOpen(true);
                                    }}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>

                            {/* Feedback Button - Only show if review notes exist */}
                            {topic.review_notes && topic.workflow_status !== 'Approved' && (
                              <Tooltip title="View Teacher Feedback">
                                <Button
                                  variant="contained"
                                  startIcon={<Visibility />}
                                  onClick={() => {
                                    alert(`Feedback: ${topic.review_notes}`);
                                    if (!viewedFeedbackTopics.includes(topic.content_id)) {
                                      setViewedFeedbackTopics([...viewedFeedbackTopics, topic.content_id]);
                                    }
                                  }}
                                  sx={{
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    "&:hover": { backgroundColor: "#dc2626" },
                                    fontWeight: 600,
                                    animation: "pulse 2s infinite"
                                  }}
                                >
                                  View Feedback
                                </Button>
                              </Tooltip>
                            )}

                            {/* Main Action Button */}
                            {((!topic.review_notes || viewedFeedbackTopics.includes(topic.content_id)) || topic.workflow_status === 'Approved') && (
                              <Tooltip
                                title={
                                  (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted')
                                    ? "Start Recording"
                                    : (topic.workflow_status === 'Post_Editing' || topic.workflow_status === 'ReadyForVideoPrep' ? (topic.review_notes ? "Re-upload Video" : "Upload Video")
                                      : (topic.workflow_status === 'Approved' ? (canPublish ? "Publish Content" : "Waiting for Publisher")
                                        : "Edit Video Link"))
                                }
                              >
                                <span>
                                  <Button
                                    variant="contained"
                                    disabled={topic.workflow_status === 'Approved' && !canPublish}
                                    startIcon={
                                      (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') ? <VideoCall />
                                        : (topic.workflow_status === 'Approved' ? <CheckCircle /> : <Upload />)
                                    }
                                    onClick={() => {
                                      if (topic.workflow_status === 'Approved') {
                                        handlePublish(topic);
                                      } else {
                                        handleRecordClick(topic);
                                      }
                                    }}
                                    sx={{
                                      backgroundColor: (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') ? "#dc2626"
                                        : (topic.workflow_status === 'Approved' && canPublish ? "#10b981" : "#7c3aed"),
                                      "&:hover": {
                                        backgroundColor: (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') ? "#b91c1c"
                                          : (topic.workflow_status === 'Approved' && canPublish ? "#059669" : "#6d28d9")
                                      },
                                      fontWeight: 600,
                                      "&.Mui-disabled": {
                                        backgroundColor: "#e5e7eb",
                                        color: "#9ca3af"
                                      }
                                    }}
                                  >
                                    {(topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') ? "Start"
                                      : (topic.workflow_status === 'Post_Editing' || topic.workflow_status === 'ReadyForVideoPrep' ? (topic.review_notes ? "Re-upload Video" : "Upload Video")
                                        : (topic.workflow_status === 'Approved' ? "Publish"
                                          : "Edit Video Link"))}
                                  </Button>
                                </span>
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
              {currentTopic?.workflow_status === 'Approved' || currentTopic?.workflow_status === 'Under_Review' ? "View/Edit Links" : "Upload Video Link"}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
                {currentTopic?.workflow_status === 'Approved' ? "Current links for:" : "Upload the video link for:"} <strong>{currentTopic?.topic_title}</strong>
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
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px"
                  }
                }}
              />
              <TextField
                margin="dense"
                label="Additional Link (Optional)"
                type="url"
                fullWidth
                variant="outlined"
                value={additionalLink} // New State
                onChange={(e) => setAdditionalLink(e.target.value)}
                placeholder="https://example.com/resources"
                helperText="Link for extra resources, viewable by TAs and Publishers."
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
                Close
              </Button>
              <Button
                onClick={handleVideoUpload}
                variant="contained"
                disabled={!videoLink || currentTopic?.workflow_status === 'Approved'}
                startIcon={currentTopic?.workflow_status === 'Approved' ? <Visibility /> : <Upload />}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 600,
                  display: currentTopic?.workflow_status === 'Approved' ? 'none' : 'flex' // Hide save on approved
                }}
              >
                {currentTopic?.workflow_status === 'Under_Review' ? "Update Links" : "Upload Video"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default EditorDash;
