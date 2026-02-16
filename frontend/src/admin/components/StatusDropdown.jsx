import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const StatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const statuses = [
    { label: "Processing", color: "text-gray-500" },
    { label: "Shipped", color: "text-amber-500" },
    { label: "Delivered", color: "text-green-600" },
    { label: "Cancelled", color: "text-red-500" },
  ];

  const current = statuses.find((s) => s.label === value);

  return (
    <div className="relative w-40">
      {/* Selected Value */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 border rounded-lg shadow-sm bg-white hover:bg-gray-50"
      >
        <span className={`capitalize font-medium ${current?.color}`}>
          {current?.label || "Select"}
        </span>
        <FiChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-20">
          {statuses.map((status) => (
            <div
              key={status.label}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => {
                onChange(status.label);
                setOpen(false);
              }}
            >
              <span className={`capitalize ${status.color} font-medium`}>
                {status.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
