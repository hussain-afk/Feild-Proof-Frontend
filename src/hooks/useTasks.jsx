import {createTask, deleteTask} from '../api/task.api.js'

const useTasks = () => {

    const handleCreateTask = async (taskData) => {
        try {
            const response = await createTask(taskData)
            return response
        } catch (error) {
            throw error
        }
    }

    const handleDeleteTask = async (taskId) => {
        try {
            const response = await deleteTask(taskId)
            return response
        } catch (error) {
            throw error
        }
    }

    return {
        handleCreateTask,
        handleDeleteTask
    }

}
export default useTasks