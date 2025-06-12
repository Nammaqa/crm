"use client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LeadTypeSelector({ value, onChange }) {
    return (
        <div>
            <Label>Lead:</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Lead Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="prospective">Add Prospective Lead</SelectItem>
                    <SelectItem value="new">Add Qualified Lead</SelectItem>
                    <SelectItem value="existing">Add Existing Deal</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
