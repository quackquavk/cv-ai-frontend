"use client";

import { ResumeData } from "../../../services/resumeApi";

interface MinimalTemplateProps {
  data: ResumeData;
}

export function MinimalTemplate({ data }: MinimalTemplateProps) {
  const { basics, sections, metadata } = data;

  // Apply metadata settings
  const fontFamily = metadata?.typography?.font?.family || "Inter, sans-serif";
  const fontSize = metadata?.typography?.font?.size || 13;
  const lineHeight = metadata?.typography?.lineHeight || 1.6;
  const textColor = metadata?.theme?.text || "#374151";
  const bgColor = metadata?.theme?.background || "#ffffff";
  const primaryColor = metadata?.theme?.primary || "#111827";
  const margin = metadata?.page?.margin || 24;

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
        padding: `${margin}mm`,
      }}
    >
      {/* Header */}
      <header className="mb-8">
        <h1
          className="text-4xl font-light tracking-tight"
          style={{ color: primaryColor }}
        >
          {basics.name || "Your Name"}
        </h1>
        {basics.headline && (
          <p className="text-lg mt-1 font-light" style={{ opacity: 0.6 }}>
            {basics.headline}
          </p>
        )}
        <div
          className="flex flex-wrap gap-4 mt-3 text-sm"
          style={{ opacity: 0.7 }}
        >
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location && <span>{basics.location}</span>}
          {basics.url?.href && (
            <span>{basics.url.label || basics.url.href}</span>
          )}
        </div>
        {sections.profiles.visible && sections.profiles.items.length > 0 && (
          <div
            className="flex flex-wrap gap-4 mt-2 text-sm"
            style={{ opacity: 0.5 }}
          >
            {sections.profiles.items
              .filter((p) => p.visible)
              .map((profile) => (
                <span key={profile.id}>
                  {profile.network}: {profile.username}
                </span>
              ))}
          </div>
        )}
      </header>

      {/* Summary */}
      {sections.summary.visible && sections.summary.content && (
        <section className="mb-8">
          <p className="whitespace-pre-line" style={{ opacity: 0.7 }}>
            {sections.summary.content}
          </p>
        </section>
      )}

      {/* Experience */}
      {sections.experience.visible && sections.experience.items.length > 0 && (
        <section className="mb-8">
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2"
            style={{
              color: `${primaryColor}80`,
              borderColor: `${primaryColor}20`,
            }}
          >
            {sections.experience.name}
          </h2>
          <div className="space-y-5">
            {sections.experience.items
              .filter((e) => e.visible)
              .map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span
                        className="font-semibold"
                        style={{ color: primaryColor }}
                      >
                        {exp.position}
                      </span>
                      <span style={{ opacity: 0.5 }}> at </span>
                      <span style={{ opacity: 0.8 }}>{exp.company}</span>
                    </div>
                    <span className="text-sm" style={{ opacity: 0.4 }}>
                      {exp.date}
                    </span>
                  </div>
                  {exp.location && (
                    <p className="text-sm" style={{ opacity: 0.4 }}>
                      {exp.location}
                    </p>
                  )}
                  {exp.summary && (
                    <p
                      className="mt-1 whitespace-pre-line"
                      style={{ opacity: 0.7 }}
                    >
                      {exp.summary}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Education */}
      {sections.education.visible && sections.education.items.length > 0 && (
        <section className="mb-8">
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2"
            style={{
              color: `${primaryColor}80`,
              borderColor: `${primaryColor}20`,
            }}
          >
            {sections.education.name}
          </h2>
          <div className="space-y-4">
            {sections.education.items
              .filter((e) => e.visible)
              .map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span
                        className="font-semibold"
                        style={{ color: primaryColor }}
                      >
                        {edu.studyType}
                      </span>
                      {edu.area && (
                        <span style={{ opacity: 0.8 }}> in {edu.area}</span>
                      )}
                    </div>
                    <span className="text-sm" style={{ opacity: 0.4 }}>
                      {edu.date}
                    </span>
                  </div>
                  <p style={{ opacity: 0.7 }}>{edu.institution}</p>
                  {edu.score && (
                    <p className="text-sm" style={{ opacity: 0.4 }}>
                      GPA: {edu.score}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Two column grid for smaller sections */}
      <div className="grid grid-cols-2 gap-8">
        {/* Skills */}
        {sections.skills.visible && sections.skills.items.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2"
              style={{
                color: `${primaryColor}80`,
                borderColor: `${primaryColor}20`,
              }}
            >
              {sections.skills.name}
            </h2>
            <div className="space-y-1">
              {sections.skills.items
                .filter((s) => s.visible)
                .map((skill) => (
                  <div key={skill.id} className="flex items-center gap-2">
                    <span style={{ opacity: 0.8 }}>{skill.name}</span>
                    {skill.keywords.length > 0 && (
                      <span className="text-xs" style={{ opacity: 0.4 }}>
                        ({skill.keywords.slice(0, 3).join(", ")})
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {sections.languages.visible && sections.languages.items.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2"
              style={{
                color: `${primaryColor}80`,
                borderColor: `${primaryColor}20`,
              }}
            >
              {sections.languages.name}
            </h2>
            <div className="space-y-1">
              {sections.languages.items
                .filter((l) => l.visible)
                .map((lang) => (
                  <div key={lang.id} className="flex justify-between">
                    <span style={{ opacity: 0.8 }}>{lang.name}</span>
                    <span style={{ opacity: 0.4 }}>{lang.description}</span>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>

      {/* Projects */}
      {sections.projects.visible && sections.projects.items.length > 0 && (
        <section className="mt-8">
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2"
            style={{
              color: `${primaryColor}80`,
              borderColor: `${primaryColor}20`,
            }}
          >
            {sections.projects.name}
          </h2>
          <div className="space-y-4">
            {sections.projects.items
              .filter((p) => p.visible)
              .map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline">
                    <span
                      className="font-semibold"
                      style={{ color: primaryColor }}
                    >
                      {project.name}
                    </span>
                    {project.date && (
                      <span className="text-sm" style={{ opacity: 0.4 }}>
                        {project.date}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p style={{ opacity: 0.7 }}>{project.description}</p>
                  )}
                  {project.keywords.length > 0 && (
                    <p className="text-xs mt-1" style={{ opacity: 0.4 }}>
                      {project.keywords.join(" · ")}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Certifications & Awards in grid */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        {sections.certifications.visible &&
          sections.certifications.items.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2"
                style={{
                  color: `${primaryColor}80`,
                  borderColor: `${primaryColor}20`,
                }}
              >
                {sections.certifications.name}
              </h2>
              <div className="space-y-2">
                {sections.certifications.items
                  .filter((c) => c.visible)
                  .map((cert) => (
                    <div key={cert.id}>
                      <span style={{ opacity: 0.8 }}>{cert.name}</span>
                      <p className="text-xs" style={{ opacity: 0.4 }}>
                        {cert.issuer} · {cert.date}
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          )}

        {sections.awards.visible && sections.awards.items.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2"
              style={{
                color: `${primaryColor}80`,
                borderColor: `${primaryColor}20`,
              }}
            >
              {sections.awards.name}
            </h2>
            <div className="space-y-2">
              {sections.awards.items
                .filter((a) => a.visible)
                .map((award) => (
                  <div key={award.id}>
                    <span style={{ opacity: 0.8 }}>{award.title}</span>
                    <p className="text-xs" style={{ opacity: 0.4 }}>
                      {award.awarder} · {award.date}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>

      {/* Interests */}
      {sections.interests.visible && sections.interests.items.length > 0 && (
        <section className="mt-8">
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2"
            style={{
              color: `${primaryColor}80`,
              borderColor: `${primaryColor}20`,
            }}
          >
            {sections.interests.name}
          </h2>
          <p style={{ opacity: 0.7 }}>
            {sections.interests.items
              .filter((i) => i.visible)
              .map((i) => i.name)
              .join(" · ")}
          </p>
        </section>
      )}
    </div>
  );
}
