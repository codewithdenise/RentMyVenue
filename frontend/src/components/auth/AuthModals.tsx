import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";

// Sign In Form Schema
const signInFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  remember: z.boolean().default(false),
});

// Sign Up Form Schema
const signUpFormSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters",
      })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),
    confirmPassword: z.string(),
    role: z.enum(["user", "vendor", "admin"] as const),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// OTP Form Schema
const otpFormSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only digits" }),
});

export type AuthModalType = "login" | "signup" | "none";

interface AuthModalsProps {
  open: AuthModalType;
  onOpenChange: (open: AuthModalType) => void;
  signupRole?: UserRole; // New prop to fix signup role, default "user"
}

const AuthModals: React.FC<AuthModalsProps> = ({
  open,
  onOpenChange,
  signupRole = "user",
}) => {
  const {
    login,
    register,
    requestOtp,
    verifyOtp,
    error,
    isLoading,
    clearError,
  } = useAuth();

  // State for OTP verification
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  // Remove role state, use signupRole prop instead
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forms
  const signInForm = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const signUpForm = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: signupRole, // Set the role from props
    },
  });

  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleSignInSubmit = async (
    values: z.infer<typeof signInFormSchema>,
  ) => {
    clearError();
    setEmail(values.email);
    setPassword(values.password);

    // Prevent admin login from modal
    if (values.email.toLowerCase().includes("admin")) {
      clearError();
      return;
    }

    try {
      // First, attempt to send OTP for login
      const otpSent = await requestOtp(values.email, 'login');

      if (otpSent) {
        setShowOtpForm(true);
      }
    } catch (err) {
      console.error("Failed to send OTP:", err);
    }
  };

  const handleSignUpSubmit = async (
    values: z.infer<typeof signUpFormSchema>,
  ) => {
    try {
      clearError();
      
      // Store form data for OTP verification
      setEmail(values.email);
      setPassword(values.password);
      setName(values.name);

      // First validate the form data
      if (!values.email || !values.password || !values.name) {
        return;
      }

      // Send OTP for verification
      const otpSent = await requestOtp(values.email, 'signup');

      if (otpSent) {
        // Show OTP form if OTP was sent successfully
        setShowOtpForm(true);
      }
    } catch (err) {
      console.error("Failed to send OTP:", err);
    }
  };

  const handleOtpSubmit = async (values: z.infer<typeof otpFormSchema>) => {
    try {
      clearError();
      // First verify the OTP
      const isOtpValid = await verifyOtp(email, values.otp);

      if (isOtpValid) {
        if (open === "login") {
          // Complete the sign in process
          await login(email, password, signInForm.getValues().remember);
          resetForms();
          onOpenChange("none");
        } else if (open === "signup") {
          // Complete the sign up process with fixed role
          const registered = await register(email, password, name, signupRole);
          
          if (registered) {
            // Switch to login modal after successful registration
            resetForms();
            onOpenChange("login");
          }
        }
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  const resetForms = () => {
    signInForm.reset();
    signUpForm.reset();
    otpForm.reset();
    setShowOtpForm(false);
    setEmail("");
    setPassword("");
    setName("");
    // No role state to reset
  };

  const handleModalClose = () => {
    resetForms();
    onOpenChange("none");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      {/* Sign In Modal */}
      <Dialog
        open={open === "login"}
        onOpenChange={(isOpen) => onOpenChange(isOpen ? "login" : "none")}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{showOtpForm ? "Verify OTP" : "Sign In"}</DialogTitle>
            <DialogDescription>
              {showOtpForm
                ? `Enter the verification code sent to ${email}`
                : "Enter your credentials to access your account"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showOtpForm ? (
            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 6-digit code"
                          className="text-center text-lg tracking-widest"
                          maxLength={6}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowOtpForm(false)}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Verify
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <Form {...signInForm}>
              <form
                onSubmit={signInForm.handleSubmit(handleSignInSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={toggleShowPassword}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Remember me for 30 days
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0"
                    onClick={() => {
                      handleModalClose();
                      onOpenChange("signup");
                    }}
                  >
                    Don't have an account? Sign Up
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign In
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Sign Up Modal */}
      <Dialog
        open={open === "signup"}
        onOpenChange={(isOpen) => onOpenChange(isOpen ? "signup" : "none")}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showOtpForm ? "Verify OTP" : "Create Account"}
            </DialogTitle>
            <DialogDescription>
              {showOtpForm
                ? `Enter the verification code sent to ${email}`
                : "Fill in your details to create a new account"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showOtpForm ? (
            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 6-digit code"
                          className="text-center text-lg tracking-widest"
                          maxLength={6}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowOtpForm(false)}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Verify & Create Account
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <Form {...signUpForm}>
              <form
                onSubmit={signUpForm.handleSubmit(handleSignUpSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={signUpForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com"
                          type="email"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={toggleShowPassword}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={toggleShowConfirmPassword}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Removed role selection */}
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0"
                    onClick={() => {
                      handleModalClose();
                      onOpenChange("login");
                    }}
                  >
                    Already have an account? Sign In
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign Up
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthModals;
