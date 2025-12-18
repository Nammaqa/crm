"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

// Import section components
import Overview from "@components/ACmanager/content/Overview";
import RequirementList from "@components/Admin/Content/RequirementList";
import CandidateForm from "@components/ACmanager/content/CandidateForm";
import CandidateList from "@components/Recruiter/content/CandidateList";
import ShortList from "@components/Recruiter/content/ShortList";
import RejectedList from "@components/Recruiter/content/RejectedList";
import Acmanager from "@components/ACmanager/content/Acmanager";

import {
  FaChartPie,
  FaSignOutAlt,
  FaUsers,
  FaListAlt,
  FaFileAlt,
  FaLongArrowAltLeft,
} from "react-icons/fa";

// Sidebar sections with dynamic content
const sections = [
  { id: "overview", label: "Overview", icon: <FaChartPie size={20} />, content: <Overview /> },
  { id: "requirement-list", label: "Requirement List", icon: <FaListAlt size={20} />, content: <RequirementList /> },
  { id: "acmanager", label: "Pending List", icon: <FaUsers size={20} />, content: <Acmanager /> },
  { id: "candidate-form", label: "Candidate Form", icon: <FaFileAlt size={20} />, content: <CandidateForm /> },
  { id: "candidate-list", label: "Candidate List", icon: <FaUsers size={20} />, content: <CandidateList /> },
  { id: "short-list", label: "Shortlisted", icon: <FaListAlt size={20} />, content: <ShortList /> },
  { id: "rejected-list", label: "Rejected List", icon: <FaListAlt size={20} />, content: <RejectedList /> },
];

export default function Dashboard({ editContent }) {
  const [selectedSection, setSelectedSection] = useState("overview");
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
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Static Sidebar – same style as BD sidebar */}
      <div className="bg-white h-full w-64 flex flex-col border-r border-gray-200 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo Section (match BD sizing) */}
          <div className="flex items-center gap-x-4 mb-6 p-5 pt-8 border-b border-gray-100">
            <Image
              src="/Wizzybox-logo.png"
              alt="Company Logo"
              width={220}
              height={70}
              unoptimized
              priority
              className="transition-all duration-300 max-w-full"
            />
          </div>

          {/* Sidebar Menu Items */}
          <div className="flex-1 px-5 overflow-y-auto">
            <ul className="flex flex-col space-y-1">
              {editContent ? (
                <li
                  key="back"
                  className="flex items-center p-3 rounded-lg cursor-pointer text-sm transition-all bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium shadow-sm"
                  onClick={() => {
                    router.replace("/ACmanager/?replace=candidate-list");
                  }}
                  tabIndex={0}
                >
                  <div className="w-8 text-center flex items-center justify-center">
                    <FaLongArrowAltLeft size={20} />
                  </div>
                  <span className="ml-3 whitespace-nowrap">BACK</span>
                </li>
              ) : (
                sections.map((section) => (
                  <li
                    key={section.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer text-sm transition-all ${
                      selectedSection === section.id
                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                    onClick={() => setSelectedSection(section.id)}
                    tabIndex={0}
                  >
                    <div className="w-8 text-center flex items-center justify-center">
                      {section.icon}
                    </div>
                    <span className="ml-3 whitespace-nowrap">
                      {section.label}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Logout Button at the Bottom */}
          <div className="p-5 pt-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all text-sm border border-red-200 hover:border-red-300 font-medium"
            >
              <FaSignOutAlt size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area – same shell as BD */}
      <main className="max-h-screen flex-1 flex justify-center items-start p-8 overflow-y-auto bg-gray-50">
        <div className="w-full max-w-7xl">
          <div className="bg-white rounded-xl shadow-sm p-6 min-h-[calc(100vh-4rem)]">
            {editContent
              ? editContent
              : sections.find((s) => s.id === selectedSection)?.content}
          </div>
        </div>
      </main>
    </div>
  );
}
