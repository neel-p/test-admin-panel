"use client";
import { useToast } from "@/app/components/toast/ToastManager";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { Form, Formik, Field } from "formik";
import { useState, useRef, useEffect } from "react";
import * as Yup from "yup";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import axios from "axios";
import { useRouter } from "next/navigation";
import { setEncryptedData, syncTokenToCookie } from "@/utils/secureStorage";
import { useClientStore } from "@/stores/clientStore";

const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .lowercase()
    .email("Please enter a valid email address")
    .required("Please provide your email address"),
});

const OtpSchema = Yup.object().shape({
  otp: Yup.string()
    .trim()
    .matches(/^\d{6}$/, "OTP must be 6 digits")
    .required("Please enter the OTP"),
});

const EmailOtpForm = () => {
	const router = useRouter();
    const { updateClient } = useClientStore();
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { handleApiResponse } = useHandleApiResponse();
  const { showToast } = useToast();

  useEffect(() => {
    // Initialize refs array
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpForm && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showOtpForm, countdown]);

  const handleEmailSubmit = async (values: { email: string }, { setSubmitting }: any) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}auth/sendOtp`,
        { 
			email: values.email,
			"isAdmin":true,
    		"isChat":false
		}
      );
      
      handleApiResponse(response);
      if (response?.data?.statusCode === 200 || response?.data?.statusCode === 201) {
        setEmail(values.email);
        setShowOtpForm(true);
        setCountdown(60);
        setCanResend(false);
     }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to send OTP";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = () => {
    setCountdown(60);
    setCanResend(false);
    handleEmailSubmit({ email }, { setSubmitting: () => {} });
  };

  const handleOtpSubmit = async (values: { otp: string }, { setSubmitting }: any) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}auth/verifyOtp`,
        { email, otp: values.otp }
      );
      
      handleApiResponse(response);
		if (response?.data?.statusCode === 200 || response?.data?.statusCode === 201) {
			try {
				  localStorage.setItem("user-token", response?.data?.data?.token);
				  // Also set token in cookie for middleware access
				  syncTokenToCookie();
			  		await setEncryptedData("user", response?.data?.data, "cookie", 480);
			  if (response?.data?.data?.role.toLowerCase() === "admin") {
				 router.push("/admin");
			  } else if (response?.data?.data?.role.toLowerCase() === "client") {
				  updateClient(response?.data?.data);
				  router.push("/client/user");
			  } 
        else if (response?.data?.data?.role.toLowerCase() === "user") {
				  updateClient(response?.data?.data);
				   router.push("/user/task");
			  }else {
				  router.push("*");
			  }
		  } catch (error) {
			  console.error("Error in setEncryptedData:", error);
			  showToast("Failed to store user data", "error");
		  }
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to verify OTP";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

 const handleOtpChange = (index: number, value: string) => {
  // Only allow digits, ignore anything else
  if (!/^\d$/.test(value)) return;

  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);

  // Move to next input if there is one
  if (index < 5) {
    inputRefs.current[index + 1]?.focus();
  }
};
  
	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
  const isDigit: any = /^\d$/.test(e.key);


  if (isDigit) {
    e.preventDefault(); // Let `onChange` take care of it
    handleOtpChange(index, e.key);
    return;
  }

  // Handle backspace
  if (e.key === "Backspace") {
    if (!otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  }

  // Handle left arrow
  if (e.key === "ArrowLeft" && index > 0) {
    e.preventDefault();
    inputRefs.current[index - 1]?.focus();
  }

  // Handle right arrow
  if (e.key === "ArrowRight" && index < 5) {
    e.preventDefault();
    inputRefs.current[index + 1]?.focus();
  }

  // Handle delete key
  if (e.key === "Delete") {
    const newOtp = [...otp];
    newOtp[index] = "";
    setOtp(newOtp);
  }

  // Handle tab key
  if (e.key === "Tab" && !e.shiftKey && index < 5) {
    e.preventDefault();
    inputRefs.current[index + 1]?.focus();
  }

  // Handle tab + shift
  if (e.key === "Tab" && e.shiftKey && index > 0) {
    e.preventDefault();
    inputRefs.current[index - 1]?.focus();
  }
};

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  if (!showOtpForm) {
    return (
      <Formik
        initialValues={{ email: "" }}
        validationSchema={EmailSchema}
        onSubmit={handleEmailSubmit}
      >
        {({ errors, touched, isSubmitting, handleChange, values }) => (
          <Form className="mt-6" noValidate>
            <div className="mb-4">
              <div className="mb-2 block">
                <Label htmlFor="email" value="Email" />
              </div>
              <TextInput
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                className="form-control"
                value={values.email}
                onChange={handleChange}
              />
              {touched.email && errors.email && (
                <span className="text-red-500">{errors.email}</span>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              color="primary"
              disabled={isSubmitting}
					>
						
						 {isSubmitting ? (
              <>
                <Spinner
                  size="sm"
                  aria-label="Info spinner example"
                  light
                ></Spinner>
				<span >Sending...</span>
              </>
            ) : (
              "Send OTP"
            )}
            </Button>
          </Form>
        )}
      </Formik>
    );
  }

  return (
    <Formik
      initialValues={{ otp: otp.join("") }}
      validationSchema={OtpSchema}
      onSubmit={handleOtpSubmit}
      enableReinitialize
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="mt-6" noValidate>
          <div className="mb-4">
		   <div onClick={() => {
                setShowOtpForm(false);
                setOtp(["", "", "", "", "", ""]);
                setCountdown(60);
                setCanResend(false);
              }} className="flex items-center gap-2 text-sm text-primary font-medium hover:underline mb-4 cursor-pointer">
		   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 		stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
			</div>
            <div className="mb-2 block">
              <Label htmlFor="otp" value="Enter OTP" />
            </div>
            <p className="text-center text-sm text-gray-500 mb-3">
              OTP sent to <span className="font-medium">{email}</span>
            </p>
            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl  border rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                />
              ))}
            </div>
            {touched.otp && errors.otp && (
              <span className="text-red-500">{errors.otp}</span>
            )}
          </div>
          <div className="flex justify-between items-center mb-4">
         
            {canResend ? (
              <Button
                type="button"
                color="light"
                onClick={handleResendOtp}
              >
                Resend OTP
              </Button>
            ) : (
              <span className="text-sm text-gray-500">
                Resend OTP in {countdown}s
              </span>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            color="primary"
            disabled={isSubmitting}
          >
			
			{isSubmitting ? (
              <>
                <Spinner
                  size="sm"
                  aria-label="Info spinner example"
                  light
                ></Spinner>
				<span >Verifying...</span>
              </>
            ) : (
              "Verify OTP"
            )}
           
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default EmailOtpForm;