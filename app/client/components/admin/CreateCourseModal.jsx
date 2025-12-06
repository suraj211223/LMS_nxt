"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Stack,
  Chip,
} from "@mui/material";

const CreateCourseModal = ({ open, onClose }) => {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch("/api/programs");
        if (res.ok) {
          const data = await res.json();
          setPrograms(data || []);
        }
      } catch (e) {
        console.error("Error fetching programs:", e);
      }
    };

    if (open) fetchPrograms();
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedProgram || !courseName || !courseCode) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const payload = {
      title: courseName,
      course_code: courseCode,
      program_id: selectedProgram.id, // Using correct ID from schema
    };

    try {
      const res = await fetch("/api/admin/schools/create/courses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create course");
      }

      alert("Course created successfully!");
      onClose();
      if (window.location.reload) window.location.reload();

    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Box
        sx={{
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Typography variant="h5" mb={2}>
          Create New Course
        </Typography>

        <Stack spacing={2}>
          {/* Course Name */}
          <TextField
            label="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            fullWidth
          />

          {/* Course Code */}
          <TextField
            label="Course Code"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            fullWidth
          />

          {/* Program Autocomplete */}
          <Autocomplete
            options={programs}
            value={selectedProgram}
            onChange={(e, newValue) => setSelectedProgram(newValue)}
            getOptionLabel={(opt) => opt.programName || ""}
            isOptionEqualToValue={(opt, val) =>
              opt.id === val?.id
            }
            renderInput={(params) => (
              <TextField {...params} label="Select Program" />
            )}
          />

          {/* Submit Button */}
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CreateCourseModal;
