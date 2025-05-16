import React from "react";

interface RejectModalProps {
    name: string;
    selectedReason: string;
    onSelect: (value: string) => void;
    onClose: () => void;
    onReject: () => void;
    reasons: string[];
}

const RejectModal: React.FC<RejectModalProps> = ({ name, selectedReason, onSelect, onClose, onReject, reasons }) => (
    <div className="fixed inset-0 bg-neutral-600/75 z-50 flex items-center justify-center">
        <div className="bg-white max-w-2xl w-full rounded-xl p-6 shadow-lg relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-black" onClick={onClose}>✕</button>
            <h2 className="text-lg font-semibold mb-2 text-center">Rigetto Proctor per Some course title here - {name} | IdCert ID here!</h2>
            <p className="text-center text-sm text-gray-600 mb-4">
                Motivazione del rigetto Il Proctor conferma il rigetto del candidato per una delle seguenti ragioni selezionabili nel menu a tendina.
                La motivazione deve essere documentata e conforme alle linee guida di certificazione.
            </p>
            <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Motivi di rigetto</label>
                <select
                    value={selectedReason}
                    onChange={(e) => onSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2"
                >
                    {reasons.map((reason, idx) => (
                        <option key={idx} value={reason}>{reason}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-center">
                <button
                    className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
                    disabled={selectedReason === reasons[0]}
                    onClick={onReject}
                >
                    Rigetta il discente
                </button>
            </div>
        </div>
    </div>
);

export default RejectModal;
