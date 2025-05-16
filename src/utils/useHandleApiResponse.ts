// src/hooks/useHandleApiResponse.ts
import { useToast } from "@/app/components/toast/ToastManager";
import { AxiosResponse } from "axios";

export const useHandleApiResponse = () => {
  const { showToast } = useToast();


  const handleApiResponse = (response: AxiosResponse<any>) => {
    const { statusCode, message, data } = response.data;

    switch (statusCode) {
      case 200:
		  case 201:
        showToast(message || "Success", "success");
        break;
      case 400:
      case 401:
      case 403:
      case 404:
			case 409:
      case 500:
        showToast(message || "Something went wrong", "error");
        break;
      default:
        showToast("Unexpected error occurred", "error");
        break;
    }
  };

  return { handleApiResponse };
};
