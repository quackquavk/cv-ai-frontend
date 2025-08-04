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
}

// Private Folder State
interface PrivateFolderState {
  hasPrivateFolder: boolean;
  setHasPrivateFolder: (value: boolean) => void;
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
}));

// Private Folder Store
export const privateFolderStore = create<PrivateFolderState>((set) => ({
  hasPrivateFolder: false,
  setHasPrivateFolder: (value) => set({ hasPrivateFolder: value }),
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