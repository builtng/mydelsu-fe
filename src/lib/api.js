const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// A client-side fetch helper that handles JSON, credentials, CSRF, and authorization tokens.
export async function apiFetch(endpoint, options = {}) {
  const { redirectOn401 = false, ...fetchOptions } = options;

  // Ensure we have correct headers
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // If token exists in localStorage, append it for Sanctum token authentication
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mydelsu_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const config = {
    ...fetchOptions,
    headers,
  };

  // Include credentials for session cookies if needed
  if (!config.credentials) {
    config.credentials = "include";
  }

  const response = await fetch(url, config);

  if (response.status === 401) {
    // If unauthorized, clear token if we are in client browser
    if (typeof window !== "undefined") {
      localStorage.removeItem("mydelsu_token");
      localStorage.removeItem("mydelsu_user");

      const pathname = window.location.pathname;
      const isProtectedRoute = pathname.startsWith("/admin") ||
                               pathname.startsWith("/onboarding") ||
                               pathname.startsWith("/settings");

      const shouldRedirect = redirectOn401 === true || (redirectOn401 !== false && isProtectedRoute);

      // Only redirect if explicitly configured or on protected pages, and not already on auth pages
      if (shouldRedirect && !pathname.startsWith("/login") && !pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
    }
  }

  return response;
}

// Helper to get CSRF cookie for stateful cookie auth
export async function getCsrfCookie() {
  if (typeof window !== "undefined") {
    await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
    });
  }
}
