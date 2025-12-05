import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

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
        onConfirm(lead, followUpDate, priority, remarks); 
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
// --- END MODAL COMPONENTS ---

const LeadManager = () => {
    
    // --- HELPER FUNCTIONS ---
    const BASE_URL_FIX = "https://my-crm-backend-a5q4.onrender.com";

    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16); 
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return "";
        const d = new Date(isoString);
        return d.toLocaleString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        }); 
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error("Unauthorized: User not logged in."); 
        }
        return { headers: { Authorization: `Bearer ${token}` } };
    };
    
    // --- STATE ---
    const [leads, setLeads] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]); 
    const [editingId, setEditingId] = useState(null); 

    // 🟢 PAGINATION, SEARCH & FILTER STATES
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // 🆕 NEW FILTERS
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDays, setFilterDays] = useState(''); // ''=All, '0'=Today, '7'=Week, '30'=Month
    
    // --- 🔒 SECURITY CHECK ---
    const userRole = localStorage.getItem('role');
    const isReadOnly = userRole === 'Tech'; 
    // ---------------------------------

    const [newLead, setNewLead] = useState({
        date: getCurrentDateTime(), sno: '', company: '', name: '', contact: '', email: '', 
        address: '', 
        note: '', purpose: '', status: 'New'
    });
    
    // MODAL STATES
    const [showModal, setShowModal] = useState(false); 
    const [currentLeadForTask, setCurrentLeadForTask] = useState(null); 
    const [showPaymentModal, setShowPaymentModal] = useState(false); 

    const fileInputRef = useRef(null);
    
    const LEAD_API_URL = `${BASE_URL_FIX}/api/leads/`; 
    const TASK_API_URL = `${BASE_URL_FIX}/api/sales-tasks/`; 

    const purposeOptions = [
        "TENDER MANAGMENT", "VENDOR ASSESSMENT", "GEM REGISTRATION", "DIRECT ORDER",
        "DIRECT LINK", "NOT INTRESTED", "STARTUP INDIA CERTIFICATE",
        "OEM AUTHORIZATION", "L1", "TRAINING GEM"
    ];

    // 🟢 DEBOUNCE EFFECT FOR SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeads(1); // Page 1 pe reset karo search change hone par
            setCurrentPage(1);
        }, 800);
        return () => clearTimeout(timer); 
    }, [searchQuery]);

    // 🟢 FILTER EFFECT (Immediate fetch)
    useEffect(() => {
        fetchLeads(1);
        setCurrentPage(1);
    }, [filterStatus, filterDays]);

    // 🟢 PAGINATION EFFECT
    useEffect(() => { 
        fetchLeads(currentPage); 
    }, [currentPage]);

    // 🟢 MAIN FETCH FUNCTION
    const fetchLeads = async (page = 1) => {
        setIsLoading(true);
        try {
            const headers = getAuthHeaders();
            
            // 📅 Date Logic Calculation
            let dateParam = '';
            if (filterDays) {
                const d = new Date();
                d.setDate(d.getDate() - parseInt(filterDays));
                dateParam = d.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            }

            // 🔗 Construct URL with Filters
            let url = `${LEAD_API_URL}?page=${page}&search=${searchQuery}`;
            if (filterStatus) url += `&status=${filterStatus}`;
            if (dateParam) url += `&date_after=${dateParam}`;

            const response = await axios.get(url, headers);
            
            if (response.data.results) {
                setLeads(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 20)); 
            } else {
                setLeads(response.data);
            }
        } catch (error) { 
            console.error(error);
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Failed to load leads.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- BULK DELETE LOGIC ---
    const handleCheckboxChange = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(item => item !== id)); 
        } else {
            setSelectedIds([...selectedIds, id]); 
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = leads.map(l => l.id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} leads? This cannot be undone.`)) return;

        const toastId = toast.loading("Deleting selected leads...");
        try {
            const BULK_DELETE_URL = `${BASE_URL_FIX}/api/leads/bulk-delete/`;
            await axios.post(BULK_DELETE_URL, { ids: selectedIds }, getAuthHeaders());
            setLeads(leads.filter(l => !selectedIds.includes(l.id)));
            setSelectedIds([]); 
            toast.success("Selected leads deleted successfully!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Bulk delete failed.", { id: toastId });
        }
    };

    // --- IMPORT LOGIC ---
    const handleImportClick = () => fileInputRef.current.click();
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        let statusToSet = "New"; 
        let importNote = "Imported (Raw Data)";

        if (fileName.includes("follow up")) {
            statusToSet = "Interested";
            importNote = "Imported (Follow Up Data)";
        } else if (fileName.includes("client")) {
            statusToSet = "Converted";
            importNote = "Imported (Old Client)";
        }

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const arrayBuffer = evt.target.result;
            const wb = XLSX.read(arrayBuffer, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws, { raw: false, defval: "" });

            if (data.length === 0) { toast.error("File is empty."); return; }
            const toastId = toast.loading(`Cleaning & Processing ${data.length} leads...`);
            
            const bulkPayload = [];
            const todayStr = new Date().toISOString();

            const getVal = (row, keywords) => {
                const key = Object.keys(row).find(k => keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase())));
                return key ? row[key] : "";
            };

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                let rawCompany = getVal(row, ["company", "party", "client"]);
                let rawName = getVal(row, ["contact person", "person name", "name"]);
                let rawContact = getVal(row, ["contact no", "mobile", "phone", "cell"]);
                let rawEmail = getVal(row, ["email", "mail"]);
                let rawPurpose = getVal(row, ["purpose"]);
                let rawRemark = getVal(row, ["remark", "note"]);
                let rawDate = getVal(row, ["date of contact", "date"]);
                let rawSno = getVal(row, ["s.no", "sr.no", "serial"]);
                let rawStatus = getVal(row, ["status"]);

                if (!String(rawCompany).trim() && !String(rawName).trim() && !String(rawContact).trim()) continue; 

                let company = String(rawCompany || "Unknown").trim().substring(0, 190);
                if (!company || company.toLowerCase() === "unknown") company = "Unknown Company";

                let name = String(rawName || "Unknown").trim().substring(0, 90);
                if (!name || name.toLowerCase() === "unknown") name = "Unknown Person";

                let contact = String(rawContact || "").replace(/[^0-9]/g, '');
                if (contact.length > 15) contact = contact.slice(-15);

                let email = String(rawEmail || "").trim().toLowerCase();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) email = ""; 

                let purpose = String(rawPurpose).trim().substring(0, 190) || "N/A";
                let sno = String(rawSno).trim().substring(0, 40);
                const finalNote = rawRemark ? `${importNote}: ${rawRemark}` : importNote;

                let finalDate = todayStr;
                if (rawDate) {
                    try {
                        const d = new Date(rawDate);
                        if (!isNaN(d.getTime())) finalDate = d.toISOString();
                    } catch (e) {}
                }

                let finalStatus = statusToSet;
                if (rawStatus) {
                    const s = String(rawStatus).toUpperCase();
                    if (s.includes("CONVERT")) finalStatus = "Converted";
                    else if (s.includes("INTEREST")) finalStatus = "Interested";
                    else if (s.includes("NEW")) finalStatus = "New";
                    else if (s.includes("CLOS")) finalStatus = "Closed";
                }

                bulkPayload.push({
                    date: finalDate, sno: sno, company: company, name: name, contact: contact,
                    email: email, address: "", note: finalNote, purpose: purpose, status: finalStatus
                });
            }

            if (bulkPayload.length === 0) {
                toast.error("No valid data found.", { id: toastId });
                return;
            }

            try {
                toast.loading(`Uploading ${bulkPayload.length} leads...`, { id: toastId });
                const BULK_URL = `${BASE_URL_FIX}/api/leads/bulk-import/`;
                const res = await axios.post(BULK_URL, bulkPayload, getAuthHeaders());
                toast.success(res.data.message, { id: toastId });
                fetchLeads(1);
            } catch (error) {
                console.error("Import Failed:", error);
                let errMsg = "Import failed!";
                if (error.response?.data) {
                    if (Array.isArray(error.response.data)) {
                        const errIndex = error.response.data.findIndex(e => Object.keys(e).length > 0);
                        if (errIndex !== -1) {
                            const errDetail = error.response.data[errIndex];
                            errMsg = `Row ${errIndex + 1} Error: ${JSON.stringify(errDetail)}`;
                        }
                    } else {
                        errMsg = `Server Error: ${JSON.stringify(error.response.data)}`;
                    }
                }
                toast.error(errMsg, { id: toastId, duration: 8000 });
            }
            e.target.value = null; 
        };
        reader.readAsArrayBuffer(file);
    };

    // --- ✏️ EDIT & SAVE LOGIC ---
    const handleEditClick = (lead) => {
        setEditingId(lead.id); 
        setNewLead({
            ...lead,
            date: lead.date ? lead.date.slice(0, 16) : getCurrentDateTime(),
            sno: lead.sno || '',
            note: lead.note || '',
            address: lead.address || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast("Editing Mode On ✏️", { icon: 'ℹ️', style: { background: '#333', color: '#fff' } });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewLead({ date: getCurrentDateTime(), sno: '', company: '', name: '', contact: '', email: '', address: '', note: '', purpose: '', status: 'New' });
    };

    const handleSaveOrUpdate = async () => {
        if (!newLead.company) { toast.error("Company Name is Required!"); return; }
        
        setIsLoading(true); 
        try {
            const headers = getAuthHeaders();
            
            if (editingId) {
                await axios.patch(`${LEAD_API_URL}${editingId}/`, newLead, headers);
                toast.success("Lead Updated Successfully! 🔄");
            } else {
                await axios.post(LEAD_API_URL, newLead, headers);
                toast.success("Saved Successfully! ✅");
            }

            fetchLeads(currentPage); 
            handleCancelEdit(); 

        } catch (error) { 
            console.error(error);
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Operation failed.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };


    // --- ACTIONS ---
    const handleMoveToSalesTrigger = (l) => {
        setCurrentLeadForTask(l);
        setShowModal(true); 
    };
    
    const confirmMoveToSales = async (lead, date, priority, remarks) => {
        const toastId = toast.loading("Creating Task...");
        const headers = getAuthHeaders();
        const taskPayload = {
            lead_name: lead.name, company: lead.company, contact: lead.contact,
            task_type: 'Call', next_follow_up: date, priority: priority, remarks: remarks,
            date: getCurrentDateTime().split('T')[0],
        };
        try {
            await axios.post(TASK_API_URL, taskPayload, headers); 
            await axios.patch(`${LEAD_API_URL}${lead.id}/`, { status: 'Interested' }, headers); 
            setLeads(leads.map(l => l.id === lead.id ? { ...l, status: 'Interested' } : l));
            toast.success("Task Created and Lead Updated! 📞", { id: toastId });
            setShowModal(false); 
        } catch (error) { 
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Task creation failed.";
            toast.error(message, { id: toastId }); 
            setShowModal(false);
        }
    };

    const handleConvertTrigger = (lead) => {
        const leadToConvert = leads.find(l => l.id === lead.id); 
        if (leadToConvert) {
            setCurrentLeadForTask(leadToConvert);
            setShowPaymentModal(true); 
        }
    };
    
    const confirmPaymentRecord = async (leadId, paymentData) => {
        const toastId = toast.loading("Processing Deal...");
        try {
            const headers = getAuthHeaders();
            await axios.post(`${LEAD_API_URL}${leadId}/convert/`, paymentData, headers); 
            setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: 'Converted' } : lead));
            toast.success("Payment Record Created! 💰", { id: toastId });
            setShowPaymentModal(false); 
        } catch (error) { 
            console.error("Payment API Error:", error.response?.data);
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Failed to finalize the deal!";
            toast.error(message, { id: toastId }); 
        }
    };

    const handleDeleteTrigger = (id) => {
        toast.custom((t) => (
            <div style={{ 
                background: '#1a1a1a', border: '1px solid #ff4444', padding: '15px', borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)', color: '#fff', minWidth: '300px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px', marginRight: '10px' }}>🗑️</span>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>Delete this Lead?</div>
                        <div style={{ fontSize: '12px', color: '#bbb' }}>This action cannot be undone.</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => { toast.dismiss(t.id); confirmDelete(id); }} style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Yes, Delete</button>
                    <button onClick={() => toast.dismiss(t.id)} style={{ background: '#333', border: '1px solid #555', color: '#e0e0e0', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                </div>
            </div>
        ), { duration: Infinity, position: 'top-center' });
    };

    const confirmDelete = async (id) => {       
        try { 
            const headers = getAuthHeaders();
            await axios.delete(`${LEAD_API_URL}${id}/`, headers); 
            setLeads(leads.filter(l => l.id !== id)); 
            if (selectedIds.includes(id)) {
                setSelectedIds(selectedIds.filter(itemId => itemId !== id));
            }
            toast.success("Deleted Successfully!"); 
        } catch (error) {
            const message = error.message.includes("Unauthorized") || error.response?.status === 401
                ? "Unauthorized: Please log in first." 
                : "Delete failed.";
            toast.error(message);
        }
    };

    const handleInputChange = (e) => setNewLead({ ...newLead, [e.target.name]: e.target.value });
    
    const handleExport = () => {
        if (leads.length === 0) {
            toast.error("There are no leads to export.");
            return;
        }
        const dataToExport = leads.map(lead => ({
            Date: formatDateTime(lead.date), Company: lead.company, Name: lead.name,
            Contact: lead.contact, Email: lead.email, Address: lead.address,
            Status: lead.status, Purpose: lead.purpose, Note: lead.note
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Leads Data");
        XLSX.writeFile(wb, "My_Leads.xlsx");
        toast.success("Excel file downloaded successfully! 📥");
    };

    // --- STYLES ---
    const styles = {
        container: { background: '#1a1a1a', borderRadius: '15px', padding: '25px', boxShadow: '0 0 30px rgba(0,0,0,0.5)', border: '1px solid #333', color: '#e0e0e0', minHeight: '80vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' },
        title: { fontSize: '24px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', background: 'linear-gradient(90deg, #fff, #999)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        btnPrimary: { background: 'linear-gradient(45deg, #00ffcc, #00c3ff)', border: 'none', padding: '10px 20px', color: '#000', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', boxShadow: '0 0 10px rgba(0, 255, 204, 0.3)', transition: '0.3s' },
        btnSuccess: { background: 'linear-gradient(45deg, #11998e, #38ef7d)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' },
        btnImport: { background: 'linear-gradient(45deg, #ff9966, #ff5e62)', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' },
        btnBulkDelete: { background: '#ff4444', border: 'none', padding: '10px 20px', color: '#fff', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer', marginRight: '10px', boxShadow: '0 0 10px rgba(255, 68, 68, 0.4)' },
        checkbox: { cursor: 'pointer', width: '16px', height: '16px', accentColor: '#00ffcc' },
        tableContainer: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #333' },
        table: { width: '100%', borderCollapse: 'collapse', minWidth: '1500px' }, 
        th: { background: '#252525', color: '#00ffcc', padding: '15px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #00ffcc', whiteSpace: 'nowrap' },
        td: { padding: '12px 15px', borderBottom: '1px solid #333', color: '#bbb', fontSize: '14px' },
        input: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none', fontSize: '13px' },
        select: { width: '100%', background: '#111', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '4px', outline: 'none' },
        filterSelect: { padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#222', color: '#fff', outline: 'none', fontSize: '14px', cursor: 'pointer', width: '100%' },
        btnDelete: { background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
        btnFollow: { background: 'transparent', border: '1px solid #00ffcc', color: '#00ffcc', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
        btnConvert: { background: 'transparent', border: '1px solid #00ffcc', color: '#00ffcc', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.title}>Lead Manager</div>
                
                {/* 🔍 SEARCH & FILTERS SECTION */}
                <div style={{ flex: 1, margin: '0 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    
                    {/* Search */}
                    <div style={{ flex: 2 }}>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#222', color: '#fff', outline: 'none', fontSize: '14px' }} 
                        />
                    </div>

                    {/* Status Filter */}
                    <div style={{ flex: 1 }}>
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)} 
                            style={styles.filterSelect}
                        >
                            <option value="">All Status</option>
                            <option value="New">New</option>
                            <option value="Interested">Interested</option>
                            <option value="Converted">Converted</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div style={{ flex: 1 }}>
                        <select 
                            value={filterDays} 
                            onChange={(e) => setFilterDays(e.target.value)} 
                            style={styles.filterSelect}
                        >
                            <option value="">All Time</option>
                            <option value="0">Today</option>
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                        </select>
                    </div>

                </div>
                {/* 🔍 END FILTERS */}

                {/* BUTTONS */}
                <div>
                    {!isReadOnly && (
                        <>
                             {selectedIds.length > 0 && (
                                <button style={styles.btnBulkDelete} onClick={handleBulkDelete}>
                                    Delete ({selectedIds.length})
                                </button>
                            )}
                            
                            {editingId ? (
                                <>
                                    <button style={{...styles.btnPrimary, background: 'linear-gradient(45deg, #ffbb33, #ff8800)'}} onClick={handleSaveOrUpdate}>🔄 Update</button>
                                    <button style={{...styles.btnBulkDelete, background: '#555', marginLeft: '10px'}} onClick={handleCancelEdit}>✖ Cancel</button>
                                </>
                            ) : (
                                <button style={styles.btnPrimary} onClick={handleSaveOrUpdate}>+ Save</button>
                            )}

                            <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileChange} />
                            <button style={styles.btnImport} onClick={handleImportClick}>📥 Import</button>
                        </>
                    )}
                    <button style={styles.btnSuccess} onClick={handleExport}>Export</button>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {!isReadOnly && (
                                <th style={{...styles.th, textAlign: 'center', width: '40px'}}>
                                    <input type="checkbox" onChange={handleSelectAll} checked={leads.length > 0 && selectedIds.length === leads.length} style={styles.checkbox} />
                                </th>
                            )}
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
                        {/* FORM ROW */}
                        {!isReadOnly && (
                            <tr style={{ background: '#2a2a2a' }}>
                                <td style={styles.td}></td> 
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
                                        <option>New</option><option>Converted</option><option>Interested</option><option>Closed</option>
                                    </select>
                                </td>
                                <td style={styles.td}>✨</td>
                            </tr>
                        )}

                        {/* DATA ROWS */}
                        {isLoading ? (
                            <tr><td colSpan="12" style={{ padding: '20px', textAlign: 'center', color: '#00ffcc' }}>Loading data...</td></tr>
                        ) : (
                            leads.map((l, index) => (
                                <tr key={l.id} style={{ borderBottom: '1px solid #222', background: selectedIds.includes(l.id) ? 'rgba(0, 255, 204, 0.1)' : 'transparent' }} className="hover-row">
                                    
                                    {!isReadOnly && (
                                        <td style={{...styles.td, textAlign: 'center'}}>
                                            <input type="checkbox" checked={selectedIds.includes(l.id)} onChange={() => handleCheckboxChange(l.id)} style={styles.checkbox} />
                                        </td>
                                    )}

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
                                            {!isReadOnly ? (
                                                <>
                                                    <button onClick={() => handleEditClick(l)} title="Edit Lead" style={{ background: 'transparent', border: '1px solid #ffbb33', color: '#ffbb33', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                                                    <button style={styles.btnFollow} onClick={() => handleMoveToSalesTrigger(l)} title="Send to Sales">Follow Up 📞</button>
                                                    {l.status !== 'Converted' && (
                                                        <button style={styles.btnConvert} onClick={() => handleConvertTrigger(l)} title="Convert">Convert 💰</button>
                                                    )}
                                                    <button style={styles.btnDelete} onClick={() => handleDeleteTrigger(l.id)}>Del</button>
                                                </>
                                            ) : (
                                                <span style={{fontSize: '16px', opacity: 0.7}}>👁️ View Only</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '15px', color: '#fff' }}>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '8px 15px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '5px' }}
                    >
                        Previous
                    </button>
                    <span style={{ alignSelf: 'center' }}>Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '8px 15px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: '#00ffcc', color: '#000', border: 'none', fontWeight: 'bold', borderRadius: '5px' }}
                    >
                        Next
                    </button>
                </div>
            )}
            
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <FollowUpModal lead={currentLeadForTask} onClose={() => setShowModal(false)} onConfirm={confirmMoveToSales} />
                </div>
            )}
            {showPaymentModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <PaymentDetailsModal lead={currentLeadForTask} onClose={() => setShowPaymentModal(false)} onConfirm={confirmPaymentRecord} />
                </div>
            )}
            <style>{`
                .hover-row:hover { background-color: #252525 !important; }
                input:focus, select:focus { border-color: #00ffcc !important; box-shadow: 0 0 8px rgba(0, 255, 204, 0.3); }
                input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: #111; }
                ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
            `}</style>
        </div>
    );
};

export default LeadManager;