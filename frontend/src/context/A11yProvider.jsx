/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const A11yContext = createContext();

const readStorage = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // no-op when storage is unavailable
  }
};

export function A11yProvider({ children }) {
  const [highContrast, setHighContrast] = useState(
    () => readStorage("a11y_high_contrast") === "true"
  );
  const [reducedMotion, setReducedMotion] = useState(
    () => readStorage("a11y_reduced_motion") === "true"
  );
  const [fontSize, setFontSize] = useState(
    () => Number(readStorage("a11y_font_size")) || 100
  );

  useEffect(() => {
    writeStorage("a11y_high_contrast", highContrast);
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  useEffect(() => {
    writeStorage("a11y_reduced_motion", reducedMotion);
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
  }, [reducedMotion]);

  useEffect(() => {
    writeStorage("a11y_font_size", fontSize);
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  const value = {
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    fontSize,
    setFontSize,
  };

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y() {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error("useA11y must be used within an A11yProvider");
  }
  return context;
}
