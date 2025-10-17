// import React, { useState } from "react";
// import { Link } from "react-router";
// import { EyeCloseIcon, EyeIcon } from "../../icons";
// import Label from "../form/Label";
// import Input from "../form/input/InputField";
// import api from "../../services/baseapi";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router";
// import Spinner from "../spinner/spinner";
// import { handleError } from "../../utils/handleError";

// export default function SignUpForm() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [signupform, setSignUpForm] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     password: "",
//     mobile_number: "",
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setSignUpForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     for (const [key, value] of Object.entries(signupform)) {
//       if (!value.trim()) {
//         const formattedKey = key
//           .replace("_", " ")
//           .replace(/\b\w/g, (char) => char.toUpperCase());
//         setLoading(false);
//         toast.error(`Please fill ${formattedKey}`);
//         return;
//       }
//     }
//     try {
//       await api.post("admin/register/", signupform);
//       navigate("/");
//       toast.success("Signup Successfully !");
//     } catch (error: any) {
//       console.error("Error Occurred:", error);
//       console.log(error.response.data);
//       handleError(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
//       <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//         <div>
//           <div className="mb-2">
//             <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
//               Sign Up
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Enter your email and password to sign up!
//             </p>
//           </div>
//           <div>
//             <div className="relative py-3 sm:py-5">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
//               </div>
//               <div className="relative flex justify-center text-sm"></div>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="space-y-5">
//                 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
//                   {/* <!-- First Name --> */}
//                   <div className="sm:col-span-1">
//                     <Label>
//                       First Name<span className="text-error-500">*</span>
//                     </Label>
//                     <Input
//                       type="text"
//                       id="fname"
//                       name="first_name"
//                       value={signupform.first_name}
//                       onChange={handleInputChange}
//                       placeholder="Enter your first name"
//                     />
//                   </div>
//                   {/* <!-- Last Name --> */}
//                   <div className="sm:col-span-1">
//                     <Label>
//                       Last Name<span className="text-error-500">*</span>
//                     </Label>
//                     <Input
//                       type="text"
//                       id="lname"
//                       name="last_name"
//                       value={signupform.last_name}
//                       onChange={handleInputChange}
//                       placeholder="Enter your last name"
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   {/* <!-- Email --> */}
//                   <div>
//                     <Label>
//                       Email<span className="text-error-500">*</span>
//                     </Label>
//                     <Input
//                       type="email"
//                       id="email"
//                       name="email"
//                       value={signupform.email}
//                       onChange={handleInputChange}
//                       placeholder="Enter your email"
//                     />
//                   </div>
//                   {/* <!-- Mobile Number --> */}
//                   <div>
//                     <Label>
//                       Mobile Number<span className="text-error-500">*</span>
//                     </Label>
//                     <Input
//                       type="number"
//                       id="-mobile-number"
//                       name="mobile_number"
//                       value={signupform.mobile_number}
//                       onChange={handleInputChange}
//                       placeholder="Enter your mobile number"
//                       className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                     />
//                   </div>
//                 </div>

//                 {/* <!-- Password --> */}
//                 <div>
//                   <Label>
//                     Password<span className="text-error-500">*</span>
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       placeholder="Enter your password"
//                       name="password"
//                       value={signupform.password}
//                       onChange={handleInputChange}
//                       type={showPassword ? "text" : "password"}
//                     />
//                     <span
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
//                     >
//                       {showPassword ? (
//                         <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
//                       ) : (
//                         <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
//                       )}
//                     </span>
//                   </div>
//                 </div>

//                 {/* <!-- Button --> */}
//                 <div>
//                   <button
//                     className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 ${
//                       loading ? "opacity-60 cursor-not-allowed" : ""
//                     }`}
//                     type="submit"
//                     disabled={loading}
//                   >
//                     {loading && <Spinner />}
//                     {loading ? "Signing Up..." : "Sign Up"}
//                   </button>
//                 </div>
//               </div>
//             </form>

//             <div className="mt-5">
//               <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
//                 Already have an account? {""}
//                 <Link
//                   to="/signin"
//                   className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
//                 >
//                   Sign In
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
