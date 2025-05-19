import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log("Starting auth callback...");
      try {
        // Get the hash fragment from the URL
        const hash = location.hash;
        console.log("URL hash:", hash);

        // If there's a hash, it means we're handling an email verification
        if (hash) {
          const { error: hashError } = await supabase.auth.getSession();
          if (hashError) {
            console.error("Hash error:", hashError);
            throw hashError;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        console.log("Session data:", session);

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No session found, redirecting to login...");
          navigate("/login", {
            state: {
              error: "Email verification failed. Please try again.",
            },
          });
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        console.log("User data:", user);

        if (userError) {
          console.error("User error:", userError);
          throw userError;
        }

        if (!user) {
          console.error("No user found");
          throw new Error("No user found");
        }

        // Check if profile already exists
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        console.log("Profile check:", { existingProfile, profileError });

        if (profileError) {
          console.error("Profile error:", profileError);
          throw profileError;
        }

        // Redirect to login page with success message
        console.log("Verification successful, redirecting to login...");
        navigate("/login", {
          state: {
            message: "Email verified successfully! You can now log in.",
          },
        });
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred during verification"
        );
        // Redirect to login page with error
        navigate("/login", {
          state: {
            error: "Email verification failed. Please try again.",
          },
        });
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">
              Verification Error
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Verifying Email</h2>
          <p className="mt-2 text-gray-600">
            Please wait while we verify your email...
          </p>
        </div>
      </div>
    </div>
  );
}
