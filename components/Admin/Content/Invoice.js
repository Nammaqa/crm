"use client"
import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaSearch, FaChevronDown, FaCopy } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Tab and dropdown options (keeping all existing options unchanged)
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

// SearchableDropdown component
function SearchableDropdown({ options, value, onChange, placeholder, name }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const filtered = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.value.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-between w-full p-2 border rounded bg-white text-sm"
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
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
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
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm ${
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

// Validation functions (keeping all existing validation functions unchanged)
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

// Updated GST Modal Component with blur background and top positioning
function GSTModal({ open, onClose, gstDetails, onPrefill }) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto mt-16 transform transition-all duration-300 ease-in-out"
        style={{
          animation: open ? 'fadeInScale 0.3s ease-out' : 'fadeOutScale 0.3s ease-in'
        }}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          <FaTimes size={18} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800 pr-8">GST Details</h2>
        
        {gstDetails ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold text-gray-700">GSTIN:</span>
                <div className="text-gray-900 mt-1">{gstDetails.gstin}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold text-gray-700">Legal Name:</span>
                <div className="text-gray-900 mt-1">{gstDetails.legalName}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold text-gray-700">Trade Name:</span>
                <div className="text-gray-900 mt-1">{gstDetails.tradeName}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold text-gray-700">Status:</span>
                <div className="text-gray-900 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    gstDetails.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {gstDetails.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold text-gray-700">Address:</span>
              <div className="text-gray-900 mt-1">{gstDetails.address}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold text-gray-700">State:</span>
                <div className="text-gray-900 mt-1">{gstDetails.state}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold text-gray-700">Pin Code:</span>
                <div className="text-gray-900 mt-1">{gstDetails.pinCode}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-red-600 text-lg font-medium">GST details not found or invalid GSTIN.</div>
            <div className="text-gray-500 text-sm mt-2">Please check the GSTIN and try again.</div>
          </div>
        )}
        
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
          <button
            className={`px-6 py-2 rounded-lg text-white transition-all duration-200 text-sm font-medium ${
              gstDetails 
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            onClick={() => onPrefill(gstDetails)}
            disabled={!gstDetails}
          >
            Prefill Details
          </button>
          <button
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm font-medium hover:shadow-lg transform hover:scale-105"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes fadeOutScale {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}

// CustomerForm component
function CustomerForm({ customer, setCustomer, customerErrors, setCustomerErrors, gstNumber, setGstNumber, onGstCheck }) {
  const displayNameOptions = [
    customer.primaryName?.trim() ? customer.primaryName : null,
    customer.company?.trim() ? customer.company : null,
  ].filter(Boolean);

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
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">New Customer</h2>
      
      <div className="mb-8 flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
          <Input
            name="gstNumber"
            value={gstNumber}
            onChange={e => setGstNumber(e.target.value.toUpperCase())}
            placeholder="Enter GST Number"
            className="p-3 border rounded w-full text-sm"
            maxLength={15}
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap w-full sm:w-auto justify-center"
          onClick={onGstCheck}
          disabled={!gstNumber || gstNumber.length !== 15}
          title="Check GST Details"
        >
          <FaSearch /> Check
        </button>
      </div>
      
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact</label>
          <div className="flex gap-3">
            <select
              name="primarySuffix"
              value={customer.primarySuffix}
              onChange={handleCustomerChange}
              className="p-3 border rounded text-sm"
              style={{ minWidth: "100px" }}
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
              className="p-3 border rounded w-full text-sm"
            />
          </div>
          {customerErrors.primaryName && (
            <div className="text-sm text-red-600 mt-2">{customerErrors.primaryName}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
          <Input
            name="company"
            value={customer.company}
            onChange={handleCustomerChange}
            placeholder="Company Name"
            className="p-3 border rounded w-full text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
          <select
            name="displayName"
            value={customer.displayName}
            onChange={handleCustomerChange}
            className="p-3 border rounded w-full text-sm"
          >
            <option value="">Select Display Name</option>
            {displayNameOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            name="currency"
            value={customer.currency}
            onChange={handleCustomerChange}
            className="p-3 border rounded w-full text-sm"
          >
            {currencyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email ID</label>
          <Input
            name="email"
            value={customer.email}
            onChange={handleCustomerChange}
            placeholder="Email"
            className={`p-3 border rounded w-full text-sm ${customerErrors.email ? "border-red-500" : ""}`}
            type="email"
          />
          {customerErrors.email && (
            <div className="text-sm text-red-600 mt-2">{customerErrors.email}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <Input
            name="phone"
            value={customer.phone}
            onChange={handleCustomerChange}
            placeholder="10 digit phone number"
            className={`p-3 border rounded w-full text-sm ${customerErrors.phone ? "border-red-500" : ""}`}
            type="tel"
            maxLength={10}
            pattern="[6-9][0-9]{9}"
          />
          {customerErrors.phone && (
            <div className="text-sm text-red-600 mt-2">{customerErrors.phone}</div>
          )}
        </div>
      </form>
    </div>
  );
}

// InvoiceOtherDetails component
function InvoiceOtherDetails({
  otherDetails = {},
  setOtherDetails,
  addressErrors,
  setAddressErrors,
  contactPersons,
  setContactPersons,
}) {
  const [activeTab, setActiveTab] = useState("otherDetails");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(contactPersons.length / itemsPerPage);

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

  const copyBillingToShipping = () => {
    setOtherDetails((prev) => ({
      ...prev,
      shippingAttention: prev.attention || "",
      shippingCountry: prev.country || "",
      shippingAddress: prev.address || "",
      shippingCity: prev.city || "",
      shippingState: prev.state || "",
      shippingPinCode: prev.pinCode || "",
      shippingPhone: prev.phone || "",
      shippingFax: prev.faxNumber || "",
    }));
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
      if ((contactPersons.length + 1) > itemsPerPage * totalPages) {
        setCurrentPage(totalPages + 1);
      }
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
    if ((contactPersons.length - 1) <= itemsPerPage * (currentPage - 1) && currentPage > 1) {
      setCurrentPage(currentPage - 1);
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

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const paginatedContactPersons = contactPersons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          className="flex items-center justify-between w-full p-3 border rounded bg-white text-sm"
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
          <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg max-h-72 overflow-auto">
            <ul tabIndex={-1} className="max-h-64 overflow-auto">
              {gstTreatmentOptions.map((opt) => (
                <li
                  key={opt.value}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm ${
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
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Other Information</h2>
      
      <div className="flex border-b mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-8 py-3 font-medium text-sm border-b-2 transition-colors duration-200 whitespace-nowrap
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
      
      {activeTab === "otherDetails" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST Treatment
            </label>
            <GSTTreatmentDropdown
              value={otherDetails.gstTreatment || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GSTIN/UIN
            </label>
            <Input
              name="gstinUin"
              value={otherDetails.gstinUin || ""}
              onChange={handleChange}
              placeholder="Enter GSTIN/UIN"
              className="p-3 border rounded w-full text-sm"
              maxLength={15}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Legal Name
            </label>
            <Input
              name="businessLegalName"
              value={otherDetails.businessLegalName || ""}
              onChange={handleChange}
              placeholder="Enter Business Legal Name"
              className="p-3 border rounded w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Trade Name
            </label>
            <Input
              name="businessTradeName"
              value={otherDetails.businessTradeName || ""}
              onChange={handleChange}
              placeholder="Enter Business Trade Name"
              className="p-3 border rounded w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Terms
            </label>
            <select
              name="paymentTerms"
              value={otherDetails.paymentTerms || "NET_30"}
              onChange={handleChange}
              className="p-3 border rounded w-full text-sm"
            >
              {paymentTermsOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
            <Input
              name="panNumber"
              value={otherDetails.panNumber || ""}
              onChange={handleChange}
              placeholder="Enter PAN Number"
              className="p-3 border rounded w-full text-sm"
            />
          </div>
        </div>
      )}
      {activeTab === "contactPersons" && (
        <div className="mb-8">
          <form
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end mb-6 bg-gray-50 p-6 rounded-lg"
            onSubmit={handleAddOrEditContactPerson}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salutation</label>
              <select
                name="salutation"
                value={newContact.salutation}
                onChange={handleNewContactChange}
                className={`p-3 border rounded w-full text-sm ${newContactErrors.salutation ? "border-red-500" : ""}`}
              >
                {salutationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {newContactErrors.salutation && (
                <div className="text-sm text-red-600 mt-1">{newContactErrors.salutation}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <Input
                name="firstName"
                value={newContact.firstName}
                onChange={handleNewContactChange}
                placeholder="First Name"
                className={`p-3 border rounded w-full text-sm ${newContactErrors.firstName ? "border-red-500" : ""}`}
              />
              {newContactErrors.firstName && (
                <div className="text-sm text-red-600 mt-1">{newContactErrors.firstName}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <Input
                name="lastName"
                value={newContact.lastName}
                onChange={handleNewContactChange}
                placeholder="Last Name"
                className={`p-3 border rounded w-full text-sm ${newContactErrors.lastName ? "border-red-500" : ""}`}
              />
              {newContactErrors.lastName && (
                <div className="text-sm text-red-600 mt-1">{newContactErrors.lastName}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                name="email"
                value={newContact.email}
                onChange={handleNewContactChange}
                placeholder="Email"
                className={`p-3 border rounded w-full text-sm ${newContactErrors.email ? "border-red-500" : ""}`}
                type="email"
              />
              {newContactErrors.email && (
                <div className="text-sm text-red-600 mt-1">{newContactErrors.email}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <Input
                name="address"
                value={newContact.address}
                onChange={handleNewContactChange}
                placeholder="Address"
                className="p-3 border rounded w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Work Phone</label>
              <Input
                name="workPhone"
                value={newContact.workPhone}
                onChange={handleNewContactChange}
                placeholder="Work Phone"
                className={`p-3 border rounded w-full text-sm ${newContactErrors.workPhone ? "border-red-500" : ""}`}
                type="tel"
                maxLength={10}
              />
              {newContactErrors.workPhone && (
                <div className="text-sm text-red-600 mt-1">{newContactErrors.workPhone}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
              <Input
                name="mobile"
                value={newContact.mobile}
                onChange={handleNewContactChange}
                placeholder="Mobile"
                className={`p-3 border rounded w-full text-sm ${newContactErrors.mobile ? "border-red-500" : ""}`}
                type="tel"
                maxLength={10}
              />
              {newContactErrors.mobile && (
                <div className="text-sm text-red-600 mt-1">{newContactErrors.mobile}</div>
              )}
            </div>
            <div className="xl:col-span-5 flex gap-3 justify-end mt-4">
              <button
                type="submit"
                className={`flex items-center gap-2 px-6 py-3 rounded text-white transition text-sm ${
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
                  className="flex items-center gap-2 px-6 py-3 rounded bg-gray-400 hover:bg-gray-500 text-white text-sm"
                  onClick={handleCancelEdit}
                >
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </form>
          
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 border text-left font-semibold">Salutation</th>
                  <th className="px-4 py-3 border text-left font-semibold">First Name</th>
                  <th className="px-4 py-3 border text-left font-semibold">Last Name</th>
                  <th className="px-4 py-3 border text-left font-semibold">Email</th>
                  <th className="px-4 py-3 border text-left font-semibold">Address</th>
                  <th className="px-4 py-3 border text-left font-semibold">Work Phone</th>
                  <th className="px-4 py-3 border text-left font-semibold">Mobile</th>
                  <th className="px-4 py-3 border text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {contactPersons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500">
                      No contact persons added.
                    </td>
                  </tr>
                ) : (
                  paginatedContactPersons.map((person, idx) => {
                    const actualIdx = (currentPage - 1) * itemsPerPage + idx;
                    return (
                      <tr key={actualIdx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 border">{person.salutation}</td>
                        <td className="px-4 py-3 border">{person.firstName}</td>
                        <td className="px-4 py-3 border">{person.lastName}</td>
                        <td className="px-4 py-3 border">{person.email}</td>
                        <td className="px-4 py-3 border">{person.address}</td>
                        <td className="px-4 py-3 border">{person.workPhone}</td>
                        <td className="px-4 py-3 border">{person.mobile}</td>
                        <td className="px-4 py-3 border text-center flex gap-2 justify-center">
                          <button
                            className="text-yellow-600 hover:text-yellow-800"
                            onClick={() => handleEditContactPerson(actualIdx)}
                            title="Edit"
                            type="button"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveContactPerson(actualIdx)}
                            title="Remove"
                            type="button"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {contactPersons.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`px-4 py-2 rounded text-sm ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "address" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Billing Address */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Billing Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attention<span className="text-red-500">*</span>
                </label>
                <Input
                  name="attention"
                  value={otherDetails.attention || ""}
                  onChange={handleChange}
                  placeholder="Enter Attention"
                  className={`p-3 border rounded w-full text-sm ${addressErrors.attention ? "border-red-500" : ""}`}
                />
                {addressErrors.attention && (
                  <div className="text-sm text-red-600 mt-1">{addressErrors.attention}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country/Region<span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={otherDetails.country || ""}
                  onChange={handleChange}
                  className={`p-3 border rounded w-full text-sm ${addressErrors.country ? "border-red-500" : ""}`}
                >
                  {countryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {addressErrors.country && (
                  <div className="text-sm text-red-600 mt-1">{addressErrors.country}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address<span className="text-red-500">*</span>
                </label>
                <Textarea
                  name="address"
                  value={otherDetails.address || ""}
                  onChange={handleChange}
                  placeholder="Enter Address"
                  className={`p-3 border rounded w-full text-sm ${addressErrors.address ? "border-red-500" : ""}`}
                />
                {addressErrors.address && (
                  <div className="text-sm text-red-600 mt-1">{addressErrors.address}</div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City<span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="city"
                    value={otherDetails.city || ""}
                    onChange={handleChange}
                    placeholder="Enter City"
                    className={`p-3 border rounded w-full text-sm ${addressErrors.city ? "border-red-500" : ""}`}
                  />
                  {addressErrors.city && (
                    <div className="text-sm text-red-600 mt-1">{addressErrors.city}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={otherDetails.state || ""}
                    onChange={handleChange}
                    className={`p-3 border rounded w-full text-sm ${addressErrors.state ? "border-red-500" : ""}`}
                  >
                    {stateOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {addressErrors.state && (
                    <div className="text-sm text-red-600 mt-1">{addressErrors.state}</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pin Code<span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="pinCode"
                    value={otherDetails.pinCode || ""}
                    onChange={handleChange}
                    placeholder="Enter 6 digit Pin Code"
                    className={`p-3 border rounded w-full text-sm ${addressErrors.pinCode ? "border-red-500" : ""}`}
                    maxLength={6}
                    pattern="\d{6}"
                  />
                  {addressErrors.pinCode && (
                    <div className="text-sm text-red-600 mt-1">{addressErrors.pinCode}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone<span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="phone"
                    value={otherDetails.phone || ""}
                    onChange={handleChange}
                    placeholder="10 digit phone number"
                    className={`p-3 border rounded w-full text-sm ${addressErrors.phone ? "border-red-500" : ""}`}
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                  />
                  {addressErrors.phone && (
                    <div className="text-sm text-red-600 mt-1">{addressErrors.phone}</div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fax Number</label>
                <Input
                  name="faxNumber"
                  value={otherDetails.faxNumber || ""}
                  onChange={handleChange}
                  placeholder="Fax Number (6-15 digits)"
                  className={`p-3 border rounded w-full text-sm ${addressErrors.faxNumber ? "border-red-500" : ""}`}
                  maxLength={15}
                  pattern="\d{6,15}"
                />
                {addressErrors.faxNumber && (
                  <div className="text-sm text-red-600 mt-1">{addressErrors.faxNumber}</div>
                )}
              </div>
            </div>
          </div>
          {/* Shipping Address */}
          <div className="border rounded-lg p-6 bg-blue-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Shipping Address <span className="text-sm text-gray-500">(Optional)</span></h3>
              <button
                type="button"
                onClick={copyBillingToShipping}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                title="Copy from Billing Address"
              >
                <FaCopy size={14} />
                Copy from Billing
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attention</label>
                <Input
                  name="shippingAttention"
                  value={otherDetails.shippingAttention || ""}
                  onChange={handleChange}
                  placeholder="Enter Attention"
                  className="p-3 border rounded w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country/Region</label>
                <select
                  name="shippingCountry"
                  value={otherDetails.shippingCountry || ""}
                  onChange={handleChange}
                  className="p-3 border rounded w-full text-sm"
                >
                  {countryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <Textarea
                  name="shippingAddress"
                  value={otherDetails.shippingAddress || ""}
                  onChange={handleChange}
                  placeholder="Enter Shipping Address"
                  className="p-3 border rounded w-full text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <Input
                    name="shippingCity"
                    value={otherDetails.shippingCity || ""}
                    onChange={handleChange}
                    placeholder="Enter City"
                    className="p-3 border rounded w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    name="shippingState"
                    value={otherDetails.shippingState || ""}
                    onChange={handleChange}
                    className="p-3 border rounded w-full text-sm"
                  >
                    {stateOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pin Code</label>
                  <Input
                    name="shippingPinCode"
                    value={otherDetails.shippingPinCode || ""}
                    onChange={handleChange}
                    placeholder="Enter 6 digit Pin Code"
                    className="p-3 border rounded w-full text-sm"
                    maxLength={6}
                    pattern="\d{6}"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input
                    name="shippingPhone"
                    value={otherDetails.shippingPhone || ""}
                    onChange={handleChange}
                    placeholder="10 digit phone number"
                    className="p-3 border rounded w-full text-sm"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fax Number</label>
                <Input
                  name="shippingFax"
                  value={otherDetails.shippingFax || ""}
                  onChange={handleChange}
                  placeholder="Fax Number (6-15 digits)"
                  className="p-3 border rounded w-full text-sm"
                  maxLength={15}
                  pattern="\d{6,15}"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "remarks" && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
          <Textarea
            name="remarks"
            value={otherDetails.remarks || ""}
            onChange={handleChange}
            placeholder="Enter any remarks"
            className="p-3 border rounded w-full text-sm"
          />
        </div>
      )}
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

  const [gstNumber, setGstNumber] = useState("");
  const [gstModalOpen, setGstModalOpen] = useState(false);
  const [gstDetails, setGstDetails] = useState(null);

  const fetchGstDetails = async (gstin) => {
    await new Promise((res) => setTimeout(res, 700));
    if (gstin === "29ABCDE1234F2Z5") {
      return {
        gstin: "29ABCDE1234F2Z5",
        legalName: "ABC Pvt Ltd",
        tradeName: "ABC Trading",
        address: "123, MG Road, Bengaluru, Karnataka",
        state: "Karnataka",
        pinCode: "560001",
        status: "Active",
        panNumber: "ABCDE1234F",
        attention: "Accounts Manager",
        city: "Bengaluru",
        country: "India",
      };
    }
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
    setGstNumber(details.gstin);
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
        alert("Customer added successfully!");
        handleCancel();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to add customer.");
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
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-4 sm:p-6 lg:p-8">
      <div className="w-full">
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
        />
        
        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8 p-6 bg-white rounded-lg shadow-md">
          <button
            className={`px-8 py-3 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors ${
              isFormValid() ? "bg-blue-500" : "bg-blue-300 cursor-not-allowed"
            }`}
            onClick={handleSubmit}
            type="button"
            disabled={!isFormValid()}
          >
            Add Customer
          </button>
          <button
            className="px-8 py-3 bg-gray-400 text-white text-sm font-medium rounded hover:bg-gray-500 transition-colors"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="px-8 py-3 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
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
    </div>
  );
}
