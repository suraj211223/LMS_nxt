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

const programTypes = ["BSC", "MSC", "MBA", "BBA", "MTECH", "BTECH", "BCOM"];

const CreateProgramModal = ({ open, onClose }) => {
  const [programCode, setProgramCode] = useState("");
  const [programName, setProgramName] = useState("");
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [programType, setProgramType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch("/api/schools");
        if (res.ok) {
          const data = await res.json();
          // The API returns [{id, name, ...}]
          setSchools(data || []);
        }
      } catch (e) {
        console.error("Error loading schools:", e);
      }
    };

    if (open) fetchSchools();
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedSchool || !programName || !programCode) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    const payload = {
      program_code: programCode,
      program_name: programName,
      school_id: selectedSchool.id,
      program_type: programType.toUpperCase(),
    };

    try {
      const res = await fetch("/api/admin/schools/create/programs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create program");
      }

      alert("Program created successfully!");
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
            getOptionLabel={(opt) => opt.name || ""}
            value={selectedSchool}
            isOptionEqualToValue={(opt, val) =>
              opt.id === val?.id
            }
            onChange={(e, newValue) => setSelectedSchool(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select School" />
            )}
          />

          {/* Program Type */}
          <Autocomplete
            freeSolo
            options={programTypes}
            value={programType}
            onInputChange={(e, newVal) =>
              setProgramType(newVal.toUpperCase())
            }
            renderInput={(params) => (
              <TextField {...params} label="Program Type (BSC, MSC...)" />
            )}
          />

          {/* Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button variant="text" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Program"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CreateProgramModal;
