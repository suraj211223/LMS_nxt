"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Box,
  InputAdornment,
  Button
} from "@mui/material";
import { Edit, Delete, Search, Sort, Add, Link as LinkIcon } from "@mui/icons-material";
// Correct imports relative to new_ui/UI/(admin)/admin/dashboard
import CreateUser from "../../../Admincomponents/CreateUser";
import AssignCourse from "../../../Admincomponents/AssignCourse";

const AdminDash = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    teachers: 0,
    editors: 0,
    programs: 0,
    topics: 0
  });
  const [open, setOpen] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data for dashboard + teachers table
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      console.log("Dashboard data received:", data);

      if (data.stats) {
        setStats(data.stats);
      }
      if (data.teachers) {
        setTeachersList(data.teachers);
        setFilteredTeachers(data.teachers);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = teachersList.filter((teacher) =>
      (teacher.name || '').toLowerCase().includes(query) ||
      (teacher.email || '').toLowerCase().includes(query) ||
      (teacher.role || '').toLowerCase().includes(query)
    );

    setFilteredTeachers(filtered);
  };

  // Sort functionality
  const handleSort = () => {
    const sorted = [...filteredTeachers].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
    setFilteredTeachers(sorted);
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("User deleted");
        fetchDashboardData();
      } else {
        alert("Failed to delete user");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting user");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
      <h2 className="pt-20 pl-20 text-4xl font-bold">Admin Dashboard</h2>

      {error && (
        <div className="pt-4 pl-20 text-red-500">
          Error loading dashboard: {error}
        </div>
      )}

      {loading ? (
        <div className="pt-8 pl-20">Loading dashboard...</div>
      ) : (
        <>
          {/* DASHBOARD CARDS */}
          <Grid container spacing={3} direction="row" className="pt-8 px-20">
            {[
              { label: "Total Users", value: stats.totalUsers, bg: "rgba(59,130,246,0.1)", color: "#1d4ed8", borderColor: "#3b82f6" },
              { label: "Teachers", value: stats.teachers, bg: "rgba(34,197,94,0.1)", color: "#15803d", borderColor: "#22c55e" },
              { label: "Editors", value: stats.editors, bg: "rgba(251,146,60,0.1)", color: "#c2410c", borderColor: "#fb923c" },
              { label: "Total Programs", value: stats.programs, bg: "rgba(168,85,247,0.1)", color: "#7c2d12", borderColor: "#a855f7" },
              { label: "Total Topics", value: stats.topics, bg: "rgba(6,182,212,0.1)", color: "#0e7490", borderColor: "#06b6d4" },
            ].map((item, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={index}>
                <Card
                  sx={{
                    p: 3,
                    border: `2px solid ${item.borderColor}`,
                    borderRadius: "16px",
                    background: `linear-gradient(135deg, ${item.bg} 0%, rgba(255,255,255,0.9) 100%)`,
                    height: "140px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                    }
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: item.color,
                      fontWeight: 600,
                      textAlign: "center",
                      fontSize: "1rem",
                      mb: 1
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "#000",
                      fontWeight: 700,
                      fontSize: "2.5rem"
                    }}
                  >
                    {item.value || 0}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* TEACHERS TABLE */}
          <Box sx={{ mx: 20, mt: 8 }}>
            {/* HEADER WITH TITLE AND ADD BUTTONS */}
            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3
            }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: "#374151" }}>
                Users List
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  startIcon={<LinkIcon />}
                  onClick={() => setOpenAssign(true)}
                  sx={{
                    backgroundColor: "#fff",
                    color: "#000",
                    border: "1px solid #e5e7eb",
                    px: 3,
                    py: 1.5,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#f9fafb",
                    }
                  }}
                >
                  Assign Course
                </Button>
                <Button
                  startIcon={<Add />}
                  onClick={() => setOpen(true)}
                  sx={{
                    backgroundColor: "#000",
                    color: "#fff",
                    px: 3,
                    py: 1.5,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#374151",
                    }
                  }}
                >
                  Add User
                </Button>
              </Box>

              <CreateUser open={open} onClose={() => { setOpen(false); fetchDashboardData(); }} />
              <AssignCourse open={openAssign} onClose={() => setOpenAssign(false)} />
            </Box>

            {/* TABLE CONTAINER WITH SEARCH */}
            <Paper sx={{
              p: 3,
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.05)"
            }}>
              {/* SEARCH BAR */}
              <Box sx={{
                display: "flex",

                alignItems: "center",
                gap: 2,
                mb: 3,
                pb: 2,
                borderBottom: "1px solid rgba(0,0,0,0.1)"
              }}>
                <TextField
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  variant="outlined"
                  size="small"
                  sx={{
                    width: 300,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "#6b7280" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton
                  onClick={handleSort}
                  sx={{
                    backgroundColor: "#f3f4f6",
                    "&:hover": { backgroundColor: "#e5e7eb" },
                    borderRadius: "12px"
                  }}
                >
                  <Sort />
                </IconButton>
              </Box>

              {/* TABLE WITH SCROLL */}
              <TableContainer sx={{
                maxHeight: 500,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                      <TableCell sx={{ fontWeight: 600, position: 'sticky', top: 0, backgroundColor: "#f9fafb", zIndex: 1 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, position: 'sticky', top: 0, backgroundColor: "#f9fafb", zIndex: 1 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, position: 'sticky', top: 0, backgroundColor: "#f9fafb", zIndex: 1 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600, position: 'sticky', top: 0, backgroundColor: "#f9fafb", zIndex: 1 }}>Role</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, position: 'sticky', top: 0, backgroundColor: "#f9fafb", zIndex: 1 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((teacher) => (
                        <TableRow
                          key={teacher.id}
                          sx={{
                            "&:hover": { backgroundColor: "#f9fafb" },
                            transition: "background-color 0.2s ease"
                          }}
                        >
                          <TableCell>{teacher.id}</TableCell>
                          <TableCell>{teacher.name || 'N/A'}</TableCell>
                          <TableCell>{teacher.email || 'N/A'}</TableCell>
                          <TableCell>
                            <span style={{
                              padding: "4px 12px",
                              borderRadius: "20px",
                              backgroundColor: teacher.role === 'teacher' ? "#dcfce7" : "#f3f4f6",
                              color: teacher.role === 'teacher' ? "#166534" : "#374151",
                              fontSize: "0.875rem",
                              fontWeight: 500
                            }}>
                              {teacher.role || 'user'}
                            </span>
                          </TableCell>

                          <TableCell align="right">
                            <div className="flex gap-1 justify-end">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleDeleteUser(teacher.id)}
                                sx={{
                                  "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" }
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            {searchQuery ? `No users found matching "${searchQuery}"` : "No teachers found"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </>
      )}
    </>
  );
};

export default AdminDash;
