"use client";
import { useState } from "react";
import Image from "next/image";
import {
  FaBars,
  FaTimes,
  FaChartPie,
  FaFileInvoice,
  FaSignOutAlt,
  FaAddressBook,
  FaUserCircle,
  FaCog,
} from "react-icons/fa";

import Overview        from "@components/Admin/Content/Overview";
import Customerlist    from "@components/Admin/Content/Customerlist";
import NewInvoice      from "@components/Admin/Content/NewInvoice";
import AddCustomerForm from "@components/Admin/Content/Invoice";

// ──────────────────────────────────────────────────────────────
// Dummy Settings section (kept for reference)
// ──────────────────────────────────────────────────────────────
function SettingsSection() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <FaCog size={48} className="text-[#2563eb] mb-4 animate-spin-slow" />
      <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Settings</h2>
      <p className="text-[#64748b]">
        Customize your preferences, manage your account, and configure system options here.
      </p>
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 2.5s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sidebar sections
// ──────────────────────────────────────────────────────────────
const sections = [
  { id: "overview",      label: "Overview",       icon: <FaChartPie   size={20} />, content: <Overview /> },
  { id: "customer-list", label: "Customer List",  icon: <FaAddressBook size={20} />, content: <Customerlist /> },
  { id: "customer",      label: "Add Customer",   icon: <FaUserCircle size={20} />, content: <AddCustomerForm /> },
  { id: "new-invoice",   label: "Invoice",        icon: <FaFileInvoice size={20} />, content: <NewInvoice /> },
  // { id: "settings",   label: "Settings",       icon: <FaCog        size={20} />, content: <SettingsSection /> },
];

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
export default function InvoiceSidebar() {
  const [selectedSection, setSelectedSection] = useState("overview");
  const [open, setOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-[#e0e7ef] via-[#f1f5f9] to-[#c7d2fe] overflow-hidden">
      {/* ───────────────  SIDEBAR  ─────────────── */}
      <aside
        className={`
          fixed lg:static z-30 h-full flex flex-col relative
          transition-all duration-500
          ${open ? "w-72" : "w-20"}
          bg-white/60 backdrop-blur-xl shadow-2xl border-r border-[#e0e7ef]
          rounded-tr-3xl rounded-br-3xl
          glass-sidebar overflow-y-auto scrollbar-hide
        `}
        style={{
          boxShadow: "0 8px 32px rgba(31,38,135,0.18)",
          borderRight: "1.5px solid rgba(255,255,255,0.18)",
        }}
      >
        {/* Header row: logo + toggle button */}
        <div className={`flex items-center ${open ? 'justify-between' : 'justify-center flex-col'} gap-x-2 px-4 mt-6 mb-8 flex-shrink-0`}>
          {/* Logo - switches between full and small */}
          <div className={`flex items-center ${open ? '' : 'mb-4'}`}>
            <Image
              src={open ? "/Wizzybox Logo.png" : "/smalllogo.png"}
              alt="Company Logo"
              width={open ? 140 : 40}
              height={open ? 50 : 40}
              className="transition-all duration-300"
              priority
            />
          </div>

          {/* Toggle button – now INSIDE the sidebar */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            className={`
              p-2 rounded-lg
              text-white
              bg-gradient-to-b from-[#2563eb] to-[#38bdf8]
              shadow-lg border border-white/30
              hover:scale-105 transition-transform
              ${!open ? 'w-10 h-10' : ''}
            `}
          >
            {open ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-2">
          <ul className="flex flex-col space-y-1 pb-4">
            {sections.map((section) => (
              <li
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                tabIndex={0}
                aria-current={selectedSection === section.id ? "page" : undefined}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-base font-medium
                  transition-all
                  ${selectedSection === section.id
                    ? "bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white shadow-md"
                    : "hover:bg-[#e0e7ef]/80 text-[#1e293b] hover:text-[#2563eb]"
                  }
                  focus:outline-none focus:ring-2 focus:ring-[#2563eb]
                  ${!open ? 'justify-center' : ''}
                `}
                title={!open ? section.label : ''}
              >
                <div className="w-8 text-center flex-shrink-0">{section.icon}</div>
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    open ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden pointer-events-none"
                  }`}
                >
                  {section.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout */}
        <div className="mb-8 px-4 flex-shrink-0">
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className={`
              w-full flex items-center py-3 rounded-xl 
              bg-gradient-to-br from-[#2563eb] to-[#38bdf8] text-white 
              shadow-lg hover:scale-105 transition
              ${!open ? 'justify-center px-2' : 'justify-center px-4'}
            `}
            title={!open ? 'Logout' : ''}
          >
            <FaSignOutAlt size={20} className={open ? "mr-2" : ""} />
            {open && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ───────────────  MAIN CONTENT  ─────────────── */}
      <main
        className="flex-1 min-h-screen flex flex-col items-center justify-start overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #e0e7ef 0%, #f1f5f9 60%, #c7d2fe 100%)",
        }}
      >
        <div className="w-full max-w-7xl mx-auto pt-10 px-4 sm:px-8 h-full overflow-y-auto scrollbar-hide">
          <div className="rounded-3xl shadow-2xl bg-white/80 backdrop-blur-lg border border-[#e0e7ef] p-8 min-h-[80vh] animate-fade-in mb-10">
            {sections.find((s) => s.id === selectedSection)?.content}
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Global styles */}
      <style jsx global>{`
        .glass-sidebar {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(18px);
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);  }
        }
        /* hide native scrollbars but keep scrollability */
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE & Edge */
          scrollbar-width: none;    /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; } /* Chrome */
        html, body { overflow: hidden; }
      `}</style>
    </div>
  );
}
