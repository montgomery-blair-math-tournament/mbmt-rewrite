"use client";

import Heading from "@/components/Heading";
import { HiPlus } from "react-icons/hi2";
import { useState } from "react";
import CreateRoundModal from "@/app/staff/(auth)/rounds/CreateRoundModal";
import HeaderButton from "@/components/HeaderButton";

export default function RoundsHeader() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="flex items-center justify-between">
            <Heading level={1}>Rounds</Heading>
            <HeaderButton onClick={() => setIsCreateModalOpen(true)}>
                <HiPlus className="h-4 w-4" />
                Add Round
            </HeaderButton>
            <CreateRoundModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
