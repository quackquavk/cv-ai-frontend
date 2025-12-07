// Re-export all Reactive-Resume templates with variant mappings
// Each template has a distinct visual style

"use client";

import { ResumeData } from "../../../services/resumeApi";

interface TemplateProps {
  data: ResumeData;
}

const isEmptyString = (str: string | undefined): boolean =>
  !str || str.trim().length === 0;
const isUrl = (href: string | undefined): boolean =>
  href?.startsWith("http") || false;

// Helper: Convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Bronzor: Dark theme with gradient header
export function BronzorTemplate({ data }: TemplateProps) {
  const { basics, sections, metadata } = data;
  const fontFamily = metadata?.typography?.font?.family || "Inter";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#e2e8f0";
  const bgColor = metadata?.theme?.background || "#1e293b";
  const primaryColor = metadata?.theme?.primary || "#38bdf8";
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
      <header
        className="p-6 rounded-lg mb-6"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}10)`,
        }}
      >
        <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
          {basics.name || "Your Name"}
        </h1>
        {basics.headline && (
          <p className="text-lg mt-1 opacity-80">{basics.headline}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-3 text-sm opacity-70">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.location && <span>• {basics.location}</span>}
        </div>
      </header>

      {sections.summary?.visible &&
        !isEmptyString(sections.summary.content) && (
          <section className="mb-6">
            <h2
              className="text-lg font-bold mb-2"
              style={{ color: primaryColor }}
            >
              {sections.summary.name}
            </h2>
            <p className="whitespace-pre-line opacity-90">
              {sections.summary.content}
            </p>
          </section>
        )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
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
                        <div className="flex justify-between">
                          <div className="font-bold">{exp.position}</div>
                          <div className="text-sm opacity-60">{exp.date}</div>
                        </div>
                        <div className="opacity-70">
                          {exp.company}
                          {exp.location && `, ${exp.location}`}
                        </div>
                        {exp.summary && (
                          <p className="text-sm mt-1 opacity-80">
                            {exp.summary}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}

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
                        <div className="font-bold">
                          {edu.studyType} {edu.area && `in ${edu.area}`}
                        </div>
                        <div className="opacity-70">{edu.institution}</div>
                        <div className="text-sm opacity-60">{edu.date}</div>
                      </div>
                    ))}
                </div>
              </section>
            )}
        </div>

        <div className="space-y-6">
          {sections.skills?.visible && sections.skills.items?.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-2"
                style={{ color: primaryColor }}
              >
                {sections.skills.name}
              </h2>
              <div className="flex flex-wrap gap-2">
                {sections.skills.items
                  .filter((s) => s.visible)
                  .map((skill) => (
                    <span
                      key={skill.id}
                      className="px-2 py-1 text-xs rounded"
                      style={{ backgroundColor: `${primaryColor}30` }}
                    >
                      {skill.name}
                    </span>
                  ))}
              </div>
            </section>
          )}

          {sections.languages?.visible &&
            sections.languages.items?.length > 0 && (
              <section>
                <h2
                  className="text-lg font-bold mb-2"
                  style={{ color: primaryColor }}
                >
                  {sections.languages.name}
                </h2>
                <div className="space-y-1 text-sm">
                  {sections.languages.items
                    .filter((l) => l.visible)
                    .map((lang) => (
                      <div key={lang.id}>
                        <strong>{lang.name}</strong> - {lang.description}
                      </div>
                    ))}
                </div>
              </section>
            )}

          {sections.profiles?.visible &&
            sections.profiles.items?.length > 0 && (
              <section>
                <h2
                  className="text-lg font-bold mb-2"
                  style={{ color: primaryColor }}
                >
                  Links
                </h2>
                <div className="space-y-1 text-sm">
                  {sections.profiles.items
                    .filter((p) => p.visible)
                    .map((profile) => (
                      <div key={profile.id}>
                        {profile.network}:{" "}
                        <a
                          href={profile.url?.href}
                          style={{ color: primaryColor }}
                        >
                          {profile.username}
                        </a>
                      </div>
                    ))}
                </div>
              </section>
            )}
        </div>
      </div>
    </div>
  );
}

// Chikorita: Fresh green nature theme
export function ChikoritaTemplate({ data }: TemplateProps) {
  const { basics, sections, metadata } = data;
  const fontFamily = metadata?.typography?.font?.family || "Inter";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#1e293b";
  const bgColor = metadata?.theme?.background || "#f0fdf4";
  const primaryColor = metadata?.theme?.primary || "#16a34a";
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
      <header
        className="text-center border-b-4 pb-4 mb-6"
        style={{ borderColor: primaryColor }}
      >
        <h1 className="text-4xl font-bold" style={{ color: primaryColor }}>
          {basics.name || "Your Name"}
        </h1>
        {basics.headline && <p className="text-xl mt-2">{basics.headline}</p>}
        <div className="flex justify-center flex-wrap gap-4 mt-3 text-sm">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.location && <span>• {basics.location}</span>}
        </div>
      </header>

      {sections.summary?.visible &&
        !isEmptyString(sections.summary.content) && (
          <section
            className="mb-6 p-4 rounded-lg"
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <p className="whitespace-pre-line text-center">
              {sections.summary.content}
            </p>
          </section>
        )}

      <div className="grid grid-cols-2 gap-6">
        {sections.experience?.visible &&
          sections.experience.items?.length > 0 && (
            <section>
              <h2
                className="text-xl font-bold mb-3 flex items-center gap-2"
                style={{ color: primaryColor }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                ></span>
                {sections.experience.name}
              </h2>
              <div
                className="space-y-4 pl-4 border-l-2"
                style={{ borderColor: primaryColor }}
              >
                {sections.experience.items
                  .filter((e) => e.visible)
                  .map((exp) => (
                    <div key={exp.id}>
                      <div className="font-bold">{exp.position}</div>
                      <div style={{ color: primaryColor }}>{exp.company}</div>
                      <div className="text-sm opacity-60">{exp.date}</div>
                      {exp.summary && (
                        <p className="text-sm mt-1">{exp.summary}</p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

        {sections.education?.visible &&
          sections.education.items?.length > 0 && (
            <section>
              <h2
                className="text-xl font-bold mb-3 flex items-center gap-2"
                style={{ color: primaryColor }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                ></span>
                {sections.education.name}
              </h2>
              <div
                className="space-y-3 pl-4 border-l-2"
                style={{ borderColor: primaryColor }}
              >
                {sections.education.items
                  .filter((e) => e.visible)
                  .map((edu) => (
                    <div key={edu.id}>
                      <div className="font-bold">
                        {edu.studyType} in {edu.area}
                      </div>
                      <div style={{ color: primaryColor }}>
                        {edu.institution}
                      </div>
                      <div className="text-sm opacity-60">{edu.date}</div>
                    </div>
                  ))}
              </div>
            </section>
          )}
      </div>

      {sections.skills?.visible && sections.skills.items?.length > 0 && (
        <section className="mt-6">
          <h2
            className="text-xl font-bold mb-3 text-center"
            style={{ color: primaryColor }}
          >
            {sections.skills.name}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {sections.skills.items
              .filter((s) => s.visible)
              .map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 rounded-full text-sm text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {skill.name}
                </span>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Ditto: Minimal, shapeshifting - very clean
export function DittoTemplate({ data }: TemplateProps) {
  const { basics, sections, metadata } = data;
  const fontFamily = metadata?.typography?.font?.family || "Inter";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.6;
  const textColor = metadata?.theme?.text || "#374151";
  const bgColor = metadata?.theme?.background || "#ffffff";
  const primaryColor = metadata?.theme?.primary || "#8b5cf6";
  const margin = metadata?.page?.margin || 20;

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
      <header className="mb-8">
        <h1 className="text-4xl font-light tracking-wide">
          {basics.name || "Your Name"}
        </h1>
        {basics.headline && (
          <p className="text-lg mt-2 opacity-60">{basics.headline}</p>
        )}
        <div
          className="flex flex-wrap gap-6 mt-4 text-sm"
          style={{ color: primaryColor }}
        >
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location && <span>{basics.location}</span>}
        </div>
      </header>

      {sections.summary?.visible &&
        !isEmptyString(sections.summary.content) && (
          <section className="mb-8 max-w-2xl">
            <p className="whitespace-pre-line leading-relaxed">
              {sections.summary.content}
            </p>
          </section>
        )}

      <div className="space-y-8">
        {sections.experience?.visible &&
          sections.experience.items?.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-[0.2em] mb-4 opacity-40">
                {sections.experience.name}
              </h2>
              <div className="space-y-6">
                {sections.experience.items
                  .filter((e) => e.visible)
                  .map((exp) => (
                    <div key={exp.id} className="grid grid-cols-4 gap-4">
                      <div className="text-sm opacity-50">{exp.date}</div>
                      <div className="col-span-3">
                        <div className="font-medium">{exp.position}</div>
                        <div style={{ color: primaryColor }}>{exp.company}</div>
                        {exp.summary && (
                          <p className="text-sm mt-2 opacity-70">
                            {exp.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

        {sections.education?.visible &&
          sections.education.items?.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-[0.2em] mb-4 opacity-40">
                {sections.education.name}
              </h2>
              <div className="space-y-4">
                {sections.education.items
                  .filter((e) => e.visible)
                  .map((edu) => (
                    <div key={edu.id} className="grid grid-cols-4 gap-4">
                      <div className="text-sm opacity-50">{edu.date}</div>
                      <div className="col-span-3">
                        <div className="font-medium">
                          {edu.studyType} {edu.area && `in ${edu.area}`}
                        </div>
                        <div style={{ color: primaryColor }}>
                          {edu.institution}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

        {sections.skills?.visible && sections.skills.items?.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-[0.2em] mb-4 opacity-40">
              {sections.skills.name}
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {sections.skills.items
                .filter((s) => s.visible)
                .map((skill, i) => (
                  <span key={skill.id}>{skill.name}</span>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Glalie: Ice cold blue professional
export function GlalieTemplate({ data }: TemplateProps) {
  const { basics, sections, metadata } = data;
  const fontFamily = metadata?.typography?.font?.family || "Inter";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#1e293b";
  const bgColor = metadata?.theme?.background || "#ffffff";
  const primaryColor = metadata?.theme?.primary || "#0ea5e9";
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
      <div
        className="p-6 text-white space-y-6"
        style={{ backgroundColor: primaryColor }}
      >
        <div>
          <h1 className="text-2xl font-bold">{basics.name || "Your Name"}</h1>
          {basics.headline && (
            <p className="mt-1 opacity-90">{basics.headline}</p>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <h3 className="font-bold uppercase text-xs tracking-wide opacity-70">
            Contact
          </h3>
          {basics.email && <p>{basics.email}</p>}
          {basics.phone && <p>{basics.phone}</p>}
          {basics.location && <p>{basics.location}</p>}
        </div>

        {sections.skills?.visible && sections.skills.items?.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold uppercase text-xs tracking-wide opacity-70">
              {sections.skills.name}
            </h3>
            <div className="space-y-1">
              {sections.skills.items
                .filter((s) => s.visible)
                .map((skill) => (
                  <div key={skill.id} className="text-sm">
                    {skill.name}
                  </div>
                ))}
            </div>
          </div>
        )}

        {sections.languages?.visible &&
          sections.languages.items?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold uppercase text-xs tracking-wide opacity-70">
                {sections.languages.name}
              </h3>
              {sections.languages.items
                .filter((l) => l.visible)
                .map((lang) => (
                  <div key={lang.id} className="text-sm">
                    {lang.name}
                  </div>
                ))}
            </div>
          )}
      </div>

      <div className="col-span-2 p-6 space-y-6">
        {sections.summary?.visible &&
          !isEmptyString(sections.summary.content) && (
            <section>
              <p className="whitespace-pre-line">{sections.summary.content}</p>
            </section>
          )}

        {sections.experience?.visible &&
          sections.experience.items?.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-3 uppercase tracking-wide"
                style={{ color: primaryColor }}
              >
                {sections.experience.name}
              </h2>
              <div className="space-y-4">
                {sections.experience.items
                  .filter((e) => e.visible)
                  .map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between">
                        <div className="font-bold">{exp.position}</div>
                        <div className="text-sm opacity-60">{exp.date}</div>
                      </div>
                      <div style={{ color: primaryColor }}>{exp.company}</div>
                      {exp.summary && (
                        <p className="text-sm mt-1">{exp.summary}</p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

        {sections.education?.visible &&
          sections.education.items?.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-3 uppercase tracking-wide"
                style={{ color: primaryColor }}
              >
                {sections.education.name}
              </h2>
              <div className="space-y-3">
                {sections.education.items
                  .filter((e) => e.visible)
                  .map((edu) => (
                    <div key={edu.id}>
                      <div className="font-bold">
                        {edu.studyType} in {edu.area}
                      </div>
                      <div>
                        {edu.institution} - {edu.date}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}

// Kakuna: Geometric cocoon-like sections
export function KakunaTemplate({ data }: TemplateProps) {
  const { basics, sections, metadata } = data;
  const fontFamily = metadata?.typography?.font?.family || "Inter";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#1c1917";
  const bgColor = metadata?.theme?.background || "#fef3c7";
  const primaryColor = metadata?.theme?.primary || "#d97706";
  const margin = metadata?.page?.margin || 16;

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
      <header className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
          {basics.name || "Your Name"}
        </h1>
        {basics.headline && <p className="text-lg mt-1">{basics.headline}</p>}
        <div className="flex flex-wrap gap-4 mt-3 text-sm opacity-70">
          {basics.email && <span>✉ {basics.email}</span>}
          {basics.phone && <span>📞 {basics.phone}</span>}
          {basics.location && <span>📍 {basics.location}</span>}
        </div>
      </header>

      {sections.summary?.visible &&
        !isEmptyString(sections.summary.content) && (
          <section className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h2 className="font-bold mb-2" style={{ color: primaryColor }}>
              {sections.summary.name}
            </h2>
            <p className="whitespace-pre-line">{sections.summary.content}</p>
          </section>
        )}

      <div className="grid grid-cols-2 gap-4">
        {sections.experience?.visible &&
          sections.experience.items?.length > 0 && (
            <section className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold mb-3" style={{ color: primaryColor }}>
                {sections.experience.name}
              </h2>
              <div className="space-y-3">
                {sections.experience.items
                  .filter((e) => e.visible)
                  .slice(0, 3)
                  .map((exp) => (
                    <div
                      key={exp.id}
                      className="border-l-2 pl-3"
                      style={{ borderColor: primaryColor }}
                    >
                      <div className="font-medium">{exp.position}</div>
                      <div className="text-sm">{exp.company}</div>
                      <div className="text-xs opacity-60">{exp.date}</div>
                    </div>
                  ))}
              </div>
            </section>
          )}

        {sections.education?.visible &&
          sections.education.items?.length > 0 && (
            <section className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold mb-3" style={{ color: primaryColor }}>
                {sections.education.name}
              </h2>
              <div className="space-y-3">
                {sections.education.items
                  .filter((e) => e.visible)
                  .map((edu) => (
                    <div
                      key={edu.id}
                      className="border-l-2 pl-3"
                      style={{ borderColor: primaryColor }}
                    >
                      <div className="font-medium">
                        {edu.studyType} in {edu.area}
                      </div>
                      <div className="text-sm">{edu.institution}</div>
                      <div className="text-xs opacity-60">{edu.date}</div>
                    </div>
                  ))}
              </div>
            </section>
          )}

        {sections.skills?.visible && sections.skills.items?.length > 0 && (
          <section className="bg-white rounded-xl p-4 shadow-sm col-span-2">
            <h2 className="font-bold mb-3" style={{ color: primaryColor }}>
              {sections.skills.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {sections.skills.items
                .filter((s) => s.visible)
                .map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Leafish: Nature leafy theme
export function LeafishTemplate({ data }: TemplateProps) {
  const { basics, sections, metadata } = data;
  const fontFamily = metadata?.typography?.font?.family || "Georgia";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.6;
  const textColor = metadata?.theme?.text || "#1e3a2f";
  const bgColor = metadata?.theme?.background || "#ecfdf5";
  const primaryColor = metadata?.theme?.primary || "#059669";
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
      <header className="text-center mb-8">
        <div
          className="inline-block px-8 py-4 rounded-full"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
            {basics.name || "Your Name"}
          </h1>
          {basics.headline && <p className="mt-1">{basics.headline}</p>}
        </div>
        <div className="flex justify-center flex-wrap gap-4 mt-4 text-sm">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.location && <span>• {basics.location}</span>}
        </div>
      </header>

      {sections.summary?.visible &&
        !isEmptyString(sections.summary.content) && (
          <section className="mb-6 text-center max-w-2xl mx-auto">
            <p className="whitespace-pre-line italic">
              {sections.summary.content}
            </p>
          </section>
        )}

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-6">
          {sections.experience?.visible &&
            sections.experience.items?.length > 0 && (
              <section>
                <h2
                  className="text-lg font-bold mb-3"
                  style={{ color: primaryColor }}
                >
                  {sections.experience.name}
                </h2>
                <div className="space-y-4">
                  {sections.experience.items
                    .filter((e) => e.visible)
                    .map((exp) => (
                      <div
                        key={exp.id}
                        className="pl-4 border-l-2"
                        style={{ borderColor: primaryColor }}
                      >
                        <div className="font-bold">{exp.position}</div>
                        <div>
                          {exp.company} | {exp.date}
                        </div>
                        {exp.summary && (
                          <p className="text-sm mt-1">{exp.summary}</p>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}

          {sections.education?.visible &&
            sections.education.items?.length > 0 && (
              <section>
                <h2
                  className="text-lg font-bold mb-3"
                  style={{ color: primaryColor }}
                >
                  {sections.education.name}
                </h2>
                <div className="space-y-3">
                  {sections.education.items
                    .filter((e) => e.visible)
                    .map((edu) => (
                      <div
                        key={edu.id}
                        className="pl-4 border-l-2"
                        style={{ borderColor: primaryColor }}
                      >
                        <div className="font-bold">
                          {edu.studyType} in {edu.area}
                        </div>
                        <div>{edu.institution}</div>
                        <div className="text-sm opacity-60">{edu.date}</div>
                      </div>
                    ))}
                </div>
              </section>
            )}
        </div>

        <div className="col-span-2 space-y-6">
          {sections.skills?.visible && sections.skills.items?.length > 0 && (
            <section
              className="p-4 rounded-lg"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <h2 className="font-bold mb-2" style={{ color: primaryColor }}>
                {sections.skills.name}
              </h2>
              <div className="space-y-1">
                {sections.skills.items
                  .filter((s) => s.visible)
                  .map((skill) => (
                    <div key={skill.id} className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      ></span>
                      <span>{skill.name}</span>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {sections.languages?.visible &&
            sections.languages.items?.length > 0 && (
              <section
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <h2 className="font-bold mb-2" style={{ color: primaryColor }}>
                  {sections.languages.name}
                </h2>
                {sections.languages.items
                  .filter((l) => l.visible)
                  .map((lang) => (
                    <div key={lang.id} className="flex justify-between text-sm">
                      <span>{lang.name}</span>
                      <span className="opacity-60">{lang.description}</span>
                    </div>
                  ))}
              </section>
            )}

          {sections.interests?.visible &&
            sections.interests.items?.length > 0 && (
              <section
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <h2 className="font-bold mb-2" style={{ color: primaryColor }}>
                  {sections.interests.name}
                </h2>
                <div className="flex flex-wrap gap-1">
                  {sections.interests.items
                    .filter((i) => i.visible)
                    .map((interest) => (
                      <span key={interest.id} className="text-sm">
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

// Nosepass: Compass-like directional layout
export function NosepassTemplate({ data }: TemplateProps) {
  const { basics, sections, metadata } = data;
  const fontFamily = metadata?.typography?.font?.family || "Inter";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#334155";
  const bgColor = metadata?.theme?.background || "#f8fafc";
  const primaryColor = metadata?.theme?.primary || "#6366f1";
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
      <header
        className="flex items-center gap-6 mb-6 pb-4 border-b-2"
        style={{ borderColor: primaryColor }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
          style={{ backgroundColor: primaryColor }}
        >
          {(basics.name || "YN")
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{basics.name || "Your Name"}</h1>
          {basics.headline && (
            <p className="text-lg opacity-70">{basics.headline}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-2 text-sm">
            {basics.email && <span>{basics.email}</span>}
            {basics.phone && <span>• {basics.phone}</span>}
            {basics.location && <span>• {basics.location}</span>}
          </div>
        </div>
      </header>

      {sections.summary?.visible &&
        !isEmptyString(sections.summary.content) && (
          <section className="mb-6 p-4 bg-white rounded-lg shadow-sm">
            <p className="whitespace-pre-line">{sections.summary.content}</p>
          </section>
        )}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 space-y-4">
          {sections.experience?.visible &&
            sections.experience.items?.length > 0 && (
              <section className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="font-bold mb-3 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: primaryColor }}
                  ></span>
                  {sections.experience.name}
                </h2>
                <div className="space-y-4">
                  {sections.experience.items
                    .filter((e) => e.visible)
                    .map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between">
                          <span className="font-bold">{exp.position}</span>
                          <span
                            className="text-sm"
                            style={{ color: primaryColor }}
                          >
                            {exp.date}
                          </span>
                        </div>
                        <div>
                          {exp.company}
                          {exp.location && ` • ${exp.location}`}
                        </div>
                        {exp.summary && (
                          <p className="text-sm mt-1 opacity-70">
                            {exp.summary}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}

          {sections.education?.visible &&
            sections.education.items?.length > 0 && (
              <section className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="font-bold mb-3 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: primaryColor }}
                  ></span>
                  {sections.education.name}
                </h2>
                <div className="space-y-3">
                  {sections.education.items
                    .filter((e) => e.visible)
                    .map((edu) => (
                      <div key={edu.id}>
                        <div className="font-bold">{edu.institution}</div>
                        <div>
                          {edu.studyType} in {edu.area}
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: primaryColor }}
                        >
                          {edu.date}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

          {sections.projects?.visible &&
            sections.projects.items?.length > 0 && (
              <section className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="font-bold mb-3 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: primaryColor }}
                  ></span>
                  {sections.projects.name}
                </h2>
                <div className="space-y-3">
                  {sections.projects.items
                    .filter((p) => p.visible)
                    .map((project) => (
                      <div key={project.id}>
                        <div className="font-bold">{project.name}</div>
                        {project.description && (
                          <div className="text-sm opacity-70">
                            {project.description}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}
        </div>

        <div className="col-span-4 space-y-4">
          {sections.skills?.visible && sections.skills.items?.length > 0 && (
            <section className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-bold mb-2">{sections.skills.name}</h2>
              <div className="flex flex-wrap gap-1">
                {sections.skills.items
                  .filter((s) => s.visible)
                  .map((skill) => (
                    <span
                      key={skill.id}
                      className="px-2 py-0.5 text-xs rounded"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                      }}
                    >
                      {skill.name}
                    </span>
                  ))}
              </div>
            </section>
          )}

          {sections.languages?.visible &&
            sections.languages.items?.length > 0 && (
              <section className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="font-bold mb-2">{sections.languages.name}</h2>
                {sections.languages.items
                  .filter((l) => l.visible)
                  .map((lang) => (
                    <div key={lang.id} className="text-sm">
                      {lang.name} - {lang.description}
                    </div>
                  ))}
              </section>
            )}

          {sections.certifications?.visible &&
            sections.certifications.items?.length > 0 && (
              <section className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="font-bold mb-2">
                  {sections.certifications.name}
                </h2>
                {sections.certifications.items
                  .filter((c) => c.visible)
                  .map((cert) => (
                    <div key={cert.id} className="text-sm mb-1">
                      {cert.name}
                    </div>
                  ))}
              </section>
            )}
        </div>
      </div>
    </div>
  );
}

// Rhyhorn: Rock solid, structured layout
export function RhyhornTemplate({ data }: TemplateProps) {
  const { basics, sections, metadata } = data;
  const fontFamily = metadata?.typography?.font?.family || "Inter";
  const fontSize = metadata?.typography?.font?.size || 14;
  const lineHeight = metadata?.typography?.lineHeight || 1.5;
  const textColor = metadata?.theme?.text || "#1f2937";
  const bgColor = metadata?.theme?.background || "#ffffff";
  const primaryColor = metadata?.theme?.primary || "#78716c";
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
      <header className="mb-6">
        <div
          className="flex items-end justify-between border-b-4 pb-3"
          style={{ borderColor: primaryColor }}
        >
          <div>
            <h1
              className="text-4xl font-black uppercase tracking-tight"
              style={{ color: primaryColor }}
            >
              {basics.name || "Your Name"}
            </h1>
            {basics.headline && (
              <p className="text-xl mt-1 font-medium">{basics.headline}</p>
            )}
          </div>
          <div className="text-right text-sm">
            {basics.email && <p>{basics.email}</p>}
            {basics.phone && <p>{basics.phone}</p>}
            {basics.location && <p>{basics.location}</p>}
          </div>
        </div>
      </header>

      {sections.summary?.visible &&
        !isEmptyString(sections.summary.content) && (
          <section className="mb-6">
            <h2
              className="text-sm uppercase tracking-widest font-bold mb-2"
              style={{ color: primaryColor }}
            >
              Profile
            </h2>
            <p className="whitespace-pre-line">{sections.summary.content}</p>
          </section>
        )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {sections.experience?.visible &&
            sections.experience.items?.length > 0 && (
              <section>
                <h2
                  className="text-sm uppercase tracking-widest font-bold mb-3"
                  style={{ color: primaryColor }}
                >
                  {sections.experience.name}
                </h2>
                <div className="space-y-4">
                  {sections.experience.items
                    .filter((e) => e.visible)
                    .map((exp) => (
                      <div
                        key={exp.id}
                        className="border-l-4 pl-4"
                        style={{ borderColor: primaryColor }}
                      >
                        <div className="flex justify-between items-baseline">
                          <div className="font-bold text-lg">
                            {exp.position}
                          </div>
                          <div className="text-sm font-medium">{exp.date}</div>
                        </div>
                        <div
                          className="font-medium"
                          style={{ color: primaryColor }}
                        >
                          {exp.company}
                        </div>
                        {exp.summary && (
                          <p className="text-sm mt-2">{exp.summary}</p>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}

          {sections.education?.visible &&
            sections.education.items?.length > 0 && (
              <section>
                <h2
                  className="text-sm uppercase tracking-widest font-bold mb-3"
                  style={{ color: primaryColor }}
                >
                  {sections.education.name}
                </h2>
                <div className="space-y-3">
                  {sections.education.items
                    .filter((e) => e.visible)
                    .map((edu) => (
                      <div
                        key={edu.id}
                        className="border-l-4 pl-4"
                        style={{ borderColor: primaryColor }}
                      >
                        <div className="font-bold">
                          {edu.studyType} in {edu.area}
                        </div>
                        <div>
                          {edu.institution} • {edu.date}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}
        </div>

        <div className="space-y-4">
          {sections.skills?.visible && sections.skills.items?.length > 0 && (
            <section
              className="border-2 p-3"
              style={{ borderColor: primaryColor }}
            >
              <h2
                className="text-sm uppercase tracking-widest font-bold mb-2"
                style={{ color: primaryColor }}
              >
                {sections.skills.name}
              </h2>
              <div className="space-y-1">
                {sections.skills.items
                  .filter((s) => s.visible)
                  .map((skill) => (
                    <div key={skill.id} className="text-sm font-medium">
                      {skill.name}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {sections.languages?.visible &&
            sections.languages.items?.length > 0 && (
              <section
                className="border-2 p-3"
                style={{ borderColor: primaryColor }}
              >
                <h2
                  className="text-sm uppercase tracking-widest font-bold mb-2"
                  style={{ color: primaryColor }}
                >
                  {sections.languages.name}
                </h2>
                {sections.languages.items
                  .filter((l) => l.visible)
                  .map((lang) => (
                    <div key={lang.id} className="text-sm">
                      {lang.name}
                    </div>
                  ))}
              </section>
            )}

          {sections.certifications?.visible &&
            sections.certifications.items?.length > 0 && (
              <section
                className="border-2 p-3"
                style={{ borderColor: primaryColor }}
              >
                <h2
                  className="text-sm uppercase tracking-widest font-bold mb-2"
                  style={{ color: primaryColor }}
                >
                  {sections.certifications.name}
                </h2>
                {sections.certifications.items
                  .filter((c) => c.visible)
                  .map((cert) => (
                    <div key={cert.id} className="text-sm">
                      {cert.name}
                    </div>
                  ))}
              </section>
            )}
        </div>
      </div>
    </div>
  );
}
