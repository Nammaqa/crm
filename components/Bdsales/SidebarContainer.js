"use client";

import { useState } from "react";
import Sidebar from "@components/Bdsales/Sidebar";
export default function SidebarContainer() {

    const [selectedSection, setSelectedSection] = useState("overview");
    return <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
}