import AdvanceSettings from "@/components/settings/seo/advance-settings";
import SearchResultPreview from "@/components/settings/seo/search-result-preview";
import HomePageSeo from "@/components/settings/seo/home-page-seo";
import GlobalPageSeo from "@/components/settings/seo/global-seo";
import type { Metadata } from "next";
import SaveActions from "@/components/settings/save-actions";

export const metadata: Metadata = {
  title: "Référencement & SEO | DivinExpress Admin",
  description: "Configuration du référencement naturel et des balises méta pour la boutique DivinExpress.",
};

export default function SeoSettingsPage() {
  return (
    <div className="space-y-4">
      <GlobalPageSeo />
      <HomePageSeo />
      <SearchResultPreview />
      <AdvanceSettings />
      <SaveActions className="pt-2" />
    </div>
  );
}
