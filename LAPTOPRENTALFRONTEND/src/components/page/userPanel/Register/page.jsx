"use client"

import { useState, useEffect, useCallback } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CustomCombobox } from "@/components/common/customcombox"
import { User, Mail, Lock, Loader2, Phone } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"
import Link from "next/link"
import { useSelector } from "react-redux"

// Phone number validation regex
const phoneRegex = /^[+]?[1-9][\d]{0,15}$/

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .required("Username is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phone_number: Yup.string().matches(phoneRegex, "Invalid phone number").required("Phone number is required"),
  country_id: Yup.string().nullable().required("Country is required"),
  state_id: Yup.string().nullable().required("State is required"),
  city_id: Yup.string().nullable().required("City is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
})

const UserRegister = () => {
  const [submitLoader, setSubmitLoader] = useState(false)
  const [countryListing, setCountryListing] = useState([])
  const [stateListing, setStateListing] = useState([])
  const [cityListing, setCityListing] = useState([])
  const router = useRouter()
  const staticData = useSelector((state) => state.setting.staticData)

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone_number: "",
      country_id: '' ,
      state_id: '' ,
      city_id: '' ,
      password: "",
      confirm_password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values)
    },
  })

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      const res = await apiGet("/get-form-country-list")
      setCountryListing(res.data || [])
    } catch (error) {
      toast.error(error.message || "Failed to fetch countries")
    }
  }

  const fetchStates = useCallback(
    async (countryId) => {
      
      try {
        const res = await apiGet(`/get-form-state-list?country_id=${countryId}`)
        setStateListing(res.data || [])
        // Reset state and city when country changes
        formik.setFieldValue("state_id", null)
        formik.setFieldValue("city_id", null)
        setCityListing([])
      } catch (error) {
        toast.error(error.message || "Failed to fetch states")
        setStateListing([])
      }
    },
    [formik],
  )

  const fetchCities = useCallback(
    async (stateId) => {
      try {
        const res = await apiGet(`/get-form-city-list?state_id=${stateId}`)
        setCityListing(res.data || [])
        // Reset city when state changes
        formik.setFieldValue("city_id", null)
      } catch (error) {
        toast.error(error.message || "Failed to fetch cities")
        setCityListing([])
      }
    },
    [formik],
  )

  const handleCountryChange = useCallback(
    (country) => {
      
      formik.setFieldValue("country_id", country)
      if (country) {
        fetchStates(country)
      } else {
        setStateListing([])
        setCityListing([])
        formik.setFieldValue("state_id", null)
        formik.setFieldValue("city_id", null)
      }
    },
    [formik, fetchStates],
  )

  const handleStateChange = useCallback(
    (state) => {
      formik.setFieldValue("state_id", state)
      if (state) {
        fetchCities(state)
      } else {
        setCityListing([])
        formik.setFieldValue("city_id", null)
      }
    },
    [formik, fetchCities],
  )

  const handleCityChange = useCallback(
    (city) => {
      formik.setFieldValue("city_id", city)
    },
    [formik],
  )

  const handleSubmit = async (values) => {
    setSubmitLoader(true)

    try {
      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("email", values.email)
      formData.append("phone_number", values.phone_number)
      formData.append("country_id", values.country_id || "")
      formData.append("state_id", values.state_id || "")
      formData.append("city_id", values.city_id || "")
      formData.append("password", values.password)
      formData.append("confirm_password", values.confirm_password)

      const res = await apiPost("/frontend-registration", formData)
      if(res.status == 1){
        toast.success(res.message || "Registration successful!")
        formik.resetForm()
        
        // Use window.location for hard redirect
        setTimeout(() => {
          window.location.href = "/login"
        }, 500)
      }else{
        toast.error(res.message)
        setSubmitLoader(false)
      }
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.")
      setSubmitLoader(false)
    }
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

      {/* Right side - Registration Form */}
      <div className={`w-full ${staticData?.login_page_content ? 'lg:w-1/2' : 'lg:w-full lg:max-w-3xl lg:mx-auto'} p-6 sm:p-10 xl:p-16 relative animate-in fade-in slide-in-from-right-10 duration-700`}>
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          {/* Header with enhanced styling */}
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold text-gray-800 relative inline-block">
              Create Account
              <div className="absolute -bottom-1.5 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </h1>
            <p className="text-xs text-gray-500 mt-3">Join us today and get started</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-3.5">
            {/* Username Field */}
            <div className="group relative">
              <Label htmlFor="name" className="text-xs font-medium text-gray-700 mb-1.5 block transition-colors group-hover:text-blue-600">
                Username *
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your username"
                  maxLength={250}
                  className="h-9 pl-9 pr-3 text-xs border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-blue-500 pointer-events-none">
                  <User className="h-3.5 w-3.5" />
                </div>
              </div>
              {formik.touched.name && formik.errors.name && (
                <div className="text-red-500 text-xs mt-1 ml-1 animate-in slide-in-from-left-2 duration-200">{formik.errors.name}</div>
              )}
            </div>

            {/* Email Field */}
            <div className="group relative">
              <Label htmlFor="email" className="text-xs font-medium text-gray-700 mb-1.5 block transition-colors group-hover:text-blue-600">
                Email Address *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  maxLength={250}
                  className="h-9 pl-9 pr-3 text-xs border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-blue-500 pointer-events-none">
                  <Mail className="h-3.5 w-3.5" />
                </div>
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-xs mt-1 ml-1 animate-in slide-in-from-left-2 duration-200">{formik.errors.email}</div>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="group relative">
              <Label htmlFor="phone_number" className="text-xs font-medium text-gray-700 mb-1.5 block transition-colors group-hover:text-blue-600">
                Phone Number *
              </Label>
              <div className="relative">
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="Enter your phone number"
                  maxLength={20}
                  className="h-9 pl-9 pr-3 text-xs border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-blue-500 pointer-events-none">
                  <Phone className="h-3.5 w-3.5" />
                </div>
              </div>
              {formik.touched.phone_number && formik.errors.phone_number && (
                <div className="text-red-500 text-xs mt-1 ml-1 animate-in slide-in-from-left-2 duration-200">{formik.errors.phone_number}</div>
              )}
            </div>

            {/* Country Dropdown */}
            <div className="group relative ">
              <Label className="text-xs font-medium text-gray-700 mb-1.5 block transition-colors group-hover:text-blue-600">
                Country *
              </Label>
              <CustomCombobox
                options={countryListing}
                value={formik.values.country_id}
                onChange={handleCountryChange}
                placeholder="Select Country"
                valueKey="unique_id"
                labelKey="name"
                className="h-9 text-xs border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
              />
              {formik.touched.country_id && formik.errors.country_id && (
                <div className="text-red-500 text-xs absolute -bottom-0 left-1 animate-in slide-in-from-left-2 duration-200">
                  {typeof formik.errors.country_id === "string" ? formik.errors.country_id : "Country is required"}
                </div>
              )}
            </div>

            {/* State Dropdown */}
            <div className="group relative ">
              <Label className="text-xs font-medium text-gray-700 mb-1.5 block transition-colors group-hover:text-blue-600">
                State *
              </Label>
              <CustomCombobox
                options={stateListing}
                value={formik.values.state_id}
                onChange={handleStateChange}
                placeholder="Select State"
                valueKey="unique_id"
                labelKey="name"
                className="h-9 text-xs border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
              />
              {formik.touched.state_id && formik.errors.state_id && (
                <div className="text-red-500 text-xs absolute -bottom-0 left-1 animate-in slide-in-from-left-2 duration-200">
                  {typeof formik.errors.state_id === "string" ? formik.errors.state_id : "State is required"}
                </div>
              )}
            </div>

            {/* City Dropdown */}
            <div className="group relative ">
              <Label className="text-xs font-medium text-gray-700 mb-1.5 block transition-colors group-hover:text-blue-600">
                City *
              </Label>
              <CustomCombobox
                options={cityListing}
                value={formik.values.city_id}
                onChange={handleCityChange}
                placeholder="Select City"
                valueKey="unique_id"
                labelKey="name"
                className="h-9 text-xs border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
              />
              {formik.touched.city_id && formik.errors.city_id && (
                <div className="text-red-500 text-xs absolute -bottom-0 left-1 animate-in slide-in-from-left-2 duration-200">
                  {typeof formik.errors.city_id === "string" ? formik.errors.city_id : "City is required"}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="group relative">
              <Label htmlFor="password" className="text-xs font-medium text-gray-700 mb-1.5 block transition-colors group-hover:text-blue-600">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  maxLength={250}
                  className="h-9 pl-9 pr-3 text-xs border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-blue-500 pointer-events-none">
                  <Lock className="h-3.5 w-3.5" />
                </div>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-xs mt-1 ml-1 animate-in slide-in-from-left-2 duration-200">{formik.errors.password}</div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="group relative">
              <Label htmlFor="confirm_password" className="text-xs font-medium text-gray-700 mb-1.5 block transition-colors group-hover:text-blue-600">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="Re-enter your password"
                  maxLength={250}
                  className="h-9 pl-9 pr-3 text-xs border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white"
                  value={formik.values.confirm_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-blue-500 pointer-events-none">
                  <Lock className="h-3.5 w-3.5" />
                </div>
              </div>
              {formik.touched.confirm_password && formik.errors.confirm_password && (
                <div className="text-red-500 text-xs mt-1 ml-1 animate-in slide-in-from-left-2 duration-200">{formik.errors.confirm_password}</div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitLoader || !formik.isValid}
              className="w-full h-9 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitLoader ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center pt-3">
              <p className="text-xs text-gray-600">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserRegister
