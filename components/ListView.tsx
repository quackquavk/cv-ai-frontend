"use client";
import React, { useEffect } from "react";
import { Card } from "./ui/card";
import { FaUser, FaPhoneAlt, FaLinkedin, FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoLocation } from "react-icons/io5";
import { IDocumentData } from "@/interfaces/DocumentData";
import axiosInstance from "@/utils/axiosConfig";
import Link from "next/link";
import { IFormInputData } from "@/interfaces/FormInputData";
import ListViewSkeletion from "./ui/Skeleton/ListViewSkeleton";
import { folderSelectStore } from "@/app/dashboard/store";
// import { useSearchContext } from "@/app/dashboard/context/SearchContext";
import EmblaCarousel from "../app/dashboard/components/EmblaCarousel";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

interface ListViewProps {
  data: IDocumentData[] | any;
  searchData: IFormInputData | null;
}

const ITEMS_PER_PAGE: number = 10;

const ListView = ({ data, searchData }: ListViewProps) => {
  const { ref, inView } = useInView();
  // const { resetSearch } = useSearchContext();
  const { selectFolderId } = folderSelectStore();
  const queryClient = useQueryClient();

  // Function to fetch documents by IDs
  const fetchDocumentsByIds = async (docIds: string[]) => {
    const promises = docIds.map((docId) =>
      axiosInstance.get(`/document/cv/${docId}`).then((res) => res.data)
    );
    return Promise.all(promises);
  };

  // Main query for all documents
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["documents", selectFolderId, searchData], // Ensures refetch when folder changes
    queryFn: async ({ pageParam = 0 }: { pageParam: any }) => {
      let documentsToFetch: string[] = [];

      if (searchData) {
        const searchResponse = await axiosInstance.post(
          "/document/search_by_query",
          searchData
        );
        const searchDocIds = searchResponse.data.map((item) => item.doc_id);
        documentsToFetch = searchDocIds;
      }

      if (!searchData && selectFolderId) {
        const folderResponse = await axiosInstance.get(
          `/folder/getFiles/${selectFolderId}`
        );
        documentsToFetch = folderResponse.data.map((folder) => folder.doc_id);
      }

      if (!searchData && !selectFolderId) {
        documentsToFetch = data?.map((item) => item.doc_id) ?? [];
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
    },
    getNextPageParam: (lastPage: any) => lastPage.nextPage,
    initialPageParam: 0, // Reset pagination
    placeholderData: { pages: [], pageParams: [] },
  });

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["documents"] });
  }, [selectFolderId]);

  // Reset Data
  useEffect(() => {
    queryClient.setQueryData(["documents", selectFolderId, searchData], {
      pages: [],
      pageParams: [0],
    });
  }, [selectFolderId, queryClient, searchData]);

  // Prefetch initial data
  useEffect(() => {
    if (data.length > 0) {
      const initialDocIds = data
        .slice(0, ITEMS_PER_PAGE)
        .map((item) => item.doc_id);
      fetchDocumentsByIds(initialDocIds).then((initialDocuments) => {
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
      });
    }
  }, [data, queryClient, selectFolderId, searchData]);

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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <ListViewSkeletion variant="listView" />
        <ListViewSkeletion variant="listView" />
      </div>
    );
  }

  const allDocuments =
    infiniteData?.pages.flatMap((page: any) => page.documents) ?? [];

  return (
    <div className="flex flex-col max-w-screen p-4 rounded-md gap-5">
      {allDocuments.length === 0 ? (
        <p>No Document Available</p>
      ) : (
        <>
          {allDocuments.map((item: any) => (
            <Link
              legacyBehavior={false}
              key={item._id}
              href={`/cv-detail/${item._id}`}
              target="_blank"
              className="flex flex-col shadow-lg transform mb-3 hover:scale-x-[1.01] hover:scale-y-[1.02] hover:cursor-pointer transition duration-500 ease-in-out w-full"
            >
              <Card className="flex flex-col gap-2 w-[100%] px-5 py-8 z-0 relative">
                <div className="flex justify-between">
                  {/* Basic Information */}
                  <div className="flex flex-col gap-1 w-[25%] overflow-clip">
                    <div className="flex mb-0 flex-col">
                      <h1 className="mb-3 text-base underline underline-offset-4 font-bold">
                        {item?.parsed_cv?.position
                          ? item?.parsed_cv.position.toUpperCase()
                          : ""}
                      </h1>
                      <p className="flex items-center gap-2">
                        {item?.parsed_cv?.address && (
                          <span className="flex items-center">
                            <IoLocation className="text-base mr-2" />
                            <span className="text-gray-500 text-sm">
                              {item?.parsed_cv.address}
                            </span>
                          </span>
                        )}
                      </p>
                    </div>

                    <p>
                      {item?.parsed_cv?.name && (
                        <div className="flex items-center gap-2 mt-0">
                          <FaUser className="text-sm" />
                          <span className="text-gray-500 font-normal text-sm">
                            {item?.parsed_cv?.name}
                          </span>
                        </div>
                      )}
                    </p>

                    {/* Contact Information */}
                    {item?.parsed_cv?.phone_number && (
                      <div className="flex items-center gap-2">
                        <FaPhoneAlt className="text-sm" />
                        <span className="text-gray-500 text-sm">
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
                          className="text-sm text-blue-800 underline hover:opacity-80"
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
                            handleLinkedin(event, item?.parsed_cv.linkedin_url)
                          }
                          className="text-sm text-blue-800 underline hover:opacity-80"
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
                          className="text-sm text-blue-800 underline hover:opacity-80"
                        >
                          {item?.parsed_cv?.github_url}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Experience Section */}
                  <div className="flex flex-col gap-6 w-[30%] overflow-clip">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h1 className="font-bold text-base">Experience:</h1>
                        <p className="text-gray-500 text-sm">
                          {item?.parsed_cv?.years_of_experience
                            ? `${item?.parsed_cv.years_of_experience} years`
                            : ""}
                        </p>
                      </div>
                      {item?.parsed_cv?.work_experience?.length > 0 && (
                        <div>
                          <p className="font-semibold">
                            {item?.parsed_cv.work_experience[0]?.job_title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item?.parsed_cv.work_experience[0]?.company_name}
                            <span className="text-gray-400">
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
                        <span className="text-sm text-gray-500">
                          {item.parsed_cv.education[0].degree}
                        </span>
                      ) : (
                        <span className="text-sm text-red-700">
                          Education details not available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Availability Section */}
                  <div className="flex flex-col gap-6 w-[30%]">
                    <div className="flex gap-6">
                      <div className="flex flex-col gap-2">
                        {item?.parsed_cv?.current_salary && (
                          <div className="flex flex-col">
                            <div className="font-bold text-base">
                              Current Salary
                            </div>
                            <div className="text-gray-500">
                              ${item?.parsed_cv?.current_salary}
                              {item?.parsed_cv?.paid_by &&
                                ` / ${item?.parsed_cv?.paid_by}`}
                            </div>
                          </div>
                        )}
                        {item?.parsed_cv?.availability && (
                          <Card className="px-2 py-1 text-sm text-gray-600 w-fit h-fit">
                            {item?.parsed_cv?.availability}
                          </Card>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {item?.parsed_cv?.estimated_salary && (
                          <div className="flex flex-col">
                            <div className="font-bold text-base">
                              Estimated Salary
                            </div>
                            <div className="text-gray-500">
                              ${item?.parsed_cv?.estimated_salary}
                              {item?.parsed_cv?.paid_by &&
                                ` / ${item?.parsed_cv?.paid_by}`}
                            </div>
                          </div>
                        )}
                        {item?.parsed_cv?.time_of_day && (
                          <Card className="px-2 py-1 text-sm text-gray-600 w-fit h-fit">
                            {item?.parsed_cv?.time_of_day}
                          </Card>
                        )}
                      </div>
                    </div>

                    {/* Notes Section */}
                    {item?.parsed_cv?.note && (
                      <div className="flex flex-col gap-1">
                        <h1 className="font-bold">Note</h1>
                        <p className="text-sm text-gray-600">
                          {item.parsed_cv.note.length > 100
                            ? `${item.parsed_cv.note.substring(0, 100)}...`
                            : item.parsed_cv.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div
                  onClick={handleCarouselClick}
                  className="overflow-hidden flex justify-between max-w-full z-10"
                >
                  <EmblaCarousel skills={item?.parsed_cv?.skills || []} />
                </div>
              </Card>
            </Link>
          ))}

          {/* Loading indicator and intersection observer reference */}
          <div
            ref={ref}
            className="w-full mt-24 h-20 flex items-center justify-center"
          >
            {isFetchingNextPage && <ListViewSkeletion variant="listView" />}
          </div>
        </>
      )}
    </div>
  );
};

export default ListView;
