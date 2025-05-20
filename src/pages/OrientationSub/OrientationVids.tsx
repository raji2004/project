import React, { useState } from "react";
import SidebarO from "./SidebarO";

const orientationVideos = [
  {
    title: "Nile Hostel Offerings",
    description: "A look at the hostel facilities and accommodation options.",
    videoUrl: "https://www.youtube.com/embed/y-S9-U8n9eY",
  },
  {
    title: "Nile Fashion Week",
    description: "Highlights from the annual fashion week event.",
    videoUrl: "https://www.youtube.com/embed/aZVKGiBWDSI",
  },
  {
    title: "How to Apply",
    description: "A step-by-step guide to the application process.",
    videoUrl: "https://www.youtube.com/embed/MmJc-8M4HG4",
  },
  {
    title: "Why Nile University?",
    description: "Discover what makes Nile University unique.",
    videoUrl: "https://www.youtube.com/embed/FcGcgPuP844",
  },
  {
    title: "Rules of the Hostel",
    description: "Important rules and guidelines for hostel residents.",
    videoUrl: "https://www.youtube.com/embed/WDTaFYQugf0",
  },
  {
    title: "Tour of Nile University",
    description: "A virtual tour of the campus and its facilities.",
    videoUrl: "https://www.youtube.com/embed/mWo1apygv6o",
  },
];

export default function OrientationVids() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVideos = orientationVideos.filter(
    (vid) =>
      vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarO />
      <div className="flex-1 ml-64 p-8">
        <div className="sticky top-0 z-10 bg-gray-50 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Orientation Videos
            </h1>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVideos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              No videos found.
            </div>
          ) : (
            filteredVideos.map((vid, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow px-8 py-4 w-full flex flex-col md:flex-row items-center gap-6"
              >
                <div className="flex-shrink-0 w-full md:w-1/2">
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                    <iframe
                      width="100%"
                      height="200"
                      src={vid.videoUrl}
                      title={vid.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 text-lg mb-1">
                    {vid.title}
                  </h2>
                  <p className="text-gray-600 text-sm">{vid.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
