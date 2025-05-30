import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * BdTable displays leads in a table and provides tab navigation.
 * Tab changes are delegated to the parent via onTabChange for correct workflow sync.
 *
 * @param {Object[]} leads - Array of lead objects.
 * @param {Function} onLeadClick - Callback when a lead row is clicked.
 * @param {string} activeTab - The currently active tab.
 * @param {Function} onTabChange - Callback when a tab is changed.
 */
export default function BdTable({ leads = [], onLeadClick, activeTab, onTabChange }) {
  const filteredLeads = leads.filter((lead) => {
    if (activeTab === "Prospective") return lead.leadType === "prospective" && lead.status === "prospective";
    if (activeTab === "new-lead") return lead.leadType === "new" && lead.status === "newlead";
     if (activeTab === "existing-deal") return lead.leadType === "existing" && lead.status === "deal";
  if (activeTab === "deal") return lead.leadType === "existing" && lead.status === "deal";
  return false;
  });

  const tabs = [
    { key: "Prospective", label: "Prospective" },
    { key: "new-lead", label: "Qualified Lead"},
    { key: "existing-deal", label: "Existing Deal" },
    { key: "deal", label: "Deal" },
  ];

  return (
    <Card className="p-6 my-12">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            onClick={() => {
              if (activeTab !== tab.key) onTabChange(tab.key);
            }}
            variant={activeTab === tab.key ? "default" : "ghost"}
            className="py-2 px-4 capitalize"
            type="button"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto border rounded-md">
        {filteredLeads.length > 0 ? (
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left">Company</th>
                <th className="px-4 py-2 border-b text-left">Sales</th>
                <th className="px-4 py-2 border-b text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td className="px-4 py-2 border-b">{lead.companyName}</td>
                  <td className="px-4 py-2 border-b">{lead.salesName}</td>
                  <td className="px-4 py-2 border-b">{lead.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-4">No leads found.</p>
        )}
      </div>
    </Card>
  );
}