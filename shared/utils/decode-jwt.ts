export const decodeJwt = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("❌ Failed to decode JWT:", error);
    throw error;
  }
};
