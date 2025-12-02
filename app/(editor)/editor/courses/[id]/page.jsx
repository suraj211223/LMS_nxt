"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
    Divider
} from "@mui/material";
import { Download, FileText, Presentation, File } from "lucide-react";
import ProgressBar from "@/app/client/components/ProgressBar";

export default function EditorCourseDetail() {
    const [course, setCourse] = useState(null);
    const [expandedUnit, setExpandedUnit] = useState(null);
    const params = useParams();
    const router = useRouter();

    const handleBack = () => {
        router.push('/editor/courses');
    };

    const fetchCourse = async () => {
        try {
            const res = await fetch(`/api/teacher/display?courseId=${params.id}`);
            if (!res.ok) {
                throw new Error("Failed to fetch course data");
            }
            const data = await res.json();
            setCourse(data);
        } catch (error) {
            console.error("Error fetching course:", error);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchCourse();
        }
    }, [params.id]);

    const handleDownload = async (fileUrl, fileName) => {
        try {
            // Create a temporary anchor element
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

    if (!course) return <p className="p-8">Loading...</p>;

    const getAllTopics = () => {
        return course.units ? course.units.flatMap((u) => u.topics || []) : [];
    };

    return (
        <div className="space-y-6 p-6 pt-20">
            {/* Header */}
            <div>
                <Button variant="outlined" onClick={handleBack}>← Back to Courses</Button>
            </div>

            {/* Course Info */}
            <Card>
                <CardHeader
                    title={
                        <span className="text-2xl">
                            {course.name || course.course_name}
                        </span>
                    }
                    subheader={`${course.department || "Department"} • ${course.program || "Program"
                        } • ${course.units ? course.units.length : 0} units • ${getAllTopics().length
                        } topics`}
                />
            </Card>

            {/* Course Structure */}
            <Card>
                <CardHeader
                    title="Course Structure"
                    subheader="Access course materials"
                />

                <CardContent>
                    <div className="space-y-4">
                        {course.units && course.units.length > 0 ? (
                            course.units.map((unit, unitIndex) => {
                                const unitId = unit.id || unit.section_id;
                                return (
                                    <Accordion
                                        key={unitId}
                                        expanded={expandedUnit === unitId}
                                        onChange={() =>
                                            setExpandedUnit(expandedUnit === unitId ? null : unitId)
                                        }
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <div className="flex justify-between w-full">
                                                <span className="font-medium">
                                                    Unit {unit.order}: {unit.name}
                                                </span>
                                                <span className="text-gray-500 text-sm">
                                                    {unit.topics ? unit.topics.length : 0} topics
                                                </span>
                                            </div>
                                        </AccordionSummary>

                                        <AccordionDetails sx={{ backgroundColor: "#f9fafb" }}>
                                            <div className="space-y-4">



                                                {/* Topics List */}
                                                {!unit.topics ||
                                                    (unit.topics.length === 0 && (
                                                        <p className="text-gray-500 italic text-center py-4">
                                                            No topics added yet
                                                        </p>
                                                    ))}

                                                {unit.topics &&
                                                    unit.topics.map((topic, topicIndex) => {
                                                        const topicStatus =
                                                            topic.status?.toLowerCase() || "planned";

                                                        return (
                                                            <Paper
                                                                key={topic.id || topic.content_id}
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
                                                                    {topic.script?.ppt && (
                                                                        <Tooltip title="Download PPT">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleDownload(`/api/download-topic-material?topicId=${topic.content_id}&type=ppt`, `${topic.name}-ppt.pptx`)}
                                                                            >
                                                                                <Presentation size={18} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                    {topic.script?.doc && (
                                                                        <Tooltip title="Download Script (Doc)">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleDownload(`/api/download-topic-material?topicId=${topic.content_id}&type=doc`, `${topic.name}-script.docx`)}
                                                                            >
                                                                                <FileText size={18} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                    {topic.script?.zip && (
                                                                        <Tooltip title="Download Materials (Zip)">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleDownload(`/api/download-topic-material?topicId=${topic.content_id}&type=zip`, `${topic.name}-materials.zip`)}
                                                                            >
                                                                                <Download size={18} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
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
        </div>
    );
}
