"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Grid, Typography, Box, Card, CardContent, Chip } from "@mui/material";
import Coursecard from "../../../../client/components/Coursecard";
import AdminCoursecard from "../../../../client/Admincomponents/Coursecard";

export default function ProgramDetail() {
  const params = useParams();         // ✅ Works in client component
  const id = params.id;               // ❗ Now safely accessible

  const [courses, setCourses] = useState([]);
  const [programInfo, setProgramInfo] = useState(null);

  async function fetch_programDetails(id) {
    try {
      const response = await fetch(`/api/teacher/display?programId=${id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch program data");
      }

      const data = await response.json();

      const fetchedCourses = data.courses || [];
      setCourses(fetchedCourses);

      if (fetchedCourses.length > 0) {
        setProgramInfo({
          name: fetchedCourses[0].program,
          department: fetchedCourses[0].department,
          code:
            fetchedCourses[0].program_code ||
            fetchedCourses[0].course_code ||
            "N/A",
        });
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
    }
  }

  useEffect(() => {
    if (id) {
      fetch_programDetails(id);
    }
  }, [id]);

  return (
    <>
      <Box className="pt-25 p-6">
        {programInfo && (
          <Card className="mb-6 bg-blue-50">
            <CardContent>
              <Typography variant="h3" className="text-4xl font-bold text-gray-800 mb-2">
                {programInfo.name}
              </Typography>

              <Box className="flex items-center gap-4 mb-4">
                <Chip label={programInfo.code} color="primary" variant="outlined" />
                <Typography variant="subtitle1" className="text-gray-600">
                  {programInfo.department}
                </Typography>
              </Box>

              <Typography variant="body1" className="text-gray-700">
                {courses.length} {courses.length === 1 ? "course" : "courses"} available
              </Typography>
            </CardContent>
          </Card>
        )}

        <Typography variant="h4" className="text-2xl font-semibold text-gray-800 mb-4">
          Courses in this Program
        </Typography>
      </Box>

      <div className="w-full text-black p-5">
        <Grid container spacing={3}>
          {courses.length > 0 ? (
            courses.map((course) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={course.course_id}>
                <AdminCoursecard
                  id={course.course_id}
                    courseId={course.course_code || course.code || course.course_id || 'No Code'}
                  Course={course.name}
                  unitCount={course.unit_count}
                  topicCount={course.topic_count}
                />
              </Grid>
            ))
          ) : (
            <Grid size={{ xs: 12 }}>
              <Box className="text-center py-12">
                <Typography variant="h6" className="text-gray-500">
                  No courses found for this program
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </div>
    </>
  );
}
