"use client";
import React from 'react';
import { Card, CardContent, Typography, Chip, Box, IconButton } from '@mui/material';
import { Trash2 } from 'lucide-react';

const AdminProgramcard = ({ id, programName, programCode, schoolName }) => {
  return (
    <Card 
      className="h-full transition-all duration-300 hover:shadow-lg  cursor-pointer border-l-4 border-l-blue-500"
      onClick={() => {
        // Navigate to program details or courses within this program
        window.location.href = `/admin/programs/${id}`;
      }}
    >
      <CardContent className="p-6">
        <Box className="flex flex-col h-full">
          {/* Program Header */}
          <Box className="flex justify-between items-center mb-3">
            <Typography 
              variant="h6" 
              component="h3" 
              className="font-bold text-gray-800 leading-tight flex-1"
            >
              {programName}
            </Typography>
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // Add delete functionality here
                console.log('Delete program:', id);
              }}
              sx={{
                color: "#ef4444", // red-500
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(254, 226, 226, 0.8)", // light red background
                  color: "#dc2626" // red-600 on hover
                }
              }}
            >
              <Trash2 size={18} />
            </IconButton>
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

export default AdminProgramcard;