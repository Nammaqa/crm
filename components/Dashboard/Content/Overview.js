"use client";
import Image from "next/image";

export default function Overview() {
  const summaryData = [
    { title: "My Open Deals", value: 5, content: "You have 5 ongoing deals in progress." },
    { title: "My Untouched Deals", value: 2, content: "You have 2 deals that haven't been worked on yet." },
    { title: "My Calls Today", value: 8, content: "You've made 8 calls today with potential clients." },
    { title: "My Leads", value: 12, content: "You have 12 Qualified leads  generated today." },
  ];

  return (
    <div className="min-h-screen  flex flex-col items-center p-6">
      {/* Header: Logo & Welcome Message */}
      <div className="w-full max-w-6xl bg-white p-6 m-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between">
        <div className="logo-container flex flex-col items-center gap-4">
          <Image
            src="/Wizzybox Logo.png"
            alt="CRM Logo"
            width={150}
            height={50}
            className="w-auto max-w-full"
          />
          <h1
            id="welcome-message"
            className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left"
          >
            Welcome, User
          </h1>
        </div>
      </div>
      {/* Summary Boxes - Now at the Top */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className="summary-box bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center"
          >
            <div className="summary-title text-lg font-semibold">{item.title}</div>
            <div className="text-3xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      

      {/* Detailed Information Based on Summary Data */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className="box bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
            <p className="text-base text-gray-600 mt-2">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
