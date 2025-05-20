import React from "react";
import SidebarO from "./SidebarO";

export default function OrientationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block md:sticky md:top-0 h-screen">
        <SidebarO />
      </div>
      <div className="flex-1 md:ml-64 p-8">{children}</div>
    </div>
  );
}
