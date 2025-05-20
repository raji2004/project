import React from "react";
import { Link } from "react-router-dom";
import { MonitorCheck, MessageCircleQuestion, PlayCircle } from "lucide-react";

export default function SidebarO() {
  return (
    <div className="fixed top-16 left-0 h-screen bg-violet-300">
      <nav className="bg-violet-300 sticky top-0 w-max">
        <div className="p-5 bg-violet-400 justify-items-center">
          <p className="font-serif text-xl text-black">Freshers Orientation</p>
        </div>
        <Link
          to="/OrientationGuide"
          className="flex items-center p-3 hover:bg-violet-200 rounded"
        >
          <MonitorCheck className="h-6 w-6 mr-1" /> Orientaion Checklist
        </Link>
        <Link
          to="/OrientationVids"
          className="flex items-center p-3 hover:bg-violet-200 rounded"
        >
          <PlayCircle className="h-6 w-6 mr-1" /> Watch Videos
        </Link>
        <Link
          to="/OrientationFAQs"
          className="flex items-center p-3 hover:bg-violet-200 rounded"
        >
          <MessageCircleQuestion className="h-6 w-6 mr-1" /> FAQs
        </Link>
      </nav>
    </div>
  );
}
