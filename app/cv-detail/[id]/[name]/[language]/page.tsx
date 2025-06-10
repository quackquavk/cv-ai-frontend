"use client";
import React, { use, useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { GoDotFill } from "react-icons/go";
import DetailViewSkeleton from "@/components/ui/Skeleton/DetailViewSkeleton";
import axiosInstance from "@/utils/axiosConfig";
import ContactQRCode from "@/app/components/ContactQRCode";
import { SquareArrowOutUpRight, ExternalLink } from "lucide-react";
import { Star } from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { PiGlobeLight } from "react-icons/pi";
import { IoLocation } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { IAvailability } from "@/interfaces/Availability";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { PiNotePencilBold } from "react-icons/pi";
import { FaPhoneAlt } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RxHamburgerMenu } from "react-icons/rx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

const CVDetailPage = ({ params }: { params: any }) => {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [loader, setLoader] = useState<boolean>(false);
  const [closeParsedData, setCloseParsedData] = useState<boolean>(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(() =>
    localStorage.getItem("isAuthenticated")
  );

  // State for API data and user input
  const [inputData, setInputData] = useState<IAvailability>({
    document_id: "",
    availability: null,
    time_of_day: null,
    star_rating: null,
    current_salary: null,
    estimated_salary: null,
    paid_by: null,
    note: "",
    rating_info: {
      average: 0,
      count: 0,
    },
    has_rated: false,
  });

  const { id }: any = use(params);
  const pdfUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/cv/${id}.pdf`;
  const closeButtonRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Use state for reactivity

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticatedState(localStorage.getItem("isAuthenticated"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const isAuthenticated = isAuthenticatedState === "true";

  useEffect(() => {
    fetchFullCV();
  }, [id]);

  // For displaying initial availability
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/cv_document/getAvailability/${id}`
        );
        setInputData(response.data);
        // Set the userChoice based on the 'votes' value from the API response
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  const fetchFullCV = async () => {
    try {
      const response = await axiosInstance.get(`/document/cv/${id}`);
      setData(response.data.parsed_cv);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Data", error);
      setLoading(false);
    }
  };

  function validatePositiveNumber(event, field) {
    const value = event.target.value;

    // Remove any characters that aren't numbers or decimal point
    const sanitizedValue = value.replace(/[^\d.]/g, "");

    // Only allow one decimal point
    const decimalCount = (sanitizedValue.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }

    // Add leading zero if input starts with decimal
    let finalValue = sanitizedValue;
    if (finalValue.startsWith(".")) {
      finalValue = `0${finalValue}`;
    }

    // Allow empty input, numbers, and properly formatted decimals
    if (finalValue === "" || /^\d*\.?\d*$/.test(finalValue)) {
      setInputData((prevData) => ({
        ...prevData,
        [field]: finalValue === "" ? null : finalValue,
      }));
    }
  }

  const handleMouseEnter = (index) => {
    setHoveredRating(index);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleClick = (index) => {
    setInputData({ ...inputData, star_rating: index });

    // setInputData((prev) => ({
    //   ...prev,
    //   star_rating: index,
    //   has_rated: true,
    //   rating_info: {
    //     ...prev.rating_info,
    //     count: prev.rating_info.count + 1, // +1 to count
    //   },
    // }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents new line in textarea

      if (!isSubmitting) {
        handleSave();
      }
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return; // Prevent multiple API calls
    setIsSubmitting(true); // Mark as submitting

    const body = {
      document_id: id,
      availability: inputData.availability || "",
      time_of_day: inputData.time_of_day || "",
      star_rating: inputData.star_rating,
      current_salary: inputData.current_salary,
      estimated_salary: inputData.estimated_salary,
      paid_by: inputData.paid_by || "",
      rating_info: {
        average: inputData.rating_info.average,
        count: inputData.rating_info.count,
      },
      has_rated: inputData.has_rated,
      note: inputData.note,
    };

    try {
      setLoader(true);
      const response = await axiosInstance.put(
        `/cv_document/updateAvailability`,
        body
      );
      setInputData(response.data);
      toast("Successfully Updated Data", {
        style: {
          background: "black",
          color: "white",
        },
        duration: 1000,
      });
      closeButtonRef.current?.click();
    } catch (error) {
      console.error("Error saving data", error);
      toast.error("Error Occured !!", { duration: 1000 });
    } finally {
      setLoader(false);
      setIsSubmitting(false); // Reset flag after request
    }
  };

  // Function to display the titleCase text

  function toTitleCase(str: string): string {
    return str
      ?.split(" ")
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      ?.join(" ");
  }

  return (
    <div className="flex h-full relative w-full overflow-y-hidden">
      {/* Mobile View */}
      <div className="md:hidden w-full  flex flex-col h-screen">
        <Tabs defaultValue="pdfcv" className="w-full h-full">
          {/* Fixed TabsTrigger heading */}
          <TabsList className="sticky rounded-none top-0 z-10 grid w-full bg-black opacity-85 grid-cols-2">
            <TabsTrigger value="pdfcv" className=" text-white">
              RESUME.PDF
            </TabsTrigger>
            <TabsTrigger value="parsedcv" className=" text-white">
              AI PARSED
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdfcv" className="h-full mt-[-2px]">
            <Card className="w-full h-full">
              <div className="h-[100vh]">
                {/* Embed PDF viewer */}
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="100%"
                  // style={{ border: "none", borderRadius: "0.375rem" }}
                ></iframe>
              </div>
            </Card>
          </TabsContent>

          <TabsContent
            value="parsedcv"
            className="flex-grow flex flex-col h-full mt-[-2px]"
          >
            {loading ? (
              <div className="w-full">
                <DetailViewSkeleton />
              </div>
            ) : (
              <Card className="px-3 rounded-none flex py-3 w-full h-full flex-col gap-6">
                {/* Main content - scrollable */}
                <div className="flex-grow overflow-y-auto scrollbar-thin">
                  <div className="flex flex-col gap-3">
                    {/* First Part */}
                    <div className="top-0">
                      <div className="flex justify-between w-[100%] items-start">
                        <div className="flex flex-col w-max-[60%] flex-wrap pr-3 ">
                          <h1 className="font-bold text-lg md:text-xl">
                            {data?.name?.toUpperCase()}
                          </h1>

                          <p className="font-semibold underline">
                            {data?.position?.toUpperCase()}
                          </p>
                          <p className="flex gap-2 items-center">
                            {data?.linkedin_url && (
                              <>
                                <span>
                                  <FaLinkedin />
                                </span>
                                <a
                                  href={
                                    data.linkedin_url.startsWith("http")
                                      ? data.linkedin_url
                                      : `https://${data.linkedin_url}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="max-w-48 truncate"
                                >
                                  <span className="text-[#0000FF] dark:text-[#0070E0] underline hover:opacity-80 text-sm">
                                    {data.linkedin_url}
                                  </span>
                                </a>
                              </>
                            )}
                          </p>

                          <p className="flex gap-2 items-center">
                            {data?.git_url && (
                              <>
                                <span>
                                  <FaGithub />
                                </span>
                                <Link
                                  href={
                                    data?.git_url.startsWith("http")
                                      ? data?.git_url
                                      : `https://${data?.git_url}`
                                  }
                                  target="_blank"
                                  className="max-w-48 truncate"
                                >
                                  <span className="text-[#0000FF] dark:text-[#0070E0] underline hover:opacity-80 text-sm">
                                    {data?.git_url}
                                  </span>
                                </Link>
                              </>
                            )}
                          </p>

                          <p className="flex gap-2 max-w-sm truncate items-center">
                            {data?.website && (
                              <>
                                <span>
                                  <PiGlobeLight size={18} />
                                </span>
                                <Link
                                  href={
                                    data?.website.startsWith("http")
                                      ? data?.website
                                      : `https://${data?.website}`
                                  }
                                  target="_blank"
                                  className="max-w-48 truncate"
                                >
                                  <span className="text-[#0000FF] dark:text-[#0070E0] underline hover:opacity-80 text-sm">
                                    {data?.website}
                                  </span>
                                </Link>
                              </>
                            )}
                          </p>

                          <p className="flex gap-2 items-center">
                            {data?.email && (
                              <>
                                <span>
                                  <MdEmail />
                                </span>

                                <Link
                                  href={`mailto:${data?.email}`}
                                  target="_blank"
                                  className="max-w-48  truncate"
                                >
                                  <span className="text-[#0000FF] dark:text-[#0070E0] underline hover:opacity-80 text-sm">
                                    {data?.email}
                                  </span>
                                </Link>
                              </>
                            )}
                          </p>

                          <p className="flex gap-2 items-center">
                            {data?.phone_number && (
                              <>
                                <span>
                                  <FaPhoneAlt size={14} />
                                </span>

                                <span className="font-semibold text-gray-700 dark:text-gray-400 text-sm">
                                  {data?.phone_number}
                                </span>
                              </>
                            )}
                          </p>

                          <p className="flex gap-2 items-center">
                            {data?.address && (
                              <>
                                <span>
                                  <IoLocation />
                                </span>

                                <span className="font-semibold text-gray-700 dark:text-gray-400 text-sm capitalize">
                                  {data?.address}
                                </span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* QR Code */}
                        <div className="mr-4">
                          <ContactQRCode
                            contact={{
                              fullName: data?.name
                                ? `${toTitleCase(data.name)} (${
                                    toTitleCase(data?.position) || ""
                                  })`
                                : "",
                              phone: data?.phone_number || "",
                              address: data?.address || "",
                              email: data?.email || "",
                              linkedin: data?.linkedin_url || "",
                              github: data?.git_url || "",
                              website: data?.website || "",
                              skills: data?.skills?.slice(0, 4) || [],
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mr-4">
                      <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
                    </div>

                    {/* Second Part*/}
                    <div className="flex-grow flex-col space-y-3">
                      {/* Programming Language */}
                      <div>
                        <div className="flex flex-col gap-1 pb-2">
                          <p className="font-semibold">Progamming Language</p>
                          <div className="flex flex-wrap gap-3 text-sm max-w-3xl">
                            {data?.programming_languages?.map(
                              (item: any, idx: number) => (
                                <div key={idx}>
                                  <Card className="flex px-2 py-1 text-gray-600 font-sans rounded-md w-fit font-semibold dark:text-gray-400 capitalize">
                                    {item}
                                  </Card>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mr-4">
                        <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
                      </div>

                      {/* Skills */}
                      <div>
                        {data?.skills?.length > 0 && (
                          <div className="flex flex-col gap-1 pb-2 mr-4">
                            <p className="font-semibold">Skills</p>
                            <div className="flex flex-wrap gap-3  max-w-3xl">
                              {data?.skills?.map((item: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex gap-1 items-center"
                                >
                                  <span className="text-gray-600">
                                    <GoDotFill />
                                  </span>
                                  <span className="text-sm dark:text-gray-400 capitalize">
                                    {item}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mr-4">
                        <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
                      </div>

                      {/* Experience */}
                      <div className="flex flex-col gap-2 mr-4">
                        <p className="font-semibold flex items-center gap-4 ">
                          Experiences
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {data?.years_of_experience &&
                              +data?.years_of_experience + " Years"}
                          </span>
                        </p>
                        <div className="flex flex-col gap-3 mr-4">
                          {data?.work_experience.length > 0 &&
                            data?.work_experience.map(
                              (item: any, index: number) => (
                                <div key={index}>
                                  <span className="font-semibold capitalize">
                                    {index + 1 + ". " + item?.job_title}
                                  </span>
                                  <span className="flex items-center gap-3">
                                    <span className="font-semibold capitalize">
                                      {item?.company_name}
                                    </span>
                                    {item?.start_date && item?.end_date && (
                                      <span
                                        className="text-sm text-gray-500
                                      dark:text-gray-400 capitalize"
                                      >
                                        {"(" +
                                          item.start_date +
                                          " - " +
                                          item.end_date +
                                          ")"}
                                      </span>
                                    )}
                                  </span>
                                  <span className="flex flex-col text-sm max-w-3xl ">
                                    {item.responsibilities.length > 0 &&
                                      item.responsibilities.map(
                                        (el: any, index: number) => (
                                          <span
                                            className="flex gap-1 text-gray-700 "
                                            key={index}
                                          >
                                            <span className="mt-[3px]">
                                              <GoDotFill />
                                            </span>
                                            <span className="dark:text-gray-400 capitalize">
                                              {el}
                                            </span>
                                          </span>
                                        )
                                      )}
                                  </span>
                                </div>
                              )
                            )}
                        </div>
                      </div>

                      <div className="mr-4">
                        <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
                      </div>

                      {/* Project */}
                      <div>
                        <div className="flex flex-col gap-1 max-w-3xl">
                          <p className="font-semibold ">Projects</p>
                          <div className="flex gap-4 flex-col">
                            {data?.technical_projects?.length > 0 &&
                              data?.technical_projects.map(
                                (data: any, index: number) => (
                                  <div key={index}>
                                    <div className="flex flex-col gap-2 text-gray-700">
                                      <div className="flex justify-between items-center">
                                        <div className="text-gray-700 font-semibold capitalize dark:text-white">
                                          {index + 1 + ". " + data.project_name}
                                        </div>
                                        {data.project_link && (
                                          <Link
                                            href={
                                              (Array.isArray(data.project_link)
                                                ? data.project_link[0]
                                                : data.project_link
                                              ).startsWith("http")
                                                ? Array.isArray(
                                                    data.project_link
                                                  )
                                                  ? data.project_link[0]
                                                  : data.project_link
                                                : `https://${
                                                    Array.isArray(
                                                      data.project_link
                                                    )
                                                      ? data.project_link[0]
                                                      : data.project_link
                                                  }`
                                            }
                                            target="_blank"
                                            className=" mr-4 hover:opacity-50 dark:text-white"
                                          >
                                            <SquareArrowOutUpRight size={16} />
                                          </Link>
                                        )}
                                      </div>
                                      {data.programming_language?.length >
                                        0 && (
                                        <div className="flex flex-wrap gap-3 items-center text-sm mr-4 max-w-3xl">
                                          {data.programming_language.map(
                                            (el, index) => (
                                              <div key={index}>
                                                <Card className="p-2 font-sans rounded-md w-fit font-semibold dark:text-gray-400 capitalize">
                                                  {el}
                                                </Card>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                      {data.description && (
                                        <p className="text-sm mr-4 dark:text-gray-400 capitalize">
                                          {data.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="mr-4">
                        <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
                      </div>

                      {/* Education */}
                      <div>
                        <span className="flex flex-col gap-1">
                          <span className="font-semibold">Education</span>
                          <span className="flex gap-2 flex-col">
                            {data?.education?.length > 0 &&
                              data?.education.map((el: any, index: number) => (
                                <div key={index}>
                                  <p className="font-semibold capitalize">
                                    {index + 1 + ". " + el.degree}
                                  </p>
                                  <div className="flex gap-1 items-center text-gray-700 text-sm dark:text-gray-400">
                                    <span className="capitalize">
                                      {el?.institution}
                                    </span>
                                    <span>
                                      {"(" +
                                        el?.start_date +
                                        " - " +
                                        el?.end_date +
                                        ")"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </span>
                        </span>
                      </div>

                      <div className="mr-4">
                        <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
                      </div>

                      {/* Certificate */}
                      <div>
                        <p className="font-semibold">Certification</p>
                        <div className="flex flex-col space-y-2">
                          {data?.certifications?.map(
                            (el: any, index: number) => (
                              <p
                                className="text-sm flex capitalize"
                                key={index}
                              >
                                {index + 1 + ". " + el?.certification_name}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability Section - Fixed */}
                <div className="relative mb-6">
                  <div
                    className={`sticky bottom-0 z-10 border-t-2 border-slate-700 py-3 flex flex-col gap-3 ${
                      !isAuthenticated && "blur-[2px] cursor-not-allowed"
                    }`}
                  >
                    {/* Stars & Like / DisLike */}
                    <div className="flex justify-end items-start gap-1">
                      {/* stars */}
                      <div className="font-semibold opacity-80">
                        <span>{inputData.rating_info.average}</span>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((index) => (
                          <button
                            key={index}
                            className="p-1 hover:scale-110 transition-transform"
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleClick(index)}
                          >
                            <Star
                              size={14}
                              fill={
                                index <=
                                (hoveredRating || inputData.star_rating)
                                  ? "#f59e0b"
                                  : "none"
                              }
                              stroke={
                                index <=
                                (hoveredRating || inputData.star_rating)
                                  ? "#f59e0b"
                                  : "#4b5563"
                              }
                            />
                          </button>
                        ))}
                      </div>
                      <div className="font-semibold opacity-80">
                        <span>{"(" + inputData.rating_info.count + ")"}</span>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="flex justify-end items-start gap-14">
                      <div className="">
                        <Select
                          value={inputData.availability || ""}
                          onValueChange={(value) =>
                            setInputData({ ...inputData, availability: value })
                          }
                        >
                          <SelectTrigger className="w-[120px] h-[34px] text-xs">
                            <SelectValue
                              className="text-xs"
                              placeholder="Availability"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="remote" className="text-xs">
                                Remote
                              </SelectItem>
                              <SelectItem value="onsite" className="text-xs">
                                Onsite
                              </SelectItem>
                              <SelectItem value="hybrid" className="text-xs">
                                Hybrid
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="">
                        <Select
                          value={inputData.time_of_day || ""}
                          onValueChange={(value) =>
                            setInputData({ ...inputData, time_of_day: value })
                          }
                        >
                          <SelectTrigger className="w-[120px] text-xs h-[34px]">
                            <SelectValue
                              placeholder="Time"
                              className="text-xs"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="day" className="text-xs">
                                Day
                              </SelectItem>
                              <SelectItem value="night" className="text-xs">
                                Night
                              </SelectItem>
                              <SelectItem value="flexible" className="text-xs">
                                Flexible
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Salary */}
                    <div className="flex mt-1 justify-between">
                      {/* Current Salary */}
                      <div className="w-32 relative">
                        {/* Label */}
                        <Label
                          htmlFor="currentSalary"
                          className={`absolute left-3 px-1 text-center text-[10px] font-medium text-gray-700 dark:bg-black dark:text-white ${
                            inputData.current_salary !== null
                              ? "-top-2 bg-white"
                              : "top-2.5 text-gray-500"
                          } `}
                        >
                          Current Salary(USD)
                        </Label>
                        {/* Input Field */}
                        <Input
                          type="text"
                          id="currentSalary"
                          className={`peer block rounded-md py-2 px-3 text-[10px] w-full focus:ring-black focus:ring-1 gap-2 focus:outline-none focus:ring-opacity-75 ${
                            !isAuthenticated && "cursor-not-allowed"
                          }`}
                          value={
                            inputData.current_salary !== null
                              ? inputData.current_salary.toString()
                              : ""
                          }
                          onChange={(event) =>
                            validatePositiveNumber(event, "current_salary")
                          }
                        />
                      </div>

                      {/* Estimated Salary */}
                      <div className="w-32 relative">
                        {/* Label */}
                        <Label
                          htmlFor="estimatedSalary"
                          className={`absolute left-3 px-1 text-[10px] font-medium transition-all duration-100 text-gray-700 dark:bg-black dark:text-white ${
                            inputData.estimated_salary !== null
                              ? "-top-2 bg-white"
                              : "top-2.5 text-gray-500"
                          }`}
                        >
                          Expected Salary(USD)
                        </Label>
                        {/* Input Field */}
                        <Input
                          type="text"
                          id="estimatedSalary"
                          className={`block w-full rounded-md py-2 px-3 text-[10px] focus:border-black focus:outline-none focus:ring-1 focus:ring-black focus:ring-opacity-75 ${
                            !isAuthenticated && "cursor-not-allowed"
                          } `}
                          value={
                            inputData.estimated_salary !== null
                              ? inputData.estimated_salary.toString()
                              : ""
                          }
                          onChange={(event) =>
                            validatePositiveNumber(event, "estimated_salary")
                          }
                        />
                      </div>

                      {/* Salary Based */}
                      <div className="">
                        <Select
                          value={inputData.paid_by || ""}
                          onValueChange={(value) =>
                            setInputData({ ...inputData, paid_by: value })
                          }
                        >
                          <SelectTrigger className="w-[120px] h-[39px] text-xs">
                            <SelectValue
                              className="text-xs"
                              placeholder="Salary Based"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="hourly" className="text-xs">
                                Hourly
                              </SelectItem>
                              <SelectItem value="monthly" className="text-xs">
                                Monthly
                              </SelectItem>
                              <SelectItem value="annually" className="text-xs">
                                Annually
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Salary Based & Save */}
                    <div className="flex justify-between items-center ">
                      {/* Move Button */}
                      <div>
                        <Button
                          className="flex flex-wrap sm-w-auto h-8 text-center items-center"
                          disabled={!isAuthenticated}
                        >
                          <span className="flex gap-1 items-center w-auto text-xs">
                            <span>
                              <ExternalLink />
                            </span>
                            <span>Move to Private</span>
                          </span>
                        </Button>
                      </div>

                      {/* Notes */}
                      <div>
                        <Sheet>
                          <SheetTrigger
                            disabled={!isAuthenticated}
                            className={`${
                              !isAuthenticated && "cursor-not-allowed"
                            }`}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger
                                  className={`cursor-pointer transition-transform rounded-md duration-300 ease-in-out ${
                                    !isAuthenticated && "cursor-not-allowed"
                                  }`}
                                >
                                  <Button
                                    className={`flex gap-1 items-center w-22 h-8 px-2 text-xs ${
                                      !isAuthenticated && "pointer-events-none"
                                    }`}
                                  >
                                    <span>
                                      <PiNotePencilBold className="text-[2px]" />
                                    </span>
                                    <span>Notes</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Add Notes to the CV</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </SheetTrigger>
                          <SheetContent className="flex flex-col gap-3">
                            <SheetHeader>
                              <SheetTitle>Note</SheetTitle>
                            </SheetHeader>
                            <div>
                              <Textarea
                                className="h-48"
                                placeholder="Add notes..."
                                value={inputData.note}
                                onChange={(e) =>
                                  setInputData({
                                    ...inputData,
                                    note: e.target.value,
                                  })
                                }
                                onKeyDown={handleKeyDown}
                              />
                            </div>
                            <SheetFooter>
                              <SheetClose asChild>
                                <Button
                                  className="w-22 h-8"
                                  type="submit"
                                  onClick={handleSave}
                                  ref={closeButtonRef}
                                  disabled={!isAuthenticated}
                                >
                                  Save
                                </Button>
                              </SheetClose>
                            </SheetFooter>
                          </SheetContent>
                        </Sheet>
                      </div>

                      {/* Save Button */}
                      <div className="">
                        <Button
                          className={`text-center items-center w-[88px] h-8 ${
                            !isAuthenticated && "cursor-not-allowed"
                          }`}
                          onClick={handleSave}
                          disabled={loader || !isAuthenticated}
                        >
                          <div className="flex items-center justify-center w-full">
                            {loader ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <div className="flex gap-1 items-center">
                                <Save className="w-4 h-4" />
                                <span className="text-xs">Save</span>
                              </div>
                            )}
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <div className="absolute text-center">
                      <p className="text-sm text-red-500">
                        You need to login to use this feature
                      </p>
                    </div>
                  )}
                  {!isAuthenticated && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <Link href={"../../../../auth/login"}>
                        <Button className="font-bold px-6 py-3 rounded-lg shadow-lg">
                          Login
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex w-full h-[100vh]">
        <div className="w-[100%]">
          <div className="h-[100vh] relative">
            {/* Hamburger Menu */}
            {closeParsedData && (
              <Card
                className="absolute hidden md:flex top-3 right-4 z-10 bg-gray-200 cursor-pointer p-2 rounded dark:bg-[#2C2C2C]"
                onClick={() => setCloseParsedData((prev) => !prev)}
              >
                <RxHamburgerMenu />
              </Card>
            )}
            {/* Embed PDF viewer */}
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              // style={{ border: "none", borderRadius: "0.375rem" }}
            ></iframe>
          </div>
        </div>

        {loading ? (
          <div className="h-full w-[70%]">
            <DetailViewSkeleton />
          </div>
        ) : (
          <Card
            className={`px-3 ${
              closeParsedData
                ? "hidden  translate-x-full"
                : "flex  translate-x-0"
            }  w-[70%] transition-all duration-300 ease-in-out py-3 h-full flex-col gap-3 rounded-none`}
          >
            {/* Scrollable */}
            <div className="pb-3 overflow-y-auto scrollbar-thin flex flex-col gap-3">
              {/* First Part */}
              <div className=" top-0">
                <div className="flex justify-between w-[100%] items-start">
                  <div className="flex flex-col w-max-[60%] flex-wrap pr-3 ">
                    <h1 className="font-bold text-lg md:text-xl">
                      {data?.name?.toUpperCase()}
                    </h1>

                    <p className="font-semibold underline underline-offset-2">
                      {data?.position?.toUpperCase()}
                    </p>
                    <p className="flex gap-2 items-center">
                      {data?.linkedin_url && (
                        <>
                          <span>
                            <FaLinkedin />
                          </span>
                          <a
                            href={
                              data.linkedin_url.startsWith("http")
                                ? data.linkedin_url
                                : `https://${data.linkedin_url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="max-w-48 truncate"
                          >
                            <span className="text-[#0000FF] dark:text-[#0070E0] underline underline-offset-2 hover:opacity-80 text-sm">
                              {data.linkedin_url}
                            </span>
                          </a>
                        </>
                      )}
                    </p>

                    <p className="flex gap-2 items-center">
                      {data?.git_url && (
                        <>
                          <span>
                            <FaGithub />
                          </span>
                          <Link
                            href={
                              data?.git_url.startsWith("http")
                                ? data?.git_url
                                : `https://${data?.git_url}`
                            }
                            target="_blank"
                            className="max-w-48 truncate"
                          >
                            <span className="text-[#0000FF] dark:text-[#0070E0] underline underline-offset-2 hover:opacity-80 text-sm">
                              {data?.git_url}
                            </span>
                          </Link>
                        </>
                      )}
                    </p>

                    <p className="flex gap-2 max-w-sm truncate items-center">
                      {data?.website && (
                        <>
                          <span>
                            <PiGlobeLight size={18} />
                          </span>
                          <Link
                            href={
                              data?.website.startsWith("http")
                                ? data?.website
                                : `https://${data?.website}`
                            }
                            target="_blank"
                            className="max-w-48 truncate"
                          >
                            <span className="text-[#0000FF] dark:text-[#0070E0] underline underline-offset-2 hover:opacity-80 text-sm">
                              {data?.website}
                            </span>
                          </Link>
                        </>
                      )}
                    </p>

                    <p className="flex gap-2 items-center">
                      {data?.email && (
                        <>
                          <span>
                            <MdEmail />
                          </span>

                          <Link
                            href={`mailto:${data?.email}`}
                            target="_blank"
                            className="max-w-48 truncate"
                          >
                            <span className="text-[#0000FF] dark:text-[#0070E0] underline underline-offset-2 hover:opacity-80 text-sm">
                              {data?.email}
                            </span>
                          </Link>
                        </>
                      )}
                    </p>

                    <p className="flex gap-2 items-center">
                      {data?.phone_number && (
                        <>
                          <span>
                            <FaPhoneAlt size={14} />
                          </span>

                          <span className="font-semibold text-gray-600 dark:text-gray-300 text-sm">
                            {data?.phone_number}
                          </span>
                        </>
                      )}
                    </p>

                    <p className="flex gap-2 items-center">
                      {data?.address && (
                        <>
                          <span>
                            <IoLocation />
                          </span>

                          <span className="font-semibold text-gray-600 dark:text-gray-300 text-sm capitalize">
                            {data?.address}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    {/* QR Code */}
                    <div>
                      <ContactQRCode
                        contact={{
                          fullName: data?.name
                            ? `${toTitleCase(data.name)} (${
                                toTitleCase(data?.position) || ""
                              })`
                            : "",
                          phone: data?.phone_number || "",
                          address: data?.address || "",
                          email: data?.email || "",
                          linkedin: data?.linkedin_url || "",
                          github: data?.git_url || "",
                          website: data?.website || "",
                          skills: data?.skills?.slice(0, 4) || [],
                        }}
                      />
                    </div>
                    {/* Close / Open Button */}
                    <Card
                      className="flex w-max-[40%] h-8 mr-4 flex-wrap flex-col gap-2 justify-end cursor-pointer bg-gray-200 dark:bg-[#2C2C2C] dark:text-white  p-2 rounded-md"
                      onClick={() => setCloseParsedData((prev) => !prev)}
                    >
                      <RxHamburgerMenu />
                    </Card>
                  </div>
                </div>
              </div>

              <div className="mr-4">
                <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
              </div>

              {/* Second Part*/}
              <div className="flex-grow flex-col space-y-3">
                {/* Programming Language */}
                <div>
                  <div className="flex flex-col gap-1 pb-2">
                    <p className="font-semibold">
                      Progamming Language (X Years)
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm max-w-3xl">
                      {data?.programming_languages?.map(
                        (item: any, idx: number) => (
                          <div key={idx}>
                            <Card className="flex px-2 py-1 text-gray-600 font-sans rounded-md w-fit font-semibold dark:text-gray-300 capitalize">
                              {item}
                            </Card>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="mr-4">
                  <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
                </div>

                {/* Skills */}
                <div>
                  {data?.skills?.length > 0 && (
                    <div className="flex flex-col gap-1 pb-2">
                      <p className="font-semibold">Skills</p>
                      <div className="flex flex-wrap gap-3  max-w-3xl">
                        {data?.skills?.map((item: any, index: number) => (
                          <div key={index} className="flex gap-1 items-center">
                            <span className="text-gray-600">
                              <GoDotFill />
                            </span>
                            <span className="text-sm dark:text-gray-300 capitalize">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mr-4">
                  <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
                </div>

                {/* Experience */}
                <div className="flex flex-col gap-2">
                  <p className="font-semibold flex items-center gap-4 ">
                    Experiences
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {data?.years_of_experience &&
                        +data?.years_of_experience + " Years"}
                    </span>
                  </p>
                  <div className="flex flex-col gap-3">
                    {data?.work_experience.length > 0 &&
                      data?.work_experience.map((item: any, index: number) => (
                        <div key={index}>
                          <span className="font-semibold capitalize">
                            {index + 1 + ". " + item?.job_title}
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="font-semibold capitalize">
                              {item?.company_name}
                            </span>
                            {item?.start_date && item?.end_date && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                {"(" +
                                  item.start_date +
                                  " - " +
                                  item.end_date +
                                  ")"}
                              </span>
                            )}
                          </span>
                          <span className="flex flex-col text-sm max-w-3xl mr-4">
                            {item.responsibilities.length > 0 &&
                              item.responsibilities.map(
                                (el: any, index: number) => (
                                  <span
                                    className="flex gap-1 text-gray-700 "
                                    key={index}
                                  >
                                    <span className="mt-[3px]">
                                      <GoDotFill />
                                    </span>
                                    <span className="dark:text-gray-400 capitalize">
                                      {el}
                                    </span>
                                  </span>
                                )
                              )}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mr-4">
                  <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
                </div>

                {/* Project */}
                <div>
                  <div className="flex flex-col gap-1 max-w-3xl">
                    <p className="font-semibold ">Projects</p>
                    <div className="flex gap-4 flex-col">
                      {data?.technical_projects?.length > 0 &&
                        data?.technical_projects.map(
                          (data: any, index: number) => (
                            <div key={index}>
                              <div className="flex flex-col gap-2 text-gray-700">
                                <div className="flex justify-between items-center">
                                  <div className="text-gray-700 font-semibold capitalize dark:text-white">
                                    {index + 1 + ". " + data.project_name}
                                  </div>
                                  {data.project_link && (
                                    <Link
                                      href={
                                        (Array.isArray(data.project_link)
                                          ? data.project_link[0]
                                          : data.project_link
                                        ).startsWith("http")
                                          ? Array.isArray(data.project_link)
                                            ? data.project_link[0]
                                            : data.project_link
                                          : `https://${
                                              Array.isArray(data.project_link)
                                                ? data.project_link[0]
                                                : data.project_link
                                            }`
                                      }
                                      target="_blank"
                                      className=" mr-4 hover:opacity-50 dark:text-white"
                                    >
                                      <SquareArrowOutUpRight size={16} />
                                    </Link>
                                  )}
                                </div>
                                {data.programming_language?.length > 0 && (
                                  <div className="flex flex-wrap gap-3 items-center text-sm mr-4 max-w-3xl ">
                                    {data.programming_language.map(
                                      (el, index) => (
                                        <div key={index}>
                                          <Card className="p-2  font-sans rounded-md w-fit font-semibold dark:text-gray-400 capitalize">
                                            {el}
                                          </Card>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                                {data.description && (
                                  <p className="text-sm mr-4 dark:text-gray-400 capitalize">
                                    {data.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>

                <div className="mr-4">
                  <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
                </div>

                {/* Education */}
                <div>
                  <span className="flex flex-col gap-1">
                    <span className="font-semibold">Education</span>
                    <span className="flex gap-2 flex-col">
                      {data?.education?.length > 0 &&
                        data?.education.map((el: any, index: number) => (
                          <div key={index}>
                            <p className="font-semibold capitalize">
                              {index + 1 + ". " + el.degree}
                            </p>
                            <div className="flex gap-1 items-center text-gray-700 text-sm dark:text-gray-400">
                              <span className="capitalize">
                                {el?.institution}
                              </span>
                              <span>
                                {"(" +
                                  el?.start_date +
                                  " - " +
                                  el?.end_date +
                                  ")"}
                              </span>
                            </div>
                          </div>
                        ))}
                    </span>
                  </span>
                </div>

                <div className="mr-4">
                  <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
                </div>

                {/* Certificate */}
                <div>
                  <p className="font-semibold">Certification</p>
                  <div className="flex flex-col space-y-2">
                    {data?.certifications?.map((el: any, index: number) => (
                      <p className="text-sm flex capitalize" key={index}>
                        {index + 1 + ". " + el?.certification_name}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="relative w-full">
              <div
                className={`sticky z-10 border-t-2 border-slate-700 pt-3 flex flex-col gap-3 ${
                  !isAuthenticated && "blur-[2px] cursor-not-allowed"
                }`}
              >
                {/* Stars & Like / DisLike */}
                <div className="flex justify-end items-center gap-1">
                  {/* stars */}

                  <div className="font-semibold opacity-80">
                    <span>{inputData.rating_info.average}</span>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <button
                        key={index}
                        className={`p-1 hover:scale-110 transition-transform ${
                          !isAuthenticated && "cursor-not-allowed"
                        }`}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(index)}
                        disabled={!isAuthenticated}
                      >
                        <Star
                          size={14}
                          fill={
                            index <= (hoveredRating || inputData.star_rating)
                              ? "#f59e0b"
                              : "none"
                          }
                          stroke={
                            index <= (hoveredRating || inputData.star_rating)
                              ? "#f59e0b"
                              : "#4b5563"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <div className="font-semibold opacity-80">
                    <span>{"(" + inputData.rating_info.count + ")"}</span>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex justify-end items-center gap-14">
                  <div className="">
                    <Select
                      value={inputData.availability || ""}
                      onValueChange={(value) =>
                        setInputData({ ...inputData, availability: value })
                      }
                    >
                      <SelectTrigger
                        className="w-full sm:w-[120px] h-[34px] text-xs"
                        disabled={!isAuthenticated}
                      >
                        <SelectValue
                          className="text-xs"
                          placeholder="Availability"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="remote" className="text-xs">
                            Remote
                          </SelectItem>
                          <SelectItem value="onsite" className="text-xs">
                            Onsite
                          </SelectItem>
                          <SelectItem value="hybrid" className="text-xs">
                            Hybrid
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={inputData.time_of_day || ""}
                      onValueChange={(value) =>
                        setInputData({ ...inputData, time_of_day: value })
                      }
                      disabled={!isAuthenticated}
                    >
                      <SelectTrigger className="w-full sm:w-[120px] text-xs h-[34px]">
                        <SelectValue placeholder="Time" className="text-xs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="day" className="text-xs">
                            Day
                          </SelectItem>
                          <SelectItem value="night" className="text-xs">
                            Night
                          </SelectItem>
                          <SelectItem value="flexible" className="text-xs">
                            Flexible
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Salary */}
                <div className="flex flex-col sm:flex-row mt-1 justify-between md:gap-3 sm:gap-0">
                  {/* Current Salary */}
                  <div
                    className={`w-full md:w-40 relative ${
                      !isAuthenticated && "cursor-not-allowed"
                    }`}
                  >
                    {/* Label */}
                    <Label
                      htmlFor="currentSalary"
                      className={`absolute left-3 px-1 text-center text-xs font-medium text-gray-700 dark:bg-black dark:text-white ${
                        inputData.current_salary !== null
                          ? "-top-2 bg-white"
                          : "top-2.5 text-gray-500"
                      } ${!isAuthenticated && "cursor-not-allowed"} `}
                    >
                      Current Salary(USD)
                    </Label>
                    {/* Input Field */}
                    <Input
                      type="text"
                      id="currentSalary"
                      className={`peer block w-full rounded-md py-2 px-3 text-xs focus:ring-1 gap-2 focus:outline-none focus:ring-black focus:ring-opacity-75 ${
                        !isAuthenticated && "cursor-not-allowed"
                      } `}
                      value={
                        inputData.current_salary !== null
                          ? inputData.current_salary.toString()
                          : ""
                      }
                      onChange={(event) =>
                        validatePositiveNumber(event, "current_salary")
                      }
                    />
                  </div>

                  {/* Estimated Salary */}
                  <div className="w-full md:w-40 relative">
                    {/* Label */}
                    <Label
                      htmlFor="estimatedSalary"
                      className={`absolute left-3 px-1 text-xs font-medium transition-all duration-100 text-gray-700 dark:bg-black dark:text-white ${
                        inputData.estimated_salary !== null
                          ? "-top-2 bg-white"
                          : "top-2.5 text-gray-500"
                      }`}
                    >
                      Expected Salary(USD)
                    </Label>
                    {/* Input Field */}
                    <Input
                      type="text"
                      id="estimatedSalary"
                      className={`block w-full rounded-md py-2 px-3 text-xs   focus:outline-none focus:ring-1 gap-2 focus:ring-black focus:ring-opacity-75 ${
                        !isAuthenticated && "cursor-not-allowed"
                      } `}
                      value={
                        inputData.estimated_salary !== null
                          ? inputData.estimated_salary.toString()
                          : ""
                      }
                      onChange={(event) =>
                        validatePositiveNumber(event, "estimated_salary")
                      }
                    />
                  </div>

                  {/* Salary Based */}
                  <div className="w-full sm:w-auto">
                    <Select
                      value={inputData.paid_by || ""}
                      onValueChange={(value) =>
                        setInputData({ ...inputData, paid_by: value })
                      }
                    >
                      <SelectTrigger
                        className="w-full sm:w-[120px] h-[39px] text-xs"
                        disabled={!isAuthenticated}
                      >
                        <SelectValue
                          className="text-xs"
                          placeholder="Salary Based"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="hourly" className="text-xs">
                            Hourly
                          </SelectItem>
                          <SelectItem value="monthly" className="text-xs">
                            Monthly
                          </SelectItem>
                          <SelectItem value="annually" className="text-xs">
                            Annually
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Salary Based & Save */}
                <div className="flex justify-between items-center">
                  {/* Move Button */}
                  <div>
                    <Button
                      className="flex flex-wrap sm-w-auto h-8 text-center items-center"
                      disabled={!isAuthenticated}
                    >
                      <span className="flex gap-1 items-center w-auto text-xs">
                        <span>
                          <ExternalLink />
                        </span>
                        <span>Move to Private</span>
                      </span>
                    </Button>
                  </div>

                  {/* Notes */}
                  <div className="">
                    <Sheet>
                      <SheetTrigger
                        disabled={!isAuthenticated}
                        className={`${
                          !isAuthenticated && "cursor-not-allowed"
                        }`}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              className={`cursor-pointer transition-transform rounded-md duration-300 ease-in-out ${
                                !isAuthenticated && "cursor-not-allowed"
                              }`}
                            >
                              <Button
                                className={`flex gap-1 items-center w-22 h-8 px-2 text-xs ${
                                  !isAuthenticated && "pointer-events-none"
                                }`}
                              >
                                <span>
                                  <PiNotePencilBold className="text-[2px]" />
                                </span>
                                <span>Notes</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Add Notes to the CV</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </SheetTrigger>
                      <SheetContent className="flex flex-col gap-3 w-full sm:max-w-md">
                        <SheetHeader>
                          <SheetTitle>Note</SheetTitle>
                        </SheetHeader>
                        <div>
                          <Textarea
                            className="h-48"
                            placeholder="Add notes..."
                            value={inputData.note}
                            onChange={(e) =>
                              setInputData({
                                ...inputData,
                                note: e.target.value,
                              })
                            }
                            onKeyDown={handleKeyDown}
                          />
                        </div>
                        <SheetFooter>
                          <SheetClose asChild>
                            <Button
                              className="w-22 h-8"
                              type="submit"
                              onClick={handleSave}
                              ref={closeButtonRef}
                              disabled={!isAuthenticated}
                            >
                              Save
                            </Button>
                          </SheetClose>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  </div>

                  {/* Save Button */}
                  <div className="">
                    <Button
                      className={`text-center items-center w-[88px] h-8 ${
                        !isAuthenticated && "cursor-not-allowed"
                      }`}
                      onClick={handleSave}
                      disabled={loader || !isAuthenticated}
                    >
                      <div className="flex text-center items-center w-full">
                        {loader ? (
                          <div className="items-center tex-center">
                            <LoaderCircle className=" animate-spin w-4 h-4" />
                          </div>
                        ) : (
                          <div className="flex gap-1 items-center">
                            <Save className="w-4 h-4" />
                            <span className="text-xs">Save</span>
                          </div>
                        )}
                      </div>
                    </Button>
                  </div>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="text-center">
                  <p className="text-sm text-red-500">
                    You need to login to use this feature
                  </p>
                </div>
              )}
              {!isAuthenticated && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <Link href={"../../../../auth/login"}>
                    <Button className="font-bold px-6 py-3 rounded-lg shadow-lg">
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CVDetailPage;
