import apiClient from "../apiClient";

const BASE_URL = "/auth";

const authService = {
  login: (data) => apiClient.post(`${BASE_URL}/login`, data),
  register: (data) => apiClient.post(`${BASE_URL}/register`, data),
};

export default authService;
