import { useContext } from "react";
import toast from "react-hot-toast";
import { cancelMySubscription, createCheckoutSession } from "../api/billing.api.js";
import { context } from "../context/context.jsx";

const useSubscriptions = () => {
  const { setIsLoading, setMySubscription } = useContext(context);

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await cancelMySubscription();
      setMySubscription(response?.subscription ?? null);
      toast.success("Subscription canceled successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error canceling subscription"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCheckoutSession = async (planId) => {
    try {
      const response = await createCheckoutSession(planId);
      if (response?.url) {
        window.location.assign(response.url);
      } else {
        throw new Error("Checkout session URL was not returned");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error creating checkout session"
      );
      throw error;
    }
  };

  return { handleCancelSubscription, handleCreateCheckoutSession };
};

export default useSubscriptions;