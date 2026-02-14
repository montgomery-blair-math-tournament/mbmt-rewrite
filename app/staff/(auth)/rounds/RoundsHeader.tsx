"use client";

import Heading from "@/components/Heading";
import { HiPlus } from "react-icons/hi2";
import { useState } from "react";
import CreateRoundModal from "@/components/CreateRoundModal";
import Button from "@/components/ui/Button";

export default function RoundsHeader() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="flex items-center justify-between">
            <Heading level={1}>Rounds</Heading>
            <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm">
                <HiPlus className="mr-2 h-4 w-4" />
                Add Round
            </Button>
            <CreateRoundModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
