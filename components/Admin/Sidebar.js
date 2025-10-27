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
import AgreementList from "@components/Admin/Content/AgreementList";
import RequirementList from "@components/Admin/Content/RequirementList";
import Customerlist from "@components/Admin/Content/Customerlist";
import NewInvoice from "@components/Admin/Content/NewInvoice";
import InvoiceForm from "@components/Admin/Content/Invoice";

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
  FaAddressBook
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
  { id: "customer-list", label: "Customer List", icon: <FaAddressBook size={20} />, content: <Customerlist /> },
  { id: "customer", label: "Customer", icon: <FaAddressBook size={20} />, content: <InvoiceForm /> },
  { id: "new-invoice", label: "Invoice", icon: <FaFileInvoice size={20} />, content: <NewInvoice /> },
];

export default function Dashboard({ url }) {
  const [selectedSection, setSelectedSection] = useState(url || "overview");
  const [open, setOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar (Left Side) */}
      <aside
        className={`bg-white h-full p-5 pt-8 transition-all duration-300 flex flex-col border-r border-gray-200 shadow-lg ${
          open ? "w-64" : "w-20"
        } relative overflow-y-auto overflow-x-hidden`}
      >
        {/* Toggle Button */}
        <button
          className="absolute top-6 right-[-15px] bg-white text-gray-700 p-2 rounded-full border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-400 focus:outline-none transition-all shadow-md z-10"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-x-4 mb-8">
          <Image
            src="/Wizzybox Logo.png"
            alt="Company Logo"
            width={open ? 150 : 40}
            height={50}
            className={`transition-all duration-300 ${
              !open ? "opacity-0 w-0" : "opacity-100 w-auto"
            }`}
          />
        </div>

        {/* Sidebar Menu Items */}
        <ul className="flex flex-col space-y-1">
          {sections.map((section) => (
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
              <span
                className={`ml-3 transition-all duration-300 whitespace-nowrap ${
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
          className="mt-auto flex items-center p-3 rounded-lg cursor-pointer text-sm transition-all bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300"
        >
          <div className="w-8 text-center flex items-center justify-center">
            <FaSignOutAlt size={20} />
          </div>
          <span
            className={`ml-3 transition-all duration-300 whitespace-nowrap ${
              !open ? "opacity-0 w-0" : "opacity-100 w-auto"
            }`}
          >
            Logout
          </span>
        </button>
      </aside>

      {/* Main Content Area (Right Side) */}
      <main className="flex-1 h-full overflow-auto p-8 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 min-h-[calc(100vh-4rem)]">
            {sections.find((s) => s.id === selectedSection)?.content}
          </div>
        </div>
      </main>
    </div>
  );
}
