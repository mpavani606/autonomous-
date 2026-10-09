

const StatCard = ({ icon, label, value, subValue }) => (
  <div className="glass-card stat-card">
    <div className="icon-wrap">{icon}</div>
    <div>
      <p className="muted-label">{label}</p>
      <h3>{value}</h3>
      <small>{subValue}</small>
    </div>
  </div>
);

export default StatCard;
