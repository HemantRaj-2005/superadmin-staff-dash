import { toast } from "sonner";

export const useToast = () => {
  return {
    toast: {
      success: (message, description) => {
        toast.success(message, { description });
      },
      error: (message, description) => {
        toast.error(message, { description });
      },
      info: (message, description) => {
        toast.info(message, { description });
      },
      warning: (message, description) => {
        toast.warning(message, { description });
      },
      promise: (promise, options) => {
        return toast.promise(promise, options);
      },
    },
  };
};

export default useToast;

