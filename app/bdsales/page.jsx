"use client";
import { useState } from "react";
import Sidebar from "@components/Bdsales/Sidebar";


export default function Dashboard() {
    const [selectedSection, setSelectedSection] = useState("overview");

    return (
        <>
            {/* Sidebar Container */}
            <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />

        </>
    );
}
