
"use client";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";

// Import section components
import Overview from "@components/Admin/Content/Overview";
import BdSales from "@components/Admin/Content/BdSales";
import Recruitment from "@components/Admin/Content/Recruitment";
import Msa from "@components/Admin/Content/Msa";
import Nda from "@components/Admin/Content/Nda";
import Sow from "@components/Admin/Content/Sow";
import Po from "@components/Admin/Content/Po";
import AcManager from "@components/Admin/Content/AcManager";
import Marketing from "@components/Admin/Content/Marketing";
import ItTeam from "@components/Admin/Content/ItTeam";
import Invoice from "@components/Admin/Content/Invoice";
import JobList from "@components/Admin/Content/JobList";
import Adduser from "@components/Admin/Content/AddUser";
import AgreementList from "@components/Admin/Content/AgreementList"; // <-- NEW IMPORT

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
  FaFileAlt // <-- NEW ICON for Agreement List
} from "react-icons/fa";
import { FaUser } from "react-icons/fa";

// Sidebar sections with dynamic content
const sections = [
  { id: "overview", label: "Overview", icon: <FaChartPie size={20} />, content: <Overview /> },
  { id: "add-user", label: "Add User", icon: <FaUser size={20} />, content: <Adduser /> },
  { id: "bd-sales", label: "BD/Sales", icon: <FaHandshake size={20} />, content: <BdSales /> },
  { id: "agreement-list", label: "Agreement List", icon: <FaFileAlt size={20} />, content: <AgreementList /> }, // <-- NEW SECTION
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
  const [selectedSection, setSelectedSection] = useState("overview"); // Default section
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden">
    {/* Sidebar Container */}
    <div
      className={`bg-gray-900 text-white h-full p-5 pt-8 transition-all duration-300 flex flex-col ${
        open ? "w-64" : "w-20"
      } relative`}
    >
    
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
        <ul className="flex flex-col space-y-2">
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
      </div>

      {/* Main Content Area */}
      <main className="flex-1  h-full flex justify-center items-start overflow-auto p-6">
        <div className="w-full max-w-6xl  pt-6 ">
          {sections.find((s) => s.id === selectedSection)?.content}
        </div>
      </main>
    </div>
  );
}
