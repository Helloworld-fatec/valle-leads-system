const API_URL = "http://localhost:3000";

export async function updateName(name: string) {
    const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });

    if (!res.ok) throw new Error("Erro ao atualizar nome");
    return res.json();
}

export async function updatePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
) {
    const res = await fetch(`${API_URL}/users/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
        }),
    });

    if (!res.ok) throw new Error("Erro ao atualizar senha");
}