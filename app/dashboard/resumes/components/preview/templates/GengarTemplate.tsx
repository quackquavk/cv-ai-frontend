"use client";

import { ResumeData } from "../../../services/resumeApi";
import { cn } from "@/lib/utils";

interface TemplateProps {
  data: ResumeData;
}

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

// Helper: Normalize URL to ensure it has a protocol
const normalizeUrl = (href: string | undefined): string => {
  if (!href) return "";
  const trimmed = href.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  // Add https:// prefix if missing
  return `https://${trimmed}`;
};

// Helper: Check if string is empty
const isEmptyString = (str: string | undefined): boolean => {
  return !str || str.trim().length === 0;
};

// Helper: Convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Box-style rating component (Gengar style)
const Rating = ({
  level,
  primaryColor,
}: {
  level: number;
  primaryColor: string;
}) => (
  <div className="flex items-center gap-x-1">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="h-2.5 w-5 border"
        style={{
          borderColor: primaryColor,
          backgroundColor: level > index ? primaryColor : "transparent",
        }}
      />
    ))}
  </div>
);

// Link component
const Link = ({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) => {
  if (!isUrl(href)) return null;

  const normalizedHref = normalizeUrl(href);

  return (
    <a
      href={normalizedHref}
      target="_blank"
      rel="noreferrer noopener nofollow"
      className={cn("hover:underline", className)}
    >
      {label}
    </a>
  );
};

export function GengarTemplate({ data }: TemplateProps) {
  const { basics, sections, metadata } = data;

  const fontFamily = metadata?.typography?.font?.family || "Inter";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#000000";
  const bgColor = metadata?.theme?.background || "#ffffff";
  const primaryColor = metadata?.theme?.primary || "#6366f1";
  const margin = metadata?.page?.margin || 18;

  return (
    <div
      id="resume-preview"
      className="min-h-full grid grid-cols-3"
      style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight,
        color: textColor,
        backgroundColor: bgColor,
      }}
    >
      {/* Sidebar with Header */}
      <div className="sidebar group flex flex-col">
        {/* Header in Primary Color */}
        <header
          className="space-y-4 p-6 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Picture */}
          {basics.picture?.url && !basics.picture.effects?.hidden && (
            <img
              src={basics.picture.url}
              alt={basics.name}
              className="rounded-full object-cover border-2 border-white"
              style={{
                width: basics.picture.size || 80,
                height: basics.picture.size || 80,
              }}
            />
          )}

          <div>
            <h2 className="text-2xl font-bold">{basics.name || "Your Name"}</h2>
            <p className="opacity-90">{basics.headline}</p>
          </div>

          <div className="flex flex-col items-start gap-y-2 text-sm">
            {basics.location && (
              <div className="flex items-center gap-x-1.5">
                <span>📍</span>
                <span>{basics.location}</span>
              </div>
            )}
            {basics.phone && (
              <div className="flex items-center gap-x-1.5">
                <span>📞</span>
                <a href={`tel:${basics.phone}`}>{basics.phone}</a>
              </div>
            )}
            {basics.email && (
              <div className="flex items-center gap-x-1.5">
                <span>✉️</span>
                <a href={`mailto:${basics.email}`}>{basics.email}</a>
              </div>
            )}
            {basics.url?.href && (
              <div className="flex items-center gap-x-1.5">
                <span>🔗</span>
                <Link
                  href={basics.url.href}
                  label={basics.url.label || basics.url.href}
                />
              </div>
            )}
          </div>
        </header>

        {/* Sidebar Content */}
        <div
          className="flex-1 space-y-4 p-4"
          style={{ backgroundColor: hexToRgba(primaryColor, 0.15) }}
        >
          {/* Skills */}
          {sections.skills?.visible && sections.skills.items?.length > 0 && (
            <section>
              <h4
                className="mb-2 border-b pb-1 text-base font-bold"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                {sections.skills.name}
              </h4>
              <div className="space-y-3">
                {sections.skills.items
                  .filter((s) => s.visible)
                  .map((skill) => (
                    <div key={skill.id} className="space-y-1">
                      <div className="font-bold">{skill.name}</div>
                      {skill.description && (
                        <div className="text-sm opacity-70">
                          {skill.description}
                        </div>
                      )}
                      {skill.level > 0 && (
                        <Rating
                          level={skill.level}
                          primaryColor={primaryColor}
                        />
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
          )}

          {/* Languages */}
          {sections.languages?.visible &&
            sections.languages.items?.length > 0 && (
              <section>
                <h4
                  className="mb-2 border-b pb-1 text-base font-bold"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  {sections.languages.name}
                </h4>
                <div className="space-y-2">
                  {sections.languages.items
                    .filter((l) => l.visible)
                    .map((lang) => (
                      <div key={lang.id} className="space-y-1">
                        <div className="font-bold">{lang.name}</div>
                        {lang.description && (
                          <div className="text-sm opacity-70">
                            {lang.description}
                          </div>
                        )}
                        {lang.level > 0 && (
                          <Rating
                            level={lang.level}
                            primaryColor={primaryColor}
                          />
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}

          {/* Interests */}
          {sections.interests?.visible &&
            sections.interests.items?.length > 0 && (
              <section>
                <h4
                  className="mb-2 border-b pb-1 text-base font-bold"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  {sections.interests.name}
                </h4>
                <div className="space-y-1">
                  {sections.interests.items
                    .filter((i) => i.visible)
                    .map((interest) => (
                      <div key={interest.id} className="font-medium">
                        {interest.name}
                      </div>
                    ))}
                </div>
              </section>
            )}

          {/* Profiles */}
          {sections.profiles?.visible &&
            sections.profiles.items?.length > 0 && (
              <section>
                <h4
                  className="mb-2 border-b pb-1 text-base font-bold"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  Profiles
                </h4>
                <div className="space-y-2">
                  {sections.profiles.items
                    .filter((p) => p.visible)
                    .map((profile) => (
                      <div key={profile.id}>
                        {isUrl(profile.url?.href) ? (
                          <Link
                            href={profile.url?.href || ""}
                            label={profile.username}
                            className="font-medium"
                          />
                        ) : (
                          <span className="font-medium">
                            {profile.username}
                          </span>
                        )}
                        <div className="text-sm opacity-70">
                          {profile.network}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}
        </div>
      </div>

      {/* Main Content */}
      <div
        className="main group col-span-2 space-y-4"
        style={{ padding: `${margin}mm` }}
      >
        {/* Summary */}
        {sections.summary?.visible &&
          !isEmptyString(sections.summary.content) && (
            <section
              className="p-4 rounded"
              style={{ backgroundColor: hexToRgba(primaryColor, 0.15) }}
            >
              <p className="whitespace-pre-line">{sections.summary.content}</p>
            </section>
          )}

        {/* Experience */}
        {sections.experience?.visible &&
          sections.experience.items?.length > 0 && (
            <section>
              <h4
                className="mb-3 border-b pb-1 text-base font-bold"
                style={{ borderColor: primaryColor }}
              >
                {sections.experience.name}
              </h4>
              <div className="space-y-4">
                {sections.experience.items
                  .filter((e) => e.visible)
                  .map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold">{exp.company}</div>
                          <div>{exp.position}</div>
                        </div>
                        <div className="text-right text-sm shrink-0">
                          <div className="font-bold">{exp.date}</div>
                          {exp.location && (
                            <div className="opacity-70">{exp.location}</div>
                          )}
                        </div>
                      </div>
                      {exp.summary && (
                        <p className="text-sm whitespace-pre-line mt-2">
                          {exp.summary}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* Education */}
        {sections.education?.visible &&
          sections.education.items?.length > 0 && (
            <section>
              <h4
                className="mb-3 border-b pb-1 text-base font-bold"
                style={{ borderColor: primaryColor }}
              >
                {sections.education.name}
              </h4>
              <div className="space-y-4">
                {sections.education.items
                  .filter((e) => e.visible)
                  .map((edu) => (
                    <div key={edu.id} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold">{edu.institution}</div>
                          <div>
                            {edu.studyType} {edu.area && `in ${edu.area}`}
                          </div>
                          {edu.score && (
                            <div className="text-sm opacity-70">
                              GPA: {edu.score}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm shrink-0">
                          <div className="font-bold">{edu.date}</div>
                        </div>
                      </div>
                      {edu.summary && (
                        <p className="text-sm whitespace-pre-line mt-2">
                          {edu.summary}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* Projects */}
        {sections.projects?.visible && sections.projects.items?.length > 0 && (
          <section>
            <h4
              className="mb-3 border-b pb-1 text-base font-bold"
              style={{ borderColor: primaryColor }}
            >
              {sections.projects.name}
            </h4>
            <div className="space-y-4">
              {sections.projects.items
                .filter((p) => p.visible)
                .map((project) => (
                  <div key={project.id} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">
                          {project.url?.href ? (
                            <Link
                              href={project.url.href}
                              label={project.name}
                            />
                          ) : (
                            project.name
                          )}
                        </div>
                        {project.description && (
                          <div className="text-sm opacity-70">
                            {project.description}
                          </div>
                        )}
                      </div>
                      {project.date && (
                        <div className="text-right text-sm shrink-0">
                          <div className="font-bold">{project.date}</div>
                        </div>
                      )}
                    </div>
                    {project.summary && (
                      <p className="text-sm whitespace-pre-line mt-2">
                        {project.summary}
                      </p>
                    )}
                    {project.keywords?.length > 0 && (
                      <div className="text-xs opacity-60 mt-1">
                        {project.keywords.join(" • ")}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {sections.certifications?.visible &&
          sections.certifications.items?.length > 0 && (
            <section>
              <h4
                className="mb-3 border-b pb-1 text-base font-bold"
                style={{ borderColor: primaryColor }}
              >
                {sections.certifications.name}
              </h4>
              <div className="space-y-2">
                {sections.certifications.items
                  .filter((c) => c.visible)
                  .map((cert) => (
                    <div
                      key={cert.id}
                      className="flex justify-between items-start"
                    >
                      <div>
                        <div className="font-bold">{cert.name}</div>
                        <div className="text-sm">{cert.issuer}</div>
                      </div>
                      {cert.date && (
                        <div className="text-sm font-bold shrink-0">
                          {cert.date}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* Awards */}
        {sections.awards?.visible && sections.awards.items?.length > 0 && (
          <section>
            <h4
              className="mb-3 border-b pb-1 text-base font-bold"
              style={{ borderColor: primaryColor }}
            >
              {sections.awards.name}
            </h4>
            <div className="space-y-2">
              {sections.awards.items
                .filter((a) => a.visible)
                .map((award) => (
                  <div
                    key={award.id}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <div className="font-bold">{award.title}</div>
                      <div className="text-sm">{award.awarder}</div>
                    </div>
                    {award.date && (
                      <div className="text-sm font-bold shrink-0">
                        {award.date}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Volunteer */}
        {sections.volunteer?.visible &&
          sections.volunteer.items?.length > 0 && (
            <section>
              <h4
                className="mb-3 border-b pb-1 text-base font-bold"
                style={{ borderColor: primaryColor }}
              >
                {sections.volunteer.name}
              </h4>
              <div className="space-y-4">
                {sections.volunteer.items
                  .filter((v) => v.visible)
                  .map((vol) => (
                    <div key={vol.id} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold">{vol.organization}</div>
                          <div>{vol.position}</div>
                        </div>
                        <div className="text-right text-sm shrink-0">
                          <div className="font-bold">{vol.date}</div>
                          {vol.location && (
                            <div className="opacity-70">{vol.location}</div>
                          )}
                        </div>
                      </div>
                      {vol.summary && (
                        <p className="text-sm whitespace-pre-line mt-2">
                          {vol.summary}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* Publications */}
        {sections.publications?.visible &&
          sections.publications.items?.length > 0 && (
            <section>
              <h4
                className="mb-3 border-b pb-1 text-base font-bold"
                style={{ borderColor: primaryColor }}
              >
                {sections.publications.name}
              </h4>
              <div className="space-y-2">
                {sections.publications.items
                  .filter((p) => p.visible)
                  .map((pub) => (
                    <div
                      key={pub.id}
                      className="flex justify-between items-start"
                    >
                      <div>
                        <div className="font-bold">{pub.name}</div>
                        <div className="text-sm">{pub.publisher}</div>
                      </div>
                      {pub.date && (
                        <div className="text-sm font-bold shrink-0">
                          {pub.date}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* References */}
        {sections.references?.visible &&
          sections.references.items?.length > 0 && (
            <section>
              <h4
                className="mb-3 border-b pb-1 text-base font-bold"
                style={{ borderColor: primaryColor }}
              >
                {sections.references.name}
              </h4>
              <div className="space-y-2">
                {sections.references.items
                  .filter((r) => r.visible)
                  .map((ref) => (
                    <div key={ref.id}>
                      <div className="font-bold">{ref.name}</div>
                      {ref.description && (
                        <div className="text-sm opacity-70">
                          {ref.description}
                        </div>
                      )}
                      {ref.summary && (
                        <p className="text-sm italic mt-1">"{ref.summary}"</p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}
