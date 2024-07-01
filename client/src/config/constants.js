const constants = {
  dev: {
    HOST_URL: "http://localhost:5000/api/",
    stripePK:
      "pk_test_51MqDHeIhTKltFnGq3WGCHjZi5ZfUg5T8aiGVPa7XFZcrse4SGLvTjDbXDNb5inKjlOaJqHJRDv5HsPQ6tbnfsxRL00rwetwKzu",
    SOCKET_URL: "http://localhost:5000",
  },
  prod: {
    HOST_URL: process.env.REACT_APP_HOST_URL || "/api/",
    stripePK:
      "pk_live_51NJdNuHnQ3da7QZ33oSKsSTWhiuXa43CI3X8DsJKCkikdThO0uiRbEbvmzY1VKdlKNuTlFvLmQkkcrC1HnM9MFaZ000QnQ1Hae",
    SOCKET_URL: "/",
  },
};

const REACT_APP_ENV = process.env.REACT_APP_ENV || "dev";

export default constants[REACT_APP_ENV];
