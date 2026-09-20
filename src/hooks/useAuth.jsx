import { registerUser, loginUser, logoutUser } from "../api/auth.api.js"
import Toast from 'react-hot-toast'
import {useContext} from 'react'
import {context} from '../context/context.jsx'
import { useNavigate } from 'react-router-dom'

const useAuth = () => {
    const {setUser, setIsLoading} = useContext(context)
    const navigate = useNavigate()

    const register = async (name, email, password) => {
        try {
            setIsLoading(true)
            const response = await registerUser(name, email, password)
            // console.log('User registered successfully:', response)
            setUser(response)
            Toast.success('User registered successfully')
            if (response.role === 'worker') {
                navigate('/worker')
            }
            if (response.role === 'manager') {
                navigate('/manager')
            }
        } catch (error) {
            // console.error('Error registering user:', error)
            Toast.error(error?.message || 'Error registering user')
        } finally {
            setIsLoading(false)
        }

    }
    const login = async (email, password) => {
        try {
            setIsLoading(true)
            const response = await loginUser(email, password)
            // console.log('User logged in successfully:', response)
            setUser(response)
            Toast.success('User logged in successfully')
            if (response.role === 'worker') {
                navigate('/worker')
            }
            if (response.role === 'manager') {
                navigate('/manager')
            }
        } catch (error) {
            // console.error('Error logging in user:', error)
            Toast.error(error?.message || 'Error logging in user')
        } finally {
            setIsLoading(false)
        }
    }
    const logout = async () => {
        try {
            setIsLoading(true)
            await logoutUser()
            // console.log('User logged out successfully')
            setUser(null)
            Toast.success('User logged out successfully')
            navigate('/auth')
        } catch (error) {
            console.error('Error logging out user:', error)
        } finally {
            setIsLoading(false)
        }
    }
    return { register, login, logout }
}
export default useAuth