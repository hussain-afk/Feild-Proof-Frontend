import { verifyCheckInAPI, verifyCheckOutAPI, delVerification, ApproveVerification, RejectVerification } from '../api/verification.api.js'
import { toast } from 'react-hot-toast'


const useVerification = () => {
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
            const err = error?.response?.data?.message || error?.message;
            toast.error(err);
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
    const onApprove = async (verificationId) => {
        try {
            const result = await ApproveVerification(verificationId);
            toast.success("Verification approved successfully!");
            return result;
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message);
            throw error;
        }
    }
    const onReject = async (verificationId, reason) => {
        try {
            const result = await RejectVerification(verificationId, reason);
            toast.success("Verification rejected successfully!");
            return result;
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message);
            throw error;
        }
    }
    return { verifyCheckIn, verifyCheckOut, deleteVerification, onApprove, onReject };

}

export default useVerification;
