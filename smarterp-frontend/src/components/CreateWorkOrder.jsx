
import { useState } from "react";
import { createWorkOrder } from "../services/api";

const initialForm = {
  title: "",
  description: "",
  requiredSkill: "Electrical",
  priority: "Medium",
  latitude: "",
  longitude: "",
};

export default function CreateWorkOrder({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (
      form.latitude.trim() === "" ||
      form.longitude.trim() === "" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError("Please enter valid latitude and longitude.");
      return;
    }

    setLoading(true);

    try {
      await createWorkOrder({
        title: form.title.trim(),
        description: form.description.trim(),
        requiredSkill: form.requiredSkill,
        priority: form.priority,
        latitude,
        longitude,
      });

      setForm(initialForm);
      setSuccess("Work order created successfully!");

      await onCreated();
    } catch (err) {
      console.error(err);
      setError("Unable to create work order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="data-section">
      <h2>Create New Work Order</h2>

      <form className="workorder-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Work Order Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Generator Battery Failure"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the maintenance issue"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Required Skill</label>
          <select
            name="requiredSkill"
            value={form.requiredSkill}
            onChange={handleChange}
          >
            <option value="Electrical">Electrical</option>
            <option value="Mechanical">Mechanical</option>
            <option value="IT">IT</option>
            <option value="Plumbing">Plumbing</option>
          </select>
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input
              name="latitude"
              type="number"
              step="any"
              value={form.latitude}
              onChange={handleChange}
              placeholder="6.0535"
              required
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input
              name="longitude"
              type="number"
              step="any"
              value={form.longitude}
              onChange={handleChange}
              placeholder="80.2210"
              required
            />
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button
          type="submit"
          className="create-btn"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Work Order"}
        </button>
      </form>
    </section>
  );
}
