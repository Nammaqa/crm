import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function BdTable({ leads = [], onLeadClick, activeTab, onTabChange, onMoveLead, onUpdatePercentage }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [movingLeadId, setMovingLeadId] = useState(null);
  const itemsPerPage = 5; // Changed from 10 to 5 items per page


  // Helper function to format percentage correctly
  const formatPercentage = (value) => {
    if (!value) return '0%';
    // If value is between 0 and 1, it's stored as decimal (0.75 = 75%)
    if (value > 0 && value < 1) {
      return `${Math.round(value * 100)}%`;
    }
    // Otherwise it's already a whole number (75 = 75%)
    return `${Math.round(value)}%`;
  };


  const handleMove = async (lead) => {
    try {
      setMovingLeadId(lead.id);


      // Validate percentage for moving to  Deal
      if (activeTab === "QualifiedLead" && (!lead.percentage || lead.percentage < 90)) {
        toast.error("Lead must have at least 90% progress to move to  Deal");
        return;
      }


      let newStatus, newLeadType;
      if (activeTab === "Prospective") {
        newStatus = "newlead";
        newLeadType = "new";
      } else if (activeTab === "QualifiedLead") {
        newStatus = "deal";
        newLeadType = "existing";
      }


      await onMoveLead(lead.id, newStatus, newLeadType);
      
    } catch (error) {
      toast.error(`Failed to move lead: ${error.message}`);
    } finally {
      setMovingLeadId(null);
    }
  };


  const filteredLeads = leads.filter((lead) => {
    if (activeTab === "Prospective") {
      return lead.leadType === "prospective" && lead.status === "prospective";
    }
    if (activeTab === "QualifiedLead") {
      return lead.leadType === "new" && lead.status === "newlead";
    }
    if (activeTab === "ExistingDeal") {
      return lead.leadType === "existing" && lead.status === "deal";
    }
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
    { key: "QualifiedLead", label: "Qualified Lead" },
    { key: "ExistingDeal", label: " Deal" },
  ];


  const getNextStageLabel = () => {
    if (activeTab === "Prospective") return "Move to Qualified";
    if (activeTab === "QualifiedLead") return "Move to Deal";
    return null;
  };


  const percentageOptions = [30, 50, 70, 90];


  const handlePercentageChange = async (leadId, newPercentage) => {
    try {
      const response = await fetch(`/api/lead/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percentage: parseInt(newPercentage, 10) }),
      });


      if (!response.ok) {
        throw new Error("Failed to update percentage");
      }


      const updatedLead = await response.json();
      onUpdatePercentage?.(updatedLead);
      toast.success("Percentage updated successfully");
    } catch (error) {
      toast.error(`Failed to update percentage: ${error.message}`);
    }
  };


  return (
    <div className="mt-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            onClick={() => {
              if (activeTab !== tab.key) onTabChange(tab.key);
            }}
            variant={activeTab === tab.key ? "default" : "ghost"}
            className="py-2 px-6 capitalize rounded-t-lg"
            type="button"
          >
            {tab.label}
          </Button>
        ))}
      </div>


      {/* Table Data */}
      {currentLeads.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Company</th>
                  <th className="border p-3 text-left">Company ID</th>
                  <th className="border p-3 text-left">Sales Name</th>
                  <th className="border p-3 text-left">Status</th>
                  {/* Percentage column commented out */}
                  {/* <th className="border p-3 text-left">Percentage</th> */}
                  {activeTab === "QualifiedLead" && (
                    <th className="border p-3 text-left">Update %</th>
                  )}
                  {activeTab !== "ExistingDeal" && (
                    <th className="border p-3 text-center">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="border p-3 cursor-pointer" onClick={() => onLeadClick(lead)}>
                      {lead.companyName}
                    </td>
                    <td className="border p-3 cursor-pointer" onClick={() => onLeadClick(lead)}>
                      {lead.companyID || "-"}
                    </td>
                    <td className="border p-3 cursor-pointer" onClick={() => onLeadClick(lead)}>
                      {lead.salesName}
                    </td>
                    <td className="border p-3 cursor-pointer capitalize" onClick={() => onLeadClick(lead)}>
                      {lead.status}
                    </td>
                    {/* Percentage cell commented out */}
                    {/* <td className="border p-3 cursor-pointer" onClick={() => onLeadClick(lead)}>
                      {formatPercentage(lead.percentage)}
                    </td> */}
                    {activeTab === "QualifiedLead" && (
                      <td className="border p-3">
                        <Select
                          value={String(lead.percentage || "0")}
                          onValueChange={(value) => handlePercentageChange(lead.id, value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Select %" />
                          </SelectTrigger>
                          <SelectContent>
                            {percentageOptions.map((value) => (
                              <SelectItem key={value} value={String(value)}>
                                {value}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    )}
                    {activeTab !== "ExistingDeal" && (
                      <td className="border p-3 text-center">
                        <Button
                          onClick={() => handleMove(lead)}
                          disabled={
                            movingLeadId === lead.id || 
                            (activeTab === "QualifiedLead" && (!lead.percentage || lead.percentage < 90))
                          }
                          size="sm"
                          className="inline-flex items-center gap-1"
                        >
                          {movingLeadId === lead.id ? (
                            "Moving..."
                          ) : (
                            <>
                              {getNextStageLabel()}
                              <ArrowRightIcon className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of{" "}
              {filteredLeads.length} results
            </div>
            
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>


                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <Button
                      key={page}
                      onClick={() => goToPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  );
                })}


                <Button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No leads found for this category.
        </div>
      )}
    </div>
  );
}
