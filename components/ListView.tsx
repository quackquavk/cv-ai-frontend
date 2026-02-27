"use client";
import React, { useRef, useEffect, useState } from "react";
import { Card } from "./ui/card";
import { FaUser, FaPhoneAlt, FaLinkedin, FaGithub } from "react-icons/fa";
import { Dot, Star } from "lucide-react";
import { MdEmail } from "react-icons/md";
import { IoLocation } from "react-icons/io5";
import { IDocumentData } from "@/interfaces/DocumentData";
import axiosInstance from "@/utils/axiosConfig";
import Link from "next/link";
import { IFormInputData } from "@/interfaces/FormInputData";
import ListViewSkeletion from "./ui/Skeleton/ListViewSkeleton";
import {
  folderSelectStore,
  multiFolderSelectStore,
} from "@/app/dashboard/store";
import { useSearchContext } from "@/app/dashboard/context/SearchContext";
import EmblaCarousel from "../app/dashboard/components/EmblaCarousel";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { publicFolderStore } from "@/app/dashboard/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useDocumentStore } from "@/app/dashboard/store";
import MoveCV from "@/app/dashboard/components/MoveCV";
import Breadcrumb from "./ui/breadcrumb";
import { toast } from "sonner";

interface ListViewProps {
  data: IDocumentData[] | any;
  searchData: IFormInputData | null;
}

const ITEMS_PER_PAGE: number = 10;

const ListView = ({ data, searchData }: ListViewProps) => {
  const { ref, inView } = useInView();
  const { resetSearch } = useSearchContext();
  const { selectFolderId } = folderSelectStore();
  const { selectedFolderIds } = multiFolderSelectStore();
  const { isFolderListOpen } = publicFolderStore();
  const queryClient = useQueryClient();
  const [folders, setFolders] = useState<any[]>([]);
  const hasMounted = useRef(false);

  const shouldRefetchDocuments = useDocumentStore(
    (state) => state.shouldRefetchDocuments,
  );

  const setShouldRefetchDocuments = useDocumentStore(
    (state) => state.setShouldRefetchDocuments,
  );

  const fetchDocumentsByIds = async (docIds: string[]) => {
    console.log(`docIds`, docIds);
    const documents = await axiosInstance.post("document/bulk_document", {
      document_ids: docIds,
    });
    return documents.data;
  };

  useEffect(() => {
    const fetchFolders = async () => {
      const folders = await axiosInstance.get("/folder/getAllFolders");
      setFolders(folders.data);
    };
    fetchFolders();
  }, []);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["documents", selectFolderId, searchData],

    queryFn: async ({ pageParam = 0 }: { pageParam: any }) => {
      try {
        let documentsToFetch: string[] = [];

        if (searchData) {
          const searchResponse = await axiosInstance.post(
            "/document/search_by_query",
            searchData,
          );
          documentsToFetch = searchResponse.data.map((item) => item.doc_id);
        } else if (!searchData && selectFolderId) {
          const folderResponse = await axiosInstance.get(
            `/folder/getFiles/${selectFolderId}`,
          );
          documentsToFetch = folderResponse.data.map((folder) => folder.doc_id);
        } else {
          documentsToFetch = data?.map((item) => item.doc_id) ?? [];
        }

        if (documentsToFetch.length === 0) {
          return {
            documents: [],
            nextPage: undefined,
            totalDocs: 0,
          };
        }

        const start = pageParam * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageDocIds = documentsToFetch.slice(start, end);
        const documents = await fetchDocumentsByIds(pageDocIds);

        return {
          documents,
          nextPage: end < documentsToFetch.length ? pageParam + 1 : undefined,
          totalDocs: documentsToFetch.length,
        };
      } catch (error: any) {
        console.error("Error fetching documents:", error);

        if (error.response?.status === 429) {
          toast.error(
            "Search limit reached! Free users can perform 5 searches per day. Please upgrade to premium for unlimited searches.",
            {
              duration: 5000,
            },
          );
        } else if (
          error.response?.data?.detail ||
          error.response?.data?.message
        ) {
          toast.error(
            error.response.data.detail || error.response.data.message,
          );
        } else {
          toast.error("Failed to fetch documents. Please try again.");
        }

        return {
          documents: [],
          nextPage: undefined,
          totalDocs: 0,
        };
      }
    },
    getNextPageParam: (lastPage: any) => lastPage.nextPage,
    initialPageParam: 0, // Ensures pagination starts correctly
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on tab switch
    refetchOnReconnect: false, // Prevent refetch on internet reconnect
    enabled: true,
  });

  useEffect(() => {
    if (hasMounted.current) {
      resetSearch();
    } else {
      hasMounted.current = true;
    }
  }, [selectFolderId]);

  useEffect(() => {
    if (shouldRefetchDocuments || selectFolderId || searchData) {
      queryClient.invalidateQueries({
        queryKey: ["documents", selectFolderId, searchData],
      });

      if (shouldRefetchDocuments) {
        setShouldRefetchDocuments(false); // Reset only if triggered by archive
      }
    }
  }, [selectFolderId, searchData, shouldRefetchDocuments]);

  useEffect(() => {
    const prefetchInitialData = async () => {
      if (data && data?.length > 0 && !selectFolderId && !searchData) {
        const initialDocIds = data
          .slice(0, ITEMS_PER_PAGE)
          .map((item) => item.doc_id);

        try {
          const initialDocuments = await fetchDocumentsByIds(initialDocIds);
          queryClient.setQueryData(["documents", selectFolderId, searchData], {
            pages: [
              {
                documents: initialDocuments,
                nextPage: data.length > ITEMS_PER_PAGE ? 1 : undefined,
                totalDocs: data.length,
              },
            ],
            pageParams: [0],
          });
        } catch (error) {
          console.error("Error prefetching initial data:", error);
        }
      }
    };

    prefetchInitialData();
  }, [data, queryClient, selectFolderId, searchData]);

  // console.log(`SearchField`, searchData);

  // Load more when scrolling to the bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Utility functions for handling links
  const handleEmailClick = (event: React.MouseEvent, email: string) => {
    event.stopPropagation();
    window.open(`mailto:${email}`, "_blank");
  };

  const handleLinkedin = (event: React.MouseEvent, linkedinUrl: string) => {
    event.stopPropagation();
    const newLinkedinUrl = linkedinUrl.startsWith("http")
      ? linkedinUrl
      : `https://${linkedinUrl}`;
    window.open(newLinkedinUrl, "_blank");
  };

  const handleCarouselClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  if (isLoading || shouldRefetchDocuments) {
    return (
      <div className="flex flex-col gap-3">
        <ListViewSkeletion />
        <ListViewSkeletion />
      </div>
    );
  }

  const allDocuments =
    infiniteData?.pages.flatMap((page: any) => page.documents) ?? [];

  // Only sort when a folder is selected, otherwise keep original order
  const sortedDocuments = selectFolderId
    ? allDocuments.sort((a: any, b: any) => {
        const nameA = (a?.doc_name || a?.parsed_cv?.name || "").toLowerCase();
        const nameB = (b?.doc_name || b?.parsed_cv?.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      })
    : allDocuments;
  const formatName = (name: string | undefined): string => {
    if (!name) return "undefined";
    return name.trim().replace(/\s+/g, "-");
  };

  const formatLanguages = (languages: string[] | undefined): string => {
    if (!languages || languages.length === 0) return "undefined";
    return languages
      .map((item) => {
        const match = item.match(/\b[a-zA-Z#]+\b/);
        return match ? match[0] : ""; // Ensure no null values
      })
      .filter((lang) => lang !== "") // Remove empty matches
      .slice(0, 3)
      .join("-");
  };

  return (
    <div className="flex flex-col w-full max-w-[100vw] rounded-md sm:p-2 gap-3 sm:gap-5 items-center">
      {sortedDocuments?.length === 0 || !isFolderListOpen ? (
        <p className="text-gray-600">No Document Available...</p>
      ) : (
        <>
          {sortedDocuments.map((item: any) => (
            <Link
              legacyBehavior={false}
              key={item._id}
              href={`/cv-detail/${item._id}/${formatName(
                item?.parsed_cv?.name,
              )}/${formatLanguages(item?.parsed_cv?.programming_languages)}`}
              target="_blank"
              className="transform mb-3 sm:hover:scale-x-[1.01] sm:hover:scale-y-[1.02] cursor-pointer transition duration-500 ease-in-out w-full overflow-hidden"
            >
              <Card className="relative gap-2 max-w-full px-3 py-2 sm:px-5 sm:pt-6 pb-16 sm:pb-20 hover:border-black dark:hover:border-white transition duration-500 ease-in-out">
                {/* Breadcrumb */}
                {item?.folder_name && (
                  <Breadcrumb
                    folderName={item.folder_name}
                    className="mb-2"
                    showHome={false}
                  />
                )}

                <div className="relative flex justify-between">
                  <div className="flex flex-col lg:flex-row z-0 lg:justify-between w-full gap-4">
                    {/* Basic Information */}
                    <div className="flex flex-col gap-1 w-full lg:w-[25%] overflow-clip ">
                      {/* <div className="flex mb-0 flex-col"> */}
                      <div className="flex justify-between items-center mb-2 sm:mb-3">
                        <h1 className="text-sm sm:text-base underline underline-offset-4 font-bold flex-1">
                          {item?.parsed_cv?.position
                            ? item?.parsed_cv.position.toUpperCase()
                            : ""}
                        </h1>
                        {item?.parsed_cv?.ratings?.average ? (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm">
                              {item.parsed_cv.ratings.average.toFixed(1)}
                            </span>
                            <Star size={16} fill="currentColor" />
                          </div>
                        ) : null}
                      </div>

                      {item?.parsed_cv?.name && (
                        <div className="flex items-center gap-2 mt-0 capitalize">
                          <FaUser className="text-sm" />
                          <span className="text-gray-500 font-normal text-sm dark:text-gray-400">
                            {item?.parsed_cv?.name}
                          </span>
                        </div>
                      )}
                      <p className="flex items-center gap-2 capitalize">
                        {item?.parsed_cv?.address && (
                          <span className="flex items-center">
                            <IoLocation className="text-base mr-2" />
                            <span className="text-gray-500 text-sm dark:text-gray-400">
                              {item?.parsed_cv.address}
                            </span>
                          </span>
                        )}
                      </p>

                      {/* Contact Information */}
                      {item?.parsed_cv?.phone_number && (
                        <div className="flex items-center gap-2">
                          <FaPhoneAlt className="text-sm" />
                          <span className="text-gray-500 text-sm dark:text-gray-400">
                            {item?.parsed_cv.phone_number}
                          </span>
                        </div>
                      )}

                      {item?.parsed_cv?.email && (
                        <div className="flex items-center gap-2">
                          <MdEmail className="text-sm" />
                          <span
                            onClick={(event) =>
                              handleEmailClick(event, item?.parsed_cv.email)
                            }
                            className="text-sm text-[#0000FF] underline underline-offset-2 dark:text-[#0070E0] hover:opacity-80 truncate"
                          >
                            {item?.parsed_cv.email}
                          </span>
                        </div>
                      )}

                      {/* Social Links */}
                      {item?.parsed_cv?.linkedin_url && (
                        <div className="flex items-center gap-2">
                          <FaLinkedin className="cursor-pointer" />
                          <span
                            onClick={(event) =>
                              handleLinkedin(
                                event,
                                item?.parsed_cv.linkedin_url,
                              )
                            }
                            className="text-xs sm:text-sm text-[#0000FF] dark:text-[#0070E0] underline underline-offset-2 hover:opacity-80 truncate"
                          >
                            {item?.parsed_cv?.linkedin_url}
                          </span>
                        </div>
                      )}

                      {item?.parsed_cv?.github_url && (
                        <div className="flex items-center gap-2">
                          <FaGithub className="cursor-pointer" />
                          <Link
                            href={
                              item?.parsed_cv.github_url.startsWith("http")
                                ? item.parsed_cv.github_url
                                : `https://${item.parsed_cv.github_url}`
                            }
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            className="text-xs sm:text-sm text-[#0000FF] dark:text-[#0070E0] underline underline-offset-2 hover:opacity-80 truncate"
                          >
                            {item?.parsed_cv?.github_url}
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Experience Section */}
                    <div className="flex flex-col gap-4 sm:gap-6 w-full lg:w-[30%] overflow-clip">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h1 className="font-bold text-base">Experience:</h1>
                          <p className="text-gray-500 text-sm dark:text-gray-400">
                            {item?.parsed_cv?.years_of_experience
                              ? `${item?.parsed_cv.years_of_experience} Years`
                              : ""}
                          </p>
                        </div>
                        {item?.parsed_cv?.work_experience?.length > 0 && (
                          <div>
                            <p className="font-semibold capitalize">
                              {item?.parsed_cv.work_experience[0]?.job_title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {item?.parsed_cv.work_experience[0]?.company_name}
                              <span>
                                {" "}
                                {`${item?.parsed_cv.work_experience[0]?.start_date} - 
                               ${item?.parsed_cv.work_experience[0]?.end_date}`}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h1 className="font-bold text-base">Education</h1>
                        {item?.parsed_cv.education?.length > 0 ? (
                          <span className="text-sm text-gray-500 capitalize dark:text-gray-400">
                            {item.parsed_cv.education[0].degree}
                          </span>
                        ) : (
                          <span className="text-sm text-red-600">
                            Education details not available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Availability Section */}
                    <div className="flex flex-col gap-4 sm:gap-6 w-full lg:w-[30%]">
                      <div className="flex flex-wrap gap-4 sm:gap-6">
                        <div className="flex flex-col gap-2">
                          {item?.parsed_cv?.current_salary !== undefined &&
                            item?.parsed_cv?.current_salary !== null && (
                              <div className="flex flex-col">
                                <div className="font-bold text-base">
                                  Current Salary
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">
                                  ${item?.parsed_cv?.current_salary}
                                  {item?.parsed_cv?.paid_by &&
                                    ` / ${item?.parsed_cv?.paid_by}`}
                                </div>
                              </div>
                            )}
                          {item?.parsed_cv?.availability && (
                            <Card className="px-2 py-1 text-sm text-gray-600 w-fit h- dark:text-gray-400 capitalize">
                              {item?.parsed_cv?.availability}
                            </Card>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {item?.parsed_cv?.estimated_salary !== undefined &&
                            item?.parsed_cv?.estimated_salary !== null && (
                              <div className="flex flex-col">
                                <div className="font-bold text-base">
                                  Estimated Salary
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">
                                  ${item?.parsed_cv?.estimated_salary}
                                  {item?.parsed_cv?.paid_by &&
                                    ` / ${item?.parsed_cv?.paid_by}`}
                                </div>
                              </div>
                            )}
                          {item?.parsed_cv?.time_of_day && (
                            <Card className="px-2 py-1 text-sm text-gray-600 w-fit h-fit dark:text-gray-400 capitalize">
                              {item?.parsed_cv?.time_of_day}
                            </Card>
                          )}
                        </div>
                      </div>

                      {/* Notes Section */}
                      {item?.parsed_cv?.note && (
                        <div className="flex flex-col gap-1">
                          <h1 className="font-bold">Note</h1>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.parsed_cv.note.length > 100
                              ? `${item.parsed_cv.note.substring(0, 100)}...`
                              : item.parsed_cv.note}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Edited status check */}
                    <MoveCV
                      handleCarouselClick={handleCarouselClick}
                      item={item}
                      folders={folders}
                    />

                    {/* Mobile Menu - Similar to Desktop */}
                  </div>
                  {/* Edited status check */}
                  {!item?.parsed_cv?.edited && (
                    <div className="flex absolute top-[-25px] right-[-20px] lg:hidden text-3xl">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Dot color="red" size={48} />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            sideOffset={0}
                            className="translate-y-1 p-1 text-[10px] max-w-[80px] z-50"
                          >
                            <p>Not Edited</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div
                  onClick={handleCarouselClick}
                  className="absolute inset-x-0 z-50 overflow-hidden bottom-1 sm:bottom-3 w-full px-2 sm:px-5"
                >
                  <EmblaCarousel skills={item?.parsed_cv?.skills || []} />
                </div>
              </Card>
            </Link>
          ))}

          {/* Loading indicator and intersection observer reference */}
          <div
            ref={ref}
            className="w-full lg:mt-24 mt-[15rem] h-20 flex items-center justify-center"
          >
            {isFetchingNextPage && <ListViewSkeletion />}
          </div>
        </>
      )}
    </div>
  );
};

export default ListView;
