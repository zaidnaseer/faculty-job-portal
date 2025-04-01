import { createContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
      
        
        const token = localStorage.getItem("token");
        console.log(token)
        if (!token) return;

        // ✅ Decode token to extract user data
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

        const response = await fetch("/api/auth/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {

          const data = await response.json();
          const userData = {
            id: decoded.id, // ✅ Store user ID
            name: data.name,
            email: data.email,
            role: decoded.role, // ✅ Ensure role is extracted
            token,
          };

          // ✅ Store user data in localStorage
          setUser({...userData});
          console.log("User from auth:", user)
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
            console.log("Failed to fetch user data");
          throw new Error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        logout(); // Logout on token failure
      }
    };

    fetchUser();
  }, []);

  const login = (userData, token) => {
    // ✅ Decode token to extract user ID and role
    const decoded = jwtDecode(token);

    const fullUserData = {
      ...userData,
      id: decoded.id, // ✅ Extract id from token
      role: decoded.role, // ✅ Extract role from token
      token,
    };

    setUser(fullUserData);
    localStorage.setItem("user", JSON.stringify(fullUserData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
