const API_BASE_URL = 'http://localhost:8080';

async function fetchModel(url) {
    try {
        // Ensure URL starts with / for consistency
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        const fullUrl = `${API_BASE_URL}${cleanUrl}`;

        const response = await fetch(fullUrl, {
            method: 'GET',
            credentials: 'include', // Include cookies for authentication
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching model data:', error);
        throw error;
    }
}

async function authLogin(loginName, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login_name: loginName, password: password })
        });

        const data = await response.json();

        if (!response.ok) {
            // Include error details from server response
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

async function authLogout() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
}

async function authCheckSession() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/session`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                return null; // Not logged in
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Session check failed:', error);
        return null; // Return null if session check fails
    }
}

// Comment API helper
async function addCommentToPhoto(photoId, commentText) {
    try {
        const response = await fetch(`${API_BASE_URL}/photo/commentsOfPhoto/${photoId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: commentText })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Add comment failed:', error);
        throw error;
    }
}

// Upload photo API helper
async function uploadPhoto(file) {
    try {
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`${API_BASE_URL}/photo/new`, {
            method: 'POST',
            credentials: 'include',
            body: formData // Don't set Content-Type header, let browser set it with boundary
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Upload photo failed:', error);
        throw error;
    }
}

async function authRegister(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
}

export default fetchModel;
export { authLogin, authLogout, authCheckSession, addCommentToPhoto, uploadPhoto, authRegister };
