import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import Programcard from "../../../client/components/Programcard";
import EditorProgramcard from "../../../client/Editorcomponents/Programcard";

async function Programs() {
  // Use the full URL for server-side fetch
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  const response = await fetch(`${baseUrl}/api/teacher/programs`);

  if (!response.ok) {
    throw new Error("Failed to fetch programs data");
  }

  const data = await response.json();
  const programs = data.programs || []; // Handle the nested structure

  return (
    <>
      <Box className="pt-25 p-6">
        <Typography variant="h3" component="h1" className="text-5xl font-bold text-gray-800 mb-2">
          Academic Programs
        </Typography>
        <Typography variant="subtitle1" className="text-gray-600 mb-6">
          Browse all academic programs offered by the institution
        </Typography>
      </Box>
      
      <div className="w-full text-black p-5">
        <Grid container spacing={3}>
          {programs.length > 0 ? (
            programs.map((program) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={program.program_id}>
                <EditorProgramcard
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
      </div>
    </>
  );
}

export default Programs;