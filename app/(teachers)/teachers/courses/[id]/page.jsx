"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
} from "@mui/material";
import { Trash, FileCheck, CheckCircle } from "lucide-react";
import ProgressBar from "../../../../client/components/ProgressBar";
import Createunitmodal from "../../../../client/components/Createunitmodal";
import CreateTopicmodal from "../../../../client/components/CreateTopicmodal";
import ScriptDialogue from "../../../../client/components/ScriptDialogue";

export default function CourseStructureDesign() {
  const [course, setCourse] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const params = useParams();

  
  const [openUnitModal, setOpenUnitModal] = useState(false);
  const [openTopicModal, setOpenTopicModal] = useState(false);
  const [openScriptModal, setOpenScriptModal] = useState(false);

  
  const [currentUnitId, setCurrentUnitId] = useState(null); 
  const [currentTopic, setCurrentTopic] = useState(null); 

  //  API FUNCTION to fetch course data
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

  
  const handleOpenTopicModal = (unitId) => {
    setCurrentUnitId(unitId); // Set context
    setOpenTopicModal(true);
  };

  const handleOpenScriptModal = (topic, unitIndex, topicIndex) => {
  
    setCurrentTopic({ ...topic, unitIndex, topicIndex });
    setOpenScriptModal(true);
  };

  const handleDeleteTopic = async (topicId, topicTitle) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${topicTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/teacher/delete-topic?topicId=${topicId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete topic");
      }

      // Refresh the course data to show the updated list
      fetchCourse();
      
    } catch (error) {
      console.error("Error deleting topic:", error);
      alert(`Error deleting topic: ${error.message}`);
    }
  };

  if (!course) return <p>Loading...</p>;

  const getAllTopics = () => {
    return course.units ? course.units.flatMap((u) => u.topics || []) : [];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <Button variant="outlined">← Back to Courses</Button>
      </div>

      {/* Course Info */}
      <Card>
        <CardHeader
          title={
            <span className="text-2xl">
              {course.name || course.course_name}
            </span>
          }
          subheader={`${course.department || "Department"} • ${
            course.program || "Program"
          } • ${course.units ? course.units.length : 0} units • ${
            getAllTopics().length
          } topics`}
        />
      </Card>

      {/* Course Structure */}
      <Card>
        <CardHeader
          title="Course Structure"
          subheader="Manage units and topics for this course"
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
                      <div className="space-y-2">
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
                            
                            // ✨ Logic for your button requirements
                            const isScriptingDone = topicStatus !== "planned";
                            const isReviewStage = topicStatus === "review";

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
                                  <Chip
                                    label={`${
                                      topic.estimatedTime ||
                                      topic.estimated_duration_min ||
                                      0
                                    } min`}
                                    size="small"
                                    sx={{ bgcolor: "grey.200" }}
                                  />
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
                                <Box sx={{ display: "flex" }}>
                                  <Tooltip
                                    title={
                                      isScriptingDone
                                        ? "Scripting is complete"
                                        : "Upload/Edit Script"
                                    }
                                  >
                                    {/* Span wrapper is needed for Tooltip on disabled button */}
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleOpenScriptModal(
                                            topic,
                                            unitIndex,
                                            topicIndex
                                          )
                                        }
                                        disabled={isScriptingDone} // ✨ REQUIREMENT MET
                                      >
                                        <FileCheck />
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  <Tooltip
                                    title={
                                      isReviewStage
                                        ? "Approve Topic"
                                        : "Available only during review stage"
                                    }
                                  >
                                    <span>
                                      <IconButton
                                        size="small"
                                        disabled={!isReviewStage} // ✨ REQUIREMENT MET
                                        // onClick={() => handleApprove(topic.id)}
                                        color="success"
                                      >
                                        <CheckCircle />
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  <Tooltip title="Delete Topic">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() =>
                                        handleDeleteTopic(topic.content_id, topic.name)
                                      }
                                    >
                                      <Trash />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Paper>
                            );
                          })}

                        <Button
                          variant="contained"
                          className="w-full mt-2"
                          onClick={() => handleOpenTopicModal(unit.section_id)} // Use section_id, not prefixed id
                        >
                          + Add Topic
                        </Button>
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

            <Button
              variant="outlined"
              className="w-full"
              onClick={() => setOpenUnitModal(true)} 
            >
              + Add Unit
            </Button>
          </div>
        </CardContent>
      </Card>

     
      <Createunitmodal
        open={openUnitModal}
        onClose={() => setOpenUnitModal(false)}
        courseId={params.id} // Pass the courseId
      />

      <CreateTopicmodal
        open={openTopicModal}
        onClose={() => setOpenTopicModal(false)}
        unitId={currentUnitId} // ✨ Pass unitId
        // Note: You must update CreateTopicmodal to accept and use this 'unitId' prop
      />

      <ScriptDialogue
        open={openScriptModal}
        onClose={() => setOpenScriptModal(false)}
        topic={currentTopic} // ✨ Pass full topic object
        // Note: You must update ScriptDialogue to accept and use this 'topic' prop
      />
    </div>
  );
}