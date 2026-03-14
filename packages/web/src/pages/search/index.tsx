import SearchWorkbench from "@/components/search/search-workbench";

const SearchPage = () => (
  <section
    data-testid="search-page"
    className="flex h-full min-h-0 flex-col gap-4"
  >
    <SearchWorkbench />
  </section>
);

export default SearchPage;
