"use client";

import { useState } from "react";

export function ScreenshotModal({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="link-btn" type="button" onClick={() => setOpen(true)}>
        View
      </button>
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Screenshot</h3>
              <button className="modal-close" type="button" onClick={() => setOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Order screenshot"
                style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8 }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
