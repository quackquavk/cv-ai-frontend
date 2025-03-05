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

interface SearchState {
  formData: IFormInputData;
  setFormData: (newData) => void;
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
