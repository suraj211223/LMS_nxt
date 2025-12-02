"use client";
import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';

const EditorProgramcard = ({ id, programName, programCode, schoolName }) => {
  return (
    <Card 
      className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-l-4 border-l-blue-500"
      onClick={() => {
        // Navigate to program details or courses within this program
        window.location.href = `/editor/programs/${id}`;
      }}
    >
      <CardContent className="p-6">
        <Box className="flex flex-col h-full">
          {/* Program Header */}
          <Box className="flex items-center gap-2 mb-3">
            <Typography 
              variant="h6" 
              component="h3" 
              className="font-bold text-gray-800 leading-tight"
            >
              {programName}
            </Typography>
          </Box>

          {/* Program Code */}
          <Box className="flex items-center gap-2 mb-3">
            <Chip 
              label={programCode}
              size="small"
              variant="outlined"
              className="font-mono font-semibold"
              color="primary"
            />
          </Box>

          {/* School */}
          <Box className="flex items-center gap-2 mb-4">
            <Typography 
              variant="body2" 
              className="text-gray-600 flex-1"
            >
              {schoolName}
            </Typography>
          </Box>

          {/* Footer */}
          <Box className="mt-auto pt-4 border-t border-gray-100">
            <Typography 
              variant="caption" 
              className="text-blue-600 font-medium hover:text-blue-800"
            >
              View Program Details →
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EditorProgramcard;