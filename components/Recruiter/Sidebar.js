"use client";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Import section components
import Overview from "@components/Recruiter/content/Overview";
import RequirementList from "@components/Admin/Content/RequirementList";
import CandidateForm from "@components/Recruiter/content/CandidateForm";
import CandidateList from "@components/Recruiter/content/CandidateList";

// Icons
import {
  FaChartPie,
  FaUsers,
  FaFileAlt,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";

// Sidebar sections
const sections = [
  { id: "overview", label: "Overview", icon: <FaChartPie size={20} />, content: <Overview /> },
  { id: "requirement-list", label: "Requirement List", icon: <FaClipboardList size={20} />, content: <RequirementList /> },
  { id: "candidate-form", label: "Candidate Form", icon: <FaFileAlt size={20} />, content: <CandidateForm /> },
  { id: "candidate-list", label: "Candidate List", icon: <FaUsers size={20} />, content: <CandidateList /> },
];

export default function Dashboard({ editContent }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const routeToSectionId = {
    "/recruiter": "overview",
    "/requirement-list": "requirement-list",
    "/candidate-form": "candidate-form",
    "/candidate-list": "candidate-list",
  };

  const activeSection = sections.find((s) => s.id === routeToSectionId[pathname]);

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white h-full p-5 pt-8 transition-all duration-300 flex flex-col border-r border-gray-800 shadow-md ${open ? "w-64" : "w-20"
          } relative overflow-y-auto overflow-x-hidden`}
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

        {/* Nav Links */}
        <Link
          href="/recruiter"
          className={`flex items-center gap-3 p-2 rounded-md text-sm transition-all hover:bg-gray-700 ${pathname === "/recruiter" ? "bg-gray-700" : ""}`}
        >
          <FaChartPie className="w-5 h-5" />
          <span className={`${!open ? "hidden" : "block"}`}>Overview</span>
        </Link>

        <Link
          href="/requirement-list"
          className={`flex items-center gap-3 p-2 rounded-md text-sm transition-all hover:bg-gray-700 ${pathname === "/requirement-list" ? "bg-gray-700" : ""}`}
        >
          <FaClipboardList className="w-5 h-5" />
          <span className={`${!open ? "hidden" : "block"}`}>Requirement List</span>
        </Link>

        <Link
          href="/candidate-form"
          className={`flex items-center gap-3 p-2 rounded-md text-sm transition-all hover:bg-gray-700 ${pathname === "/candidate-form" ? "bg-gray-700" : ""}`}
        >
          <FaFileAlt className="w-5 h-5" />
          <span className={`${!open ? "hidden" : "block"}`}>Candidate Form</span>
        </Link>

        <Link
          href="/candidate-list"
          className={`flex items-center gap-3 p-2 rounded-md text-sm transition-all hover:bg-gray-700 ${pathname === "/candidate-list" ? "bg-gray-700" : ""}`}
        >
          <FaUsers className="w-5 h-5" />
          <span className={`${!open ? "hidden" : "block"}`}>Candidate List</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center p-2 rounded-md cursor-pointer text-sm transition-all bg-red-600 hover:bg-red-700 text-white"
        >
          <div className="w-8 text-center">
            <FaSignOutAlt size={20} />
          </div>
          <span className={`transition-all duration-300 ${!open ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-auto p-6 bg-gray-100">
        {editContent ? (
          <div className="w-full max-w-6xl pt-6">{editContent}</div>
        ) : (
          <div className="w-full max-w-6xl pt-6">{activeSection?.content}</div>
        )}
      </main>
    </div>
  );
}
