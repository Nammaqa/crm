
"use client";
import { useState } from "react";
import Sidebar from "@components/Admin/Sidebar";

export default function SidebarContainer() {
    const [selectedSection, setSelectedSection] = useState("overview");

    return <div className=" ">
        {/* Sidebar Container */}
        <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />

    </div>
}