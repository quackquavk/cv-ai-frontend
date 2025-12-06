"use client";

import { ResumeData } from "../../../services/resumeApi";

interface ClassicTemplateProps {
  data: ResumeData;
}

export function ClassicTemplate({ data }: ClassicTemplateProps) {
  const { basics, sections, metadata } = data;

  // Apply metadata settings
  const fontFamily = metadata?.typography?.font?.family || "Georgia, serif";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#000000";
  const bgColor = metadata?.theme?.background || "#ffffff";
  const primaryColor = metadata?.theme?.primary || "#1a1a1a";
  const margin = metadata?.page?.margin || 18;
  const hideIcons = metadata?.typography?.hideIcons || false;
  const underlineLinks = metadata?.typography?.underlineLinks || false;

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
      <header
        className="text-center border-b-2 pb-4 mb-6"
        style={{ borderColor: primaryColor }}
      >
        <h1
          className="text-3xl font-bold tracking-wide uppercase"
          style={{ color: primaryColor }}
        >
          {basics.name || "Your Name"}
        </h1>
        {basics.headline && (
          <p className="text-lg mt-1" style={{ opacity: 0.8 }}>
            {basics.headline}
          </p>
        )}
        <div
          className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm"
          style={{ opacity: 0.7 }}
        >
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.location && <span>• {basics.location}</span>}
          {basics.url?.href && (
            <span>
              •{" "}
              <a
                href={basics.url.href}
                style={{
                  textDecoration: underlineLinks ? "underline" : "none",
                }}
              >
                {basics.url.label || basics.url.href}
              </a>
            </span>
          )}
        </div>
        {/* Profiles */}
        {sections.profiles.visible && sections.profiles.items.length > 0 && (
          <div className="flex justify-center flex-wrap gap-3 mt-2 text-sm">
            {sections.profiles.items
              .filter((p) => p.visible)
              .map((profile) => (
                <a
                  key={profile.id}
                  href={profile.url.href}
                  style={{
                    color: primaryColor,
                    textDecoration: underlineLinks ? "underline" : "none",
                  }}
                >
                  {profile.network}: {profile.username}
                </a>
              ))}
          </div>
        )}
      </header>

      {/* Summary */}
      {sections.summary.visible && sections.summary.content && (
        <section className="mb-6">
          <h2
            className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
            style={{ borderColor: `${primaryColor}40` }}
          >
            {sections.summary.name}
          </h2>
          <p className="text-sm whitespace-pre-line">
            {sections.summary.content}
          </p>
        </section>
      )}

      {/* Experience */}
      {sections.experience.visible && sections.experience.items.length > 0 && (
        <section className="mb-6">
          <h2
            className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
            style={{ borderColor: `${primaryColor}40` }}
          >
            {sections.experience.name}
          </h2>
          <div className="space-y-4">
            {sections.experience.items
              .filter((e) => e.visible)
              .map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold">{exp.position}</h3>
                    <span className="text-sm" style={{ opacity: 0.6 }}>
                      {exp.date}
                    </span>
                  </div>
                  <p style={{ opacity: 0.8, fontStyle: "italic" }}>
                    {exp.company}
                    {exp.location && `, ${exp.location}`}
                  </p>
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
      {sections.education.visible && sections.education.items.length > 0 && (
        <section className="mb-6">
          <h2
            className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
            style={{ borderColor: `${primaryColor}40` }}
          >
            {sections.education.name}
          </h2>
          <div className="space-y-3">
            {sections.education.items
              .filter((e) => e.visible)
              .map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold">
                      {edu.studyType} {edu.area && `in ${edu.area}`}
                    </h3>
                    <span className="text-sm" style={{ opacity: 0.6 }}>
                      {edu.date}
                    </span>
                  </div>
                  <p style={{ opacity: 0.8, fontStyle: "italic" }}>
                    {edu.institution}
                    {edu.score && ` • GPA: ${edu.score}`}
                  </p>
                  {edu.summary && <p className="text-sm mt-1">{edu.summary}</p>}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {sections.skills.visible && sections.skills.items.length > 0 && (
        <section className="mb-6">
          <h2
            className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
            style={{ borderColor: `${primaryColor}40` }}
          >
            {sections.skills.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {sections.skills.items
              .filter((s) => s.visible)
              .map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 text-sm rounded"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  {skill.name}
                  {skill.keywords.length > 0 &&
                    ` (${skill.keywords.join(", ")})`}
                </span>
              ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {sections.projects.visible && sections.projects.items.length > 0 && (
        <section className="mb-6">
          <h2
            className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
            style={{ borderColor: `${primaryColor}40` }}
          >
            {sections.projects.name}
          </h2>
          <div className="space-y-3">
            {sections.projects.items
              .filter((p) => p.visible)
              .map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold">{project.name}</h3>
                    {project.date && (
                      <span className="text-sm" style={{ opacity: 0.6 }}>
                        {project.date}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm" style={{ fontStyle: "italic" }}>
                      {project.description}
                    </p>
                  )}
                  {project.summary && (
                    <p className="text-sm mt-1">{project.summary}</p>
                  )}
                  {project.keywords.length > 0 && (
                    <p className="text-xs mt-1" style={{ opacity: 0.5 }}>
                      {project.keywords.join(" • ")}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {sections.certifications.visible &&
        sections.certifications.items.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
              style={{ borderColor: `${primaryColor}40` }}
            >
              {sections.certifications.name}
            </h2>
            <div className="space-y-2">
              {sections.certifications.items
                .filter((c) => c.visible)
                .map((cert) => (
                  <div
                    key={cert.id}
                    className="flex justify-between items-baseline"
                  >
                    <span className="font-medium">
                      {cert.name}{" "}
                      <span className="font-normal" style={{ opacity: 0.6 }}>
                        - {cert.issuer}
                      </span>
                    </span>
                    {cert.date && (
                      <span className="text-sm" style={{ opacity: 0.6 }}>
                        {cert.date}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

      {/* Languages */}
      {sections.languages.visible && sections.languages.items.length > 0 && (
        <section className="mb-6">
          <h2
            className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
            style={{ borderColor: `${primaryColor}40` }}
          >
            {sections.languages.name}
          </h2>
          <div className="flex flex-wrap gap-4">
            {sections.languages.items
              .filter((l) => l.visible)
              .map((lang) => (
                <span key={lang.id}>
                  <strong>{lang.name}</strong>
                  {lang.description && ` - ${lang.description}`}
                </span>
              ))}
          </div>
        </section>
      )}

      {/* Awards */}
      {sections.awards.visible && sections.awards.items.length > 0 && (
        <section className="mb-6">
          <h2
            className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
            style={{ borderColor: `${primaryColor}40` }}
          >
            {sections.awards.name}
          </h2>
          <div className="space-y-2">
            {sections.awards.items
              .filter((a) => a.visible)
              .map((award) => (
                <div
                  key={award.id}
                  className="flex justify-between items-baseline"
                >
                  <span>
                    <strong>{award.title}</strong> - {award.awarder}
                  </span>
                  {award.date && (
                    <span className="text-sm" style={{ opacity: 0.6 }}>
                      {award.date}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Interests */}
      {sections.interests.visible && sections.interests.items.length > 0 && (
        <section className="mb-6">
          <h2
            className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
            style={{ borderColor: `${primaryColor}40` }}
          >
            {sections.interests.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {sections.interests.items
              .filter((i) => i.visible)
              .map((interest) => (
                <span
                  key={interest.id}
                  className="px-3 py-1 text-sm rounded"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  {interest.name}
                </span>
              ))}
          </div>
        </section>
      )}

      {/* Volunteer */}
      {sections.volunteer.visible && sections.volunteer.items.length > 0 && (
        <section className="mb-6">
          <h2
            className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
            style={{ borderColor: `${primaryColor}40` }}
          >
            {sections.volunteer.name}
          </h2>
          <div className="space-y-3">
            {sections.volunteer.items
              .filter((v) => v.visible)
              .map((vol) => (
                <div key={vol.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold">{vol.position}</h3>
                    <span className="text-sm" style={{ opacity: 0.6 }}>
                      {vol.date}
                    </span>
                  </div>
                  <p style={{ opacity: 0.8, fontStyle: "italic" }}>
                    {vol.organization}
                  </p>
                  {vol.summary && <p className="text-sm mt-1">{vol.summary}</p>}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Publications */}
      {sections.publications.visible &&
        sections.publications.items.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
              style={{ borderColor: `${primaryColor}40` }}
            >
              {sections.publications.name}
            </h2>
            <div className="space-y-2">
              {sections.publications.items
                .filter((p) => p.visible)
                .map((pub) => (
                  <div key={pub.id}>
                    <span className="font-medium">{pub.name}</span>
                    <span style={{ opacity: 0.6 }}>
                      {" "}
                      - {pub.publisher}, {pub.date}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}

      {/* References */}
      {sections.references.visible && sections.references.items.length > 0 && (
        <section>
          <h2
            className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3"
            style={{ borderColor: `${primaryColor}40` }}
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
                    <span style={{ opacity: 0.6 }}> - {ref.description}</span>
                  )}
                  {ref.summary && (
                    <p className="text-sm mt-1" style={{ fontStyle: "italic" }}>
                      "{ref.summary}"
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
