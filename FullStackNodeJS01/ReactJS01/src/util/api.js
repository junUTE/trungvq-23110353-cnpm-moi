import axios from "./axios.customize";

const buildProductFormData = (data = {}) => {
  const formData = new FormData();
  formData.append("name", data.name ?? "");
  formData.append("sku", data.sku ?? "");
  formData.append("price", data.price ?? "");
  formData.append("stock", data.stock ?? 0);
  formData.append("description", data.description ?? "");
  formData.append("categoryId", data.categoryId ?? "");

  if (data.replaceImages !== undefined) {
    formData.append("replaceImages", String(data.replaceImages));
  }

  if (Array.isArray(data.images)) {
    data.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  return formData;
};

export const createUserApi = (username, email, password, verificationCode) => {
  return axios.post("/v1/api/register", {
    username,
    email,
    password,
    verificationCode,
  });
};

export const sendVerificationCodeApi = (email, username) => {
  return axios.post("/v1/api/send-verification", {
    email,
    username,
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

export const updateUserApi = (id, data) => {
  return axios.put(`/v1/api/user/${id}`, data);
};

export const deleteUserApi = (id) => {
  return axios.delete(`/v1/api/user/${id}`);
};

export const getAccountApi = () => {
  return axios.get("/v1/api/account");
};

export const updateOwnProfileApi = (data) => {
  return axios.put("/v1/api/account", data);
};

export const deleteOwnAccountApi = () => {
  return axios.delete("/v1/api/account");
};

export const getHomepageApi = () => {
  return axios.get("/v1/api/home");
};

export const searchProductsApi = (keyword, categories, minPrice, maxPrice) => {
  const params = new URLSearchParams();
  if (keyword) params.append("q", keyword);
  if (Array.isArray(categories) && categories.length > 0) {
    params.append("categories", categories.join(","));
  }
  if (minPrice !== undefined && minPrice !== null) params.append("minPrice", minPrice);
  if (maxPrice !== undefined && maxPrice !== null) params.append("maxPrice", maxPrice);
  return axios.get(`/v1/api/search?${params.toString()}`);
};

export const getPublicCategoriesApi = () => {
  return axios.get("/v1/api/public/categories");
};

export const getCategoryProductsApi = (categoryId, page = 1, limit = 12) => {
  return axios.get(`/v1/api/public/categories/${categoryId}/products?page=${page}&limit=${limit}`);
};

export const getProductDetailApi = (id) => {
  return axios.get(`/v1/api/product-detail/${id}`);
};

export const getCategoriesApi = () => {
  return axios.get("/v1/api/categories");
};

export const createCategoryApi = (data) => {
  return axios.post("/v1/api/categories", data);
};

export const updateCategoryApi = (id, data) => {
  return axios.put(`/v1/api/categories/${id}`, data);
};

export const deleteCategoryApi = (id) => {
  return axios.delete(`/v1/api/categories/${id}`);
};

export const getProductsApi = () => {
  return axios.get("/v1/api/products");
};

export const createProductApi = (data) => {
  return axios.post("/v1/api/products", buildProductFormData(data));
};

export const updateProductApi = (id, data) => {
  return axios.put(`/v1/api/products/${id}`, buildProductFormData(data));
};

export const deleteProductApi = (id) => {
  return axios.delete(`/v1/api/products/${id}`);
};

export const deleteProductImageApi = (imageId) => {
  return axios.delete(`/v1/api/products/images/${imageId}`);
};

export const setProductMainImageApi = (productId, imageId) => {
  return axios.put(`/v1/api/products/images/${imageId}/main`, { productId });
};

export const getPromotionsApi = () => {
  return axios.get("/v1/api/promotions");
};

export const createPromotionApi = (data) => {
  return axios.post("/v1/api/promotions", data);
};

export const updatePromotionApi = (id, data) => {
  return axios.put(`/v1/api/promotions/${id}`, data);
};

export const deletePromotionApi = (id) => {
  return axios.delete(`/v1/api/promotions/${id}`);
};
