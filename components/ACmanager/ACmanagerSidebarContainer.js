"use client";
import { useState } from "react";
import Sidebar from "@components/ACmanager/Sidebar";

export default function SidebarContainer({ editContent }) {
    const [selectedSection, setSelectedSection] = useState("overview");

    return (
        <div className=" ">
            {/* Sidebar Container */}
            <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} editContent={editContent}/>
        </div>
    );
}