import axios from "axios";
import Cookies from "js-cookie";
export const registerHandler = async (values: any) => {
  const response = await axios.post("/api/auth/register", values);

  return { message: response.data.message, status: response.status };
};

export const loginHandler = async (values: any) => {
  try {
    const res = await axios.post("/api/auth/login", values);
    const data = res.data;
    Cookies.set("__chatLegis__", data.jwtToken, {
      expires: 7,
    });
    return { data, status: res.status };
  } catch (error: any) {
    // ----------------------
    // You can also check for error.response for better error details if needed
    // ----------------------
    if (error.response.status == 401) {
      return {
        message: "Error! Incorrect email or password!",
        status: error.response ? error.response.status : 401,
      };
    }
    if (error.response.status == 403) {
      return {
        message: "Please verify using OTP",
        status: error.response ? error.response.status : 403,
      };
    }
    if (error.response.status == 404) {
      return {
        message: "User does not exist!",
        status: error.response ? error.response.status : 403,
      };
    }
    return {
      message: error,
      status: error.response ? error.response.status : 500,
    };
  }
};
export const logoutHandler = async (values: any) => {
  try {
    const token = Cookies.get("__chatLegis__");

    const headers: any = {
      "Content-Type": "application/json",
    };

    // Only add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post("/api/auth/logout", values, { headers });
    Cookies.remove("__chatLegis__");
    return { data: response.data, status: response.status };
  } catch (error: any) {
    Cookies.remove("__chatLegis__");
    return {
      message: error.response.data.message,
      status: error.status,
    };
  }
};

export const validateOTP = async (values: any) => {
  try {
    const resp = await axios.post("/api/auth/otp", values);
    return { data: resp.data, status: resp.status };
  } catch (error: any) {
    return { message: error, status: error.status };
  }
};
export const resendOTP = async (email: string) => {
  try {
    const resp = await axios.post("/api/auth/otp", { email });
    return { data: resp.data };
  } catch (error: any) {
    return { message: error, status: error.status };
  }
};

export const forgotPasswordHandler = async (values: { email: string }) => {
  try {
    const resp = await axios.post("/api/auth/forgot", values);
    return { message: resp.data, status: resp.status };
  } catch (error: any) {
    if (error.status === 404) {
      return { message: { message: "User not found" }, status: error.status };
    }
    return { message: error, status: error.status };
  }
};
export const newPasswordHandler = async (values: {
  email: string;
  password: string;
}) => {
  try {
    const resp = await axios.patch("/api/auth/passwordReset", values);
    return { message: resp.data, status: resp.status };
  } catch (error: any) {
    if (error.status === 404) {
      return { message: { message: "User not found" }, status: error.status };
    }
    return { message: error, status: error.status };
  }
};
