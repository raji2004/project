import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { CheckCircle } from "lucide-react";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function getStrengthLabel(score: number) {
  switch (score) {
    case 0:
    case 1:
      return { label: "Very Weak", color: "bg-red-400", text: "text-red-700" };
    case 2:
      return { label: "Weak", color: "bg-orange-400", text: "text-orange-700" };
    case 3:
      return {
        label: "Moderate",
        color: "bg-yellow-400",
        text: "text-yellow-700",
      };
    case 4:
      return { label: "Strong", color: "bg-green-400", text: "text-green-700" };
    case 5:
      return {
        label: "Very Strong",
        color: "bg-blue-500",
        text: "text-blue-700",
      };
    default:
      return { label: "", color: "", text: "" };
  }
}

interface ValidationErrors {
  email?: string;
  password?: string;
  studentId?: string;
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const { signUp } = useAuthStore();

  const passwordScore = getPasswordStrength(password);
  const strength = getStrengthLabel(passwordScore);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const { signUp } = useAuthStore();

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }

    // Student ID validation
    if (!studentId) {
      errors.studentId = 'Student ID is required';
    } else if (!/^\d+$/.test(studentId)) {
      errors.studentId = 'Student ID must contain only numbers';
    } else if (studentId.length < 6) {
      errors.studentId = 'Student ID must be at least 6 digits long';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }
    try {
      await signUp(email, password, studentId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 block w-full rounded-md border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
        />
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="studentId"
          className="block text-sm font-medium text-gray-700"
        >
          Student ID
        </label>
        <input
          id="studentId"
          type="text"
          required
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className={`mt-1 block w-full rounded-md border ${validationErrors.studentId ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
        />
        {validationErrors.studentId && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.studentId}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`mt-1 block w-full rounded-md border ${validationErrors.password ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
        />
        <div className="mt-2 flex items-center gap-2">
          <div className={`h-2 w-24 rounded ${strength.color}`}></div>
          <span className={`text-xs font-semibold ${strength.text}`}>
            {strength.label}
          </span>
        </div>
        <ul className="mt-2 text-xs text-gray-500 space-y-1">
          <li className={password.length >= 8 ? "text-green-600" : ""}>
            {password.length >= 8 ? (
              <CheckCircle className="inline w-4 h-4 mr-1" />
            ) : (
              <span className="inline-block w-4 h-4 mr-1" />
            )}
            At least 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
            {/[A-Z]/.test(password) ? (
              <CheckCircle className="inline w-4 h-4 mr-1" />
            ) : (
              <span className="inline-block w-4 h-4 mr-1" />
            )}
            One uppercase letter
          </li>
          <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
            {/[a-z]/.test(password) ? (
              <CheckCircle className="inline w-4 h-4 mr-1" />
            ) : (
              <span className="inline-block w-4 h-4 mr-1" />
            )}
            One lowercase letter
          </li>
          <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>
            {/[0-9]/.test(password) ? (
              <CheckCircle className="inline w-4 h-4 mr-1" />
            ) : (
              <span className="inline-block w-4 h-4 mr-1" />
            )}
            One number
          </li>
          <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}>
            {/[^A-Za-z0-9]/.test(password) ? (
              <CheckCircle className="inline w-4 h-4 mr-1" />
            ) : (
              <span className="inline-block w-4 h-4 mr-1" />
            )}
            One special character
          </li>
        </ul>
        {validationErrors.password && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
        )}

      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Register
        </button>
      </div>
      <div className="text-sm text-center">
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Already have an account? Sign in here
        </Link>
      </div>
    </form>
  );
}
