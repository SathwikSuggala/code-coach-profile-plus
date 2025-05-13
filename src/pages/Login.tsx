import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { login } = useAuth();

  // Mouse movement tracking with spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 100 };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(userName, password);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate particles with varying properties
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 30 + 20,
    delay: Math.random() * 5,
  }));

  // Generate aurora points
  const auroraPoints = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 200 + 100,
    duration: Math.random() * 20 + 30,
  }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Base gradient background */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, #3498db10 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, #2980b910 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, #3498db10 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, #2980b910 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Gradient wave animation */}
      <motion.div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          background: "linear-gradient(45deg, transparent 0%, rgba(52, 152, 219, 0.1) 50%, transparent 100%)",
        }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Aurora effects */}
      {auroraPoints.map((point) => (
        <motion.div
          key={point.id}
          className="absolute rounded-full blur-3xl"
          style={{
            width: point.size,
            height: point.size,
            left: `${point.x}%`,
            top: `${point.y}%`,
            background: `radial-gradient(circle at center, 
              rgba(52, 152, 219, 0.1) 0%,
              rgba(41, 128, 185, 0.1) 50%,
              rgba(52, 152, 219, 0.1) 100%)`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: point.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-500/10 backdrop-blur-sm"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Mouse-responsive parallax layers */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          x: useSpring(useTransform(mouseX, [-1, 1], [-20, 20]), springConfig),
          y: useSpring(useTransform(mouseY, [-1, 1], [-20, 20]), springConfig),
        }}
      >
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(circle at center, rgba(52, 152, 219, 0.2) 0%, transparent 70%)",
            x: useSpring(useTransform(mouseX, [-1, 1], [-50, 50]), springConfig),
            y: useSpring(useTransform(mouseY, [-1, 1], [-50, 50]), springConfig),
          }}
        />
      </motion.div>

      {/* Morphing blobs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
        style={{
          background: "radial-gradient(circle at center, #3498db 0%, #2980b9 50%, #3498db 100%)",
          x: useSpring(useTransform(mouseX, [-1, 1], [-100, 100]), springConfig),
          y: useSpring(useTransform(mouseY, [-1, 1], [-100, 100]), springConfig),
        }}
        animate={{
          scale: [1, 1.2, 1],
          borderRadius: ["60% 40% 30% 70%/60% 30% 70% 40%", "30% 60% 70% 40%/50% 60% 30% 60%", "60% 40% 30% 70%/60% 30% 70% 40%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md shadow-lg backdrop-blur-md bg-white/80 border border-blue-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">Login to Code Assist</CardTitle>
            <CardDescription className="text-gray-900">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userName" className="text-gray-900">Username</Label>
                  <Input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    placeholder="Enter your username"
                    className="bg-white/50 border-blue-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-900">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="bg-white/50 border-blue-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-900">
              Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
