import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";

const PaymentStatus = () => {
  const [payments, setPayments] = useState([]);

  // --- MODAL STATES (For Task Handover) ---
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  
  // 👇 CHANGE 1: Added client_phone to state
  const [modalData, setModalData] = useState({
    company_name: "",
    task_name: "",
    client_name: "",
    client_phone: "", 
    client_id: "",
    gem_id: "",
    gem_password: "",
    priority: "Medium",
  });

  // --- EDITING STATES ---
  const [editingId, setEditingId] = useState(null);
  const [currentEditData, setCurrentEditData] = useState({});
  const [editReceiptFile, setEditReceiptFile] = useState(null);

  // --- NEW PAYMENT STATE ---
  const [newPay, setNewPay] = useState({
    company: "",
    so_no: "",
    amount: "",
    advance: "",
    remaining: "",
    invoice: "",
    remark: "",
  });

  // --- UPLOAD STATE ---
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  // --- BOTTOM PREVIEW STATE ---
  const [bottomPreview, setBottomPreview] = useState(null);

  // --- SECURITY CHECK ---
  const userRole = localStorage.getItem("role");
  const isReadOnly = userRole === "Tech";

  const BASE_API_URL = "https://my-crm-backend-a5q4.onrender.com";
  const API_URL = `${BASE_API_URL}/api/payments/`;
  // 👇 CHANGE 2: Added Leads API URL
  const LEADS_API_URL = `${BASE_API_URL}/api/leads/`;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // --- IMAGE PREVIEW CLEANUP ---
  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(receiptFile);
    setReceiptPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [receiptFile]);

  const getFullImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BASE_API_URL}${path}`;
  };

  const handleForceDownload = async (imageUrl, fileName) => {
    const toastId = toast.loading("Downloading...");
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss(toastId);
      toast.success("Download Started! 📥");
    } catch (error) {
      console.error("Download Error:", error);
      toast.error("Download failed. Image server par nahi hai.");
      toast.dismiss(toastId);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      setPayments(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load payments");
    }
  };

  // === EDIT HANDLERS ===
  const handleEditStart = (p) => {
    setEditingId(p.id);
    setCurrentEditData({ ...p });
    setEditReceiptFile(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentEditData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "amount" || name === "advance") {
        const total = parseFloat(updated.amount || 0);
        const adv = parseFloat(updated.advance || 0);
        updated.remaining = (total - adv).toFixed(2);
      }
      return updated;
    });
  };

  const handleEditSave = async (id) => {
    const formData = new FormData();
    formData.append("company", currentEditData.company);
    formData.append("so_no", currentEditData.so_no || "");
    formData.append("amount", parseFloat(currentEditData.amount) || 0);
    formData.append("advance", parseFloat(currentEditData.advance) || 0);
    formData.append("remaining", parseFloat(currentEditData.remaining) || 0);
    formData.append("invoice", currentEditData.invoice || "");
    formData.append("remark", currentEditData.remark || "");

    if (editReceiptFile) {
      formData.append("receipt", editReceiptFile);
    }

    try {
      await axios.patch(`${API_URL}${id}/`, formData, {
        headers: {
          ...getAuthHeaders().headers,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Record Updated Successfully!");
      setEditingId(null);
      setEditReceiptFile(null);
      fetchPayments();
    } catch (error) {
      console.error("Edit Save error:", error.response?.data);
      toast.error("Update Failed!");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setCurrentEditData({});
    setEditReceiptFile(null);
  };

  // 👇 CHANGE 3: Helper function to fetch client details from Leads API
  const fetchClientDetails = async (companyName) => {
    try {
      const response = await axios.get(`${LEADS_API_URL}?search=${companyName}`, getAuthHeaders());
      // Agar lead mili
      if (response.data.results && response.data.results.length > 0) {
        const lead = response.data.results[0]; 
        return { name: lead.name, phone: lead.contact };
      }
      return null;
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  };

  const renderCell = (p, field, type = "text") => {
    const isEditing = p.id === editingId;
    const value = isEditing ? currentEditData[field] : p[field];
    const isNumeric = type === "number" || field === "remaining";

    const displayValue =
      isNumeric && !isEditing
        ? `₹${parseFloat(value || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}`
        : value || "-";

    const displayStyle =
      field === "advance"
        ? { color: "#28a745" }
        : field === "remaining"
        ? { color: "#00ffcc", fontWeight: "bold" }
        : {};

    if (isEditing) {
      return (
        <input
          name={field}
          type={type}
          value={value || ""}
          onChange={handleEditChange}
          style={{
            ...styles.input,
            ...displayStyle,
            background: "#2a2a2a",
            border: "1px solid #ffbb33",
            padding: "4px 8px",
          }}
          readOnly={field === "remaining"}
        />
      );
    }
    return <span style={displayStyle}>{displayValue}</span>;
  };

  // 👇 CHANGE 4: Updated Go Through logic to auto-fetch details
  const handleGoThroughClick = async (payment) => {
    setSelectedPaymentId(payment.id);
    
    // Pehle modal khol do
    setModalData({
      company_name: payment.company,
      task_name: "",
      client_name: "Searching...", 
      client_phone: "",
      client_id: "",
      gem_id: "",
      gem_password: "",
      priority: "Medium",
    });
    setShowModal(true);

    // Background me number dhoondo
    const clientInfo = await fetchClientDetails(payment.company);
    
    if (clientInfo) {
        // Agar mil gaya to update kar do
        setModalData(prev => ({
            ...prev,
            client_name: clientInfo.name,
            client_phone: clientInfo.phone
        }));
        toast.success("Client Details Found! ✅");
    } else {
        setModalData(prev => ({ ...prev, client_name: "Not Found" }));
        toast.error("Lead nahi mili, number khud daalna padega.");
    }
  };

  // 👇 CHANGE 5: Updated Create Group logic to hit local bot server
  const handleCreateTaskWhatsApp = async () => {
    if (!modalData.client_phone) {
        toast.error("Phone Number nahi hai!");
        return;
    }

    const payload = {
        client_name: modalData.client_name,
        client_phone: modalData.client_phone,
        company_name: modalData.company_name
    };

    const toastId = toast.loading("Bot Starting...");

    try {
        // 👇 Local Laptop Server call
        await axios.post('http://localhost:5000/create-group', payload);
        toast.success("Command Sent! Chrome check kar.", { id: toastId });
    } catch (error) {
        toast.error("Failed! Kya 'bot_server' chal raha hai?", { id: toastId });
    }
  };

  const handleSubmitToTask = async () => {
    if (!modalData.task_name.trim()) {
      toast.error("Task Description is required!");
      return;
    }

    const taskData = {
      task_name: modalData.task_name.trim(),
      client_name: modalData.client_name || null,
      client_id: modalData.client_id || null,
      gem_id: modalData.gem_id || null,
      gem_password: modalData.gem_password || null,
      priority: modalData.priority,
    };

    try {
      const GO_THRU_URL = `${BASE_API_URL}/api/payments/${selectedPaymentId}/go-thru/`;
      await axios.post(GO_THRU_URL, taskData, getAuthHeaders());
      toast.success("Task sent to Tech Team successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Task creation failed:", error.response?.data);
      toast.error("Failed to send task!");
    }
  };

  const handleDeleteTrigger = (id) => {
    toast(
      (t) => (
        <div style={{ padding: "15px", textAlign: "center" }}>
          <p style={{ margin: "0 0 15px", color: "#fff", fontWeight: "bold" }}>
            Sure to delete this payment?
          </p>
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <button
              onClick={() => {
                confirmDelete(id);
                toast.dismiss(t.id);
              }}
              style={{
                background: "#ff4444",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                background: "#666",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 10000, style: { background: "#333" } }
    );
  };

  const confirmDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`, getAuthHeaders());
      setPayments((prev) => prev.filter((p) => p.id !== id));
      toast.success("Payment deleted!");
    } catch (error) {
      toast.error("Delete failed!");
    }
  };

  const handleExport = () => {
    if (payments.length === 0) return toast.error("No data to export!");

    const exportData = payments.map((p) => ({
      "S.No": p.sno || "-",
      Company: p.company,
      "SO No": p.so_no,
      "Total Amount": p.amount,
      Advance: p.advance,
      Remaining: p.remaining,
      Invoice: p.invoice,
      Remark: p.remark,
      "Has Receipt": p.receipt_image || p.receipt ? "Yes" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 10 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "Payment_List.xlsx");

    toast.success("Excel Downloaded Successfully! 📥");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPay((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "amount" || name === "advance") {
        const total = parseFloat(updated.amount) || 0;
        const adv = parseFloat(updated.advance) || 0;
        updated.remaining = (total - adv).toFixed(2);
      }
      return updated;
    });
  };

  const handleFileSelect = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setReceiptFile(null);
      return;
    }
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file!");
      return;
    }
    setReceiptFile(file);
  };

  const handleRemoveImage = () => {
    setReceiptFile(null);
    const fileInput = document.getElementById("receipt-upload-input");
    if (fileInput) fileInput.value = "";
  };

  const handleSave = async () => {
    if (!newPay.company.trim()) return toast.error("Company Name Required!");

    const formData = new FormData();
    formData.append("company", newPay.company.trim());
    formData.append("so_no", newPay.so_no);
    formData.append("amount", parseFloat(newPay.amount) || 0);
    formData.append("advance", parseFloat(newPay.advance) || 0);
    formData.append("remaining", parseFloat(newPay.remaining) || 0);
    formData.append("invoice", newPay.invoice);
    formData.append("remark", newPay.remark);

    if (receiptFile) {
      formData.append("receipt", receiptFile);
    }

    try {
      const res = await axios.post(API_URL, formData, {
        headers: {
          ...getAuthHeaders().headers,
          "Content-Type": "multipart/form-data",
        },
      });

      setPayments((prev) => [...prev, res.data]);

      setNewPay({
        company: "",
        so_no: "",
        amount: "",
        advance: "",
        remaining: "",
        invoice: "",
        remark: "",
      });
      setReceiptFile(null);
      const fileInput = document.getElementById("receipt-upload-input");
      if (fileInput) fileInput.value = "";

      toast.success("Payment Recorded!");
    } catch (error) {
      console.error(error.response?.data);
      toast.error("Error saving payment!");
    }
  };

  // === STYLES ===
  const styles = {
    container: {
      background: "#1a1a1a",
      borderRadius: "15px",
      padding: "25px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      border: "1px solid #333",
      color: "#e0e0e0",
      minHeight: "80vh",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      borderBottom: "1px solid #333",
      paddingBottom: "15px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      background: "linear-gradient(90deg, #00ffcc, #077ee0ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    btnPrimary: {
      background: "linear-gradient(45deg, #00ffcc, #00a6ffff)",
      border: "none",
      padding: "10px 20px",
      color: "#000",
      fontWeight: "bold",
      borderRadius: "5px",
      cursor: "pointer",
    },
    btnSuccess: {
      background: "linear-gradient(45deg, #11998e, #38ef7d)",
      border: "none",
      padding: "10px 20px",
      color: "#fff",
      fontWeight: "bold",
      borderRadius: "5px",
      cursor: "pointer",
      marginLeft: "10px",
    },
    table: { width: "100%", borderCollapse: "collapse", minWidth: "1200px" },
    th: {
      background: "#252525",
      color: "#00ffcc",
      padding: "15px",
      textAlign: "left",
      fontSize: "12px",
      textTransform: "uppercase",
      borderBottom: "2px solid #00ffcc",
    },
    td: {
      padding: "12px 15px",
      borderBottom: "1px solid #333",
      color: "#bbb",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      background: "#111",
      border: "1px solid #444",
      color: "#fff",
      padding: "8px",
      borderRadius: "4px",
      outline: "none",
    },
    goThruBtn: {
      background: "transparent",
      border: "1px solid #00ffcc",
      color: "#00ffcc",
      padding: "6px 12px",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "12px",
      marginRight: "8px",
    },
    deleteBtn: {
      background: "transparent",
      border: "1px solid #ff4444",
      color: "#ff4444",
      padding: "6px 12px",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "12px",
    },
    editBtn: {
      background: "transparent",
      border: "1px solid #00ffcc",
      color: "#00ffcc",
      padding: "6px 12px",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "12px",
      marginRight: "8px",
    },
    saveBtn: {
      background: "#00C49F",
      color: "#000",
      padding: "6px 12px",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "12px",
      marginRight: "8px",
    },
    modalRow: { display: `flex`, gap: "15px" },
    modalCol: { flex: 1 },
    select: {
      width: "100%",
      background: "#111",
      border: "1px solid #444",
      color: "#fff",
      padding: "8px",
      borderRadius: "4px",
    },
    uploadLabel: {
      cursor: "pointer",
      fontSize: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "35px",
      height: "35px",
      borderRadius: "50%",
      background: "#2a2a2a",
      border: "1px dashed #666",
      color: "#00ffcc",
      transition: "0.3s",
    },
    previewContainer: {
      position: "relative",
      width: "40px",
      height: "40px",
    },
    previewImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "5px",
      border: "1px solid #00ffcc",
    },
    removeImgBtn: {
      position: "absolute",
      top: "-5px",
      right: "-5px",
      background: "red",
      color: "white",
      borderRadius: "50%",
      width: "15px",
      height: "15px",
      fontSize: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      border: "none",
    },
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>Payment Status</div>
          <div>
            {!isReadOnly && (
              <button style={styles.btnPrimary} onClick={handleSave}>
                + Record Payment
              </button>
            )}
            <button style={styles.btnSuccess} onClick={handleExport}>
              Export Excel
            </button>
          </div>
        </div>

        <div
          style={{
            overflowX: "auto",
            borderRadius: "10px",
            border: "1px solid #333",
          }}
        >
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>S.No</th>
                <th style={styles.th}>Company Name</th>
                <th style={styles.th}>Sales Order No.</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Advance</th>
                <th style={styles.th}>Remaining</th>
                <th style={styles.th}>Invoice</th>
                <th style={styles.th}>Remark</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Receipt</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Security Check: Input Row Hide for Tech */}
              {!isReadOnly && (
                <tr style={{ background: "#2a2a2a" }}>
                  <td style={styles.td}>
                    <span style={{ color: "#666" }}>-</span>
                  </td>

                  <td style={styles.td}>
                    <input
                      name="company"
                      value={newPay.company}
                      onChange={handleInputChange}
                      placeholder="Company"
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      name="so_no"
                      value={newPay.so_no}
                      onChange={handleInputChange}
                      placeholder="SO-001"
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      name="amount"
                      type="number"
                      value={newPay.amount}
                      onChange={handleInputChange}
                      placeholder="0"
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      name="advance"
                      type="number"
                      value={newPay.advance}
                      onChange={handleInputChange}
                      placeholder="0"
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      value={newPay.remaining || ""}
                      readOnly
                      style={{
                        ...styles.input,
                        color: "#00ffcc",
                        fontWeight: "bold",
                      }}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      name="invoice"
                      value={newPay.invoice}
                      onChange={handleInputChange}
                      placeholder="INV-001"
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      name="remark"
                      value={newPay.remark}
                      onChange={handleInputChange}
                      placeholder="Note"
                      style={styles.input}
                    />
                  </td>

                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <input
                      type="file"
                      id="receipt-upload-input"
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleFileSelect}
                    />

                    {receiptPreview ? (
                      <div style={styles.previewContainer}>
                        <img
                          src={receiptPreview}
                          alt="Preview"
                          style={styles.previewImg}
                        />
                        <button
                          onClick={handleRemoveImage}
                          style={styles.removeImgBtn}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="receipt-upload-input"
                        style={styles.uploadLabel}
                        title="Upload Receipt"
                      >
                        📷
                      </label>
                    )}
                  </td>
                  <td style={styles.td}></td>
                </tr>
              )}

              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ ...styles.td, color: "#bbb" }}>
                    {p.sno || "-"}
                  </td>

                  <td
                    style={{ ...styles.td, color: "#fff", fontWeight: "bold" }}
                  >
                    {renderCell(p, "company")}
                  </td>
                  <td style={styles.td}>{renderCell(p, "so_no")}</td>
                  <td style={styles.td}>{renderCell(p, "amount", "number")}</td>
                  <td style={styles.td}>
                    {renderCell(p, "advance", "number")}
                  </td>
                  <td style={styles.td}>
                    {renderCell(p, "remaining", "number")}
                  </td>
                  <td style={styles.td}>{renderCell(p, "invoice")}</td>
                  <td style={styles.td}>{renderCell(p, "remark")}</td>

                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {p.id === editingId ? (
                      // EDIT MODE: Show Upload Button
                      <>
                        <input
                          type="file"
                          id={`edit-receipt-${p.id}`}
                          style={{ display: "none" }}
                          accept="image/*"
                          onChange={(e) =>
                            setEditReceiptFile(e.target.files[0])
                          }
                        />
                        <label
                          htmlFor={`edit-receipt-${p.id}`}
                          style={{
                            cursor: "pointer",
                            background: editReceiptFile ? "#00ffcc" : "#333",
                            color: editReceiptFile ? "#000" : "#fff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            border: "1px solid #555",
                            display: "inline-block",
                          }}
                        >
                          {editReceiptFile ? "File Selected" : "📷 Upload New"}
                        </label>
                      </>
                    ) : 
                    p.receipt_image || p.receipt ? (
                      <button
                        onClick={() => setBottomPreview(p)}
                        style={{
                          background: "transparent",
                          border: "1px solid #00ffcc",
                          color: "#00ffcc",
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          cursor: "pointer",
                          fontSize: "14px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="View Receipt"
                      >
                        👁️
                      </button>
                    ) : (
                      <span style={{ color: "#444", fontSize: "12px" }}>-</span>
                    )}
                  </td>

                  <td style={styles.td}>
                    {p.id === editingId ? (
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          style={styles.saveBtn}
                          onClick={() => handleEditSave(p.id)}
                        >
                          Save
                        </button>
                        <button
                          style={{
                            ...styles.deleteBtn,
                            border: "1px solid #666",
                            color: "#aaa",
                          }}
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "5px" }}>
                        {!isReadOnly && (
                          <>
                            <button
                              style={styles.editBtn}
                              onClick={() => handleEditStart(p)}
                            >
                              Edit
                            </button>

                            <button
                              style={styles.deleteBtn}
                              onClick={() => handleDeleteTrigger(p.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}

                        <button
                          style={styles.goThruBtn}
                          onClick={() => handleGoThroughClick(p)}
                        >
                          Go Through
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MODAL: GO THROUGH (Technical) --- */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.95)",
              backdropFilter: "blur(10px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "#1e1e1e",
                padding: "30px",
                borderRadius: "15px",
                width: "560px",
                maxWidth: "95vw",
                border: "2px solid #00ffcc",
                boxShadow: "0 0 40px rgba(0,255,204,0.5)",
              }}
            >
              <h3
                style={{
                  color: "#00ffcc",
                  textAlign: "center",
                  marginBottom: "25px",
                  fontSize: "22px",
                }}
              >
                Technical Handover
              </h3>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    color: "#bbb",
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Company Name
                </label>
                <input
                  type="text"
                  value={modalData.company_name}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      company_name: e.target.value,
                    })
                  }
                  style={styles.input}
                  readOnly
                />
              </div>

            {/* 👇 CHANGE 6: Added Client Name & Phone display below Company Name */}
            <div style={{display:'flex', gap:'10px', marginBottom: '15px'}}>
                <div style={{flex:1}}>
                    <label style={{color:'#bbb', fontSize:'12px'}}>Client Name</label>
                    <input value={modalData.client_name} readOnly style={{...styles.input, color: '#00ffcc'}} />
                </div>
                <div style={{flex:1}}>
                    <label style={{color:'#bbb', fontSize:'12px'}}>Phone</label>
                    <input value={modalData.client_phone} readOnly style={{...styles.input, color: '#00ffcc'}} />
                </div>
            </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    color: "#bbb",
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Task Description <span style={{ color: "#ff4444" }}>*</span>
                </label>
                <textarea
                  rows="4"
                  value={modalData.task_name}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      task_name: e.target.value,
                    })
                  }
                  style={{ ...styles.input, resize: "none" }}
                  placeholder="What needs to be done?"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    color: "#bbb",
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Priority
                </label>
                <select
                  value={modalData.priority}
                  onChange={(e) =>
                    setModalData({ ...modalData, priority: e.target.value })
                  }
                  style={styles.select}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div style={styles.modalRow}>
                <div style={styles.modalCol}>
                  <label
                    style={{
                      color: "#bbb",
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={modalData.client_name}
                    onChange={(e) =>
                      setModalData({
                        ...modalData,
                        client_name: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.modalCol}>
                  <label
                    style={{
                      color: "#bbb",
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={modalData.client_id}
                    onChange={(e) =>
                      setModalData({ ...modalData, client_id: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.modalRow}>
                <div style={styles.modalCol}>
                  <label
                    style={{
                      color: "#bbb",
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    Gem ID
                  </label>
                  <input
                    type="text"
                    value={modalData.gem_id}
                    onChange={(e) =>
                      setModalData({ ...modalData, gem_id: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.modalCol}>
                  <label
                    style={{
                      color: "#bbb",
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    Gem Password
                  </label>
                  <input
                    type="text"
                    value={modalData.gem_password}
                    onChange={(e) =>
                      setModalData({
                        ...modalData,
                        gem_password: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginTop: "25px",
                }}
              >
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#444",
                    color: "#fff",
                    border: "none",
                    padding: "12px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateTaskWhatsApp}
                  style={{
                    background: "#25D366",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "none",
                    padding: "12px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  Create Group
                </button>

                <button
                  onClick={handleSubmitToTask}
                  style={{
                    background: "linear-gradient(45deg, #00ffcc, #00c3ff)",
                    color: "#000",
                    fontWeight: "bold",
                    border: "none",
                    padding: "12px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  Send to Tech
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- BOTTOM PREVIEW PANEL --- */}
        {bottomPreview && (
          <div
            style={{
              marginTop: "30px",
              background: "#050505",
              border: "2px solid #00ffcc",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              animation: "fadeIn 0.5s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ color: "#00ffcc", margin: 0 }}>
                RECEIPT VIEW: {bottomPreview.company}
              </h3>
              <button
                onClick={() => setBottomPreview(null)}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "5px 15px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                CLOSE ✖
              </button>
            </div>

            {/* Image Display */}
            <img
              src={getFullImageUrl(
                bottomPreview.receipt_image || bottomPreview.receipt
              )}
              alt="Receipt Loading..."
              onError={(e) => {
                e.target.style.display = "none";
                toast.error(
                  "Image load nahi hui. Shayad server se delete ho gayi."
                );
              }}
              style={{
                maxWidth: "100%",
                maxHeight: "600px",
                borderRadius: "8px",
                border: "1px solid #333",
                objectFit: "contain",
              }}
            />

            <div style={{ marginTop: "15px" }}>
              <button
                onClick={() =>
                  handleForceDownload(
                    getFullImageUrl(
                      bottomPreview.receipt_image || bottomPreview.receipt
                    ),
                    `Receipt_${bottomPreview.company}.jpg`
                  )
                }
                style={{
                  background: "#00ffcc",
                  color: "#000",
                  padding: "12px 30px",
                  border: "none",
                  fontWeight: "bold",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                DOWNLOAD IMAGE ⬇️
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentStatus;