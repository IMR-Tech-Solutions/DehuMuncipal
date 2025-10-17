import { toast } from "react-toastify";
 
export function handleError(error: any) {
  if (!error?.response) {
    toast.error("Network error or server not responding.");
    return;
  }
 
  const status = error.response.status;
  let message = "";
 
  if (typeof error.response.data === "string") {
    message = error.response.data;
  } else if (error.response.data?.error) {
    message =
      typeof error.response.data.error === "string"
        ? error.response.data.error
        : error.response.data.error[0];
  } else {
    // Pick first key-value from dict
    const firstKey = Object.keys(error.response.data)[0];
    if (firstKey) {
      const val = error.response.data[firstKey];
      message = Array.isArray(val) ? val[0] : val;
    }
  }
 
  switch (status) {
    case 400:
      toast.warning(message || "Bad request. Please check your input.");
      break;
    case 401:
      toast.warning(message || "Unauthorized. Please login again.");
      break;
    case 403:
      toast.warning(
        message || "You don’t have permission to perform this action."
      );
      break;
    case 404:
      toast.info(message || "Resource not found.");
      break;
    case 409:
      toast.warning(message || "Conflict detected.");
      break;
    case 500:
      toast.error(message || "Internal server error. Please try again later.");
      break;
    default:
      toast.error(message || "An unexpected error occurred.");
  }
}
 
 