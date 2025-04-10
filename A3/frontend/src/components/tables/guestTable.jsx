import React from 'react';
import './table.css';

function GuestTable({ gridRows }) {
  return (
    <div className="grid-table">
      <div className="guest grid-row header">
        <div className="grid-cell">ID</div>
        <div className="grid-cell">UTORID</div>
        <div className="grid-cell">Name</div>
        <div className="grid-cell">Actions</div>
      </div>
      {gridRows}
    </div>
  );
}

export default GuestTable; 