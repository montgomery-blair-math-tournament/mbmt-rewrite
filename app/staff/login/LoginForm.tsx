"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Link2 from "@/components/Link2";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/staff");
            router.refresh();
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center min-h-125">
            <Card className="w-full max-w-sm mx-auto shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-bold">
                        Staff Login
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleLogin}
                        className="flex flex-col gap-4">
                        {error && (
                            <div className="text-sm font-medium text-destructive text-center p-2 rounded bg-destructive/10">
                                {error}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="text"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent-hover text-white"
                            disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <Link2 href="/staff/signup">Sign up instead...</Link2>
                </CardFooter>
            </Card>
        </div>
    );
}
