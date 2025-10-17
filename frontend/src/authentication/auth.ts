import Cookies from "js-cookie";

export const setTokens = ({
  access,
  refresh,
}: {
  access: string;
  refresh: string;
}) => {
  Cookies.set("access", access, { expires: 1 });
  Cookies.set("refresh", refresh, { expires: 1 });
};

export const setAccessToken = (access: string) => {
  Cookies.set("access", access, { expires: 1 });
};

export const getToken = () => Cookies.get("access");
export const getRefreshToken = () => Cookies.get("refresh");

export const removeTokens = () => {
  Cookies.remove("access");
  Cookies.remove("refresh");
};
