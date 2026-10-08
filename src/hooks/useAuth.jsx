import { registerUser, loginUser, logoutUser, updatePaymentMethod, updateUserProfile, sendVerificationCode, verifyEmailCode, deleteUserByAdmin } from "../api/auth.api.js"
import Toast from 'react-hot-toast'
import { useContext } from 'react'
import { context } from '../context/context.jsx'
import { useNavigate } from 'react-router-dom'

const useAuth = () => {
    const { setUser, setIsLoading } = useContext(context)
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
            if(response.role === 'admin'){
                navigate('/admin')
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
            if(response.role === 'admin'){
                navigate('/admin')
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
            navigate('/')
        } catch (error) {
            console.error('Error logging out user:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const updatePayment = async (
        userId,
        bankName,
        accountNumber,
        accountHolderName,
        jazzcashOrEasypaisaNumber
    ) => {
        try {
            // 1. Send JSON Payload instead of FormData
            const paymentData = {
                bankName: bankName?.trim() || "",
                accountNumber: accountNumber?.trim() || "",
                accountHolderName: accountHolderName?.trim() || "",
                jazzcashOrEasypaisa: jazzcashOrEasypaisaNumber?.trim() || "",
            };

            const response = await updatePaymentMethod(userId, paymentData);

            // 2. Correct Toast syntax
            Toast.success("Payment method updated successfully!");
            return response;
        } catch (error) {
            console.error("Error updating payment method:", error);

            // Extract exact backend error response message
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Error updating payment method";

            Toast.error(errorMessage);
            throw error;
        }
    };
    const updateProfile = async (userId, name, email, phone, hourlyRate, password, avatar) => {
        try {
            setIsLoading(true)
            const formData = new FormData()
            formData.append('name', name)
            formData.append('email', email)
            formData.append('phone', phone)
            formData.append('hourlyRate', hourlyRate)
            formData.append('password', password)
            if (avatar) formData.append('avatar', avatar)
            const response = await updateUserProfile(userId, formData)
            // console.log('User profile updated successfully:', response)
            setUser(response)
            Toast.success('User profile updated successfully')
            return response
        } catch (error) {
            console.error('Error updating user profile:', error)
            Toast.error(error?.message || 'Error updating user profile')
            throw error // Rethrow the error to allow the calling component to handle it
        } finally {
            setIsLoading(false)
        }
    }

    const sendEmailVerificationCode = async (email) => {
        try {
            setIsLoading(true)
            const response = await sendVerificationCode(email)
            Toast.success('Verification code sent successfully')
            return response
        } catch (error) {
            console.error('Error sending verification code:', error)
            Toast.error(error?.message || 'Error sending verification code')
            throw error // Rethrow the error to allow the calling component to handle it
        } finally {
            setIsLoading(false)
        }
    }

    const verifyEmail = async (email, code) => {
        try {
            setIsLoading(true)
            const response = await verifyEmailCode(email, code)
            Toast.success('Email verified successfully')
            return response
        } catch (error) {
            console.error('Error verifying email:', error)
            Toast.error(error?.message || 'Error verifying email')
            throw error // Rethrow the error to allow the calling component to handle it
        } finally {
            setIsLoading(false)
        }
    }

    const deleteUser = async (userId) => {
        try {
            setIsLoading(true)
            const response = await deleteUserByAdmin(userId)
            Toast.success('User deleted successfully')
            return response
        } catch (error) {
            console.error('Error deleting user:', error)
            Toast.error(error?.message || 'Error deleting user')
            throw error // Rethrow the error to allow the calling component to handle it
        } finally {
            setIsLoading(false)
        }
    }
    return { register, login, logout, updatePayment, updateProfile, sendEmailVerificationCode, verifyEmail, deleteUser }
}
export default useAuth