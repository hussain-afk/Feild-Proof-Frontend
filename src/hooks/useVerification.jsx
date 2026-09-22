import {verifyCheckInAPI, verifyCheckOutAPI} from '../api/verification.api.js'
import { useContext } from 'react'
import { context } from '../context/context.jsx'


const useVerification = () => {
    const { upsertTask, updateTask } = useContext(context)
    const verifyCheckIn = async (taskId, latitude, longitude, imageFile) => {
        try {
            const formData = new FormData();
            formData.append("taskId", taskId);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("image", imageFile);

            const result = await verifyCheckInAPI(formData);
            upsertTask(result?.task || result?.data || result);
            updateTask(taskId, { status: "in-progress", isCheckedIn: true });
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
            upsertTask(result?.task || result?.data || result);
            updateTask(taskId, { status: "completed", isCheckedIn: false });
            return result;
        } catch (error) {
            throw error;
        }
    }
    return { verifyCheckIn, verifyCheckOut };

}

export default useVerification;
