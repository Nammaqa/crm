"use client";
import { useState } from "react";
import Sidebar from "@components/Dashboard/Sidebar";


export default function Dashboard() {
    const [selectedSection, setSelectedSection] = useState("overview");

    return (
        <div className=" ">
            {/* Sidebar Container */}
            <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />

        </div>
    );
}
