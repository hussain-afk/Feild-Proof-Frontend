import { createContext, useState, useEffect } from "react";
import { getCurrentUser, getAllUsers } from "../api/auth.api.js";
import { getAllTasks } from "../api/task.api.js";
import { useNavigate } from "react-router-dom";

export const context = createContext()

const ContextProvider = ({ children }) => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    // console.log('User state updated:', user) // Log the user state whenever it changes
    const [isLoading, setIsLoading] = useState(false)
    const [allUsers, setAllUsers] = useState([]) // State to hold all users
    // console.log('Loading state updated:', isLoading) // Log the loading state whenever it changes
    const [allTasks, setAllTasks] = useState([]) // State to hold all tasks


    // fetchCurrentUser() // Call the function to fetch the current user when the component mounts
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                setIsLoading(true)
                const response = await getCurrentUser()
                // console.log('User fetched successfully:', response)
                setUser(response)
                if (response.role === 'worker') {
                    navigate('/worker') // Uncomment this line if you want to navigate after fetching the user
                }
                if (response.role === 'manager') {
                    navigate('/manager') // Uncomment this line if you want to navigate after fetching the user
                }
            } catch (error) {
                // console.error('Error fetching user:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCurrentUser()
    }, [])

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                setIsLoading(true)
                const response = await getAllUsers()
                // console.log('All users fetched successfully:', response)
                setAllUsers(response)
            } catch (error) {
                // console.error('Error fetching all users:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAllUsers()
    }, [])

    useEffect(() => {
        const fetchAllTasks = async () => {
            try {
                setIsLoading(true)
                const response = await getAllTasks()
                // console.log('All tasks fetched successfully:', response)
                setAllTasks(response)
            } catch (error) {
                // console.error('Error fetching all tasks:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAllTasks()
    }, []) // Add allTasks as a dependency to refetch when it changes

    return (
        <context.Provider value={{ user, setUser, isLoading, setIsLoading, allUsers, setAllUsers, allTasks, setAllTasks }}>
            {children}
        </context.Provider>
    )
}
export default ContextProvider