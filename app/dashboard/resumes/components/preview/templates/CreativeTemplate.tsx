"use client";

import { ResumeData } from "../../../services/resumeApi";

interface CreativeTemplateProps {
  data: ResumeData;
}

export function CreativeTemplate({ data }: CreativeTemplateProps) {
  const { basics, sections, metadata } = data;

  // Apply metadata settings
  const fontFamily = metadata?.typography?.font?.family || "Inter, sans-serif";
  const fontSize = metadata?.typography?.font?.size || 13;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#1f2937";
  const bgColor = metadata?.theme?.background || "#f9fafb";
  const primaryColor = metadata?.theme?.primary || "#8b5cf6";
  const margin = metadata?.page?.margin || 0;

  const levelDots = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: i <= level ? "#ffffff" : "rgba(255,255,255,0.3)",
        }}
      />
    ));
  };

  return (
    <div
      className="min-h-full"
      id="resume-preview"
      style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight,
        backgroundColor: bgColor,
      }}
    >
      {/* Sidebar Layout */}
      <div
        className="grid grid-cols-[220px_1fr]"
        style={{ margin: `${margin}mm` }}
      >
        {/* Left Sidebar */}
        <aside
          className="text-white p-6 min-h-full"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Photo placeholder */}
          <div
            className="w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center text-4xl font-bold mb-4"
            style={{
              borderColor: "rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.2)",
            }}
          >
            {basics.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2) || "YN"}
          </div>

          <h1 className="text-xl font-bold text-center">
            {basics.name || "Your Name"}
          </h1>
          {basics.headline && (
            <p className="text-center text-sm mt-1" style={{ opacity: 0.8 }}>
              {basics.headline}
            </p>
          )}

          {/* Contact */}
          <div className="mt-6 space-y-2 text-sm">
            <h3
              className="font-bold uppercase text-xs tracking-wider mb-2"
              style={{ opacity: 0.6 }}
            >
              Contact
            </h3>
            {basics.email && <p style={{ opacity: 0.9 }}>📧 {basics.email}</p>}
            {basics.phone && <p style={{ opacity: 0.9 }}>📱 {basics.phone}</p>}
            {basics.location && (
              <p style={{ opacity: 0.9 }}>📍 {basics.location}</p>
            )}
            {basics.url?.href && (
              <p style={{ opacity: 0.9 }}>
                🔗 {basics.url.label || "Portfolio"}
              </p>
            )}
          </div>

          {/* Profiles */}
          {sections.profiles.visible && sections.profiles.items.length > 0 && (
            <div className="mt-6 text-sm">
              <h3
                className="font-bold uppercase text-xs tracking-wider mb-2"
                style={{ opacity: 0.6 }}
              >
                Social
              </h3>
              {sections.profiles.items
                .filter((p) => p.visible)
                .map((profile) => (
                  <p key={profile.id} style={{ opacity: 0.9 }}>
                    {profile.network}: @{profile.username}
                  </p>
                ))}
            </div>
          )}

          {/* Skills */}
          {sections.skills.visible && sections.skills.items.length > 0 && (
            <div className="mt-6">
              <h3
                className="font-bold uppercase text-xs tracking-wider mb-3"
                style={{ opacity: 0.6 }}
              >
                Skills
              </h3>
              <div className="space-y-2">
                {sections.skills.items
                  .filter((s) => s.visible)
                  .map((skill) => (
                    <div key={skill.id}>
                      <p className="text-sm mb-1" style={{ opacity: 0.9 }}>
                        {skill.name}
                      </p>
                      <div className="flex gap-1">{levelDots(skill.level)}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {sections.languages.visible &&
            sections.languages.items.length > 0 && (
              <div className="mt-6">
                <h3
                  className="font-bold uppercase text-xs tracking-wider mb-3"
                  style={{ opacity: 0.6 }}
                >
                  Languages
                </h3>
                <div className="space-y-2">
                  {sections.languages.items
                    .filter((l) => l.visible)
                    .map((lang) => (
                      <div key={lang.id}>
                        <p className="text-sm mb-1" style={{ opacity: 0.9 }}>
                          {lang.name}
                        </p>
                        <div className="flex gap-1">
                          {levelDots(lang.level)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* Interests */}
          {sections.interests.visible &&
            sections.interests.items.length > 0 && (
              <div className="mt-6">
                <h3
                  className="font-bold uppercase text-xs tracking-wider mb-2"
                  style={{ opacity: 0.6 }}
                >
                  Interests
                </h3>
                <div className="flex flex-wrap gap-1">
                  {sections.interests.items
                    .filter((i) => i.visible)
                    .map((interest) => (
                      <span
                        key={interest.id}
                        className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                      >
                        {interest.name}
                      </span>
                    ))}
                </div>
              </div>
            )}
        </aside>

        {/* Main Content */}
        <main
          className="p-6"
          style={{ backgroundColor: "#ffffff", color: textColor }}
        >
          {/* Summary */}
          {sections.summary.visible && sections.summary.content && (
            <section className="mb-6">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                ></span>
                About Me
              </h2>
              <p className="whitespace-pre-line" style={{ opacity: 0.7 }}>
                {sections.summary.content}
              </p>
            </section>
          )}

          {/* Experience */}
          {sections.experience.visible &&
            sections.experience.items.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  ></span>
                  Experience
                </h2>
                <div className="space-y-4">
                  {sections.experience.items
                    .filter((e) => e.visible)
                    .map((exp) => (
                      <div
                        key={exp.id}
                        className="relative pl-4 border-l-2"
                        style={{ borderColor: `${primaryColor}40` }}
                      >
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold">{exp.position}</h3>
                          <span className="text-sm" style={{ opacity: 0.4 }}>
                            {exp.date}
                          </span>
                        </div>
                        <p
                          className="font-medium"
                          style={{ color: primaryColor }}
                        >
                          {exp.company}
                        </p>
                        {exp.summary && (
                          <p
                            className="text-sm mt-1 whitespace-pre-line"
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
          {sections.education.visible &&
            sections.education.items.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  ></span>
                  Education
                </h2>
                <div className="space-y-3">
                  {sections.education.items
                    .filter((e) => e.visible)
                    .map((edu) => (
                      <div
                        key={edu.id}
                        className="relative pl-4 border-l-2"
                        style={{ borderColor: `${primaryColor}40` }}
                      >
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold">
                            {edu.studyType} {edu.area && `in ${edu.area}`}
                          </h3>
                          <span className="text-sm" style={{ opacity: 0.4 }}>
                            {edu.date}
                          </span>
                        </div>
                        <p style={{ color: primaryColor }}>{edu.institution}</p>
                      </div>
                    ))}
                </div>
              </section>
            )}

          {/* Projects */}
          {sections.projects.visible && sections.projects.items.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                ></span>
                Projects
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {sections.projects.items
                  .filter((p) => p.visible)
                  .map((project) => (
                    <div
                      key={project.id}
                      className="p-3 rounded-lg border"
                      style={{ borderColor: `${primaryColor}30` }}
                    >
                      <h3 className="font-bold text-sm">{project.name}</h3>
                      {project.description && (
                        <p className="text-xs" style={{ color: primaryColor }}>
                          {project.description}
                        </p>
                      )}
                      {project.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.keywords.slice(0, 3).map((kw) => (
                            <span
                              key={kw}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${primaryColor}15`,
                                color: primaryColor,
                              }}
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

          {/* Certifications & Awards */}
          {(sections.certifications.visible &&
            sections.certifications.items.length > 0) ||
          (sections.awards.visible && sections.awards.items.length > 0) ? (
            <div className="grid grid-cols-2 gap-6">
              {sections.certifications.visible &&
                sections.certifications.items.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      ></span>
                      Certifications
                    </h2>
                    <div className="space-y-2">
                      {sections.certifications.items
                        .filter((c) => c.visible)
                        .map((cert) => (
                          <div key={cert.id}>
                            <p className="font-medium text-sm">{cert.name}</p>
                            <p className="text-xs" style={{ opacity: 0.5 }}>
                              {cert.issuer}
                            </p>
                          </div>
                        ))}
                    </div>
                  </section>
                )}

              {sections.awards.visible && sections.awards.items.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    ></span>
                    Awards
                  </h2>
                  <div className="space-y-2">
                    {sections.awards.items
                      .filter((a) => a.visible)
                      .map((award) => (
                        <div key={award.id}>
                          <p className="font-medium text-sm">{award.title}</p>
                          <p className="text-xs" style={{ opacity: 0.5 }}>
                            {award.awarder}
                          </p>
                        </div>
                      ))}
                  </div>
                </section>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
