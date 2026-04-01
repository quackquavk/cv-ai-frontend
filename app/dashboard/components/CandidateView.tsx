"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { GoDotFill } from "react-icons/go";
import DetailViewSkeleton from "@/components/ui/Skeleton/DetailViewSkeleton";
import axiosInstance from "@/utils/axiosConfig";
import ContactQRCode from "@/app/components/ContactQRCode";
import {
  SquareArrowOutUpRight,
  Star,
  Upload,
  RefreshCw,
  Trash2,
  FileText,
} from "lucide-react";
import { FaLinkedin, FaGithub, FaPhoneAlt } from "react-icons/fa";
import { PiGlobeLight, PiNotePencilBold } from "react-icons/pi";
import { IoLocation } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Save, Bot, Settings, Briefcase } from "lucide-react";
import { toast } from "sonner";
import LinkedInJobPreferences from "@/app/dashboard/components/LinkedInJobPreferences";
import LinkedInApplicationsTable from "@/app/dashboard/components/LinkedInApplicationsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface IAvailability {
  document_id: string;
  availability: string | null;
  time_of_day: string | null;
  star_rating: number | null;
  current_salary: number | null;
  estimated_salary: number | null;
  paid_by: string | null;
  note: string;
  rating_info: {
    average: number;
    count: number;
  };
  has_rated: boolean;
  ready_to_work: boolean;
}

const CandidateView = () => {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loader, setLoader] = useState<boolean>(false);
  const [hasClaimed, setHasClaimed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadLoader, setUploadLoader] = useState<boolean>(false);
  const [claimableCV, setClaimableCV] = useState<any>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [shouldClaimCV, setShouldClaimCV] = useState<boolean>(false);
  const [hasClaimedAnyCV, setHasClaimedAnyCV] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const closeButtonRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    ready_to_work: false,
  });

  useEffect(() => {
    fetchCandidateCV();
    checkHasClaimedCV();
  }, []);

  const checkHasClaimedCV = async () => {
    try {
      const response = await axiosInstance.get("/cv-claim/has_claimed_cv", {
        withCredentials: true,
      });

      if (response.data) {
        setHasClaimedAnyCV(response.data);
      }
    } catch (error: any) {
      console.error("Error checking claimed CV status:", error);
      if (error.response?.status === 401) {
        // User not logged in, just leave as false
      }
      setHasClaimedAnyCV(false);
    }
  };

  const fetchCandidateCV = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/cv-claim/get_cv", {
        withCredentials: true,
      });

      if (response.data && response.data.parsed_cv) {
        setData(response.data.parsed_cv);
        setHasClaimed(true);

        if (response.data._id) {
          setInputData((prev) => ({
            ...prev,
            document_id: response.data._id,
          }));
          fetchAvailabilityData(response.data._id);
        }
      }
    } catch (error: any) {
      console.error("Error fetching candidate CV:", error);
      if (error.response?.status === 404) {
        toast.info("You haven't claimed a CV yet");
      }
      setHasClaimed(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilityData = async (documentId: string) => {
    try {
      const response = await axiosInstance.get(
        `/cv_document/getAvailability/${documentId}`,
      );
      setInputData((prev) => ({
        ...response.data,
        document_id: documentId, // Ensure document_id is always set
      }));
    } catch (error) {
      console.error("Error fetching availability data", error);
    }
  };

  const handleClaimCV = async () => {
    try {
      setLoader(true);
      const response = await axiosInstance.post(
        "/cv-claim/claim",
        {},
        {
          withCredentials: true,
        },
      );

      toast.success("CV claimed successfully!");
      fetchCandidateCV();
    } catch (error: any) {
      console.error("Error claiming CV:", error);
      toast.error(error.response?.data?.detail || "Failed to claim CV");
    } finally {
      setLoader(false);
    }
  };

  const handleClaimSpecificCV = async (documentId: string) => {
    try {
      setLoader(true);
      const response = await axiosInstance.post(
        `/cv-claim/claim?document_id=${documentId}`,
        {},
        {
          withCredentials: true,
        },
      );

      toast.success("CV claimed successfully!");
      setClaimableCV(null);
      setHasClaimedAnyCV(true);
      fetchCandidateCV();
    } catch (error: any) {
      console.error("Error claiming CV:", error);
      toast.error(error.response?.data?.detail || "Failed to claim CV");
    } finally {
      setLoader(false);
    }
  };

  const handleGetClaimableCV = async () => {
    try {
      setLoader(true);
      const response = await axiosInstance.get("/cv-claim/get_claimable_cv", {
        withCredentials: true,
      });

      if (response.data && response.data.parsed_cv) {
        console.log("Setting claimable CV data:", response.data);
        setClaimableCV(response.data);
        toast.success("Claimable CV found! Please review the details.");
      } else {
        toast.info("No claimable CV found");
      }
    } catch (error: any) {
      console.error("Error getting claimable CV:", error);
      if (error.response?.status === 404) {
        toast.info("No claimable CV available at the moment");
      } else {
        toast.error(
          error.response?.data?.detail || "Failed to get claimable CV",
        );
      }
    } finally {
      setLoader(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only");
      return;
    }

    try {
      setUploadLoader(true);
      const formData = new FormData();
      formData.append("files", file);
      formData.append("is_claiming", shouldClaimCV.toString());

      const response = await axiosInstance.post(
        "/document/document",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      toast.success("CV uploaded successfully!");
      if (!hasClaimed) {
        fetchCandidateCV();
      }
      if (shouldClaimCV) {
        setHasClaimedAnyCV(true);
      }
      setShowSidebar(false);
    } catch (error: any) {
      console.error("Error uploading CV:", error);
      toast.error(error.response?.data?.detail || "Failed to upload CV");
    } finally {
      setUploadLoader(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileUpload(event.target.files);
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      handleFileUpload(event.dataTransfer.files);
    }
  };

  function validatePositiveNumber(event: any, field: string) {
    const value = event.target.value;
    const sanitizedValue = value.replace(/[^\d.]/g, "");
    const decimalCount = (sanitizedValue.match(/\./g) || []).length;

    if (decimalCount > 1) return;

    let finalValue = sanitizedValue;
    if (finalValue.startsWith(".")) {
      finalValue = `0${finalValue}`;
    }

    if (finalValue === "" || /^\d*\.?\d*$/.test(finalValue)) {
      setInputData((prevData) => ({
        ...prevData,
        [field]: finalValue === "" ? null : finalValue,
      }));
    }
  }

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting) {
        handleSave();
      }
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const body = {
      document_id: inputData.document_id,
      availability: inputData.availability || "",
      time_of_day: inputData.time_of_day || "",
      current_salary: inputData.current_salary,
      estimated_salary: inputData.estimated_salary,
      paid_by: inputData.paid_by || "",
      rating_info: {
        average: inputData.rating_info.average,
        count: inputData.rating_info.count,
      },
      has_rated: inputData.has_rated,
      note: inputData.note,
      ready_to_work: inputData.ready_to_work,
    };

    try {
      setLoader(true);
      const response = await axiosInstance.put(
        `/cv_document/updateAvailability`,
        body,
      );

      if (
        response.data.detail &&
        response.data.detail.includes("Nothing to change in document")
      ) {
        toast.info("Nothing to change in document", { duration: 1000 });
        return;
      }

      setInputData(response.data);
      toast.success("Successfully Updated Data", { duration: 1000 });
      closeButtonRef.current?.click();
    } catch (error) {
      console.error("Error saving data", error);
      toast.error("Error Occurred!", { duration: 1000 });
    } finally {
      setLoader(false);
      setIsSubmitting(false);
    }
  };

  const handleDeleteCV = async () => {
    try {
      setLoader(true);
      await axiosInstance.delete("/cv-claim/", {
        withCredentials: true,
      });

      toast.success("CV deleted successfully");
      setHasClaimed(false);
      setData(null);
      setHasClaimedAnyCV(false);
      setIsDeleteDialogOpen(false);
      // Reset input data
      setInputData({
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
        ready_to_work: false,
      });
    } catch (error: any) {
      console.error("Error deleting CV:", error);
      toast.error(error.response?.data?.detail || "Failed to delete CV");
    } finally {
      setLoader(false);
    }
  };

  function toTitleCase(str: string): string {
    return str
      ?.split(" ")
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      ?.join(" ");
  }

  if (loading) {
    return (
      <div className="w-full h-full">
        <DetailViewSkeleton />
      </div>
    );
  }

  if (!hasClaimed || !data) {
    return (
      <div className="flex items-center justify-center min-h-full relative">
        {/* Sidebar Toggle Button */}
        {/* <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Upload className="h-4 w-4" />
        </Button> */}

        {/* Sidebar */}
        {showSidebar && (
          <div className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-20 shadow-lg">
            <div className="p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">CV Management</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                >
                  ×
                </Button>
              </div>

              {/* Upload Section */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  CV Upload
                </h4>
                <div
                  onDrop={handleDrop}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col cursor-pointer items-center justify-center h-28 border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 rounded-md transition-all duration-300 ${
                    isDragging ? "opacity-50 bg-gray-100 dark:bg-gray-800" : ""
                  }`}
                >
                  <Upload className="h-5 w-5 text-gray-400 mb-1" />
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                    Drop CV or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF only</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploadLoader && (
                  <div className="mt-2 text-center">
                    <LoaderCircle className="h-4 w-4 animate-spin mx-auto" />
                    <p className="text-xs text-gray-600 mt-1">Uploading...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!claimableCV ? (
          <Card className="p-8 max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Claim Your CV</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't claimed a CV yet. Find a claimable CV below or upload
              one from the sidebar.
            </p>

            <div className="flex flex-row gap-3">
              {/* <Button onClick={handleClaimCV} disabled={loader} className="w-full">
                {loader ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  "Claim Random CV"
                )}
              </Button> */}

              <Button
                onClick={handleGetClaimableCV}
                disabled={loader}
                className="w-full"
              >
                {loader ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  "Get Claimable CV"
                )}
              </Button>
              <Button
                onClick={() => {
                  router.push("/dashboard/resumes");
                }}
                disabled={loader}
                className="w-full bg-black dark:bg-black dark:border-2 dark:border-gray-500 text-white dark:text-white"
              >
                {loader ? (
                  <LoaderCircle className="h-5 w-5 animate-spin " />
                ) : (
                  "Create Resume"
                )}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Claimable CV Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Review the CV details below and decide if you want to claim it.
            </p>

            {claimableCV?.parsed_cv && (
              <div className="space-y-4 mb-6">
                <div className="border-b pb-3">
                  <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                    Name
                  </p>
                  <p className="text-lg font-semibold capitalize">
                    {claimableCV.parsed_cv.name || "N/A"}
                  </p>
                </div>

                <div className="border-b pb-3">
                  <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                    Position
                  </p>
                  <p className="text-base capitalize">
                    {claimableCV.parsed_cv.position || "N/A"}
                  </p>
                </div>

                <div className="border-b pb-3">
                  <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                    Email
                  </p>
                  <p className="text-base">
                    {claimableCV.parsed_cv.email || "N/A"}
                  </p>
                </div>

                {claimableCV.parsed_cv.phone_number && (
                  <div className="border-b pb-3">
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                      Phone
                    </p>
                    <p className="text-base">
                      {claimableCV.parsed_cv.phone_number}
                    </p>
                  </div>
                )}

                {claimableCV.parsed_cv.address && (
                  <div className="border-b pb-3">
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                      Location
                    </p>
                    <p className="text-base capitalize">
                      {claimableCV.parsed_cv.address}
                    </p>
                  </div>
                )}

                {claimableCV.parsed_cv.skills &&
                  claimableCV.parsed_cv.skills.length > 0 && (
                    <div className="border-b pb-3">
                      <p className="text-sm font-medium text-gray-500 uppercase mb-2">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {claimableCV.parsed_cv.skills
                          .slice(0, 10)
                          .map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded capitalize"
                            >
                              {skill}
                            </span>
                          ))}
                        {claimableCV.parsed_cv.skills.length > 10 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{claimableCV.parsed_cv.skills.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setClaimableCV(null)}
                className="flex-1"
                disabled={loader}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleClaimSpecificCV(claimableCV._id)}
                disabled={loader}
                className="flex-1"
              >
                {loader ? (
                  <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Claim this CV
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Action Buttons */}
      {/* <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {hasClaimed ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
      </div> */}

      {/* Sidebar for claimed users */}
      {/* {showSidebar && hasClaimed && (
        <div className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-20 shadow-lg">
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">CV Management</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(false)}
              >
                ×
              </Button>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Replace CV</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Replace your current CV with a new one
              </p>
              <div
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col cursor-pointer items-center justify-center h-28 border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 rounded-md transition-all duration-300 ${
                  isDragging ? "opacity-50 bg-gray-100 dark:bg-gray-800" : ""
                }`}
              >
                <RefreshCw className="h-5 w-5 text-gray-400 mb-1" />
                <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                  Drop new CV or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF only</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {uploadLoader && (
                <div className="mt-2 text-center">
                  <LoaderCircle className="h-4 w-4 animate-spin mx-auto" />
                  <p className="text-xs text-gray-600 mt-1">Uploading...</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">LinkedIn Automation</h4>
              <LinkedInBot />
            </div>
          </div>
        </div>
      )} */}

      <Card className="h-full w-full rounded-lg flex flex-col">
        {/* Page Header */}
        <div className="px-6 pt-6 -mb-2">
          <h1 className="text-2xl font-bold mb-1 font-sans">
            Candidate Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage your AI-parsed professional profile. This
            information is used to match you with job opportunities and fill out
            applications.
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 pb-0">
          <div className="flex flex-col gap-4">
            {/* Header Section */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2 flex-1">
                <h1 className="font-bold text-2xl">
                  {data?.name?.toUpperCase()}
                </h1>
                <p className="font-semibold underline underline-offset-2">
                  {data?.position?.toUpperCase()}
                </p>

                {/* Contact Links */}
                <div className="flex flex-col gap-1">
                  {data?.linkedin_url && (
                    <p className="flex gap-2 items-center">
                      <FaLinkedin />
                      <a
                        href={
                          data.linkedin_url.startsWith("http")
                            ? data.linkedin_url
                            : `https://${data.linkedin_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0000FF] dark:text-[#0070E0] underline hover:opacity-80 text-sm"
                      >
                        {data.linkedin_url}
                      </a>
                    </p>
                  )}

                  {data?.git_url && (
                    <p className="flex gap-2 items-center">
                      <FaGithub />
                      <Link
                        href={
                          data.git_url.startsWith("http")
                            ? data.git_url
                            : `https://${data.git_url}`
                        }
                        target="_blank"
                        className="text-[#0000FF] dark:text-[#0070E0] underline hover:opacity-80 text-sm"
                      >
                        {data.git_url}
                      </Link>
                    </p>
                  )}

                  {data?.website && (
                    <p className="flex gap-2 items-center">
                      <PiGlobeLight size={18} />
                      <Link
                        href={
                          data.website.startsWith("http")
                            ? data.website
                            : `https://${data.website}`
                        }
                        target="_blank"
                        className="text-[#0000FF] dark:text-[#0070E0] underline hover:opacity-80 text-sm"
                      >
                        {data.website}
                      </Link>
                    </p>
                  )}

                  {data?.email && (
                    <p className="flex gap-2 items-center">
                      <MdEmail />
                      <Link
                        href={`mailto:${data.email}`}
                        className="text-[#0000FF] dark:text-[#0070E0] underline hover:opacity-80 text-sm"
                      >
                        {data.email}
                      </Link>
                    </p>
                  )}

                  {data?.phone_number && (
                    <p className="flex gap-2 items-center">
                      <FaPhoneAlt size={14} />
                      <span className="font-semibold text-gray-600 dark:text-gray-300 text-sm">
                        {data.phone_number}
                      </span>
                    </p>
                  )}

                  {data?.address && (
                    <p className="flex gap-2 items-center">
                      <IoLocation />
                      <span className="font-semibold text-gray-600 dark:text-gray-300 text-sm capitalize">
                        {data.address}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="ml-4">
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

            <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />

            {/* Programming Languages */}
            {data?.programming_languages?.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Programming Languages</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {data.programming_languages.map((item: any, idx: number) => (
                    <Card
                      key={idx}
                      className="px-3 py-1 font-semibold capitalize"
                    >
                      {item}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />

            {/* Skills */}
            {data?.skills?.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Skills</p>
                <div className="flex flex-wrap gap-3">
                  {data.skills.map((item: any, index: number) => (
                    <div key={index} className="flex gap-1 items-center">
                      <GoDotFill className="text-gray-600" />
                      <span className="text-sm dark:text-gray-300 capitalize">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />

            {/* Experience */}
            {data?.work_experience?.length > 0 && (
              <div>
                <p className="font-semibold mb-2 flex items-center gap-4">
                  Experience
                  {data?.years_of_experience && (
                    <span className="text-sm text-gray-500">
                      {data.years_of_experience} Years
                    </span>
                  )}
                </p>
                <div className="flex flex-col gap-4">
                  {data.work_experience.map((item: any, index: number) => (
                    <div key={index}>
                      <p className="font-semibold capitalize">
                        {index + 1}. {item?.job_title}
                      </p>
                      <p className="flex items-center gap-3">
                        <span className="font-semibold capitalize">
                          {item?.company_name}
                        </span>
                        {item?.start_date && item?.end_date && (
                          <span className="text-sm text-gray-500 capitalize">
                            ({item.start_date} - {item.end_date})
                          </span>
                        )}
                      </p>
                      {item.responsibilities?.length > 0 && (
                        <div className="flex flex-col text-sm mt-1">
                          {item.responsibilities.map(
                            (resp: string, idx: number) => (
                              <span key={idx} className="flex gap-1">
                                <GoDotFill className="mt-[3px]" />
                                <span className="dark:text-gray-400 capitalize">
                                  {resp}
                                </span>
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />

            {/* Projects */}
            {data?.technical_projects?.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Projects</p>
                <div className="flex flex-col gap-4">
                  {data.technical_projects.map(
                    (project: any, index: number) => (
                      <div key={index}>
                        <div className="flex justify-between items-center">
                          <p className="font-semibold capitalize">
                            {index + 1}. {project.project_name}
                          </p>
                          {project.project_link && (
                            <Link
                              href={
                                (Array.isArray(project.project_link)
                                  ? project.project_link[0]
                                  : project.project_link
                                ).startsWith("http")
                                  ? Array.isArray(project.project_link)
                                    ? project.project_link[0]
                                    : project.project_link
                                  : `https://${
                                      Array.isArray(project.project_link)
                                        ? project.project_link[0]
                                        : project.project_link
                                    }`
                              }
                              target="_blank"
                              className="hover:opacity-50"
                            >
                              <SquareArrowOutUpRight size={16} />
                            </Link>
                          )}
                        </div>
                        {project.programming_language?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.programming_language.map(
                              (lang: string, idx: number) => (
                                <Card
                                  key={idx}
                                  className="px-2 py-1 text-sm font-semibold capitalize"
                                >
                                  {lang}
                                </Card>
                              ),
                            )}
                          </div>
                        )}
                        {project.description && (
                          <p className="text-sm mt-2 dark:text-gray-400 capitalize">
                            {project.description}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />

            {/* Education */}
            {data?.education?.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Education</p>
                <div className="flex flex-col gap-2">
                  {data.education.map((edu: any, index: number) => (
                    <div key={index}>
                      <p className="font-semibold capitalize">
                        {index + 1}. {edu.degree}
                      </p>
                      <div className="flex gap-1 items-center text-sm text-gray-700 dark:text-gray-400">
                        <span className="capitalize">{edu?.institution}</span>
                        <span>
                          ({edu?.start_date} - {edu?.end_date})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />

            {/* Certifications */}
            {data?.certifications?.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Certifications</p>
                <div className="flex flex-col gap-1">
                  {data.certifications.map((cert: any, index: number) => (
                    <p key={index} className="text-sm capitalize">
                      {index + 1}. {cert?.certification_name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Availability Section - Fixed at bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sticky bottom-0 z-10 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Status */}
            <div className="flex items-center justify-between sm:justify-start sm:flex-col sm:items-start gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                Status
              </span>
              <div className="flex items-center gap-2 h-[36px]">
                <Switch
                  id="ready-to-work"
                  checked={inputData.ready_to_work || false}
                  onCheckedChange={(checked) =>
                    setInputData({ ...inputData, ready_to_work: checked })
                  }
                />
                <Label
                  htmlFor="ready-to-work"
                  className="text-xs font-medium cursor-pointer whitespace-nowrap"
                >
                  Ready to Work
                </Label>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between sm:justify-start sm:flex-col sm:items-start gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                Rating
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                  {inputData.rating_info.average}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="p-0.5">
                      <Star
                        size={14}
                        fill={
                          index <= inputData.rating_info.average
                            ? "#f59e0b"
                            : "none"
                        }
                        stroke={
                          index <= inputData.rating_info.average
                            ? "#f59e0b"
                            : "#9ca3af"
                        }
                      />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  ({inputData.rating_info.count}{" "}
                  {inputData.rating_info.count === 1 ? "rating" : "ratings"})
                </span>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between sm:justify-start sm:flex-col sm:items-start gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                Availability
              </span>
              <div className="flex gap-2">
                <Select
                  value={inputData.availability || ""}
                  onValueChange={(value) =>
                    setInputData({ ...inputData, availability: value })
                  }
                >
                  <SelectTrigger className="w-[100px] h-[36px] text-xs">
                    <SelectValue placeholder="Availability" />
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

                <Select
                  value={inputData.time_of_day || ""}
                  onValueChange={(value) =>
                    setInputData({ ...inputData, time_of_day: value })
                  }
                >
                  <SelectTrigger className="w-[80px] h-[36px] text-xs">
                    <SelectValue placeholder="Time" />
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
            <div className="flex items-center justify-between sm:justify-start sm:flex-col sm:items-start gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                Salary
              </span>
              <div className="flex gap-1.5">
                <div className="w-20 relative">
                  <Label
                    htmlFor="currentSalary"
                    className={`absolute left-2 px-1 text-xs font-medium transition-all duration-200 ${
                      inputData.current_salary !== null
                        ? "-top-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                        : "top-2 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    Current
                  </Label>
                  <Input
                    type="text"
                    id="currentSalary"
                    className="peer block w-full h-[36px] rounded text-xs font-medium focus:ring-1 focus:ring-gray-500 focus:border-gray-500 px-2"
                    value={
                      inputData.current_salary !== null
                        ? inputData.current_salary.toString()
                        : ""
                    }
                    onChange={(event) =>
                      validatePositiveNumber(event, "current_salary")
                    }
                    placeholder="0"
                  />
                </div>

                <div className="w-20 relative">
                  <Label
                    htmlFor="estimatedSalary"
                    className={`absolute left-2 px-1 text-xs font-medium transition-all duration-200 ${
                      inputData.estimated_salary !== null
                        ? "-top-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                        : "top-2 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    Expected
                  </Label>
                  <Input
                    type="text"
                    id="estimatedSalary"
                    className="block w-full h-[36px] rounded text-xs font-medium focus:ring-1 focus:ring-gray-500 focus:border-gray-500 px-2"
                    value={
                      inputData.estimated_salary !== null
                        ? inputData.estimated_salary.toString()
                        : ""
                    }
                    onChange={(event) =>
                      validatePositiveNumber(event, "estimated_salary")
                    }
                    placeholder="0"
                  />
                </div>

                <Select
                  value={inputData.paid_by || ""}
                  onValueChange={(value) =>
                    setInputData({ ...inputData, paid_by: value })
                  }
                >
                  <SelectTrigger className="w-[70px] h-[36px] text-xs">
                    <SelectValue placeholder="Period" />
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

            {/* Actions */}
            <div className="flex items-center justify-between sm:justify-start sm:flex-col sm:items-start gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide invisible sm:visible">
                Actions
              </span>
              <div className="flex gap-2">
                <Sheet>
                  <SheetTrigger>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-[36px] px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                          >
                            <PiNotePencilBold size={14} />
                            <span className="hidden sm:inline ml-1">Notes</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add notes about this candidate</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col gap-3">
                    <SheetHeader>
                      <SheetTitle>Candidate Notes</SheetTitle>
                    </SheetHeader>
                    <Textarea
                      className="h-48 resize-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Add notes about skills, interview feedback, or other important information..."
                      value={inputData.note}
                      onChange={(e) =>
                        setInputData({ ...inputData, note: e.target.value })
                      }
                      onKeyDown={handleKeyDown}
                    />
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button
                          className="h-[36px] px-4 text-xs font-medium"
                          type="submit"
                          onClick={handleSave}
                          ref={closeButtonRef}
                        >
                          Save Notes
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <Button
                  size="sm"
                  className="h-[36px] px-3 text-xs bg-gray-800 hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100 dark:text-black transition-colors duration-200"
                  onClick={handleSave}
                  disabled={loader || isSubmitting}
                >
                  {loader || isSubmitting ? (
                    <>
                      <LoaderCircle className="h-3 w-3 animate-spin" />
                      <span className="ml-1">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={12} />
                      <span className="hidden sm:inline ml-1">Save</span>
                    </>
                  )}
                </Button>

                <AlertDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-[36px] px-3 text-xs"
                      disabled={loader}
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline ml-1">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your claimed CV and remove your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteCV}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CandidateView;
