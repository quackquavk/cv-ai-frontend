"use client";

import { ResumeData } from "../../../services/resumeApi";
import { cn } from "@/lib/utils";

interface TemplateProps {
  data: ResumeData;
}

const isEmptyString = (str: string | undefined): boolean =>
  !str || str.trim().length === 0;
const isUrl = (href: string | undefined): boolean =>
  href?.startsWith("http") || false;

// Pikachu Template: Photo in sidebar, header in main column
export function PikachuTemplate({ data }: TemplateProps) {
  const { basics, sections, metadata } = data;

  const fontFamily = metadata?.typography?.font?.family || "Inter";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#000000";
  const bgColor = metadata?.theme?.background || "#ffffff";
  const primaryColor = metadata?.theme?.primary || "#f59e0b";
  const margin = metadata?.page?.margin || 18;

  return (
    <div
      id="resume-preview"
      className="min-h-full grid grid-cols-3 gap-6"
      style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight,
        color: textColor,
        backgroundColor: bgColor,
        padding: `${margin}mm`,
      }}
    >
      {/* Sidebar with Photo */}
      <div className="sidebar group space-y-4">
        {/* Large Photo */}
        {basics.picture?.url && !basics.picture.effects?.hidden && (
          <img
            src={basics.picture.url}
            alt={basics.name}
            className="w-full aspect-square object-cover rounded-lg"
            style={{
              filter: basics.picture.effects?.grayscale
                ? "grayscale(100%)"
                : undefined,
            }}
          />
        )}

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          <h3
            className="font-bold border-b pb-1"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Contact
          </h3>
          {basics.email && (
            <div className="flex items-center gap-2">
              <span style={{ color: primaryColor }}>✉</span>
              <a href={`mailto:${basics.email}`} className="break-all">
                {basics.email}
              </a>
            </div>
          )}
          {basics.phone && (
            <div className="flex items-center gap-2">
              <span style={{ color: primaryColor }}>📞</span>
              <span>{basics.phone}</span>
            </div>
          )}
          {basics.location && (
            <div className="flex items-center gap-2">
              <span style={{ color: primaryColor }}>📍</span>
              <span>{basics.location}</span>
            </div>
          )}
          {basics.url?.href && (
            <div className="flex items-center gap-2">
              <span style={{ color: primaryColor }}>🔗</span>
              <a href={basics.url.href} className="break-all hover:underline">
                {basics.url.label || "Website"}
              </a>
            </div>
          )}
        </div>

        {/* Skills */}
        {sections.skills?.visible && sections.skills.items?.length > 0 && (
          <div className="space-y-2">
            <h3
              className="font-bold border-b pb-1"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              {sections.skills.name}
            </h3>
            <div className="space-y-2">
              {sections.skills.items
                .filter((s) => s.visible)
                .map((skill) => (
                  <div key={skill.id}>
                    <div className="font-medium">{skill.name}</div>
                    {skill.level > 0 && (
                      <div className="w-full h-1.5 bg-gray-200 rounded mt-1">
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${(skill.level / 5) * 100}%`,
                            backgroundColor: primaryColor,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {sections.languages?.visible &&
          sections.languages.items?.length > 0 && (
            <div className="space-y-2">
              <h3
                className="font-bold border-b pb-1"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                {sections.languages.name}
              </h3>
              <div className="space-y-1">
                {sections.languages.items
                  .filter((l) => l.visible)
                  .map((lang) => (
                    <div key={lang.id} className="flex justify-between text-sm">
                      <span className="font-medium">{lang.name}</span>
                      <span className="opacity-60">{lang.description}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* Interests */}
        {sections.interests?.visible &&
          sections.interests.items?.length > 0 && (
            <div className="space-y-2">
              <h3
                className="font-bold border-b pb-1"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                {sections.interests.name}
              </h3>
              <div className="flex flex-wrap gap-1">
                {sections.interests.items
                  .filter((i) => i.visible)
                  .map((interest) => (
                    <span
                      key={interest.id}
                      className="px-2 py-0.5 text-xs rounded"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      {interest.name}
                    </span>
                  ))}
              </div>
            </div>
          )}

        {/* Profiles */}
        {sections.profiles?.visible && sections.profiles.items?.length > 0 && (
          <div className="space-y-2">
            <h3
              className="font-bold border-b pb-1"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Profiles
            </h3>
            <div className="space-y-1 text-sm">
              {sections.profiles.items
                .filter((p) => p.visible)
                .map((profile) => (
                  <div key={profile.id}>
                    <span className="font-medium">{profile.network}:</span>{" "}
                    <a
                      href={profile.url?.href || "#"}
                      className="hover:underline"
                    >
                      {profile.username}
                    </a>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main group col-span-2 space-y-4">
        {/* Header */}
        <header className="border-b pb-4" style={{ borderColor: primaryColor }}>
          <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
            {basics.name || "Your Name"}
          </h1>
          {basics.headline && (
            <p className="text-lg mt-1 opacity-80">{basics.headline}</p>
          )}
        </header>

        {/* Summary */}
        {sections.summary?.visible &&
          !isEmptyString(sections.summary.content) && (
            <section>
              <h2
                className="text-lg font-bold mb-2"
                style={{ color: primaryColor }}
              >
                {sections.summary.name}
              </h2>
              <p className="whitespace-pre-line">{sections.summary.content}</p>
            </section>
          )}

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
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold">{exp.company}</div>
                          <div style={{ color: primaryColor }}>
                            {exp.position}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{exp.date}</div>
                          {exp.location && (
                            <div className="opacity-60">{exp.location}</div>
                          )}
                        </div>
                      </div>
                      {exp.summary && (
                        <p className="text-sm mt-2 whitespace-pre-line">
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
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold">{edu.institution}</div>
                          <div style={{ color: primaryColor }}>
                            {edu.studyType} {edu.area && `in ${edu.area}`}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{edu.date}</div>
                          {edu.score && (
                            <div className="opacity-60">GPA: {edu.score}</div>
                          )}
                        </div>
                      </div>
                    </div>
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
                    <div className="flex justify-between items-start">
                      <div className="font-bold">
                        {isUrl(project.url?.href) ? (
                          <a
                            href={project.url?.href}
                            className="hover:underline"
                            style={{ color: primaryColor }}
                          >
                            {project.name}
                          </a>
                        ) : (
                          project.name
                        )}
                      </div>
                      {project.date && (
                        <span className="text-sm">{project.date}</span>
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
                    {project.keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${primaryColor}15` }}
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
              <div className="grid grid-cols-2 gap-2">
                {sections.certifications.items
                  .filter((c) => c.visible)
                  .map((cert) => (
                    <div key={cert.id}>
                      <div className="font-medium">{cert.name}</div>
                      <div className="text-sm opacity-60">{cert.issuer}</div>
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* Awards */}
        {sections.awards?.visible && sections.awards.items?.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold mb-2 border-b pb-1"
              style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
            >
              {sections.awards.name}
            </h2>
            <div className="space-y-2">
              {sections.awards.items
                .filter((a) => a.visible)
                .map((award) => (
                  <div key={award.id} className="flex justify-between">
                    <div>
                      <span className="font-medium">{award.title}</span>
                      <span className="text-sm opacity-60">
                        {" "}
                        - {award.awarder}
                      </span>
                    </div>
                    {award.date && (
                      <span className="text-sm">{award.date}</span>
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
                        <div>
                          <span className="font-bold">{vol.organization}</span>
                          <span style={{ color: primaryColor }}>
                            {" "}
                            - {vol.position}
                          </span>
                        </div>
                        <span className="text-sm">{vol.date}</span>
                      </div>
                      {vol.summary && (
                        <p className="text-sm mt-1">{vol.summary}</p>
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
      </div>
    </div>
  );
}
