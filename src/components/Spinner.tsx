import React from "react";

export default function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-violet-200"></div>
        <div className="w-12 h-12 rounded-full border-4 border-violet-600 border-t-transparent animate-spin absolute top-0"></div>
      </div>
    </div>
  );
}
