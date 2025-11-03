import apiClient from "../apiClient";

const BASE_URL = "/user";

const matchUserService = {
  getUserSuitable: () => apiClient.get(`${BASE_URL}/get-user-suitable`),
  updateAddressUser: (lon, lat) =>
    apiClient.put(`${BASE_URL}/update-address?lon=${lon}&lat=${lat}`),
  getSettingUser: () => apiClient.get(`${BASE_URL}/get-setting-user`),
  updateSettingUser: (settingData) =>
    apiClient.patch(`${BASE_URL}/update-setting-user`, settingData),
  getUsersWhoLikedMe: () => apiClient.get(`${BASE_URL}/get-user-likes`),
  getMatches: () => apiClient.get(`/matches`),
  getMessages: (matchId) => {
    console.log("🌐🌐🌐 API SERVICE: GET MESSAGES");
    console.log("📡 URL: GET /messages/" + matchId);
    console.log("📋 Params: matchId:", matchId);
    return apiClient.get(`/messages/${matchId}`);
  },
  likeUser: (userToId) => {
    console.log("🌐🌐🌐 API SERVICE: LIKE USER");
    console.log("📡 URL: POST /like");
    console.log("📋 Params: { userToId:", userToId, ", status: 0 (LIKE) }");
    return apiClient.post(`/like`, null, {
      params: { userToId, status: 0 },
    });
  },
  dislikeUser: (userToId) => {
    console.log("🌐🌐🌐 API SERVICE: DISLIKE USER");
    console.log("📡 URL: POST /api/like");
    console.log("📋 Params: { userToId:", userToId, ", status: 1 (DISLIKE) }");
    return apiClient.post(`/like`, null, {
      params: { userToId, status: 1 },
    });
  },
};
export default matchUserService;
