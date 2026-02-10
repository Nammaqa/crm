"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import BdTable from "./BD/BdTable";
import ProspectiveLeadForm from "./BD/ProspectiveLeadForm";
import QualifiedLeadForm from "./BD/QualifiedLeadForm";
import ExistingDealForm from "./BD/ExistingDealForm";
import SearchFilters from "./BD/SearchFilters";

export default function BdSales({ isSidebarOpen }) {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("Prospective");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [salesName, setSalesName] = useState("");
  
  // Filter states
  const [filters, setFilters] = useState({
    companyName: "",
    salesOwner: "",
    status: "",
    industry: "",
    dateFrom: "",
    dateTo: "",
  });

  const [formData, setFormData] = useState({
    id: "",
    salesName: "",
    leadType: "prospective",
    status: "prospective",
    companyName: "",
    companysize: "",
    companyID: "",
    companyType: "",
    technology: "",
    technologyOther: "",
    industry: "",
    industryOther: "",
    businessType: "",
    numberOfEmployees: "",
    percentage: "",
    remarks: "",
    spocs: [
      {
        id: 1,
        name: "",
        email: "",
        contact: "",
        altContact: "",
        designation: "",
        location: "",
      },
    ],
    dealType: "",
    replacementReason: "",
    replacementToDate: "",
    replacementRequestDate: "",
    employeeName: "",
    companySelect: "",
    companyNameGST: "",
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;
        const userRes = await fetch(`${baseUrl}/api/users/me`, {
          method: "GET",
          credentials: "include",
        });
        const userData = await userRes.json();

        if (!userRes.ok) {
          throw new Error(userData.message || "Failed to fetch user data");
        }

        const loggedInSalesName = userData?.data?.userName || userData?.userName;
        if (!loggedInSalesName) {
          throw new Error("Failed to fetch user name");
        }

        setSalesName(loggedInSalesName);
        setFormData((prev) => ({
          ...prev,
          salesName: loggedInSalesName,
        }));

        const leadRes = await fetch("/api/lead");
        const leadData = await leadRes.json();

        if (!leadRes.ok) {
          console.error("Failed to fetch leads:", leadData.error);
          return;
        }

        const filteredLeads = leadData.filter(
          (lead) => lead.salesName?.toLowerCase() === loggedInSalesName.toLowerCase()
        );
        setLeads(filteredLeads);
        setFilteredLeads(filteredLeads);
      } catch (err) {
        console.error("Initialization error:", err);
        toast.error("Failed to load initial data");
      }
    };

    fetchInitialData();
  }, []);

  // Apply filters whenever filters or leads change
  useEffect(() => {
    applyFilters();
  }, [filters, leads]);

  const applyFilters = () => {
    let filtered = [...leads];

    // Company Name filter
    if (filters.companyName) {
      filtered = filtered.filter((lead) =>
        lead.companyName?.toLowerCase().includes(filters.companyName.toLowerCase())
      );
    }

    // Sales Owner filter
    if (filters.salesOwner) {
      filtered = filtered.filter((lead) =>
        lead.salesName?.toLowerCase().includes(filters.salesOwner.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }

    // Industry filter
    if (filters.industry) {
      filtered = filtered.filter((lead) => lead.industry === filters.industry);
    }

    // Date Range filter
    if (filters.dateFrom) {
      filtered = filtered.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        const fromDate = new Date(filters.dateFrom);
        return leadDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        return leadDate <= toDate;
      });
    }

    setFilteredLeads(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      companyName: "",
      salesOwner: "",
      status: "",
      industry: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  // Function to clear form data
  const clearFormData = () => {
    setFormData({
      id: "",
      salesName: salesName,
      leadType: activeTab === "Prospective" ? "prospective" : activeTab === "QualifiedLead" ? "new" : "existing",
      status: activeTab === "Prospective" ? "prospective" : activeTab === "QualifiedLead" ? "newlead" : "deal",
      companyName: "",
      companysize: "",
      companyID: "",
      companyType: "",
      technology: "",
      technologyOther: "",
      industry: "",
      industryOther: "",
      businessType: "",
      numberOfEmployees: "",
      percentage: "",
      remarks: "",
      spocs: [
        {
          id: 1,
          name: "",
          email: "",
          contact: "",
          altContact: "",
          designation: "",
          location: "",
        },
      ],
      dealType: "",
      replacementReason: "",
      replacementToDate: "",
      replacementRequestDate: "",
      employeeName: "",
      companySelect: "",
      companyNameGST: "",
    });
    setIsEditMode(false);
    setSelectedLead(null);
  };

  // Handle lead click from table
  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setIsEditMode(true);

    setFormData({
      id: lead.id || "",
      salesName: lead.salesName || "",
      leadType: lead.leadType || "prospective",
      status: lead.status || "prospective",
      companyName: lead.companyName || "",
      companysize: lead.companysize || "",
      companyID: lead.companyID || "",
      companyType: lead.companyType || "",
      technology: lead.technology || "",
      technologyOther: lead.technologyOther || "",
      industry: lead.industry || "",
      industryOther: lead.industryOther || "",
      businessType: lead.businessType || "",
      numberOfEmployees: lead.numberOfEmployees || "",
      percentage: lead.percentage || "",
      remarks: lead.remarks || "",
      spocs:
        Array.isArray(lead.spocs) && lead.spocs.length > 0
          ? lead.spocs.map((spoc, idx) => ({
              id: spoc.id ?? idx + 1,
              name: spoc.name || "",
              email: spoc.email || "",
              contact: spoc.contact || "",
              altContact: spoc.altContact || "",
              designation: spoc.designation || "",
              location: spoc.location || "",
            }))
          : [
              {
                id: 1,
                name: "",
                email: "",
                contact: "",
                altContact: "",
                designation: "",
                location: "",
              },
            ],
      dealType: lead.dealType || "",
      replacementReason: lead.replacementReason || "",
      replacementToDate: lead.replacementToDate
        ? lead.replacementToDate.slice(0, 10)
        : "",
      replacementRequestDate: lead.replacementRequestDate
        ? lead.replacementRequestDate.slice(0, 10)
        : "",
      employeeName: Array.isArray(lead.employeeName) 
        ? lead.employeeName.join(", ") 
        : lead.employeeName || "",
      companySelect: String(lead.id || ""),
      companyNameGST: lead.companyNameGST || lead.companyName || "",
    });

    // Switch to appropriate tab
    if (lead.leadType === "prospective") setActiveTab("Prospective");
    if (lead.leadType === "new") setActiveTab("QualifiedLead");
    if (lead.leadType === "existing") setActiveTab("ExistingDeal");
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSelectedLead(null);
    setIsEditMode(false);

    setFormData((prev) => ({
      ...prev,
      id: "",
      leadType:
        tab === "Prospective"
          ? "prospective"
          : tab === "QualifiedLead"
          ? "new"
          : "existing",
      status:
        tab === "Prospective"
          ? "prospective"
          : tab === "QualifiedLead"
          ? "newlead"
          : "deal",
      companyName: "",
      companysize: "",
      companyID: "",
      companyType: "",
      technology: "",
      technologyOther: "",
      industry: "",
      industryOther: "",
      businessType: "",
      numberOfEmployees: "",
      percentage: "",
      remarks: "",
      spocs: [
        {
          id: 1,
          name: "",
          email: "",
          contact: "",
          altContact: "",
          designation: "",
          location: "",
        },
      ],
      dealType: "",
      replacementReason: "",
      replacementToDate: "",
      replacementRequestDate: "",
      employeeName: "",
      companySelect: "",
      companyNameGST: "",
    }));
  };

  // Submit Prospective Lead
  const handleSubmitProspective = async (validateOnly = false) => {
    const token = localStorage.getItem("token");

    const payload = {
      salesName: formData.salesName,
      leadType: "prospective",
      status: "prospective",
      companyName: formData.companyName,
      companysize: formData.companysize,
      companyID: formData.companyID,
      companyType: formData.companyType,
      technology: formData.technology,
      technologyOther: formData.technologyOther || null,
      industry: formData.industry,
      industryOther: formData.industryOther || null,
      businessType: formData.businessType,
      numberOfEmployees: parseInt(formData.numberOfEmployees, 10) || 0,
      percentage: parseInt(formData.percentage, 10) || 0,
      remarks: formData.remarks || null,
      spocs: formData.spocs.map((spoc) => ({
        name: spoc.name,
        email: spoc.email,
        contact: spoc.contact,
        altContact: spoc.altContact || null,
        designation: spoc.designation,
        location: spoc.location,
      })),
    };

    if (validateOnly) return true;

    try {
      const method = isEditMode && formData.id ? "PUT" : "POST";
      const endpoint = isEditMode && formData.id ? `/api/lead/${formData.id}` : "/api/lead";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          isEditMode ? "Prospective Lead updated successfully!" : "Prospective Lead saved successfully!"
        );

        setLeads((prev) => {
          const index = prev.findIndex((l) => l.id === data.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = data;
            return updated;
          }
          return [...prev, data];
        });

        setFormData((prev) => ({ ...prev, id: data.id }));
        setIsEditMode(true);
        
        // Clear form after successful submission
        setTimeout(() => {
          clearFormData();
        }, 500);

        return true;
      } else {
        toast.error(`Failed to save: ${data.error}`);
        return false;
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`);
      return false;
    }
  };

  // Move Prospective to Qualified Lead
  const handleMoveToQualifiedLead = async () => {
    if (!formData.id) {
      toast.error("Please save the Prospective Lead first.");
      return;
    }

    try {
      const response = await fetch(`/api/lead/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadType: "new", status: "newlead" }),
      });

      const updatedLead = await response.json();

      if (response.ok) {
        toast.success("Moved to Qualified Lead!");
        setFormData((prev) => ({
          ...prev,
          leadType: "new",
          status: "newlead",
        }));
        setLeads((prev) =>
          prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
        );
        setActiveTab("QualifiedLead");
      } else {
        toast.error(`Error: ${updatedLead.error}`);
      }
    } catch (err) {
      toast.error("Error moving to Qualified Lead");
    }
  };

  // Submit Qualified Lead and Move to Deal
  const handleMoveToExistingDeal = async () => {
    if (!formData.id) {
      toast.error("Please ensure the lead is saved first.");
      return;
    }

    const percentageValue = parseInt(formData.percentage, 10);
    if (isNaN(percentageValue) || percentageValue < 90) {
      toast.error("Percentage must be at least 90% to move to Deal.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const updatePayload = {
        salesName: formData.salesName,
        companyName: formData.companyName,
        companysize: formData.companysize,
        companyID: formData.companyID,
        companyType: formData.companyType,
        technology: formData.technology,
        technologyOther: formData.technologyOther || null,
        industry: formData.industry,
        industryOther: formData.industryOther || null,
        businessType: formData.businessType,
        numberOfEmployees: parseInt(formData.numberOfEmployees, 10) || 0,
        percentage: percentageValue,
        remarks: formData.remarks || null,
        dealType: formData.dealType || null,
        replacementReason: formData.replacementReason || null,
        replacementToDate: formData.replacementToDate || null,
        replacementRequestDate: formData.replacementRequestDate || null,
        employeeName: formData.employeeName
          ? [formData.employeeName]
          : [],
        companySelect: formData.companySelect || null,
        companyNameGST: formData.companyNameGST || null,
        spocs: formData.spocs.map((spoc) => ({
          name: spoc.name,
          email: spoc.email,
          contact: spoc.contact,
          altContact: spoc.altContact || null,
          designation: spoc.designation,
          location: spoc.location,
        })),
      };

      const updateRes = await fetch(`/api/lead/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updatePayload),
      });

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(updateData.error || "Failed to update lead");
      }

      const response = await fetch(`/api/lead/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadType: "existing", status: "deal" }),
      });

      const updatedLead = await response.json();

      if (response.ok) {
        toast.success("Moved to Deal!");
        setFormData((prev) => ({
          ...prev,
          leadType: "existing",
          status: "deal",
        }));
        setLeads((prev) =>
          prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
        );
        setActiveTab("ExistingDeal");
      } else {
        toast.error(`Error: ${updatedLead.error}`);
      }
    } catch (err) {
      toast.error(`Error moving to Deal: ${err.message}`);
    }
  };

  // Move Lead (Generic function for moving leads between stages)
  const handleMoveLead = async (leadId, newStatus, newLeadType) => {
    try {
      const response = await fetch(`/api/lead/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          leadType: newLeadType 
        }),
      });

      const updatedLead = await response.json();

      if (response.ok) {
        // Update the leads state with the new lead data
        setLeads(prev => prev.map(lead => 
          lead.id === updatedLead.id ? updatedLead : lead
        ));

        // Show success message
        toast.success(`Lead moved to ${newStatus === 'newlead' ? 'Qualified Lead' : 'Existing Deal'} successfully!`);

        // Switch to the appropriate tab
        if (newStatus === 'newlead') {
          setActiveTab('QualifiedLead');
        } else if (newStatus === 'deal') {
          setActiveTab('ExistingDeal');
        }
      } else {
        throw new Error(updatedLead.error || 'Failed to move lead');
      }
    } catch (error) {
      toast.error(`Failed to move lead: ${error.message}`);
      throw error;
    }
  };

  const handleUpdatePercentage = (updatedLead) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
    );
    setFilteredLeads((prev) =>
      prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
    );
  };

  // Add this function after handleUpdatePercentage
  const handleQualifiedLeadSaveSuccess = (updatedLead) => {
    // Update leads state with the saved data
    setLeads((prev) => {
      const index = prev.findIndex((l) => l.id === updatedLead.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = updatedLead;
        return updated;
      }
      return [...prev, updatedLead];
    });
    
    toast.success("Lead saved and table updated!");
  };

  return (
    <div className="transition-all duration-300 min-h-screen w-full m-0 p-0">
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex justify-between items-center w-full py-2">
            {/* Title Section */}
            <div className="flex flex-col space-y-1">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Business Development & Sales
              </CardTitle>
              <p className="text-sm text-gray-500 font-medium">
                Lead Management Dashboard
              </p>
            </div>

            {/* Sales Owner Badge */}
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Lead Owner
                </span>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-base font-semibold text-gray-800">
                      {salesName || "Loading..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Search & Filters - Now at the top */}
          <div className="w-full mb-6">
            <SearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Table with full width - Now positioned at the top */}
          <div className="w-full mb-6">
            <BdTable
              leads={filteredLeads}
              onLeadClick={handleLeadClick}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onMoveLead={handleMoveLead}
              onUpdatePercentage={handleUpdatePercentage}
            />
          </div>

          {/* Forms with full width - Now positioned below the table */}
          <div className="w-full">
            {activeTab === "Prospective" && (
              <ProspectiveLeadForm
                formData={formData}
                setFormData={setFormData}
                isEditMode={isEditMode}
                handleSubmit={handleSubmitProspective}
                handleMoveToQualifiedLead={handleMoveToQualifiedLead}
              />
            )}

            {activeTab === "QualifiedLead" && (
              <QualifiedLeadForm
                formData={formData}
                setFormData={setFormData}
                isEditMode={isEditMode}
                leads={leads}
                handleMoveToExistingDeal={handleMoveToExistingDeal}
                onSaveSuccess={handleQualifiedLeadSaveSuccess}
                onClearForm={clearFormData}
              />
            )}

            {activeTab === "ExistingDeal" && (
              <ExistingDealForm
                formData={formData}
                setFormData={setFormData}
                isEditMode={isEditMode}
                leads={leads}
                onClearForm={clearFormData}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
