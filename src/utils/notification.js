import { toast } from "react-toastify";

/**
 * Show success notification
 * @param {string} message - The main message to display
 * @param {string} description - Optional description text
 */
export const showSuccessNotification = (message, description = "") => {
  const displayMessage = description ? `${message}: ${description}` : message;
  toast.success(displayMessage, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show error notification
 * @param {string} message - The main message to display
 * @param {string} description - Optional description text
 */
export const showErrorNotification = (message, description = "") => {
  const displayMessage = description ? `${message}: ${description}` : message;
  toast.error(displayMessage, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show warning notification
 * @param {string} message - The main message to display
 * @param {string} description - Optional description text
 */
export const showWarningNotification = (message, description = "") => {
  const displayMessage = description ? `${message}: ${description}` : message;
  toast.warning(displayMessage, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Show info notification
 * @param {string} message - The main message to display
 * @param {string} description - Optional description text
 */
export const showInfoNotification = (message, description = "") => {
  const displayMessage = description ? `${message}: ${description}` : message;
  toast.info(displayMessage, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export default {
  success: showSuccessNotification,
  error: showErrorNotification,
  warning: showWarningNotification,
  info: showInfoNotification,
};
