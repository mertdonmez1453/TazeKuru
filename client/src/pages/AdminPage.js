import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

function AdminPage() {
    const [applications, setApplications] = useState([]);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") navigate("/");

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        const data = await api.admin.getApplications();
        setApplications(data);
    };

    const handleApprove = async (id) => {
        await api.admin.approve(id);
        alert("Satıcı onaylandı!");
        loadApplications();
    };

    const handleUnapprove = async (id) => {
        // ✅ confirm satırını sildik
        await api.admin.unapprove(id);
        alert("Onay kaldırıldı!");
        loadApplications();
    };

    const handleReject = async (id) => {
        // ✅ confirm satırını sildik
        await api.admin.reject(id);
        alert("Başvuru silindi!");
        loadApplications();
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">📊 Admin Panel</h1>

            <h2 className="text-xl font-bold mb-3">📌 Satıcı Başvuruları</h2>

            {applications.length === 0 ? (
                <p className="text-gray-500">Hiç başvuru yok.</p>
            ) : (
                <div className="space-y-4">
                    {applications.map(app => (
                        <div
                            key={app.application_id}
                            className={`p-4 border rounded-lg shadow flex justify-between ${app.is_seller_approved === 1
                                ? 'bg-emerald-50 border-emerald-300'
                                : 'bg-white'
                                }`}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold">
                                        {app.first_name} {app.last_name}
                                    </p>
                                    {app.is_seller_approved === 1 && (
                                        <span className="px-2 py-1 bg-emerald-500 text-white text-xs rounded-full">
                                            ✓ Onaylı
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600">{app.email}</p>
                                <p className="text-sm text-gray-500">
                                    Başvuru ID: {app.application_id}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {app.is_seller_approved === 0 ? (
                                    <button
                                        onClick={() => handleApprove(app.application_id)}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                                    >
                                        ✓ Onayla
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUnapprove(app.application_id)}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                                    >
                                        ✗ Onayı Kaldır
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminPage;