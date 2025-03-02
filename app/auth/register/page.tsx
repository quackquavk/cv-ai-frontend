"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axiosInstance from "@/utils/axiosConfig";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  full_name: z.string().min(1, "FullName is required."),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const SignUpPage = () => {
  const [loader, setLoader] = useState<boolean>(false);

  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleClick = (e, target) => {
    e.preventDefault();
    setIsPageLoading(true);
    if (target == "dashboard") {
      router.push("../../dashboard");
    } else if (target == "login") {
      router.push("../../auth/login");
    }
  };

  //Define your form.
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      // Register the user
      setLoader(true);
      await axiosInstance.post(`/user/create_user`, data);
      router.push("/auth/login");
      toast("Succcesfully created user", {
        style: {
          backgroundColor: "white",
          color: "white",
        },
      });
      console.log("Loader", loader);
    } catch (error) {
      if (error.response) {
        toast(`${error.response.data.detail} !!!`, {
          style: {
            backgroundColor: "black",
            color: "white",
          },
        });
      }
    } finally {
      setLoader(false);
      console.log("Loader", loader);
    }
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md px-6 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div>
            <div className="grid gap-4">
              {/* <div>
                <Button variant="outline" className="w-full flex gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Login with Google</span>
                </Button>
              </div> */}
              {/* <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div> */}
              <div>
                <Button
                  variant="outline"
                  className="w-full flex gap-3"
                  onClick={(e) => handleClick(e, "dashboard")}
                >
                  <p>
                    {`Click here to see publicly available cv's without signUp`}
                  </p>
                </Button>
              </div>
              <Form {...form}>
                <form
                  className="grid gap-3"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="User Name" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" type="email" {...field} />
                        </FormControl>
                        <FormMessage className="text-x" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loader}>
                    {loader ? (
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                      <span>Create account</span>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <p
              className="underline underline-offset-4 cursor-pointer"
              onClick={(e) => handleClick(e, "login")}
            >
              Login
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>

      {/* Loader (shown when isLoading is true) */}
      {isPageLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="loader border-t-4 border-white border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
