import { industries } from "../data.js";
import { drawer } from "../components/panels.js";
import { renderOverview } from "./overview.js";
import { renderExplorer } from "./explorer.js";
import { renderIndustry } from "./industry.js";
import { renderCompany } from "./company.js";
import { renderTechnology } from "./technology.js";
import { renderComponents } from "./componentsView.js";

export function renderRoute(state) {
  const industry = industries[state.industryId] || industries["advanced-packaging"];
  const views = {
    overview: renderOverview,
    explorer: renderExplorer,
    industry: renderIndustry,
    company: renderCompany,
    technology: renderTechnology,
    components: renderComponents
  };
  return (views[state.route] || renderOverview)(state, industry);
}

export function renderDrawer(companyId, relationText) {
  return drawer(companyId, relationText);
}
