"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

function Recruitment() {
  const [formData, setFormData] = useState({
    requirementName: "",
    companyName: "",
    jobDescription: "",
    experience: 0,
    noticePeriod: 0,
    positions: 0,
    primarySkills: "",
    secondarySkills: "",
    closePositions: "",
    requirementType: "",
    workLocation: "",
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📝 Form Submitted Data:", formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg p-6">
        <CardHeader>
          <CardTitle>Recruitment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recruitment Name */}
            <Label htmlFor="requirementName">Recruitment Name:</Label>
            <Input
              id="requirementName"
              name="requirementName"
              placeholder="Enter requirement name"
              value={formData.requirementName}
              onChange={handleChange}
              type="text"
            />

            {/* Company Name */}
            <Label htmlFor="companyName">Company Name:</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Enter the Company Name"
              value={formData.companyName}
              onChange={handleChange}
              type="text"
            />

            {/* Job Description */}
            <Label htmlFor="jobDescription">Job Description:</Label>
            <Input
              id="jobDescription"
              name="jobDescription"
              placeholder="Enter Job Description"
              value={formData.jobDescription}
              onChange={handleChange}
              type="text"
            />

            {/* Experience */}
            <Label htmlFor="experience">Experience (in years):</Label>
            <Input
              id="experience"
              name="experience"
              placeholder="Enter required experience"
              value={formData.experience}
              onChange={handleChange}
              type="number"
            />

            {/* Notice Period */}
            <Label htmlFor="noticePeriod">Notice Period (in Days):</Label>
            <Input
              id="noticePeriod"
              name="noticePeriod"
              placeholder="Enter Notice Period"
              value={formData.noticePeriod}
              onChange={handleChange}
              type="number"
            />

            {/* Number of Positions */}
            <Label htmlFor="positions">Number of Positions:</Label>
            <Input
              id="positions"
              name="positions"
              placeholder="Enter Number of Positions"
              value={formData.positions}
              onChange={handleChange}
              type="number"
            />

            {/* Primary Skills */}
            <Label htmlFor="primarySkills">Primary Skills:</Label>
            <Input
              id="primarySkills"
              name="primarySkills"
              placeholder="Enter Primary Skills"
              value={formData.primarySkills}
              onChange={handleChange}
              type="text"
            />

            {/* Secondary Skills */}
            <Label htmlFor="secondarySkills">Secondary Skills:</Label>
            <Input
              id="secondarySkills"
              name="secondarySkills"
              placeholder="Enter Secondary Skills"
              value={formData.secondarySkills}
              onChange={handleChange}
              type="text"
            />

            {/* Close Positions */}
            <Label htmlFor="closePositions">Positions to Close</Label>
            <Input
              id="closePositions"
              name="closePositions"
              placeholder="Positions to Close"
              value={formData.closePositions}
              onChange={handleChange}
              type="text"
            />

            {/* Requirement Type (Radio Group with Labels & IDs) */}
            <Label htmlFor="requirementType">Requirement Type:</Label>
            <RadioGroup
              name="requirementType"
              value={formData.requirementType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, requirementType: value }))}
            >
              <div className="flex flex-row space-y-2 gap-0">
                <Label htmlFor="fulltime" className="flex items-center space-x-2">
                  <RadioGroupItem id="fulltime" value="FullTime" />
                  <span>Full-Time</span>
                </Label>

                <Label htmlFor="c2h" className="flex items-center space-x-2">
                  <RadioGroupItem id="c2h" value="C2H" />
                  <span>C2H</span>
                </Label>

                <Label htmlFor="contract" className="flex items-center space-x-2">
                  <RadioGroupItem id="contract" value="Contract" />
                  <span>Contract</span>
                </Label>
              </div>
            </RadioGroup>

            {/* Work Location (Radio Group with Labels & IDs) */}
            <Label htmlFor="workLocation">Work Location:</Label>
            <RadioGroup
              name="workLocation"
              value={formData.workLocation}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, workLocation: value }))}
            >
              <div className="flex flex-row space-y-2 gap-2">
                <Label htmlFor="wfo" className="flex items-center space-x-2">
                  <RadioGroupItem id="wfo" value="WFO" />
                  <span>WFO</span>
                </Label>

                <Label htmlFor="wfc" className="flex items-center space-x-2">
                  <RadioGroupItem id="wfc" value="WFC" />
                  <span>WFC</span>
                </Label>

                <Label htmlFor="hybrid" className="flex items-center space-x-2">
                  <RadioGroupItem id="hybrid" value="Hybrid" />
                  <span>Hybrid</span>
                </Label>

                <Label htmlFor="remote" className="flex items-center space-x-2">
                  <RadioGroupItem id="remote" value="Remote" />
                  <span>Remote</span>
                </Label>

                <Label htmlFor="freelance" className="flex items-center space-x-2">
                  <RadioGroupItem id="freelance" value="Freelance" />
                  <span>Freelance</span>
                </Label>
              </div>
            </RadioGroup>

            {/* Show Selected Data */}
            <p className="text-sm text-blue-600">Requirement Type: {formData.requirementType || "Not Selected"}</p>
            <p className="text-sm text-blue-600">Work Location: {formData.workLocation || "Not Selected"}</p>

            {/* Submit Button */}
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Recruitment;
