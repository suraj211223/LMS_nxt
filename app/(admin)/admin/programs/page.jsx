"use client";

import React, { useEffect, useState } from "react";
import { Grid, Typography, Box } from "@mui/material";
import Programcard from "../../../client/components/Programcard";
import CreateProgramModal from "../../../client/components/admin/CreateProgramModal";
import AdminProgramcard from "../../../client/components/admin/Programcard";

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const[open,setopen]=useState(false);
  useEffect(() => {
    async function getPrograms() {
      try {
        const response = await fetch("/api/teacher/programs");

        if (!response.ok) {
          throw new Error("Failed to fetch programs data");
        }

        const data = await response.json();
        setPrograms(data.programs || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    getPrograms();
  }, []);

  return (
    <>
      <Box className="pt-25 p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography
            variant="h3"
            component="h1"
            className="text-5xl font-bold text-gray-800"
          >
            Academic Programs
          </Typography>
          <button className="border-2 font-bold text-xl bg-black text-white p-2 rounded-2xl" onClick={()=>{setopen(true)}}>
            +Add Program
          </button>
          <CreateProgramModal open={open} onClose={() => setopen(false)}/>
        </div>
        <Typography variant="subtitle1" className="text-gray-600 mb-6">
          Browse all academic programs offered by the institution
        </Typography>
      </Box>

      <div className="w-full text-black p-5">
        {loading ? (
          <Typography className="text-gray-500">Loading programs…</Typography>
        ) : (
          <Grid container spacing={3}>
            {programs.length > 0 ? (
              programs.map((program) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  key={program.program_id}
                >
                  <AdminProgramcard
                    id={program.program_id}
                    programName={program.program_name}
                    programCode={program.program_code}
                    schoolName={program.school_name}
                  />
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Box className="text-center py-12">
                  <Typography variant="h6" className="text-gray-500">
                    No programs found
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </div>
    </>
  );
}

export default Programs;