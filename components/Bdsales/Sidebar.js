"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";

// Import section components
import Overview from "@components/Bdsales/Content/Overview";
import BdSales from "@components/Bdsales/Content/BdSales";
import Recruitment from "@components/Bdsales/Content/Recruitment";
import MsaNda from '@/components/Bdsales/Content/MsaNda';
import Sow from "@components/Bdsales/Content/Sow";
import Po from "@components/Bdsales/Content/Po";
import AgreementList from "@components/Admin/Content/AgreementList";
import RequirementList from "@components/Admin/Content/RequirementList";
import Shorlisted from "@components/Bdsales/Content/Shorlisted";
import Reminder from "@components/Bdsales/Content/Reminder";
import {
  FaChartPie,
  FaHandshake,
  FaUsers,
  FaFileContract,
  FaClipboardList,
  FaShoppingCart,
  FaListAlt,
  FaBell,
} from "react-icons/fa";

// Sidebar sections with dynamic content
const sections = [
  { id: "overview", label: "Overview", icon: <FaChartPie size={20} />, content: <Overview /> },
  { id: "bd-sales", label: "BD/Sales", icon: <FaHandshake size={20} />, content: <BdSales /> },
  { id: "recruitment", label: "Requirement", icon: <FaUsers size={20} />, content: <Recruitment /> },
  { id: "msa", label: "MSA & NDA", icon: <FaFileContract size={20} />, content: <MsaNda /> },
  { id: "sow", label: "Statement of Work", icon: <FaClipboardList size={20} />, content: <Sow /> },
  { id: "po", label: "Purchase Order", icon: <FaShoppingCart size={20} />, content: <Po /> },
  { id: "requirement-list", label: "Requirement List", icon: <FaListAlt size={20} />, content: <RequirementList /> },
  { id: "agreement-list", label: "Agreement List", icon: <FaClipboardList size={20} />, content: <AgreementList /> },
  { id: "shorlisted", label: "Shorlisted", icon: <FaUsers size={20} />, content: <Shorlisted /> },
  { id: "reminder", label: "Reminder", icon: <FaBell size={20} />, content: <Reminder /> },
];

export default function Bdsles() {
  const [selectedSection, setSelectedSection] = useState("overview");
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

  const handleSectionClick = (section) => {
    if (section.isLink && section.href) {
      router.push(section.href);
    } else {
      setSelectedSection(section.id);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Static Sidebar */}
      <div className="bg-white h-full w-64 flex flex-col border-r border-gray-200 shadow-lg">
        {/* Sidebar content */}
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-x-4 mb-6 p-5 pt-8 border-b border-gray-100">
            <Image
              src="/Wizzybox Logo.png"
              alt="Company Logo"
              width={150}
              height={50}
              className="transition-all duration-300"
            />
          </div>

          {/* Menu Items container */}
          <div className="flex-1 px-5 overflow-y-auto">
            <ul className="flex flex-col space-y-1">
              {sections.map((section) => (
                <li
                  key={section.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer text-sm transition-all ${
                    selectedSection === section.id && !section.isLink
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                  onClick={() => handleSectionClick(section)}
                  tabIndex={0}
                >
                  <div className="w-8 text-center flex items-center justify-center">
                    {section.icon}
                  </div>
                  <span className="ml-3 whitespace-nowrap">{section.label}</span>
                </li>
              ))}
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

      {/* Main Content Area */}
      <main className="max-h-screen flex-1 flex justify-center items-start p-8 overflow-y-auto bg-gray-50">
        <div className="w-full max-w-7xl">
          <div className="bg-white rounded-xl shadow-sm p-6 min-h-[calc(100vh-4rem)]">
            {/* Render content for selected section */}
            {sections.find((s) => s.id === selectedSection && !s.isLink)?.content}
          </div>
        </div>
      </main>
    </div>
  );
}
