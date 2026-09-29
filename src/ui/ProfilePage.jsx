import React, { useContext, useState, useEffect } from "react";
import { context } from "../context/context.jsx";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth.jsx";
import {
    User,
    Mail,
    Phone,
    DollarSign,
    Lock,
    Building2,
    CreditCard,
    Smartphone,
    Camera,
    CheckCircle2,
} from "lucide-react";

const ProfilePage = () => {
    const { updatePayment, updateProfile } = useAuth();
    const { user } = useContext(context);
    const { id } = useParams();

    // Profile Form States
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate || "");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState(user?.phone || "");
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
    const [profileMessage, setProfileMessage] = useState(null);

    // Payment Form States
    const [accountHolderName, setAccountHolderName] = useState(
        user?.paymentMethod?.accountHolderName || ""
    );
    const [bankName, setBankName] = useState(user?.paymentMethod?.bankName || "");
    const [accountNumber, setAccountNumber] = useState(
        user?.paymentMethod?.accountNumber || ""
    );
    const [jazzcashOrEasypaisaNumber, setJazzcashOrEasypaisaNumber] = useState(
        user?.paymentMethod?.jazzcashOrEasypaisa || ""
    );
    const [activePaymentTab, setActivePaymentTab] = useState("bank");
    const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState(null);

    // Sync state when User Context updates
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
            setHourlyRate(user.hourlyRate || "");
            setAvatarPreview(user.avatar || null);

            if (user.paymentMethod) {
                setAccountHolderName(user.paymentMethod.accountHolderName || "");
                setBankName(user.paymentMethod.bankName || "");
                setAccountNumber(user.paymentMethod.accountNumber || "");
                setJazzcashOrEasypaisaNumber(user.paymentMethod.jazzcashOrEasypaisa || "");
            }
        }
    }, [user]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsProfileSubmitting(true);
        setProfileMessage(null);
        const userId = id || user?._id;

        try {
            const profileResult = await updateProfile(
                userId,
                name,
                email,
                phone,
                hourlyRate,
                password,
                avatar
            );
            setProfileMessage({ type: "success", text: "Profile updated successfully" });
            setPassword("");
            setTimeout(() => setProfileMessage(null), 3000);
        } catch (error) {
            setProfileMessage({ type: "error", text: error.message || "Failed to update profile" });
        } finally {
            setIsProfileSubmitting(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setIsPaymentSubmitting(true);
        setPaymentMessage(null);
        const userId = id || user?._id;

        try {
            const paymentResult = await updatePayment(
                userId,
                bankName,
                accountNumber,
                accountHolderName,
                jazzcashOrEasypaisaNumber
            );
            setPaymentMessage({ type: "success", text: "Payment method saved successfully" });
            setTimeout(() => setPaymentMessage(null), 3000);
        } catch (error) {
            setPaymentMessage({ type: "error", text: error.message || "Failed to save payment method" });
        } finally {
            setIsPaymentSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen  text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Account Settings</h1>
                    <p className="text-slate-400 mt-2">Manage your profile information and payment details</p>
                </div>

                {/* Profile Header Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        {/* Avatar Section */}
                        <div className="relative group shrink-0">
                            <div className="h-24 w-24 rounded-lg border border-slate-700 bg-slate-800 overflow-hidden flex items-center justify-center">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User className="h-10 w-10 text-slate-600" />
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                                <Camera className="h-5 w-5 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="mb-3">
                                <h2 className="text-2xl font-bold text-white">{name || "User Profile"}</h2>
                                <p className="text-sm text-slate-400 mt-1">{user?.role || "Worker"}</p>
                            </div>
                            <div className="space-y-1.5 text-sm">
                                <p className="flex items-center gap-2 text-slate-300">
                                    <Mail className="h-4 w-4 text-slate-600" />
                                    {email || "No email"}
                                </p>
                                <p className="flex items-center gap-2 text-slate-300">
                                    <Phone className="h-4 w-4 text-slate-600" />
                                    {phone || "No phone"}
                                </p>
                            </div>
                        </div>

                        {/* User ID */}
                        <div className="sm:text-right">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">User ID</p>
                            <p className="text-sm font-mono font-semibold text-slate-200 mt-1">
                                {id || user?._id?.slice(-12) || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Form 1: Personal Information */}
                    <form
                        onSubmit={handleProfileSubmit}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-6"
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                            <p className="text-sm text-slate-400 mt-1">Update your profile details</p>
                        </div>

                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="03001234567"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Hourly Rate */}
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                                    Hourly Rate (USD/hr)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={hourlyRate}
                                        onChange={(e) => setHourlyRate(e.target.value)}
                                        placeholder="25"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                                    Change Password
                                </label>
                                <p className="text-xs text-slate-500 mb-2">Leave blank to keep your current password</p>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status Message */}
                        {profileMessage && (
                            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${profileMessage.type === "success"
                                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-200"
                                    : "bg-red-500/10 border border-red-500/30 text-red-200"
                                }`}>
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                <p className="text-sm">{profileMessage.text}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isProfileSubmitting}
                            className="w-full mt-6 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {isProfileSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </form>

                    {/* Form 2: Payment Method */}
                    <form
                        onSubmit={handlePaymentSubmit}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-6"
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white">Payment Method</h3>
                            <p className="text-sm text-slate-400 mt-1">Set up your payout destination</p>
                        </div>

                        <div className="space-y-4">
                            {/* Account Holder Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                                    Account Holder Name <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                    <input
                                        type="text"
                                        required
                                        value={accountHolderName}
                                        onChange={(e) => setAccountHolderName(e.target.value)}
                                        placeholder="Your official name"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Payment Method Tabs */}
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-2.5">
                                    Payout Method <span className="text-red-400">*</span>
                                </label>
                                <div className="flex gap-2 mb-4 bg-slate-800 rounded-lg p-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setActivePaymentTab("bank")}
                                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition ${activePaymentTab === "bank"
                                                ? "bg-slate-700 text-white border border-slate-600"
                                                : "text-slate-400 hover:text-slate-200"
                                            }`}
                                    >
                                        <Building2 className="inline h-4 w-4 mr-1.5" />
                                        Bank Transfer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActivePaymentTab("wallet")}
                                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition ${activePaymentTab === "wallet"
                                                ? "bg-slate-700 text-white border border-slate-600"
                                                : "text-slate-400 hover:text-slate-200"
                                            }`}
                                    >
                                        <Smartphone className="inline h-4 w-4 mr-1.5" />
                                        Mobile Wallet
                                    </button>
                                </div>
                            </div>

                            {/* Bank Transfer Tab */}
                            {activePaymentTab === "bank" && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-200 mb-1.5">
                                            Bank Name <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                            <input
                                                type="text"
                                                required
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                placeholder="e.g. Meezan Bank, HBL"
                                                className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-200 mb-1.5">
                                            Account / IBAN Number <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                            <input
                                                type="text"
                                                required
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                placeholder="PK36MEZN0001020304050607"
                                                className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Mobile Wallet Tab */}
                            {activePaymentTab === "wallet" && (
                                <div className="animate-fadeIn">
                                    <label className="block text-sm font-medium text-slate-200 mb-1.5">
                                        Mobile Number <span className="text-red-400">*</span>
                                    </label>
                                    <p className="text-xs text-slate-500 mb-2">For JazzCash or EasyPaisa</p>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                        <input
                                            type="text"
                                            required
                                            value={jazzcashOrEasypaisaNumber}
                                            onChange={(e) => setJazzcashOrEasypaisaNumber(e.target.value)}
                                            placeholder="03001234567"
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status Message */}
                        {paymentMessage && (
                            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${paymentMessage.type === "success"
                                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-200"
                                    : "bg-red-500/10 border border-red-500/30 text-red-200"
                                }`}>
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                <p className="text-sm">{paymentMessage.text}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPaymentSubmitting}
                            className="w-full mt-6 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {isPaymentSubmitting ? "Saving..." : "Save Payment Details"}
                        </button>
                    </form>

                </div>

            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 200ms ease-in;
        }
      `}</style>
        </div>
    );
};

export default ProfilePage;