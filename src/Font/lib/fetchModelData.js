// Use environment variable or fallback to localhost
const API_BASE_URL = "https://m67j9p-8000.csb.app";

// Token management utilities
const TOKEN_KEY = "auth_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Helper function to get headers with token
function getAuthHeaders() {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log("🔍 Adding Authorization header with token");
  }

  return headers;
}

async function fetchModel(url) {
  try {
    // Ensure URL starts with / for consistency
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    const fullUrl = `${API_BASE_URL}${cleanUrl}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      credentials: "include", // Still include for cookie fallback
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching model data:", error);
    throw error;
  }
}

async function authLogin(userData) {
  // Thay đổi từ (loginName, password)
  try {
    console.log("🔍 Login attempt to:", `${API_BASE_URL}/admin/login`);
    console.log("🔍 Login data:", userData);

    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData), // Sử dụng userData thay vì hardcode
    });

    console.log("🔍 Response status:", response.status);
    console.log(
      "🔍 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // Kiểm tra content-type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Expected JSON but got:", contentType);
      console.error("❌ Response text:", text.substring(0, 500));
      throw new Error(
        "Server returned HTML instead of JSON. Backend may not be running correctly."
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    // Store JWT token in localStorage if provided
    if (data.token) {
      setToken(data.token);
      console.log("✅ Token saved to localStorage");
    }

    console.log("✅ Login successful");
    return data;
  } catch (error) {
    console.error("❌ Login failed:", error);
    throw error;
  }
}

async function authLogout() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/logout`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Remove token from localStorage on successful logout
    removeToken();

    return true;
  } catch (error) {
    console.error("Logout failed:", error);
    // Still remove token even if logout request fails
    removeToken();
    throw error;
  }
}

async function authCheckSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/session`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Remove invalid token
        removeToken();
        return null; // Not logged in
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Session check failed:", error);
    // Remove token if session check fails
    removeToken();
    return null; // Return null if session check fails
  }
}

// Comment API helper
async function addCommentToPhoto(photoId, commentText) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/photo/commentsOfPhoto/${photoId}`,
      {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment: commentText }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Add comment failed:", error);
    throw error;
  }
}

// Upload photo API helper
async function uploadPhoto(file) {
  try {
    const formData = new FormData();
    formData.append("photo", file);

    // Get token for Authorization header
    const token = getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/photo/new`, {
      method: "POST",
      credentials: "include",
      headers: headers,
      body: formData, // Don't set Content-Type header, let browser set it with boundary
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Upload photo failed:", error);
    throw error;
  }
}

async function authRegister(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "PATCH",
      credentials: "include",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
}

async function updateUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userData._id}`, {
      method: "PATCH",
      credentials: "include",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("Update user failed:", error);
    throw error;
  }
}

async function deletePhoto(photoId) {
  try {
    const token = getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/photo/delete/${photoId}`, {
      method: "DELETE",
      credentials: "include",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Delete photo failed:", error);
    throw error;
  }
}

async function deleteComment(photoId, commentId) {
  try {
    const token = getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/photo/deleteComment/${photoId}/${commentId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Delete comment failed:", error);
    throw error;
  }
}

async function updateLike(photoId) {
  try {
    const response = await fetch(`${API_BASE_URL}/photo/like/${photoId}`, {
      method: "PATCH",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Trả về dữ liệu mới từ server (like, dislike, userLiked, userDisliked)
    return await response.json();
  } catch (error) {
    console.error("Update like failed:", error);
    throw error;
  }
}

async function updateDislike(photoId) {
  try {
    const response = await fetch(`${API_BASE_URL}/photo/dislike/${photoId}`, {
      method: "PATCH",
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Trả về dữ liệu mới từ server (like, dislike, userLiked, userDisliked)
    return await response.json();
  } catch (error) {
    console.error("Update dislike failed:", error);
    throw error;
  }
}

export default fetchModel;
export {
  authLogin,
  authLogout,
  authCheckSession,
  addCommentToPhoto,
  uploadPhoto,
  authRegister,
  updateUser,
  deletePhoto,
  deleteComment,
  updateLike,
  updateDislike,
  getToken,
  setToken,
  removeToken,
};
