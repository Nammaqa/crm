import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

/**
 * BdTable displays leads in a table with pagination and provides tab navigation.
 * Tab changes are delegated to the parent via onTabChange for correct workflow sync.
 *
 * @param {Object[]} leads - Array of lead objects.
 * @param {Function} onLeadClick - Callback when a lead row is clicked.
 * @param {string} activeTab - The currently active tab.
 * @param {Function} onTabChange - Callback when a tab is changed.
 */
export default function BdTable({ leads = [], onLeadClick, activeTab, onTabChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredLeads = leads.filter((lead) => {
    if (activeTab === "Prospective") return lead.leadType === "prospective" && lead.status === "prospective";
    if (activeTab === "new-lead") return lead.leadType === "new" && lead.status === "newlead";
    if (activeTab === "existing-deal") return lead.leadType === "existing" && lead.status === "deal";
    if (activeTab === "deal") return lead.leadType === "existing" && lead.status === "deal";
    return false;
  });

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const tabs = [
    { key: "Prospective", label: "Prospective" },
    { key: "new-lead", label: "Qualified Lead"},
    { key: "existing-deal", label: "Existing Deal" },
    // { key: "deal", label: "Deal" },
  ];

  return (
    <Card className="p-6 my-12 overflow-hidden">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            onClick={() => {
              if (activeTab !== tab.key) onTabChange(tab.key);
            }}
            variant={activeTab === tab.key ? "default" : "ghost"}
            className="py-2 px-4 capitalize"
            type="button"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Table Data */}
      <div className="border rounded-md">
        {currentLeads.length > 0 ? (
          <>
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">Company</th>
                  <th className="px-4 py-2 border-b text-left">Sales</th>
                  <th className="px-4 py-2 border-b text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onLeadClick(lead)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <td className="px-4 py-2 border-b">{lead.companyName}</td>
                    <td className="px-4 py-2 border-b">{lead.salesName}</td>
                    <td className="px-4 py-2 border-b">{lead.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <Button
                          key={page}
                          onClick={() => goToPage(page)}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="p-4">No leads found.</p>
        )}
      </div>
    </Card>
  );
}
