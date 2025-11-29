import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const today = new Date().toISOString().split('T')[0];

    const [newTask, setNewTask] = useState({
        // Date is sent as today's date
        date: today, 
        company_name: '', client_name: '', client_id: '', gem_id: '', gem_password: '',
        task_name: '', 
        priority: 'Medium',
        status: 'Pending'
    });

    const API_URL = 'https://my-crm-backend-a5q4.onrender.com/api/tasks/'; // TECHNICAL API URL

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeaders());
            // Sorting Logic (High Priority/Pending tasks upar)
            const sortedTasks = response.data.sort((a, b) => {
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            setTasks(sortedTasks);
        } catch (error) { console.error("Error fetching tasks:", error); }
    };

    const handleSave = async () => {
        if (!newTask.company_name) { toast.error("Company Name Required!"); return; }
        try {
            const response = await axios.post(API_URL, newTask, getAuthHeaders());
            const newTasks = [...tasks, response.data];
            const sortedTasks = newTasks.sort((a, b) => {
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            setTasks(sortedTasks);

            setNewTask({ date: today, company_name: '', client_name: '', client_id: '', gem_id: '', gem_password: '', task_name: '', priority: 'Medium', status: 'Pending' });
            toast.success("Task Added!", { icon: '📌' });
        } catch (error) { console.error("Error saving:", error.response?.data); toast.error("Error saving task"); }
    };

const handleDelete = async (id) => {
    toast(
        (t) => (
            <div style={{ padding: "10px" }}>
                <p style={{ marginBottom: "10px", color: "#fff" }}>Are you sure you want to delete?</p>
                
                <button
                    style={{
                        background: "red",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        marginRight: "10px",
                        border: "none",
                        cursor: "pointer"
                    }}
                    onClick={async () => {
                        try {
                            await axios.delete(`${API_URL}${id}/`, getAuthHeaders());
                            setTasks(tasks.filter((t) => t.id !== id));
                            toast.success("Deleted Successfully! 🗑️");
                        } catch (error) {
                            toast.error("Delete failed");
                        }
                        toast.dismiss(t.id); // close popup
                    }}
                >
                    Yes
                </button>

                <button
                    style={{
                        background: "#333",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer"
                    }}
                    onClick={() => toast.dismiss(t.id)}
                >
                    No
                </button>
            </div>
        ),
        {
            duration: 5000,
            style: {
                background: "#1a1a1a",
                color: "#fff",
                border: "1px solid #333"
            },
        }
    );
};

    const handleInputChange = (e) => setNewTask({ ...newTask, [e.target.name]: e.target.value });

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(tasks);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tasks");
        XLSX.writeFile(wb, "Task_Manager.xlsx");
    };

    // Helper function for Priority styling
    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': return { color: '#ff4444', border: '1px solid #ff4444', background: 'rgba(255, 68, 68, 0.1)' };
            case 'Medium': return { color: '#ffbb33', border: '1px solid #ffbb33', background: 'rgba(255, 187, 51, 0.1)' };
            case 'Low': return { color: '#00c3ff', border: '1px solid #00c3ff', background: 'rgba(0, 195, 255, 0.1)' };
            default: return { color: '#bbb', border: '1px solid #bbb', background: 'rgba(187, 187, 187, 0.1)' };
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
        deleteBtn: { background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.title}>Task Manager (Technical)</div>
                <div>
                    <button style={styles.btnPrimary} onClick={handleSave}>+ Add Task</button>
                    <button style={styles.btnSuccess} onClick={handleExport}>Export Excel</button>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date (Auto)</th>
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
                                    <span style={{ 
                                        color: t.priority === 'High' ? '#ff4444' : t.priority === 'Medium' ? '#ffbb33' : '#00C851',
                                        fontWeight: 'bold'
                                    }}>
                                        {t.priority}
                                    </span>
                                </td>

                                <td style={styles.td}>{t.status}</td>
                                <td style={styles.td}>
                                    <button onClick={() => handleDelete(t.id)} style={styles.deleteBtn}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator { 
                    filter: invert(1); cursor: pointer; 
                }
            `}</style>
        </div>
    );
};

export default TaskManager;