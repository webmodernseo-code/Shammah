"use client";
import { useMemo, useState } from "react";

function normalizeSizes(input) {
  if (!Array.isArray(input) || input.length === 0) return null;
  if (typeof input[0] === "string") return input.map((s) => ({ label: s, value: s }));
  return input
    .map((s) => {
      if (!s) return null;
      const value = s.value ?? s.label;
      const label = s.label ?? s.value;
      return value && label ? { label, value } : null;
    })
    .filter(Boolean);
}

const SizePicker = ({ sizes, activeSize, setActiveSize }) => {
  const fallbackSizes = useMemo(
    () => [
      { label: "S", value: "S" },
      { label: "M", value: "M" },
      { label: "L", value: "L" },
      { label: "XL", value: "XL" },
    ],
    []
  );

  const normalizedSizes = normalizeSizes(sizes) ?? fallbackSizes;
  const [activeSizeDefault, setActiveSizeDefault] = useState(
    normalizedSizes[0]?.value ?? "S"
  );

  const resolvedActiveSize = activeSize ?? activeSizeDefault;
  const currentSizeLabel =
    normalizedSizes.find((s) => s.value === resolvedActiveSize)?.label ??
    resolvedActiveSize;

  const handleSizeClick = (size) => {
    if (setActiveSize) setActiveSize(size.value);
    else setActiveSizeDefault(size.value);
  };

  return (
    <div className="variant-picker-item variant-size">
      <div className="variant-picker-label">
        <div>
          Size:
          <span className="variant-picker-label-value value-currentSize">
            {currentSizeLabel}
          </span>
        </div>
        <a href="#sizeGuide" data-bs-toggle="modal" className="size-guide link">
          Size Guide
        </a>
      </div>
      <div className="variant-picker-values">
        {normalizedSizes.map((size) => (
          <span
            key={size.value}
            className={`size-btn ${
              resolvedActiveSize === size.value ? "active" : ""
            }`}
            data-size={size.value}
            onClick={() => handleSizeClick(size)}
          >
            {size.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SizePicker;
