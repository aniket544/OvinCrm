import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; 
import { toast, Toaster } from 'react-hot-toast'; 

const TenderSubmission = () => {
    const [tenders, setTenders] = useState([]);
    const [newTender, setNewTender] = useState({
        date: '', company: '', bid_no: '', item: '', start_date: '', end_date: '', status: 'Draft'
    });

    // --- 🔒 SECURITY CHECK (Added) ---
    // Agar banda Sales team se hai, toh wo Tenders ko Edit/Delete nahi kar sakta
    const userRole = localStorage.getItem('role');
    const isReadOnly = userRole === 'Sales'; 
    // ---------------------------------

    // ✅ FIXED URLS
    const BASE_API_URL = "https://my-crm-backend-a5q4.onrender.com";
    const API_URL = `${BASE_API_URL}/api/tenders/`; 

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error("Unauthorized: User not logged in."); 
        }
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        fetchTenders();
    }, []);

    const fetchTenders = async () => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get(API_URL, headers);
            setTenders(response.data);
        } catch (error) {
            console.error("Fetch error:", error);
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Failed to load tenders.";
            toast.error(message);
        }
    };

    const handleSave = async () => {
        if (!newTender.bid_no?.trim()) {
            toast.error("Bid Number is Required!", { style: { background: '#333', color: '#ff0055' } });
            return;
        }

        try {
            const headers = getAuthHeaders();
            const response = await axios.post(API_URL, newTender, headers);
            setTenders(prev => [...prev, response.data]);
            setNewTender({ date: '', company: '', bid_no: '', item: '', start_date: '', end_date: '', status: 'Draft' });
            toast.success("Tender Saved Successfully!", { icon: 'Success', style: { background: '#333', color: '#00ffcc' } });
        } catch (error) {
            console.error(error.response?.data);
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Error saving tender!";
            toast.error(message);
        }
    };

    // DELETE WITH CONFIRMATION
    const confirmDelete = async (id) => {
        try {
            const headers = getAuthHeaders();
            await axios.delete(`${API_URL}${id}/`, headers);
            setTenders(prev => prev.filter(t => t.id !== id));
            toast.success("Tender Deleted!", { icon: 'Success' });
        } catch (error) {
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Delete failed.";
            toast.error(message);
        }
    };

    const handleDeleteTrigger = (id) => {
        toast((t) => (
            <div style={{ padding: '15px', textAlign: 'center', fontFamily: 'system-ui' }}>
                <p style={{ margin: '0 0 15px', color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>
                  Delete This Tender?
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        onClick={() => {
                            confirmDelete(id);
                            toast.dismiss(t.id);
                        }}
                        style={{
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                            background: '#444',
                            color: '#fff',
                            border: '1px solid #666',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel 
                    </button>
                </div>
            </div>
        ), {
            duration: 10000,
            style: { background: '#1a1a1a', border: '2px solid #ff4444', color: '#fff' }
        });
    };

    const handleInputChange = (e) => {
        setNewTender({ ...newTender, [e.target.name]: e.target.value });
    };

    const handleExport = () => {
        if (tenders.length === 0) {
            toast.error("No tenders to export.");
            return;
        }
        
        const exportData = tenders.map(t => ({
            'Date': t.date || '-',
            'Company': t.company || '-',
            'Bid No.': t.bid_no,
            'Item': t.item || '-',
            'Start Date': t.start_date || '-',
            'End Date': t.end_date || '-',
            'Status': t.status
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 18 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tenders");
        const today = new Date().toLocaleDateString('en-IN').replace(/\//g, '-');
        XLSX.writeFile(wb, `Tender_List_${today}.xlsx`);

        toast.success("Excel exported successfully!");
    };

    // STYLES
    const styles = {
        container: { background: '#1a1a1a', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #333', color: '#e0e0e0', minHeight: '80vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
        title: { fontSize: '26px', fontWeight: 'bold', background: 'linear-gradient(90deg, #00ffcc, #0099ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        btnPrimary: { background: 'linear-gradient(45deg, #00ffcc, #0088ff)', border: 'none', padding: '12px 24px', color: '#000', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
        btnSuccess: { background: 'linear-gradient(45deg, #11998e, #38ef7d)', border: 'none', padding: '12px 24px', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', marginLeft: '12px', fontSize: '15px' },
        tableContainer: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #333', marginTop: '10px' },
        table: { width: '100%', borderCollapse: 'collapse', minWidth: '1100px' },
        th: { background: '#252525', color: '#00ffcc', padding: '16px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase', borderBottom: '2px solid #00ffcc', letterSpacing: '1px' },
        td: { padding: '14px 16px', borderBottom: '1px solid #333', color: '#bbb', fontSize: '14px' },
        input: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none', fontSize: '14px' },
        select: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none', fontSize: '14px' },
        deleteBtn: { background: 'transparent', border: '1.5px solid #ff4444', color: '#ff4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.3s' }
    };

    // Helper function for row styling
    const getTenderStatusColor = (endDate, status) => {
        if (status === 'Won') return { backgroundColor: 'rgba(39, 174, 96, 0.2)', borderLeft: '3px solid #28a745' };
        if (status === 'Lost') return { backgroundColor: 'rgba(255, 68, 68, 0.2)', borderLeft: '3px solid #ff4444' };
        if (!endDate) return {};

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);

        if (end < today) {
            return { backgroundColor: 'rgba(255, 165, 0, 0.2)', borderLeft: '3px solid #ffbb33' }; // Expired/Passed
        }
        return {};
    }

    return (
        <>
            <Toaster 
                position="top-right" 
                toastOptions={{
                    duration: 5000,
                    style: { background: '#333', color: '#fff', fontFamily: 'system-ui' }
                }} 
            />

            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Tender Submission</h1>
                    <div>
                        {/* 👇 SECURITY: Hide Save Button for Sales */}
                        {!isReadOnly && (
                            <button style={styles.btnPrimary} onClick={handleSave}>+ New Bid</button>
                        )}
                        {/* 👆 End Security Check */}
                        <button style={styles.btnSuccess} onClick={handleExport}>Export Excel</button>
                    </div>
                </div>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Company</th>
                                <th style={styles.th}>Bid No.</th>
                                <th style={styles.th}>Item Description</th>
                                <th style={styles.th}>Start Date</th>
                                <th style={styles.th}>End Date</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 👇 SECURITY: Hide Input Row for Sales */}
                            {!isReadOnly && (
                                <tr style={{ background: '#2a2a2a' }}>
                                    <td style={styles.td}><input type="date" name="date" value={newTender.date} onChange={handleInputChange} style={styles.input} /></td>
                                    <td style={styles.td}><input type="text" name="company" value={newTender.company} onChange={handleInputChange} placeholder="Company Name" style={styles.input} /></td>
                                    <td style={styles.td}><input type="text" name="bid_no" value={newTender.bid_no} onChange={handleInputChange} placeholder="BID-001" style={styles.input} /></td>
                                    <td style={styles.td}><input type="text" name="item" value={newTender.item} onChange={handleInputChange} placeholder="Item Description" style={styles.input} /></td>
                                    <td style={styles.td}><input type="date" name="start_date" value={newTender.start_date} onChange={handleInputChange} style={styles.input} /></td>
                                    <td style={styles.td}><input type="date" name="end_date" value={newTender.end_date} onChange={handleInputChange} style={styles.input} /></td>
                                    <td style={styles.td}>
                                        <select name="status" value={newTender.status} onChange={handleInputChange} style={styles.select}>
                                            <option value="Draft">Draft</option>
                                            <option value="Submitted">Submitted</option>
                                            <option value="Won">Won</option>
                                            <option value="Lost">Lost</option>
                                        </select>
                                    </td>
                                    <td style={styles.td}></td>
                                </tr>
                            )}
                            {/* 👆 End Security Check */}

                            {/* Existing Tenders */}
                            {tenders.map((t) => (
                                <tr key={t.id} className="hover-row" style={getTenderStatusColor(t.end_date, t.status)}>
                                    <td style={styles.td}>{t.date || '-'}</td>
                                    <td style={{...styles.td, color: '#fff', fontWeight: 'bold'}}>{t.company}</td>
                                    <td style={{...styles.td, color: '#00ffcc', fontWeight: 'bold'}}>{t.bid_no}</td>
                                    <td style={styles.td}>{t.item || '-'}</td>
                                    <td style={styles.td}>{t.start_date || '-'}</td>
                                    <td style={styles.td}>{t.end_date || '-'}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            background: t.status === 'Won' ? '#28a745' : 
                                                            t.status === 'Lost' ? '#ff4444' : 
                                                            t.status === 'Submitted' ? '#007bff' : '#666',
                                            color: '#fff'
                                        }}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {/* 👇 SECURITY: Hide Delete Button for Sales */}
                                        {!isReadOnly ? (
                                            <button 
                                                onClick={() => handleDeleteTrigger(t.id)} 
                                                style={styles.deleteBtn}
                                                onMouseOver={(e) => e.target.style.background = '#ff444430'}
                                                onMouseOut={(e) => e.target.style.background = 'transparent'}
                                            >
                                                Delete
                                            </button>
                                        ) : (
                                            <span style={{fontSize: '16px', opacity: 0.5, cursor: 'not-allowed'}} title="Read Only">🔒</span>
                                        )}
                                        {/* 👆 End Security Check */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                .hover-row:hover {
                    background-color: #252525 !important;
                    transition: background 0.3s;
                }
                input:focus, select:focus {
                    border-color: #00ffcc !important;
                    box-shadow: 0 0 10px rgba(0, 255, 204, 0.5) !important;
                }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
                ::-webkit-scrollbar {
                    width: 8px; height: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #111;
                }
                ::-webkit-scrollbar-thumb {
                    background: #444;
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #666;
                }
            `}</style>
        </>
    );
};

export default TenderSubmission;