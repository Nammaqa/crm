"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Overview() {
  const [userName, setUserName] = useState("Fetching User...");
  const fetchUser = async () => {
    // const token = localStorage.getItem("token");
    // if (!token) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL; // This is only available at build time
const res = await fetch(`${baseUrl}/api/users/me`, { 
        method: "GET",
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });

      const data = await res.json();
      console.log(data)
      if (res.ok && data?.data?.userName) {
        console.log('USER ', data.data.username)
        setUserName("Welcome, " + data.data.userName);
        // setRole(data.user.role);
      } else {
        console.warn("User fetch failed:", data.message);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };
  useEffect(() => {


    fetchUser();
    console.log('useeff')
  }, []);

  const summaryData = [
    { title: "My Open Deals", value: 5, content: "You have 5 ongoing deals in progress." },
    { title: "My Untouched Deals", value: 2, content: "You have 2 deals that haven't been worked on yet." },
    { title: "My Calls Today", value: 8, content: "You've made 8 calls today with potential clients." },
    { title: "My Leads", value: 12, content: "You have 12 Qualified Lead  generated today." },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full max-w-6xl bg-white p-6 m-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/Wizzybox Logo.png"
            alt="CRM Logo"
            width={150}
            height={50}
            className="w-auto max-w-full"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
            {userName.charAt(0).toUpperCase() + userName.slice(1)}

          </h1>
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center"
          >
            <div className="text-lg font-semibold">{item.title}</div>
            <div className="text-3xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Detailed Boxes */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
            <p className="text-base text-gray-600 mt-2">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
