"use client";
import React, { useState } from "react";

// 📌 Asset Options JSON
const assetOptions = {
  assetTypes: ["Laptop", "Mobile"],
  employeeStatus: ["Working", "Not Working"],
  laptopModels: [
    "Dell XPS 13", "Dell XPS 15", "Dell XPS 17", "Dell Latitude 7410", "Dell Latitude 5510",
    "Dell Inspiron 13", "Dell Inspiron 15", "Dell Inspiron 17", "Dell Alienware m15",
    "Dell Alienware m17", "Dell G3 15", "Dell G5 15", "Dell G7 17", "Dell Vostro 14", "Dell Vostro 15",

    "HP Spectre x360", "HP Spectre 13", "HP Envy 13", "HP Envy 14", "HP Envy 15",
    "HP Pavilion 14", "HP Pavilion 15", "HP Pavilion 17", "HP Elite Dragonfly",
    "HP EliteBook 830 G7", "HP EliteBook 840 G7", "HP EliteBook 850 G7", "HP ProBook 450 G7",
    "HP Omen 15", "HP Omen 17",

    "Lenovo ThinkPad X1 Carbon (9th Gen)", "Lenovo ThinkPad X1 Yoga (6th Gen)",
    "Lenovo ThinkPad X1 Extreme", "Lenovo ThinkPad T14", "Lenovo ThinkPad T14s",
    "Lenovo ThinkPad P Series", "Lenovo ThinkPad L14", "Lenovo IdeaPad 3",
    "Lenovo IdeaPad 5", "Lenovo IdeaPad 5 Pro", "Lenovo Yoga 7i", "Lenovo Yoga 9i",
    "Lenovo Legion 5", "Lenovo Legion 7i", "Lenovo ThinkBook 14s",

    "MacBook Air (M2)", "MacBook Air (M1)", "MacBook Pro 13-inch (M1, M2)",
    "MacBook Pro 14-inch (M1 Pro, M1 Max)", "MacBook Pro 16-inch (M1 Pro, M1 Max)",

    "Asus ZenBook 13", "Asus ZenBook 14", "Asus ZenBook 15", "Asus ZenBook Flip 13",
    "Asus ZenBook Flip 14", "Asus ROG Zephyrus G14", "Asus ROG Zephyrus G15",
    "Asus VivoBook 15", "Asus VivoBook S14", "Asus VivoBook Flip 14",
    "Asus TUF Gaming A15", "Asus TUF Gaming A17", "Asus ROG Strix G15", "Asus ROG Strix G17",

    "Acer Aspire 5", "Acer Aspire 7", "Acer Swift 3", "Acer Swift 5", "Acer Swift 7",
    "Acer Predator Helios 300", "Acer Predator Triton 500", "Acer Nitro 5",
    "Acer Chromebook Spin 13", "Acer Chromebook 14", "Acer Spin 5", "Acer Spin 7",

    "Microsoft Surface Laptop 4", "Microsoft Surface Laptop 3", "Microsoft Surface Book 3",
    "Microsoft Surface Pro 7", "Microsoft Surface Go 2", "Microsoft Surface Laptop Studio",

    "Razer Blade 15", "Razer Blade Stealth 13", "Razer Blade 17", "Razer Blade 14",

    "Samsung Galaxy Book Pro 360", "Samsung Galaxy Book 2 Pro", "Samsung Galaxy Book Flex2 Alpha",
    "Samsung Notebook 9 Pro",

    "LG Gram 14", "LG Gram 15", "LG Gram 17", "LG Gram 16 (2021)",

    "MSI GS66 Stealth", "MSI GE76 Raider", "MSI GE66 Raider", "MSI Creator 15",
    "MSI GF63 Thin", "MSI Summit E13 Flip",

    "Huawei MateBook X Pro", "Huawei MateBook 14", "Huawei MateBook D 15",
    "Huawei MateBook 13",

    "Toshiba Tecra A50", "Toshiba Satellite Pro L50", "Toshiba Satellite C50"
  ],
  hddTypes: ["SATA", "SSD", "NVMe"],
  processors: ["Intel i3", "Intel i5", "Intel i7", "AMD Ryzen"],
  operatingSystems: ["Windows 10", "Windows 11", "Linux"],
  ramTypes: ["DDR3", "DDR4", "DDR5"],
  exchangeOptions: ["New Laptop", "Refurbished Laptop"],
  laptopConditions: ["Good", "Needs Repair", "Damaged"],

  mobileModels: [
    "iPhone 13", "iPhone 14", "Samsung Galaxy S22", "Samsung Galaxy S23",
    "OnePlus 9", "OnePlus 10"
  ],
  mobileOs: ["iOS", "Android"]
};


export default function AssetManagementForm() {
  const [assetType, setAssetType] = useState("");
  const [employeeStatus, setEmployeeStatus] = useState("");
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    modelName: "",
    hddType: "",
    processor: "",
    os: "",
    ramType: "",
    hardDiskSize: "",
    providedDate: "",
    ramUpgrade: "",
    currentAddress: "",
    exchangeOption: "",
    laptopCondition: "",
    mobileModel: "",
    mobileOs: "",
    mobileStorage: "",
    mobileProvider: ""
  });

  const handlesubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data : ", formData)
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📝 Submitted Form Data:", formData);
    alert("Form submitted successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Asset Management Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Asset Type */}
        <label className="block font-medium text-gray-700">Select Asset Type:</label>
        <select
          name="assetType"
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select --</option>
          {assetOptions.assetTypes?.map((type) => (
            <option key={type} value={type.toLowerCase()}>
              {type}
            </option>
          ))}
        </select>

        {/* Employee ID & Name */}


        {/* Laptop Fields */}
        {assetType === "laptop" && (
          <div className="p-4 border rounded bg-gray-100">
            <h3 className="text-lg font-semibold text-gray-700">Laptop Details</h3>

            <label className="block font-medium text-gray-700">Employee ID:</label>
            <input
              type="text"
              name="employeeId"
              placeholder="Enter Employee ID"
              value={formData.employeeId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            <label className="block font-medium text-gray-700">Employee Name:</label>
            <input
              type="text"
              name="employeeName"
              placeholder="Enter Employee Name"
              value={formData.employeeName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            {["laptopModels", "hddTypes", "processors", "operatingSystems", "ramTypes"].map(
              (field) => (
                <div key={field}>
                  <label className="block font-medium text-gray-700">
                    {field.replace(/([A-Z])/g, " $1").trim()}:
                  </label>
                  <select
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">-- Select --</option>
                    {assetOptions[field]?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}

            <label className="block font-medium text-gray-700">Hard Disk Size:</label>
            <input
              type="text"
              name="hardDiskSize"
              placeholder="Enter Hard Disk Size"
              value={formData.hardDiskSize}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            <label className="block font-medium text-gray-700">Provided Date:</label>
            <input
              type="date"
              name="providedDate"
              value={formData.providedDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            <label className="block font-medium text-gray-700">RAM Upgrade:</label>
            <input
              type="text"
              name="ramUpgrade"
              placeholder="Enter RAM Upgrade Details"
              value={formData.ramUpgrade}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            <label className="block font-medium text-gray-700">Current Address:</label>
            <input
              type="text"
              name="currentAddress"
              placeholder="Enter Current Address"
              value={formData.currentAddress}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            {/* Employee Status */}
            <label className="block font-medium text-gray-700">Employee Status:</label>
            <select
              name="employeeStatus"
              value={employeeStatus}
              onChange={(e) => setEmployeeStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select Status --</option>
              {assetOptions.employeeStatus?.map((status) => (
                <option key={status} value={status.toLowerCase()}>
                  {status}
                </option>
              ))}
            </select>

            {/* Exchange Option (Only if Employee is "Working") */}
            {employeeStatus === "working" && (
              <div className="mt-4">
                <label className="block font-medium text-gray-700">Exchange Option:</label>
                <select
                  name="exchangeOption"
                  value={formData.exchangeOption}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- Select Exchange Option --</option>
                  {assetOptions.exchangeOptions?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {assetType === "mobile" && (
          <div className="p-4 border rounded bg-gray-100">
            <h3 className="text-lg font-semibold text-gray-700">Mobile Details</h3>

            {/* Employee ID */}
            <label className="block font-medium text-gray-700">Employee ID:</label>
            <input
              type="text"
              name="employeeId"
              placeholder="Enter Employee ID"
              value={formData.employeeId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            {/* Employee Name */}
            <label className="block font-medium text-gray-700">Employee Name:</label>
            <input
              type="text"
              name="employeeName"
              placeholder="Enter Employee Name"
              value={formData.employeeName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            {/* Mobile Model */}
            <label className="block font-medium text-gray-700">Mobile Model:</label>
            <select
              name="mobileModel"
              value={formData.mobileModel}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select Mobile Model --</option>
              {assetOptions.mobileModels?.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>

            {/* Mobile OS */}
            <label className="block font-medium text-gray-700">Operating System:</label>
            <select
              name="mobileOs"
              value={formData.mobileOs}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select OS --</option>
              {assetOptions.mobileOs?.map((os) => (
                <option key={os} value={os}>
                  {os}
                </option>
              ))}
            </select>

            {/* Mobile Storage */}
            <label className="block font-medium text-gray-700">Storage Size:</label>
            <input
              type="text"
              name="mobileStorage"
              placeholder="Enter Storage Size"
              value={formData.mobileStorage}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            {/* Mobile Provider */}
            <label className="block font-medium text-gray-700">Mobile Provider:</label>
            <input
              type="text"
              name="mobileProvider"
              placeholder="Enter Mobile Provider"
              value={formData.mobileProvider}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            {/* Provided Date */}
            <label className="block font-medium text-gray-700">Provided Date:</label>
            <input
              type="date"
              name="providedDate"
              value={formData.providedDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            {/* Employee Status */}
            <label className="block font-medium text-gray-700">Employee Status:</label>
            <select
              name="employeeStatus"
              value={employeeStatus}
              onChange={(e) => setEmployeeStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select Status --</option>
              {assetOptions.employeeStatus?.map((status) => (
                <option key={status} value={status.toLowerCase()}>
                  {status}
                </option>
              ))}
            </select>

            {/* Exchange Option (Only if Employee is "Working") */}
            {employeeStatus === "working" && (
              <div className="mt-4">
                <label className="block font-medium text-gray-700">Exchange Option:</label>
                <select
                  name="exchangeOption"
                  value={formData.exchangeOption}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- Select Exchange Option --</option>
                  {assetOptions.exchangeOptions?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handlesubmit}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
