import { Metadata } from "next";
import DashboardClient from "./components/DashboardClient";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const query = searchParams.q;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://app.cvai.dev";

  let canonicalUrl = `${baseUrl}/dashboard`;
  if (query && typeof query === "string") {
    canonicalUrl += `?q=${encodeURIComponent(query)}`;
  }

  return {
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function Dashboard() {
  return <DashboardClient />;
}
