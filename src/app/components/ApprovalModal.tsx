import React from "react";

interface ApprovalModalProps {
    name: string;
    onClose: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ name, onClose }) => (
    <div className="fixed inset-0 bg-neutral-600/75 z-50 flex items-center justify-center">
        <div className="bg-white max-w-2xl w-full rounded-xl p-6 shadow-lg relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-black" onClick={onClose}>✕</button>
            <h2 className="text-lg font-semibold mb-4 text-center">{name}, Some course title here | IdCert ID here!</h2>
            <div className="text-sm text-gray-700 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                    <label className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <div className="flex flex-col">
                            <p className="font-bold">Dichiarazione di assenza di conflitto</p>
                            <p>Il Proctor dichiara e conferma di non avere conflitti di interesse...</p>
                        </div>
                    </label>
                </div>
                <div>
                    <label className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <div className="flex flex-col">
                            <p className="font-bold">Verifica dell'identità completata</p>
                            <p>Il Proctor conferma di aver verificato l'identità del candidato...</p>
                        </div>
                    </label>
                </div>
            </div>
            <div className="mt-6 flex justify-center">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={onClose}>
                    Approva il Discente
                </button>
            </div>
        </div>
    </div>
);

export default ApprovalModal;
