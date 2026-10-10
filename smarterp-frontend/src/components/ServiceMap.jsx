
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const technicianIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const workOrderIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function validLocation(item) {
  return (
    Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude) &&
    item.latitude >= -90 &&
    item.latitude <= 90 &&
    item.longitude >= -180 &&
    item.longitude <= 180
  );
}

export default function ServiceMap({ technicians, workOrders }) {
  return (
    <section className="data-section" id="service-map">
      <h2>GIS Service Map</h2>
      <p>
        🟢 Technicians | 🔴 Work Orders
      </p>

      <MapContainer
        center={[6.9271, 79.8612]}
        zoom={9}
        style={{ height: "420px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {technicians.filter(validLocation).map((tech) => (
          <Marker
            key={`tech-${tech.id}`}
            position={[tech.latitude, tech.longitude]}
            icon={technicianIcon}
          >
            <Popup>
              <strong>{tech.name}</strong>
              <p>Skill: {tech.skill}</p>
              <p>Workload: {tech.currentWorkload}</p>
              <p>
                {tech.isAvailable ? "Available" : "Unavailable"}
              </p>
            </Popup>
          </Marker>
        ))}

        {workOrders.filter(validLocation).map((order) => (
          <Marker
            key={`order-${order.id}`}
            position={[order.latitude, order.longitude]}
            icon={workOrderIcon}
          >
            <Popup>
              <strong>WO-{order.id}: {order.title}</strong>
              <p>Priority: {order.priority}</p>
              <p>Status: {order.status}</p>
              <p>Required Skill: {order.requiredSkill}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}
