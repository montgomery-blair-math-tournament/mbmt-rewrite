"use client";

import { HiXMark } from "react-icons/hi2";
import ParticipantsTable from "./ParticipantsTable";

export default function AddParticipantsModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors hover:cursor-pointer"
                            aria-label="Close">
                            <HiXMark className="w-6 h-6 text-gray-500" />
                        </button>
                        <h2 className="text-xl font-semibold">
                            Add Participants
                        </h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="bg-white p-4 rounded-md shadow-sm">
                        <h3 className="text-lg font-medium mb-4">
                            New Participants
                        </h3>
                        <ParticipantsTable
                            participants={[]}
                            loading={false}
                            readonly={true}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer">
                        Cancel
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-rose-800 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer">
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
