"use client";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";

// Import section components
import Overview from "@/components/ItTeam/content/Overview";
import BdSales from "@components/Admin/Content/BdSales";
import Recruitment from "@components/Admin/Content/Recruitment";
import Msa from "@components/Admin/Content/Msa";
import Nda from "@components/Admin/Content/Nda";
import Sow from "@components/Admin/Content/Sow";
import Po from "@components/Admin/Content/Po";
import AcManager from "@components/Admin/Content/AcManager";
import Marketing from "@components/Admin/Content/Marketing";
import  DeviceInventoryPage  from "@/components/ItTeam/content/ItemsList";

import Invoice from "@components/Admin/Content/Invoice";
import JobList from "@components/Admin/Content/JobList";
import Adduser from "@components/Admin/Content/AddUser";
import AgreementList from "@components/Admin/Content/AgreementList";
import RequirementList from "@components/Admin/Content/RequirementList";

// Import icons
import {
  FaChartPie,
  FaHandshake,
  FaUsers,
  FaFileContract,
  FaClipboardList,
  FaShoppingCart,
  FaBuilding,
  FaBullhorn,
  FaLaptopCode,
  FaFileInvoice,
  FaBriefcase,
  FaFileAlt,
  FaSignOutAlt,
  FaListAlt,
  FaUser,
} from "react-icons/fa";

// Sidebar sections with dynamic content
const sections = [
  { id: "overview", label: "Overview", icon: <FaChartPie size={20} />, content: <Overview /> },
//   { id: "requirement-list", label: "Requirement List", icon: <FaListAlt size={20} />, content: <RequirementList /> },
  { id: "it-team", label: "IT Team", icon: <FaLaptopCode size={20} />, content: <DeviceInventoryPage /> },

];

export default function Dashboard() {
  const [selectedSection, setSelectedSection] = useState("overview");
  const [open, setOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar (Left Side) */}
      <aside
        className={`bg-gray-900 text-white h-full p-5 pt-8 transition-all duration-300 flex flex-col border-r border-gray-800 shadow-md ${
          open ? "w-64" : "w-20"
        } relative overflow-y-auto overflow-x-hidden`} // Only vertical scroll
      >
        {/* Toggle Button */}
        <button
          className="absolute top-6 right-[-15px] bg-gray-800 text-white p-2 rounded-full border-2 border-gray-600 hover:bg-gray-700 focus:outline-none transition-all"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>

        {/* Logo */}
       <div className="flex items-center gap-x-4 mb-6">
          <Image
            src="/Wizzybox-logo.png"
            alt="Company Logo"
            width={150}
            height={50}
            unoptimized
            priority
            className={`transition-all duration-300 ${open ? "w-auto h-auto" : "w-0 h-0 opacity-0"}`}
            style={{ width: open ? 'auto' : 0, height: 'auto' }}
          />
        </div>

        {/* Sidebar Menu Items */}
        <ul className="flex flex-col space-y-2">
          {sections.map((section) => (
            <li
              key={section.id}
              className={`flex items-center p-2 rounded-md cursor-pointer text-sm transition-all hover:bg-gray-700 ${
                selectedSection === section.id ? "bg-gray-700" : ""
              }`}
              onClick={() => setSelectedSection(section.id)}
              tabIndex={0}
            >
              <div className="w-8 text-center">{section.icon}</div>
              <span
                className={`transition-all duration-300 ${
                  !open ? "opacity-0 w-0" : "opacity-100 w-auto"
                }`}
              >
                {section.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center p-2 rounded-md cursor-pointer text-sm transition-all bg-red-600 hover:bg-red-700 text-white"
        >
          <div className="w-8 text-center">
            <FaSignOutAlt size={20} />
          </div>
          <span
            className={`transition-all duration-300 ${
              !open ? "opacity-0 w-0" : "opacity-100 w-auto"
            }`}
          >
            Logout
          </span>
        </button>
      </aside>

      {/* Main Content Area (Right Side) */}
      <main className="flex-1 h-full overflow-auto p-6 bg-gray-100">
        <div className="w-full max-w-6xl pt-6">
          {sections.find((s) => s.id === selectedSection)?.content}
        </div>
      </main>
    </div>
  );
}