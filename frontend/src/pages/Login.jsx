import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../slices/authSlice"; 
import api from "../api/index"; 
import { toast } from "react-toastify"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Call Backend Login API
      const res = await api.request("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // 2. Save to Redux & LocalStorage
      // NOTE: Ensure your authSlice handles saving to localStorage automatically
      // or do localStorage.setItem('userInfo', JSON.stringify(res)) here if not using Redux persist
      dispatch(setCredentials({ ...res }));
      
      // 3. Redirect
      navigate(redirect);
    } catch (err) {
      const errorMsg = err?.message || "Invalid email or password";
      if(toast) toast.error(errorMsg);
      else alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 shadow-lg rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Sign In</h2>
          <p className="mt-2 text-sm text-gray-600">Welcome back to Flyem Store</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-400"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="text-center mt-4">
             <p className="text-sm text-gray-600">
               New Customer?{" "}
               <Link to={redirect ? `/register?redirect=${redirect}` : "/register"} className="font-medium text-black hover:underline">
                 Register Here
               </Link>
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;