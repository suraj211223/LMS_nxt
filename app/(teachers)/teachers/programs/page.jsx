"use client";

import React, { useEffect, useState } from "react";
import { Grid, Typography, Box } from "@mui/material";
import Programcard from "../../../client/components/Programcard";

export default function ProgramsClient() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      setLoading(true);
      let url = "/api/teacher/programs";

      // If user is persisted locally and is a teacher, request only their programs
      try {
        const raw = localStorage.getItem('lms_user');
        if (raw) {
          const user = JSON.parse(raw);
          if (user?.role === 'teacher' && user?.id) {
            url += `?userId=${encodeURIComponent(String(user.id))}`;
          }
        }
      } catch (err) {
        console.warn('Failed to read persisted user for programs page', err);
      }

      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Failed to fetch programs', res.status);
          setPrograms([]);
        } else {
          const data = await res.json();
          setPrograms(data.programs || data.assignedPrograms || []);
        }
      } catch (err) {
        console.error('Error fetching programs:', err);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, []);

  return (
    <>
      <Box className="pt-25 p-6">
        <Typography variant="h3" component="h1" className="text-5xl font-bold text-gray-800 mb-2">
          Academic Programs
        </Typography>
        <Typography variant="subtitle1" className="text-gray-600 mb-6">
          Browse the academic programs assigned to you (teachers) or all programs (others)
        </Typography>
      </Box>

      <div className="w-90vw text-black p-5">
        <Grid container spacing={4}>
          {loading ? (
            <Grid item xs={12}><Box className="text-center py-12">Loading…</Box></Grid>
          ) : programs.length > 0 ? (
            programs.map((program) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={program.program_id || program.id}>
                <Programcard 
                  id={program.program_id || program.id}
                  programName={program.program_name || program.name}
                  programCode={program.program_code || program.code}
                  schoolName={program.school_name}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box className="text-center py-12">
                <Typography variant="h6" className="text-gray-500">
                  No programs found
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </div>
    </>
  );
}