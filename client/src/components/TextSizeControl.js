import React, { useState, useEffect } from 'react';
import { FaTextHeight, FaPalette, FaTimes } from 'react-icons/fa';
import { useTheme, THEMES } from '../context/ThemeContext';
import './TextSizeControl.css';

const TextSizeControl = () => {
  const { theme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState(() => {
    const saved = localStorage.getItem('textSize');
    return saved || 'medium';
  });
  const [fontFamily, setFontFamily] = useState(() => {
    const saved = localStorage.getItem('fontFamily');
    return saved || 'default';
  });
  const [lineHeight, setLineHeight] = useState(() => {
    const saved = localStorage.getItem('lineHeight');
    return saved || 'normal';
  });
  const [alertColor, setAlertColor] = useState(() => {
    const saved = localStorage.getItem('alertColor');
    return saved || 'blue';
  });
  const [warningColor, setWarningColor] = useState(() => {
    const saved = localStorage.getItem('warningColor');
    return saved || 'orange';
  });

  useEffect(() => {
    // Apply text size
    const root = document.documentElement;
    const sizes = {
      small: { base: '13px', heading: '18px', small: '11px' },
      medium: { base: '14px', heading: '20px', small: '12px' },
      large: { base: '16px', heading: '24px', small: '14px' },
      xlarge: { base: '18px', heading: '28px', small: '16px' }
    };
    
    const size = sizes[textSize] || sizes.medium;
    root.style.setProperty('--base-font-size', size.base);
    root.style.setProperty('--heading-font-size', size.heading);
    root.style.setProperty('--small-font-size', size.small);
    
    // Apply font family
    const families = {
      default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'Georgia, "Times New Roman", Times, serif',
      mono: '"Courier New", Courier, monospace',
      rounded: '"Comic Sans MS", "Trebuchet MS", sans-serif'
    };
    root.style.setProperty('--font-family', families[fontFamily] || families.default);
    
    // Apply line height
    const heights = {
      tight: '1.3',
      normal: '1.5',
      relaxed: '1.7',
      loose: '2.0'
    };
    root.style.setProperty('--line-height', heights[lineHeight] || heights.normal);
    
    // Apply alert colors
    const alertColors = {
      blue: { start: '#3b82f6', end: '#2563eb' },
      green: { start: '#10b981', end: '#059669' },
      purple: { start: '#8b5cf6', end: '#7c3aed' },
      teal: { start: '#14b8a6', end: '#0d9488' },
      indigo: { start: '#6366f1', end: '#4f46e5' }
    };
    
    const warningColors = {
      orange: { start: '#f97316', end: '#ea580c' },
      amber: { start: '#f59e0b', end: '#d97706' },
      yellow: { start: '#eab308', end: '#ca8a04' },
      red: { start: '#ef4444', end: '#dc2626' },
      pink: { start: '#ec4899', end: '#db2777' }
    };
    
    const alert = alertColors[alertColor] || alertColors.blue;
    const warning = warningColors[warningColor] || warningColors.orange;
    
    root.style.setProperty('--alert-color-start', alert.start);
    root.style.setProperty('--alert-color-end', alert.end);
    root.style.setProperty('--warning-color-start', warning.start);
    root.style.setProperty('--warning-color-end', warning.end);
    
    // Save to localStorage
    localStorage.setItem('textSize', textSize);
    localStorage.setItem('fontFamily', fontFamily);
    localStorage.setItem('lineHeight', lineHeight);
    localStorage.setItem('alertColor', alertColor);
    localStorage.setItem('warningColor', warningColor);
  }, [textSize, fontFamily, lineHeight, alertColor, warningColor]);

  const resetToDefaults = () => {
    setTextSize('medium');
    setFontFamily('default');
    setLineHeight('normal');
    setAlertColor('blue');
    setWarningColor('orange');
  };

  return (
    <>
      <button
        className="text-size-control-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Text Size & Design Settings"
        aria-label="Text Size & Design Settings"
      >
        <FaTextHeight />
      </button>
      
      {isOpen && (
        <div className="text-size-control-panel">
          <div className="text-size-control-header">
            <h3>
              <FaPalette style={{ marginRight: '8px' }} />
              Appearance & Design
            </h3>
            <button
              className="text-size-control-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="text-size-control-content">
            <div className="text-size-control-section">
              <label>Color Theme</label>
              <div className="theme-grid">
                {Object.entries(availableThemes).map(([key, themeData]) => (
                  <button
                    key={key}
                    className={`theme-option ${theme === key ? 'active' : ''}`}
                    onClick={() => setTheme(key)}
                    style={{
                      background: `linear-gradient(135deg, ${themeData.colors.bgPrimary} 0%, ${themeData.colors.bgSecondary} 100%)`,
                      border: `2px solid ${theme === key ? themeData.colors.borderColor : 'transparent'}`,
                      color: themeData.colors.textPrimary
                    }}
                    title={themeData.name}
                  >
                    <div className="theme-preview" style={{ background: themeData.colors.bgPrimary, borderColor: themeData.colors.borderColor }}>
                      <div className="theme-preview-dot" style={{ background: themeData.colors.textPrimary }}></div>
                      <div className="theme-preview-dot" style={{ background: themeData.colors.textSecondary }}></div>
                    </div>
                    <span>{themeData.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-size-control-section">
              <label>Text Size</label>
              <div className="text-size-options">
                {['small', 'medium', 'large', 'xlarge'].map(size => (
                  <button
                    key={size}
                    className={`text-size-option ${textSize === size ? 'active' : ''}`}
                    onClick={() => setTextSize(size)}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-size-control-section">
              <label>Font Family</label>
              <div className="text-size-options">
                {[
                  { value: 'default', label: 'Default' },
                  { value: 'serif', label: 'Serif' },
                  { value: 'mono', label: 'Monospace' },
                  { value: 'rounded', label: 'Rounded' }
                ].map(font => (
                  <button
                    key={font.value}
                    className={`text-size-option ${fontFamily === font.value ? 'active' : ''}`}
                    onClick={() => setFontFamily(font.value)}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-size-control-section">
              <label>Line Height</label>
              <div className="text-size-options">
                {[
                  { value: 'tight', label: 'Tight' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'relaxed', label: 'Relaxed' },
                  { value: 'loose', label: 'Loose' }
                ].map(height => (
                  <button
                    key={height.value}
                    className={`text-size-option ${lineHeight === height.value ? 'active' : ''}`}
                    onClick={() => setLineHeight(height.value)}
                  >
                    {height.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-size-control-section">
              <label>Alert Color (Info/Reminders)</label>
              <div className="text-size-options">
                {[
                  { value: 'blue', label: 'Blue' },
                  { value: 'green', label: 'Green' },
                  { value: 'purple', label: 'Purple' },
                  { value: 'teal', label: 'Teal' },
                  { value: 'indigo', label: 'Indigo' }
                ].map(color => (
                  <button
                    key={color.value}
                    className={`text-size-option ${alertColor === color.value ? 'active' : ''}`}
                    onClick={() => setAlertColor(color.value)}
                  >
                    {color.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-size-control-section">
              <label>Warning Color (Upcoming Payments)</label>
              <div className="text-size-options">
                {[
                  { value: 'orange', label: 'Orange' },
                  { value: 'amber', label: 'Amber' },
                  { value: 'yellow', label: 'Yellow' },
                  { value: 'red', label: 'Red' },
                  { value: 'pink', label: 'Pink' }
                ].map(color => (
                  <button
                    key={color.value}
                    className={`text-size-option ${warningColor === color.value ? 'active' : ''}`}
                    onClick={() => setWarningColor(color.value)}
                  >
                    {color.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-size-control-actions">
              <button
                className="text-size-reset-btn"
                onClick={resetToDefaults}
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isOpen && (
        <div
          className="text-size-control-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default TextSizeControl;

