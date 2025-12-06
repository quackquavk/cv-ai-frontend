"use client";

import { ResumeData } from "../../../services/resumeApi";

interface ModernTemplateProps {
  data: ResumeData;
}

export function ModernTemplate({ data }: ModernTemplateProps) {
  const { basics, sections, metadata } = data;

  // Apply metadata settings
  const fontFamily = metadata?.typography?.font?.family || "Inter, sans-serif";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#000000";
  const bgColor = metadata?.theme?.background || "#ffffff";
  const primaryColor = metadata?.theme?.primary || "#3b82f6";
  const margin = metadata?.page?.margin || 18;
  const underlineLinks = metadata?.typography?.underlineLinks || false;

  const levelWidth = (level: number) => `${((level + 1) / 5) * 100}%`;

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
        className="text-white p-8"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
          margin: `${margin}mm`,
          marginBottom: 0,
          borderRadius: "0 0 0 0",
        }}
      >
        <h1 className="text-4xl font-bold">{basics.name || "Your Name"}</h1>
        {basics.headline && (
          <p className="text-xl opacity-90 mt-2">{basics.headline}</p>
        )}
        <div className="flex flex-wrap gap-6 mt-4 text-sm opacity-90">
          {basics.email && <span>✉ {basics.email}</span>}
          {basics.phone && <span>📞 {basics.phone}</span>}
          {basics.location && <span>📍 {basics.location}</span>}
          {basics.url?.href && (
            <span>🔗 {basics.url.label || basics.url.href}</span>
          )}
        </div>
        {/* Profiles */}
        {sections.profiles.visible && sections.profiles.items.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-3 text-sm opacity-80">
            {sections.profiles.items
              .filter((p) => p.visible)
              .map((profile) => (
                <span key={profile.id}>
                  {profile.network}: @{profile.username}
                </span>
              ))}
          </div>
        )}
      </header>

      <div
        className="grid grid-cols-3 gap-8"
        style={{ padding: `${margin}mm` }}
      >
        {/* Main content - 2 columns */}
        <div className="col-span-2 space-y-6">
          {/* Summary */}
          {sections.summary.visible && sections.summary.content && (
            <section>
              <h2
                className="text-xl font-bold mb-3 flex items-center gap-2"
                style={{ color: primaryColor }}
              >
                <span
                  className="w-8 h-1 rounded"
                  style={{ backgroundColor: primaryColor }}
                ></span>
                {sections.summary.name}
              </h2>
              <p className="whitespace-pre-line" style={{ opacity: 0.8 }}>
                {sections.summary.content}
              </p>
            </section>
          )}

          {/* Experience */}
          {sections.experience.visible &&
            sections.experience.items.length > 0 && (
              <section>
                <h2
                  className="text-xl font-bold mb-3 flex items-center gap-2"
                  style={{ color: primaryColor }}
                >
                  <span
                    className="w-8 h-1 rounded"
                    style={{ backgroundColor: primaryColor }}
                  ></span>
                  {sections.experience.name}
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
                        <div
                          className="absolute -left-2 top-0 w-3 h-3 rounded-full"
                          style={{ backgroundColor: primaryColor }}
                        ></div>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold">{exp.position}</h3>
                          <span className="text-sm" style={{ opacity: 0.5 }}>
                            {exp.date}
                          </span>
                        </div>
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
                              • {exp.location}
                            </span>
                          )}
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
              <section>
                <h2
                  className="text-xl font-bold mb-3 flex items-center gap-2"
                  style={{ color: primaryColor }}
                >
                  <span
                    className="w-8 h-1 rounded"
                    style={{ backgroundColor: primaryColor }}
                  ></span>
                  {sections.education.name}
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
                        <div
                          className="absolute -left-2 top-0 w-3 h-3 rounded-full"
                          style={{ backgroundColor: primaryColor }}
                        ></div>
                        <h3 className="font-bold">
                          {edu.studyType} {edu.area && `in ${edu.area}`}
                        </h3>
                        <p style={{ color: primaryColor }}>{edu.institution}</p>
                        <div className="text-sm" style={{ opacity: 0.5 }}>
                          {edu.date}
                          {edu.score && ` • GPA: ${edu.score}`}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

          {/* Projects */}
          {sections.projects.visible && sections.projects.items.length > 0 && (
            <section>
              <h2
                className="text-xl font-bold mb-3 flex items-center gap-2"
                style={{ color: primaryColor }}
              >
                <span
                  className="w-8 h-1 rounded"
                  style={{ backgroundColor: primaryColor }}
                ></span>
                {sections.projects.name}
              </h2>
              <div className="space-y-3">
                {sections.projects.items
                  .filter((p) => p.visible)
                  .map((project) => (
                    <div
                      key={project.id}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${primaryColor}08` }}
                    >
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold">{project.name}</h3>
                        {project.date && (
                          <span className="text-sm" style={{ opacity: 0.5 }}>
                            {project.date}
                          </span>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm" style={{ color: primaryColor }}>
                          {project.description}
                        </p>
                      )}
                      {project.summary && (
                        <p className="text-sm mt-1" style={{ opacity: 0.7 }}>
                          {project.summary}
                        </p>
                      )}
                      {project.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.keywords.map((kw) => (
                            <span
                              key={kw}
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: `${primaryColor}20`,
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

          {/* Volunteer */}
          {sections.volunteer.visible &&
            sections.volunteer.items.length > 0 && (
              <section>
                <h2
                  className="text-xl font-bold mb-3 flex items-center gap-2"
                  style={{ color: primaryColor }}
                >
                  <span
                    className="w-8 h-1 rounded"
                    style={{ backgroundColor: primaryColor }}
                  ></span>
                  {sections.volunteer.name}
                </h2>
                <div className="space-y-3">
                  {sections.volunteer.items
                    .filter((v) => v.visible)
                    .map((vol) => (
                      <div key={vol.id}>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold">{vol.position}</h3>
                          <span className="text-sm" style={{ opacity: 0.5 }}>
                            {vol.date}
                          </span>
                        </div>
                        <p style={{ color: primaryColor }}>
                          {vol.organization}
                        </p>
                        {vol.summary && (
                          <p className="text-sm mt-1" style={{ opacity: 0.7 }}>
                            {vol.summary}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          {sections.skills.visible && sections.skills.items.length > 0 && (
            <section
              className="p-4 rounded-lg"
              style={{ backgroundColor: `${primaryColor}08` }}
            >
              <h2
                className="text-lg font-bold mb-3"
                style={{ color: primaryColor }}
              >
                {sections.skills.name}
              </h2>
              <div className="space-y-3">
                {sections.skills.items
                  .filter((s) => s.visible)
                  .map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{skill.name}</span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: levelWidth(skill.level),
                            backgroundColor: primaryColor,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {sections.languages.visible &&
            sections.languages.items.length > 0 && (
              <section
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${primaryColor}08` }}
              >
                <h2
                  className="text-lg font-bold mb-3"
                  style={{ color: primaryColor }}
                >
                  {sections.languages.name}
                </h2>
                <div className="space-y-2">
                  {sections.languages.items
                    .filter((l) => l.visible)
                    .map((lang) => (
                      <div key={lang.id}>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{lang.name}</span>
                          <span style={{ opacity: 0.5 }}>
                            {lang.description}
                          </span>
                        </div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden mt-1"
                          style={{ backgroundColor: `${primaryColor}20` }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: levelWidth(lang.level),
                              backgroundColor: primaryColor,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

          {/* Certifications */}
          {sections.certifications.visible &&
            sections.certifications.items.length > 0 && (
              <section
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${primaryColor}08` }}
              >
                <h2
                  className="text-lg font-bold mb-3"
                  style={{ color: primaryColor }}
                >
                  {sections.certifications.name}
                </h2>
                <div className="space-y-2">
                  {sections.certifications.items
                    .filter((c) => c.visible)
                    .map((cert) => (
                      <div key={cert.id}>
                        <p className="font-medium text-sm">{cert.name}</p>
                        <p className="text-xs" style={{ opacity: 0.5 }}>
                          {cert.issuer} • {cert.date}
                        </p>
                      </div>
                    ))}
                </div>
              </section>
            )}

          {/* Awards */}
          {sections.awards.visible && sections.awards.items.length > 0 && (
            <section
              className="p-4 rounded-lg"
              style={{ backgroundColor: `${primaryColor}08` }}
            >
              <h2
                className="text-lg font-bold mb-3"
                style={{ color: primaryColor }}
              >
                {sections.awards.name}
              </h2>
              <div className="space-y-2">
                {sections.awards.items
                  .filter((a) => a.visible)
                  .map((award) => (
                    <div key={award.id}>
                      <p className="font-medium text-sm">{award.title}</p>
                      <p className="text-xs" style={{ opacity: 0.5 }}>
                        {award.awarder} • {award.date}
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Interests */}
          {sections.interests.visible &&
            sections.interests.items.length > 0 && (
              <section
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${primaryColor}08` }}
              >
                <h2
                  className="text-lg font-bold mb-3"
                  style={{ color: primaryColor }}
                >
                  {sections.interests.name}
                </h2>
                <div className="flex flex-wrap gap-1">
                  {sections.interests.items
                    .filter((i) => i.visible)
                    .map((interest) => (
                      <span
                        key={interest.id}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${primaryColor}20`,
                          color: primaryColor,
                        }}
                      >
                        {interest.name}
                      </span>
                    ))}
                </div>
              </section>
            )}
        </div>
      </div>
    </div>
  );
}
