import axios from "axios";
import { useAuthStore } from "@/shared/store";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000",
  withCredentials: true, // 필요 시 쿠키 사용
});

// ✅ 요청 인터셉터: accessToken 자동 삽입
API.interceptors.request.use(
  (config) => {
    // Zustand store에서 최신 토큰 가져오기
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
