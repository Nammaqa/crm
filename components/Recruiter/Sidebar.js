"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";

// Import section components
import Overview from "@/components/Recruiter/content/Overviewj";
import RequirementList from "@components/Admin/Content/RequirementList";
import CandidateForm from "@components/Recruiter/content/CandidateForm";
import CandidateList from "@components/Recruiter/content/CandidateList";
import ShortList from "@components/Recruiter/content/ShortList";
import RejectedList from "@components/Recruiter/content/RejectedList";
import Inventory from "@components/Recruiter/content/Inventory";

// Import icons
import {
  FaChartPie,
  FaSignOutAlt,
  FaUsers,
  FaListAlt,
  FaFileAlt,
  FaLongArrowAltLeft
} from "react-icons/fa";
import { LuFileBox } from "react-icons/lu";

// Sidebar sections with dynamic content
const sections = [
  { id: "overview", label: "Overview", icon: <FaChartPie size={20} />, content: <Overview /> },
  { id: "requirement-list", label: "Requirement List", icon: <FaListAlt size={20} />, content: <RequirementList /> },
  { id: "candidate-form", label: "Candidate Form", icon: <FaFileAlt size={20} />, content: <CandidateForm /> },
  { id: "candidate-list", label: "Candidate List", icon: <FaUsers size={20} />, content: <CandidateList /> },
  { id: "short-list", label: "ShortListed List", icon: <FaListAlt size={20} />, content: <ShortList /> },
  { id: "rejected-list", label: "Rejected List", icon: <FaListAlt size={20} />, content: <RejectedList /> },
  { id: "Inventory", label: "Inventory Management", icon: <LuFileBox size={20} />, content: <Inventory /> }
];

export default function Dashboard({ editContent }) {
  const [selectedSection, setSelectedSection] = useState("overview");
  const [open, setOpen] = useState(true);
  const searchParams = useSearchParams();
  const replaceValue = searchParams.get("replace");
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    if (replaceValue) {
      setSelectedSection(replaceValue);
    }
  }, [replaceValue]);

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar (Left Side) */}
      <aside
        className={`bg-gray-900 text-white h-full p-5 pt-8 transition-all duration-300 flex flex-col border-r border-gray-800 shadow-md ${
          open ? "w-64" : "w-20"
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


        {/* Sidebar Menu Items */}
        <ul className="flex flex-col space-y-2">
          {editContent ? (
            <li
              key={1}
              className="flex items-center p-2 rounded-md cursor-pointer text-sm transition-all hover:bg-gray-700 bg-gray-700"
              onClick={() => {
                router.replace("/recruiter/?replace=candidate-list");
              }}
              tabIndex={0}
            >
              <div className="w-8 text-center">
                <FaLongArrowAltLeft size={20} />
              </div>
              <span
                className={`transition-all duration-300 ${!open ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
              >
                BACK
              </span>
            </li>
          ) : (
            sections.map((section) => (
              <li
                key={section.id}
                className={`flex items-center p-2 rounded-md cursor-pointer text-sm transition-all hover:bg-gray-700 ${
                  selectedSection === section.id ? "bg-gray-700" : ""
                }`}
                onClick={() => {
                  setSelectedSection(section.id);
                }}
                tabIndex={0}
              >
                <div className="w-8 text-center">{section.icon}</div>
                <span
                  className={`transition-all duration-300 ${!open ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
                >
                  {section.label}
                </span>
              </li>
            ))
          )}
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
            className={`transition-all duration-300 ${!open ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
          >
            Logout
          </span>
        </button>
      </aside>

      {/* Main Content Area (Right Side) */}
      <main className="flex-1 h-full overflow-auto p-6 bg-gray-100">
        {editContent ? (
          <div className="w-full max-w-6xl pt-6">{editContent}</div>
        ) : (
          <div className="w-full max-w-6xl pt-6">
            {sections.find((s) => s.id === selectedSection)?.content}
          </div>
        )}
      </main>
    </div>
  );
}