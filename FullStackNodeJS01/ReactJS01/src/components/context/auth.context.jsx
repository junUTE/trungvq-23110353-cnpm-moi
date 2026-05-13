import { createContext, useState } from "react";
import { getAccountApi } from "../../util/api";

const emptyUser = {
  id: "",
  email: "",
  name: "",
};

export const AuthContext = createContext({
  auth: {
    isAuthenticated: false,
    user: emptyUser,
  },
  appLoading: true,
  setAuth: () => {},
  logout: () => {},
  bootstrapAuth: async () => {},
});

export const AuthWrapper = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: emptyUser,
  });
  const [appLoading, setAppLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("access_token");
    setAuth({
      isAuthenticated: false,
      user: emptyUser,
    });
  };

  const bootstrapAuth = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setAppLoading(false);
      return;
    }

    setAppLoading(true);
    const response = await getAccountApi();

    if (response?.message) {
      logout();
      setAppLoading(false);
      return;
    }

    setAuth({
      isAuthenticated: true,
      user: {
        id: response?.id ?? "",
        email: response?.email ?? "",
        name: response?.name ?? "",
      },
    });
    setAppLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        appLoading,
        setAppLoading,
        logout,
        bootstrapAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
