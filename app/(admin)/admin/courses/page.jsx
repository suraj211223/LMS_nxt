"use client";
import React, { useState, useEffect, Suspense } from "react";
import { Grid, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Masonry } from "@mui/lab";
import { useSearchParams } from "next/navigation";
import AdminCoursecard from "../../../client/components/admin/Coursecard";
import CreateCourseModal from "../../../client/components/admin/CreateCourseModal";

function CourseContent() {
  const [open, setopen] = useState(false);
  const searchParams = useSearchParams();

  // Data state
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [programmeOptions, setProgrammeOptions] = useState([]);

  // Filter state
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState(searchParams.get("program") || "");

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/teacher/display");
      if (!response.ok) {
        console.error("Failed to fetch data");
        return;
      }

      const data = await response.json();
      const mydata = data.courses || [];
      setCourses(mydata);
      // setFilteredCourses(mydata); // filtering effect will handle this

      const schools = [...new Set(mydata.map(item => item.department).filter(Boolean))];
      const programmes = [...new Set(mydata.map(item => item.program).filter(Boolean))];
      setSchoolOptions(schools);
      setProgrammeOptions(programmes);
    }
    fetchData();
  }, []);

  // Apply filters
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

  const handleSchoolChange = (event) => {
    const newValue = event.target.value;
    setSelectedSchool(newValue);
    if (newValue) {
      setSelectedProgramme("");
    }
  };

  const handleProgrammeChange = (event) => {
    const newValue = event.target.value;
    setSelectedProgramme(newValue);
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
        <button className="text-xl px-2 border-2 border-black rounded-xl p-2 text-white font-bold bg-black" onClick={() => { setopen(true) }}>+Add Courses</button>
        <CreateCourseModal open={open} onClose={() => setopen(false)} />
      </div>

      {/* === FILTER MENU BOXES === */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, pl: 4 }}>
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel id="school-filter-label">Filter by School</InputLabel>
          <Select
            labelId="school-filter-label"
            value={selectedSchool}
            label="Filter by School"
            onChange={handleSchoolChange}
            disabled={Boolean(selectedProgramme)}
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
            disabled={Boolean(selectedSchool)}
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

      <div className="w-full text-black p-5">
        <Grid container spacing={3}>
          {filteredCourses.map((item) => (
            <Grid _size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.course_id || item.id}>
              <AdminCoursecard
                id={item.course_id}
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

export default function Course() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CourseContent />
    </Suspense>
  );
}