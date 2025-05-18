import React from 'react';
import { Link } from "react-router-dom";
import {
    Home,
    MonitorCheck,
    MessageCircleQuestion,
    PlayCircle,
    LibraryBig,
    FileText,
} from "lucide-react";

export default function SidebarO() {
  
  return (
    <nav className='bg-violet-300 h-screen fixed'>
        <div className='p-5 bg-violet-400 justify-items-center'>
            <p className='font-serif text-xl text-black'>Freshers Orientation</p>
        </div>
        
        <Link to="/Orientation" className="flex items-center p-3 hover:bg-purple-100 rounded">
            <Home className='h-6 w-6 mr-1'/> Home
        </Link>
        <Link to="/OrientationGuide" className="flex items-center p-3 hover:bg-purple-100 rounded">
            <MonitorCheck className='h-6 w-6 mr-1'/> Orientaion Checklist
        </Link>
        <Link to="/OrientationVids" className="flex items-center p-3 hover:bg-purple-100 rounded">
            <PlayCircle className='h-6 w-6 mr-1'/> Watch Videos
        </Link>
        <Link to="/Orientation" className="flex items-center p-3 hover:bg-purple-100 rounded">
            <MessageCircleQuestion className='h-6 w-6 mr-1'/> FAQs
        </Link>
    </nav>
  );
}