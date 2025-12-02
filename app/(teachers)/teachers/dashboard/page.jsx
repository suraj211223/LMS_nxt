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
                            { label: "Total Topics", value: stats.totalTopics, bg: "rgba(59,130,246,0.1)", color: "#1d4ed8", borderColor: "#3b82f6" },
                            { label: "Total Units", value: stats.totalUnits, bg: "rgba(34,197,94,0.1)", color: "#15803d", borderColor: "#22c55e" },
                            { label: "Videos to Review", value: stats.videosToReview, bg: "rgba(251,146,60,0.1)", color: "#c2410c", borderColor: "#fb923c" },
                            { label: "Videos Published", value: stats.videosPublished, bg: "rgba(168,85,247,0.1)", color: "#7c2d12", borderColor: "#a855f7" },
                        ].map((item, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
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
                                                    backgroundColor: `${getStatusColor(topic.workflow_status)}10`,
                                                    borderRadius: "12px",
                                                    "&.Mui-expanded": { borderRadius: "12px 12px 0 0" }
                                                }}
                                            >
                                                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                        <Chip
                                                            label={`Video ${index + 1}`}
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
                                                            label="Ready for Review"
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
                                                                    Review Status
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
                                                        <Tooltip title="View Topic Details">
                                                            <IconButton
                                                                size="medium"
                                                                sx={{
                                                                    backgroundColor: "#3b82f6",
                                                                    color: "white",
                                                                    "&:hover": { backgroundColor: "#2563eb" }
                                                                }}
                                                                onClick={() => router.push(`/teachers/courses/${topic.course_id}`)}
                                                            >
                                                                <Visibility />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Play & Review Video">
                                                            <IconButton
                                                                size="medium"
                                                                sx={{
                                                                    backgroundColor: "#8b5cf6",
                                                                    color: "white",
                                                                    "&:hover": { backgroundColor: "#7c3aed" }
                                                                }}
                                                                onClick={() => handleOpenReviewModal(topic)}
                                                            >
                                                                <PlayCircle />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Approve & Publish">
                                                            <Button
                                                                variant="contained"
                                                                startIcon={<CheckCircle />}
                                                                onClick={() => handleOpenReviewModal(topic)}
                                                                sx={{
                                                                    backgroundColor: "#10b981",
                                                                    "&:hover": { backgroundColor: "#059669" },
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                Review & Approve
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