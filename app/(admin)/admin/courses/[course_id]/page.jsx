"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Card,
    CardContent,
    CardHeader,
    Box,
    Tooltip,
    IconButton,
    Typography,
    Chip,
    Paper,
    Divider,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from "@mui/material";
import { Download, FileText, Presentation, Trash2, MessageSquare, CheckCircle, FileCheck, Send } from "lucide-react";
import ProgressBar from "@/app/client/components/ProgressBar";
import ReviewDialogue from "@/app/client/components/ReviewDialogue";

export default function AdminCourseDetail({ params }) {
    const unwrappedParams = use(params);
    const courseId = unwrappedParams.course_id;

    const [course, setCourse] = useState(null);
    const [expandedUnit, setExpandedUnit] = useState(null);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [openReviewModal, setOpenReviewModal] = useState(false);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleBack = () => {
        router.push('/admin/courses');
    };

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/teacher/display?courseId=${courseId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch course data");
            }
            const data = await res.json();
            setCourse(data);
            setError(null);
        } catch (error) {
            console.error("Error fetching course:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const handleDownload = async (fileUrl, fileName) => {
        try {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download file");
        }
    };

    const handleDeleteCourse = async () => {
        if (!confirm("Are you sure you want to delete this ENTIRE COURSE? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
            if (res.ok) {
                router.push("/admin/courses");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete course");
            }
        } catch (err) {
            alert("Error deleting course");
        }
    };

    const handleDeleteUnit = async (unitId, e) => {
        e.stopPropagation(); // Prevent accordion toggle
        if (!confirm("Are you sure you want to delete this Unit? All topics within it will be lost.")) return;
        try {
            const res = await fetch(`/api/admin/units/${unitId}`, { method: "DELETE" });
            if (res.ok) {
                fetchCourse();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete unit");
            }
        } catch (err) {
            alert("Error deleting unit");
        }
    };

    const handleDeleteTopic = async (topicId) => {
        if (!confirm("Are you sure you want to delete this Topic?")) return;
        try {
            const res = await fetch(`/api/teacher/delete-topic?topicId=${topicId}`, { method: "DELETE" });
            if (res.ok) {
                fetchCourse();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete topic");
            }
        } catch (err) {
            alert("Error deleting topic");
        }
    };

    const handleOpenReviewModal = (topic) => {
        setCurrentTopic(topic);
        setOpenReviewModal(true);
    };

    const handleFeedbackSubmit = async (topicId, feedback) => {
        try {
            const res = await fetch("/api/teacher/submit-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topicId, feedback }),
            });

            if (res.ok) {
                fetchCourse();
            } else {
                alert("Failed to submit feedback");
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }
    };

    const handleApproveVideo = async (topicId) => {
        try {
            const res = await fetch(`/api/topics/update-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topicId: topicId,
                    newStatus: 'Published' // Admins publishing directly akin to Teachers
                }),
            });

            if (res.ok) {
                fetchCourse();
            } else {
                alert("Failed to approve topic");
            }
        } catch (error) {
            console.error('Error approving topic:', error);
        }
    };

    const handleApproveScript = async (topicId) => {
        if (!window.confirm("Approve script and send to editor?")) return;
        try {
            const res = await fetch(`/api/topics/update-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topicId, newStatus: 'Editing' }),
            });
            if (res.ok) fetchCourse();
            else alert("Failed to approve script");
        } catch (error) {
            console.error('Error approving script:', error);
        }
    };

    const handleApproveMaterials = async (topicId) => {
        if (confirm("Approve materials and send to editors?")) {
            fetch("/api/topics/approve-materials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topicId: topicId })
            }).then(res => {
                if (res.ok) fetchCourse();
                else alert("Failed to approve materials");
            });
        }
    };

    if (loading) return <p className="p-8">Loading...</p>;
    if (error) return <p className="p-8 text-red-500">Error: {error}</p>;
    if (!course) return <p className="p-8">Course not found</p>;

    const getAllTopics = () => {
        return course.units ? course.units.flatMap((u) => u.topics || []) : [];
    };

    return (
        <div className="space-y-6 p-6 pt-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <Button variant="outlined" onClick={handleBack}>← Back to Courses</Button>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<Trash2 size={18} />}
                    onClick={handleDeleteCourse}
                >
                    Delete Course
                </Button>
            </div>

            {/* Course Info */}
            <Card>
                <CardHeader
                    title={
                        <span className="text-2xl">
                            {course.name || course.course_name}
                        </span>
                    }
                    subheader={`${course.department || "Department"} • ${course.program || "Program"} • ${course.units ? course.units.length : 0} units • ${getAllTopics().length} topics`}
                />
            </Card>

            {/* Assignment Management */}
            <Card>
                <CardHeader title="Assigned Teachers" subheader="Manage who can access this course" />
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <TextField
                            label="Teacher Email"
                            variant="outlined"
                            size="small"
                            fullWidth
                            id="teacher-email-input"
                        />
                        <Button
                            variant="contained"
                            onClick={async () => {
                                const emailInput = document.getElementById("teacher-email-input");
                                const email = emailInput.value;
                                if (!email) return alert("Please enter an email");
                                try {
                                    const res = await fetch("/api/admin/assign", {
                                        method: "POST",
                                        body: JSON.stringify({ email, courseId }),
                                    });
                                    if (res.ok) {
                                        emailInput.value = "";
                                        fetchCourse();
                                    } else {
                                        const msg = await res.text();
                                        alert(msg);
                                    }
                                } catch (e) {
                                    console.error(e);
                                    alert("Assignment failed");
                                }
                            }}
                        >
                            Assign
                        </Button>
                    </div>

                    <List>
                        {course.assigned_teachers && course.assigned_teachers.length > 0 ? (
                            course.assigned_teachers.map((teacher) => (
                                <ListItem key={teacher.id} divider>
                                    <ListItemText
                                        primary={teacher.name}
                                        secondary={teacher.email}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={async () => {
                                                if (!confirm(`Remove ${teacher.name} from this course?`)) return;
                                                try {
                                                    const res = await fetch("/api/admin/assign", {
                                                        method: "DELETE",
                                                        body: JSON.stringify({ userId: teacher.id, courseId }),
                                                    });
                                                    if (res.ok) fetchCourse();
                                                    else alert("Failed to remove assignment");
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No teachers assigned.
                            </Typography>
                        )}
                    </List>
                </CardContent>
            </Card>

            {/* Course Structure */}
            <Card>
                <CardHeader
                    title="Course Structure"
                    subheader="Manage course materials"
                />

                <CardContent>
                    <div className="space-y-4">
                        {course.units && course.units.length > 0 ? (
                            course.units.map((unit, unitIndex) => {
                                const unitId = unit.section_id || unit.id.replace('u', ''); // Handle potentially different ID formats
                                return (
                                    <Accordion
                                        key={unit.id}
                                        expanded={expandedUnit === unit.id}
                                        onChange={() =>
                                            setExpandedUnit(expandedUnit === unit.id ? null : unit.id)
                                        }
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <div className="flex justify-between w-full items-center pr-4">
                                                <span className="font-medium">
                                                    Unit {unit.order}: {unit.name}
                                                </span>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-gray-500 text-sm">
                                                        {unit.topics ? unit.topics.length : 0} topics
                                                    </span>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) => handleDeleteUnit(unitId, e)}
                                                        title="Delete Unit"
                                                    >
                                                        <Trash2 size={18} />
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </AccordionSummary>

                                        <AccordionDetails sx={{ backgroundColor: "#f9fafb" }}>
                                            <div className="space-y-4">
                                                {/* Topics List */}
                                                {!unit.topics || (unit.topics.length === 0 && (
                                                    <p className="text-gray-500 italic text-center py-4">
                                                        No topics added yet
                                                    </p>
                                                ))}

                                                {unit.topics &&
                                                    unit.topics.map((topic, topicIndex) => {
                                                        const topicStatus = topic.status?.toLowerCase() || "planned";
                                                        const realTopicId = topic.content_id || topic.id.replace('t', '');

                                                        return (
                                                            <Paper
                                                                key={topic.id}
                                                                elevation={1}
                                                                sx={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                    p: 2,
                                                                    mb: 1.5,
                                                                    borderRadius: 2,
                                                                    "&:hover": { boxShadow: 3 },
                                                                }}
                                                            >
                                                                {/* Topic Info */}
                                                                <Box
                                                                    sx={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: 2,
                                                                        flexWrap: "wrap",
                                                                    }}
                                                                >
                                                                    <Chip
                                                                        label={`${unitIndex + 1}.${topicIndex + 1}`}
                                                                        color="primary"
                                                                        variant="outlined"
                                                                        size="small"
                                                                    />
                                                                    <Typography variant="body1" fontWeight={500}>
                                                                        {topic.name}
                                                                    </Typography>
                                                                    <Box
                                                                        sx={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: 1,
                                                                        }}
                                                                    >
                                                                        <ProgressBar status={topicStatus} />
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                textTransform: "capitalize",
                                                                                color: "text.secondary",
                                                                            }}
                                                                        >
                                                                            {topicStatus}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                                {/* Topic Actions */}
                                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                                    {/* Admin Review Video Button */}
                                                                    {topic.videoLink && (
                                                                        <Tooltip title={topicStatus === "published" ? "Video Published" : "Watch & Review Video"}>
                                                                            <IconButton
                                                                                size="small"
                                                                                color="primary"
                                                                                onClick={() => handleOpenReviewModal(topic)}
                                                                            >
                                                                                <MessageSquare size={18} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}

                                                                    {/* Admin Approve Materials Button */}
                                                                    {topicStatus === "scripted" && (!(topic.script?.ppt || topic.script?.doc || topic.script?.zip) || topic.materialsApproved) && (
                                                                        <Tooltip title="Approve Script (Send to Editor)">
                                                                            <span>
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => handleApproveScript(realTopicId)}
                                                                                    sx={{ color: "#f59e0b" }}
                                                                                >
                                                                                    <Send size={18} />
                                                                                </IconButton>
                                                                            </span>
                                                                        </Tooltip>
                                                                    )}

                                                                    {!topic.materialsApproved && topicStatus !== 'planned' && (topic.script?.ppt || topic.script?.doc || topic.script?.zip) && (
                                                                        <Tooltip title="Approve Materials (Send to Editor)">
                                                                            <IconButton
                                                                                size="small"
                                                                                color="warning"
                                                                                onClick={() => handleApproveMaterials(realTopicId)}
                                                                            >
                                                                                <FileCheck size={18} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}

                                                                    <Divider orientation="vertical" flexItem />

                                                                    {topic.script?.ppt && (
                                                                        <Tooltip title="Download PPT">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleDownload(`/api/download-topic-material?topicId=${realTopicId}&type=ppt`, `${topic.name}-ppt.pptx`)}
                                                                            >
                                                                                <Presentation size={18} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                    {topic.script?.doc && (
                                                                        <Tooltip title="Download Script (Doc)">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleDownload(`/api/download-topic-material?topicId=${realTopicId}&type=doc`, `${topic.name}-script.docx`)}
                                                                            >
                                                                                <FileText size={18} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                    {topic.script?.zip && (
                                                                        <Tooltip title="Download Materials (Zip)">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleDownload(`/api/download-topic-material?topicId=${realTopicId}&type=zip`, `${topic.name}-materials.zip`)}
                                                                            >
                                                                                <Download size={18} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                    <Divider orientation="vertical" flexItem />
                                                                    <Tooltip title="Delete Topic">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="error"
                                                                            onClick={() => handleDeleteTopic(realTopicId)}
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </Paper>
                                                        );
                                                    })}
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 italic text-center py-8">
                                No units found for this course
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ReviewDialogue
                open={openReviewModal}
                onClose={() => setOpenReviewModal(false)}
                topic={currentTopic}
                onFeedbackSubmit={handleFeedbackSubmit}
                onApprove={handleApproveVideo}
                canApprove={true}
            />
        </div>
    );
}
