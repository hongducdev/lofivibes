import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

const SignInPage = () => {
    const handleGoogleSignIn = async () => {
        await signIn("google", { callbackUrl: "/" });
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sign in to track your daily streak
                    </p>
                </div>

                <Button
                    onClick={handleGoogleSignIn}
                    className="flex w-full items-center justify-center gap-2"
                    variant="outline"
                >
                    <FcGoogle className="h-5 w-5" />
                    Sign in with Google
                </Button>
            </div>
        </div>
    );
};

export default SignInPage;
