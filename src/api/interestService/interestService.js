import apiClient from "../apiClient";

const BASE_URL = "/interest";

const interestService = {
  getInterests: () => apiClient.get(`${BASE_URL}`),
};

export default interestService;
