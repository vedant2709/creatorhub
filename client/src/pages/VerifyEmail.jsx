import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { CheckCircleIcon, SpinnerIcon, TimesCircleIcon } from "../components/FontAwesomeIcons";

export default function VerifyEmail(){
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState("Verifying...");

    const {token} = useParams();
    useEffect(()=>{

        console.log("Token...",token)

        if(!token){
            setMessage("Invalid verification link");
            toast.error("Invalid verification link");
            return;
        }

        const verify = async () => {
            try {
                await api.get(`/auth/verify-email/${token}`);
                setMessage("✅ Email verified successfully")
                toast.success("Email verified successfully");
            } catch (error) {
                console.log(error)
                const errorMsg = error.response?.data?.message || "Verification failed";
                setMessage(errorMsg);
                toast.error(errorMsg);
            }
        }

        verify();
    },[]);
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4 text-2xl">
            {message.includes("✅") ? (
              <CheckCircleIcon className="text-blue-600" />
            ) : message === "Verifying..." ? (
              <SpinnerIcon className="text-blue-600 animate-spin" />
            ) : (
              <TimesCircleIcon className="text-red-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification</h2>
          <p className="text-gray-600 text-lg">{message}</p>
        </div>
        
        {message.includes("✅") && (
          <div className="mt-6">
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Go to Login
            </button>
          </div>
        )}

        {!message.includes("✅") && message !== "Verifying..." && (
           <div className="mt-6">
           <button
             onClick={() => (window.location.href = "/register")}
             className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
           >
             Back to Register
           </button>
         </div>
        )}
      </div>
    </div>
  );
}