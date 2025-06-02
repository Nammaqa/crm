"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import BdTable from "./BdTable/BdTable"
export default function BdSales({ isSidebarOpen }) {

  const [leads, setLeads] = useState([]);

  const [formData, setFormData] = useState({
    salesName: "",
    leadType: "",
    dealType: "",
    companyName: "",
    companyID: "",
    numEmployees: "",
    spocs: [{ id: 1, name: "", email: "", contact: "", altContact: "", designation: "", location: "" }],
    existingLeadDetails: {
      employeeID: "",
      employeeName: "",
      replacementReason: "",
      replacementToDate: "",
      replacementRequestDate: "",
      companySelect: "",
      companyNameGST: "",
    },
  });




  const BASE_URL = process.env.NEXT_PUBLIC_BASEAPIURL;


  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("");
        if (!response.ok) {
          throw new Error("Failed to fetch leads");
        }
        const data = await response.json();
        setLeads(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, []);
  //API To Send Data to Backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh

    console.log("Submitting Form Data:", formData); // Debugging - Logs the form data

    try {
      const response = await fetch(`${BASE_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Success:", data);
        alert("Form submitted successfully!");
      } else {
        console.error("Error:", data);
        alert("Submission failed!");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Network error! Check your connection.");
    }
  };



  const addSPOC = () => {
    setFormData(prev => ({
      ...prev,
      spocs: [
        ...prev.spocs,
        { id: prev.spocs.length + 1, name: "", email: "", contact: "", altContact: "", designation: "", location: "" }
      ]
    }));
  };


  const removeSPOC = (id) => {
    setFormData(prev => ({
      ...prev,
      spocs: prev.spocs.filter(spoc => spoc.id !== id)
    }));
  };

  return (
    <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:pl-64" : "lg:pl-20"} pl-0 flex-1 w-full p-0`}>
      <Card className=" mx-auto">
        <CardHeader>
          <CardTitle>BD/Sales Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Sales Name */}
            <div>
              <Label>Sales Name:</Label>
              <Input
                id="salesName"
                placeholder="Enter Sales Name"
                value={formData.salesName}
                onChange={(e) => setFormData(prev => ({ ...prev, salesName: e.target.value }))}
                required
              />
            </div>


            {/* Lead Selection */}
            <div>
              <Label>Lead:</Label>
              <Select
                value={formData.leadType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, leadType: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Lead Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospective">Add Prospective Lead</SelectItem>
                  <SelectItem value="new">Add Qualified Lead</SelectItem>
                  <SelectItem value="existing">Add Existing Lead</SelectItem>

                </SelectContent>
              </Select>
            </div>

            {/* Prospective Lead Section */}
            {formData.leadType === "prospective" && (
              <div className="mb-4 p-5 border rounded-md shadow-md space-y-4">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="block text-sm font-medium">
                    Company Name :
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    required
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {/* SPOC Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">SPOC Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="spocName" className="block text-sm font-medium">SPOC Name</Label>
                    <Input id="spocName" placeholder="Enter SPOC name" className="w-full p-2 border rounded-md" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spocLinkedin" className="block text-sm font-medium">SPOC LinkedIn</Label>
                    <Input id="spocLinkedin" placeholder="Enter SPOC LinkedIn" className="w-full p-2 border rounded-md" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="designation" className="block text-sm font-medium">Designation</Label>
                    <Input id="designation" placeholder="Enter designation" className="w-full p-2 border rounded-md" />
                  </div>
                </div>

                {/* Technology Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="technology" className="block text-sm font-medium">Technology</Label>
                  <Select>
                    <SelectTrigger className="w-full p-2 border rounded-md">
                      <SelectValue placeholder="Select Technology" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="test">Testing</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="test">AI ML</SelectItem>
                      <SelectItem value="devops">AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Percentage Radio Buttons */}
                <div className="space-y-2">
                  <Label htmlFor="percentage" className="block text-sm font-medium">Percentage</Label>
                  <RadioGroup className="space-y-2 flex flex-row" id="percentage">
                    {[10, 30, 50, 70, 90].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={String(value)} id={`percentage-${value}`} />
                        <Label htmlFor={`percentage-${value}`} className="text-sm">{value}%</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

            )}

            {/* New Lead Section */}
            {formData.leadType === "new" && (
              <div className="mb-4 p-5 border rounded-md shadow-md">
                <Label htmlFor="companyName">Company Name :</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                />

                {/* Deal Type */}
                <div className="mb-4 mt-4">
                  <Label>Type:</Label>
                  <RadioGroup
                    className="mt-2"
                    value={formData.dealType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, dealType: value }))}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <RadioGroupItem id="business" value="Business" name="type" />
                        <Label htmlFor="business" className="ml-2">Business</Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem id="freelance" value="Freelance" name="type" />
                        <Label htmlFor="freelance" className="ml-2">Freelance</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>


                {/* SPOC Details */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Primary SPOC</h3>
                  {formData.spocs.map((spoc, index) => (
                    <div key={spoc.id} className="bg-white p-4 rounded-md shadow-sm mt-2 space-y-2">
                      <Input
                        placeholder="Name"
                        value={spoc.name}
                        onChange={(e) => {
                          const updatedSpocs = [...formData.spocs];
                          updatedSpocs[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, spocs: updatedSpocs }));
                        }}
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Email ID"
                        value={spoc.email}
                        onChange={(e) => {
                          const updatedSpocs = [...formData.spocs];
                          updatedSpocs[index].email = e.target.value;
                          setFormData(prev => ({ ...prev, spocs: updatedSpocs }));
                        }}
                        required
                      />
                      <Input
                        placeholder="Contact Number"
                        value={spoc.contact}
                        onChange={(e) => {
                          const updatedSpocs = [...formData.spocs];
                          updatedSpocs[index].contact = e.target.value;
                          setFormData(prev => ({ ...prev, spocs: updatedSpocs }));
                        }}
                        required
                      />
                      <Input
                        placeholder="Alt Contact Number (Optional)"
                        value={spoc.altContact}
                        onChange={(e) => {
                          const updatedSpocs = [...formData.spocs];
                          updatedSpocs[index].altContact = e.target.value;
                          setFormData(prev => ({ ...prev, spocs: updatedSpocs }));
                        }}
                      />
                      <Input
                        placeholder="Designation"
                        value={spoc.designation}
                        onChange={(e) => {
                          const updatedSpocs = [...formData.spocs];
                          updatedSpocs[index].designation = e.target.value;
                          setFormData(prev => ({ ...prev, spocs: updatedSpocs }));
                        }}
                      />
                      <Input
                        placeholder="Location"
                        value={spoc.location}
                        onChange={(e) => {
                          const updatedSpocs = [...formData.spocs];
                          updatedSpocs[index].location = e.target.value;
                          setFormData(prev => ({ ...prev, spocs: updatedSpocs }));
                        }}
                      />
                      {formData.spocs.length > 1 && (
                        <Button variant="destructive" size="sm" onClick={() => removeSPOC(spoc.id)}>
                          Remove SPOC
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button className="mt-2" onClick={addSPOC}>
                    Add SPOC
                  </Button>
                </div>


                {/* ✅ Company ID */}
                {/* <Input
                  id="companyName"
                  placeholder="Enter Company Name"
                  value={formData.companyName}
                  onChange={(e) => {
                    const companyName = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      companyName,
                      companyID: companyName ? `CID-${companyName.substring(0, 3).toUpperCase()}-${Date.now()}` : ""
                    }));
                  }}
                  required
                /> */}


                {/* ✅ No of Employees (Added Below Company ID) */}
                {/* <div className="mb-4">
                  <Label htmlFor="numEmployees">No of Employees:</Label>
                  <Input
                    id="numEmployees"
                    type="number"
                    min="0"
                    value={formData.numEmployees}
                    onChange={(e) => setFormData(prev => ({ ...prev, numEmployees: e.target.value }))}
                    placeholder="Enter No of Employees"
                    required
                  />
                </div> */}

              </div>
            )}

            {formData.leadType === "existing" && (
              <div className="mb-4 p-5 border rounded-md shadow-md">
                <h3 className="text-lg font-semibold">Existing Lead Details</h3>

                {/* Deal Type (Replacement/New) */}
                <div className="mb-4">
                  <Label>Type:</Label>
                  <RadioGroup
                    className="mt-2"
                    value={formData.dealType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, dealType: value }))}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <RadioGroupItem id="replacement" value="replacement" />
                        <Label htmlFor="replacement" className="ml-2">Replacement</Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem id="new" value="new" />
                        <Label htmlFor="new" className="ml-2">New</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>


                {/* ✅ Replacement Fields */}
                {formData.dealType === "replacement" && (
                  <div className="mb-4 p-4 border rounded-md shadow-sm">
                    <Label htmlFor="employeeID">Employee ID:</Label>
                    <Input
                      id="employeeID"
                      placeholder="Enter Employee ID"
                      value={formData.existingLeadDetails.employeeID}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        existingLeadDetails: { ...prev.existingLeadDetails, employeeID: e.target.value }
                      }))}
                      required
                    />

                    <Label htmlFor="employeeName">Employee Name:</Label>
                    <Input
                      id="employeeName"
                      placeholder="Enter Employee Name"
                      value={formData.existingLeadDetails.employeeName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        existingLeadDetails: { ...prev.existingLeadDetails, employeeName: e.target.value }
                      }))}
                      required
                    />

                    <Label htmlFor="replacementReason">Replacement Reason:</Label>
                    <Select
                      value={formData.existingLeadDetails.replacementReason}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        existingLeadDetails: { ...prev.existingLeadDetails, replacementReason: value }
                      }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resigned">Resigned</SelectItem>
                        <SelectItem value="performance-issue">Performance Issue</SelectItem>
                        <SelectItem value="employee-concern">Employee Concern</SelectItem>
                      </SelectContent>
                    </Select>

                    <Label htmlFor="replacementToDate">Replacement To (Date):</Label>
                    <Input
                      id="replacementToDate"
                      type="date"
                      value={formData.existingLeadDetails.replacementToDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        existingLeadDetails: { ...prev.existingLeadDetails, replacementToDate: e.target.value }
                      }))}
                      required
                    />

                    <Label htmlFor="replacementRequestDate">Replacement Request Date (Client):</Label>
                    <Input
                      id="replacementRequestDate"
                      type="date"
                      value={formData.existingLeadDetails.replacementRequestDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        existingLeadDetails: { ...prev.existingLeadDetails, replacementRequestDate: e.target.value }
                      }))}
                      required
                    />
                  </div>
                )}


                {/* ✅ New Lead Fields */}
                {formData.dealType === "new" && (
                  <div className="mb-4 p-4 border rounded-md shadow-sm">
                    <Label htmlFor="companySelect">Select Company:</Label>
                    <Select
                      value={formData.existingLeadDetails.companySelect}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        existingLeadDetails: { ...prev.existingLeadDetails, companySelect: value }
                      }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Company" />
                      </SelectTrigger>
                      <SelectContent>
                        {leads.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Label htmlFor="companyNameGST">Company Name (as per GST):</Label>
                    <Input
                      id="companyNameGST"
                      placeholder="Enter GST Company Name"
                      value={formData.existingLeadDetails.companyNameGST}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        existingLeadDetails: { ...prev.existingLeadDetails, companyNameGST: e.target.value }
                      }))}
                      required
                    />

                    <Label>Type:</Label>
                    <RadioGroup
                      value={formData.existingLeadDetails.type}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        existingLeadDetails: { ...prev.existingLeadDetails, type: value }
                      }))}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <RadioGroupItem id="business" value="Business" />
                          <Label htmlFor="business" className="ml-2">Business</Label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem id="freelance" value="Freelance" />
                          <Label htmlFor="freelance" className="ml-2">Freelance</Label>
                        </div>
                      </div>
                    </RadioGroup>

                    <Label htmlFor="companyID">Company ID:</Label>
                    <Input id="companyID" value={formData.companyID} readOnly />

                    <Label htmlFor="numEmployees">No of Employees:</Label>
                    <Input
                      id="numEmployees"
                      type="number"
                      min="0"
                      value={formData.numEmployees}
                      onChange={(e) => setFormData(prev => ({ ...prev, numEmployees: e.target.value }))}
                      placeholder="Enter No of Employees"
                      required
                    />
                  </div>
                )}

              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" onClick={handleSubmit}>Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <BdTable />
    </div>
  );
}
