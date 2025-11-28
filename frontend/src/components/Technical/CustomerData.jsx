import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast, Toaster } from 'react-hot-toast';   // Toaster added

const CustomerData = () => {
    const [data, setData] = useState([]);
    const [newData, setNewData] = useState({
        company: '', machine: '', serial: '', warranty: '', service_due: '', status: 'Active'
    });

    const API_URL = 'https://my-crm-backend.onrender.com/tech-data';

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
            console.error("Fetch error:", error);
            toast.error("Failed to load data");
        }
    };

    const handleSave = async () => {
        if (!newData.company.trim()) {
            toast.error("Company Name Required!");
            return;
        }
        try {
            const response = await axios.post(API_URL, newData, getAuthHeaders());
            setData(prev => [...prev, response.data]);
            setNewData({ company: '', machine: '', serial: '', warranty: '', service_due: '', status: 'Active' });
            toast.success("Technical Data Saved!");
        } catch (error) {
            console.error(error.response?.data);
            toast.error("Error saving data");
        }
    };

    // DELETE WITH CONFIRMATION
    const confirmDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}${id}/`, getAuthHeaders());
            setData(prev => prev.filter(d => d.id !== id));
            toast.success("Record Deleted!", { icon: 'Success' });
        } catch (error) {
            toast.error("Delete failed!");
        }
    };

    const handleDeleteTrigger = (id) => {
        toast((t) => (
            <div style={{ padding: '15px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 15px', color: '#fff', fontWeight: 'bold' }}>
                    Permanently delete this record?
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
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
                        Yes, Delete
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
            style: { background: '#1a1a1a', border: '2px solid #ff4444' }
        });
    };

    const handleInputChange = (e) => {
        setNewData({ ...newData, [e.target.name]: e.target.value });
    };

    const handleExport = () => {
        if (data.length === 0) {
            toast.error("No data to export!");
            return;
        }

        const exportData = data.map(d => ({
            'Company': d.company,
            'Machine': d.machine,
            'Serial No.': d.serial,
            'Warranty Expiry': d.warranty || '-',
            'Service Due': d.service_due || '-',
            'Status': d.status
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        ws['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Customer_Data");
        XLSX.writeFile(wb, "Technical_Customer_Data.xlsx");

        toast.success("Excel exported!");
    };

    const styles = {
        container: { background: '#1a1a1a', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #333', color: '#e0e0e0', minHeight: '80vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
        title: { fontSize: '26px', fontWeight: 'bold', background: 'linear-gradient(90deg, #00ffcc, #0095ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        btnPrimary: { background: 'linear-gradient(45deg, #00ffcc, #0088ff)', border: 'none', padding: '12px 24px', color: '#000', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' },
        btnSuccess: { background: 'linear-gradient(45deg, #11998e, #38ef7d)', border: 'none', padding: '12px 24px', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', marginLeft: '12px' },
        tableContainer: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #333', marginTop: '10px' },
        table: { width: '100%', borderCollapse: 'collapse', minWidth: '1100px' },
        th: { background: '#252525', color: '#00ffcc', padding: '16px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase', borderBottom: '2px solid #00ffcc' },
        td: { padding: '14px 16px', borderBottom: '1px solid #333', color: '#bbb', fontSize: '14px' },
        input: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none' },
        select: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none' },
        deleteBtn: { background: 'transparent', border: '1.5px solid #ff4444', color: '#ff4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }
    };

    return (
        <>
            <Toaster position="top-right" toastOptions={{ duration: 5000 }} />

            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Technical Customer Data</h1>
                    <div>
                        <button style={styles.btnPrimary} onClick={handleSave}>+ Add Record</button>
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
                                <td style={styles.td}></td>
                            </tr>

                            {data.map((d) => (
                                <tr key={d.id}>
                                    <td style={{...styles.td, color: '#fff', fontWeight: 'bold'}}>{d.company}</td>
                                    <td style={styles.td}>{d.machine || '-'}</td>
                                    <td style={{...styles.td, color: '#00ffcc', fontWeight: 'bold'}}>{d.serial}</td>
                                    <td style={styles.td}>{d.warranty || '-'}</td>
                                    <td style={styles.td}>{d.service_due || '-'}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            background: d.status === 'Active' ? '#28a745' : 
                                                       d.status === 'Expired' ? '#ff4444' : '#ffbb33',
                                            color: '#fff'
                                        }}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button onClick={() => handleDeleteTrigger(d.id)} style={styles.deleteBtn}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
                tr:hover { background-color: #252525 !important; }
            `}</style>
        </>
    );
};

export default CustomerData;