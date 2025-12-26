import axios from "axios";
export const getIssueHandler = async (values: any) => {
  try {
    const resp = await axios.post("/api/issue", values);
    return { message: resp.data, status: resp.status };
  } catch (error: any) {
    return {
      message: "Error! Some unknown error occured.",
      status: 500,
    };
  }
};
