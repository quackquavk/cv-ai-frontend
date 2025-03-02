"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IFormInputData } from "@/interfaces/FormInputData";
import { IDocumentData } from "@/interfaces/DocumentData";
import Link from "next/link";
import axiosInstance from "@/utils/axiosConfig";
import GridViewSkeleton from "./ui/Skeleton/GridViewSkeleton";
// import { IoCallOutline } from "react-icons/io5";
// import { FaGithub } from "react-icons/fa";
// import { CiLinkedin } from "react-icons/ci";
import Masonry from "react-masonry-css";
import { folderSelectStore } from "@/app/dashboard/store";
import { useSearchContext } from "@/app/dashboard/context/SearchContext";
import { publicFolderStore } from "@/app/dashboard/store";

interface GridViewProps {
  data: IDocumentData[];
  searchData: IFormInputData | null;
}

function GridView({ data, searchData }: GridViewProps) {
  const [searchResultsGridView, setSearchResultsGridView] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  // const [hoveredId, setHoveredId] = useState<any | null>(null);
  // const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [folderFilteredData, setFolderFilteredData] = useState<any[]>([]);
  // const [hoveredUser, setHoveredUser] = useState<any>(null);

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
  //   const getHoveredDetails = async () => {
  //     try {
  //       const response = await axiosInstance.get(`/document/cv/${hoveredId}`);
  //       if (response.status === 200) {
  //         setHoveredUser(response.data.parsed_cv);
  //       }
  //     } catch (error) {
  //       console.error("Error parsing data:", error);
  //     }
  //   };
  //   if (hoveredId) {
  //     getHoveredDetails();
  //   }
  // }, [hoveredId]);

  useEffect(() => {
    if (selectFolderId && searchData) {
      fetchSearchResults(searchData);
      setIsSearching(false);
    }
  }, [selectFolderId, searchData]);

  useEffect(() => {
    if (selectFolderId) {
      fetchFolderFiles();
      resetSearch();
    }
  }, [selectFolderId]);

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

  // const handleMouseOver = (id: any) => {
  //   if (timeoutId) {
  //     clearTimeout(timeoutId);
  //   }

  //   const newTimeoutId = setTimeout(() => {
  //     setHoveredId(id);
  //   }, 800);

  //   setTimeoutId(newTimeoutId);
  // };

  // const handleMouseLeave = () => {
  //   if (timeoutId) {
  //     clearTimeout(timeoutId);
  //     setHoveredId(null);
  //     setHoveredUser([]);
  //   }
  //   setHoveredUser([]);
  //   setHoveredId(null);
  // };

  // For Opening the linkedin and github

  // const handleLinkedin = (event, linkedinUrl) => {
  //   event.stopPropagation();
  //   const newLinkedinUrl = linkedinUrl.startsWith("http")
  //     ? linkedinUrl
  //     : `https://${linkedinUrl}`;
  //   window.open(newLinkedinUrl, "_blank");
  // };

  // const handleGithub = (event, githubUrl) => {
  //   event.stopPropagation();
  //   const newGithubUrl = githubUrl.startsWith("http")
  //     ? githubUrl
  //     : `https://${githubUrl}`;
  //   window.open(newGithubUrl, "_blank");
  // };

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
    <div className="overflow-hidden max-w-[100vw] p-4">
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
            <div
              key={item.doc_id}
              className="masonry-item mb-6 cursor-pointer transition-transform duration-300 relative"
            >
              <Link href={`/cv-detail/${item.doc_id}`} target="_blank">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/cv_images/${item.image_id}.webp`}
                  alt={`Image ${index + 1}`}
                  height={500}
                  width={700}
                  className="rounded-lg object-cover shadow-lg w-full h-auto"
                  loading="lazy"
                  layout="responsive"
                />
              </Link>
            </div>
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
