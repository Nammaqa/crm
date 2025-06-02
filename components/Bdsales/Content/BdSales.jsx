import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import BdTable from "./BD/BdTable";
import LeadTypeSelector from "./BD/LeadTypeSelector";
import ProspectiveLeadForm from "./BD/ProspectiveLeadForm";
import NewLeadForm from "./BD/NewLeadForm";
import ExistingLeadForm from "./BD/ExistingLeadForm";
import { toast } from "sonner";

export default function BdSales({ isSidebarOpen }) {
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("Prospective");
  const [formData, setFormData] = useState({
    id: "",
    salesName: "",
    leadType: "prospective",
    dealType: "",
    companyName: "",
    companysize: "",
    companyID: "",
    numEmployees: "",
    percentage: "",
    remarks: "",
    industry: "",
    industryOther: "",
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
    existingLeadDetails: {
      employeeID: "",
      employeeName: "",
      replacementReason: "",
      replacementToDate: "",
      replacementRequestDate: "",
      companySelect: "",
      companyNameGST: "",
    },
    status: "prospective",
  });

  // Fetch initial data
  useEffect(() => {
  const fetchInitialData = async () => {
    try {
      // Fetch logged-in user
      const userRes = await fetch("/api/users/me", { method: "GET" });
      const userData = await userRes.json();

      if (!userRes.ok || !userData?.data?.userName) {
        throw new Error("Failed to fetch user data");
      }

      const loggedInSalesName = userData.data.userName;
      setFormData((prev) => ({ ...prev, salesName: loggedInSalesName }));

      // Fetch all leads
      const leadRes = await fetch("/api/lead");
      const leadData = await leadRes.json();

      if (!leadRes.ok) {
        console.error("Failed to fetch leads:", leadData.error);
        return;
      }

      // ✅ Filter only those leads where salesName === loggedInSalesName
      const filteredLeads = leadData.filter(
        (lead) => lead.salesName?.toLowerCase() === loggedInSalesName.toLowerCase()
      );

      setLeads(filteredLeads);
    } catch (err) {
      console.error("Initialization error:", err);
    }
  };

  fetchInitialData();
}, []); 

// When user clicks a row in the table, load that lead into the form
  const handleLeadClick = (lead) => {
    setFormData({
      id: lead.id || "",
      salesName: lead.salesName || "",
      leadType: lead.leadType || "prospective",
      dealType: lead.dealType || "",
      companyName: lead.companyName || "",
      companysize: lead.companysize || "",
      companyID: lead.companyID || "",
      numEmployees: lead.numberOfEmployees || "",
      percentage: lead.percentage || "",
      remarks: lead.remarks || "",
      industry: lead.industry || "",
      industryOther: lead.industryOther || "",
      spocs: Array.isArray(lead.spocs) && lead.spocs.length > 0
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
      existingLeadDetails: {
        employeeID: lead.employeeID || "",
        employeeName: lead.employeeName || "",
        replacementReason: lead.replacementReason || "",
        replacementToDate: lead.replacementToDate || "",
        replacementRequestDate: lead.replacementRequestDate || "",
        companySelect: lead.companySelect || "",
        companyNameGST: lead.companyNameGST || "",
      },
      status: lead.status || "prospective",
    });
    // Also sync tab and leadType
    if (lead.leadType === "prospective") setActiveTab("Prospective");
    if (lead.leadType === "new") setActiveTab("new-lead");
    if (lead.leadType === "existing" || lead.leadType === "deal") setActiveTab("deal");
  };

  // Handle form submit (create or update lead)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const { id, existingLeadDetails, ...cleanedFormData } = formData;
    const payload = {
      ...cleanedFormData,
      numberOfEmployees: parseInt(formData.numEmployees, 10) || 0,
      percentage: parseInt(formData.percentage, 10) || 0,
      spocs: formData.spocs.map((spoc) => ({
        name: spoc.name,
        email: spoc.email,
        contact: spoc.contact,
        altContact: spoc.altContact,
        designation: spoc.designation,
        location: spoc.location,
      })),
    };
    try {
      const method = id ? "PUT" : "POST";
      const endpoint = id ? `/api/lead/${id}` : "/api/lead";

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
        toast.success("Lead submitted successfully!");
        setFormData((prev) => ({
          id: "",
          salesName: prev.salesName,
          leadType: formData.leadType,
          dealType: "",
          companyName: "",
          companysize: "",
          companyID: "",
          numEmployees: "",
          percentage: "",
          remarks: "",
          industry: "",
          industryOther: "",
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
          existingLeadDetails: {
            employeeID: "",
            employeeName: "",
            replacementReason: "",
            replacementToDate: "",
            replacementRequestDate: "",
            companySelect: "",
            companyNameGST: "",
          },
          status: formData.status || "prospective",
        }));

        // Update the leads list
        setLeads((prev) => {
          const index = prev.findIndex((l) => l.id === data.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = data;
            return updated;
          }
          return [...prev, data];
        });
      } else {
        toast.error(`Submission failed: ${data.error}`);
        console.error("Submission failed:", data.error);
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`);
      console.error("Network error:", err);
    }
  };

  // Move a prospective lead to Qualified Lead
  const handleMoveToLead = async () => {
    if (!formData.id) {
      toast.error("Lead ID missing. Submit the form first.");
      return;
    }

    try {
      const response = await fetch(`/api/lead/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadType: "new",
          status: "newlead",
        }),
      });

      const updatedLead = await response.json();

      if (response.ok) {
        toast.success("Moved to Qualified Lead and Status updated!");
        setFormData((prev) => ({
          ...prev,
          leadType: "new",
          status: "newlead",
        }));
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.id === updatedLead.id ? updatedLead : lead
          )
        );
        setActiveTab("new-lead");
      } else {
        console.error("Update failed:", updatedLead.error);
        toast.error(`Update failed: ${updatedLead.error}`);
      }
    } catch (err) {
      console.error("PATCH failed:", err);
      toast.error("Failed to move lead to new and update status.");
    }
  };

  // Move a Qualified Lead to deal (existing)
  const handleMoveToDeal = async () => {
    if (!formData.id) {
      toast.error("Submit the lead first before moving to Deal.");
      return;
    }

    try {
      const response = await fetch(`/api/lead/${formData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadType: "existing",
          status: "deal",
        }),
      });

      const updatedLead = await response.json();

      if (response.ok) {
        toast.success("Lead moved to Deal successfully!");
        setFormData((prev) => ({
          ...prev,
          leadType: "existing",
          status: "deal",
        }));
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.id === updatedLead.id ? updatedLead : lead
          )
        );
        // Switch to the "Existing Deal" tab so the user sees the moved lead
        setActiveTab("existing-deal");
      } else {
        toast.error(`Failed to move to deal: ${updatedLead.error}`);
      }
    } catch (err) {
      toast.error("Network error while moving to deal.");
      console.error("[PATCH to deal]:", err);
    }
  };

  // When user changes the tab, update the form type accordingly
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    if (tab === "Prospective") {
      setFormData((prev) => ({ ...prev, leadType: "prospective", status: "prospective" }));
    } else if (tab === "new-lead") {
      setFormData((prev) => ({ ...prev, leadType: "new", status: "newlead" }));
    } else if (tab === "deal" || tab === "existing-deal") {
      setFormData((prev) => ({ ...prev, leadType: "existing", status: "deal" }));
    }
  };

  return (
    <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:pl-64" : "lg:pl-20"} pl-0 flex-1 w-full p-0`}>
      <Card className="mx-auto">
        <CardHeader>
          <CardTitle>BD/Sales Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label>Sales Name:</Label>
              <Input
                id="salesName"
                value={formData.salesName || ""}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <LeadTypeSelector
              value={formData.leadType || ""}
              onChange={(value) => setFormData((prev) => ({ ...prev, leadType: value }))}
            />

            {formData.leadType === "prospective" && (
              <ProspectiveLeadForm
                formData={formData}
                setFormData={setFormData}
                handleMoveToLead={handleMoveToLead}
                moveToLeadLabel="Move to Qualified Lead"
              />
            )}

            {formData.leadType === "new" && (
              <NewLeadForm
                formData={formData}
                setFormData={setFormData}
                handleMoveToDeal={handleMoveToDeal}
              />
            )}

            {formData.leadType === "existing" && (
              <ExistingLeadForm
                formData={formData}
                setFormData={setFormData}
                leads={leads}
                handleMoveToDeal={handleMoveToDeal}
              />
            )}

            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <BdTable
        leads={leads}
        onLeadClick={handleLeadClick}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}