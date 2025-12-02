"use client"; // ✨ Step 1: Make it a Client Component
import React, { useState, useEffect } from "react";
import { Grid, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Masonry } from "@mui/lab";
import Coursecard from "../../../client/components/Coursecard";
import AdminCoursecard from "../../../client/components/admin/Coursecard";
import CreateCourseModal from "../../../client/components/admin/CreateCourseModal";


export default function Course() {
    const[open,setopen]=useState(false);
  // --- ✨ Step 2: Add state for courses and filters ---
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [programmeOptions, setProgrammeOptions] =useState([]);

  // Filter state
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState("");

  // --- ✨ Step 3: Fetch data on the client side ---
  useEffect(() => {
    async function fetchData() {
      // Client-side fetch can use a relative URL
      const response = await fetch("/api/teacher/display");
      if (!response.ok) {
        console.error("Failed to fetch data");
        return;
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log
      const mydata = data.courses || [];
      console.log("Courses data:", mydata); // Debug log
      setCourses(mydata);
      setFilteredCourses(mydata); // Initially, all courses are shown

      // --- Dynamically create filter options from the data ---
      // Fix: Use correct property names from API response
      const schools = [...new Set(mydata.map(item => item.department).filter(Boolean))];
      const programmes = [...new Set(mydata.map(item => item.program).filter(Boolean))];
      console.log("Schools extracted:", schools); // Debug log
      console.log("Programmes extracted:", programmes); // Debug log
      setSchoolOptions(schools);
      setProgrammeOptions(programmes);
    }

    fetchData();
  }, []); // Empty array means this runs once when the component mounts

  // --- ✨ Step 4: Apply filters when state changes ---
  useEffect(() => {
    let tempCourses = [...courses];

    if (selectedSchool) {
      tempCourses = tempCourses.filter(course => course.department === selectedSchool);
    }
    if (selectedProgramme) {
      tempCourses = tempCourses.filter(course => course.program === selectedProgramme);
    }
    
    setFilteredCourses(tempCourses);
  }, [selectedSchool, selectedProgramme, courses]);

  // --- Handlers for the dropdowns ---
  const handleSchoolChange = (event) => {
    const newValue = event.target.value;
    setSelectedSchool(newValue);
    // Clear program filter when school is selected
    if (newValue) {
      setSelectedProgramme("");
    }
  };
  
  const handleProgrammeChange = (event) => {
    const newValue = event.target.value;
    setSelectedProgramme(newValue);
    // Clear school filter when program is selected
    if (newValue) {
      setSelectedSchool("");
    }
  };


  return (
    <>
      <div className="pt-25 text-5xl p-6 flex flex-row justify-between mr-5 ">
          <div className="flex flex-row justify-between gap-9">
              All Courses
          </div>
                      <button className="text-xl px-2 border-2 border-black rounded-xl p-2 text-white font-bold bg-black" onClick={()=>{setopen(true)}}>+Add Courses</button>
                      <CreateCourseModal open={open} onClose={() => setopen(false)}/>
      </div>

      {/* === ✨ NEW FILTER MENU BOXES === */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, pl: 4 }}>
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel id="school-filter-label">Filter by School</InputLabel>
          <Select
            labelId="school-filter-label"
            value={selectedSchool}
            label="Filter by School"
            onChange={handleSchoolChange}
            disabled={Boolean(selectedProgramme)} // Disable when programme is selected
          >
            <MenuItem value="">
              <em>All Schools</em>
            </MenuItem>
            {schoolOptions.map((school) => (
              <MenuItem key={school} value={school}>{school}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel id="programme-filter-label">Filter by Programme</InputLabel>
          <Select
            labelId="programme-filter-label"
            value={selectedProgramme}
            label="Filter by Programme"
            onChange={handleProgrammeChange}
            disabled={Boolean(selectedSchool)} // Disable when school is selected
          >
            <MenuItem value="">
              <em>All Programmes</em>
            </MenuItem>
             {programmeOptions.map((prog) => (
              <MenuItem key={prog} value={prog}>{prog}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {/* ================================ */}
      
      <div className="w-full text-black p-5">
        <Grid container spacing={3}>
          {/* ✨ Step 5: Map over the filteredCourses state */}
          {filteredCourses.map((item) => (
               <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.course_id}>
              <AdminCoursecard
                 id = {item.course_id}
                courseId={item.course_code} 
                Course={item.name} 
                unitCount={item.unit_count}
                topicCount={item.topic_count}
                
              />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
}