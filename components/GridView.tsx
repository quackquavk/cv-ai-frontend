"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IFormInputData } from "@/interfaces/FormInputData";
import { IDocumentData } from "@/interfaces/DocumentData";
import axiosInstance from "@/utils/axiosConfig";
import GridViewSkeleton from "./ui/Skeleton/GridViewSkeleton";
import Masonry from "react-masonry-css";
import { folderSelectStore } from "@/app/dashboard/store";
import { useSearchContext } from "@/app/dashboard/context/SearchContext";
import { publicFolderStore } from "@/app/dashboard/store";
import { Card } from "./ui/card";

interface GridViewProps {
  data: IDocumentData[];
  searchData: IFormInputData | null;
}

function GridView({ data, searchData }: GridViewProps) {
  const [searchResultsGridView, setSearchResultsGridView] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [folderFilteredData, setFolderFilteredData] = useState<any[]>([]);
  const { resetSearch } = useSearchContext();
  const { selectFolderId } = folderSelectStore();
  const { isFolderListOpen } = publicFolderStore();

  useEffect(() => {
    if (!searchData) {
      setLoading(false);
      setIsSearching(false);
      // setFolderFilteredData()
    }
  }, [data, searchData]);

  // Handle search data and view changes
  useEffect(() => {
    if (searchData) {
      setLoading(true);
      setIsSearching(true);
      fetchSearchResults(searchData);
    }
    // else {
    //   resetSearch();
    // }
  }, [searchData]);

  // useEffect(() => {
  //   if (selectFolderId && searchData) {
  //     fetchSearchResults(searchData);
  //     setIsSearching(false);
  //   }
  // }, [selectFolderId, searchData]);

  useEffect(() => {
    if (selectFolderId && searchData) {
      fetchSearchResults(searchData);
      setIsSearching(false);
    } else if (selectFolderId) {
      fetchFolderFiles();
      resetSearch();
    }
  }, [selectFolderId, searchData]);

  const fetchDocumentsByIds = async (docIds: string[]) => {
    const promises = docIds.map((docId) =>
      axiosInstance.get(`/document/cv/${docId}`).then((res) => res.data)
    );
    return Promise.all(promises);
  };

  const formatName = (name: string | undefined): string => {
    if (!name) return "undefined";
    return name.trim().replace(/\s+/g, "-").toLowerCase();
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

  const fetchSearchResults = async (searchData: IFormInputData) => {
    try {
      const response = await axiosInstance.post(
        `/document/search_by_query`,
        searchData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setSearchResultsGridView(response.data || []);
        setLoading(true);
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Erro Fetching", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderFiles = async () => {
    if (!selectFolderId) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/folder/getFiles/${selectFolderId}`
      );

      if (response.status === 200) {
        setFolderFilteredData(response.data);
      }
    } catch (error) {
      console.error("Error fetching folder files:", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleCardClick = async (docId: string) => {
    try {
      const [documentData] = await fetchDocumentsByIds([docId]);
      const url = `/cv-detail/${docId}/${formatName(
        documentData?.parsed_cv?.name
      )}/${formatLanguages(documentData?.parsed_cv?.programming_languages)}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error fetching document data:", error);
    }
  };

  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1,
  };

  const displayedData =
    selectFolderId && searchData
      ? searchResultsGridView
      : selectFolderId
      ? folderFilteredData
      : isSearching
      ? searchResultsGridView
      : data;

  // const displayedData =
  //   searchData && selectFolderId
  //     ? searchResults
  //     : selectFolderId
  //     ? folderFilteredData
  //     : data;

  return (
    <div className="overflow-hidden max-w-[100vw]">
      {loading ? (
        <div>
          {Array.from({ length: 1 }).map((_, index) => (
            <GridViewSkeleton key={index} />
          ))}
        </div>
      ) : displayedData.length > 0 && isFolderListOpen ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {displayedData.map((item, index) => (
            <Card
              key={item.doc_id}
              className="masonry-item mb-6 cursor-pointer relative hover:border-black dark:hover:border-white border-2 transition duration-500 ease-in-out"
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
            </Card>
          ))}
        </Masonry>
      ) : (
        <div className="text-center text-gray-600 mt-4">
          No Data Available...
        </div>
      )}
    </div>
  );
}

export default GridView;
