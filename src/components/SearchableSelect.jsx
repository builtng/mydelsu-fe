import React, { useState, useEffect, useRef } from "react";

/**
 * SearchableSelect - A modern, search-filtered combobox component.
 * Supports arrow keys, Enter, Escape, mouse hover, and focus tracking.
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select option...",
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync selection
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Filter options list
  const filteredOptions = options.filter((opt) =>
    String(opt.label || "").toLowerCase().includes(search.toLowerCase())
  );

  // Clear query on close
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  // Click outside detection
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlight index when filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (filteredOptions.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen && filteredOptions.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex].value);
        setIsOpen(false);
        inputRef.current?.blur();
      } else if (!isOpen) {
        setIsOpen(true);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (opt) => {
    onChange(opt.value);
    setIsOpen(false);
  };

  return (
    <div className="search-select-container" ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        placeholder={selectedOption ? selectedOption.label : placeholder}
        value={isOpen ? search : (selectedOption ? selectedOption.label : "")}
        onChange={(e) => {
          setIsOpen(true);
          setSearch(e.target.value);
        }}
        onFocus={() => {
          if (!disabled) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="search-select-input"
        style={{
          width: "100%",
          padding: "10px 14px",
          border: "1px solid #e6e9ee",
          borderRadius: "8px",
          fontSize: "14.5px",
          background: disabled ? "#f5f7fa" : "#fff",
          color: "#0f172a",
          outline: "none",
          transition: "border-color 0.15s",
          cursor: "pointer",
        }}
      />
      
      <span
        style={{
          position: "absolute",
          right: "14px",
          top: "52%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          opacity: 0.45,
          fontSize: "10px",
          color: "#475569"
        }}
      >
        ▼
      </span>

      {isOpen && !disabled && (
        <ul
          className="search-select-dropdown"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            maxHeight: "200px",
            overflowY: "auto",
            background: "#fff",
            border: "1px solid #e6e9ee",
            borderRadius: "8px",
            marginTop: "4px",
            boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
            zIndex: 99,
            listStyle: "none",
            padding: "4px",
            margin: 0,
          }}
        >
          {filteredOptions.length === 0 ? (
            <li style={{ padding: "10px 12px", color: "#7c8b9c", fontSize: "13.5px" }}>
              No options found
            </li>
          ) : (
            filteredOptions.map((opt, index) => {
              const isSelected = String(opt.value) === String(value);
              const isHighlighted = index === highlightedIndex;
              return (
                <li
                  key={opt.value}
                  onMouseDown={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer",
                    background: isHighlighted ? "#f5f7fa" : "transparent",
                    fontWeight: isSelected ? "bold" : "normal",
                    color: isSelected ? "#5a8abb" : "#475569",
                  }}
                >
                  {opt.label}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
