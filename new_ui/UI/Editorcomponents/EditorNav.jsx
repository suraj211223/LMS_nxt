"use client";

import React, { useState } from "react";
import { AppBar, Toolbar, Drawer, InputBase, Box } from "@mui/material";
import { Search, Menu } from "@mui/icons-material";
import { LogOut } from "lucide-react"; // Lucide Signout Icon
import { useRouter } from "next/navigation";

const EditorNav = () => {
  const [open, setOpen] = useState(false);
  const [active, setactive] = useState(false);
  const [userName, setUserName] = useState("User");

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUserName(data.firstName || "User");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  const toggleDrawer = (value) => {
    setOpen(value);
  };

  const isactive = (value) => {
    setactive(value);
  };

  const router = useRouter();
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md flex justify-between items-center px-4 py-2">
        {/* Menu Icon */}
        <Menu
          className="text-3xl cursor-pointer text-black"
          onClick={() => toggleDrawer(true)}
        />

        {/* Search Box */}
        <div className="flex flex-row items-center border-2 border-gray-400 px-2 py-1 rounded-md">
          <Search className="text-gray-500" />
          <InputBase className="pl-2" placeholder="Search..." />
        </div>
      </div>

      {/* Drawer */}
      <Drawer anchor="left" open={open} onClose={() => toggleDrawer(false)}>
        <Box className="w-64 h-full flex flex-col p-4 text-lg">

          {/* TOP SECTION */}
          <div className="flex flex-col gap-5">

            {/* Profile */}
            <div className="flex flex-col items-center justify-center py-6">
              <img
                className="w-20 h-20 rounded-full shadow-md"
                src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.jixXH_Els1MXBRmKFdMQPAHaHa%3Fcb%3Ducfimg2%26pid%3DApi%26ucfimg%3D1&f=1&ipt=5f2c9482b3203216f66634e457db5adab9cbfcd1542e6d9ac338fae4e0abf505&ipo=images"
              />
              <p className="py-2 text-2xl font-semibold">Hi {userName}</p>
            </div>

            {/* Menu Buttons */}
            <button
              className={`rounded-xl px-3 py-2 transition-all duration-200 ${active === 1
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-200"
                }`}
              onClick={() => {
                isactive(1);
                router.push(`/editor/dashboard`);
                toggleDrawer(false);
              }}
            >
              Dashboard
            </button>

            <button
              className={`rounded-xl px-3 py-2 transition-all duration-200 ${active === 2
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-200"
                }`}
              onClick={() => {
                isactive(2);
                router.push(`/editor/programs`);
                toggleDrawer(false);
              }}
            >
              Programs
            </button>

            <button
              className={`rounded-xl px-3 py-2 transition-all duration-200 ${active === 3
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-200"
                }`}
              onClick={() => {
                isactive(3);
                router.push(`/editor/courses`);
                toggleDrawer(false);
              }}
            >
              Courses
            </button>
          </div>

          {/* SIGN OUT BUTTON AT BOTTOM */}
          <div className="mt-auto">
            <button
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-red-500 hover:bg-red-100 transition-all duration-200"
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                  router.push('/login');
                } catch (error) {
                  console.error("Logout failed", error);
                }
              }}
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </Box>
      </Drawer>
    </>
  );
};

export default EditorNav;
