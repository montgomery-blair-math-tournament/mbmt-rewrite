"use client";

import Heading from "@/components/Heading";
import { HiPlus } from "react-icons/hi2";
import { useState } from "react";
import CreateRoundModal from "@/components/CreateRoundModal";

export default function RoundsHeader() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="flex items-center justify-between">
            <Heading level={1}>Rounds</Heading>
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer">
                <HiPlus className="mr-2 h-4 w-4" />
                Add Round
            </button>
            <CreateRoundModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
