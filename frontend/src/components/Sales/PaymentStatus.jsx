import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

// --- 📋 RECEIPT MODAL COMPONENT (Added outside main component) ---
// --- 📋 UPDATED RECEIPT MODAL (Design like your screenshot) ---
const ReceiptModal = ({ payment, onClose }) => {
  if (!payment) return null;

  // Image URL handle karne ke liye
  const imageUrl = payment.receipt_image || payment.receipt;

  // Download Function
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Receipt_${payment.company}_${
        payment.so_no || "doc"
      }.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Download failed");
    }
  };

  const styles = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(4px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000,
    },
    modal: {
      background: "#181818",
      width: "650px",
      borderRadius: "12px",
      border: "1px solid #00ffcc",
      boxShadow: "0 0 30px rgba(0,255,204,0.2)",
      overflow: "hidden",
      fontFamily: "sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      padding: "15px 25px",
      borderBottom: "1px solid #333",
      background: "#111",
    },
    title: {
      color: "#00ffcc",
      margin: 0,
      fontSize: "16px",
      fontWeight: "bold",
      letterSpacing: "1px",
    },
    closeBtn: {
      background: "none",
      border: "none",
      color: "#ff4444",
      fontSize: "20px",
      cursor: "pointer",
      fontWeight: "bold",
    },

    body: { padding: "25px", color: "#ccc" },

    // Grid Layout for details
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginBottom: "20px",
    },
    item: { display: "flex", flexDirection: "column" },
    label: {
      fontSize: "11px",
      color: "#888",
      marginBottom: "4px",
      textTransform: "uppercase",
    },
    value: { fontSize: "15px", color: "#fff", fontWeight: "500" },

    // Image Section
    imageContainer: {
      marginTop: "10px",
      background: "#111",
      padding: "15px",
      borderRadius: "8px",
      border: "1px solid #333",
      textAlign: "center",
    },
    image: {
      maxWidth: "100%",
      maxHeight: "350px",
      borderRadius: "5px",
      objectFit: "contain",
    },

    // Footer Buttons
    footer: {
      marginTop: "20px",
      display: "flex",
      justifyContent: "flex-end",
      gap: "15px",
    },
    btnDownload: {
      background: "#00ffcc",
      color: "#000",
      border: "none",
      padding: "10px 20px",
      borderRadius: "5px",
      fontWeight: "bold",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>ORDER DETAILS</h3>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Details Grid */}
          <div style={styles.grid}>
            <div style={styles.item}>
              <span style={styles.label}>COMPANY NAME</span>
              <span style={styles.value}>{payment.company}</span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>SALES ORDER NO.</span>
              <span style={styles.value}>{payment.so_no || "-"}</span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>TOTAL AMOUNT</span>
              <span style={styles.value}>₹ {payment.amount}</span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>REMAINING</span>
              <span style={{ ...styles.value, color: "#ffbb33" }}>
                ₹ {payment.remaining}
              </span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>INVOICE</span>
              <span style={styles.value}>{payment.invoice || "-"}</span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>REMARK</span>
              <span style={styles.value}>{payment.remark || "-"}</span>
            </div>
          </div>

          {/* Receipt Image Section */}
          <div>
            <span style={styles.title}>PAYMENT RECEIPT</span>
            {imageUrl ? (
              <div style={styles.imageContainer}>
                <img src={imageUrl} alt="Receipt" style={styles.image} />

                <div style={styles.footer}>
                  <button onClick={handleDownload} style={styles.btnDownload}>
                    DOWNLOAD IMAGE
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#666",
                  background: "#111",
                  borderRadius: "5px",
                  marginTop: "10px",
                }}
              >
                No receipt uploaded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 🚀 MAIN COMPONENT ---
const PaymentStatus = () => {
  const [payments, setPayments] = useState([]);

  // MODAL STATES
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // 👇 NEW: View Receipt Modal State
  const [viewReceiptData, setViewReceiptData] = useState(null);

  const [modalData, setModalData] = useState({
    company_name: "",
    task_name: "",
    client_name: "",
    client_id: "",
    gem_id: "",
    gem_password: "",
    priority: "Medium",
  });

  // EDITING STATES
  const [editingId, setEditingId] = useState(null);
  const [currentEditData, setCurrentEditData] = useState({});

  // NEW PAYMENT STATE
  const [newPay, setNewPay] = useState({
    company: "",
    so_no: "",
    amount: "",
    advance: "",
    remaining: "",
    invoice: "",
    remark: "",
  });

  // UPLOAD STATE
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  // SECURITY CHECK
  const userRole = localStorage.getItem("role");
  const isReadOnly = userRole === "Tech";

  const BASE_API_URL = "https://my-crm-backend-a5q4.onrender.com";
  const API_URL = `${BASE_API_URL}/api/payments/`;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // IMAGE PREVIEW CLEANUP
  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(receiptFile);
    setReceiptPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [receiptFile]);

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
    const dataToSend = {
      ...currentEditData,
      amount: parseFloat(currentEditData.amount) || 0,
      advance: parseFloat(currentEditData.advance) || 0,
      remaining: parseFloat(currentEditData.remaining) || 0,
    };

    try {
      await axios.patch(`${API_URL}${id}/`, dataToSend, getAuthHeaders());
      toast.success("Record Updated!");
      setEditingId(null);
      fetchPayments();
    } catch (error) {
      console.error("Edit Save error:", error.response?.data);
      toast.error("Update Failed!");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setCurrentEditData({});
  };

  // === RENDER CELL (EDIT MODE) ===
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

  // === GO THROUGH MODAL ===
  const handleGoThroughClick = (payment) => {
    setSelectedPaymentId(payment.id);
    setModalData({
      company_name: payment.company,
      task_name: "",
      client_name: "",
      client_id: "",
      gem_id: "",
      gem_password: "",
      priority: "Medium",
    });
    setShowModal(true);
  };

  const handleCreateTaskWhatsApp = () => {
    window.open("https://web.whatsapp.com/", "_blank");
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
    toast.error("Export feature requires xlsx package.");
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
                <th style={styles.th}>Company Name</th>
                <th style={styles.th}>Sales Order No.</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Advance</th>
                <th style={styles.th}>Remaining</th>
                <th style={styles.th}>Invoice</th>
                <th style={styles.th}>Remark</th>
                {/* 👇 NEW COLUMN for Receipt */}
                <th style={{ ...styles.th, textAlign: "center" }}>Receipt</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Security Check: Input Row Hide for Tech */}
              {!isReadOnly && (
                <tr style={{ background: "#2a2a2a" }}>
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

                  {/* 📸 ACTION COLUMN WITH UPLOAD BUTTON (NEW PAYMENT) */}
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

                  {/* 👇 NEW COLUMN: VIEW RECEIPT BUTTON */}
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {p.receipt_image || p.receipt ? (
                      <button
                        onClick={() => setViewReceiptData(p)} // <--- Ye Modal Kholega
                        style={{
                          background: "#222",
                          border: "1px solid #00ffcc",
                          color: "#00ffcc",
                          borderRadius: "5px", // Thoda bada button banaya hai
                          width: "35px",
                          height: "35px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                        }}
                        title="View Receipt"
                      >
                        📷 {/* Camera Icon ya Eye Icon */}
                      </button>
                    ) : (
                      <span style={{ color: "#444", fontSize: "20px" }}>-</span>
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

        {/* --- MODAL 1: GO THROUGH (Technical) --- */}
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

        {/* --- 👇 MODAL 2: RECEIPT VIEW (New) --- */}
        {viewReceiptData && (
          <ReceiptModal
            payment={viewReceiptData}
            onClose={() => setViewReceiptData(null)}
          />
        )}
      </div>
    </>
  );
};

export default PaymentStatus;
