import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LibraryBig, FileText } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export default function SidebarR() {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      path: "/ResourcesLibrary",
      label: "Resource Library",
      icon: <LibraryBig className="h-6 w-6 mr-1" />,
    },
    {
      path: "/ResourcesPQ",
      label: "Practice/Past Questions",
      icon: <FileText className="h-6 w-6 mr-1" />,
    },
  ];

  return (
    <div className="fixed top-16 left-0 h-screen bg-violet-300 w-64">
      <nav className="bg-violet-300 sticky top-0 h-full">
        <div className="p-5 bg-violet-400">
          <p className="font-serif text-xl text-black">Resource Library</p>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center p-3 hover:bg-violet-200 rounded transition-colors ${
              location.pathname === item.path ? "bg-violet-200" : ""
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
