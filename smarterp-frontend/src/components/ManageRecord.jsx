
import { useState } from "react";
import {
  updateTechnician,
  deleteTechnician,
  updateWorkOrder,
  deleteWorkOrder,
} from "../services/api";

export default function ManageRecord({ type, record, onChanged }) {
  const isTechnician = type === "technician";
  const isAssignedOrder =
    !isTechnician && record.status !== "Pending";

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...record });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value, type: inputType, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        id: record.id,
      };

      if (
        !Number.isFinite(payload.latitude) ||
        !Number.isFinite(payload.longitude) ||
        payload.latitude < -90 ||
        payload.latitude > 90 ||
        payload.longitude < -180 ||
        payload.longitude > 180
      ) {
        throw new Error("Invalid latitude or longitude.");
      }

      if (isTechnician) {
        await updateTechnician(record.id, payload);
      } else {
        await updateWorkOrder(record.id, payload);
      }

      await onChanged();
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save changes."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const label = isTechnician
      ? record.name
      : `WO-${record.id}`;

    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) {
      return;
    }

    setError("");
    setBusy(true);

    try {
      if (isTechnician) {
        await deleteTechnician(record.id);
      } else {
        await deleteWorkOrder(record.id);
      }

      await onChanged();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Unable to delete this record. It may be referenced by another record."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="manage-record">
      <div className="record-actions">
        <button
          type="button"
          className="edit-btn"
          disabled={busy || isAssignedOrder}
          onClick={() => {
            setForm({ ...record });
            setError("");
            setEditing(true);
          }}
        >
          Edit
        </button>

        <button
          type="button"
          className="delete-btn"
          disabled={busy || isAssignedOrder}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>

      {isAssignedOrder && (
        <small>
          Assigned orders are locked to protect assignment data.
        </small>
      )}

      {error && <p className="error">{error}</p>}

      {editing && (
        <form className="edit-record-form" onSubmit={handleSave}>
          <h3>
            Edit {isTechnician ? "Technician" : "Work Order"}
          </h3>

          {isTechnician ? (
            <>
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label>Skill</label>
              <select
                name="skill"
                value={form.skill}
                onChange={handleChange}
              >
                <option>Electrical</option>
                <option>Mechanical</option>
                <option>IT</option>
                <option>Plumbing</option>
              </select>

              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                />
                Available
              </label>

              <label>Current Workload</label>
              <input
                type="number"
                value={form.currentWorkload}
                disabled
              />
            </>
          ) : (
            <>
              <label>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />

              <label>Required Skill</label>
              <select
                name="requiredSkill"
                value={form.requiredSkill}
                onChange={handleChange}
              >
                <option>Electrical</option>
                <option>Mechanical</option>
                <option>IT</option>
                <option>Plumbing</option>
              </select>

              <label>Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </>
          )}

          <label>Latitude</label>
          <input
            type="number"
            step="any"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            required
          />

          <label>Longitude</label>
          <input
            type="number"
            step="any"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            required
          />

          <div className="record-actions">
            <button
              type="submit"
              className="edit-btn"
              disabled={busy}
            >
              {busy ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
