function GuestTable({gridRows}) {
  return (
    <div className="grid-table guest">
      {/* Header Row */}
      <div className="guest grid-row header">
        <div className="grid-cell">ID</div>
        <div className="grid-cell">utorid</div>
        <div className="grid-cell">Name</div>
      </div>
      {/* Data Rows */}
      {gridRows}
    </div>
  );
}

export default GuestTable;