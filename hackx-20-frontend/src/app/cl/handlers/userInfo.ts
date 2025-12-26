import { UpdateUserProps } from "@/types";
import axios from "axios";
import Cookies from "js-cookie";

const token = Cookies.get("__chatLegis__");
export const getUserInfoHandler = async () => {
  try {
    const response = await axios.get("/api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { data: response.data, status: response.status };
  } catch (error: any) {
    if (error.status == 400) {
      return {
        message: error.response.data.message,
        success: false,
        status: 409,
      };
    } else if (error.status == 401) {
      return {
        message: error.response.data.message,
        success: false,
        status: 401,
      };
    } else if (error.status == 404) {
      return {
        message: error.response.data.message,
        success: false,
        status: 404,
      };
    } else {
      return {
        message: "Error! An unexpected error occurred. Please try again later.",
        success: false,
        status: 500,
      };
    }
  }
};

export const updatePasswordHandler = async (values: any) => {
  try {
    const response = await axios.patch("/api/auth/passwordReset", values, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
      return { message: "Error! Failed to update password.", success: false };
    }
    Cookies.remove("__chatLegis__");
    return { message: response.data.message, status: response.status };
  } catch (error: any) {
    if (error.status == 400) {
      return {
        message: error.response.data.message,
        success: false,
        status: 409,
      };
    } else if (error.status == 401) {
      return {
        message: error.response.data.message,
        success: false,
        status: 401,
      };
    } else if (error.status == 404) {
      return {
        message: error.response.data.message,
        success: false,
        status: 404,
      };
    } else {
      return {
        message: "Error! An unexpected error occurred. Please try again later.",
        success: false,
        status: 500,
      };
    }
  }
};

export const removeDeviceHandler = async (ipAddress: string) => {
  try {
    const response = await axios.patch(
      "/api/user",
      { ip: ipAddress },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { message: response.data.message, status: response.status };
  } catch (error: any) {
    return {
      data: { error: error.response.data.message },
      status: error.status,
    };
  }
};

export const updateUserAvatarHandler = async (avatarUrl: string) => {
  try {
    const response = await axios.patch(
      "/api/user",
      { avatarUrl },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { message: response.data.message, status: response.status };
  } catch (error: any) {
    return {
      message: error.response.data.message,
      success: false,
      status: error.status || 500,
    };
  }
};

export const updateUser = async (values: UpdateUserProps) => {
  try {
    const response = await axios.patch("/api/user", values, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { data: response.data, status: response.status };
  } catch (error: any) {
    if (error.response.status == 401) {
      return {
        message: "Authentication Failed!",
        status: error.response.status,
      };
    }
    if (error.response.status == 404) {
      return { message: "User not found!", status: error.response.status };
    }
    return { message: error.message, status: error.response.status };
  }
};

export const uploadProfileImageToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default");
  // TODO: change upload preset and cloud name
  try {
    const resp = await axios.post("/api/uploadImage", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { message: resp.data, status: resp.status };
  } catch (error: any) {
    return {
      message: error.response.data.message,
      status: error.response.status,
    };
  }
};
