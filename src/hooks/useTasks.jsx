import {createTask, deleteTask} from '../api/task.api.js'
import { useContext } from 'react'
import { context } from '../context/context.jsx'

const useTasks = () => {
    const { upsertTask, removeTask } = useContext(context)

    const handleCreateTask = async (taskData) => {
        try {
            const response = await createTask(taskData)
            upsertTask(response?.task || response?.data || response)
            return response
        } catch (error) {
            throw error
        }
    }

    const handleDeleteTask = async (taskId) => {
        try {
            const response = await deleteTask(taskId)
            removeTask(taskId)
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