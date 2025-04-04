// Global state management for clock settings
import { type ClockStyle, type ClockPosition } from "@/components/time";

type ClockSettings = {
  style: ClockStyle;
  position: ClockPosition;
  disableBackground: boolean;
};

// Default settings
const defaultSettings: ClockSettings = {
  style: "digital",
  position: "corner",
  disableBackground: false,
};

// Subscribers to settings changes
const subscribers: Array<(settings: ClockSettings) => void> = [];

// Current settings state
let currentSettings: ClockSettings = { ...defaultSettings };

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize from localStorage (only in browser)
const initializeSettings = () => {
  if (!isBrowser) return;
  
  try {
    const savedStyle = localStorage.getItem("clockStyle");
    const savedPosition = localStorage.getItem("clockPosition");
    const savedDisableBackground = localStorage.getItem("disableClockBackground");

    if (savedStyle && ["digital", "analog", "minimal", "text"].includes(savedStyle)) {
      currentSettings.style = savedStyle as ClockStyle;
    }

    if (savedPosition && ["corner", "center"].includes(savedPosition)) {
      currentSettings.position = savedPosition as ClockPosition;
    }

    if (savedDisableBackground === "true") {
      currentSettings.disableBackground = true;
    }
  } catch (error) {
    console.error("Error accessing localStorage:", error);
  }
};

// Initialize on module load (only in browser)
if (isBrowser) {
  initializeSettings();
}

// Get current settings
export const getClockSettings = (): ClockSettings => {
  return { ...currentSettings };
};

// Update settings
export const updateClockSettings = (settings: Partial<ClockSettings>) => {
  // Update current settings
  currentSettings = { ...currentSettings, ...settings };

  // Save to localStorage (only in browser)
  if (isBrowser) {
    try {
      if (settings.style) {
        localStorage.setItem("clockStyle", settings.style);
      }
      
      if (settings.position) {
        localStorage.setItem("clockPosition", settings.position);
      }
      
      if (settings.disableBackground !== undefined) {
        localStorage.setItem("disableClockBackground", String(settings.disableBackground));
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  // Notify subscribers
  subscribers.forEach(callback => callback(currentSettings));
};

// Reset to defaults
export const resetClockSettings = () => {
  currentSettings = { ...defaultSettings };
  
  // Save to localStorage (only in browser)
  if (isBrowser) {
    try {
      localStorage.setItem("clockStyle", defaultSettings.style);
      localStorage.setItem("clockPosition", defaultSettings.position);
      localStorage.setItem("disableClockBackground", String(defaultSettings.disableBackground));
    } catch (error) {
      console.error("Error resetting localStorage:", error);
    }
  }

  // Notify subscribers
  subscribers.forEach(callback => callback(currentSettings));
};

// Subscribe to settings changes
export const subscribeToClockSettings = (callback: (settings: ClockSettings) => void) => {
  subscribers.push(callback);
  
  // Immediately call with current settings
  callback(currentSettings);
  
  // Return unsubscribe function
  return () => {
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  };
};
