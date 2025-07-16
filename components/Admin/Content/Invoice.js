import React, { useState, useRef } from "react";
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
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
  { value: "DUE_END_OF_MONTH", label: "Due End of Month" },
  { value: "DUE_END_OF_NEXT_MONTH", label: "Due End of Next Month" },
];

// Validation functions
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

// Customer Form
function CustomerForm({ customer, setCustomer, customerErrors, setCustomerErrors }) {
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "email") {
      setCustomerErrors((prev) => ({
        ...prev,
        email: !value.includes("@") ? "Email must contain '@'" : "",
      }));
    }
    if (name === "phone") {
      setCustomerErrors((prev) => ({
        ...prev,
        phone: !/^[6-9]\d{9}$/.test(value) ? "Phone must be 10 digits and start with 6, 7, 8, or 9" : "",
      }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg px-8 py-8 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">New Customer</h2>
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
          <Input
            name="displayName"
            value={customer.displayName}
            onChange={handleCustomerChange}
            placeholder="Display Name"
            className="p-2 border rounded w-full"
          />
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

// Other Details, Address, Contact Persons Tabs
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
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
            <div>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <Input
                name="department"
                value={otherDetails.department || ""}
                onChange={handleChange}
                placeholder="Enter Department"
                className="p-2 border rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <Input
                name="designation"
                value={otherDetails.designation || ""}
                onChange={handleChange}
                placeholder="Enter Designation"
                className="p-2 border rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <Input
                name="website"
                value={otherDetails.website || ""}
                onChange={handleChange}
                placeholder="Enter Website"
                className="p-2 border rounded w-full"
              />
            </div>
          </div>
        )}

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

export default function InvoiceForm() {
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
    </div>
  );
}