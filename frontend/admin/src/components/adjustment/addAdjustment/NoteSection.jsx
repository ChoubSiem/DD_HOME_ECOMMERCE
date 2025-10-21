import { Input } from "antd";
import React from "react";

const { TextArea } = Input;

const NoteSection = ({ note = "", setNote }) => {  // Added default value
  const handleChange = (e) => {
    if (setNote) {  // Check if setNote exists
      setNote(e.target.value);
    }
  };

  return (
    <div className="note-section" style={{ marginTop: "0px" }}>
      <h3 style={{ marginBottom: "12px" }}>Note</h3>
      <TextArea
        value={note || ""}  // Double safety
        onChange={handleChange}
        rows={4}
        placeholder="Enter any notes for this adjustment..."
        style={{ borderRadius: "6px" }}
      />
    </div>
  );
};

export default NoteSection;