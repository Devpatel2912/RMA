import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomDropdown({ value, options, onChange, style, disabled, className, prefix }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0] || { label: '' };

  return (
    <div ref={dropdownRef} className={`custom-dropdown ${className || ''} ${disabled ? 'disabled' : ''}`} style={style}>
      <div 
        className="custom-dropdown-header" 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ 
          opacity: disabled ? 0.6 : 1, 
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          borderRadius: '99px',
          padding: '8px 16px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          ...style
        }}
      >
        <span style={{ fontWeight: 600, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {prefix && <span style={{ color: '#64748B', fontWeight: 500 }}>{prefix}</span>}
          {selectedOption.label}
        </span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', opacity: 0.5 }} color="#1F2937" />
      </div>
      {isOpen && !disabled && (
        <div className="custom-dropdown-menu">
          {options.map((opt) => (
            <div 
              key={opt.value} 
              className={`custom-dropdown-item ${opt.value === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
