"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { StreakTracker } from "./StreakTracker";

export const Navbar = () => {
    const { data: session } = useSession();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                    LofiVibes
                </Link>

                <div className="flex items-center gap-4">
                    <StreakTracker />

                    {session ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                {session.user?.name}
                            </span>
                            <Button variant="outline" onClick={() => signOut()}>
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => signIn("google")}
                        >
                            Sign In
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
};
