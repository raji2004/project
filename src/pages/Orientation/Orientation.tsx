import React, { useState } from "react";

const tabs = [
  { id: "checklist", label: "Orientation Checklist" },
  { id: "videos", label: "Watch Videos" },
  { id: "faq", label: "FAQs" },
];

export default function Orientation() {
  const [activeTab, setActiveTab] = useState("checklist");
  const [searchQuery, setSearchQuery] = useState("");

  // Example FAQ data
  const faqs = [
    {
      question: "Where do my results show?",
      answer:
        "You can view your results on the student portal under the 'Results' section.",
    },
    {
      question: "How do I get notes?",
      answer:
        "Notes are available in the Resources section or provided by your lecturers.",
    },
    {
      question: "Where do we take classes?",
      answer:
        "Class locations are listed in your schedule and on the student portal.",
    },
    {
      question: "Still don't get it?",
      answer:
        "Contact your department or the help desk for further assistance.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed top-16 left-0 h-screen bg-violet-300 w-64">
        <nav className="bg-violet-300 sticky top-0 h-full">
          <div className="p-5 bg-violet-400">
            <p className="font-serif text-xl text-black">
              Freshers Orientation
            </p>
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center w-full text-left p-3 hover:bg-violet-200 rounded transition-colors font-medium ${
                activeTab === tab.id ? "bg-violet-200" : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 bg-gray-50 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
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
        {/* Tab Content */}
        {activeTab === "checklist" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold mb-2">
                Step 1: About the Campus
              </h2>
              <p>
                Learn about the campus layout, facilities, and important
                locations.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold mb-2">
                Step 2: How to Use Student Portals
              </h2>
              <p>
                Instructions on accessing and using the student portal for
                results, registration, and more.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold mb-2">
                Step 3: Key Departments
              </h2>
              <p>Overview of key departments and their contact information.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold mb-2">
                Step 4: Clubs and Activities
              </h2>
              <p>
                Explore clubs, societies, and extracurricular activities
                available on campus.
              </p>
            </div>
          </div>
        )}
        {activeTab === "videos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold mb-2">Welcome to Campus</h2>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Video 1</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold mb-2">
                Navigating the Portal
              </h2>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Video 2</span>
              </div>
            </div>
          </div>
        )}
        {activeTab === "faq" && (
          <div className="grid grid-cols-1 gap-6">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                No FAQs found.
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
