import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const today = new Date().toISOString().split('T')[0];

    // --- 🔒 SECURITY CHECK ---
    const userRole = localStorage.getItem('role');
    const isReadOnly = userRole === 'Sales'; // Sales wale edit nahi kar payenge
    // -------------------------

    const [newTask, setNewTask] = useState({
        date: today, 
        company_name: '', client_name: '', client_id: '', gem_id: '', gem_password: '',
        task_name: '', 
        priority: 'Medium',
        status: 'Pending'
    });

    const API_URL = 'https://my-crm-backend-a5q4.onrender.com/api/tasks/';

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeaders());
            // Sorting Logic
            const sortedTasks = response.data.sort((a, b) => {
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            setTasks(sortedTasks);
        } catch (error) { 
            console.error("Error fetching tasks:", error);
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Failed to load tasks.";
            toast.error(message);
        }
    };

    // 👇👇👇 STATUS UPDATE FUNCTION 👇👇👇
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const headers = getAuthHeaders();
            await axios.patch(`${API_URL}${id}/`, { status: newStatus }, headers);
            
            // Optimistic UI Update
            setTasks(prevTasks => prevTasks.map(t => 
                t.id === id ? { ...t, status: newStatus } : t
            ));
            
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update status.");
        }
    };
    // 👆👆👆

    const handleSave = async () => {
        if (!newTask.company_name) { toast.error("Company Name is Required!"); return; }
        try {
            const response = await axios.post(API_URL, newTask, getAuthHeaders());
            const newTasks = [...tasks, response.data];
            const sortedTasks = newTasks.sort((a, b) => {
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            setTasks(sortedTasks);

            setNewTask({ date: today, company_name: '', client_name: '', client_id: '', gem_id: '', gem_password: '', task_name: '', priority: 'Medium', status: 'Pending' });
            toast.success("Task Added Successfully!", { icon: '📌' });
        } catch (error) { 
            toast.error("Failed to save task."); 
        }
    };

    const handleDelete = async (id) => {
        toast(
            (t) => (
                <div style={{ padding: "10px" }}>
                    <p style={{ marginBottom: "10px", color: "#fff" }}>Are you sure you want to delete?</p>
                    <button
                        style={{ background: "red", color: "white", padding: "5px 10px", borderRadius: "5px", marginRight: "10px", border: "none", cursor: "pointer" }}
                        onClick={async () => {
                            try {
                                await axios.delete(`${API_URL}${id}/`, getAuthHeaders());
                                setTasks(tasks.filter((t) => t.id !== id));
                                toast.success("Deleted Successfully! 🗑️");
                            } catch (error) { toast.error("Delete failed."); }
                            toast.dismiss(t.id);
                        }}
                    >Yes</button>
                    <button style={{ background: "#333", color: "white", padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer" }} onClick={() => toast.dismiss(t.id)}>No</button>
                </div>
            ),
            { duration: 5000, style: { background: "#1a1a1a", color: "#fff", border: "1px solid #333" } }
        );
    };

    const handleInputChange = (e) => setNewTask({ ...newTask, [e.target.name]: e.target.value });

    const handleExport = () => {
        if (tasks.length === 0) { toast.error("No tasks to export."); return; }
        const ws = XLSX.utils.json_to_sheet(tasks);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tasks");
        XLSX.writeFile(wb, "Task_Manager.xlsx");
        toast.success("Excel exported successfully!");
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': return { color: '#ff4444', fontWeight: 'bold' };
            case 'Medium': return { color: '#ffbb33', fontWeight: 'bold' };
            case 'Low': return { color: '#00c3ff', fontWeight: 'bold' };
            default: return { color: '#bbb' };
        }
    };

    // Styles
    const styles = {
        container: { background: '#1a1a1a', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #333', color: '#e0e0e0', minHeight: '80vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
        title: { fontSize: '24px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', background: 'linear-gradient(90deg, #00ffcc, #00b3ffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        btnPrimary: { background: 'linear-gradient(45deg, #00ffcc, #007bffff)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer' },
        btnSuccess: { background: 'linear-gradient(45deg, #11998e, #38ef7d)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' },
        tableContainer: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #333' },
        table: { width: '100%', borderCollapse: 'collapse', minWidth: '1600px' },
        th: { background: '#252525', color: '#00ffcc', padding: '15px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #00ffcc', whiteSpace: 'nowrap' },
        td: { padding: '12px 15px', borderBottom: '1px solid #333', color: '#bbb', fontSize: '14px' },
        input: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
        select: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
        statusSelect: { background: '#111', border: '1px solid #00ffcc', color: '#fff', padding: '5px', borderRadius: '4px', outline: 'none', fontSize: '13px', cursor: 'pointer' },
        deleteBtn: { background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.title}>Task Manager (Technical)</div>
                <div>
                    {!isReadOnly && <button style={styles.btnPrimary} onClick={handleSave}>+ Add Task</button>}
                    <button style={styles.btnSuccess} onClick={handleExport}>Export Excel</button>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Company Name</th>
                            <th style={styles.th}>Client Name</th>
                            <th style={styles.th}>Client ID</th>
                            <th style={styles.th}>Gem ID</th>
                            <th style={styles.th}>Gem Password</th>
                            <th style={styles.th}>Task / Work</th>
                            <th style={styles.th}>Priority</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {!isReadOnly && (
                            <tr style={{ background: '#2a2a2a' }}>
                                <td style={styles.td}><input type="text" value={newTask.date} readOnly style={{...styles.input, color: '#00ffcc', fontWeight: 'bold', cursor: 'not-allowed'}} /></td>
                                <td style={styles.td}><input type="text" name="company_name" value={newTask.company_name} onChange={handleInputChange} placeholder="Company" style={styles.input} /></td>
                                <td style={styles.td}><input type="text" name="client_name" value={newTask.client_name} onChange={handleInputChange} placeholder="Client" style={styles.input} /></td>
                                <td style={styles.td}><input type="text" name="client_id" value={newTask.client_id} onChange={handleInputChange} placeholder="ID" style={styles.input} /></td>
                                <td style={styles.td}><input type="text" name="gem_id" value={newTask.gem_id} onChange={handleInputChange} placeholder="Gem ID" style={styles.input} /></td>
                                <td style={styles.td}><input type="text" name="gem_password" value={newTask.gem_password} onChange={handleInputChange} placeholder="Password" style={styles.input} /></td>
                                <td style={styles.td}><input type="text" name="task_name" value={newTask.task_name} onChange={handleInputChange} placeholder="Task" style={styles.input} /></td>
                                <td style={styles.td}>
                                    <select name="priority" value={newTask.priority} onChange={handleInputChange} style={styles.select}>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </td>
                                <td style={styles.td}>
                                    <select name="status" value={newTask.status} onChange={handleInputChange} style={styles.select}>
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </td>
                                <td style={styles.td} className="text-center">📝</td>
                            </tr>
                        )}

                        {tasks.map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #222' }}>
                                <td style={styles.td}>{t.date}</td>
                                <td style={styles.td}>{t.company_name}</td>
                                <td style={styles.td}>{t.client_name}</td>
                                <td style={styles.td}>{t.client_id}</td>
                                <td style={styles.td}>{t.gem_id}</td>
                                <td style={styles.td}>{t.gem_password}</td>
                                <td style={{...styles.td, color: '#fff', fontWeight: 'bold'}}>{t.task_name}</td>

                                <td style={styles.td}>
                                    <span style={getPriorityStyle(t.priority)}>{t.priority}</span>
                                </td>

                                {/* 👇👇👇 STATUS LOGIC 👇👇👇 */}
                                <td style={styles.td}>
                                    {!isReadOnly ? (
                                        // Tech ke liye Dropdown
                                        <select 
                                            value={t.status} 
                                            onChange={(e) => handleStatusUpdate(t.id, e.target.value)}
                                            style={{
                                                ...styles.statusSelect,
                                                borderColor: t.status === 'Done' ? '#00C851' : t.status === 'Pending' ? '#ffbb33' : '#0099ff'
                                            }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    ) : (
                                        // Sales ke liye sirf Text
                                        <span style={{
                                            color: t.status === 'Done' ? '#00C851' : t.status === 'Pending' ? '#ffbb33' : '#0099ff',
                                            fontWeight: 'bold'
                                        }}>
                                            {t.status}
                                        </span>
                                    )}
                                </td>
                                {/* 👆👆👆 */}

                                <td style={styles.td}>
                                    {!isReadOnly ? (
                                        <button onClick={() => handleDelete(t.id)} style={styles.deleteBtn}>Delete</button>
                                    ) : (
                                        <span style={{fontSize:'16px', opacity: 0.5, cursor: 'not-allowed'}} title="Read Only">🔒</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
            `}</style>
        </div>
    );
};

export default TaskManager;