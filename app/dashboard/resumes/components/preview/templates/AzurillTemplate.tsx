"use client";

import { ResumeData } from "../../../services/resumeApi";
import { cn } from "@/lib/utils";
import React from "react";

interface TemplateProps {
  data: ResumeData;
}

// Default section order
const DEFAULT_SECTION_ORDER = [
  "summary",
  "profiles",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "awards",
  "languages",
  "interests",
  "publications",
  "references",
  "volunteer",
];

// Sections that go in sidebar vs main
const SIDEBAR_SECTIONS = ["skills", "languages", "interests", "profiles"];
const MAIN_SECTIONS = [
  "summary",
  "experience",
  "education",
  "projects",
  "certifications",
  "awards",
  "volunteer",
  "publications",
  "references",
];

// Helper: Check if string is a valid URL
const isUrl = (href: string | undefined): boolean => {
  if (!href) return false;
  try {
    new URL(href);
    return true;
  } catch {
    return href.startsWith("http://") || href.startsWith("https://");
  }
};

// Helper: Check if string is empty
const isEmptyString = (str: string | undefined): boolean => {
  return !str || str.trim().length === 0;
};

// Rating bar component
const Rating = ({
  level,
  primaryColor,
}: {
  level: number;
  primaryColor: string;
}) => (
  <div className="relative h-1 w-[128px] group-[.sidebar]:mx-auto">
    <div
      className="absolute inset-0 h-1 w-[128px] rounded"
      style={{ backgroundColor: primaryColor, opacity: 0.25 }}
    />
    <div
      className="absolute inset-0 h-1 rounded"
      style={{
        backgroundColor: primaryColor,
        width: `${(level / 5) * 128}px`,
      }}
    />
  </div>
);

// Link component
const Link = ({
  href,
  label,
  primaryColor,
  className,
}: {
  href: string;
  label: string;
  primaryColor: string;
  className?: string;
}) => {
  if (!isUrl(href)) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener nofollow"
      className={cn("hover:underline", className)}
      style={{ color: primaryColor }}
    >
      {label}
    </a>
  );
};

// Section renderers
type SectionRenderer = (props: {
  data: ResumeData;
  primaryColor: string;
  inSidebar?: boolean;
}) => React.ReactNode;

const renderSummary: SectionRenderer = ({ data, primaryColor }) => {
  const section = data.sections.summary;
  if (!section?.visible || isEmptyString(section.content)) return null;

  return (
    <section key="summary">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      <div
        className="relative border-l pl-4 space-y-2"
        style={{ borderColor: primaryColor }}
      >
        <div
          className="absolute left-[-4.5px] top-[8px] size-[8px] rounded-full"
          style={{ backgroundColor: primaryColor }}
        />
        <p className="whitespace-pre-line">{section.content}</p>
      </div>
    </section>
  );
};

const renderExperience: SectionRenderer = ({ data, primaryColor }) => {
  const section = data.sections.experience;
  if (!section?.visible || !section.items?.length) return null;

  return (
    <section key="experience">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      <div className="space-y-3">
        {section.items
          .filter((e) => e.visible)
          .map((exp) => (
            <div
              key={exp.id}
              className="relative border-l pl-4 space-y-1"
              style={{ borderColor: primaryColor }}
            >
              <div
                className="absolute left-[-4.5px] top-px size-[8px] rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="font-bold">{exp.company}</div>
              <div>{exp.position}</div>
              {exp.location && (
                <div className="text-sm opacity-70">{exp.location}</div>
              )}
              <div className="font-bold text-sm">{exp.date}</div>
              {exp.summary && (
                <p className="text-sm whitespace-pre-line mt-1">
                  {exp.summary}
                </p>
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

const renderEducation: SectionRenderer = ({ data, primaryColor }) => {
  const section = data.sections.education;
  if (!section?.visible || !section.items?.length) return null;

  return (
    <section key="education">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      <div className="space-y-3">
        {section.items
          .filter((e) => e.visible)
          .map((edu) => (
            <div
              key={edu.id}
              className="relative border-l pl-4 space-y-1"
              style={{ borderColor: primaryColor }}
            >
              <div
                className="absolute left-[-4.5px] top-px size-[8px] rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="font-bold">{edu.institution}</div>
              <div>
                {edu.studyType} {edu.area && `in ${edu.area}`}
              </div>
              {edu.score && (
                <div className="text-sm opacity-70">GPA: {edu.score}</div>
              )}
              <div className="font-bold text-sm">{edu.date}</div>
              {edu.summary && (
                <p className="text-sm whitespace-pre-line mt-1">
                  {edu.summary}
                </p>
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

const renderProjects: SectionRenderer = ({ data, primaryColor }) => {
  const section = data.sections.projects;
  if (!section?.visible || !section.items?.length) return null;

  return (
    <section key="projects">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      <div className="space-y-3">
        {section.items
          .filter((p) => p.visible)
          .map((project) => (
            <div
              key={project.id}
              className="relative border-l pl-4 space-y-1"
              style={{ borderColor: primaryColor }}
            >
              <div
                className="absolute left-[-4.5px] top-px size-[8px] rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="font-bold">
                {project.url?.href ? (
                  <Link
                    href={project.url.href}
                    label={project.name}
                    primaryColor={primaryColor}
                  />
                ) : (
                  project.name
                )}
              </div>
              {project.description && (
                <div className="text-sm opacity-70">{project.description}</div>
              )}
              {project.date && (
                <div className="font-bold text-sm">{project.date}</div>
              )}
              {project.summary && (
                <p className="text-sm whitespace-pre-line mt-1">
                  {project.summary}
                </p>
              )}
              {project.keywords?.length > 0 && (
                <div className="text-xs opacity-60">
                  {project.keywords.join(" • ")}
                </div>
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

const renderSkills: SectionRenderer = ({ data, primaryColor, inSidebar }) => {
  const section = data.sections.skills;
  if (!section?.visible || !section.items?.length) return null;

  if (inSidebar) {
    return (
      <section key="skills">
        <div
          className="mx-auto mb-2 flex items-center justify-center gap-x-2 font-bold"
          style={{ color: primaryColor }}
        >
          <div
            className="size-1.5 rounded-full border"
            style={{ borderColor: primaryColor }}
          />
          <h4>{section.name}</h4>
          <div
            className="size-1.5 rounded-full border"
            style={{ borderColor: primaryColor }}
          />
        </div>
        <div className="space-y-2">
          {section.items
            .filter((s) => s.visible)
            .map((skill) => (
              <div key={skill.id} className="space-y-1">
                <div className="font-bold">{skill.name}</div>
                {skill.description && (
                  <div className="text-sm opacity-70">{skill.description}</div>
                )}
                {skill.level > 0 && (
                  <Rating level={skill.level} primaryColor={primaryColor} />
                )}
                {skill.keywords?.length > 0 && (
                  <div className="text-xs opacity-60">
                    {skill.keywords.join(", ")}
                  </div>
                )}
              </div>
            ))}
        </div>
      </section>
    );
  }

  // Main column rendering
  return (
    <section key="skills">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      <div className="flex flex-wrap gap-2">
        {section.items
          .filter((s) => s.visible)
          .map((skill) => (
            <span
              key={skill.id}
              className="px-2 py-1 rounded text-sm"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              {skill.name}
            </span>
          ))}
      </div>
    </section>
  );
};

const renderLanguages: SectionRenderer = ({
  data,
  primaryColor,
  inSidebar,
}) => {
  const section = data.sections.languages;
  if (!section?.visible || !section.items?.length) return null;

  if (inSidebar) {
    return (
      <section key="languages">
        <div
          className="mx-auto mb-2 flex items-center justify-center gap-x-2 font-bold"
          style={{ color: primaryColor }}
        >
          <div
            className="size-1.5 rounded-full border"
            style={{ borderColor: primaryColor }}
          />
          <h4>{section.name}</h4>
          <div
            className="size-1.5 rounded-full border"
            style={{ borderColor: primaryColor }}
          />
        </div>
        <div className="space-y-2">
          {section.items
            .filter((l) => l.visible)
            .map((lang) => (
              <div key={lang.id} className="space-y-1">
                <div className="font-bold">{lang.name}</div>
                {lang.description && (
                  <div className="text-sm opacity-70">{lang.description}</div>
                )}
                {lang.level > 0 && (
                  <Rating level={lang.level} primaryColor={primaryColor} />
                )}
              </div>
            ))}
        </div>
      </section>
    );
  }

  return (
    <section key="languages">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      <div className="flex flex-wrap gap-3">
        {section.items
          .filter((l) => l.visible)
          .map((lang) => (
            <span key={lang.id} className="text-sm">
              <strong>{lang.name}</strong>
              {lang.description && ` (${lang.description})`}
            </span>
          ))}
      </div>
    </section>
  );
};

const renderInterests: SectionRenderer = ({
  data,
  primaryColor,
  inSidebar,
}) => {
  const section = data.sections.interests;
  if (!section?.visible || !section.items?.length) return null;

  const content = (
    <div className="flex flex-wrap justify-center gap-2">
      {section.items
        .filter((i) => i.visible)
        .map((interest) => (
          <span
            key={interest.id}
            className="rounded px-2 py-0.5 text-sm"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            {interest.name}
          </span>
        ))}
    </div>
  );

  if (inSidebar) {
    return (
      <section key="interests">
        <div
          className="mx-auto mb-2 flex items-center justify-center gap-x-2 font-bold"
          style={{ color: primaryColor }}
        >
          <div
            className="size-1.5 rounded-full border"
            style={{ borderColor: primaryColor }}
          />
          <h4>{section.name}</h4>
          <div
            className="size-1.5 rounded-full border"
            style={{ borderColor: primaryColor }}
          />
        </div>
        {content}
      </section>
    );
  }

  return (
    <section key="interests">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      {content}
    </section>
  );
};

const renderProfiles: SectionRenderer = ({ data, primaryColor, inSidebar }) => {
  const section = data.sections.profiles;
  if (!section?.visible || !section.items?.length) return null;

  // Profiles are typically shown in header for Azurill, skip in main sections
  if (!inSidebar) return null;

  return (
    <section key="profiles">
      <div
        className="mx-auto mb-2 flex items-center justify-center gap-x-2 font-bold"
        style={{ color: primaryColor }}
      >
        <div
          className="size-1.5 rounded-full border"
          style={{ borderColor: primaryColor }}
        />
        <h4>Profiles</h4>
        <div
          className="size-1.5 rounded-full border"
          style={{ borderColor: primaryColor }}
        />
      </div>
      <div className="space-y-1">
        {section.items
          .filter((p) => p.visible)
          .map((profile) => (
            <div key={profile.id} className="text-sm">
              {isUrl(profile.url?.href) ? (
                <Link
                  href={profile.url?.href || ""}
                  label={`${profile.network}: ${profile.username}`}
                  primaryColor={primaryColor}
                />
              ) : (
                <span>
                  {profile.network}: {profile.username}
                </span>
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

const renderCertifications: SectionRenderer = ({ data, primaryColor }) => {
  const section = data.sections.certifications;
  if (!section?.visible || !section.items?.length) return null;

  return (
    <section key="certifications">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      <div className="space-y-2">
        {section.items
          .filter((c) => c.visible)
          .map((cert) => (
            <div
              key={cert.id}
              className="relative border-l pl-4"
              style={{ borderColor: primaryColor }}
            >
              <div
                className="absolute left-[-4.5px] top-px size-[8px] rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="font-bold">{cert.name}</div>
              <div className="text-sm">{cert.issuer}</div>
              {cert.date && (
                <div className="text-sm opacity-70">{cert.date}</div>
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

const renderAwards: SectionRenderer = ({ data, primaryColor }) => {
  const section = data.sections.awards;
  if (!section?.visible || !section.items?.length) return null;

  return (
    <section key="awards">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      <div className="space-y-2">
        {section.items
          .filter((a) => a.visible)
          .map((award) => (
            <div
              key={award.id}
              className="relative border-l pl-4"
              style={{ borderColor: primaryColor }}
            >
              <div
                className="absolute left-[-4.5px] top-px size-[8px] rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="font-bold">{award.title}</div>
              <div className="text-sm">{award.awarder}</div>
              {award.date && (
                <div className="text-sm opacity-70">{award.date}</div>
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

const renderVolunteer: SectionRenderer = ({ data, primaryColor }) => {
  const section = data.sections.volunteer;
  if (!section?.visible || !section.items?.length) return null;

  return (
    <section key="volunteer">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      <div className="space-y-3">
        {section.items
          .filter((v) => v.visible)
          .map((vol) => (
            <div
              key={vol.id}
              className="relative border-l pl-4 space-y-1"
              style={{ borderColor: primaryColor }}
            >
              <div
                className="absolute left-[-4.5px] top-px size-[8px] rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="font-bold">{vol.organization}</div>
              <div>{vol.position}</div>
              {vol.location && (
                <div className="text-sm opacity-70">{vol.location}</div>
              )}
              <div className="font-bold text-sm">{vol.date}</div>
              {vol.summary && (
                <p className="text-sm whitespace-pre-line mt-1">
                  {vol.summary}
                </p>
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

const renderPublications: SectionRenderer = ({ data, primaryColor }) => {
  const section = data.sections.publications;
  if (!section?.visible || !section.items?.length) return null;

  return (
    <section key="publications">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      <div className="space-y-2">
        {section.items
          .filter((p) => p.visible)
          .map((pub) => (
            <div
              key={pub.id}
              className="relative border-l pl-4"
              style={{ borderColor: primaryColor }}
            >
              <div
                className="absolute left-[-4.5px] top-px size-[8px] rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="font-bold">{pub.name}</div>
              <div className="text-sm">{pub.publisher}</div>
              {pub.date && <div className="text-sm opacity-70">{pub.date}</div>}
            </div>
          ))}
      </div>
    </section>
  );
};

const renderReferences: SectionRenderer = ({ data, primaryColor }) => {
  const section = data.sections.references;
  if (!section?.visible || !section.items?.length) return null;

  return (
    <section key="references">
      <h4 className="mb-2 font-bold" style={{ color: primaryColor }}>
        {section.name}
      </h4>
      <div className="space-y-2">
        {section.items
          .filter((r) => r.visible)
          .map((ref) => (
            <div
              key={ref.id}
              className="relative border-l pl-4"
              style={{ borderColor: primaryColor }}
            >
              <div
                className="absolute left-[-4.5px] top-px size-[8px] rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="font-bold">{ref.name}</div>
              {ref.description && (
                <div className="text-sm opacity-70">{ref.description}</div>
              )}
              {ref.summary && (
                <p className="text-sm italic mt-1">"{ref.summary}"</p>
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

// Section renderer map
const SECTION_RENDERERS: Record<string, SectionRenderer> = {
  summary: renderSummary,
  experience: renderExperience,
  education: renderEducation,
  projects: renderProjects,
  skills: renderSkills,
  languages: renderLanguages,
  interests: renderInterests,
  profiles: renderProfiles,
  certifications: renderCertifications,
  awards: renderAwards,
  volunteer: renderVolunteer,
  publications: renderPublications,
  references: renderReferences,
};

export function AzurillTemplate({ data }: TemplateProps) {
  const { basics, metadata } = data;

  const fontFamily = metadata?.typography?.font?.family || "Inter";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#000000";
  const bgColor = metadata?.theme?.background || "#ffffff";
  const primaryColor = metadata?.theme?.primary || "#0284c7";
  const margin = metadata?.page?.margin || 18;

  // Get section order from metadata or use default
  const sectionOrder =
    Array.isArray(metadata?.layout) && metadata.layout.length > 0
      ? metadata.layout
      : DEFAULT_SECTION_ORDER;

  // Split sections into sidebar and main based on order
  const sidebarSections = sectionOrder.filter((s) =>
    SIDEBAR_SECTIONS.includes(s)
  );
  const mainSections = sectionOrder.filter((s) => MAIN_SECTIONS.includes(s));

  return (
    <div
      id="resume-preview"
      className="min-h-full"
      style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight,
        color: textColor,
        backgroundColor: bgColor,
        padding: `${margin}mm`,
      }}
    >
      {/* Header */}
      <header className="flex flex-col items-center justify-center space-y-2 pb-4 text-center">
        {/* Picture */}
        {basics.picture?.url && !basics.picture.effects?.hidden && (
          <img
            src={basics.picture.url}
            alt={basics.name}
            className="rounded-full object-cover"
            style={{
              width: basics.picture.size || 64,
              height: basics.picture.size || 64,
              borderRadius: basics.picture.borderRadius || 0,
              filter: basics.picture.effects?.grayscale
                ? "grayscale(100%)"
                : undefined,
              border: basics.picture.effects?.border
                ? `2px solid ${primaryColor}`
                : undefined,
            }}
          />
        )}

        <div>
          <div className="text-2xl font-bold" style={{ color: primaryColor }}>
            {basics.name || "Your Name"}
          </div>
          <div className="text-base opacity-80">{basics.headline}</div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-sm">
          {basics.location && (
            <div className="flex items-center gap-x-1.5">
              <span style={{ color: primaryColor }}>📍</span>
              <span>{basics.location}</span>
            </div>
          )}
          {basics.phone && (
            <div className="flex items-center gap-x-1.5">
              <span style={{ color: primaryColor }}>📞</span>
              <a href={`tel:${basics.phone}`}>{basics.phone}</a>
            </div>
          )}
          {basics.email && (
            <div className="flex items-center gap-x-1.5">
              <span style={{ color: primaryColor }}>✉️</span>
              <a href={`mailto:${basics.email}`}>{basics.email}</a>
            </div>
          )}
          {basics.url?.href && (
            <div className="flex items-center gap-x-1.5">
              <span style={{ color: primaryColor }}>🔗</span>
              <Link
                href={basics.url.href}
                label={basics.url.label || basics.url.href}
                primaryColor={primaryColor}
              />
            </div>
          )}
        </div>

        {/* Profiles in header */}
        {data.sections.profiles?.visible &&
          data.sections.profiles.items?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
              {data.sections.profiles.items
                .filter((p) => p.visible)
                .map((profile) => (
                  <Link
                    key={profile.id}
                    href={profile.url?.href || ""}
                    label={`${profile.network}: ${profile.username}`}
                    primaryColor={primaryColor}
                  />
                ))}
            </div>
          )}
      </header>

      {/* Main Content - 2 column layout */}
      <div className="grid grid-cols-3 gap-x-4">
        {/* Sidebar - render sections in order */}
        <div className="sidebar group space-y-4 text-center">
          {sidebarSections.map((sectionKey) => {
            const renderer = SECTION_RENDERERS[sectionKey];
            if (!renderer) return null;
            return renderer({ data, primaryColor, inSidebar: true });
          })}
        </div>

        {/* Main Column - render sections in order */}
        <div className="main group col-span-2 space-y-4">
          {mainSections.map((sectionKey) => {
            const renderer = SECTION_RENDERERS[sectionKey];
            if (!renderer) return null;
            return renderer({ data, primaryColor, inSidebar: false });
          })}
        </div>
      </div>
    </div>
  );
}
