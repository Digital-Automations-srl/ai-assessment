"use client";

import { useState } from "react";

interface TooltipProps {
  term: string;
  explanation: string;
}

export default function Tooltip({ term, explanation }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="cursor-help border-b border-dashed text-inherit"
        style={{ borderColor: "#016FC0" }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((s) => !s)}
      >
        {term}
      </button>
      {show && (
        <span
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg p-3 text-xs font-normal leading-relaxed shadow-lg"
          style={{
            backgroundColor: "#004172",
            color: "white",
          }}
        >
          {explanation}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #004172",
            }}
          />
        </span>
      )}
    </span>
  );
}
