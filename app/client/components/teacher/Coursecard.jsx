"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@mui/material";
import { BookOpen, Layers } from "lucide-react";


const Coursecard = ({ id, courseId, Course, unitCount, topicCount }) => {
  const router = useRouter();
  return (
    <Card className="h-full">
    <div className="bg-white w-full border-l-4 border-t-2 border-r-2 border-b-2 border-r-gray-200 border-t-gray-200 border-b-gray-200 border-blue-500 h-88 text-black p-4 rounded-lg flex flex-col">

      {/* CONTENT */}
      <div className="grow">
                <h2 className="text-2xl mt-2 text-black line-clamp-3">{Course}</h2>
        <h3 className="font-bold text-blue-500 border-2 w-max p-1 rounded-3xl my-2 bg-blue-200/40 border-blue-500 text-sm">{courseId}</h3>
        {/* Cards */}
        <div className="mt-4">
          <div className="flex gap-3 w-full">
            {/* Units Card */}
            <div 
              className="flex-1 rounded-xl p-3 border text-gray-700 h-16 flex flex-col justify-center"
              style={{
                background: "#EEF7FF",
                borderColor: "#CDE5FF",
              }}
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <Layers size={14} />
                Units
              </div>
              <p className="text-xl font-semibold">{unitCount || 0}</p>
            </div>
            
            {/* Topics Card */}
            <div
              className="flex-1 rounded-xl p-3 border text-gray-700 h-16 flex flex-col justify-center"
              style={{
                background: "#FFF4FA",
                borderColor: "#FFD9EC",
              }}
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <BookOpen size={14} />
                Topics
              </div>
              <p className="text-xl font-semibold">{topicCount || 0}</p>
            </div>
          </div>
        </div>
      </div>
    
      {/* BUTTON AREA (Right Bottom) */}
      <div className="flex justify-end mt-4">
        <button className="rounded-lg text-white bg-gray-800 py-2 px-2 w-30 text-center" onClick={()=>router.push(`/teachers/courses/${id}`)}>
          Learn More
        </button>
      </div>
    </div>
    </Card>
  );
};

export default Coursecard;
