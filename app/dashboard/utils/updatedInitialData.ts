import axiosInstance from "@/utils/axiosConfig";
import { initialData } from "../context/ApiDataContext";
export const fetchUpdatedApiData = async (setApiData?: (data: any) => void) => {
  try {
    const response = await axiosInstance.post(
      "document/search_by_query",
      initialData
    );
    if (response.status === 200) {
      if (setApiData) {
        setApiData(response.data);
      } else {
        console.warn("setApiData is undefined. Could not update the API data.");
      }
    }
  } catch (error) {
    console.error("Error fetching updated data:", error);
  }
};
