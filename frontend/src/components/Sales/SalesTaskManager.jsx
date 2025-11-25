import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

// --- MODAL Component (Internal) ---
// Separate component for clarity, uses props from SalesTaskManager
const FollowUpModal = ({ isOpen, onClose, task, updateTask, followUpData, setFollowUpData, styles }) => {
    if (!isOpen || !task) return null;

    const handleInputChange = (e) => {
        setFollowUpData({ ...followUpData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        updateTask();
    };

    // Modal Styles
    const modalStyles = {
        container: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        },
        content: {
            background: '#1a1a1a', padding: '30px', borderRadius: '10px', width: '400px', boxShadow: '0 8px 20px rgba(0,0,0,0.9)', border: '2px solid #00ffcc',
        },
        header: {
            fontSize: '20px', fontWeight: 'bold', color: '#00ffcc', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px'
        },
        formGroup: {
            marginBottom: '15px'
        },
        label: {
            display: 'block', color: '#e0e0e0', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold'
        },
        footer: {
            display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px'
        }
    };

    return (
        <div style={modalStyles.container}>
            <div style={modalStyles.content}>
                <div style={modalStyles.header}>
                    Follow-up for: {task.lead_name}
                    <span style={{float: 'right', color: '#fff', fontSize: '14px'}}>Attempt: {task.follow_up_count + 1}</span>
                </div>
                
                <div style={modalStyles.formGroup}>
                    <label style={modalStyles.label}>Next Follow Up Date</label>
                    <input 
                        type="date" 
                        name="next_follow_up" 
                        value={followUpData.next_follow_up} 
                        onChange={handleInputChange} 
                        style={styles.input} 
                    />
                </div>

                <div style={modalStyles.formGroup}>
                    <label style={modalStyles.label}>Priority</label>
                    <select name="priority" value={followUpData.priority} onChange={handleInputChange} style={styles.select}>
                        <option value="High">High 🔥</option><option value="Medium">Medium ⚠️</option><option value="Low">Low 🟢</option>
                    </select>
                </div>

                <div style={modalStyles.formGroup}>
                    <label style={modalStyles.label}>Status</label>
                    <select name="status" value={followUpData.status} onChange={handleInputChange} style={styles.select}>
                        <option>Pending</option><option>Done</option><option>Rescheduled</option>
                    </select>
                </div>
                
                <div style={modalStyles.formGroup}>
                    <label style={modalStyles.label}>Remarks</label>
                    <textarea 
                        name="remarks" 
                        value={followUpData.remarks} 
                        onChange={handleInputChange} 
                        placeholder="Add new remarks..." 
                        style={{ ...styles.input, height: '60px' }} 
                    />
                </div>

                <div style={modalStyles.footer}>
                    <button style={{ ...styles.btnPrimary, background: '#444', border: '1px solid #666' }} onClick={onClose}>Cancel</button>
                    <button style={styles.btnPrimary} onClick={handleSave}>Save Follow-up</button>
                </div>
            </div>
        </div>
    );
};

// --- SalesTaskManager Component ---
const SalesTaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        date: '', lead_name: '', company: '', contact: '', task_type: 'Call', next_follow_up: '', status: 'Pending', remarks: '', follow_up_count: 0, priority: 'Medium'
    });
    
    // MODAL States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [followUpData, setFollowUpData] = useState({
        next_follow_up: '',
        status: '',
        priority: '',
        remarks: '',
    });

    const API_URL = 'http://127.0.0.1:8000/api/sales-tasks/';

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeaders());
            // Sorting Logic (for high priority to be visible)
            const sortedTasks = response.data.sort((a, b) => {
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            setTasks(sortedTasks);
        } catch (error) { console.error("Error fetching tasks:", error); }
    };

    const handleSave = async () => {
        if (!newTask.lead_name) { toast.error("Name Required!"); return; }
        try {
            const response = await axios.post(API_URL, newTask, getAuthHeaders());
            // Add the new task and re-sort
            const newTasks = [...tasks, response.data];
            const sortedTasks = newTasks.sort((a, b) => {
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            setTasks(sortedTasks);

            setNewTask({ date: '', lead_name: '', company: '', contact: '', task_type: 'Call', next_follow_up: '', status: 'Pending', remarks: '', follow_up_count: 0, priority: 'Medium' });
            toast.success("Task Assigned!", { icon: '📌' });
        } catch (error) { toast.error("Error saving"); }
    };

    // --- NEW: Function to open Modal ---
    const handleFollowUpClick = (task) => {
        setCurrentTask(task);
        // Initialize modal form data with current task values
        setFollowUpData({
            next_follow_up: task.next_follow_up || '',
            status: task.status,
            priority: task.priority,
            remarks: task.remarks, // Use current remarks as starting point
        });
        setIsModalOpen(true);
    };

    // --- NEW: Function to handle Modal Save ---
    const handleFollowUpUpdate = async () => {
        if (!currentTask) return;

        const newCount = currentTask.follow_up_count + 1;
        const payload = {
            follow_up_count: newCount, 
            next_follow_up: followUpData.next_follow_up,
            status: followUpData.status,
            priority: followUpData.priority,
            remarks: followUpData.remarks,
        };

        try {
            await axios.patch(`${API_URL}${currentTask.id}/`, payload, getAuthHeaders());
            toast.success(`Follow-up Updated! Count: ${newCount}`);
            
            // Re-fetch to get the newest sorted list
            fetchTasks();
            setIsModalOpen(false);
            setCurrentTask(null); // Clear task data
        } catch (error) {
            toast.error("Error updating follow-up.");
            console.error("Error updating follow-up:", error);
        }
    };
    // ------------------------------------

//   import { toast } from "react-hot-toast";

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
        XLSX.utils.book_append_sheet(wb, ws, "SalesTasks");
        XLSX.writeFile(wb, "Sales_Tasks.xlsx");
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
    
    // Helper function for Status styling (Pending = Yellowish-Orange)
    const getStatusStyle = (status) => {
        if (status === 'Pending') { return { background: '#ffbb33', color: '#000', fontWeight: 'bold' }; } 
        else if (status === 'Done') { return { background: '#00ffcc', color: '#000', fontWeight: 'bold' }; }
        return { background: '#444', color: '#fff' };
    };

    // Helper function for Row Color (if due date is near/past)
    const getStatusColor = (dueDate, status) => {
        if (status === 'Done') return { backgroundColor: '#1f2a28' }; // Light green for Done
        if (!dueDate) return {};

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        if (due < today) {
            return { backgroundColor: 'rgba(255, 68, 68, 0.2)', borderLeft: '3px solid #ff4444' }; // Past due (Reddish)
        }
        if (due.getTime() === today.getTime()) {
            return { backgroundColor: 'rgba(255, 187, 51, 0.2)', borderLeft: '3px solid #ffbb33' }; // Due today (Yellowish)
        }
        return {};
    }

    // --- STYLES ---
    const styles = {
        container: { background: '#1a1a1a', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #333', color: '#e0e0e0', minHeight: '80vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
        title: { fontSize: '24px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', background: 'linear-gradient(90deg, #00ffcc, #333399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        btnPrimary: { background: 'linear-gradient(45deg, #00ffcc, #333399)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', transition: 'transform 0.1s' },
        btnSuccess: { background: 'linear-gradient(45deg, #11998e, #38ef7d)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px', transition: 'transform 0.1s' },
        tableContainer: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #333' },
        table: { width: '100%', borderCollapse: 'collapse', minWidth: '1100px' },
        th: { background: '#252525', color: '#00ffcc', padding: '15px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #00ffcc', whiteSpace: 'nowrap' },
        td: { padding: '12px 15px', borderBottom: '1px solid #333', color: '#bbb', fontSize: '14px', verticalAlign: 'middle' },
        input: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' },
        select: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' },
        deleteBtn: { background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' },
        countBadge: { display: 'inline-block', padding: '5px 10px', borderRadius: '50%', background: '#333', color: '#00ffcc', fontWeight: 'bold', marginRight: '10px', border: '1px solid #00ffcc' },
        plusBtn: { background: '#00ffcc', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold', lineHeight: '1', verticalAlign: 'middle', transition: 'transform 0.1s' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.title}>Sales Task Manager 📞</div>
                <div>
                    <button style={styles.btnPrimary} onClick={handleSave}>+ Add Task</button>
                    <button style={styles.btnSuccess} onClick={handleExport}>Export Excel</button>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Lead Name</th>
                            <th style={styles.th}>Company</th>
                            <th style={styles.th}>Contact</th>
                            <th style={styles.th}>Task Type</th>
                            <th style={styles.th}>Next Follow Up</th>
                            <th style={styles.th}>Priority</th>
                            <th style={styles.th}>Status</th>
                            <th style={{...styles.th, textAlign: 'center'}}>Attempts</th>
                            <th style={styles.th}>Remarks</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* New Task Input Row */}
                        <tr style={{ background: '#2a2a2a' }}>
                            <td style={styles.td}><input type="date" name="date" value={newTask.date} onChange={handleInputChange} style={styles.input} /></td>
                            <td style={styles.td}><input type="text" name="lead_name" value={newTask.lead_name} onChange={handleInputChange} placeholder="Name" style={styles.input} /></td>
                            <td style={styles.td}><input type="text" name="company" value={newTask.company} onChange={handleInputChange} placeholder="Company" style={styles.input} /></td>
                            <td style={styles.td}><input type="text" name="contact" value={newTask.contact} onChange={handleInputChange} placeholder="Phone" style={styles.input} /></td>
                            <td style={styles.td}>
                                <select name="task_type" value={newTask.task_type} onChange={handleInputChange} style={styles.select}>
                                    <option>Call</option><option>Visit</option><option>Email</option><option>Meeting</option>
                                </select>
                            </td>
                            <td style={styles.td}><input type="date" name="next_follow_up" value={newTask.next_follow_up} onChange={handleInputChange} style={styles.input} /></td>
                            <td style={styles.td}>
                                <select name="priority" value={newTask.priority} onChange={handleInputChange} style={styles.select}>
                                    <option value="High">High 🔥</option><option value="Medium">Medium ⚠️</option><option value="Low">Low 🟢</option>
                                </select>
                            </td>
                            <td style={styles.td}>
                                <select name="status" value={newTask.status} onChange={handleInputChange} style={styles.select}>
                                    <option>Pending</option><option>Done</option><option>Rescheduled</option>
                                </select>
                            </td>
                            <td style={{...styles.td, textAlign: 'center', color: '#555'}}>0</td>
                            <td style={styles.td}><input type="text" name="remarks" value={newTask.remarks} onChange={handleInputChange} placeholder="..." style={styles.input} /></td>
                            <td style={styles.td}><span style={{color: '#333'}}>📝</span></td>
                        </tr>

                        {/* Task List */}
                        {tasks.map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #222', ...getStatusColor(t.next_follow_up, t.status) }} className="hover-row">
                                <td style={styles.td}>{t.date}</td>
                                <td style={{...styles.td, color: '#fff', fontWeight: 'bold'}}>{t.lead_name}</td>
                                <td style={styles.td}>{t.company}</td>
                                <td style={styles.td}>{t.contact}</td>
                                <td style={{...styles.td, color: '#00ffccff'}}>{t.task_type}</td>
                                <td style={styles.td}>{t.next_follow_up}</td>
                                <td style={styles.td}>
                                    <span style={{ ...styles.tag, ...getPriorityStyle(t.priority), padding: '3px 8px', borderRadius: '4px' }}>{t.priority}</span>
                                </td>
                                <td style={styles.td}>
                                    <span style={{ ...styles.tag, ...getStatusStyle(t.status), padding: '3px 8px', borderRadius: '4px' }}>{t.status}</span>
                                </td>
                                <td style={{...styles.td, textAlign: 'center'}}>
                                    <span style={styles.countBadge}>{t.follow_up_count}</span>
                                    {/* Updated: Button opens modal */}
                                    <button style={styles.plusBtn} onClick={() => handleFollowUpClick(t)} title="Add Follow-up">+</button>
                                </td>
                                <td style={styles.td}>{t.remarks}</td>
                                <td style={styles.td}><button onClick={() => handleDelete(t.id)} style={styles.deleteBtn}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>    
            </div>

            {/* Global Styles for better feel */}
           <style>{`
                .hover-row:hover { background-color: #252525 !important; }
                input:focus, select:focus { border-color: #00ffcc !important; box-shadow: 0 0 8px rgba(255, 0, 204, 0.3); }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: #111; }
                ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                ${styles.btnPrimary}:hover, ${styles.btnSuccess}:hover { transform: scale(1.05); }
                ${styles.plusBtn}:active { transform: scale(0.9); }
            `}</style>

            {/* Follow-up Modal is added here */}
            <FollowUpModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={currentTask}
                updateTask={handleFollowUpUpdate}
                followUpData={followUpData}
                setFollowUpData={setFollowUpData}
                styles={styles}
            />
        </div>
    );
};

export default SalesTaskManager;    