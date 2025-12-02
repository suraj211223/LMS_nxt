"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  TextField,
  Autocomplete,
  Typography,
  Button,
  Stack,
} from "@mui/material";

const programTypes = ["BSC", "MSC", "MBA", "BBA", "MTECH", "BTECH","BCOM"];

const CreateProgramModal = ({ open, onClose }) => {
  const [programCode, setProgramCode] = useState("");
  const [programName, setProgramName] = useState("");

  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const [programType, setProgramType] = useState("");

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch("_______"); 
        const data = await res.json();
        setSchools(data);
      } catch (e) {
        console.error("Error loading schools:", e);
      }
    };

    if (open) fetchSchools();
  }, [open]);

  const handleSubmit = () => {
    const payload = {
      program_code: programCode,
      program_name: programName,
      school_id: selectedSchool?.school_id,
      program_type: programType.toUpperCase(),
    };

    console.log("Program Payload:", payload);

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 500,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Typography variant="h5" mb={2}>
          Create New Program
        </Typography>

        <Stack spacing={2}>
          {/* Program Code */}
          <TextField
            label="Program Code"
            value={programCode}
            onChange={(e) => setProgramCode(e.target.value)}
            fullWidth
          />

          {/* Program Name */}
          <TextField
            label="Program Name"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            fullWidth
          />

          {/* School Select */}
          <Autocomplete
            options={schools}
            getOptionLabel={(opt) => opt.school_name || ""}
            value={selectedSchool}
            isOptionEqualToValue={(opt, val) =>
              opt.school_id === val?.school_id
            }
            onChange={(e, newValue) => setSelectedSchool(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="School" />
            )}
          />

          {/* Program Type */}
          <Autocomplete
            freeSolo
            options={programTypes}
            value={programType}
            onInputChange={(e, newVal) =>
              setProgramType(newVal.toUpperCase()) // uppercase logic
            }
            renderInput={(params) => (
              <TextField {...params} label="Program Type (BSC, MSC...)" />
            )}
          />

          {/* Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button variant="text" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Create Program
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CreateProgramModal;
