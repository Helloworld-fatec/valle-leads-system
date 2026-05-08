import { useApi } from "./api";

export const useNegotiationsService = () => {
    const {apiFetch} = useApi();

    const getNegotiations = async (attendantId: string) => {
        const res = await apiFetch(`/negotiations?attendant_id=${attendantId}`);
        return res.json();
    };

    const getNegotiationsById = async (id: string) => {
        const res = await apiFetch(`/negotiations/${id}`);
        return res.json();
    };

    const getStatusHistory = async (id: string) => {
        const res = await apiFetch(`/negotiations/${id}/status-history`);
        return res.json();
    };

    const getStageHistory = async (id: string) => {
        const res = await apiFetch(`/negotiations/${id}/stage-history`);
        return res.json();
    };

    const getImportance = async (id: string) => {
        const res = await apiFetch(`/negotiations/${id}/importance`);
        return res.json();
    };

    const createStageHistory = async (
        id: string,
        body: {old_status: string | null; new_status: string; notes?: string; userId?: string}
    ) => {
        const res = await apiFetch(`/negotiations/${id}/stage-history`, {
            method: "POST",
            body: JSON.stringify(body),
        });
        return res.json();
    };
    
    return {
        getNegotiations,
        getNegotiationsById,
        getStatusHistory,
        getStageHistory,
        getImportance,
        createStageHistory,
    };
};