import React, { useState } from "react";
import SidebarO from "./SidebarO";

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
    answer: "Contact your department or the help desk for further assistance.",
  },
];

export default function OrientationFAQs() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarO />
      <div className="flex-1 ml-64 p-8">
        <div className="sticky top-0 z-10 bg-gray-50 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search FAQs..."
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
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              No FAQs found.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow px-8 py-4 w-full"
              >
                <h2 className="font-semibold text-gray-900 text-lg mb-1">
                  {faq.question}
                </h2>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
