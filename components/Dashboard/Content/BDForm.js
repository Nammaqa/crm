"use client";
import { Button } from "@/components/ui/button";

export default function BDForm() {
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">BD/Sales Details</h2>
      <form className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Sales Name:</label>
          <input
            type="text"
            placeholder="Enter sales name"
            className="border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Lead:</label>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">Select</option>
            <option value="new">Add Qualified Lead</option>
            <option value="existing">Add Existing Lead</option>
          </select>
        </div>

        <Button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition">
          Submit
        </Button>
      </form>
    </div>
  );
}
