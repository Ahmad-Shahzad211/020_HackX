import axios from "axios";
import Cookies from "js-cookie";
export const feedbackHandler = async (values: any) => {
  try {
    const resp = await axios.post("/api/feedback", values, {
      headers: {
        Authorization: `Bearer ${await Cookies.get("__chatLegis__")}`,
      },
    });
    return { message: resp.data, status: resp.status };
  } catch (error: any) {
    if (error.status == 409) {
      return {
        message: "Error! Your feedback is already in progress!",
        status: 409,
      };
    } else if (error.status == 401) {
      return {
        message: "Error! User is not Authorized.",
        status: 401,
      };
    } else if (error.status == 404) {
      return {
        message: "Error! User not found.",
        status: 404,
      };
    }
    return {
      message: "Error! Some unknown error occured.",
      status: 500,
    };
  }
};
