"use client"

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Loader2 } from "lucide-react"
import { userGetRequest, userPostRequest } from "@/service/viewService"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { handleAdminuser, handleUser } from "@/redux/userReducer/userRducer"

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
   password: Yup.string()
    .min(6, "Password is invalid")
    .required("Password is required"),
})

const UserLogin = () => {
  const [submitLoader, setSubmitLoader] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()
  const staticData = useSelector((state) => state.setting.staticData)

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values)
    },
  })

  const handleSubmit = async (values) => {
    setSubmitLoader(true)

    try {
      const formData = new FormData()
      formData.append("email", values.email)
      formData.append("password", values.password)

      const res = await userPostRequest("/frontend-login", formData)
      if(res.status == 1){
        
        if (res.data?.token) {
            // Store token in localStorage
            localStorage.setItem("usertoken", res.data.token)
            dispatch(handleUser(res.data.user))
            
            // Show success message
            toast.success(res.message || "Login successful!")
            
            // Use window.location for hard redirect to ensure page reloads
            setTimeout(() => {
              window.location.href = "/"
            }, 500)
        } else {
          setSubmitLoader(false)
        }
      }else{
        toast.error(res.message || "Login failed. Please try again.")
        setSubmitLoader(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.message || "Login failed. Please try again.")
      setSubmitLoader(false)
    }
  }

  const handleOtpLogin = () => {
    // Handle OTP login logic here
    toast.info("OTP login functionality to be implemented")
  }

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-wrap lg:flex-nowrap transition-all duration-300 hover:shadow-2xl">
      {/* Left side - Description */}
      {staticData?.login_page_content && (
        <div className="order-2 lg:order-none w-full lg:w-1/2 px-6 sm:px-10 sm:py-10 xl:p-16 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-200/30 rounded-full blur-3xl translate-y-16 -translate-x-16"></div>
          
          <div 
            className="relative z-10 max-w-none
              [&_*]:!bg-transparent
              [&>h1]:mb-4 [&>h1]:font-bold [&>h1]:text-2xl [&>h1]:text-gray-800 [&>h1]:leading-tight
              [&>h2]:mb-4 [&>h2]:font-bold [&>h2]:text-2xl [&>h2]:text-gray-800 [&>h2]:leading-tight
              [&>h3]:mb-3 [&>h3]:mt-6 [&>h3]:font-semibold [&>h3]:text-lg [&>h3]:text-gray-700
              [&>h4]:mb-2 [&>h4]:mt-4 [&>h4]:font-semibold [&>h4]:text-base [&>h4]:text-gray-700
              [&>p]:mb-3 [&>p]:text-gray-600 [&>p]:leading-relaxed [&>p]:text-sm md:[&>p]:text-base
              [&>strong]:font-semibold [&>strong]:text-gray-800
              [&>b]:font-semibold [&>b]:text-gray-800
              [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-3
              [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-3
              [&>li]:mb-1 [&>li]:text-gray-600 [&>li]:text-sm md:[&>li]:text-base
              animate-in fade-in slide-in-from-left-10 duration-700"
            style={{ backgroundColor: 'transparent' }}
            dangerouslySetInnerHTML={{ __html: staticData.login_page_content }}
          />
        </div>
      )}

      {/* Right side - Login Form */}
      <div className={`w-full ${staticData?.login_page_content ? 'lg:w-1/2' : 'lg:w-full lg:max-w-2xl lg:mx-auto'} p-6 sm:p-10 xl:p-16 relative animate-in fade-in slide-in-from-right-10 duration-700`}>
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          {/* Header with enhanced styling */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold text-gray-800 relative inline-block">
              Welcome Back
              <div className="absolute -bottom-1.5 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </h1>
            <p className="text-xs text-gray-500 mt-3">Please login to your account to continue</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="relative group">
              <Label htmlFor="email" className="text-gray-700 mb-1.5 block font-medium text-xs">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  maxLength={250}
                  className={`pl-10 pr-3 py-2.5 text-sm rounded-lg bg-white border-2 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                    formik.touched.email && formik.errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className={`size-8 left-2 top-1/2 -translate-y-1/2 absolute flex items-center justify-center pointer-events-none transition-colors duration-300 ${
                  formik.touched.email && formik.errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
                }`}>
                  <Mail className="h-4 w-4" />
                </div>
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-in slide-in-from-top-1 duration-300">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="relative group">
              <Label htmlFor="password" className="text-gray-700 mb-1.5 block font-medium text-xs">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  maxLength={250}
                  className={`pl-10 pr-3 py-2.5 text-sm rounded-lg bg-white border-2 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                    formik.touched.password && formik.errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className={`size-8 left-2 top-1/2 -translate-y-1/2 absolute flex items-center justify-center pointer-events-none transition-colors duration-300 ${
                  formik.touched.password && formik.errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
                }`}>
                  <Lock className="h-4 w-4" />
                </div>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-in slide-in-from-top-1 duration-300">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Links */}
            <div className="relative text-xs font-medium flex flex-wrap justify-between items-center gap-2 pt-1">
              <Link 
                href="/forgot-password" 
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 underline-offset-4"
              >
                Forgot Password?
              </Link>
              <Link 
                href="/register" 
                className="text-gray-600 hover:text-gray-800 hover:underline transition-colors duration-200 underline-offset-4"
              >
                Create an account
              </Link>
            </div>

            {/* Buttons */}
            <div className="relative flex flex-col gap-2.5 pt-3">
              <Button
                type="submit"
                disabled={submitLoader || !formik.isValid}
                className="relative text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 w-full py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
              >

                <span className="relative z-10 flex items-center justify-center">
                  {submitLoader ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login Now"
                  )}
                </span>
              </Button>

              <div className="relative flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative bg-white px-3 text-xs text-gray-500 font-medium">OR</div>
              </div>

              <Button
                type="button"
                onClick={handleOtpLogin}
                className="relative text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 w-full py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                <span className="relative z-10">Login With OTP</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserLogin
