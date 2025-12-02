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

  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [faculties, setFaculties] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedFaculties, setSelectedFaculties] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [programRes, facultyRes] = await Promise.all([
          fetch("/api/program/list"),
          fetch("/api/faculty/list"), // <-- your faculty API
        ]);

        const programsData = await programRes.json();
        const facultiesData = await facultyRes.json();

        setPrograms(programsData || []);
        setFaculties(facultiesData || []);
      } catch (e) {
        console.error("Error fetching:", e);
      }
    };

    if (open) fetchOptions();
  }, [open]);

  const handleSubmit = async () => {
    const data = {
      title: courseName,
      course_code: courseCode,
      program_id: selectedProgram?.program_id || null,
      faculty_ids: selectedFaculties.map((f) => f.faculty_id), // selected faculty IDs
    };

    console.log("Payload:", data);
    onClose();
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
            getOptionLabel={(opt) => opt?.program_name ?? ""}
            isOptionEqualToValue={(opt, val) =>
              opt?.program_id === val?.program_id
            }
            renderInput={(params) => (
              <TextField {...params} label="Program" />
            )}
          />

          {/* Faculty Autocomplete (multiple, max 3) */}
          <Autocomplete
            multiple
            options={faculties}
            value={selectedFaculties}
            getOptionLabel={(opt) => opt?.faculty_name ?? ""}
            isOptionEqualToValue={(opt, val) =>
              opt?.faculty_id === val?.faculty_id
            }
            onChange={(e, newValue) => {
              if (newValue.length <= 3) {
                setSelectedFaculties(newValue);
              }
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.faculty_id}
                  label={option.faculty_name}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Faculties (Max 3)"
                helperText={
                  selectedFaculties.length === 3
                    ? "Maximum 3 faculties selected"
                    : ""
                }
              />
            )}
          />

          {/* Submit Button */}
          <Button variant="contained" onClick={handleSubmit}>
            Create Course
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CreateCourseModal;
