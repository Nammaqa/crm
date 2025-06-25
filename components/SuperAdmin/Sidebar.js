"use client";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";

// Import section components
import Overview from "@components/SuperAdmin/Content/Overview";
import BdSales from "@components/SuperAdmin/Content/BdSales";
import Recruitment from "@components/SuperAdmin/Content/Recruitment";
import Msa from "@components/SuperAdmin/Content/Msa";
import Nda from "@components/SuperAdmin/Content/Nda";
import Sow from "@components/SuperAdmin/Content/Sow";
import Po from "@components/SuperAdmin/Content/Po";
import AcManager from "@components/SuperAdmin/Content/AcManager";
import Marketing from "@components/SuperAdmin/Content/Marketing";
import ItTeam from "@components/SuperAdmin/Content/ItTeam";
import Invoice from "@components/SuperAdmin/Content/Invoice";
import JobList from "@components/SuperAdmin/Content/JobList";
import Adduser from "@components/SuperAdmin/Content/AddUser";
import AgreementList from "@components/SuperAdmin/Content/AgreementList";
import RequirementList from "@components/SuperAdmin/Content/RequirementList";

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
  { id: "add-user", label: "Add User", icon: <FaUser size={20} />, content: <Adduser /> },
  { id: "bd-sales", label: "BD/Sales", icon: <FaHandshake size={20} />, content: <BdSales /> },
  { id: "agreement-list", label: "Agreement List", icon: <FaFileAlt size={20} />, content: <AgreementList /> },
  { id: "requirement-list", label: "Requirement List", icon: <FaListAlt size={20} />, content: <RequirementList /> },
  { id: "recruitment", label: "Requirement", icon: <FaUsers size={20} />, content: <Recruitment /> },
  { id: "joblist", label: "Job list", icon: <FaBriefcase size={20} />, content: <JobList /> },
  { id: "msa", label: "MSA", icon: <FaFileContract size={20} />, content: <Msa /> },
  { id: "nda", label: "NDA", icon: <FaFileContract size={20} />, content: <Nda /> },
  { id: "sow", label: "Statement of Work", icon: <FaClipboardList size={20} />, content: <Sow /> },
  { id: "po", label: "Purchase Order", icon: <FaShoppingCart size={20} />, content: <Po /> },
  { id: "ac-manager", label: "A/C Manager", icon: <FaBuilding size={20} />, content: <AcManager /> },
  { id: "marketing", label: "Marketing", icon: <FaBullhorn size={20} />, content: <Marketing /> },
  { id: "it-team", label: "IT Team", icon: <FaLaptopCode size={20} />, content: <ItTeam /> },
  { id: "invoice", label: "Invoice", icon: <FaFileInvoice size={20} />, content: <Invoice /> },
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
            src="/Wizzybox Logo.png"
            alt="Company Logo"
            width={open ? 150 : 40}
            height={50}
            className={`transition-all duration-300 ${!open ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
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