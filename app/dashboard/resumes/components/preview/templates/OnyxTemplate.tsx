"use client";

import { ResumeData } from "../../../services/resumeApi";

interface TemplateProps {
  data: ResumeData;
}

// Helper: Check if string is empty
const isEmptyString = (str: string | undefined): boolean => {
  return !str || str.trim().length === 0;
};

// Helper: Check if URL is valid
const isUrl = (href: string | undefined): boolean => {
  if (!href) return false;
  return href.startsWith("http://") || href.startsWith("https://");
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

// Onyx Template: Clean single-column layout - no sidebar
export function OnyxTemplate({ data }: TemplateProps) {
  const { basics, sections, metadata } = data;

  const fontFamily = metadata?.typography?.font?.family || "Inter";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#000000";
  const bgColor = metadata?.theme?.background || "#ffffff";
  const primaryColor = metadata?.theme?.primary || "#1e293b";
  const margin = metadata?.page?.margin || 18;

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
      <header
        className="border-b pb-4 mb-6"
        style={{ borderColor: primaryColor }}
      >
        <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
          {basics.name || "Your Name"}
        </h1>
        {basics.headline && (
          <p className="text-lg mt-1 opacity-80">{basics.headline}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm opacity-70">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.location && <span>• {basics.location}</span>}
          {basics.url?.href && (
            <span>
              •{" "}
              <a
                href={normalizeUrl(basics.url.href)}
                className="hover:underline"
                style={{ color: primaryColor }}
              >
                {basics.url.label || basics.url.href}
              </a>
            </span>
          )}
        </div>

        {/* Profiles */}
        {sections.profiles?.visible && sections.profiles.items?.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-2">
            {sections.profiles.items
              .filter((p) => p.visible)
              .map((profile) => (
                <a
                  key={profile.id}
                  href={normalizeUrl(profile.url?.href)}
                  className="text-sm hover:underline"
                  style={{ color: primaryColor }}
                >
                  {profile.network}: {profile.username}
                </a>
              ))}
          </div>
        )}
      </header>

      {/* Summary */}
      {sections.summary?.visible &&
        !isEmptyString(sections.summary.content) && (
          <section className="mb-6">
            <h2
              className="text-lg font-bold mb-2"
              style={{ color: primaryColor }}
            >
              {sections.summary.name}
            </h2>
            <p className="whitespace-pre-line">{sections.summary.content}</p>
          </section>
        )}

      {/* Two-column grid for sections */}
      <div className="grid grid-cols-1 gap-6">
        {/* Experience */}
        {sections.experience?.visible &&
          sections.experience.items?.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-3 border-b pb-1"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                }}
              >
                {sections.experience.name}
              </h2>
              <div className="space-y-4">
                {sections.experience.items
                  .filter((e) => e.visible)
                  .map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold">{exp.position}</span>
                          <span className="opacity-70"> at {exp.company}</span>
                        </div>
                        <span className="text-sm opacity-60">{exp.date}</span>
                      </div>
                      {exp.location && (
                        <p className="text-sm opacity-60">{exp.location}</p>
                      )}
                      {exp.summary && (
                        <p className="text-sm mt-1 whitespace-pre-line">
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
              <h2
                className="text-lg font-bold mb-3 border-b pb-1"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                }}
              >
                {sections.education.name}
              </h2>
              <div className="space-y-3">
                {sections.education.items
                  .filter((e) => e.visible)
                  .map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold">{edu.studyType}</span>
                          {edu.area && (
                            <span className="opacity-70"> in {edu.area}</span>
                          )}
                        </div>
                        <span className="text-sm opacity-60">{edu.date}</span>
                      </div>
                      <p className="opacity-70">
                        {edu.institution}
                        {edu.score && ` • GPA: ${edu.score}`}
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* Skills Grid */}
        {sections.skills?.visible && sections.skills.items?.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold mb-3 border-b pb-1"
              style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
            >
              {sections.skills.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {sections.skills.items
                .filter((s) => s.visible)
                .map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 text-sm rounded-full"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}
                  >
                    {skill.name}
                    {skill.keywords?.length > 0 && (
                      <span className="opacity-60">
                        {" "}
                        ({skill.keywords.slice(0, 3).join(", ")})
                      </span>
                    )}
                  </span>
                ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {sections.projects?.visible && sections.projects.items?.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold mb-3 border-b pb-1"
              style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
            >
              {sections.projects.name}
            </h2>
            <div className="space-y-3">
              {sections.projects.items
                .filter((p) => p.visible)
                .map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold">
                        {isUrl(project.url?.href) ? (
                          <a
                            href={normalizeUrl(project.url?.href)}
                            className="hover:underline"
                            style={{ color: primaryColor }}
                          >
                            {project.name}
                          </a>
                        ) : (
                          project.name
                        )}
                      </span>
                      {project.date && (
                        <span className="text-sm opacity-60">
                          {project.date}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm opacity-70">
                        {project.description}
                      </p>
                    )}
                    {project.summary && (
                      <p className="text-sm mt-1">{project.summary}</p>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Other sections in a row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Certifications */}
          {sections.certifications?.visible &&
            sections.certifications.items?.length > 0 && (
              <section>
                <h2
                  className="text-lg font-bold mb-2 border-b pb-1"
                  style={{
                    color: primaryColor,
                    borderColor: `${primaryColor}40`,
                  }}
                >
                  {sections.certifications.name}
                </h2>
                <div className="space-y-2">
                  {sections.certifications.items
                    .filter((c) => c.visible)
                    .map((cert) => (
                      <div key={cert.id}>
                        <div className="font-medium">{cert.name}</div>
                        <div className="text-sm opacity-60">
                          {cert.issuer} {cert.date && `• ${cert.date}`}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

          {/* Languages */}
          {sections.languages?.visible &&
            sections.languages.items?.length > 0 && (
              <section>
                <h2
                  className="text-lg font-bold mb-2 border-b pb-1"
                  style={{
                    color: primaryColor,
                    borderColor: `${primaryColor}40`,
                  }}
                >
                  {sections.languages.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {sections.languages.items
                    .filter((l) => l.visible)
                    .map((lang) => (
                      <span key={lang.id} className="text-sm">
                        <strong>{lang.name}</strong>
                        {lang.description && (
                          <span className="opacity-60">
                            {" "}
                            ({lang.description})
                          </span>
                        )}
                      </span>
                    ))}
                </div>
              </section>
            )}
        </div>

        {/* Awards */}
        {sections.awards?.visible && sections.awards.items?.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold mb-2 border-b pb-1"
              style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
            >
              {sections.awards.name}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {sections.awards.items
                .filter((a) => a.visible)
                .map((award) => (
                  <div key={award.id}>
                    <span className="font-medium">{award.title}</span>
                    <span className="text-sm opacity-60">
                      {" "}
                      - {award.awarder}
                    </span>
                    {award.date && (
                      <span className="text-sm opacity-60">
                        {" "}
                        ({award.date})
                      </span>
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
              <h2
                className="text-lg font-bold mb-2 border-b pb-1"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                }}
              >
                {sections.interests.name}
              </h2>
              <div className="flex flex-wrap gap-2">
                {sections.interests.items
                  .filter((i) => i.visible)
                  .map((interest) => (
                    <span
                      key={interest.id}
                      className="px-2 py-0.5 text-sm rounded"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      {interest.name}
                    </span>
                  ))}
              </div>
            </section>
          )}

        {/* Volunteer */}
        {sections.volunteer?.visible &&
          sections.volunteer.items?.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-2 border-b pb-1"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                }}
              >
                {sections.volunteer.name}
              </h2>
              <div className="space-y-3">
                {sections.volunteer.items
                  .filter((v) => v.visible)
                  .map((vol) => (
                    <div key={vol.id}>
                      <div className="flex justify-between">
                        <span className="font-bold">{vol.position}</span>
                        <span className="text-sm opacity-60">{vol.date}</span>
                      </div>
                      <p className="opacity-70">{vol.organization}</p>
                      {vol.summary && (
                        <p className="text-sm mt-1">{vol.summary}</p>
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
              <h2
                className="text-lg font-bold mb-2 border-b pb-1"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                }}
              >
                {sections.publications.name}
              </h2>
              <div className="space-y-2">
                {sections.publications.items
                  .filter((p) => p.visible)
                  .map((pub) => (
                    <div key={pub.id}>
                      <span className="font-medium">{pub.name}</span>
                      <span className="text-sm opacity-60">
                        {" "}
                        - {pub.publisher}, {pub.date}
                      </span>
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* References */}
        {sections.references?.visible &&
          sections.references.items?.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-2 border-b pb-1"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                }}
              >
                {sections.references.name}
              </h2>
              <div className="space-y-2">
                {sections.references.items
                  .filter((r) => r.visible)
                  .map((ref) => (
                    <div key={ref.id}>
                      <span className="font-bold">{ref.name}</span>
                      {ref.description && (
                        <span className="opacity-60"> - {ref.description}</span>
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
