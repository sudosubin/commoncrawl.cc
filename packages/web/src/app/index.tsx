import { Route, Router } from "preact-iso";

import AppShell from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import NotFoundPage from "@/pages/not-found";
import SearchPage from "@/pages/search";

const App = () => (
  <TooltipProvider>
    <AppShell>
      <Router>
        <Route path="/" component={HomePage} />
        <Route path="/search" component={SearchPage} />
        <Route default component={NotFoundPage} />
      </Router>
    </AppShell>
  </TooltipProvider>
);

export default App;
