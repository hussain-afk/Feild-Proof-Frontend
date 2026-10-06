import {createTask, deleteTask} from '../api/task.api.js'
import { useContext } from 'react'
import { context } from '../context/context.jsx'

const useTasks = () => {
    const { setIsCreateTaskModalOpen } = useContext(context)

    const handleCreateTask = async (taskData) => {
        const response = await createTask(taskData)
        setIsCreateTaskModalOpen(false)
        return response
    }

    const handleDeleteTask = async (taskId) => {
        return deleteTask(taskId)
    }

    return {
        handleCreateTask,
        handleDeleteTask
    }

}
export default useTasks