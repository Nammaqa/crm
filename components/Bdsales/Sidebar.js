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
import AgreementList from "@components/Admin/Content/AgreementList"; // <-- NEW IMPORT
import {
  FaChartPie,
  FaHandshake,
  FaUsers,
  FaFileContract,
  FaClipboardList,
  FaShoppingCart,
  // FaListAlt, // Use this for Agreement List
} from "react-icons/fa";

// Sidebar sections with dynamic content
const sections = [
  { id: "overview", label: "Overview", icon: <FaChartPie size={20} />, content: <Overview /> },
  { id: "bd-sales", label: "BD/Sales", icon: <FaHandshake size={20} />, content: <BdSales /> },
  { id: "recruitment", label: "Requirement", icon: <FaUsers size={20} />, content: <Recruitment /> },
  { id: "msa", label: "MSA & NDA", icon: <FaFileContract size={20} />, content: <MsaNda /> },
  { id: "sow", label: "Statement of Work", icon: <FaClipboardList size={20} />, content: <Sow /> },
  { id: "po", label: "Purchase Order", icon: <FaShoppingCart size={20} />, content: <Po /> },
  // Agreement List is a navigation link, not inline content
  { id: "agreement-list", label: "Agreement List", icon: <FaClipboardList size={20} />, content: <AgreementList /> }, // <-- NEW SECTION
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
    <div className="flex h-screen w-full overflow-hidden">
      {/* Static Sidebar */}
      <div className="bg-gray-900 text-white h-full w-64 p-5 pt-8 flex flex-col relative">
        {/* Logo Section */}
        <div className="flex items-center gap-x-4 mb-6">
          <Image
            src="/Wizzybox Logo.png"
            alt="Company Logo"
            width={150}
            height={50}
            className="transition-all duration-300"
          />
        </div>

        {/* Sidebar Menu Items */}
        <ul className="flex flex-col space-y-2 flex-1">
          {sections.map((section) => (
            <li
              key={section.id}
              className={`flex items-center p-2 rounded-md cursor-pointer text-sm transition-all hover:bg-gray-700 ${selectedSection === section.id && !section.isLink ? "bg-gray-700" : ""}`}
              onClick={() => handleSectionClick(section)}
              tabIndex={0}
            >
              <div className="w-8 text-center">{section.icon}</div>
              <span className="ml-2">{section.label}</span>
            </li>
          ))}
        </ul>

        {/* Logout Button at the Bottom */}
        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-0 w-full flex items-center justify-center gap-2 p-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-all text-sm pl-8 pr-4"
        >
          <FaSignOutAlt size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-h-screen flex-1 flex justify-center items-start p-6 overflow-y-scroll scrollbar-hide">
        <div className="w-full max-w-6xl pt-6 ">
          {/* Only render content for non-link sections */}
          {sections.find((s) => s.id === selectedSection && !s.isLink)?.content}
        </div>
      </main>
    </div>
  );
}