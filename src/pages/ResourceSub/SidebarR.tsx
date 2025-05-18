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

export default function SidebarR() {
  
  return (
    <nav className='bg-violet-300 h-screen fixed'>
        <div className='p-5 bg-violet-400 justify-items-center'>
            <p className='font-serif text-xl text-black'>Freshers Resource Library</p>
        </div>
        
        <Link to="/Resources" className="flex items-center p-3 hover:bg-purple-100 rounded">
            <Home className='h-6 w-6 mr-1'/> Home
        </Link>
        <Link to="/ResourcesLibrary" className="flex items-center p-3 hover:bg-purple-100 rounded">
            <LibraryBig className='h-6 w-6 mr-1'/> Resource Library
        </Link>
        <Link to="/OrientationVids" className="flex items-center p-3 hover:bg-purple-100 rounded">
            <PlayCircle className='h-6 w-6 mr-1'/> Weekly Planner
        </Link>
        <Link to="/ResourcesPQ" className="flex items-center p-3 hover:bg-purple-100 rounded">
            <FileText className='h-6 w-6 mr-1'/> Practice/Past Questions
        </Link>
    </nav>
  );
}