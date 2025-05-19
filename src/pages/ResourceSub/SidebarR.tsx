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
    <div className='absolute top-16 left-0 h-screen bg-violet-300'>
        <nav className='bg-violet-300 sticky top-0 w-max'>
            <div className='p-5 bg-violet-400 justify-items-center'>
                <p className='font-serif text-xl text-black'>TheResource Library</p>
            </div>
        
            <Link to="/Resources" className="flex items-center p-3 hover:bg-violet-200 rounded">
                <Home className='h-6 w-6 mr-1'/> Home
            </Link>
            <Link to="/ResourcesLibrary" className="flex items-center p-3 hover:bg-violet-200 rounded">
                <LibraryBig className='h-6 w-6 mr-1'/> Resource Library
            </Link>
            <Link to="/ResourcesPQ" className="flex items-center p-3 hover:bg-violet-200 rounded">
                <FileText className='h-6 w-6 mr-1'/> Practice/Past Questions
            </Link>
        </nav>
    </div>
  );
}