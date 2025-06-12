"use client";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function RemarksField({ value, onChange }) {
    return (
        <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
                id="remarks"
                placeholder="Enter any remarks or notes here..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded-md"
            />
        </div>
    );
}
