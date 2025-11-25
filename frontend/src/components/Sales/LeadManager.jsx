import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import BASE_API_URL from '../../config';

// --- 1. FOLLOW UP MODAL COMPONENT (Helper) ---
const FollowUpModal = ({ lead, onClose, onConfirm }) => {
    const today = new Date().toISOString().split('T')[0];
    const [followUpDate, setFollowUpDate] = useState(today);
    const [priority, setPriority] = useState('Medium');
    const [remarks, setRemarks] = useState(''); 

    const handleConfirm = () => {
        if (!followUpDate) {
            toast.error("Please select a date.");
            return;
        }
        onConfirm(lead.id, followUpDate, priority, remarks);
    };

    const styles = {
        modal: { background: '#1a1a1a', padding: '20px', borderRadius: '10px', border: '2px solid #00ffcc', boxShadow: '0 0 20px rgba(255, 187, 51, 0.5)', color: '#fff', width: '350px' },
        header: { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' },
        label: { display: 'block', margin: '10px 0 5px', fontSize: '12px', color: '#bbb' },
        input: { width: '100%', background: '#2a2a2a', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
        select: { width: '100%', background: '#2a2a2a', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
        btnContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
        btnConfirm: { background: '#00ffcc', border: 'none', color: '#000', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
        btnCancel: { background: '#444', border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }
    };

    return (
        <div style={styles.modal}>
            <h3 style={{ color: '#00ffcc', textAlign: 'center', marginBottom: '15px' }}>📞 Follow-up Task: {lead.company}</h3>
            
            <div><label style={styles.label} htmlFor="followUpDate">Next Follow-up Date</label><input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} style={styles.input} /></div>
            <div><label style={styles.label} htmlFor="priority">Task Priority</label><select value={priority} onChange={(e) => setPriority(e.target.value)} style={styles.select}><option value="Medium">Medium</option><option value="High">High</option><option value="Low">Low</option></select></div>
            <div><label style={styles.label} htmlFor="remarks">Remarks</label><textarea rows="2" value={remarks} onChange={(e) => setRemarks(e.target.value)} style={styles.input} /></div>

            <div style={styles.btnContainer}>
                <button onClick={onClose} style={styles.btnCancel}>Cancel</button>
                <button onClick={handleConfirm} style={styles.btnConfirm}>Create Task</button>
            </div>
        </div>
    );
};


// --- 2. PAYMENT DETAILS MODAL COMPONENT (FOR CONVERT) ---
const PaymentDetailsModal = ({ lead, onClose, onConfirm }) => {
    const [paymentData, setPaymentData] = useState({ so_no: '', amount: '', advance: '', remaining: '0.00', invoice: '', remark: '' });
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'amount' || name === 'advance') {
                const total = parseFloat(updated.amount || 0);
                const adv = parseFloat(updated.advance || 0);
                updated.remaining = (total - adv).toFixed(2);
            }
            return updated;
        });
    };
    const handleConfirm = () => {
        if (!paymentData.amount || paymentData.amount <= 0) { toast.error("Amount must be greater than zero."); return; }
        onConfirm(lead.id, paymentData); 
    };
    const styles = {
        modal: { background: '#1a1a1a', padding: '30px', borderRadius: '10px', border: '2px solid #00ffcc', boxShadow: '0 0 20px rgba(0, 255, 204, 0.5)', color: '#fff', width: '450px' },
        input: { width: '100%', background: '#2a2a2a', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
        btnContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
        btnConfirm: { background: '#00ffcc', border: 'none', color: '#000', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
        btnCancel: { background: '#444', border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' },
        row: { display: 'flex', gap: '15px', marginBottom: '10px' },
        col: { flex: 1, minWidth: '45%' },
        label: { display: 'block', margin: '10px 0 5px', fontSize: '12px', color: '#bbb' }
    };
    return (
        <div style={styles.modal}>
            <h3 style={{ color: '#00ffcc', textAlign: 'center', marginBottom: '20px' }}>💰 Finalize Deal: {lead.company}</h3>
            <div style={styles.row}>
                <div style={styles.col}><label style={styles.label}>Sales Order No.</label><input type="text" name="so_no" value={paymentData.so_no} onChange={handleInputChange} style={styles.input} placeholder="SO-XXX" /></div>
                <div style={styles.col}><label style={styles.label}>Invoice No.</label><input type="text" name="invoice" value={paymentData.invoice} onChange={handleInputChange} style={styles.input} placeholder="INV-XXX" /></div>
            </div>
            <div style={styles.row}>
                <div style={styles.col}><label style={styles.label}>Total Amount</label><input type="number" name="amount" value={paymentData.amount} onChange={handleInputChange} style={styles.input} placeholder="0.00" /></div>
                <div style={styles.col}><label style={styles.label}>Advance Paid</label><input type="number" name="advance" value={paymentData.advance} onChange={handleInputChange} style={styles.input} placeholder="0.00" /></div>
            </div>
            <div style={{...styles.row, alignItems: 'center'}}><div style={styles.col}>
                <label style={styles.label}>Remaining Amount</label>
                <input type="text" readOnly value={`₹ ${paymentData.remaining}`} style={{...styles.input, color: '#ffbb33', fontWeight: 'bold'}} />
            </div></div>
            <div style={{...styles.row, marginBottom: '20px'}}><div style={{flex: 1}}>
                <label style={styles.label}>Remarks</label>
                <textarea name="remark" value={paymentData.remark} onChange={handleInputChange} style={styles.input} rows="2" />
            </div></div>
            <div style={styles.btnContainer}>
                <button onClick={onClose} style={styles.btnCancel}>Cancel</button>
                <button onClick={handleConfirm} style={styles.btnConfirm}>Record Payment</button>
            </div>
        </div>
    );
};
// --- END PAYMENT MODAL COMPONENT ---


const LeadManager = () => {
    
    // --- HELPER FUNCTIONS ---
    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
        
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return "";
        const d = new Date(isoString);
        return d.toLocaleString('en-IN', { 
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true 
        }); 
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };
    
    // --- STATE ---
    const [leads, setLeads] = useState([]);
    
    const [newLead, setNewLead] = useState({
        date: getCurrentDateTime(), sno: '', company: '', name: '', contact: '', email: '', 
        address: '', 
        note: '', purpose: '', status: 'New'
    });
    
    // MODAL STATES
    const [showModal, setShowModal] = useState(false); // FollowUp Modal
    const [currentLeadForTask, setCurrentLeadForTask] = useState(null); 
    const [showPaymentModal, setShowPaymentModal] = useState(false); // Payment Modal

    const fileInputRef = useRef(null);
       const API_URL = `${BASE_API_URL}leads/`; // FIX: Using BASE_API_URL


    const purposeOptions = [
        "TENDER MANAGMENT", "VENDOR ASSESSMENT", "GEM REGISTRATION", "DIRECT ORDER",
        "DIRECT LINK", "NOT INTRESTED", "STARTUP INDIA CERTIFICATE",
        "BUSINESS DEVELOPEMENT SERVICES", "L1", "TRAINING GEM"
    ];

    useEffect(() => { fetchLeads(); }, []);

    const fetchLeads = async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeaders());
            setLeads(response.data);
        } catch (error) { console.error(error); }
    };

    const handleImportClick = () => fileInputRef.current.click();
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const arrayBuffer = evt.target.result;
            const wb = XLSX.read(arrayBuffer, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws, { raw: false });

            if (data.length === 0) { toast.error("File Empty!"); return; }
            const toastId = toast.loading(`Importing ${data.length} leads...`);
            let count = 0;
            
            for (const row of data) {
                const payload = {
                    date: new Date().toISOString(), company: row.Company || "Unknown", name: row.Name || "Unknown", contact: row.Contact ? String(row.Contact) : "",
                    email: row.Email || "", address: row.Address || "", note: row.Note || "", purpose: row.Purpose || "", status: "New"
                };
                try { await axios.post(API_URL, payload, getAuthHeaders()); count++; } catch (err) {}
            }
            toast.success(`${count} Imported!`, { id: toastId });
            fetchLeads();
            e.target.value = null;
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSave = async () => {
        if (!newLead.company) { toast.error("Company Required!"); return; }
        try {
            const res = await axios.post(API_URL, newLead, getAuthHeaders());
            setLeads([...leads, res.data]);
            setNewLead({ date: getCurrentDateTime(), sno: '', company: '', name: '', contact: '', email: '', address: '', note: '', purpose: '', status: 'New' });
            toast.success("Saved!");
        } catch (error) { toast.error("Error saving"); }
    };

    // --- 1. FOLLOW UP (Triggers FollowUpModal) ---
    const handleMoveToSalesTrigger = (lead) => {
        setCurrentLeadForTask(lead);
        setShowModal(true); // Opens the FollowUpModal 
    };
    
    // 2. CONFIRM FOLLOW UP (API CALL from Modal)
    const confirmMoveToSales = async (leadId, followUpDate, priority, remarks) => {
        const toastId = toast.loading("Creating Task...");
        const payload = { next_follow_up: followUpDate, priority: priority, remarks: remarks };

        try {
            await axios.post(`${API_URL}${leadId}/to-sales-task/`, payload, getAuthHeaders()); 
            setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: 'Interested' } : lead));
            toast.success("Task Created! 📞", { id: toastId });
            setShowModal(false); // Close Modal on success
        } catch (error) { 
            toast.error("Task creation failed.", { id: toastId }); 
            setShowModal(false);
        }
    };

    // 3. CONVERT TO PAYMENT (Triggers Payment Modal) --- NEW LOGIC
    const handleConvertTrigger = (lead) => {
        const leadToConvert = leads.find(l => l.id === lead.id); // Get the full lead data
        if (leadToConvert) {
            setCurrentLeadForTask(leadToConvert);
            setShowPaymentModal(true); // Opens the new Payment Modal
        }
    };
    
    // 4. CONFIRM PAYMENT (API Call from Payment Modal)
    const confirmPaymentRecord = async (leadId, paymentData) => {
        const toastId = toast.loading("Processing Deal...");
        try {
            // Updated API call sends payment data
            await axios.post(`${API_URL}${leadId}/convert/`, paymentData, getAuthHeaders()); 
            setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: 'Converted' } : lead));
            toast.success("Payment Record Created! 💰", { id: toastId });
            setShowPaymentModal(false); // Close modal
        } catch (error) { 
            console.error("Payment API Error:", error.response?.data);
            toast.error("Failed to finalize deal!", { id: toastId }); 
        }
    };

    const handleDeleteTrigger = (id) => {
        toast((t) => (
            <div style={{ color: '#fff' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>🗑️ Delete Lead?</div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => { confirmDelete(id); toast.dismiss(t.id); }} style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button>
                    <button onClick={() => toast.dismiss(t.id)} style={{ background: '#444', border: '1px solid #555', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                </div>
            </div>
        ), { style: { background: '#1a1a1a', border: '1px solid #ff4444' }, duration: 4000 });
    };

    const confirmDelete = async (id) => {       
        try { await axios.delete(`${API_URL}${id}/`, getAuthHeaders()); setLeads(leads.filter(l => l.id !== id)); toast.success("Deleted!"); } catch (error) {}
    };

    const handleInputChange = (e) => setNewLead({ ...newLead, [e.target.name]: e.target.value });
    
    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(leads);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Leads");
        XLSX.writeFile(wb, "Leads.xlsx");
    };

    // --- STYLES ---
    const styles = {
        container: { background: '#1a1a1a', borderRadius: '15px', padding: '25px', boxShadow: '0 0 30px rgba(0,0,0,0.5)', border: '1px solid #333', color: '#e0e0e0', minHeight: '80vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
        title: { fontSize: '24px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', background: 'linear-gradient(90deg, #fff, #999)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        btnPrimary: { background: 'linear-gradient(45deg, #00ffcc, #00c3ff)', border: 'none', padding: '10px 20px', color: '#000', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', boxShadow: '0 0 10px rgba(0, 255, 204, 0.3)', transition: '0.3s' },
        btnSuccess: { background: 'linear-gradient(45deg, #11998e, #38ef7d)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' },
        btnImport: { background: 'linear-gradient(45deg, #ff9966, #ff5e62)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' },
        tableContainer: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #333' },
        table: { width: '100%', borderCollapse: 'collapse', minWidth: '1500px' }, 
        th: { background: '#252525', color: '#00ffcc', padding: '15px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #00ffcc', whiteSpace: 'nowrap' },
        td: { padding: '12px 15px', borderBottom: '1px solid #333', color: '#bbb', fontSize: '14px' },
        input: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none', fontSize: '13px' },
        select: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
        btnDelete: { background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
        btnFollow: { background: 'transparent', border: '1px solid #00ffcc', color: '#00ffcc', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
        btnConvert: { background: 'transparent', border: '1px solid #00ffcc', color: '#00ffcc', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }
    };

    return (
        <>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.title}>Lead Manager</div>
                    <div>
                        <button style={styles.btnPrimary} onClick={handleSave}>+ Save</button>
                        <input type="file" accept=".xlsx, .xls" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileChange} />
                        <button style={styles.btnImport} onClick={handleImportClick}>📥 Import</button>
                        <button style={styles.btnSuccess} onClick={handleExport}>Export</button>
                    </div>
                </div>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Date & Time</th>
                                <th style={styles.th}>S.No</th>
                                <th style={styles.th}>Company</th>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Contact</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Address</th>
                                <th style={styles.th}>Note</th>
                                <th style={styles.th}>Purpose</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th} className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ background: '#2a2a2a' }}>
                                <td style={styles.td}><input type="datetime-local" name="date" value={newLead.date} onChange={handleInputChange} style={styles.input} /></td>
                                <td style={styles.td}><input type="text" name="sno" value={newLead.sno} onChange={handleInputChange} placeholder="1" style={{...styles.input, width: '50px'}} /></td>
                                <td style={styles.td}><input type="text" name="company" value={newLead.company} onChange={handleInputChange} placeholder="Company" style={styles.input} /></td>
                                <td style={styles.td}><input type="text" name="name" value={newLead.name} onChange={handleInputChange} placeholder="Name" style={styles.input} /></td>
                                <td style={styles.td}><input type="text" name="contact" value={newLead.contact} onChange={handleInputChange} placeholder="Phone" style={styles.input} /></td>
                                <td style={styles.td}><input type="text" name="email" value={newLead.email} onChange={handleInputChange} placeholder="Email" style={styles.input} /></td>
                                <td style={styles.td}><input type="text" name="address" value={newLead.address} onChange={handleInputChange} placeholder="Address" style={styles.input} /></td>
                                <td style={styles.td}><input type="text" name="note" value={newLead.note} onChange={handleInputChange} placeholder="Note" style={styles.input} /></td>
                                <td style={styles.td}>
                                    <select name="purpose" value={newLead.purpose} onChange={handleInputChange} style={styles.select}>
                                        <option value="">Select</option>
                                        {purposeOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
                                    </select>
                                </td>
                                <td style={styles.td}>
                                    <select name="status" value={newLead.status} onChange={handleInputChange} style={styles.select}>
                                        <option>New</option><option>Contacted</option><option>Interested</option><option>Closed</option>
                                    </select>
                                </td>
                                <td style={styles.td}>✨</td>
                            </tr>

                            {/* DATA ROWS */}
                            {leads.map((l, index) => (
                                <tr key={l.id} style={{ borderBottom: '1px solid #222' }} className="hover-row">
                                    <td style={{...styles.td, fontSize: '12px', color: '#bbb'}}>{formatDateTime(l.date)}</td>
                                    <td style={styles.td}>{l.sno || index + 1}</td>
                                    <td style={{...styles.td, color: '#fff', fontWeight: 'bold'}}>{l.company}</td>
                                    <td style={styles.td}>{l.name}</td>
                                    <td style={{...styles.td, color: '#00ffcc'}}>{l.contact}</td>
                                    <td style={styles.td}>{l.email}</td>
                                    <td style={styles.td}>{l.address}</td>
                                    <td style={styles.td}>{l.note}</td>
                                    <td style={styles.td}>{l.purpose}</td>
                                    <td style={styles.td}>
                                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: l.status==='Converted'?'#28a745':'#007bff', color:'#fff'}}>
                                            {l.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button style={styles.btnFollow} onClick={() => handleMoveToSalesTrigger(l)} title="Send to Sales">Follow Up 📞</button>
                                            {l.status !== 'Converted' && (
                                                <button style={styles.btnConvert} onClick={() => handleConvertTrigger(l)} title="Convert">Convert 💰</button>
                                            )}
                                            <button style={styles.btnDelete} onClick={() => handleDeleteTrigger(l.id)}>Del</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* MODAL DISPLAY */}
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                        <FollowUpModal 
                            lead={currentLeadForTask} 
                            onClose={() => setShowModal(false)} 
                            onConfirm={confirmMoveToSales} 
                        />
                    </div>
                )}
                {showPaymentModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                        <PaymentDetailsModal 
                            lead={currentLeadForTask} 
                            onClose={() => setShowPaymentModal(false)} 
                            onConfirm={confirmPaymentRecord} 
                        />
                    </div>
                )}
                {/* Global styles */}
                <style>{`
                    .hover-row:hover { background-color: #252525 !important; }
                    input:focus, select:focus { border-color: #00ffcc !important; box-shadow: 0 0 8px rgba(0, 255, 204, 0.3); }
                    input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
                    ::-webkit-scrollbar { width: 8px; height: 8px; }
                    ::-webkit-scrollbar-track { background: #111; }
                    ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                `}</style>
            </div>
        </>
    );
};

export default LeadManager;

// --- FOLLOW UP MODAL COMPONENT --- (Separate Component)
// const FollowUpModal = ({ lead, onClose, onConfirm }) => {
//     // ... (The rest of the FollowUpModal logic) ...
// };

// // --- PAYMENT DETAILS MODAL COMPONENT --- (Separate Component)
// const PaymentDetailsModal = ({ lead, onClose, onConfirm }) => {
// // ... (The rest of the PaymentDetailsModal logic) ...
// };   




// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import * as XLSX from 'xlsx';
// import { toast } from 'react-hot-toast';
// import BASE_API_URL from '../../config'; // Import the central config

// // --- HELPER FUNCTIONS (API and Formatting) ---
// const getCurrentDateTime = () => {
//     const now = new Date();
//     now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
//     return now.toISOString().slice(0, 16); 
// };

// const formatDateTime = (isoString) => {
//     if (!isoString) return "";
//     const d = new Date(isoString);
//     return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }); 
// };

// const getAuthHeaders = () => {
//     const token = localStorage.getItem('access_token');
//     return { headers: { Authorization: `Bearer ${token}` } };
// };


// // --- 1. FOLLOW UP MODAL COMPONENT --- 
// const FollowUpModal = ({ lead, onClose, onConfirm }) => {
//     const today = new Date().toISOString().split('T')[0];
//     const [followUpDate, setFollowUpDate] = useState(today);
//     const [priority, setPriority] = useState('Medium');
//     const [remarks, setRemarks] = useState(''); 

//     const handleConfirm = () => {
//         if (!followUpDate) { toast.error("Please select a date."); return; }
//         onConfirm(lead.id, followUpDate, priority, remarks);
//         onClose();
//     };

//     const styles = {
//         modal: { background: '#1a1a1a', padding: '30px', borderRadius: '10px', border: '2px solid #ffbb33', boxShadow: '0 0 20px rgba(255, 187, 51, 0.5)', color: '#fff', width: '350px' },
//         header: { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' },
//         label: { display: 'block', margin: '10px 0 5px', fontSize: '12px', color: '#bbb' },
//         input: { width: '100%', background: '#2a2a2a', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
//         select: { width: '100%', background: '#2a2a2a', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
//         btnContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
//         btnConfirm: { background: '#ffbb33', border: 'none', color: '#000', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
//         btnCancel: { background: '#444', border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }
//     };

//     return (
//         <div style={styles.modal}>
//             <h3 style={{ color: '#ffbb33', textAlign: 'center', marginBottom: '15px' }}>📞 New Follow-up: {lead.company}</h3>
            
//             <div><label style={styles.label} htmlFor="followUpDate">Next Follow-up Date</label><input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} style={styles.input} /></div>
//             <div><label style={styles.label} htmlFor="priority">Task Priority</label><select value={priority} onChange={(e) => setPriority(e.target.value)} style={styles.select}><option value="Medium">Medium</option><option value="High">High</option><option value="Low">Low</option></select></div>
//             <div><label style={styles.label} htmlFor="remarks">Remarks</label><textarea rows="2" value={remarks} onChange={(e) => setRemarks(e.target.value)} style={styles.input} /></div>

//             <div style={styles.btnContainer}>
//                 <button onClick={onClose} style={styles.btnCancel}>Cancel</button>
//                 <button onClick={handleConfirm} style={styles.btnConfirm}>Create Task</button>
//             </div>
//         </div>
//     );
// };


// // --- 2. PAYMENT DETAILS MODAL COMPONENT (FOR CONVERT) ---
// const PaymentDetailsModal = ({ lead, onClose, onConfirm }) => {
//     const [paymentData, setPaymentData] = useState({ so_no: '', amount: '', advance: '', remaining: '0.00', invoice: '', remark: '' });
    
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setPaymentData(prev => {
//             const updated = { ...prev, [name]: value };
//             if (name === 'amount' || name === 'advance') {
//                 const total = parseFloat(updated.amount || 0);
//                 const adv = parseFloat(updated.advance || 0);
//                 updated.remaining = (total - adv).toFixed(2);
//             }
//             return updated;
//         });
//     };
//     const handleConfirm = () => {
//         if (!paymentData.amount || paymentData.amount <= 0) { toast.error("Amount must be greater than zero."); return; }
//         onConfirm(lead.id, paymentData); 
//     };
//     const styles = {
//         modal: { background: '#1a1a1a', padding: '30px', borderRadius: '10px', border: '2px solid #00ffcc', boxShadow: '0 0 20px rgba(0, 255, 204, 0.5)', color: '#fff', width: '450px' },
//         input: { width: '100%', background: '#2a2a2a', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
//         btnContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
//         btnConfirm: { background: '#00ffcc', border: 'none', color: '#000', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
//         btnCancel: { background: '#444', border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' },
//         row: { display: 'flex', gap: '15px', marginBottom: '10px' },
//         col: { flex: 1, minWidth: '45%' },
//         label: { display: 'block', margin: '10px 0 5px', fontSize: '12px', color: '#bbb' }
//     };
//     return (
//         <div style={styles.modal}>
//             <h3 style={{ color: '#00ffcc', textAlign: 'center', marginBottom: '20px' }}>💰 Finalize Deal: {lead.company}</h3>
//             <div style={styles.row}>
//                 <div style={styles.col}><label style={styles.label}>Sales Order No.</label><input type="text" name="so_no" value={paymentData.so_no} onChange={handleInputChange} style={styles.input} placeholder="SO-XXX" /></div>
//                 <div style={styles.col}><label style={styles.label}>Invoice No.</label><input type="text" name="invoice" value={paymentData.invoice} onChange={handleInputChange} style={styles.input} placeholder="INV-XXX" /></div>
//             </div>
//             <div style={styles.row}>
//                 <div style={styles.col}><label style={styles.label}>Total Amount</label><input type="number" name="amount" value={paymentData.amount} onChange={handleInputChange} style={styles.input} placeholder="0.00" /></div>
//                 <div style={styles.col}><label style={styles.label}>Advance Paid</label><input type="number" name="advance" value={paymentData.advance} onChange={handleInputChange} style={styles.input} placeholder="0.00" /></div>
//             </div>
//             <div style={{...styles.row, alignItems: 'center'}}><div style={styles.col}>
//                 <label style={styles.label}>Remaining Amount</label>
//                 <input type="text" readOnly value={`₹ ${paymentData.remaining}`} style={{...styles.input, color: '#ffbb33', fontWeight: 'bold'}} />
//             </div></div>
//             <div style={{...styles.row, marginBottom: '20px'}}><div style={{flex: 1}}><label style={styles.label}>Remarks</label><textarea name="remark" value={paymentData.remark} onChange={handleInputChange} style={styles.input} rows="2" /></div></div>
//             <div style={styles.btnContainer}><button onClick={onClose} style={styles.btnCancel}>Cancel</button><button onClick={handleConfirm} style={styles.btnConfirm}>Record Payment</button></div>
//         </div>
//     );
// };
// // --- END PAYMENT MODAL COMPONENT ---


// const LeadManager = () => {
    
//     // --- HELPER FUNCTIONS ---
//     const getCurrentDateTime = () => {
//         const now = new Date();
//         now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
//         return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
//     };

//     const formatDateTime = (isoString) => {
//         if (!isoString) return "";
//         const d = new Date(isoString);
//         return d.toLocaleString('en-IN', { 
//             day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true 
//         }); 
//     };

//     const getAuthHeaders = () => {
//         const token = localStorage.getItem('access_token');
//         return { headers: { Authorization: `Bearer ${token}` } };
//     };
    
//     // --- STATE ---
//     const [leads, setLeads] = useState([]);
    
//     const [newLead, setNewLead] = useState({
//         date: getCurrentDateTime(), sno: '', company: '', name: '', contact: '', email: '', 
//         address: '', 
//         note: '', purpose: '', status: 'New'
//     });
    
//     // MODAL STATES
//     const [showModal, setShowModal] = useState(false); // FollowUp Modal
//     const [currentLeadForTask, setCurrentLeadForTask] = useState(null); 
//     const [showPaymentModal, setShowPaymentModal] = useState(false); // Payment Modal

//     const fileInputRef = useRef(null);

//     const purposeOptions = [
//         "TENDER MANAGMENT", "VENDOR ASSESSMENT", "GEM REGISTRATION", "DIRECT ORDER",
//         "DIRECT LINK", "NOT INTRESTED", "STARTUP INDIA CERTIFICATE",
//         "BUSINESS DEVELOPEMENT SERVICES", "L1", "TRAINING GEM"
//     ];

//     useEffect(() => { fetchLeads(); }, []);

//     const fetchLeads = async () => {
//         try {
//             const response = await axios.get(API_URL, getAuthHeaders());
//             setLeads(response.data);
//         } catch (error) { console.error(error); }
//     };

//     const handleImportClick = () => fileInputRef.current.click();
//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;
//         const reader = new FileReader();
//         reader.onload = async (evt) => {
//             const arrayBuffer = evt.target.result;
//             const wb = XLSX.read(arrayBuffer, { type: 'array' });
//             const ws = wb.Sheets[wb.SheetNames[0]];
//             const data = XLSX.utils.sheet_to_json(ws, { raw: false });

//             if (data.length === 0) { toast.error("File Empty!"); return; }
//             const toastId = toast.loading(`Importing ${data.length} leads...`);
//             let count = 0;
            
//             for (const row of data) {
//                 const payload = {
//                     date: new Date().toISOString(), company: row.Company || "Unknown", name: row.Name || "Unknown", contact: row.Contact ? String(row.Contact) : "",
//                     email: row.Email || "", address: row.Address || "", note: row.Note || "", purpose: row.Purpose || "", status: "New"
//                 };
//                 try { await axios.post(API_URL, payload, getAuthHeaders()); count++; } catch (err) {}
//             }
//             toast.success(`${count} Imported!`, { id: toastId });
//             fetchLeads();
//             e.target.value = null;
//         };
//         reader.readAsArrayBuffer(file);
//     };

//     const handleSave = async () => {
//         if (!newLead.company) { toast.error("Company Required!"); return; }
//         try {
//             const res = await axios.post(API_URL, newLead, getAuthHeaders());
//             setLeads([...leads, res.data]);
//             setNewLead({ date: getCurrentDateTime(), sno: '', company: '', name: '', contact: '', email: '', address: '', note: '', purpose: '', status: 'New' });
//             toast.success("Saved!");
//         } catch (error) { toast.error("Error saving"); }
//     };

//     // --- 1. FOLLOW UP (Triggers FollowUpModal) ---
//     const handleMoveToSalesTrigger = (lead) => {
//         setCurrentLeadForTask(lead);
//         setShowModal(true); // Opens the FollowUpModal 
//     };
    
//     // 2. CONFIRM FOLLOW UP (API CALL from Modal)
//     const confirmMoveToSales = async (leadId, followUpDate, priority, remarks) => {
//         const toastId = toast.loading("Creating Task...");
//         const payload = { next_follow_up: followUpDate, priority: priority, remarks: remarks };

//         try {
//             await axios.post(`${API_URL}${leadId}/to-sales-task/`, payload, getAuthHeaders()); 
//             setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: 'Interested' } : lead));
//             toast.success("Task Created! 📞", { id: toastId });
//             setShowModal(false); // Close Modal on success
//         } catch (error) { 
//             toast.error("Task creation failed.", { id: toastId }); 
//             setShowModal(false);
//         }
//     };

//     // 3. CONVERT TO PAYMENT (Triggers Payment Modal)
//     const handleConvertTrigger = (lead) => {
//         const leadToConvert = leads.find(l => l.id === lead.id); 
//         if (leadToConvert) {
//             setCurrentLeadForTask(leadToConvert);
//             setShowPaymentModal(true); // Opens the new Payment Modal
//         }
//     };
    
//     // 4. CONFIRM PAYMENT (API Call from Payment Modal)
//     const confirmPaymentRecord = async (leadId, paymentData) => {
//         const toastId = toast.loading("Processing Deal...");
//         try {
//             await axios.post(`${API_URL}${leadId}/convert/`, paymentData, getAuthHeaders()); 
//             setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: 'Converted' } : lead));
//             toast.success("Payment Record Created! 💰", { id: toastId });
//             setShowPaymentModal(false); // Close modal
//         } catch (error) { 
//             console.error("Payment API Error:", error.response?.data);
//             toast.error("Failed to finalize deal!", { id: toastId }); 
//         }
//     };

//     const handleDeleteTrigger = (id) => {
//         toast((t) => (
//             <div style={{ color: '#fff' }}>
//                 <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>🗑️ Delete Lead?</div>
//                 <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
//                     <button onClick={() => { confirmDelete(id); toast.dismiss(t.id); }} style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button>
//                     <button onClick={() => toast.dismiss(t.id)} style={{ background: '#444', border: '1px solid #555', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
//                 </div>
//             </div>
//         ), { style: { background: '#1a1a1a', border: '1px solid #ff4444' }, duration: 4000 });
//     };

//     const confirmDelete = async (id) => {
//         try { await axios.delete(`${API_URL}${id}/`, getAuthHeaders()); setLeads(leads.filter(l => l.id !== id)); toast.success("Deleted!"); } catch (error) {}
//     };

//     const handleInputChange = (e) => setNewLead({ ...newLead, [e.target.name]: e.target.value });
    
//     const handleExport = () => {
//         const ws = XLSX.utils.json_to_sheet(leads);
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Leads");
//         XLSX.writeFile(wb, "Leads.xlsx");
//     };

//     // --- STYLES ---
//     const styles = {
//         container: { background: '#1a1a1a', borderRadius: '15px', padding: '25px', boxShadow: '0 0 30px rgba(0,0,0,0.5)', border: '1px solid #333', color: '#e0e0e0', minHeight: '80vh' },
//         header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
//         title: { fontSize: '24px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', background: 'linear-gradient(90deg, #fff, #999)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
//         btnPrimary: { background: 'linear-gradient(45deg, #00ffcc, #00c3ff)', border: 'none', padding: '10px 20px', color: '#000', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', boxShadow: '0 0 10px rgba(0, 255, 204, 0.3)', transition: '0.3s' },
//         btnSuccess: { background: 'linear-gradient(45deg, #11998e, #38ef7d)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' },
//         btnImport: { background: 'linear-gradient(45deg, #ff9966, #ff5e62)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' },
//         tableContainer: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #333' },
//         table: { width: '100%', borderCollapse: 'collapse', minWidth: '1500px' }, 
//         th: { background: '#252525', color: '#00ffcc', padding: '15px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #00ffcc', whiteSpace: 'nowrap' },
//         td: { padding: '12px 15px', borderBottom: '1px solid #333', color: '#bbb', fontSize: '14px' },
//         input: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none', fontSize: '13px' },
//         select: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
//         btnDelete: { background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
//         btnFollow: { background: 'transparent', border: '1px solid #ffbb33', color: '#ffbb33', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
//         btnConvert: { background: 'transparent', border: '1px solid #00ffcc', color: '#00ffcc', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }
//     };

//     return (
//         <>
//             <div style={styles.container}>
//                 <div style={styles.header}>
//                     <div style={styles.title}>Lead Manager</div>
//                     <div>
//                         <button style={styles.btnPrimary} onClick={handleSave}>+ Save</button>
//                         <input type="file" accept=".xlsx, .xls" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileChange} />
//                         <button style={styles.btnImport} onClick={handleImportClick}>📥 Import</button>
//                         <button style={styles.btnSuccess} onClick={handleExport}>Export</button>
//                     </div>
//                 </div>

//                 <div style={styles.tableContainer}>
//                     <table style={styles.table}>
//                         <thead>
//                             <tr>
//                                 <th style={styles.th}>Date & Time</th>
//                                 <th style={styles.th}>S.No</th>
//                                 <th style={styles.th}>Company</th>
//                                 <th style={styles.th}>Name</th>
//                                 <th style={styles.th}>Contact</th>
//                                 <th style={styles.th}>Email</th>
//                                 <th style={styles.th}>Address</th>
//                                 <th style={styles.th}>Note</th>
//                                 <th style={styles.th}>Purpose</th>
//                                 <th style={styles.th}>Status</th>
//                                 <th style={styles.th} className="text-center">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr style={{ background: '#2a2a2a' }}>
//                                 <td style={styles.td}><input type="datetime-local" name="date" value={newLead.date} onChange={handleInputChange} style={styles.input} /></td>
//                                 <td style={styles.td}><input type="text" name="sno" value={newLead.sno} onChange={handleInputChange} placeholder="1" style={{...styles.input, width: '50px'}} /></td>
//                                 <td style={styles.td}><input type="text" name="company" value={newLead.company} onChange={handleInputChange} placeholder="Company" style={styles.input} /></td>
//                                 <td style={styles.td}><input type="text" name="name" value={newLead.name} onChange={handleInputChange} placeholder="Name" style={styles.input} /></td>
//                                 <td style={styles.td}><input type="text" name="contact" value={newLead.contact} onChange={handleInputChange} placeholder="Phone" style={styles.input} /></td>
//                                 <td style={styles.td}><input type="text" name="email" value={newLead.email} onChange={handleInputChange} placeholder="Email" style={styles.input} /></td>
//                                 <td style={styles.td}><input type="text" name="address" value={newLead.address} onChange={handleInputChange} placeholder="Address" style={styles.input} /></td>
//                                 <td style={styles.td}><input type="text" name="note" value={newLead.note} onChange={handleInputChange} placeholder="Note" style={styles.input} /></td>
//                                 <td style={styles.td}>
//                                     <select name="purpose" value={newLead.purpose} onChange={handleInputChange} style={styles.select}>
//                                         <option value="">Select</option>
//                                         {purposeOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
//                                     </select>
//                                 </td>
//                                 <td style={styles.td}>
//                                     <select name="status" value={newLead.status} onChange={handleInputChange} style={styles.select}>
//                                         <option>New</option><option>Contacted</option><option>Interested</option><option>Closed</option>
//                                     </select>
//                                 </td>
//                                 <td style={styles.td}>✨</td>
//                             </tr>

//                             {/* DATA ROWS */}
//                             {leads.map((l, index) => (
//                                 <tr key={l.id} style={{ borderBottom: '1px solid #222' }} className="hover-row">
//                                     <td style={{...styles.td, fontSize: '12px', color: '#bbb'}}>{formatDateTime(l.date)}</td>
//                                     <td style={styles.td}>{l.sno || index + 1}</td>
//                                     <td style={{...styles.td, color: '#fff', fontWeight: 'bold'}}>{l.company}</td>
//                                     <td style={styles.td}>{l.name}</td>
//                                     <td style={styles.td}>{l.contact}</td>
//                                     <td style={styles.td}>{l.email}</td>
//                                     <td style={styles.td}>{l.address}</td>
//                                     <td style={styles.td}>{l.note}</td>
//                                     <td style={styles.td}>{l.purpose}</td>
//                                     <td style={styles.td}>
//                                         <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: l.status==='Converted'?'#28a745':'#007bff', color:'#fff'}}>
//                                             {l.status}
//                                         </span>
//                                     </td>
//                                     <td style={styles.td}>
//                                         <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
//                                             <button style={styles.btnFollow} onClick={() => handleMoveToSalesTrigger(l)} title="Send to Sales">Follow Up 📞</button>
//                                             {l.status !== 'Converted' && (
//                                                 <button style={styles.btnConvert} onClick={() => handleConvertTrigger(l)} title="Convert">Convert 💰</button>
//                                             )}
//                                             <button style={styles.btnDelete} onClick={() => handleDeleteTrigger(l.id)}>Del</button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//                 {/* MODAL DISPLAY */}
//                 {showModal && (
//                     <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
//                         <FollowUpModal 
//                             lead={currentLeadForTask} 
//                             onClose={() => setShowModal(false)} 
//                             onConfirm={confirmMoveToSales} 
//                         />
//                     </div>
//                 )}
//                 {showPaymentModal && (
//                     <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
//                         <PaymentDetailsModal 
//                             lead={currentLeadForTask} 
//                             onClose={() => setShowPaymentModal(false)} 
//                             onConfirm={confirmPaymentRecord} 
//                         />
//                     </div>
//                 )}
//                 {/* Global styles */}
//                 <style>{`
//                     .hover-row:hover { background-color: #252525 !important; }
//                     input:focus, select:focus { border-color: #00ffcc !important; box-shadow: 0 0 8px rgba(0, 255, 204, 0.3); }
//                     input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
//                     ::-webkit-scrollbar { width: 8px; height: 8px; }
//                     ::-webkit-scrollbar-track { background: #111; }
//                     ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
//                 `}</style>
//             </div>
//         </>
//     );
// };

// export default LeadManager;

// // // --- FOLLOW UP MODAL COMPONENT --- (Separate Component)
// // const FollowUpModal = ({ lead, onClose, onConfirm }) => {
// // // ... (The rest of the FollowUpModal logic) ...
// // };

// // // --- PAYMENT DETAILS MODAL COMPONENT --- (Separate Component)
// // const PaymentDetailsModal = ({ lead, onClose, onConfirm }) => {
// // // ... (The rest of the PaymentDetailsModal logic) ...
// // };