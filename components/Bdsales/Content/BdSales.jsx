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
  const [selectedLead, setSelectedLead] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    salesName: "",
    leadType: "prospective",
    dealType: "",
    businessType: "",
    companyType: "",
    technology: "",
    technologyOther: "",
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
        const baseUrl = process.env.NEXT_PUBLIC_BASEAPIURL;
        const userRes = await fetch(`${baseUrl}/api/users/me`, {
          method: "GET",
          credentials: "include",
        });
        const userData = await userRes.json();

        if (!userRes.ok) {
          throw new Error(userData.message || "Failed to fetch user data");
        }

        const loggedInSalesName =
          userData?.data?.userName || userData?.userName;
        if (!loggedInSalesName) {
          throw new Error("Failed to fetch user name");
        }

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
          (lead) =>
            lead.salesName?.toLowerCase() ===
            loggedInSalesName.toLowerCase()
        );
        setLeads(filteredLeads);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    fetchInitialData();
  }, []);

  // When user clicks a table row
  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setFormData({
      id: lead.id || "",
      salesName: lead.salesName || "",
      leadType: lead.leadType || "prospective",
      dealType: lead.dealType || "",
      businessType: lead.businessType || "",
      companyType: lead.companyType || "",
      technology: lead.technology || "",
      technologyOther: lead.technologyOther || "",
      companyName: lead.companyName || "",
      companysize: lead.companysize || "",
      companyID: lead.companyID || "",
      numEmployees: lead.numberOfEmployees || "",
      percentage: lead.percentage || "",
      remarks: lead.remarks || "",
      industry: lead.industry || "",
      industryOther: lead.industryOther || "",
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
      existingLeadDetails: {
        employeeID: lead.employeeID || "",
        employeeName: lead.employeeName || "",
        replacementReason: lead.replacementReason || "",
        replacementToDate: lead.replacementToDate
          ? lead.replacementToDate.slice(0, 10)
          : "",
        replacementRequestDate: lead.replacementRequestDate
          ? lead.replacementRequestDate.slice(0, 10)
          : "",
        companySelect: String(lead.id || ""),
        companyNameGST: lead.companyNameGST || lead.companyName || "",
      },
      status: lead.status || "prospective",
    });

    if (lead.leadType === "prospective") setActiveTab("Prospective");
    if (lead.leadType === "new") setActiveTab("new-lead");
    if (lead.leadType === "existing" || lead.leadType === "deal")
      setActiveTab("deal");
  };

  // Submit
  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const token = localStorage.getItem("token");
    const { id, existingLeadDetails, ...cleanedFormData } = formData;

    // Fix: Ensure employeeName is always an array
    const payload = {
      ...cleanedFormData,
      ...existingLeadDetails,
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
      employeeName: Array.isArray(formData.existingLeadDetails?.employeeName)
        ? formData.existingLeadDetails.employeeName
        : formData.existingLeadDetails?.employeeName
        ? [formData.existingLeadDetails.employeeName]
        : [],
      // Fix: replacementReason must be null if empty string
      replacementReason:
        existingLeadDetails.replacementReason === "" ||
        existingLeadDetails.replacementReason === undefined
          ? null
          : existingLeadDetails.replacementReason,
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
          ...prev,
          id: "",
          dealType: "",
          businessType: "",
          companyType: "",
          technology: "",
          technologyOther: "",
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
        }));

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
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`);
    }
  };

  // Move prospective → new
  const handleMoveToLead = async () => {
    if (!formData.id) {
      toast.error("Lead ID missing. Submit the form first.");
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
        setFormData((prev) => ({ ...prev, leadType: "new", status: "newlead" }));
        setLeads((prev) =>
          prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
        );
        setActiveTab("new-lead");
      }
    } catch (err) {
      toast.error("Error moving to lead");
    }
  };

  // Move to deal (fix: always flatten payload, remove nested objects, only send primitives/arrays)
  const handleMoveToDeal = async (payload = null) => {
    if (!formData.id) {
      toast.error("Submit the lead first before moving to Deal.");
      return;
    }

    // Always flatten payload and remove nested objects
    let updatePayload;
    if (payload) {
      // If payload is provided (from ExistingLeadForm), flatten it
      updatePayload = { ...payload };
      Object.keys(updatePayload).forEach((key) => {
        const val = updatePayload[key];
        if (
          typeof val === "object" &&
          val !== null &&
          (val instanceof HTMLElement ||
            (val && val.$$typeof) ||
            (val && val._reactInternals) ||
            Array.isArray(val) === false
          )
        ) {
          delete updatePayload[key];
        }
      });
      delete updatePayload.existingLeadDetails;
      // Fix: replacementReason must be null if empty string
      if (
        updatePayload.replacementReason === "" ||
        updatePayload.replacementReason === undefined
      ) {
        updatePayload.replacementReason = null;
      }
    } else {
      updatePayload = {
        ...formData,
        ...formData.existingLeadDetails,
        numberOfEmployees: parseInt(formData.numEmployees, 10) || 0,
        percentage: parseInt(formData.percentage, 10) || 0,
        spocs: Array.isArray(formData.spocs)
          ? formData.spocs.map((spoc) => ({
              name: spoc.name,
              email: spoc.email,
              contact: spoc.contact,
              altContact: spoc.altContact,
              designation: spoc.designation,
              location: spoc.location,
            }))
          : [],
        // Fix: replacementReason must be null if empty string
        replacementReason:
          formData.existingLeadDetails.replacementReason === "" ||
          formData.existingLeadDetails.replacementReason === undefined
            ? null
            : formData.existingLeadDetails.replacementReason,
      };
      delete updatePayload.existingLeadDetails;
    }

    // Ensure percentage is at least 90 before moving to deal
    const percentageValue =
      updatePayload.percentage !== undefined
        ? parseInt(updatePayload.percentage, 10)
        : parseInt(formData.percentage, 10);

    if (isNaN(percentageValue) || percentageValue < 90) {
      toast.error("Percentage must be at least 90% to move to Deal/Closure.");
      return;
    }

    try {
      const updateResponse = await fetch(`/api/lead/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      const updateData = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateData.error || "Failed to update lead data");
      }

      const response = await fetch(`/api/lead/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadType: "existing", status: "deal" }),
      });

      const updatedLead = await response.json();

      if (response.ok) {
        toast.success("Lead moved to Deal!");
        setFormData((prev) => ({ ...prev, leadType: "existing", status: "deal" }));
        setLeads((prev) =>
          prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
        );
        setActiveTab("existing-deal");
      } else {
        toast.error(`Error moving to deal: ${updatedLead.error || "Unknown error"}`);
      }
    } catch (err) {
      let msg = err && err.message ? err.message : String(err);
      if (msg.includes("circular structure")) {
        msg = "Internal error: Please check your form data for invalid values.";
      }
      toast.error(`Error moving to deal: ${msg}`);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSelectedLead(null);

    if (tab === "Prospective")
      setFormData((prev) => ({
        ...prev,
        leadType: "prospective",
        status: "prospective",
      }));
    if (tab === "new-lead")
      setFormData((prev) => ({
        ...prev,
        leadType: "new",
        status: "newlead",
      }));
    if (tab === "deal" || tab === "existing-deal")
      setFormData((prev) => ({
        ...prev,
        leadType: "existing",
        status: "deal",
      }));
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isSidebarOpen ? "ml-64" : "ml-0"
      } p-6 bg-gray-50 min-h-screen overflow-hidden`}
    >
      <Card className="max-w-full mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>BD/Sales Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Sales Name field at the top */}
          <div className="mb-4">
            <Label className="mb-1 block">Sales Name:</Label>
            <Input
              id="salesName"
              value={formData.salesName || ""}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <BdTable
            leads={leads}
            onLeadClick={handleLeadClick}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {activeTab === "Prospective" && (
            <ProspectiveLeadForm
              formData={formData}
              setFormData={setFormData}
              handleMoveToLead={handleMoveToLead}
            />
          )}
          {activeTab === "new-lead" && (
            <NewLeadForm
              formData={formData}
              setFormData={setFormData}
              handleMoveToDeal={handleMoveToDeal}
              handleSubmitLead={handleSubmit}
            />
          )}
          {(activeTab === "deal" || activeTab === "existing-deal") && (
            <ExistingLeadForm
              leads={leads}
              formData={formData}
              setFormData={setFormData}
              handleMoveToDeal={handleMoveToDeal}
              selectedTableData={selectedLead}
            />
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit}>Submit Lead</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}