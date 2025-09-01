import { create } from "zustand";
import { IFormInputData } from "@/interfaces/FormInputData";

//Folder Select
interface FolderSelectStore {
  selectFolderId: string | null;
  setSelectFolderId: (id: string | null) => void;
}

// DropDown of Public Folder
interface PublicFolderState {
  isFolderListOpen: boolean;
  toogleFolderList: () => void;
  isPublicSectionOpen: boolean;
  togglePublicSection: () => void;
  isPrivateSectionOpen: boolean;
  togglePrivateSection: () => void;
}

// Private Folder State
interface PrivateFolderState {
  hasPrivateFolder: boolean;
  setHasPrivateFolder: (value: boolean) => void;
  privateRootId: string | null;
  setPrivateRootId: (value: string | null) => void;
  privateSubfolders: { folder_id: string; name: string }[] | any[];
  setPrivateSubfolders: (
    value: { folder_id: string; name: string }[] | any
  ) => void;
  lastUpdatedFolderId: string | null;
  setLastUpdatedFolderId: (value: string | null) => void;
}

interface SearchState {
  formData: IFormInputData;
  setFormData: (newData) => void;
}

// Track the changes (archieve files)
interface DocumentState {
  shouldRefetchDocuments: boolean;
  setShouldRefetchDocuments: (value: boolean) => void;
}

// Folder Select
export const folderSelectStore = create<FolderSelectStore>((set) => ({
  selectFolderId: null,
  setSelectFolderId: (id) => set({ selectFolderId: id }),
}));

// DropDown of Public Folder
export const publicFolderStore = create<PublicFolderState>((set) => ({
  isFolderListOpen: true,
  toogleFolderList: () =>
    set((state) => ({ isFolderListOpen: !state.isFolderListOpen })),
  isPublicSectionOpen: true,
  togglePublicSection: () =>
    set((state) => ({ isPublicSectionOpen: !state.isPublicSectionOpen })),
  isPrivateSectionOpen: true,
  togglePrivateSection: () =>
    set((state) => ({ isPrivateSectionOpen: !state.isPrivateSectionOpen })),
}));

// Private Folder Store
export const privateFolderStore = create<PrivateFolderState>((set) => ({
  hasPrivateFolder: false,
  setHasPrivateFolder: (value) => set({ hasPrivateFolder: value }),
  privateRootId: null,
  setPrivateRootId: (value) => set({ privateRootId: value }),
  privateSubfolders: [],
  setPrivateSubfolders: (value) => {set({ privateSubfolders: value }); console.log("privateSubfolders", value)},
  lastUpdatedFolderId: null,
  setLastUpdatedFolderId: (value) => set({ lastUpdatedFolderId: value }),
}));

// FormData
export const useSearchStore = create<SearchState>((set) => ({
  formData: {
    address: "",
    attribute: [""],
    prompt: "",
    foldersToSearch: [""],
    sort_order: "",
    availability: "",
    time_of_day: "",
    star_rating: 0,
    current_salary: [],
    estimated_salary: [],
    paid_by: "",
  },
  setFormData: (newData) =>
    set((state) => ({
      formData: { ...state.formData, ...newData },
    })),
}));

// Export the state to track the changes (archieve files)
export const useDocumentStore = create<DocumentState>((set) => ({
  shouldRefetchDocuments: false,
  setShouldRefetchDocuments: (value) => set({ shouldRefetchDocuments: value }),
}));