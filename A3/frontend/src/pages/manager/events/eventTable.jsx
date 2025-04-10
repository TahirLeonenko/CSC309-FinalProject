function EventTable({gridRows}) {
  return (
    <div className="grid-table">
      {/* Header Row */}
      <div className="event grid-row header">
        <div className="grid-cell">ID</div>
        <div className="grid-cell">Name</div>
        <div className="grid-cell">Location</div>
        <div className="grid-cell">Start Time</div>
        <div className="grid-cell">End Time</div>
        <div className="grid-cell">Capacity</div>
        <div className="grid-cell">Guests</div>
        <div className="grid-cell">Published</div>
      </div>
      {/* Data Rows */}
      {gridRows}
    </div>
  );
}

export default EventTable;