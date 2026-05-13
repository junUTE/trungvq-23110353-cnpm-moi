import axios from "./axios.customize";

export const createUserApi = (name, email, password) => {
  return axios.post("/v1/api/register", {
    name,
    email,
    password,
  });
};

export const loginApi = (email, password) => {
  return axios.post("/v1/api/login", {
    email,
    password,
  });
};

export const getUsersApi = () => {
  return axios.get("/v1/api/user");
};

export const getAccountApi = () => {
  return axios.get("/v1/api/account");
};

export const getHomepageApi = () => {
  return axios.get("/v1/api/home");
};
