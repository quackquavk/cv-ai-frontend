import Cookies from "js-cookie";

export const getToken = () => {
  return {
    accessToken: Cookies.get("access_token"),
    refreshToken: Cookies.get("refresh_token"),
  };
};
