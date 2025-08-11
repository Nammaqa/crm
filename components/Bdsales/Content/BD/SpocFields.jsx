import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";

// Helper functions for live input restriction
function allowAlpha(value) {
  return value.replace(/[^a-zA-Z\s]/g, "");
}
function allowEmail(value) {
  // Allow anything, but you may restrict spaces
  return value.replace(/\s/g, "");
}
function allowPhone(value) {
  // Only allow digits, max 10
  return value.replace(/[^0-9]/g, "").slice(0, 10);
}

function isTenDigits(value) {
  return /^\d{10}$/.test(value);
}

export default function SpocFields({ spocs, setSpocs, max = 5, errors = [], setErrors }) {
  // Ensure errors array is always in sync with spocs
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
    // eslint-disable-next-line
  }, [spocs.length]);

  const updateSpoc = (index, field, value) => {
    const updated = [...spocs];
    updated[index][field] = value;
    setSpocs(updated);
  };

  const updateError = (index, field, message) => {
    if (!setErrors) return;
    const updatedErrors = errors.length === spocs.length
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
    updateError(index, "name", "");
  };

  const handleEmailChange = (index, value) => {
    updateSpoc(index, "email", allowEmail(value));
    updateError(index, "email", "");
  };

  const handleContactChange = (index, value) => {
    let cleaned = allowPhone(value);
    if (cleaned.length === 1 && !/[6789]/.test(cleaned)) {
      cleaned = "";
    }
    updateSpoc(index, "contact", cleaned);

    // Validation: must be exactly 10 digits
    if (cleaned.length === 0) {
      updateError(index, "contact", "Contact Number is required.");
    } else if (cleaned.length < 10) {
      updateError(index, "contact", "Contact Number must be exactly 10 digits.");
    } else if (!isTenDigits(cleaned)) {
      updateError(index, "contact", "Contact Number must be exactly 10 digits.");
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

    // Validation: must be exactly 10 digits if not empty
    if (cleaned.length === 0) {
      updateError(index, "altContact", "");
    } else if (cleaned.length < 10) {
      updateError(index, "altContact", "Alt Contact Number must be exactly 10 digits.");
    } else if (!isTenDigits(cleaned)) {
      updateError(index, "altContact", "Alt Contact Number must be exactly 10 digits.");
    } else {
      updateError(index, "altContact", "");
    }
  };

  const handleDesignationChange = (index, value) => {
    updateSpoc(index, "designation", allowAlpha(value));
    updateError(index, "designation", "");
  };

  const handleLocationChange = (index, value) => {
    updateSpoc(index, "location", allowAlpha(value));
    updateError(index, "location", "");
  };

  const addSpoc = () => {
    if (spocs.length < max) {
      setSpocs([
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
    setSpocs(spocs.filter((s) => s.id !== id));
    if (setErrors) {
      setErrors(errors.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="overflow-hidden">
      {spocs.map((spoc, index) => (
        <div key={spoc.id} className="bg-white p-4 rounded-md shadow-sm mt-2 space-y-2">
          <Input
            placeholder="Name"
            value={spoc.name}
            onChange={(e) => handleNameChange(index, e.target.value)}
            required
          />
          {errors && errors[index] && errors[index].name && (
            <span className="text-red-500 text-xs">{errors[index].name}</span>
          )}

          <Input
            type="email"
            placeholder="Email ID"
            value={spoc.email}
            onChange={(e) => handleEmailChange(index, e.target.value)}
            required
          />
          {errors && errors[index] && errors[index].email && (
            <span className="text-red-500 text-xs">{errors[index].email}</span>
          )}

          <Input
            placeholder="Contact Number"
            value={spoc.contact}
            onChange={(e) => handleContactChange(index, e.target.value)}
            required
            minLength={10}
            maxLength={10}
          />
          {errors && errors[index] && errors[index].contact && (
            <span className="text-red-500 text-xs">{errors[index].contact}</span>
          )}

          <Input
            placeholder="Alt Contact Number"
            value={spoc.altContact}
            onChange={(e) => handleAltContactChange(index, e.target.value)}
            maxLength={10}
          />
          {errors && errors[index] && errors[index].altContact && (
            <span className="text-red-500 text-xs">{errors[index].altContact}</span>
          )}

          <Input
            placeholder="Designation"
            value={spoc.designation}
            onChange={(e) => handleDesignationChange(index, e.target.value)}
          />
          {errors && errors[index] && errors[index].designation && (
            <span className="text-red-500 text-xs">{errors[index].designation}</span>
          )}

          <Input
            placeholder="Location"
            value={spoc.location}
            onChange={(e) => handleLocationChange(index, e.target.value)}
          />
          {errors && errors[index] && errors[index].location && (
            <span className="text-red-500 text-xs">{errors[index].location}</span>
          )}

          {spocs.length > 1 && (
            <Button variant="destructive" size="sm" onClick={() => removeSpoc(spoc.id)}>
              Remove SPOC
            </Button>
          )}
        </div>
      ))}
      {spocs.length < max && (
        <Button className="mt-2" onClick={addSpoc}>
          Add SPOC
        </Button>
      )}
    </div>
  );
}