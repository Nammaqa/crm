"use client";
import { useState, useEffect } from "react";
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
import Invoicelist from "@components/Invoice/Content/invoicelist";
import Expenses from "@components/Invoice/Content/expenses";

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
  { id: "overview",      label: "Overview",       icon: <FaChartPie   size={18} />, content: <Overview /> },
  { id: "customer-list", label: "Customer List",  icon: <FaAddressBook size={18} />, content: <Customerlist /> },
  { id: "customer",      label: "Add Customer",   icon: <FaUserCircle size={18} />, content: <AddCustomerForm /> },
  { id: "new-invoice",   label: "Invoice",        icon: <FaFileInvoice size={18} />, content: <NewInvoice /> },
  { id: "invoice-list",  label: "Invoice List",   icon: <FaFileInvoice size={18} />, content: <Invoicelist /> },
  { id: "expenses",      label: "Expenses",       icon: <FaFileInvoice size={18} />, content: <Expenses /> },
  // { id: "settings",   label: "Settings",       icon: <FaCog        size={18} />, content: <SettingsSection /> },
];

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
export default function InvoiceSidebar() {
  const [selectedSection, setSelectedSection] = useState("overview");
  const [open, setOpen] = useState(true);
  const [screenSize, setScreenSize] = useState('desktop');

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
        setOpen(false); // Auto-close on mobile
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Further reduced sidebar widths
  const getSidebarWidth = () => {
    if (screenSize === 'mobile') {
      return open ? 'w-56' : 'w-0'; // Reduced from w-64
    } else if (screenSize === 'tablet') {
      return open ? 'w-52' : 'w-14'; // Reduced from w-60 and w-16
    } else {
      return open ? 'w-64' : 'w-16'; // Reduced from w-72 and w-20
    }
  };

  // Further reduced content padding when sidebar is open
  const getContentPadding = () => {
    if (screenSize === 'mobile') {
      return 'pl-0';
    } else if (screenSize === 'tablet') {
      return open ? 'pl-2' : 'pl-2'; // Even more reduced - same as closed state
    } else {
      return open ? 'pl-2' : 'pl-2'; // Further reduced from pl-24 to pl-18
    }
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-[#e0e7ef] via-[#f1f5f9] to-[#c7d2fe] overflow-hidden">
      {/* ───────────────  SIDEBAR  ─────────────── */}
      <aside
        className={`
          fixed lg:static z-30 h-full flex flex-col relative
          transition-all duration-500 ease-in-out
          ${getSidebarWidth()}
          ${screenSize === 'mobile' && !open ? '-translate-x-full' : 'translate-x-0'}
          bg-white/60 backdrop-blur-xl shadow-2xl border-r border-[#e0e7ef]
          ${screenSize === 'mobile' ? 'rounded-tr-2xl rounded-br-2xl' : 'rounded-tr-3xl rounded-br-3xl'}
          glass-sidebar overflow-y-auto scrollbar-hide
        `}
        style={{
          boxShadow: "0 8px 32px rgba(31,38,135,0.18)",
          borderRight: "1.5px solid rgba(255,255,255,0.18)",
          maxWidth: screenSize === 'mobile' ? '70vw' : '100%',
        }}
      >
        {/* Header row: logo + toggle button */}
        <div className={`flex items-center ${open ? 'justify-between' : 'justify-center flex-col'} gap-x-1 px-3 mt-4 mb-6 flex-shrink-0`}>
          {/* Logo - switches between full and small */}
          <div className={`flex items-center ${open ? '' : 'mb-3'}`}>
            <Image
              src={open ? "/Wizzybox Logo.png" : "/smalllogo.png"}
              alt="Company Logo"
              width={
                screenSize === 'mobile' 
                  ? (open ? 100 : 28)
                  : screenSize === 'tablet' 
                    ? (open ? 110 : 32) 
                    : (open ? 120 : 36)
              }
              height={
                screenSize === 'mobile' 
                  ? (open ? 35 : 28) 
                  : screenSize === 'tablet' 
                    ? (open ? 38 : 32) 
                    : (open ? 42 : 36)
              }
              className="transition-all duration-300"
              priority
            />
          </div>

          {/* Toggle button – compact design */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            className={`
              p-1.5 rounded-lg
              text-white
              bg-gradient-to-b from-[#2563eb] to-[#38bdf8]
              shadow-lg border border-white/30
              hover:scale-105 transition-transform
              ${!open ? 'w-8 h-8' : ''} 
              ${screenSize === 'mobile' ? 'text-sm' : ''}
            `}
          >
            {open ? (
              <FaTimes size={screenSize === 'mobile' ? 14 : 16} />
            ) : (
              <FaBars size={screenSize === 'mobile' ? 14 : 16} />
            )}
          </button>
        </div>

        {/* Navigation items - more compact */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-1.5">
          <ul className="flex flex-col space-y-0.5 pb-3">
            {sections.map((section) => (
              <li
                key={section.id}
                onClick={() => {
                  setSelectedSection(section.id);
                  if (screenSize === 'mobile') setOpen(false);
                }}
                tabIndex={0}
                aria-current={selectedSection === section.id ? "page" : undefined}
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer font-medium
                  transition-all
                  ${selectedSection === section.id
                    ? "bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white shadow-md"
                    : "hover:bg-[#e0e7ef]/80 text-[#1e293b] hover:text-[#2563eb]"
                  }
                  focus:outline-none focus:ring-2 focus:ring-[#2563eb]
                  ${!open ? 'justify-center' : ''}
                  ${screenSize === 'mobile' ? 'text-xs py-2' : screenSize === 'tablet' ? 'text-sm py-2' : 'text-sm'}
                `}
                title={!open ? section.label : ''}
              >
                <div className={`text-center flex-shrink-0 ${screenSize === 'mobile' ? 'w-5' : 'w-6'}`}>
                  <div className={screenSize === 'mobile' ? 'scale-85' : 'scale-90'}>
                    {section.icon}
                  </div>
                </div>
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

        {/* Logout - compact */}
        <div className={`mb-6 px-3 flex-shrink-0 ${screenSize === 'mobile' ? 'mb-4' : ''}`}>
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className={`
              w-full flex items-center rounded-xl 
              bg-gradient-to-br from-[#2563eb] to-[#38bdf8] text-white 
              shadow-lg hover:scale-105 transition
              ${!open ? 'justify-center px-1.5 py-1.5' : 'justify-center px-3'}
              ${screenSize === 'mobile' ? 'py-1.5 text-xs' : 'py-2.5 text-sm'}
            `}
            title={!open ? 'Logout' : ''}
          >
            <FaSignOutAlt 
              size={screenSize === 'mobile' ? 14 : 16} 
              className={open ? (screenSize === 'mobile' ? "mr-1" : "mr-1.5") : ""} 
            />
            {open && (
              <span className={`font-semibold ${screenSize === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ───────────────  MAIN CONTENT  ─────────────── */}
      <main
        className={`
          flex-1 min-h-screen flex flex-col items-center justify-start overflow-hidden
          transition-all duration-500 ease-in-out
          ${screenSize !== 'mobile' ? getContentPadding() : ''}
        `}
        style={{
          background:
            "linear-gradient(135deg, #e0e7ef 0%, #f1f5f9 60%, #c7d2fe 100%)",
        }}
      >
        <div className={`
          w-full max-w-7xl mx-auto pt-8 h-full overflow-y-auto scrollbar-hide
          ${screenSize === 'mobile' ? 'px-2' : screenSize === 'tablet' ? 'px-3' : 'px-6'}
        `}>
          <div className={`
            rounded-3xl shadow-2xl bg-white/80 backdrop-blur-lg border border-[#e0e7ef] 
            min-h-[80vh] animate-fade-in mb-8
            ${screenSize === 'mobile' ? 'p-3 rounded-2xl' : screenSize === 'tablet' ? 'p-5' : 'p-6'}
          `}>
            {sections.find((s) => s.id === selectedSection)?.content}
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {open && screenSize === 'mobile' && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-30 lg:hidden"
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
        
        /* Responsive breakpoints for better control */
        @media (max-width: 639px) {
          .sidebar-mobile {
            max-width: 70vw !important;
          }
        }
        
        @media (min-width: 640px) and (max-width: 1023px) {
          .sidebar-tablet {
            width: 70% !important;
            max-width: 208px;
          }
        }
      `}</style>
    </div>
  );
}
