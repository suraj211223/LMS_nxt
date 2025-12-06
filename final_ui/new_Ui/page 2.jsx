"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    Tooltip
} from "@mui/material";
import { Edit, Visibility, ExpandMore, PlayCircle, CheckCircle } from "@mui/icons-material";
import ReviewDialogue from "../../../client/components/ReviewDialogue";

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

      {/* Value text */}
    
    </svg>
  );
};

const TeacherDash = () => {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalTopics: 0,
        totalUnits: 0,
        videosToReview: 0,
        videosPublished: 0
    });
    const [topicsForReview, setTopicsForReview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedTopic, setExpandedTopic] = useState(null);
    const [openReviewModal, setOpenReviewModal] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(null);

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

    // Filter topics to show only those in "Under_Review" status
    const reviewTopics = topicsForReview.filter(topic => topic.workflow_status === 'Under_Review');

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
            const res = await fetch("/api/teacher/dashboard");
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();

            console.log("Teacher dashboard data received:", data);

            if (data.stats) {
                setStats(data.stats);
            }
            if (data.topicsForReview) {
                setTopicsForReview(data.topicsForReview);
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching dashboard:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle opening review modal
    const handleOpenReviewModal = (topic) => {
        setCurrentTopic({
            ...topic,
            name: topic.topic_title, // Map for ReviewDialogue
            id: topic.content_id
        });
        setOpenReviewModal(true);
    };

    // Handle approve topic
    const handleApproveTopic = async (topicId) => {
        try {
            const res = await fetch(`/api/topics/update-status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    topicId,
                    newStatus: "Published"
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to approve topic");
            }

            // Close modal and refresh data
            setOpenReviewModal(false);
            setCurrentTopic(null);
            fetchDashboardData();

        } catch (error) {
            console.error("Error approving topic:", error);
            alert(`Error approving topic: ${error.message}`);
        }
    };

    const handleFeedbackSubmit = async (topicId, feedback) => {
        try {
            const res = await fetch("/api/teacher/submit-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topicId, feedback }),
            });

            if (res.ok) {
                fetchDashboardData(); // Refresh to show updated status
            } else {
                alert("Failed to submit feedback");
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <>
            <h2 className="pt-20 pl-20 text-4xl font-bold">Teacher Dashboard</h2>

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
                                label: "Total Units", 
                                value: stats.totalUnits, 
                                progress: getProgressValue(stats.totalUnits, Math.max(stats.totalUnits, 5)),
                                color: "#22c55e" 
                            },
                            { 
                                label: "Videos to Review", 
                                value: stats.videosToReview, 
                                progress: getProgressValue(stats.videosToReview, Math.max(stats.totalTopics, 1)),
                                color: "#fb923c" 
                            },
                            { 
                                label: "Videos Published", 
                                value: stats.videosPublished, 
                                progress: getProgressValue(stats.videosPublished, Math.max(stats.totalTopics, 1)),
                                color: "#a855f7" 
                            },
                        ].map((item, index) => (
                            <Grid item xs={12} sm={6} md={3} lg={3} key={index}>
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
                                    <Box sx={{ p: 6, textAlign: "center" }} className="w-70">
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
                                                fontSize: "0.9rem"
                                            }}
                                        >
                                            {item.label}
                                        </Typography>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* TOPICS FOR REVIEW SECTION */}
                    <Box sx={{ mx: 20, mt: 8 }}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 3
                        }}>
                            <Typography variant="h4" sx={{ fontWeight: 600, color: "#374151" }}>
                                Videos for Review
                            </Typography>
                            <Chip
                                label={`${reviewTopics.length} Pending`}
                                sx={{
                                    backgroundColor: "#8b5cf6",
                                    color: "white",
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
                            {reviewTopics.length > 0 ? (
                                <div className="space-y-4">
                                    {reviewTopics.map((topic, index) => (
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
                                                            label="Ready for Review"
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
                                                            {/* Review Status */}
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
                                                                    📊 Review Status
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
                                                                        Under Review
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
                                                        <Tooltip title="View Topic Details" arrow>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<Visibility />}
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
                                                                onClick={() => router.push(`/teachers/courses/${topic.course_id}`)}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </Tooltip>

                                                        <Tooltip title="Play & Review Video" arrow>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<PlayCircle />}
                                                                sx={{
                                                                    borderColor: "#8b5cf6",
                                                                    color: "#8b5cf6",
                                                                    "&:hover": { 
                                                                        backgroundColor: "#8b5cf615",
                                                                        borderColor: "#7c3aed"
                                                                    },
                                                                    borderRadius: "12px",
                                                                    fontWeight: 600,
                                                                    px: 3,
                                                                    py: 1.5
                                                                }}
                                                                onClick={() => handleOpenReviewModal(topic)}
                                                            >
                                                                Play Video
                                                            </Button>
                                                        </Tooltip>

                                                        <Tooltip title="Review & Approve" arrow>
                                                            <Button
                                                                variant="contained"
                                                                startIcon={<CheckCircle />}
                                                                onClick={() => handleOpenReviewModal(topic)}
                                                                sx={{
                                                                    backgroundColor: "#10b981",
                                                                    "&:hover": { backgroundColor: "#059669" },
                                                                    fontWeight: 600,
                                                                    borderRadius: "12px",
                                                                    px: 4,
                                                                    py: 1.5,
                                                                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                                                                }}
                                                            >
                                                                Approve & Publish
                                                            </Button>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </div>
                            ) : (
                                <Box sx={{ textAlign: "center", py: 8 }}>
                                    <Typography variant="h6" sx={{ color: "#6b7280", mb: 1 }}>
                                        No videos pending review
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                                        Videos ready for review will appear here
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>

                    {/* REVIEW VIDEO MODAL */}
                    <ReviewDialogue
                        open={openReviewModal}
                        onClose={() => setOpenReviewModal(false)}
                        topic={currentTopic}
                        onFeedbackSubmit={handleFeedbackSubmit}
                        onApprove={handleApproveTopic}
                    />
                </>
            )}
        </>
    );
};

export default TeacherDash;