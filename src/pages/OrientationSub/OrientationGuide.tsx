import React, { useState } from "react";
import OrientationLayout from "./OrientationLayout";

const checklistSteps = [
  {
    title: "About the Campus",
    description:
      "Learn about the campus layout, facilities, and important locations.",
    details:
      "The campus includes libraries, cafeterias, lecture halls, and recreational areas. Maps are available at the main entrance and online.",
  },
  {
    title: "How to Use Student Portals",
    description:
      "Instructions on accessing and using the student portal for results, registration, and more.",
    details:
      "Log in with your student credentials. You can check your results, register for courses, and access announcements.",
  },
  {
    title: "Key Departments",
    description: "Overview of key departments and their contact information.",
    details:
      "Departments include Academic Affairs, Student Services, IT Support, and more. Contact info is available on the university website.",
  },
  {
    title: "Clubs and Activities",
    description:
      "Explore clubs, societies, and extracurricular activities available on campus.",
    details:
      "Join clubs to meet new people and develop skills. Activities are announced on the student portal and notice boards.",
  },
];

export default function OrientationGuide() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredSteps = checklistSteps.filter(
    (step) =>
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <OrientationLayout>
      <div className=" bg-gray-50 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Orientation Checklist
          </h1>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search steps..."
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
      <div className="flex flex-col gap-4">
        {filteredSteps.map((step, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow px-8 py-4 w-full cursor-pointer"
            onClick={() => handleToggle(idx)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg mb-1">
                  {step.title}
                </h2>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
              <span
                className={`ml-4 text-purple-500 text-2xl transition-transform ${
                  openIndex === idx ? "rotate-90" : ""
                }`}
              >
                &#9654;
              </span>
            </div>
            {openIndex === idx && (
              <div className="mt-4 border-t pt-4 text-gray-700 text-sm">
                {step.details}
              </div>
            )}
          </div>
        ))}
      </div>
    </OrientationLayout>
  );
}
