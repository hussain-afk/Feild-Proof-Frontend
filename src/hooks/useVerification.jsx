import {verifyCheckInAPI, verifyCheckOutAPI} from '../api/verification.api.js'


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
            throw error;
        }
    }
    return { verifyCheckIn, verifyCheckOut };

}

export default useVerification;
