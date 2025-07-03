"use client";

import { useState } from "react";
import Sidebar from "@components/Recruiter/Sidebar";
export default function SidebarContainer({ editContent }) {

    const [selectedSection, setSelectedSection] = useState("overview");
    return <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} editContent={editContent} />
}