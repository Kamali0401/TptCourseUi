import axios from "axios";

const _baseURL = "https://localhost:44315/api";
// const _baseURL = "http://prasath-001-site5.ntempurl.com/api";
const _ProductURL = "http://103.53.52.215:85/api";
const _userURL = "http://manojvgl-001-site4.ctempurl.com/api/";

// Axios instances
export const authAxios = axios.create({
  baseURL: _baseURL,
});

export const publicAxios = axios.create({
  baseURL: _baseURL,
});

// Attach token for publicAxios
publicAxios.interceptors.request.use(async (config) => {
  const access_token = localStorage.getItem("token");
  if (access_token && !config.headers.Authorization) {
    config.headers.Authorization = `bearer ${access_token}`;
  }
  return config;
});

// Default headers for authAxios
authAxios.interceptors.request.use(async (config) => {
  config.headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  return config;
});

// ✅ Upload files (FormData)
export const AsyncPost = async (url, data) => {
  try {
    const response = await publicAxios.post(url, data, {
      headers: {
        "Content-Type": data instanceof FormData ? "multipart/form-data" : "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("AsyncPost error:", error, _baseURL + url);
    throw error;
  }
};

// ✅ Download files
export const AsyncGetFiles = async (url) => {
  try {
    const response = await publicAxios.get(url, {
      responseType: "blob", // force file download
    });
    return response;
  } catch (error) {
    console.error("AsyncGetFiles error:", error, _baseURL + url);
    throw error;
  }
};
