import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast, Toaster } from 'react-hot-toast';

const CustomerManager = () => {
    const [customers, setCustomers] = useState([]);
    
    // Default date today
    const today = new Date().toISOString().split('T')[0];

    const [newCustomer, setNewCustomer] = useState({
        date: today,
        company: '',
        name: '',
        contact: '',
        email: '',
        purpose: '',
        status: 'Active',
        remarks: ''
    });

    // --- 🔒 SECURITY CHECK ---
    const userRole = localStorage.getItem('role');
    const isReadOnly = userRole === 'Tech'; 
    // -------------------------

    const BASE_API_URL = "https://my-crm-backend-a5q4.onrender.com";
    const API_URL = `${BASE_API_URL}/api/customers/`;

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error("Unauthorized: User not logged in."); 
        }
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get(API_URL, headers);
            setCustomers(response.data);
        } catch (error) {
            console.error("Fetch error:", error);
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Failed to load customers.";
            toast.error(message);
        }
    };

    // 👇👇👇 NEW FUNCTION: DIRECT STATUS UPDATE 👇👇👇
    const handleStatusUpdate = async (id, newStatus) => {
        // Optimistic Update (Turant UI change karega)
        const originalCustomers = [...customers];
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));

        try {
            const headers = getAuthHeaders();
            // Backend call
            await axios.patch(`${API_URL}${id}/`, { status: newStatus }, headers);
            toast.success(`Status updated to ${newStatus}!`);
        } catch (error) {
            // Agar fail hua to wapas purana wala set karega
            setCustomers(originalCustomers);
            toast.error("Status update failed!");
        }
    };
    // 👆👆👆

    const handleSave = async () => {
        if (!newCustomer.company.trim()) {
            toast.error("Company Name is Required!");
            return;
        }
        try {
            const headers = getAuthHeaders();
            const response = await axios.post(API_URL, newCustomer, headers);
            setCustomers(prev => [...prev, response.data]);
            setNewCustomer({
                date: today,
                company: '', name: '', contact: '', email: '', purpose: '', status: 'Active', remarks: ''
            });
            toast.success("Customer Added Successfully!");
        } catch (error) {
            console.error("Save error:", error.response?.data);
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Error adding customer.";
            toast.error(message);
        }
    };

    const confirmDelete = async (id) => {
        try {
            const headers = getAuthHeaders();
            await axios.delete(`${API_URL}${id}/`, headers);
            setCustomers(prev => prev.filter(c => c.id !== id));
            toast.success("Customer Deleted!", { icon: 'Success' });
        } catch (error) {
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Delete failed.";
            toast.error(message);
        }
    };

    const handleDeleteTrigger = (id) => {
        toast((t) => (
            <div style={{ padding: '15px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 15px', color: '#fff', fontWeight: 'bold' }}>
                    Delete this customer?
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
            style: { background: '#1a1a1a', border: '2px solid #ff4444' }
        });
    };

    const handleInputChange = (e) => {
        setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
    };

    const handleExport = () => {
        if (customers.length === 0) {
            toast.error("No customers to export!");
            return;
        }

        const exportData = customers.map(c => ({
            'Date': c.date,
            'Company': c.company,
            'Name': c.name,
            'Contact': c.contact,
            'Email': c.email,
            'Purpose': c.purpose,
            'Status': c.status
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 12 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Customers");
        XLSX.writeFile(wb, "Customer_List.xlsx");

        toast.success("Excel exported successfully!");
    };

    const styles = {
        container: { background: '#1a1a1a', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #333', color: '#e0e0e0', minHeight: '80vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
        title: { fontSize: '26px', fontWeight: 'bold', background: 'linear-gradient(90deg, #00ffcc, #0095ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        btnPrimary: { background: 'linear-gradient(45deg, #00ffcc, #0088ff)', border: 'none', padding: '12px 24px', color: '#000', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' },
        btnSuccess: { background: 'linear-gradient(45deg, #11998e, #38ef7d)', border: 'none', padding: '12px 24px', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', marginLeft: '12px' },
        tableContainer: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #333', marginTop: '10px' },
        table: { width: '100%', borderCollapse: 'collapse', minWidth: '1300px' },
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
                    <h1 style={styles.title}>Customer Manager (Sales)</h1>
                    <div>
                        {!isReadOnly && (
                            <button style={styles.btnPrimary} onClick={handleSave}>+ Add Customer</button>
                        )}
                        <button style={styles.btnSuccess} onClick={handleExport}>Export Excel</button>
                    </div>
                </div>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Company</th>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Contact</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Purpose</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!isReadOnly && (
                                <tr style={{ background: '#2a2a2a' }}>
                                    <td style={styles.td}><input type="date" name="date" value={newCustomer.date} onChange={handleInputChange} style={styles.input} /></td>
                                    <td style={styles.td}><input type="text" name="company" value={newCustomer.company} onChange={handleInputChange} placeholder="Company" style={styles.input} /></td>
                                    <td style={styles.td}><input type="text" name="name" value={newCustomer.name} onChange={handleInputChange} placeholder="Name" style={styles.input} /></td>
                                    <td style={styles.td}><input type="text" name="contact" value={newCustomer.contact} onChange={handleInputChange} placeholder="Phone" style={styles.input} /></td>
                                    <td style={styles.td}><input type="text" name="email" value={newCustomer.email} onChange={handleInputChange} placeholder="Email" style={styles.input} /></td>
                                    <td style={styles.td}><input type="text" name="purpose" value={newCustomer.purpose} onChange={handleInputChange} placeholder="Purpose" style={styles.input} /></td>
                                    <td style={styles.td}>
                                        <select name="status" value={newCustomer.status} onChange={handleInputChange} style={styles.select}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </td>
                                    <td style={styles.td}>✨</td>
                                </tr>
                            )}

                            {customers.map((c) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #222' }} className="hover-row">
                                    <td style={styles.td}>{c.date}</td>
                                    <td style={{...styles.td, color: '#fff', fontWeight: 'bold'}}>{c.company}</td>
                                    <td style={styles.td}>{c.name}</td>
                                    <td style={{...styles.td, color: '#00ffcc'}}>{c.contact}</td>
                                    <td style={styles.td}>{c.email}</td>
                                    <td style={styles.td}>{c.purpose}</td>
                                    
                                    {/* 👇👇👇 EDITED: AB YE EDITABLE DROPDOWN HAI 👇👇👇 */}
                                    <td style={styles.td}>
                                        {!isReadOnly ? (
                                            <select
                                                value={c.status}
                                                onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                                                style={{
                                                    background: c.status === 'Active' ? '#28a745' : '#ff4444',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    outline: 'none',
                                                    cursor: 'pointer',
                                                    // Dropdown arrow hide karne ka try (Cleaner look ke liye)
                                                    appearance: 'none',
                                                    WebkitAppearance: 'none',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <option value="Active" style={{background: '#333'}}>Active</option>
                                                <option value="Inactive" style={{background: '#333'}}>Inactive</option>
                                            </select>
                                        ) : (
                                            // Tech walo ke liye sirf badge dikhega
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                background: c.status === 'Active' ? '#28a745' : '#ff4444',
                                                color: '#fff'
                                            }}>
                                                {c.status}
                                            </span>
                                        )}
                                    </td>
                                    {/* 👆👆👆 CHANGE END 👆👆👆 */}

                                    <td style={styles.td}>
                                        {!isReadOnly ? (
                                            <button onClick={() => handleDeleteTrigger(c.id)} style={styles.deleteBtn}>
                                                Delete
                                            </button>
                                        ) : (
                                            <span style={{fontSize: '16px', opacity: 0.5, cursor: 'not-allowed'}} title="Read Only">🔒</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                tr.hover-row:hover { background-color: #252525 !important; }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
            `}</style>
        </>
    );
};

export default CustomerManager;