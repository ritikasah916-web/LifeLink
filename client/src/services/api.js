const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = localStorage.getItem("lifelink_token");
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new Error("Cannot reach LifeLink server. Check that the backend is running.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && auth) {
      localStorage.removeItem("lifelink_token");
      window.dispatchEvent(new Event("lifelink:unauthorized"));
    }
    throw new Error(data.message || "Request failed. Please try again.");
  }
  return data;
}

const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options = {}) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: "PATCH", body }),
  put: (path, body, options = {}) => request(path, { ...options, method: "PUT", body }),
  delete: (path, options = {}) => request(path, { ...options, method: "DELETE" })
};
export default api;