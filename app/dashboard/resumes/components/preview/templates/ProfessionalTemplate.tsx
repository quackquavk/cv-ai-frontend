"use client";

import { ResumeData } from "../../../services/resumeApi";

interface ProfessionalTemplateProps {
  data: ResumeData;
}

export function ProfessionalTemplate({ data }: ProfessionalTemplateProps) {
  const { basics, sections, metadata } = data;

  // Apply metadata settings
  const fontFamily = metadata?.typography?.font?.family || "Inter, sans-serif";
  const fontSize = metadata?.typography?.font?.size || 13;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#1f2937";
  const bgColor = metadata?.theme?.background || "#ffffff";
  const primaryColor = metadata?.theme?.primary || "#1e40af";
  const margin = metadata?.page?.margin || 18;

  return (
    <div
      className="min-h-full"
      id="resume-preview"
      style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight,
        color: textColor,
        backgroundColor: bgColor,
      }}
    >
      {/* Header */}
      <header
        className="border-b-4"
        style={{
          borderColor: primaryColor,
          padding: `${margin}mm`,
          paddingBottom: "16px",
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
              {basics.name || "Your Name"}
            </h1>
            {basics.headline && (
              <p
                className="text-lg mt-1"
                style={{ color: primaryColor, opacity: 0.8 }}
              >
                {basics.headline}
              </p>
            )}
          </div>
          <div className="text-right text-sm" style={{ opacity: 0.7 }}>
            {basics.email && <p>{basics.email}</p>}
            {basics.phone && <p>{basics.phone}</p>}
            {basics.location && <p>{basics.location}</p>}
            {basics.url?.href && <p>{basics.url.label || basics.url.href}</p>}
          </div>
        </div>
        {sections.profiles.visible && sections.profiles.items.length > 0 && (
          <div className="flex gap-4 mt-3 text-sm">
            {sections.profiles.items
              .filter((p) => p.visible)
              .map((profile) => (
                <span key={profile.id} style={{ color: primaryColor }}>
                  {profile.network}: {profile.username}
                </span>
              ))}
          </div>
        )}
      </header>

      <div style={{ padding: `${margin}mm`, paddingTop: "16px" }}>
        {/* Summary */}
        {sections.summary.visible && sections.summary.content && (
          <section className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-2 pb-1 border-b-2"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              Professional Summary
            </h2>
            <p className="whitespace-pre-line" style={{ opacity: 0.8 }}>
              {sections.summary.content}
            </p>
          </section>
        )}

        {/* Experience */}
        {sections.experience.visible &&
          sections.experience.items.length > 0 && (
            <section className="mb-6">
              <h2
                className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                Professional Experience
              </h2>
              <div className="space-y-4">
                {sections.experience.items
                  .filter((e) => e.visible)
                  .map((exp) => (
                    <div
                      key={exp.id}
                      className="grid grid-cols-[1fr_auto] gap-4"
                    >
                      <div>
                        <h3 className="font-bold">{exp.position}</h3>
                        <p
                          className="font-medium"
                          style={{ color: primaryColor }}
                        >
                          {exp.company}
                          {exp.location && (
                            <span
                              style={{
                                color: textColor,
                                opacity: 0.5,
                                fontWeight: "normal",
                              }}
                            >
                              {" "}
                              — {exp.location}
                            </span>
                          )}
                        </p>
                        {exp.summary && (
                          <p
                            className="mt-1 text-sm whitespace-pre-line"
                            style={{ opacity: 0.7 }}
                          >
                            {exp.summary}
                          </p>
                        )}
                      </div>
                      <div
                        className="text-right text-sm whitespace-nowrap"
                        style={{ opacity: 0.5 }}
                      >
                        {exp.date}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* Education */}
        {sections.education.visible && sections.education.items.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              Education
            </h2>
            <div className="space-y-3">
              {sections.education.items
                .filter((e) => e.visible)
                .map((edu) => (
                  <div key={edu.id} className="grid grid-cols-[1fr_auto] gap-4">
                    <div>
                      <h3 className="font-bold">
                        {edu.studyType} {edu.area && `in ${edu.area}`}
                      </h3>
                      <p style={{ color: primaryColor }}>{edu.institution}</p>
                      {edu.score && (
                        <p className="text-sm" style={{ opacity: 0.5 }}>
                          GPA: {edu.score}
                        </p>
                      )}
                    </div>
                    <div
                      className="text-right text-sm"
                      style={{ opacity: 0.5 }}
                    >
                      {edu.date}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Skills & Certifications side by side */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {sections.skills.visible && sections.skills.items.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {sections.skills.items
                  .filter((s) => s.visible)
                  .map((skill) => (
                    <span
                      key={skill.id}
                      className="px-2 py-1 text-xs rounded border"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      {skill.name}
                    </span>
                  ))}
              </div>
            </section>
          )}

          {sections.certifications.visible &&
            sections.certifications.items.length > 0 && (
              <section>
                <h2
                  className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2"
                  style={{ color: primaryColor, borderColor: primaryColor }}
                >
                  Certifications
                </h2>
                <div className="space-y-1">
                  {sections.certifications.items
                    .filter((c) => c.visible)
                    .map((cert) => (
                      <div key={cert.id} className="text-sm">
                        <span className="font-medium">{cert.name}</span>
                        <span style={{ opacity: 0.5 }}>
                          {" "}
                          — {cert.issuer}, {cert.date}
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            )}
        </div>

        {/* Projects */}
        {sections.projects.visible && sections.projects.items.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              Projects
            </h2>
            <div className="space-y-3">
              {sections.projects.items
                .filter((p) => p.visible)
                .map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between">
                      <h3 className="font-bold">{project.name}</h3>
                      {project.date && (
                        <span className="text-sm" style={{ opacity: 0.5 }}>
                          {project.date}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p style={{ color: primaryColor }} className="text-sm">
                        {project.description}
                      </p>
                    )}
                    {project.summary && (
                      <p className="text-sm" style={{ opacity: 0.7 }}>
                        {project.summary}
                      </p>
                    )}
                    {project.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${primaryColor}10` }}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Languages & Awards */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {sections.languages.visible &&
            sections.languages.items.length > 0 && (
              <section>
                <h2
                  className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2"
                  style={{ color: primaryColor, borderColor: primaryColor }}
                >
                  Languages
                </h2>
                <div className="space-y-1">
                  {sections.languages.items
                    .filter((l) => l.visible)
                    .map((lang) => (
                      <div
                        key={lang.id}
                        className="flex justify-between text-sm"
                      >
                        <span>{lang.name}</span>
                        <span style={{ opacity: 0.5 }}>{lang.description}</span>
                      </div>
                    ))}
                </div>
              </section>
            )}

          {sections.awards.visible && sections.awards.items.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                Awards
              </h2>
              <div className="space-y-1">
                {sections.awards.items
                  .filter((a) => a.visible)
                  .map((award) => (
                    <div key={award.id} className="text-sm">
                      <span className="font-medium">{award.title}</span>
                      <span style={{ opacity: 0.5 }}>
                        {" "}
                        — {award.awarder}, {award.date}
                      </span>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>

        {/* Volunteer */}
        {sections.volunteer.visible && sections.volunteer.items.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              Volunteer Experience
            </h2>
            <div className="space-y-3">
              {sections.volunteer.items
                .filter((v) => v.visible)
                .map((vol) => (
                  <div key={vol.id} className="grid grid-cols-[1fr_auto] gap-4">
                    <div>
                      <h3 className="font-bold">{vol.position}</h3>
                      <p style={{ color: primaryColor }}>{vol.organization}</p>
                      {vol.summary && (
                        <p className="text-sm" style={{ opacity: 0.7 }}>
                          {vol.summary}
                        </p>
                      )}
                    </div>
                    <div
                      className="text-right text-sm"
                      style={{ opacity: 0.5 }}
                    >
                      {vol.date}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* References */}
        {sections.references.visible &&
          sections.references.items.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                References
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {sections.references.items
                  .filter((r) => r.visible)
                  .map((ref) => (
                    <div key={ref.id} className="text-sm">
                      <p className="font-bold">{ref.name}</p>
                      <p style={{ opacity: 0.5 }}>{ref.description}</p>
                      {ref.summary && (
                        <p className="italic mt-1" style={{ opacity: 0.7 }}>
                          "{ref.summary}"
                        </p>
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
