import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function BdTable() {
    const [activeTab, setActiveTab] = useState('Prospective');

    return (
        <Card className="p-6 my-12">
            {/* Horizontal Buttons */}
            <div className="flex space-x-4 mb-6">
                <Button
                    onClick={() => setActiveTab('Prospective')}
                    variant={activeTab === 'Prospective' ? "default" : "ghost"}
                    className="py-2 px-4"
                >
                    Prospective Lead
                </Button>
                <Button
                    onClick={() => setActiveTab('new-lead')}
                    variant={activeTab === 'new-lead' ? "default" : "ghost"}
                    className="py-2 px-4"
                >
                    Qualified Lead
                </Button>
                <Button
                    onClick={() => setActiveTab('existing-lead')}
                    variant={activeTab === 'existing-lead' ? "default" : "ghost"}
                    className="py-2 px-4"
                >
                    Existing Deal
                </Button>
                <Button
                    onClick={() => setActiveTab('deal')}
                    variant={activeTab === 'deal' ? "default" : "ghost"}
                    className="py-2 px-4"
                >
                    Deal
                </Button>
            </div>

            {/* Tab Content */}
            <div className="p-4 border rounded-md">
                {activeTab === 'Prospective' && <div className="mb-4"> Prospective Lead List </div>}
                {activeTab === 'new-lead' && <div className="mb-4"> Qualified Lead List</div>}
                {activeTab === 'existing-lead' && <div className="mb-4"> Existing Lead List</div>}
                {activeTab === 'deal' && <div className="mb-4"> Deal List</div>}
            </div>
        </Card>
    );
}

export default BdTable;
