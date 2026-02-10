import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";

// Helper functions for live input restriction
function allowAlpha(value) {
  return value.replace(/[^a-zA-Z\s]/g, "");
}

function allowEmail(value) {
  return value.replace(/\s/g, "");
}

function allowPhone(value) {
  return value.replace(/[^0-9]/g, "").slice(0, 10);
}

function isTenDigits(value) {
  return /^\d{10}$/.test(value);
}

function isValidPhoneNumber(value) {
  return /^[6789]\d{9}$/.test(value);
}

function isValidEmail(value) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
}

function isAlpha(value) {
  return /^[a-zA-Z\s]+$/.test(value);
}

export default function SpocFields({ 
  spocs, 
  setSpocs, 
  onChange, // Support both props
  max = 5, 
  errors = [], 
  setErrors 
}) {
  // Use onChange if provided, otherwise use setSpocs
  const updateSpocs = onChange || setSpocs;

  useEffect(() => {
    if (setErrors && errors.length !== spocs.length) {
      setErrors(
        spocs.map(() => ({
          name: "",
          email: "",
          contact: "",
          altContact: "",
          designation: "",
          location: "",
        }))
      );
    }
  }, [spocs.length]);

  const updateSpoc = (index, field, value) => {
    const updated = [...spocs];
    updated[index][field] = value;
    updateSpocs(updated);
  };

  const updateError = (index, field, message) => {
    if (!setErrors) return;
    const updatedErrors =
      errors.length === spocs.length
        ? [...errors]
        : spocs.map(() => ({
            name: "",
            email: "",
            contact: "",
            altContact: "",
            designation: "",
            location: "",
          }));
    updatedErrors[index][field] = message;
    setErrors(updatedErrors);
  };

  const handleNameChange = (index, value) => {
    updateSpoc(index, "name", allowAlpha(value));
    
    if (value.length === 0) {
      updateError(index, "name", "Name is required.");
    } else if (!isAlpha(allowAlpha(value))) {
      updateError(index, "name", "Name must contain only alphabets and spaces.");
    } else {
      updateError(index, "name", "");
    }
  };

  const handleEmailChange = (index, value) => {
    const cleaned = allowEmail(value);
    updateSpoc(index, "email", cleaned);
    
    if (cleaned.length === 0) {
      updateError(index, "email", "Email is required.");
    } else if (!isValidEmail(cleaned)) {
      updateError(index, "email", "Please enter a valid email address (e.g., user@example.com).");
    } else {
      updateError(index, "email", "");
    }
  };

  const handleContactChange = (index, value) => {
    let cleaned = allowPhone(value);
    if (cleaned.length === 1 && !/[6789]/.test(cleaned)) {
      cleaned = "";
    }
    updateSpoc(index, "contact", cleaned);

    if (cleaned.length === 0) {
      updateError(index, "contact", "Contact Number is required.");
    } else if (cleaned.length < 10) {
      updateError(index, "contact", `Contact Number must be exactly 10 digits (${cleaned.length}/10).`);
    } else if (!isValidPhoneNumber(cleaned)) {
      updateError(index, "contact", "Contact Number must start with 6, 7, 8, or 9.");
    } else {
      updateError(index, "contact", "");
    }
  };

  const handleAltContactChange = (index, value) => {
    let cleaned = allowPhone(value);
    if (cleaned.length === 1 && !/[6789]/.test(cleaned)) {
      cleaned = "";
    }
    updateSpoc(index, "altContact", cleaned);

    if (cleaned.length === 0) {
      updateError(index, "altContact", "");
    } else if (cleaned.length < 10) {
      updateError(index, "altContact", `Alt Contact Number must be exactly 10 digits (${cleaned.length}/10).`);
    } else if (!isValidPhoneNumber(cleaned)) {
      updateError(index, "altContact", "Alt Contact Number must start with 6, 7, 8, or 9.");
    } else {
      updateError(index, "altContact", "");
    }
  };

  const handleDesignationChange = (index, value) => {
    updateSpoc(index, "designation", allowAlpha(value));
    
    if (value.length > 0 && !isAlpha(allowAlpha(value))) {
      updateError(index, "designation", "Designation must contain only alphabets and spaces.");
    } else {
      updateError(index, "designation", "");
    }
  };

  const handleLocationChange = (index, value) => {
    updateSpoc(index, "location", allowAlpha(value));
    
    if (value.length > 0 && !isAlpha(allowAlpha(value))) {
      updateError(index, "location", "Location must contain only alphabets and spaces.");
    } else {
      updateError(index, "location", "");
    }
  };

  const addSpoc = () => {
    if (spocs.length < max) {
      updateSpocs([
        ...spocs,
        {
          id: spocs.length + 1,
          name: "",
          email: "",
          contact: "",
          altContact: "",
          designation: "",
          location: "",
        },
      ]);
      if (setErrors) {
        setErrors([
          ...errors,
          {
            name: "",
            email: "",
            contact: "",
            altContact: "",
            designation: "",
            location: "",
          },
        ]);
      }
    }
  };

  const removeSpoc = (id) => {
    const idx = spocs.findIndex((s) => s.id === id);
    updateSpocs(spocs.filter((s) => s.id !== id));
    if (setErrors) {
      setErrors(errors.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">SPOCs</h3>
      {spocs.map((spoc, index) => {
        const currentErrors = errors[index] || {};
        return (
          <div
            key={spoc.id}
            className="p-4 border rounded-lg bg-gray-50 space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">SPOC {index + 1}</h4>
              {spocs.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSpoc(spoc.id)}
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={spoc.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder="Enter name (alphabets only)"
                  className={currentErrors.name ? "border-red-500" : ""}
                />
                {currentErrors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {currentErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={spoc.email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="user@example.com"
                  className={currentErrors.email ? "border-red-500" : ""}
                />
                {currentErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {currentErrors.email}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <Input
                  value={spoc.contact}
                  onChange={(e) => handleContactChange(index, e.target.value)}
                  placeholder="10 digits starting with 6/7/8/9"
                  maxLength={10}
                  className={currentErrors.contact ? "border-red-500" : ""}
                />
                {currentErrors.contact && (
                  <p className="text-red-500 text-sm mt-1">
                    {currentErrors.contact}
                  </p>
                )}
              </div>

              {/* Alt Contact */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alternate Contact
                </label>
                <Input
                  value={spoc.altContact}
                  onChange={(e) =>
                    handleAltContactChange(index, e.target.value)
                  }
                  placeholder="10 digits starting with 6/7/8/9"
                  maxLength={10}
                  className={currentErrors.altContact ? "border-red-500" : ""}
                />
                {currentErrors.altContact && (
                  <p className="text-red-500 text-sm mt-1">
                    {currentErrors.altContact}
                  </p>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Designation
                </label>
                <Input
                  value={spoc.designation}
                  onChange={(e) =>
                    handleDesignationChange(index, e.target.value)
                  }
                  placeholder="Enter designation (alphabets only)"
                  className={currentErrors.designation ? "border-red-500" : ""}
                />
                {currentErrors.designation && (
                  <p className="text-red-500 text-sm mt-1">
                    {currentErrors.designation}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <Input
                  value={spoc.location}
                  onChange={(e) => handleLocationChange(index, e.target.value)}
                  placeholder="Enter location (alphabets only)"
                  className={currentErrors.location ? "border-red-500" : ""}
                />
                {currentErrors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {currentErrors.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {spocs.length < max && (
        <Button type="button" onClick={addSpoc} variant="outline">
          + Add SPOC
        </Button>
      )}
    </div>
  );
}
