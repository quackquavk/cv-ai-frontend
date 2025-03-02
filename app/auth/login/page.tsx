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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosInstance from "@/utils/axiosConfig";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const FormSchema = z.object({
  username: z.string().min(1, "UserName is required !!"),
  password: z.string().min(1, "Password is required !!"),
});

const LoginPage = () => {
  const [loader, setLoader] = useState<boolean>(false);

  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleClick = (e, target) => {
    e.preventDefault();
    setIsPageLoading(true);
    if (target == "dashboard") {
      router.push("../../dashboard");
    } else if (target == "signUp") {
      router.push("../../auth/register");
    }
  };

  //Define your form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const response = await axiosInstance.post(`/user/login`, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      setLoader(true);

      // Store tokens in session storage
      const { access_token, refresh_token } = response.data;
      Cookies.set("access_token", access_token, {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("refresh_token", refresh_token, {
        secure: true,
        sameSite: "Strict",
      });
      router.push("/dashboard");
    } catch (error) {
      console.log("Error", error);
      toast(`${error.response.data.detail} !!!`, {
        style: {
          backgroundColor: "black",
          color: "white",
        },
      });
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md p-6 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div>
            {/* <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-4">
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
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div> */}
            <div>
              <Button
                variant="outline"
                className="w-full flex gap-3"
                onClick={(e) => handleClick(e, "dashboard")}
              >
                <p>
                  {`Click here to see publicly available cv's without login`}
                </p>
              </Button>
            </div>
            <Form {...form}>
              <form
                className="grid gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                {/* <div className="grid gap-2">
                  <Label>Username</Label>
                  <Input id="username" type="text" required />
                </div> */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UserName</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
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
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                {/* <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input id="password" type="password" required />
                </div> */}
                <Button type="submit" className="w-full">
                  {loader ? (
                    <LoaderCircle className="h-4 animate-spin" />
                  ) : (
                    <span>Login</span>
                  )}
                </Button>
              </form>
            </Form>
          </div>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <p
              className="underline cursor-pointer underline-offset-4"
              onClick={(e) => handleClick(e, "signUp")}
            >
              Sign up
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

export default LoginPage;
