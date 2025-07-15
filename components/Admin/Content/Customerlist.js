import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaPlus } from "react-icons/fa";

const mockCustomers = [
  {
    name: "John Doe",
    company: "Acme Corp",
    email: "john.doe@acme.com",
    phone: "+1 555-1234",
    receivables: "1,200.00",
    unusedCredits: "300.00",
  },
  {
    name: "Jane Smith",
    company: "Globex Inc",
    email: "jane.smith@globex.com",
    phone: "+1 555-5678",
    receivables: "2,500.00",
    unusedCredits: "0.00",
  },
  // Add more mock data as needed
];

export default function Customerlist() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState(mockCustomers);
  const router = useRouter();

  // Filter customers based on search input
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-4 rounded-lg shadow">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold">Customer List</h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {/* Add Button */}
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={() => router.push("/admin")}
          >
            <FaPlus />
            Add
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left font-semibold">NAME</th>
              <th className="px-4 py-2 text-left font-semibold">COMPANY NAME</th>
              <th className="px-4 py-2 text-left font-semibold">EMAIL</th>
              <th className="px-4 py-2 text-left font-semibold">WORK PHONE</th>
              <th className="px-4 py-2 text-left font-semibold">RECEIVABLES (BCY)</th>
              <th className="px-4 py-2 text-left font-semibold">UNUSED CREDITS (BCY)</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer, idx) => (
                <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-2">{customer.name}</td>
                  <td className="px-4 py-2">{customer.company}</td>
                  <td className="px-4 py-2">{customer.email}</td>
                  <td className="px-4 py-2">{customer.phone}</td>
                  <td className="px-4 py-2">{customer.receivables}</td>
                  <td className="px-4 py-2">{customer.unusedCredits}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}