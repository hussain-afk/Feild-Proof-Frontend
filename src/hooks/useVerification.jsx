import { verifyCheckInAPI, verifyCheckOutAPI, delVerification } from '../api/verification.api.js'
import { useContext } from 'react'
import { context } from '../context/context.jsx'
import { toast } from 'react-hot-toast'


const useVerification = () => {
    const { paymentModalOpen, setPaymentModalOpen } = useContext(context)
    const verifyCheckIn = async (taskId, latitude, longitude, imageFile) => {
        try {
            const formData = new FormData();
            formData.append("taskId", taskId);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("image", imageFile);

            const result = await verifyCheckInAPI(formData);
            return result;
        } catch (error) {
            const err = error?.response?.data?.message || error?.message
            if (err === "payment method not set") {
                toast.error("Payment method not set. Please set your payment method to proceed.");
                setPaymentModalOpen(true);
                return;
            }

            throw error;
        }
    }
    const verifyCheckOut = async (taskId, latitude, longitude, imageFile) => {
        try {
            const formData = new FormData();
            formData.append("taskId", taskId);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("image", imageFile);
            const result = await verifyCheckOutAPI(formData);
            return result;
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message);
            throw error;
        }
    }
    const deleteVerification = async (verificationId) => {
        try {
            const result = await delVerification(verificationId);
            return result;
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message);
            throw error;
        }
    }
    return { verifyCheckIn, verifyCheckOut, deleteVerification };

}

export default useVerification;
