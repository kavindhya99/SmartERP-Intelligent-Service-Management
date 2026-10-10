
import { useEffect, useState } from "react";
import {
  Users,
  ClipboardList,
  CheckCircle,
  Clock,
} from "lucide-react";

import {
  getTechnicians,
  getWorkOrders,
} from "./services/api";

import SmartRecommendations from "./components/SmartRecommendations";
import CreateWorkOrder from "./components/CreateWorkOrder";
import ServiceMap from "./components/ServiceMap";
import CreateTechnician from "./components/CreateTechnician";
import ManageRecord from "./components/ManageRecord";

import "./App.css";

function App() {
  const [technicians, setTechnicians] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load data from ASP.NET Core API
  async function loadDashboard() {
    try {
      const [technicianData, workOrderData] =
        await Promise.all([
          getTechnicians(),
          getWorkOrders(),
        ]);

      setTechnicians(technicianData);
      setWorkOrders(workOrderData);
      setError("");
    } catch (err) {
      console.error("Dashboard API error:", err);
      setError("Unable to connect to SmartERP API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // Dashboard statistics
  const pendingOrders = workOrders.filter(
    (order) => order.status === "Pending"
  ).length;

  const assignedOrders = workOrders.filter(
    (order) => order.status === "Assigned"
  ).length;

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>SmartERP</h2>
        <p>Intelligent Service Management</p>

        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#technicians">Technicians</a>
          <a href="#workorders">Work Orders</a>
          <a href="#service-map">GIS Map</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content" id="dashboard">
        <header>
          <h1>Dashboard</h1>
          <p>Smart Service & Work Order Management</p>
        </header>

        {loading && <p>Loading dashboard...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            {/* Dashboard Statistics */}
            <section className="stats">
              <div className="stat-card">
                <Users />
                <h3>Total Technicians</h3>
                <h2>{technicians.length}</h2>
              </div>

              <div className="stat-card">
                <ClipboardList />
                <h3>Total Work Orders</h3>
                <h2>{workOrders.length}</h2>
              </div>

              <div className="stat-card">
                <Clock />
                <h3>Pending Orders</h3>
                <h2>{pendingOrders}</h2>
              </div>

              <div className="stat-card">
                <CheckCircle />
                <h3>Assigned Orders</h3>
                <h2>{assignedOrders}</h2>
              </div>
            </section>

            {/* GIS Map */}
            <ServiceMap
              technicians={technicians}
              workOrders={workOrders}
            />

            {/* Create Technician */}
            <CreateTechnician
              onCreated={loadDashboard}
            />

            {/* Technicians Table */}
            <section
              className="data-section"
              id="technicians"
            >
              <h2>Technicians</h2>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Skill</th>
                    <th>Availability</th>
                    <th>Workload</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {technicians.map((tech) => (
                    <tr key={tech.id}>
                      <td>{tech.name}</td>
                      <td>{tech.skill}</td>
                      <td>
                        {tech.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </td>
                      <td>{tech.currentWorkload}</td>

                      {/* Edit and Delete Technician */}
                      <td>
                        <ManageRecord
                          type="technician"
                          record={tech}
                          onChanged={loadDashboard}
                        />
                      </td>
                    </tr>
                  ))}

                  {technicians.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        No technicians available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* Create Work Order */}
            <CreateWorkOrder
              onCreated={loadDashboard}
            />

            {/* Work Orders Table */}
            <section
              className="data-section"
              id="workorders"
            >
              <h2>Work Orders</h2>

              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Technician ID</th>
                    <th>Smart Assignment</th>
                    <th>Manage</th>
                  </tr>
                </thead>

                <tbody>
                  {workOrders.map((order) => (
                    <tr key={order.id}>
                      <td>WO-{order.id}</td>
                      <td>{order.title}</td>
                      <td>{order.priority}</td>

                      <td>
                        <span
                          className={
                            order.status === "Pending"
                              ? "status-pending"
                              : "status-assigned"
                          }
                        >
                          {order.status}
                        </span>
                      </td>

                      <td>
                        {order.assignedTechnicianId ?? "—"}
                      </td>

                      {/* Smart Recommendations */}
                      <td>
                        <SmartRecommendations
                          workOrder={order}
                          onAssigned={loadDashboard}
                        />
                      </td>

                      {/* Edit and Delete Work Order */}
                      <td>
                        <ManageRecord
                          type="workorder"
                          record={order}
                          onChanged={loadDashboard}
                        />
                      </td>
                    </tr>
                  ))}

                  {workOrders.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        No work orders available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
