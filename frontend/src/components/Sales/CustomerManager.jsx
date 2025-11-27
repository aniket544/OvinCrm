import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

const CustomerData = () => {
    const [data, setData] = useState([]);
    const [newData, setNewData] = useState({
        company: '', machine: '', serial: '', warranty: '', service_due: '', status: 'Active'
    });

    const API_URL = 'https://my-crm-backend.onrender.com'; // TECHNICAL API URL
    // const API_URL = 'http://

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeaders());
            setData(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!newData.company) {
            toast.error("Company Name Required!");
            return;
        }
        try {
            const response = await axios.post(API_URL, newData, getAuthHeaders());
            setData([...data, response.data]);
            setNewData({ company: '', machine: '', serial: '', warranty: '', service_due: '', status: 'Active' });
            toast.success("Technical Data Saved!");
        } catch (error) {
            toast.error("Error saving data");
        }
    };

    // --- DELETE LOGIC (UPDATED WITH TOAST CONFIRMATION) ---
    
    // 1. Final API call
    const confirmDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}${id}/`, getAuthHeaders());
            setData(data.filter(d => d.id !== id));
            toast.success("Deleted!", { icon: '🗑️' });
        } catch (error) {
            toast.error("Error deleting");
        }
    };
    
    // 2. Trigger Function (Shows the custom toast popup)
    const handleDeleteTrigger = (id) => {
        toast((t) => (
            <div style={{ color: '#fff' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                    🗑️ Permanently delete this Technical Record?
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={() => { confirmDelete(id); toast.dismiss(t.id); }}
                        style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Delete
                    </button>
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        style={{ background: '#444', border: '1px solid #555', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { style: { background: '#1a1a1a', border: '1px solid #ff4444' }, duration: 4000 });
    };
    // ----------------------------------------

    const handleInputChange = (e) => setNewData({ ...newData, [e.target.name]: e.target.value });

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tech_Data");
        XLSX.writeFile(wb, "Technical_Customer_Data.xlsx");
    };

    // --- STYLES (Blue Theme) ---
    const styles = {
        container: { background: '#1a1a1a', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #333', color: '#e0e0e0', minHeight: '80vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
        title: { fontSize: '24px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', background: 'linear-gradient(90deg, #00ffcc, #0095ffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        btnPrimary: { background: 'linear-gradient(45deg, #00ffcc, #0088ffff)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer' },
        btnSuccess: { background: 'linear-gradient(45deg, #00ffcc, #38ef7d)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' },
        tableContainer: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #333' },
        table: { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' },
        th: { background: '#252525', color: '#00ffcc', padding: '15px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #00ffcc' },
        td: { padding: '12px 15px', borderBottom: '1px solid #333', color: '#bbb', fontSize: '14px' },
        input: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
        select: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
        deleteBtn: { background: 'none', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.title}>Technical Customer Data</div>
                <div>
                    <button style={styles.btnPrimary} onClick={handleSave}>+ Add Data</button>
                    <button style={styles.btnSuccess} onClick={handleExport}>Export Excel</button>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Company Name</th>
                            <th style={styles.th}>Machine Type</th>
                            <th style={styles.th}>Serial No.</th>
                            <th style={styles.th}>Warranty Exp.</th>
                            <th style={styles.th}>Service Due</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ background: '#2a2a2a' }}>
                            <td style={styles.td}><input type="text" name="company" value={newData.company} onChange={handleInputChange} placeholder="Company" style={styles.input} /></td>
                            <td style={styles.td}><input type="text" name="machine" value={newData.machine} onChange={handleInputChange} placeholder="Machine" style={styles.input} /></td>
                            <td style={styles.td}><input type="text" name="serial" value={newData.serial} onChange={handleInputChange} placeholder="SN-000" style={styles.input} /></td>
                            <td style={styles.td}><input type="date" name="warranty" value={newData.warranty} onChange={handleInputChange} style={styles.input} /></td>
                            <td style={styles.td}><input type="date" name="service_due" value={newData.service_due} onChange={handleInputChange} style={styles.input} /></td>
                            <td style={styles.td}>
                                <select name="status" value={newData.status} onChange={handleInputChange} style={styles.select}>
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Servicing">Servicing</option>
                                </select>
                            </td>
                            <td style={styles.td} className="text-center">🛠️</td>
                        </tr>

                        {data.map((d) => (
                            <tr key={d.id} style={{ borderBottom: '1px solid #222' }}>
                                <td style={{...styles.td, color: '#fff', fontWeight: 'bold'}}>{d.company}</td>
                                <td style={styles.td}>{d.machine}</td>
                                <td style={{...styles.td, color: '#00ffcc'}}>{d.serial}</td>
                                <td style={styles.td}>{d.warranty}</td>
                                <td style={styles.td}>{d.service_due}</td>
                                <td style={styles.td}>
                                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', background: d.status === 'Active' ? '#28a745' : d.status === 'Expired' ? '#ff4444' : '#ffbb33', color: '#fff' }}>
                                        {d.status}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    {/* Updated to call the Trigger function */}
                                    <button onClick={() => handleDeleteTrigger(d.id)} style={styles.deleteBtn}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {/* DATE PICKER FIX */}
            <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default CustomerData;