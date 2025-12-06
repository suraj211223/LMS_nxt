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

// HemisphereProgress component
const HemisphereProgress = ({ value, color = "#3b82f6" }) => {
  const radius = 50;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width="200" height="100" viewBox="0 0 120 60">
      {/* Background arc */}
      <path
        d="M10 60 A50 50 0 0 1 110 60"
        stroke="#e5e7eb"
        strokeWidth="12"
        fill="none"
      />

      {/* Progress arc */}
      <path
        d="M10 60 A50 50 0 0 1 110 60"
        stroke={color}
        strokeWidth="12"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />

  
    </svg>
  );
};

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

  // Calculate dynamic percentages for progress
  const getProgressValue = (current, total) => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
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
              { 
                label: "Total Topics", 
                value: stats.totalTopics, 
                progress: getProgressValue(stats.totalTopics, Math.max(stats.totalTopics, 10)),
                color: "#3b82f6" 
              },
              { 
                label: "Published", 
                value: stats.published, 
                progress: getProgressValue(stats.published, Math.max(stats.totalTopics, 1)),
                color: "#22c55e" 
              },
              { 
                label: "In Editing", 
                value: stats.inEditing + (stats.scripted || 0), 
                progress: getProgressValue(stats.inEditing + (stats.scripted || 0), Math.max(stats.totalTopics, 1)),
                color: "#fb923c" 
              },
              { 
                label: "Under Review", 
                value: stats.underReview, 
                progress: getProgressValue(stats.underReview, Math.max(stats.totalTopics, 1)),
                color: "#a855f7" 
              },
              { 
                label: "Ready for Video", 
                value: stats.readyForVideo, 
                progress: getProgressValue(stats.readyForVideo, Math.max(stats.totalTopics, 1)),
                color: "#06b6d4" 
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                <Card
                  sx={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    border: `2px solid ${item.color}20`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                    }
                  }}
                >
                  <Box sx={{ p: 2, textAlign: "center" }} className="">
                    {/* Hemisphere Progress */}
                    <Box sx={{ display: "flex", justifyContent: "center", mb: -4 }}>
                      <HemisphereProgress 
                        value={item.progress} 
                        color={item.color} 
                      />
                    </Box>
                    
                    {/* Card Content */}
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: item.color, 
                        mb: 1 
                      }}
                    >
                      {item.value || 0}
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: "#6b7280", 
                        fontWeight: 500,
                        fontSize: "0.85rem"
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
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
                          backgroundColor: `${getStatusColor(topic.workflow_status)}08`,
                          borderRadius: "12px",
                          minHeight: "80px",
                          "&.Mui-expanded": { 
                            borderRadius: "12px 12px 0 0",
                            minHeight: "80px"
                          },
                          "& .MuiAccordionSummary-content": {
                            margin: "16px 0",
                            "&.Mui-expanded": { margin: "16px 0" }
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          width: "100%", 
                          alignItems: "center",
                          pr: 2
                        }}>
                          {/* Left Side - Main Info */}
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Chip
                                label={`#${index + 1}`}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(topic.workflow_status),
                                  color: "white",
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                  height: "24px"
                                }}
                              />
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700, 
                                  color: "#1f2937",
                                  fontSize: "1.1rem"
                                }}
                              >
                                {topic.topic_title}
                              </Typography>
                            </Box>
                            
                            {/* Course & Unit Info */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 4 }}>
                              <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.85rem" }}>
                                <strong>Course:</strong> {topic.course_title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#9ca3af" }}>•</Typography>
                              <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.85rem" }}>
                                <strong>Unit:</strong> {topic.unit_title}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Right Side - Status & Duration */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Chip
                              label={topic.workflow_status.replace('_', ' ')}
                              size="medium"
                              sx={{
                                backgroundColor: `${getStatusColor(topic.workflow_status)}15`,
                                color: getStatusColor(topic.workflow_status),
                                fontWeight: 600,
                                fontSize: "0.8rem",
                                border: `1px solid ${getStatusColor(topic.workflow_status)}40`
                              }}
                            />
                            {topic.estimated_duration_min && (
                              <Chip
                                label={`${topic.estimated_duration_min}m`}
                                size="small"
                                sx={{ 
                                  backgroundColor: "#f3f4f6", 
                                  color: "#374151",
                                  fontWeight: 500,
                                  fontSize: "0.75rem"
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ 
                        backgroundColor: "#fafbfc", 
                        borderRadius: "0 0 12px 12px",
                        borderTop: "1px solid #e5e7eb"
                      }}>
                        <Box sx={{ p: 3 }}>
                          {/* Topic Details */}
                          <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ 
                                p: 3, 
                                backgroundColor: "white", 
                                borderRadius: "12px",
                                border: "1px solid #e5e7eb"
                              }}>
                                <Typography variant="h6" sx={{ 
                                  mb: 3, 
                                  color: "#111827", 
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1
                                }}>
                                  📋 Topic Details
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 500 }}>
                                      Program
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#111827", fontWeight: 600 }}>
                                      {topic.program_name}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 500 }}>
                                      Course
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#111827", fontWeight: 600 }}>
                                      {topic.course_title}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 500 }}>
                                      Unit
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#111827", fontWeight: 600 }}>
                                      {topic.unit_title}
                                    </Typography>
                                  </Box>
                                  {topic.estimated_duration_min && (
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                      <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 500 }}>
                                        Duration
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: "#111827", fontWeight: 600 }}>
                                        {topic.estimated_duration_min} minutes
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              {/* Workflow Progress */}
                              <Box sx={{ 
                                p: 3, 
                                backgroundColor: "white", 
                                borderRadius: "12px",
                                border: "1px solid #e5e7eb"
                              }}>
                                <Typography variant="h6" sx={{ 
                                  mb: 3, 
                                  color: "#111827", 
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1
                                }}>
                                  📊 Workflow Progress
                                </Typography>
                                
                                {/* Progress Circle */}
                                <Box sx={{ 
                                  display: "flex", 
                                  flexDirection: "column", 
                                  alignItems: "center",
                                  mb: 3
                                }}>
                                  <Box sx={{ 
                                    position: "relative", 
                                    width: 80, 
                                    height: 80, 
                                    mb: 2 
                                  }}>
                                    <svg width="80" height="80" viewBox="0 0 80 80">
                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                        fill="none"
                                      />
                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        stroke={getStatusColor(topic.workflow_status)}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 36}`}
                                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - getWorkflowProgress(topic.workflow_status) / 100)}`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 40 40)"
                                      />
                                    </svg>
                                    <Box sx={{ 
                                      position: "absolute", 
                                      top: "50%", 
                                      left: "50%", 
                                      transform: "translate(-50%, -50%)",
                                      textAlign: "center"
                                    }}>
                                      <Typography 
                                        variant="h6" 
                                        sx={{ 
                                          fontWeight: 700, 
                                          color: getStatusColor(topic.workflow_status),
                                          fontSize: "1rem"
                                        }}
                                      >
                                        {Math.round(getWorkflowProgress(topic.workflow_status))}%
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  <Typography variant="body1" sx={{ 
                                    fontWeight: 600, 
                                    color: "#111827",
                                    textAlign: "center"
                                  }}>
                                    {topic.workflow_status.replace('_', ' ')}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Action Buttons */}
                          <Box sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 3,
                            pt: 4,
                            mt: 3,
                            borderTop: "1px solid #e5e7eb"
                          }}>
                            <Tooltip title="Edit Topic" arrow>
                              <Button
                                variant="outlined"
                                startIcon={<Edit />}
                                sx={{
                                  borderColor: "#3b82f6",
                                  color: "#3b82f6",
                                  "&:hover": { 
                                    backgroundColor: "#3b82f615",
                                    borderColor: "#2563eb"
                                  },
                                  borderRadius: "12px",
                                  fontWeight: 600,
                                  px: 3,
                                  py: 1.5
                                }}
                                onClick={() => console.log('Edit topic:', topic.content_id)}
                              >
                                Edit
                              </Button>
                            </Tooltip>

                            <Tooltip title="View Details" arrow>
                              <Button
                                variant="outlined"
                                startIcon={<Visibility />}
                                sx={{
                                  borderColor: "#10b981",
                                  color: "#10b981",
                                  "&:hover": { 
                                    backgroundColor: "#10b98115",
                                    borderColor: "#059669"
                                  },
                                  borderRadius: "12px",
                                  fontWeight: 600,
                                  px: 3,
                                  py: 1.5
                                }}
                                onClick={() => console.log('View topic:', topic.content_id)}
                              >
                                View
                              </Button>
                            </Tooltip>

                            <Tooltip
                              title={
                                (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted')
                                  ? "Start Recording"
                                  : (topic.workflow_status === 'Post-Editing' ? "Upload Video" : (topic.workflow_status === 'Published' ? "Complete Task" : "Edit Video Link"))
                              }
                              arrow
                            >
                              <Button
                                variant="contained"
                                startIcon={
                                  (topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') ? <VideoCall /> : (topic.workflow_status === 'Published' ? <CheckCircle /> : <Upload />)
                                }
                                onClick={() => {
                                  if (topic.workflow_status === 'Published') {
                                    if (window.confirm("Mark this task as fully complete? This will remove it from your active list.")) {
                                      alert("Great job! Task marked as complete.");
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
                                  fontWeight: 600,
                                  borderRadius: "12px",
                                  px: 4,
                                  py: 1.5,
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                }}
                              >
                                {(topic.workflow_status === 'Editing' || topic.workflow_status === 'Scripted') ? "Record" : (topic.workflow_status === 'Post-Editing' ? "Upload Video" : (topic.workflow_status === 'Published' ? "Finish" : "Edit Video Link"))}
                              </Button>
                            </Tooltip>

                            {/* Feedback Button - Only show if review notes exist */}
                            {topic.review_notes && (
                              <Tooltip title="View Teacher Feedback" arrow>
                                <Button
                                  variant="outlined"
                                  startIcon={<Visibility />}
                                  onClick={() => alert(`Feedback: ${topic.review_notes}`)}
                                  sx={{ 
                                    borderColor: '#f59e0b', 
                                    color: '#f59e0b',
                                    "&:hover": { 
                                      backgroundColor: "#f59e0b15",
                                      borderColor: "#d97706"
                                    },
                                    borderRadius: "12px",
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1.5
                                  }}
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
