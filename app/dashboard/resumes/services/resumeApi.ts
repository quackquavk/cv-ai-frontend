import axiosInstance from "@/utils/axiosConfig";

// ============================================================
// BASE TYPES
// ============================================================

export interface UrlItem {
  label: string;
  href: string;
}

// ============================================================
// SECTION ITEM TYPES
// ============================================================

export interface ResumeBasics {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  url: UrlItem;
  picture: {
    url: string;
    size: number;
    aspectRatio: number;
    borderRadius: number;
    effects: {
      hidden: boolean;
      border: boolean;
      grayscale: boolean;
    };
  };
  customFields: Array<{
    id: string;
    icon: string;
    name: string;
    value: string;
  }>;
}

export interface SummarySection {
  id: "summary";
  name: string;
  content: string;
  visible: boolean;
  columns: number;
}

export interface ExperienceItem {
  id: string;
  visible: boolean;
  company: string;
  position: string;
  location: string;
  date: string;
  summary: string;
  url: UrlItem;
}

export interface EducationItem {
  id: string;
  visible: boolean;
  institution: string;
  studyType: string;
  area: string;
  score: string;
  date: string;
  summary: string;
  url: UrlItem;
}

export interface SkillItem {
  id: string;
  visible: boolean;
  name: string;
  description: string;
  level: number; // 0-5
  keywords: string[];
}

export interface ProjectItem {
  id: string;
  visible: boolean;
  name: string;
  description: string;
  date: string;
  summary: string;
  keywords: string[];
  url: UrlItem;
}

export interface CertificationItem {
  id: string;
  visible: boolean;
  name: string;
  issuer: string;
  date: string;
  summary: string;
  url: UrlItem;
}

export interface AwardItem {
  id: string;
  visible: boolean;
  title: string;
  awarder: string;
  date: string;
  summary: string;
  url: UrlItem;
}

export interface LanguageItem {
  id: string;
  visible: boolean;
  name: string;
  description: string;
  level: number; // 0-5
}

export interface InterestItem {
  id: string;
  visible: boolean;
  name: string;
  keywords: string[];
}

export interface ProfileItem {
  id: string;
  visible: boolean;
  network: string;
  username: string;
  icon: string;
  url: UrlItem;
}

export interface PublicationItem {
  id: string;
  visible: boolean;
  name: string;
  publisher: string;
  date: string;
  summary: string;
  url: UrlItem;
}

export interface ReferenceItem {
  id: string;
  visible: boolean;
  name: string;
  description: string;
  summary: string;
  url: UrlItem;
}

export interface VolunteerItem {
  id: string;
  visible: boolean;
  organization: string;
  position: string;
  location: string;
  date: string;
  summary: string;
  url: UrlItem;
}

// ============================================================
// SECTION TYPES
// ============================================================

export interface Section<T> {
  id: string;
  name: string;
  visible: boolean;
  columns: number;
  items: T[];
}

// ============================================================
// RESUME DATA STRUCTURE
// ============================================================

export interface ResumeData {
  basics: ResumeBasics;
  sections: {
    summary: SummarySection;
    experience: Section<ExperienceItem>;
    education: Section<EducationItem>;
    skills: Section<SkillItem>;
    projects: Section<ProjectItem>;
    certifications: Section<CertificationItem>;
    awards: Section<AwardItem>;
    languages: Section<LanguageItem>;
    interests: Section<InterestItem>;
    profiles: Section<ProfileItem>;
    publications: Section<PublicationItem>;
    references: Section<ReferenceItem>;
    volunteer: Section<VolunteerItem>;
  };
  metadata: {
    template: string;
    theme: {
      background: string;
      text: string;
      primary: string;
    };
    typography: {
      font: {
        family: string;
        subset: string;
        variants: string[];
        size: number;
      };
      lineHeight: number;
      hideIcons: boolean;
      underlineLinks: boolean;
    };
    page: {
      margin: number;
      format: string;
    };
  };
}

export interface Resume {
  resume_id: string;
  user_id: string;
  title: string;
  data: ResumeData;
  status: "draft" | "completed";
  created_at: string;
  updated_at: string;
}

export interface ResumeListItem {
  resume_id: string;
  title: string;
  status: "draft" | "completed";
  updated_at: string;
}

// ============================================================
// DEFAULT VALUES
// ============================================================

const defaultUrl: UrlItem = { label: "", href: "" };

const defaultSection = <T>(id: string, name: string): Section<T> => ({
  id,
  name,
  visible: true,
  columns: 1,
  items: [],
});

export const getEmptyResumeData = (): ResumeData => ({
  basics: {
    name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    url: defaultUrl,
    picture: {
      url: "",
      size: 64,
      aspectRatio: 1,
      borderRadius: 0,
      effects: { hidden: false, border: false, grayscale: false },
    },
    customFields: [],
  },
  sections: {
    summary: {
      id: "summary",
      name: "Summary",
      content: "",
      visible: true,
      columns: 1,
    },
    experience: defaultSection<ExperienceItem>("experience", "Experience"),
    education: defaultSection<EducationItem>("education", "Education"),
    skills: defaultSection<SkillItem>("skills", "Skills"),
    projects: defaultSection<ProjectItem>("projects", "Projects"),
    certifications: defaultSection<CertificationItem>(
      "certifications",
      "Certifications"
    ),
    awards: defaultSection<AwardItem>("awards", "Awards"),
    languages: defaultSection<LanguageItem>("languages", "Languages"),
    interests: defaultSection<InterestItem>("interests", "Interests"),
    profiles: defaultSection<ProfileItem>("profiles", "Profiles"),
    publications: defaultSection<PublicationItem>(
      "publications",
      "Publications"
    ),
    references: defaultSection<ReferenceItem>("references", "References"),
    volunteer: defaultSection<VolunteerItem>("volunteer", "Volunteer"),
  },
  metadata: {
    template: "classic",
    theme: {
      background: "#ffffff",
      text: "#000000",
      primary: "#3b82f6",
    },
    typography: {
      font: {
        family: "Inter",
        subset: "latin",
        variants: ["regular", "500", "600", "700"],
        size: 14,
      },
      lineHeight: 1.5,
      hideIcons: false,
      underlineLinks: false,
    },
    page: {
      margin: 18,
      format: "a4",
    },
  },
});

// ============================================================
// API FUNCTIONS
// ============================================================

export const resumeApi = {
  list: async (): Promise<ResumeListItem[]> => {
    const response = await axiosInstance.get("/resume");
    return response.data.resumes;
  },

  get: async (id: string): Promise<Resume> => {
    const response = await axiosInstance.get(`/resume/${id}`);
    return response.data;
  },

  create: async (title: string): Promise<Resume> => {
    const response = await axiosInstance.post("/resume", {
      title,
      data: getEmptyResumeData(),
      status: "draft",
    });
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<{ title: string; data: ResumeData; status: string }>
  ): Promise<Resume> => {
    const response = await axiosInstance.patch(`/resume/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/resume/${id}`);
  },

  duplicate: async (id: string): Promise<Resume> => {
    const response = await axiosInstance.post(`/resume/${id}/duplicate`);
    return response.data;
  },
};
