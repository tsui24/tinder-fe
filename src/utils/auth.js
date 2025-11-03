// Utility functions for authentication
export const getCurrentUserId = () => {
  // Get user ID from localStorage or token
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.id || user.userId;
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  // Fallback: get from token if available
  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");
  if (token) {
    try {
      // Basic JWT decode (without verification)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const decoded = JSON.parse(jsonPayload);
      return decoded.userId || decoded.id || decoded.sub;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  return null;
};

export const isAuthenticated = () => {
  return !!getCurrentUserId();
};

export const isLoginPage = (pathname) => {
  return ["/login", "/register", "/"].includes(pathname);
};
