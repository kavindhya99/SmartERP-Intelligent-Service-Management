import { useState } from "react";
import {
  getRecommendations,
  assignTechnician,
} from "../services/api";

export default function SmartRecommendations({
  workOrder,
  onAssigned,
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRecommend() {
    setLoading(true);
    setError("");
    setRecommendations([]);

    try {
      const result = await getRecommendations(workOrder.id);
      setRecommendations(result.recommendations);
    } catch {
      setError("Unable to load recommendations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(technicianId) {
    setLoading(true);
    setError("");

    try {
      await assignTechnician(workOrder.id, technicianId);
      setRecommendations([]);
      await onAssigned();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to assign technician."
      );
    } finally {
      setLoading(false);
    }
  }

  if (workOrder.status !== "Pending") {
    return <span>Already assigned</span>;
  }

  return (
    <div className="recommendation-panel">
      <button onClick={handleRecommend} disabled={loading}>
        {loading ? "Loading..." : "Recommend Technician"}
      </button>

      {error && <p className="error">{error}</p>}

      {recommendations.map((tech) => (
        <div className="recommendation-card" key={tech.technicianId}>
          <strong>{tech.technicianName}</strong>

          <p>Match Score: {tech.score}/100</p>
          <p>Distance: {tech.distanceKm} km</p>
          <p>Current Workload: {tech.currentWorkload}</p>

          <button
            onClick={() => handleAssign(tech.technicianId)}
            disabled={loading}
          >
            Assign Technician
          </button>
        </div>
      ))}
    </div>
  );
}