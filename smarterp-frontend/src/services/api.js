import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getTechnicians = async () => {
  const response = await api.get("/technicians");
  return response.data;
};

export const getWorkOrders = async () => {
  const response = await api.get("/workorders");
  return response.data;
};

export const getRecommendations = async (workOrderId) => {
  const response = await api.get(
    `/workorders/${workOrderId}/recommendations`
  );
  return response.data;
};

export const assignTechnician = async (
  workOrderId,
  technicianId
) => {
  const response = await api.post(
    `/workorders/${workOrderId}/assign/${technicianId}`
  );
  return response.data;
};

export const createWorkOrder = async (workOrder) => {
  const response = await api.post("/workorders", workOrder);
  return response.data;
};

export const createTechnician = async (technician) => {
  const response = await api.post("/technicians", technician);
  return response.data;
};


export const updateTechnician = async (id, technician) => {
  const response = await api.put(`/technicians/${id}`, technician);
  return response.data;
};

export const deleteTechnician = async (id) => {
  await api.delete(`/technicians/${id}`);
};

export const updateWorkOrder = async (id, workOrder) => {
  const response = await api.put(`/workorders/${id}`, workOrder);
  return response.data;
};

export const deleteWorkOrder = async (id) => {
  await api.delete(`/workorders/${id}`);
};

export default api;