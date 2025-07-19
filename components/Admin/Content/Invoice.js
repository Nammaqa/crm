"use client"
import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaSearch, FaChevronDown } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Tab and dropdown options
const TABS = [
  { key: "otherDetails", label: "Other Details" },
  { key: "address", label: "Address" },
  { key: "contactPersons", label: "Contact Persons" },
  { key: "remarks", label: "Remarks" },
];

const countryOptions = [
  { value: "", label: "Select Country/Region" },
  { value: "India", label: "India" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Australia", label: "Australia" },
  { value: "Other", label: "Other" },
];

const stateOptions = [
  { value: "", label: "Select State" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Delhi", label: "Delhi" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Other", label: "Other" },
];

const salutationOptions = [
  { value: "", label: "Salutation" },
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Ms.", label: "Ms." },
  { value: "Miss", label: "Miss" },
  { value: "Dr.", label: "Dr." },
];

const currencyOptions = [
  { value: "INR", label: "INR (₹)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
];

const suffixOptions = [
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Ms.", label: "Ms." },
  { value: "Miss", label: "Miss" },
  { value: "Dr.", label: "Dr." },
];

const paymentTermsOptions = [
  { value: "NET_15", label: "Net 15" },
  { value: "NET_30", label: "Net 30" },
  { value: "NET_45", label: "Net 45" },
  { value: "NET_60", label: "Net 60" },
  { value: "DUE_ON_RECEIPT", label: "Due on Receipt" },
  { value: "DUE_END_OF_MONTH", label: "Due end of the month" },
  { value: "DUE_END_OF_NEXT_MONTH", label: "Due end of next month" },
];

// Place of Supply Options
const placeOfSupplyOptions = [
  { value: "", label: "Select Place of Supply" },
  { value: "AP", label: "[AP] - Andhra Pradesh" },
  { value: "AR", label: "[AR] - Arunachal Pradesh" },
  { value: "AS", label: "[AS] - Assam" },
  { value: "BR", label: "[BR] - Bihar" },
  { value: "CG", label: "[CG] - Chhattisgarh" },
  { value: "GA", label: "[GA] - Goa" },
  { value: "GJ", label: "[GJ] - Gujarat" },
  { value: "HR", label: "[HR] - Haryana" },
  { value: "HP", label: "[HP] - Himachal Pradesh" },
  { value: "JH", label: "[JH] - Jharkhand" },
  { value: "KA", label: "[KA] - Karnataka" },
  { value: "KL", label: "[KL] - Kerala" },
  { value: "MP", label: "[MP] - Madhya Pradesh" },
  { value: "MH", label: "[MH] - Maharashtra" },
  { value: "MN", label: "[MN] - Manipur" },
  { value: "ML", label: "[ML] - Meghalaya" },
  { value: "MZ", label: "[MZ] - Mizoram" },
  { value: "NL", label: "[NL] - Nagaland" },
  { value: "OD", label: "[OD] - Odisha (Orissa)" },
  { value: "PB", label: "[PB] - Punjab" },
  { value: "RJ", label: "[RJ] - Rajasthan" },
  { value: "SK", label: "[SK] - Sikkim" },
  { value: "TN", label: "[TN] - Tamil Nadu" },
  { value: "TS", label: "[TS] - Telangana" },
  { value: "TR", label: "[TR] - Tripura" },
  { value: "UP", label: "[UP] - Uttar Pradesh" },
  { value: "UK", label: "[UK] - Uttarakhand" },
  { value: "WB", label: "[WB] - West Bengal" },
];

// GST Treatment Options with Descriptions (formatted as requested)
const gstTreatmentOptions = [
  {
    value: "REGISTERED_REGULAR",
    label: "Registered Business – Regular",
    description: "Business that is registered under GST."
  },
  {
    value: "REGISTERED_COMPOSITION",
    label: "Registered Business – Composition",
    description: "Business that is registered under the Composition Scheme in GST."
  },
  {
    value: "UNREGISTERED",
    label: "Unregistered Business",
    description: "Business that has not been registered under GST."
  },
  {
    value: "CONSUMER",
    label: "Consumer",
    description: "A customer who is a regular consumer."
  },
  {
    value: "OVERSEAS",
    label: "Overseas",
    description: "Persons with whom you do import or export of supplies outside India."
  },
  {
    value: "SEZ",
    label: "Special Economic Zone",
    description: "Business (Unit) that is located in a Special Economic Zone (SEZ) of India or a SEZ Developer."
  },
  {
    value: "DEEMED_EXPORT",
    label: "Deemed Export",
    description: "Supply of goods to an Export Oriented Unit or against Advanced Authorization/Export Promotion Goods."
  },
  {
    value: "TAX_DEDUCTOR",
    label: "Tax Deductor",
    description: "Departments of the State/Central government, governmental agencies or local authorities."
  },
  {
    value: "SEZ_DEVELOPER",
    label: "SEZ Developer",
    description: "A person/organisation who owns at least 26% of the equity in creating business units in a Special Economic Zone (SEZ)."
  },
];

// --- SearchableDropdown for Place of Supply ---
function SearchableDropdown({ options, value, onChange, placeholder, name }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  // Filter options based on search
  const filtered = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.value.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Find selected label
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-between w-full p-2 border rounded bg-white"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected?.value ? "text-gray-900" : "text-gray-400"}>
          {selected?.label || placeholder}
        </span>
        <FaChevronDown className="ml-2 text-gray-400" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            <input
              type="text"
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <ul tabIndex={-1} className="max-h-48 overflow-auto">
            {filtered.length === 0 && (
              <li className="px-4 py-2 text-gray-400 text-sm">No results</li>
            )}
            {filtered.map((opt) => (
              <li
                key={opt.value}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                  value === opt.value ? "bg-blue-100 font-semibold" : ""
                }`}
                onClick={() => {
                  onChange({ target: { name, value: opt.value } });
                  setOpen(false);
                  setSearch("");
                }}
                role="option"
                aria-selected={value === opt.value}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Validation functions (unchanged)
function validateAddressFields(address) {
  const errors = {};
  if (!address.attention || address.attention.trim() === "") errors.attention = "Attention is required";
  if (!address.country || address.country.trim() === "") errors.country = "Country/Region is required";
  if (!address.address || address.address.trim() === "") errors.address = "Address is required";
  if (!address.city || address.city.trim() === "") errors.city = "City is required";
  if (!address.state || address.state.trim() === "") errors.state = "State is required";
  if (!address.pinCode || !/^\d{6}$/.test(address.pinCode)) errors.pinCode = "Pin Code must be 6 digits";
  if (!address.phone || !/^[6-9]\d{9}$/.test(address.phone)) errors.phone = "Phone must be 10 digits and start with 6, 7, 8, or 9";
  if (address.faxNumber && !/^\d{6,15}$/.test(address.faxNumber)) errors.faxNumber = "Fax Number must be 6-15 digits";
  return errors;
}

function validateCustomerFields(customer) {
  const errors = {};
  if (!customer.primaryName || customer.primaryName.trim() === "") errors.primaryName = "Primary Name is required";
  if (!customer.email || !customer.email.includes("@")) errors.email = "Email must contain '@'";
  if (!customer.phone || !/^[6-9]\d{9}$/.test(customer.phone)) errors.phone = "Phone must be 10 digits and start with 6, 7, 8, or 9";
  return errors;
}

function validateContactPerson(person) {
  const errors = {};
  if (!person.salutation) errors.salutation = "Salutation required";
  if (!person.firstName || person.firstName.trim() === "") errors.firstName = "First Name required";
  if (!person.lastName || person.lastName.trim() === "") errors.lastName = "Last Name required";
  if (!person.email || !person.email.includes("@")) errors.email = "Valid Email required";
  if (!person.workPhone || !/^[6-9]\d{9}$/.test(person.workPhone)) errors.workPhone = "Valid Phone required";
  if (!person.mobile || !/^[6-9]\d{9}$/.test(person.mobile)) errors.mobile = "Valid Mobile required";
  return errors;
}

// GST Modal Component (unchanged)
function GSTModal({ open, onClose, gstDetails, onPrefill }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        <h2 className="text-xl font-bold mb-4">GST Details</h2>
        {gstDetails ? (
          <div className="space-y-2">
            <div><span className="font-semibold">GSTIN:</span> {gstDetails.gstin}</div>
            <div><span className="font-semibold">Legal Name:</span> {gstDetails.legalName}</div>
            <div><span className="font-semibold">Trade Name:</span> {gstDetails.tradeName}</div>
            <div><span className="font-semibold">Address:</span> {gstDetails.address}</div>
            <div><span className="font-semibold">State:</span> {gstDetails.state}</div>
            <div><span className="font-semibold">Pin Code:</span> {gstDetails.pinCode}</div>
            <div><span className="font-semibold">Status:</span> {gstDetails.status}</div>
          </div>
        ) : (
          <div className="text-red-600">GST details not found or invalid GSTIN.</div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => onPrefill(gstDetails)}
            disabled={!gstDetails}
          >
            Prefill Details
          </button>
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// CustomerForm (unchanged except for bugfix in handleCustomerChange)
function CustomerForm({ customer, setCustomer, customerErrors, setCustomerErrors, gstNumber, setGstNumber, onGstCheck }) {
  // Compute display name options from Primary Contact and Company
  const displayNameOptions = [
    customer.primaryName?.trim() ? customer.primaryName : null,
    customer.company?.trim() ? customer.company : null,
  ].filter(Boolean);

  // If displayName is not in options, add it (for backward compatibility)
  if (
    customer.displayName &&
    !displayNameOptions.includes(customer.displayName)
  ) {
    displayNameOptions.push(customer.displayName);
  }

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => {
      let updated = { ...prev, [name]: value };
      if (
        (name === "primaryName" || name === "company") &&
        (!prev.displayName ||
          prev.displayName === prev.primaryName ||
          prev.displayName === prev.company)
      ) {
        updated.displayName = value;
      }
      return updated;
    });

    if (name === "email") {
      setCustomerErrors((prev) => ({
        ...prev,
        email: !value.includes("@") ? "Email must contain '@'" : "",
      }));
    }
    if (name === "phone") {
      setCustomerErrors((prev) => ({
        ...prev,
        phone: !/^[6-9]\d{9}$/.test(value)
          ? "Phone must be 10 digits and start with 6, 7, 8, or 9"
          : "",
      }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg px-8 py-8 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">New Customer</h2>
      </div>
      {/* GST Field at the top */}
      <div className="mb-6 flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
          <Input
            name="gstNumber"
            value={gstNumber}
            onChange={e => setGstNumber(e.target.value.toUpperCase())}
            placeholder="Enter GST Number"
            className="p-2 border rounded w-full"
            maxLength={15}
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onGstCheck}
          disabled={!gstNumber || gstNumber.length !== 15}
          title="Check GST Details"
        >
          <FaSearch /> Check
        </button>
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact</label>
          <div className="flex gap-2">
            <select
              name="primarySuffix"
              value={customer.primarySuffix}
              onChange={handleCustomerChange}
              className="p-2 border rounded"
              style={{ minWidth: "80px" }}
            >
              {suffixOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Input
              name="primaryName"
              value={customer.primaryName}
              onChange={handleCustomerChange}
              placeholder="Enter Name"
              className="p-2 border rounded w-full"
            />
          </div>
          {customerErrors.primaryName && (
            <div className="text-xs text-red-600 mt-1">{customerErrors.primaryName}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <Input
            name="company"
            value={customer.company}
            onChange={handleCustomerChange}
            placeholder="Company Name"
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <select
            name="displayName"
            value={customer.displayName}
            onChange={handleCustomerChange}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Display Name</option>
            {displayNameOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            name="currency"
            value={customer.currency}
            onChange={handleCustomerChange}
            className="p-2 border rounded w-full"
          >
            {currencyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
          <Input
            name="email"
            value={customer.email}
            onChange={handleCustomerChange}
            placeholder="Email"
            className={`p-2 border rounded w-full ${customerErrors.email ? "border-red-500" : ""}`}
            type="email"
          />
          {customerErrors.email && (
            <div className="text-xs text-red-600 mt-1">{customerErrors.email}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <Input
            name="phone"
            value={customer.phone}
            onChange={handleCustomerChange}
            placeholder="10 digit phone number"
            className={`p-2 border rounded w-full ${customerErrors.phone ? "border-red-500" : ""}`}
            type="tel"
            maxLength={10}
            pattern="[6-9][0-9]{9}"
          />
          {customerErrors.phone && (
            <div className="text-xs text-red-600 mt-1">{customerErrors.phone}</div>
          )}
        </div>
      </form>
    </div>
  );
}

// InvoiceOtherDetails with new GST fields and dropdowns
function InvoiceOtherDetails({
  otherDetails = {},
  setOtherDetails,
  addressErrors,
  setAddressErrors,
  contactPersons,
  setContactPersons,
  documentInputRef,
}) {
  const [activeTab, setActiveTab] = useState("otherDetails");

  const [newContact, setNewContact] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    workPhone: "",
    mobile: "",
  });

  const [newContactErrors, setNewContactErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setOtherDetails((prev) => ({
        ...prev,
        [name]: files[0],
        [`${name}Name`]: files[0]?.name || "",
      }));
    } else {
      setOtherDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (
        [
          "attention",
          "country",
          "address",
          "city",
          "state",
          "pinCode",
          "phone",
          "faxNumber",
        ].includes(name)
      ) {
        setAddressErrors((prev) => ({
          ...prev,
          ...validateAddressFields({ ...otherDetails, [name]: value }),
        }));
      }
    }
  };

  const handleAddressBlur = () => {
    setAddressErrors(validateAddressFields(otherDetails));
  };

  const handleNewContactChange = (e) => {
    const { name, value } = e.target;
    setNewContact((prev) => ({
      ...prev,
      [name]: value,
    }));
    setNewContactErrors((prev) => ({
      ...prev,
      ...validateContactPerson({ ...newContact, [name]: value }),
    }));
  };

  const handleAddOrEditContactPerson = (e) => {
    e.preventDefault();
    const errors = validateContactPerson(newContact);
    setNewContactErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (editIndex !== null) {
      setContactPersons((prev) =>
        prev.map((person, idx) => (idx === editIndex ? newContact : person))
      );
      setEditIndex(null);
    } else {
      setContactPersons((prev) => [...prev, newContact]);
    }
    setNewContact({
      salutation: "",
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      workPhone: "",
      mobile: "",
    });
    setNewContactErrors({});
  };

  const handleRemoveContactPerson = (idx) => {
    setContactPersons((prev) => prev.filter((_, i) => i !== idx));
    if (editIndex === idx) {
      setEditIndex(null);
      setNewContact({
        salutation: "",
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        workPhone: "",
        mobile: "",
      });
      setNewContactErrors({});
    }
  };

  const handleEditContactPerson = (idx) => {
    setEditIndex(idx);
    setNewContact(contactPersons[idx]);
    setNewContactErrors({});
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setNewContact({
      salutation: "",
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      workPhone: "",
      mobile: "",
    });
    setNewContactErrors({});
  };

  // Custom GST Treatment dropdown with label bold and description italic
  function GSTTreatmentDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = gstTreatmentOptions.find((opt) => opt.value === value);

    useEffect(() => {
      function handleClick(e) {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      }
      if (open) document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          className="flex items-center justify-between w-full p-2 border rounded bg-white"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={selected?.value ? "text-gray-900" : "text-gray-400"}>
            {selected
              ? (
                <span>
                  <b>{selected.label}</b>
                  <span className="ml-1 italic text-xs text-gray-500">({selected.description})</span>
                </span>
              )
              : "Select GST Treatment"}
          </span>
          <FaChevronDown className="ml-2 text-gray-400" />
        </button>
        {open && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-72 overflow-auto">
            <ul tabIndex={-1} className="max-h-64 overflow-auto">
              {gstTreatmentOptions.map((opt) => (
                <li
                  key={opt.value}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                    value === opt.value ? "bg-blue-100 font-semibold" : ""
                  }`}
                  onClick={() => {
                    onChange({ target: { name: "gstTreatment", value: opt.value } });
                    setOpen(false);
                  }}
                  role="option"
                  aria-selected={value === opt.value}
                >
                  <b>{opt.label}</b>
                  <span className="ml-1 italic text-xs text-gray-500">({opt.description})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg px-8 py-8 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Other Information</h2>
      </div>
      <div className="flex border-b mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-6 py-2 font-medium text-sm border-b-2 transition-colors duration-200
              ${activeTab === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-500"}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {activeTab === "otherDetails" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GST Treatment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Treatment
              </label>
              <GSTTreatmentDropdown
                value={otherDetails.gstTreatment || ""}
                onChange={handleChange}
              />
            </div>
            {/* GSTIN/UIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GSTIN/UIN
              </label>
              <Input
                name="gstinUin"
                value={otherDetails.gstinUin || ""}
                onChange={handleChange}
                placeholder="Enter GSTIN/UIN"
                className="p-2 border rounded w-full"
                maxLength={15}
              />
            </div>
            {/* Business Legal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Legal Name
              </label>
              <Input
                name="businessLegalName"
                value={otherDetails.businessLegalName || ""}
                onChange={handleChange}
                placeholder="Enter Business Legal Name"
                className="p-2 border rounded w-full"
              />
            </div>
            {/* Business Trade Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Trade Name
              </label>
              <Input
                name="businessTradeName"
                value={otherDetails.businessTradeName || ""}
                onChange={handleChange}
                placeholder="Enter Business Trade Name"
                className="p-2 border rounded w-full"
              />
            </div>
            {/* Place of Supply (searchable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Place of Supply
              </label>
              <SearchableDropdown
                options={placeOfSupplyOptions}
                value={otherDetails.placeOfSupply || ""}
                onChange={handleChange}
                placeholder="Select Place of Supply"
                name="placeOfSupply"
              />
            </div>
            {/* Payment Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <select
                name="paymentTerms"
                value={otherDetails.paymentTerms || "NET_30"}
                onChange={handleChange}
                className="p-2 border rounded w-full"
              >
                {paymentTermsOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {/* PAN Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <Input
                name="panNumber"
                value={otherDetails.panNumber || ""}
                onChange={handleChange}
                placeholder="Enter PAN Number"
                className="p-2 border rounded w-full"
              />
            </div>
            {/* Document */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
              <input
                type="file"
                name="document"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleChange}
                className="p-2 border rounded w-full"
                ref={documentInputRef}
              />
              {otherDetails.documentName && (
                <div className="text-xs text-gray-600 mt-1">
                  Uploaded: {otherDetails.documentName}
                </div>
              )}
            </div> */}
            {/* Department */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <Input
                name="department"
                value={otherDetails.department || ""}
                onChange={handleChange}
                placeholder="Enter Department"
                className="p-2 border rounded w-full"
              />
            </div> */}
            {/* Designation */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <Input
                name="designation"
                value={otherDetails.designation || ""}
                onChange={handleChange}
                placeholder="Enter Designation"
                className="p-2 border rounded w-full"
              />
            </div> */}
            {/* Website */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <Input
                name="website"
                value={otherDetails.website || ""}
                onChange={handleChange}
                placeholder="Enter Website"
                className="p-2 border rounded w-full"
              />
            </div> */}
          </div>
        )}
        {/* ...rest of the tabs (contactPersons, address, remarks) remain unchanged */}
        {/* ... */}
        {activeTab === "contactPersons" && (
          <div>
            {/* Contact person form and table */}
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-4 bg-gray-50 p-4 rounded"
              onSubmit={handleAddOrEditContactPerson}
            >
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Salutation</label>
                <select
                  name="salutation"
                  value={newContact.salutation}
                  onChange={handleNewContactChange}
                  className={`p-2 border rounded w-full ${newContactErrors.salutation ? "border-red-500" : ""}`}
                >
                  {salutationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {newContactErrors.salutation && (
                  <div className="text-xs text-red-600">{newContactErrors.salutation}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                <Input
                  name="firstName"
                  value={newContact.firstName}
                  onChange={handleNewContactChange}
                  placeholder="First Name"
                  className={`p-2 border rounded w-full ${newContactErrors.firstName ? "border-red-500" : ""}`}
                />
                {newContactErrors.firstName && (
                  <div className="text-xs text-red-600">{newContactErrors.firstName}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                <Input
                  name="lastName"
                  value={newContact.lastName}
                  onChange={handleNewContactChange}
                  placeholder="Last Name"
                  className={`p-2 border rounded w-full ${newContactErrors.lastName ? "border-red-500" : ""}`}
                />
                {newContactErrors.lastName && (
                  <div className="text-xs text-red-600">{newContactErrors.lastName}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <Input
                  name="email"
                  value={newContact.email}
                  onChange={handleNewContactChange}
                  placeholder="Email"
                  className={`p-2 border rounded w-full ${newContactErrors.email ? "border-red-500" : ""}`}
                  type="email"
                />
                {newContactErrors.email && (
                  <div className="text-xs text-red-600">{newContactErrors.email}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <Input
                  name="address"
                  value={newContact.address}
                  onChange={handleNewContactChange}
                  placeholder="Address"
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Work Phone</label>
                <Input
                  name="workPhone"
                  value={newContact.workPhone}
                  onChange={handleNewContactChange}
                  placeholder="Work Phone"
                  className={`p-2 border rounded w-full ${newContactErrors.workPhone ? "border-red-500" : ""}`}
                  type="tel"
                  maxLength={10}
                />
                {newContactErrors.workPhone && (
                  <div className="text-xs text-red-600">{newContactErrors.workPhone}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mobile</label>
                <Input
                  name="mobile"
                  value={newContact.mobile}
                  onChange={handleNewContactChange}
                  placeholder="Mobile"
                  className={`p-2 border rounded w-full ${newContactErrors.mobile ? "border-red-500" : ""}`}
                  type="tel"
                  maxLength={10}
                />
                {newContactErrors.mobile && (
                  <div className="text-xs text-red-600">{newContactErrors.mobile}</div>
                )}
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end mt-2">
                <button
                  type="submit"
                  className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
                    editIndex !== null
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {editIndex !== null ? <FaCheck /> : <FaPlus />}
                  {editIndex !== null ? "Update" : "Add"}
                </button>
                {editIndex !== null && (
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
                    onClick={handleCancelEdit}
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </form>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 border text-left font-semibold">Salutation</th>
                    <th className="px-3 py-2 border text-left font-semibold">First Name</th>
                    <th className="px-3 py-2 border text-left font-semibold">Last Name</th>
                    <th className="px-3 py-2 border text-left font-semibold">Email</th>
                    <th className="px-3 py-2 border text-left font-semibold">Address</th>
                    <th className="px-3 py-2 border text-left font-semibold">Work Phone</th>
                    <th className="px-3 py-2 border text-left font-semibold">Mobile</th>
                    <th className="px-3 py-2 border text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contactPersons.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-gray-500">
                        No contact persons added.
                      </td>
                    </tr>
                  ) : (
                    contactPersons.map((person, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 border">{person.salutation}</td>
                        <td className="px-3 py-2 border">{person.firstName}</td>
                        <td className="px-3 py-2 border">{person.lastName}</td>
                        <td className="px-3 py-2 border">{person.email}</td>
                        <td className="px-3 py-2 border">{person.address}</td>
                        <td className="px-3 py-2 border">{person.workPhone}</td>
                        <td className="px-3 py-2 border">{person.mobile}</td>
                        <td className="px-3 py-2 border text-center flex gap-2 justify-center">
                          <button
                            className="text-yellow-600 hover:text-yellow-800"
                            onClick={() => handleEditContactPerson(idx)}
                            title="Edit"
                            type="button"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveContactPerson(idx)}
                            title="Remove"
                            type="button"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "address" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" onBlur={handleAddressBlur}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attention<span className="text-red-500">*</span>
              </label>
              <Input
                name="attention"
                value={otherDetails.attention || ""}
                onChange={handleChange}
                placeholder="Enter Attention"
                className={`p-2 border rounded w-full ${addressErrors.attention ? "border-red-500" : ""}`}
              />
              {addressErrors.attention && (
                <div className="text-xs text-red-600 mt-1">{addressErrors.attention}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country/Region<span className="text-red-500">*</span>
              </label>
              <select
                name="country"
                value={otherDetails.country || ""}
                onChange={handleChange}
                className={`p-2 border rounded w-full ${addressErrors.country ? "border-red-500" : ""}`}
              >
                {countryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {addressErrors.country && (
                <div className="text-xs text-red-600 mt-1">{addressErrors.country}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address<span className="text-red-500">*</span>
              </label>
              <Textarea
                name="address"
                value={otherDetails.address || ""}
                onChange={handleChange}
                placeholder="Enter Address"
                className={`p-2 border rounded w-full ${addressErrors.address ? "border-red-500" : ""}`}
              />
              {addressErrors.address && (
                <div className="text-xs text-red-600 mt-1">{addressErrors.address}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City<span className="text-red-500">*</span>
              </label>
              <Input
                name="city"
                value={otherDetails.city || ""}
                onChange={handleChange}
                placeholder="Enter City"
                className={`p-2 border rounded w-full ${addressErrors.city ? "border-red-500" : ""}`}
              />
              {addressErrors.city && (
                <div className="text-xs text-red-600 mt-1">{addressErrors.city}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State<span className="text-red-500">*</span>
              </label>
              <select
                name="state"
                value={otherDetails.state || ""}
                onChange={handleChange}
                className={`p-2 border rounded w-full ${addressErrors.state ? "border-red-500" : ""}`}
              >
                {stateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {addressErrors.state && (
                <div className="text-xs text-red-600 mt-1">{addressErrors.state}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pin Code<span className="text-red-500">*</span>
              </label>
              <Input
                name="pinCode"
                value={otherDetails.pinCode || ""}
                onChange={handleChange}
                placeholder="Enter 6 digit Pin Code"
                className={`p-2 border rounded w-full ${addressErrors.pinCode ? "border-red-500" : ""}`}
                maxLength={6}
                pattern="\d{6}"
              />
              {addressErrors.pinCode && (
                <div className="text-xs text-red-600 mt-1">{addressErrors.pinCode}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone<span className="text-red-500">*</span>
              </label>
              <Input
                name="phone"
                value={otherDetails.phone || ""}
                onChange={handleChange}
                placeholder="10 digit phone number"
                className={`p-2 border rounded w-full ${addressErrors.phone ? "border-red-500" : ""}`}
                maxLength={10}
                pattern="[6-9][0-9]{9}"
              />
              {addressErrors.phone && (
                <div className="text-xs text-red-600 mt-1">{addressErrors.phone}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fax Number</label>
              <Input
                name="faxNumber"
                value={otherDetails.faxNumber || ""}
                onChange={handleChange}
                placeholder="Fax Number (6-15 digits)"
                className={`p-2 border rounded w-full ${addressErrors.faxNumber ? "border-red-500" : ""}`}
                maxLength={15}
                pattern="\d{6,15}"
              />
              {addressErrors.faxNumber && (
                <div className="text-xs text-red-600 mt-1">{addressErrors.faxNumber}</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "remarks" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <Textarea
              name="remarks"
              value={otherDetails.remarks || ""}
              onChange={handleChange}
              placeholder="Enter any remarks"
              className="p-2 border rounded w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddCustomerForm() {
  const [customer, setCustomer] = useState({
    company: "",
    displayName: "",
    primarySuffix: "Mr.",
    primaryName: "",
    currency: "INR",
    email: "",
    phone: "",
  });

  const [customerErrors, setCustomerErrors] = useState({
    primaryName: "",
    email: "",
    phone: "",
  });

  const [invoiceData, setInvoiceData] = useState({});
  const [otherDetails, setOtherDetails] = useState({});
  const [addressErrors, setAddressErrors] = useState({});
  const [contactPersons, setContactPersons] = useState([]);
  const documentInputRef = useRef(null);

  // GST Modal State
  const [gstNumber, setGstNumber] = useState("");
  const [gstModalOpen, setGstModalOpen] = useState(false);
  const [gstDetails, setGstDetails] = useState(null);

  // Simulate GST fetch (replace with real API if available)
  const fetchGstDetails = async (gstin) => {
    // Simulate API delay
    await new Promise((res) => setTimeout(res, 700));
    // Mocked GST details (replace with real API response)
    if (gstin === "29ABCDE1234F2Z5") {
      return {
        gstin: "29ABCDE1234F2Z5",
        legalName: "ABC Pvt Ltd",
        tradeName: "ABC Trading",
        address: "123, MG Road, Bengaluru, Karnataka",
        state: "Karnataka",
        pinCode: "560001",
        status: "Active",
        // Additional mock fields for autofill
        panNumber: "ABCDE1234F",
        attention: "Accounts Manager",
        city: "Bengaluru",
        country: "India",
      };
    }
    // For demo, any 15-char GSTIN returns a generic mock
    if (gstin.length === 15) {
      return {
        gstin,
        legalName: "Demo Company Pvt Ltd",
        tradeName: "Demo Trade",
        address: "456, Demo Street, Mumbai, Maharashtra",
        state: "Maharashtra",
        pinCode: "400001",
        status: "Active",
        panNumber: "DEMO1234P",
        attention: "Finance Head",
        city: "Mumbai",
        country: "India",
      };
    }
    return null;
  };

  const handleGstCheck = async () => {
    if (!gstNumber || gstNumber.length !== 15) {
      alert("Please enter a valid 15-character GST Number.");
      return;
    }
    setGstDetails(null);
    setGstModalOpen(true);
    const details = await fetchGstDetails(gstNumber);
    setGstDetails(details);
  };

  // Enhanced GST Prefill: autofill country, GSTIN/UIN, business legal name, PAN number, attention, city, etc.
  const handleGstPrefill = (details) => {
    if (!details) return;
    setCustomer((prev) => ({
      ...prev,
      company: details.legalName || prev.company,
      displayName: details.tradeName || prev.displayName,
    }));
    setOtherDetails((prev) => ({
      ...prev,
      gstNumber: details.gstin,
      gstinUin: details.gstin,
      businessLegalName: details.legalName || prev.businessLegalName,
      businessTradeName: details.tradeName || prev.businessTradeName,
      panNumber: details.panNumber || prev.panNumber,
      attention: details.attention || prev.attention,
      address: details.address || prev.address,
      city: details.city || prev.city,
      state: details.state || prev.state,
      pinCode: details.pinCode || prev.pinCode,
      country: details.country || prev.country || "India",
    }));
    setGstNumber(details.gstin); // Also update the GST field at the top
    setGstModalOpen(false);
  };

  const isFormValid = () => {
    const customerValidation = validateCustomerFields(customer);
    const addressValidation = validateAddressFields(otherDetails);
    return (
      Object.keys(customerValidation).length === 0 &&
      Object.keys(addressValidation).length === 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customerValidation = validateCustomerFields(customer);
    const addressValidation = validateAddressFields(otherDetails);

    setCustomerErrors(customerValidation);
    setAddressErrors(addressValidation);

    if (
      Object.keys(customerValidation).length > 0 ||
      Object.keys(addressValidation).length > 0
    ) {
      alert("Please fill all required fields correctly before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("customer", JSON.stringify(customer));
      formData.append("otherDetails", JSON.stringify(otherDetails));
      formData.append("contactPersons", JSON.stringify(contactPersons));
      formData.append("invoiceData", JSON.stringify(invoiceData));
      if (otherDetails.document) {
        formData.append("document", otherDetails.document);
      }

      const res = await fetch("/api/customer", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("Invoice saved successfully!");
        handleCancel();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to save invoice.");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setCustomer({
      company: "",
      displayName: "",
      primarySuffix: "Mr.",
      primaryName: "",
      currency: "INR",
      email: "",
      phone: "",
    });
    setCustomerErrors({ primaryName: "", email: "", phone: "" });
    setOtherDetails({});
    setInvoiceData({});
    setAddressErrors({});
    setContactPersons([]);
    setGstNumber("");
    setGstDetails(null);
    if (documentInputRef.current) documentInputRef.current.value = '';
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#F7F8FA] min-h-screen">
      <CustomerForm
        customer={customer}
        setCustomer={setCustomer}
        customerErrors={customerErrors}
        setCustomerErrors={setCustomerErrors}
        gstNumber={gstNumber}
        setGstNumber={setGstNumber}
        onGstCheck={handleGstCheck}
      />
      <InvoiceOtherDetails
        otherDetails={otherDetails}
        setOtherDetails={setOtherDetails}
        addressErrors={addressErrors}
        setAddressErrors={setAddressErrors}
        contactPersons={contactPersons}
        setContactPersons={setContactPersons}
        documentInputRef={documentInputRef}
      />
      <div className="flex gap-2 justify-end mt-6 p-4">
        <button
          className={`px-4 py-2 text-white text-sm rounded hover:bg-blue-600 ${
            isFormValid() ? "bg-blue-500" : "bg-blue-300 cursor-not-allowed"
          }`}
          onClick={handleSubmit}
          type="button"
          disabled={!isFormValid()}
        >
          Add
        </button>
        <button
          className="px-4 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
          onClick={handleCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 ml-2"
          type="button"
        >
          Print Invoice
        </button>
      </div>
      <GSTModal
        open={gstModalOpen}
        onClose={() => setGstModalOpen(false)}
        gstDetails={gstDetails}
        onPrefill={handleGstPrefill}
      />
    </div>
  );
}