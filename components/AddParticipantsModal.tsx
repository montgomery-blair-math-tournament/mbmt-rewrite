"use client";

import ParticipantsTable from "./ParticipantsTable";
import Modal from "./Modal";

export default function AddParticipantsModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Participants"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer">
                        Cancel
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-rose-800 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer">
                        Add
                    </button>
                </>
            }>
            <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-medium mb-4">New Participants</h3>
                <ParticipantsTable
                    participants={[]}
                    loading={false}
                    readonly={true}
                />
            </div>
        </Modal>
    );
}
