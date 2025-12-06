"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IFormInputData } from "@/interfaces/FormInputData";
import { IDocumentData } from "@/interfaces/DocumentData";
import axiosInstance from "@/utils/axiosConfig";
import GridViewSkeleton from "./ui/Skeleton/GridViewSkeleton";
import Masonry from "react-masonry-css";
import { folderSelectStore, publicFolderStore } from "@/app/dashboard/store";
import { useSearchContext } from "@/app/dashboard/context/SearchContext";
import { Card } from "./ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDocumentStore } from "@/app/dashboard/store";
import Breadcrumb from "./ui/breadcrumb";
import { toast } from "sonner";

interface GridViewProps {
  data: IDocumentData[];
  searchData: IFormInputData | null;
}

function GridView({ data, searchData }: GridViewProps) {
  const [searchResultsGridView, setSearchResultsGridView] = useState<
    IDocumentData[]
  >([]);
  const { selectFolderId } = folderSelectStore();
  const { isFolderListOpen } = publicFolderStore();
  const { resetSearch } = useSearchContext();
  // const queryClient = useQueryClient();

  const [isSearching, setIsSearching] = useState(false);

  // State to track if the document (archieve)
  const shouldRefetchDocuments = useDocumentStore(
    (state) => state.shouldRefetchDocuments
  );

  const setShouldRefetchDocuments = useDocumentStore(
    (state) => state.setShouldRefetchDocuments
  );
  // --- Folder Fetch ---
  const {
    data: folderFilteredData,
    isLoading: folderLoading,
    refetch: refetchFolderFiles,
  } = useQuery({
    queryKey: ["folderFiles", selectFolderId],
    queryFn: async () => {
      if (!selectFolderId) return [];
      const res = await axiosInstance.get(`/folder/getFiles/${selectFolderId}`);
      return res.data;
    },
    enabled: !!selectFolderId && !searchData,
  });

  // --- Search Fetch ---
  const searchMutation = useMutation({
    mutationFn: async (searchData: IFormInputData) => {
      const res = await axiosInstance.post(
        `/document/search_by_query`,
        searchData
      );
      return res.data;
    },
    onSuccess: (data) => {
      setSearchResultsGridView(data || []);
    },
    onError: (error: any) => {
      // Handle 429 Too Many Requests error for free tier search limit
      if (error.response?.status === 429) {
        toast.error(
          "Search limit reached! Free users can perform 5 searches per day. Please upgrade to premium for unlimited searches.",
          {
            duration: 5000,
          }
        );
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to perform search. Please try again.");
      }
    },
    onSettled: () => {
      setIsSearching(false);
    },
  });

  useEffect(() => {
    if (searchData) {
      setIsSearching(true);
      searchMutation.mutate(searchData);
    }
  }, [searchData]);

  useEffect(() => {
    resetSearch();
  }, [selectFolderId]);

  useEffect(() => {
    if (shouldRefetchDocuments) {
      if (!searchData && selectFolderId) {
        refetchFolderFiles(); // use this instead of invalidateQueries
      }

      if (searchData) {
        setIsSearching(true);
        searchMutation.mutate(searchData);
      }

      setShouldRefetchDocuments(false);
    }
  }, [shouldRefetchDocuments, selectFolderId, searchData, refetchFolderFiles]);

  // --- Click Handler ---
  const handleCardClick = async (docId: string) => {
    try {
      const res = await axiosInstance.get(`/document/cv/${docId}`);
      const documentData = res.data;
      const url = `/cv-detail/${docId}/${formatName(
        documentData?.parsed_cv?.name
      )}/${formatLanguages(documentData?.parsed_cv?.programming_languages)}`;
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error fetching doc:", err);
    }
  };

  const formatName = (name: string | undefined): string =>
    name?.trim().replace(/\s+/g, "-").toLowerCase() || "undefined";

  const formatLanguages = (languages: string[] | undefined): string =>
    (languages || [])
      .map((lang) => lang.match(/\b[a-zA-Z#]+\b/)?.[0] || "")
      .filter(Boolean)
      .slice(0, 3)
      .join("-") || "undefined";

  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1,
  };

  const displayedData =
    searchData && selectFolderId
      ? searchResultsGridView
      : selectFolderId
      ? folderFilteredData || []
      : isSearching
      ? searchResultsGridView
      : data;

  const loading = folderLoading || (searchData && isSearching);

  return (
    <div className="overflow-hidden max-w-[100vw]">
      {loading ? (
        <GridViewSkeleton />
      ) : displayedData.length > 0 && isFolderListOpen ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {displayedData.map((item, index) => (
            <Card
              key={item.doc_id}
              className="masonry-item mb-6 cursor-pointer relative hover:border-black dark:hover:border-white border-2 transition duration-500 ease-in-out group"
              onClick={() => handleCardClick(item.doc_id)}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/cv_images/${item.image_id}.webp`}
                alt={`Image ${index + 1}`}
                height={500}
                width={700}
                className="rounded-lg object-cover w-full h-auto"
                loading="lazy"
                layout="responsive"
              />

              {/* Breadcrumb overlay */}
              {item?.folder_name && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-md px-2 py-1 shadow-lg">
                    <Breadcrumb
                      folderName={item.folder_name}
                      className="mb-0 text-xs"
                      showHome={false}
                    />
                  </div>
                </div>
              )}

              {/* Private Folder Actions - Show on hover */}
              {/* <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <PrivateFolderActions
                  documentId={item.doc_id}
                  documentName={item.doc_name || `CV ${index + 1}`}
                  currentFolderId={selectFolderId}
                  variant="icon"
                  className="bg-white dark:bg-gray-800 shadow-lg"
                />
              </div> */}
            </Card>
          ))}
        </Masonry>
      ) : (
        <div className="text-center text-gray-600 mt-4">
          No Document Available...
        </div>
      )}
    </div>
  );
}

export default GridView;
