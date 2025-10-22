import apiClient from "../apiClient";

const BASE_URL = "/user";

const matchUserService = {
  getUserSuitable: () => apiClient.get(`${BASE_URL}/get-user-suitable`),
  updateAddressUser: (lon, lat) =>
    apiClient.put(`${BASE_URL}/update-address?lon=${lon}&lat=${lat}`),
  getSettingUser: () => apiClient.get(`${BASE_URL}/get-setting-user`),
  updateSettingUser: (settingData) =>
    apiClient.patch(`${BASE_URL}/update-setting-user`, settingData),
};
export default matchUserService;
