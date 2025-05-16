"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";

// Import section components
import Overview from "@components/Bdsales/Content/Overview";
import BdSales from "@components/Bdsales/Content/BdSales";
import Recruitment from "@components/Bdsales/Content/Recruitment";
import MsaNda from '@/components/Bdsales/Content/MsaNda';
import Sow from "@components/Bdsales/Content/Sow";
import Po from "@components/Bdsales/Content/Po";
// import AcManager from "@components/BdSales/Content/AcManager";
// import Marketing from "@components/BdSales/Content/Marketing";
// import ItTeam from "@components/BdSales/Content/ItTeam";
// import Invoice from "@components/BdSales/Content/Invoice";
//  import JobList from "@components/BdSales/Content/JobList"
// Import icons
import {
  FaChartPie,
  FaHandshake,
  FaUsers,
  FaFileContract,
  FaClipboardList,
  FaShoppingCart,
  FaSignOutAlt,
  // FaBuilding,
  // FaBullhorn,
  // FaLaptopCode,
  // FaFileInvoice,
  // FaBriefcase
} from "react-icons/fa";

// Sidebar sections with dynamic content
const sections = [
  { id: "overview", label: "Overview", icon: <FaChartPie size={20} />, content: <Overview /> },
  { id: "bd-sales", label: "BD/Sales", icon: <FaHandshake size={20} />, content: <BdSales /> },
  { id: "recruitment", label: "Requirement", icon: <FaUsers size={20} />, content: <Recruitment /> },
  // { id: "joblist", label: "Job list", icon: <FaBriefcase size={20} />, content: <JobList /> },
  { id: "msa", label: "MSA & NDA", icon: <FaFileContract size={20} />, content: <MsaNda /> },
  { id: "sow", label: "Statement of Work", icon: <FaClipboardList size={20} />, content: <Sow /> },
  { id: "po", label: "Purchase Order", icon: <FaShoppingCart size={20} />, content: <Po /> },
  // { id: "ac-manager", label: "A/C Manager", icon: <FaBuilding size={20} />, content: <AcManager /> },
  // { id: "marketing", label: "Marketing", icon: <FaBullhorn size={20} />, content: <Marketing /> },
  // { id: "it-team", label: "IT Team", icon: <FaLaptopCode size={20} />, content: <ItTeam /> },
  // { id: "invoice", label: "Invoice", icon: <FaFileInvoice size={20} />, content: <Invoice /> },
];

export default function Bdsles() {
  const [selectedSection, setSelectedSection] = useState("overview"); // Default section
  const [open, setOpen] = useState(true);
  const router = useRouter();

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      alert("Logout failed");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      {/* Sidebar Container */}
      <div
        className={`bg-gray-900 text-white h-full p-5 pt-8 transition-all duration-300 flex flex-col flex-shrink-0 relative ${open ? "w-64" : "w-20"
          }`}
      >
        {/* Sidebar Toggle Button - Properly Positioned */}
        <button
          className="absolute top-6 right-[-15px] bg-gray-800 text-white p-2 rounded-full border-2 border-gray-600 hover:bg-gray-700 focus:outline-none transition-all"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>

        {/* Logo Section */}
        <div className="flex items-center gap-x-4 mb-6">
          <Image
            src="/Wizzybox Logo.png"
            alt="Company Logo"
            width={open ? 150 : 40}
            height={50}
            className={`transition-all duration-300 ${!open ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
          />
        </div>

        {/* Sidebar Menu Items */}
        <ul className="flex flex-col space-y-2 flex-1">
          {sections.map((section) => (
            <li
              key={section.id}
              className={`flex items-center p-2 rounded-md cursor-pointer text-sm transition-all hover:bg-gray-700 ${selectedSection === section.id ? "bg-gray-700" : ""
                }`}
              onClick={() => setSelectedSection(section.id)}
              tabIndex={0} // Makes it keyboard accessible
            >
              <div className="w-8 text-center">{section.icon}</div>
              <span className={`transition-all duration-300 ${!open ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
                {section.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Logout Button at the Bottom */}
        <button
          onClick={handleLogout}
          className={`absolute bottom-6 left-0 w-full flex items-center justify-center gap-2 p-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-all text-sm ${open ? "pl-8 pr-4" : "pl-2 pr-2"}`}
        >
          <FaSignOutAlt size={18} />
          <span className={`transition-all duration-300 ${!open ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>Logout</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center overflow-auto p-6">
        <div className="w-full max-w-6xl pt-6">
          {sections.find((s) => s.id === selectedSection)?.content}
        </div>
      </main>
    </div>
  );
}