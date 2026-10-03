import {deleteNotification} from '../api/notification.api.js';
import { toast } from 'react-hot-toast'

const useNotification = () => {

    const handleDeleteNotification = async (notificationId) => {
        try {
            const response = await deleteNotification(notificationId);
            if (response.success) {
                toast.success("Notification deleted successfully");
            }
        } catch (error) {
            toast.error("Failed to delete notification");
        }
    }

    return { handleDeleteNotification };
}
export default useNotification;