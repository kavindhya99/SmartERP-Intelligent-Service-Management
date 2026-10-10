
import { useState } from "react";
import { createTechnician } from "../services/api";

const initialForm = {
  name: "",
  email: "",
  skill: "Electrical",
  latitude: "",
  longitude: "",
  isAvailable: true,
  currentWorkload: 0,
};

export default function CreateTechnician({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
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
      setError("Please enter valid coordinates.");
      return;
    }

    setLoading(true);

    try {
      await createTechnician({
        name: form.name.trim(),
        email: form.email.trim(),
        skill: form.skill,
        latitude,
        longitude,
        isAvailable: form.isAvailable,
        currentWorkload: 0,
      });

      setForm(initialForm);
      setSuccess("Technician added successfully!");

      await onCreated();
    } catch (err) {
      console.error(err);
      setError("Unable to add technician.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="data-section">
      <h2>Add New Technician</h2>

      <form className="workorder-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Technician Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter technician name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="technician@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Primary Skill</label>
          <select
            name="skill"
            value={form.skill}
            onChange={handleChange}
          >
            <option value="Electrical">Electrical</option>
            <option value="Mechanical">Mechanical</option>
            <option value="IT">IT</option>
            <option value="Plumbing">Plumbing</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="6.9271"
              required
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="79.8612"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
              style={{ width: "auto", marginRight: "8px" }}
            />
            Available for Assignment
          </label>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button
          type="submit"
          className="create-btn"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Technician"}
        </button>
      </form>
    </section>
  );
}
