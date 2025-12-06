"use client";

import { create } from "zustand";
import {
  Resume,
  ResumeData,
  ResumeBasics,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  AwardItem,
  LanguageItem,
  InterestItem,
  ProfileItem,
  PublicationItem,
  ReferenceItem,
  VolunteerItem,
  getEmptyResumeData,
} from "../services/resumeApi";

// Generic section item type
type SectionItem =
  | ExperienceItem
  | EducationItem
  | SkillItem
  | ProjectItem
  | CertificationItem
  | AwardItem
  | LanguageItem
  | InterestItem
  | ProfileItem
  | PublicationItem
  | ReferenceItem
  | VolunteerItem;

type SectionKey = keyof ResumeData["sections"];

interface ResumeStore {
  resume: Resume | null;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // Core actions
  setResume: (resume: Resume) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  resetStore: () => void;

  // Basics
  updateBasics: (basics: Partial<ResumeBasics>) => void;

  // Summary
  updateSummary: (content: string) => void;

  // Metadata
  updateTemplate: (template: string) => void;
  updateTheme: (theme: Partial<ResumeData["metadata"]["theme"]>) => void;

  // Generic section actions
  addItem: <T extends SectionItem>(section: SectionKey, item: T) => void;
  updateItem: <T extends SectionItem>(
    section: SectionKey,
    id: string,
    item: Partial<T>
  ) => void;
  removeItem: (section: SectionKey, id: string) => void;
  toggleItemVisibility: (section: SectionKey, id: string) => void;
  reorderItems: (
    section: SectionKey,
    fromIndex: number,
    toIndex: number
  ) => void;

  // Section visibility
  toggleSectionVisibility: (section: SectionKey) => void;
  updateSectionName: (section: SectionKey, name: string) => void;
  updateSectionColumns: (section: SectionKey, columns: number) => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  resume: null,
  isLoading: false,
  isSaving: false,
  hasUnsavedChanges: false,

  setResume: (resume) => set({ resume, hasUnsavedChanges: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setSaving: (isSaving) => set({ isSaving }),
  resetStore: () =>
    set({
      resume: null,
      isLoading: false,
      isSaving: false,
      hasUnsavedChanges: false,
    }),

  // ============================================================
  // BASICS
  // ============================================================
  updateBasics: (basics) => {
    const { resume } = get();
    if (!resume) return;
    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          basics: { ...resume.data.basics, ...basics },
        },
      },
      hasUnsavedChanges: true,
    });
  },

  // ============================================================
  // SUMMARY
  // ============================================================
  updateSummary: (content) => {
    const { resume } = get();
    if (!resume) return;
    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          sections: {
            ...resume.data.sections,
            summary: { ...resume.data.sections.summary, content },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  },

  // ============================================================
  // METADATA
  // ============================================================
  updateTemplate: (template) => {
    const { resume } = get();
    if (!resume) return;
    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          metadata: { ...resume.data.metadata, template },
        },
      },
      hasUnsavedChanges: true,
    });
  },

  updateTheme: (theme) => {
    const { resume } = get();
    if (!resume) return;
    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          metadata: {
            ...resume.data.metadata,
            theme: { ...resume.data.metadata.theme, ...theme },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  },

  // ============================================================
  // GENERIC SECTION ACTIONS
  // ============================================================
  addItem: (section, item) => {
    const { resume } = get();
    if (!resume || section === "summary") return;

    const sectionData = resume.data.sections[section];
    if (!("items" in sectionData)) return;

    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          sections: {
            ...resume.data.sections,
            [section]: {
              ...sectionData,
              items: [...sectionData.items, item],
            },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  },

  updateItem: (section, id, item) => {
    const { resume } = get();
    if (!resume || section === "summary") return;

    const sectionData = resume.data.sections[section];
    if (!("items" in sectionData)) return;

    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          sections: {
            ...resume.data.sections,
            [section]: {
              ...sectionData,
              items: sectionData.items.map((i: SectionItem) =>
                i.id === id ? { ...i, ...item } : i
              ),
            },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  },

  removeItem: (section, id) => {
    const { resume } = get();
    if (!resume || section === "summary") return;

    const sectionData = resume.data.sections[section];
    if (!("items" in sectionData)) return;

    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          sections: {
            ...resume.data.sections,
            [section]: {
              ...sectionData,
              items: sectionData.items.filter((i: SectionItem) => i.id !== id),
            },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  },

  toggleItemVisibility: (section, id) => {
    const { resume } = get();
    if (!resume || section === "summary") return;

    const sectionData = resume.data.sections[section];
    if (!("items" in sectionData)) return;

    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          sections: {
            ...resume.data.sections,
            [section]: {
              ...sectionData,
              items: sectionData.items.map((i: SectionItem) =>
                i.id === id ? { ...i, visible: !i.visible } : i
              ),
            },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  },

  reorderItems: (section, fromIndex, toIndex) => {
    const { resume } = get();
    if (!resume || section === "summary") return;

    const sectionData = resume.data.sections[section];
    if (!("items" in sectionData)) return;

    const items = [...sectionData.items];
    const [removed] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, removed);

    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          sections: {
            ...resume.data.sections,
            [section]: { ...sectionData, items },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  },

  // ============================================================
  // SECTION VISIBILITY & SETTINGS
  // ============================================================
  toggleSectionVisibility: (section) => {
    const { resume } = get();
    if (!resume) return;

    const sectionData = resume.data.sections[section];

    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          sections: {
            ...resume.data.sections,
            [section]: { ...sectionData, visible: !sectionData.visible },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  },

  updateSectionName: (section, name) => {
    const { resume } = get();
    if (!resume) return;

    const sectionData = resume.data.sections[section];

    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          sections: {
            ...resume.data.sections,
            [section]: { ...sectionData, name },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  },

  updateSectionColumns: (section, columns) => {
    const { resume } = get();
    if (!resume) return;

    const sectionData = resume.data.sections[section];

    set({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          sections: {
            ...resume.data.sections,
            [section]: { ...sectionData, columns },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  },
}));
