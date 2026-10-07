import { deleteNotification } from "../api/notification.api.js";
import { toast } from "react-hot-toast";
import { useContext } from "react";
import { context } from "../context/context.jsx";

const useNotification = () => {
    const { setNotifications } = useContext(context)

    const handleDeleteNotification = async (notificationId) => {
        if (!notificationId) return;

        try {
            await deleteNotification(notificationId);
            setNotifications((items) =>
                items.filter((item) => (item._id || item.id) !== notificationId)
            );
            toast.success("Notification deleted successfully");
        } catch {
            toast.error("Failed to delete notification");
        }
    }

    return { handleDeleteNotification };
}
export default useNotification;