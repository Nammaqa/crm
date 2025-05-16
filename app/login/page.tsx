"use client";
import React, { useState } from 'react';
import './login.css';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
// import { useRouter } from "next/navigation"; // Removed unused import
// import { jwtDecode } from "jwt-decode"; // Removed unused import

function Page() {
    // Removed unused router variable

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = {
            wbEmailId: formData.email,
            password: formData.password,
        };

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Login successful!");
                // localStorage.setItem("token", data.token.toString());

                // If you want to decode and use the role, you can do so here:
                // const decoded = jwtDecode<{ role: string }>(data.token);
                // const userRole = decoded?.role;
                // Redirect based on role if needed

                window.location.href = '/bdsales';

            } else {
                toast.error(data.message || "Login failed.");
            }
        } catch (err) {
            toast.error("Something went wrong. Try again.");
            console.error("Login error:", err);
        }
    };

    return (
        <div className="container">
            {/* Left Side */}
            <div className="welcome-section">
                <Image src="/Wizzybox Logo.png" alt="Company Logo" className="welcome-logo" width={180} height={50} />
                <h1>Welcome Back</h1>
                <p>We&apos;re glad to see you again! Login to continue.</p>
                <Image src="/login.webp" alt="Login Illustration" className="login-logo" width={200} height={200} />
            </div>

            {/* Right Side */}
            <div className="form-section flex items-center justify-center w-1/2 p-6">
                <Card className="w-full max-w-md p-6 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLoginSubmit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" size="lg">
                                Login
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Page;