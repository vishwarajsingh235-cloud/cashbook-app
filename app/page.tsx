'use client';
import React, { useState, useEffect } from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Wallet, 
  Plus, 
  Minus, 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  Search,
  Download,
  FileText,
  CheckCircle2,
  UserPlus,
  Trash2,
  UserCheck,
  LogOut
} from 'lucide-react';
import { auth, googleProvider, db } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, query, where } from 'firebase/firestore';

export default function CashLedgerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('daybook');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState<any>(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);

  // Form Fields
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [txnType, setTxnType] = useState('CASH_IN');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [partySearchTerm, setPartySearchTerm] = useState('');

  // Profile Fields
  const [businessName, setBusinessName] = useState('My Business');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch User Data
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setParties([]);
      setSelectedParty(null);
      return;
    }

    const qTxns = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const unsubTxns = onSnapshot(qTxns, (snapshot) => {
      const txnsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      txnsData.sort((a: any, b: any) => new Date(b.txn_date).getTime() - new Date(a.txn_date).getTime());
      setTransactions(txnsData);
    });

    const qParties = query(collection(db, 'parties'), where('userId', '==', user.uid));
    const unsubParties = onSnapshot(qParties, (snapshot) => {
      const partiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParties(partiesData);
      if (partiesData.length > 0 && !selectedParty) {
        setSelectedParty(partiesData[0]);
      }
    });

    const unsubProfile = onSnapshot(doc(db, 'profiles', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const p = docSnap.data();
        setBusinessName(p.businessName || user.displayName || 'My Business');
        setPhone(p.phone || '');
        setEmail(p.email || user.email || '');
        setAddress(p.address || '');
      } else {
        setBusinessName(user.displayName || 'My Business');
        setEmail(user.email || '');
      }
    });

    return () => {
      unsubTxns();
      unsubParties();
      unsubProfile();
    };
  }, [user]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check internet connection.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const totalCashIn = transactions
    .filter(t => t.txn_type === 'CASH_IN')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const totalCashOut = transactions
    .filter(t => t.txn_type === 'CASH_OUT')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const netBalance = totalCashIn - totalCashOut;

  const partyTransactions = selectedParty 
    ? transactions.filter(t => t.party_id === selectedParty.id)
    : [];

  const partyCashIn = partyTransactions
    .filter(t => t.txn_type === 'CASH_IN')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const partyCashOut = partyTransactions
    .filter(t => t.txn_type === 'CASH_OUT')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const partyBalance = partyCashIn - partyCashOut;

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || parseFloat(amount) <= 0) return;

    try {
      const txnId = `txn_${Date.now()}`;
      await setDoc(doc(db, 'transactions', txnId), {
        userId: user.uid,
        party_id: activeTab === 'parties' && selectedParty ? selectedParty.id : null,
        txn_type: txnType,
        amount: parseFloat(amount),
        payment_mode: paymentMode,
        remarks: remarks || (activeTab === 'parties' && selectedParty ? `${txnType === 'CASH_IN' ? 'Payment from' : 'Payment to'} ${selectedParty.name}` : 'Cash Transaction'),
        txn_date: new Date().toISOString()
      });

      setShowModal(false);
      setAmount('');
      setRemarks('');
    } catch (err) {
      alert('Failed to save entry.');
    }
  };

  const handleAddParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !partyName) return;

    try {
      const partyId = `party_${Date.now()}`;
      const newPartyData = {
        userId: user.uid,
        name: partyName,
        phone: partyPhone
      };

      await setDoc(doc(db, 'parties', partyId), newPartyData);
      setSelectedParty({ id: partyId, ...newPartyData });

      setShowAddPartyModal(false);
      setPartyName('');
      setPartyPhone('');
    } catch (err) {
      alert('Failed to save party.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        userId: user.uid,
        businessName,
        phone,
        email: user.email,
        address
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert('Failed to save profile.');
    }
  };

  // FULL CASHBOOK STATEMENT PDF
  const downloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    doc.setFont('times', 'normal');

    const badgeText = businessName
      .trim()
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'CB';

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.rect(8, 8, 194, 281);

    doc.setFillColor(24, 24, 27);
    doc.roundedRect(14, 14, 16, 16, 3, 3, 'F');
    doc.setTextColor(244, 244, 245);
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text(badgeText, 17, 24);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text(businessName.toUpperCase(), 34, 20);

    const contactLine = [
      phone ? `Phone: +91 ${phone}` : '',
      address ? `Address: ${address}` : ''
    ].filter(Boolean).join(' | ');

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text(contactLine || 'Statement Summary', 34, 26);

    doc.setTextColor(2, 132, 199);
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.text('ACCOUNT STATEMENT', 196, 20, { align: 'right' });

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 196, 26, { align: 'right' });

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, 34, 196, 34);

    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, 38, 56, 18, 2, 2, 'FD');
    doc.setTextColor(21, 128, 61);
    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.text('TOTAL CREDIT', 18, 43);
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(11);
    doc.text(`Rs. ${totalCashIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 18, 51);

    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(74, 38, 56, 18, 2, 2, 'FD');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.text('TOTAL DEBIT', 78, 43);
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(11);
    doc.text(`Rs. ${totalCashOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 78, 51);

    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(186, 230, 253);
    doc.roundedRect(134, 38, 62, 18, 2, 2, 'FD');
    doc.setTextColor(3, 105, 161);
    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.text('NET BALANCE', 138, 43);
    doc.setTextColor(2, 132, 199);
    doc.setFontSize(11);
    doc.text(`Rs. ${Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${netBalance >= 0 ? 'Cr' : 'Dr'}`, 138, 51);

    const tableData = transactions.map((t) => {
      const p = parties.find(party => party.id === t.party_id);
      return [
        new Date(t.txn_date).toLocaleDateString('en-IN'),
        p ? `${p.name} - ${t.remarks}` : (t.remarks || 'Cash Transaction'),
        t.payment_mode || 'Cash',
        t.txn_type === 'CASH_OUT' ? parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-',
        t.txn_type === 'CASH_IN' ? parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'
      ];
    });

    autoTable(doc, {
      startY: 61,
      head: [['DATE', 'PARTICULARS / REMARKS', 'MODE', 'DEBIT (RS.)', 'CREDIT (RS.)']],
      body: tableData.length > 0 ? tableData : [['-', 'No transactions recorded', '-', '-', '-']],
      theme: 'grid',
      styles: { font: 'times', fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold', font: 'times' },
      bodyStyles: { fontSize: 9, textColor: [51, 65, 85], font: 'times' },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 80 }, 2: { cellWidth: 22 }, 3: { cellWidth: 27, halign: 'right' }, 4: { cellWidth: 28, halign: 'right' } },
      margin: { left: 14, right: 14 }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8.5);
      doc.setFont('times', 'normal');
      doc.text('* Computer Generated Statement', 14, 281);

      doc.setFillColor(24, 24, 27);
      doc.roundedRect(160, 275.5, 8, 8, 2, 2, 'F');
      
      doc.setTextColor(244, 244, 245);
      doc.setFontSize(6);
      doc.setFont('times', 'bold');
      doc.text('CL', 161.3, 281);

      doc.setFillColor(34, 197, 94);
      doc.circle(166, 277.5, 0.7, 'F');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10.5);
      doc.setFont('times', 'bold');
      doc.text('CashLedger', 170, 281.5);
    }

    doc.save(`${businessName.replace(/[^a-zA-Z0-9]/g, '_')}_Statement.pdf`);
  };

  // INDIVIDUAL PARTY ICON-TYPE PDF
  const downloadPartyPDF = async () => {
    if (!selectedParty) return;

    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    doc.setFont('times', 'normal');

    const badgeText = businessName
      .trim()
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'CB';

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.rect(8, 8, 194, 281);

    doc.setFillColor(24, 24, 27);
    doc.roundedRect(14, 14, 16, 16, 3, 3, 'F');
    doc.setTextColor(244, 244, 245);
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text(badgeText, 17, 24);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text(businessName.toUpperCase(), 34, 20);

    const contactLine = [
      phone ? `Phone: +91 ${phone}` : '',
      address ? `Address: ${address}` : ''
    ].filter(Boolean).join(' | ');

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text(contactLine || 'Party Ledger Statement', 34, 26);

    doc.setTextColor(2, 132, 199);
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.text('PARTY STATEMENT', 196, 20, { align: 'right' });

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 196, 26, { align: 'right' });

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, 34, 196, 34);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 38, 182, 14, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text(`PARTY: ${selectedParty.name.toUpperCase()}`, 18, 46);

    if (selectedParty.phone) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.text(`Phone: +91 ${selectedParty.phone}`, 120, 46);
    }

    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, 56, 56, 18, 2, 2, 'FD');
    doc.setTextColor(21, 128, 61);
    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.text('TOTAL RECEIVED (+IN)', 18, 61);
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(11);
    doc.text(`Rs. ${partyCashIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 18, 69);

    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(74, 56, 56, 18, 2, 2, 'FD');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.text('TOTAL GIVEN (-OUT)', 78, 61);
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(11);
    doc.text(`Rs. ${partyCashOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 78, 69);

    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(186, 230, 253);
    doc.roundedRect(134, 56, 62, 18, 2, 2, 'FD');
    doc.setTextColor(3, 105, 161);
    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.text('NET BALANCE', 138, 61);
    doc.setTextColor(2, 132, 199);
    doc.setFontSize(11);
    doc.text(`Rs. ${Math.abs(partyBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${partyBalance >= 0 ? '(You Get)' : '(You Give)'}`, 138, 69);

    const tableData = partyTransactions.map((t) => [
      new Date(t.txn_date).toLocaleDateString('en-IN'),
      t.remarks || 'Cash Entry',
      t.payment_mode || 'Cash',
      t.txn_type === 'CASH_OUT' ? parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-',
      t.txn_type === 'CASH_IN' ? parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'
    ]);

    autoTable(doc, {
      startY: 79,
      head: [['DATE', 'REMARKS / PARTICULARS', 'MODE', 'GIVEN (RS.)', 'RECEIVED (RS.)']],
      body: tableData.length > 0 ? tableData : [['-', `No entries recorded for ${selectedParty.name}`, '-', '-', '-']],
      theme: 'grid',
      styles: { font: 'times', fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold', font: 'times' },
      bodyStyles: { fontSize: 9, textColor: [51, 65, 85], font: 'times' },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 80 }, 2: { cellWidth: 22 }, 3: { cellWidth: 27, halign: 'right' }, 4: { cellWidth: 28, halign: 'right' } },
      margin: { left: 14, right: 14 }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8.5);
      doc.setFont('times', 'normal');
      doc.text('* Computer Generated Statement', 14, 281);

      doc.setFillColor(24, 24, 27);
      doc.roundedRect(160, 275.5, 8, 8, 2, 2, 'F');
      
      doc.setTextColor(244, 244, 245);
      doc.setFontSize(6);
      doc.setFont('times', 'bold');
      doc.text('CL', 161.3, 281);

      doc.setFillColor(34, 197, 94);
      doc.circle(166, 277.5, 0.7, 'F');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10.5);
      doc.setFont('times', 'bold');
      doc.text('CashLedger', 170, 281.5);
    }

    doc.save(`${selectedParty.name.replace(/[^a-zA-Z0-9]/g, '_')}_Statement.pdf`);
  };

  const filteredTransactions = transactions.filter(t => 
    (t.remarks && t.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.payment_mode && t.payment_mode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(partySearchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(partySearchTerm))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center text-slate-700 font-medium text-xs">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans antialiased">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 max-w-sm w-full shadow-sm text-center space-y-6">
          <div className="flex justify-center items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <rect width="100" height="100" rx="26" fill="#18181B"/>
              <rect x="10" y="10" width="80" height="80" rx="20" stroke="#27272A" strokeWidth="2"/>
              <text x="46" y="63" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="44" fill="#F4F4F5" textAnchor="middle" letterSpacing="-3">CL</text>
              <circle cx="74" cy="28" r="5" fill="#22C55E"/>
            </svg>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight uppercase">CashLedger</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900">Sign in to your account</h1>
            <p className="text-xs text-slate-500 font-medium">Access your daily cashbook and customer balances</p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-3 border border-slate-300 shadow-sm cursor-pointer transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">By continuing, your data syncs securely with your account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <style jsx global>{`
        [data-nextjs-toast], [data-nextjs-dialog-overlay], #nextjs-dev-indicator { display: none !important; }
      `}</style>

      {/* Sidebar (Responsive: Bottom/Top on mobile, Left on Desktop) */}
      <aside className="w-full md:w-64 bg-slate-950 text-white flex flex-row md:flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 shrink-0 p-4 md:p-0">
        <div className="flex md:flex-col items-center md:items-stretch justify-between md:justify-start w-full">
          <div className="p-2 md:p-6 md:border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-md shrink-0">
                <rect width="100" height="100" rx="26" fill="#18181B"/>
                <rect x="10" y="10" width="80" height="80" rx="20" stroke="#27272A" strokeWidth="2"/>
                <text x="46" y="63" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="44" fill="#F4F4F5" textAnchor="middle" letterSpacing="-3">CL</text>
                <circle cx="74" cy="28" r="5" fill="#22C55E"/>
              </svg>
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-black tracking-tight text-white uppercase">CashLedger</h1>
                <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Business Cashbook</p>
              </div>
            </div>
          </div>

          <nav className="flex md:flex-col p-2 md:p-4 space-x-1 md:space-x-0 md:space-y-1.5 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('daybook')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'daybook' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <BookOpen size={15} /> <span className="hidden sm:inline">Cashbook</span>
            </button>

            <button 
              onClick={() => setActiveTab('parties')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'parties' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Users size={15} /> <span className="hidden sm:inline">Customers & Parties</span>
            </button>

            <button 
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'reports' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <FileSpreadsheet size={15} /> <span className="hidden sm:inline">Reports</span>
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'settings' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Settings size={15} /> <span className="hidden sm:inline">Profile</span>
            </button>
          </nav>
        </div>

        <div className="hidden md:block p-4 m-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
          <div>
            <div className="text-xs font-bold text-white truncate">{businessName}</div>
            <div className="text-[10px] text-slate-400 font-semibold truncate">{user?.email}</div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 text-slate-300 py-2 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-4 md:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === 'daybook' && 'Cashbook Entries'}
              {activeTab === 'parties' && 'Customer & Party Ledger'}
              {activeTab === 'reports' && 'Reports & Statements'}
              {activeTab === 'settings' && 'Store Profile'}
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{businessName}</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button 
              onClick={() => { setTxnType('CASH_IN'); setShowModal(true); }}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Plus size={15} /> Cash In
            </button>
            <button 
              onClick={() => { setTxnType('CASH_OUT'); setShowModal(true); }}
              className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Minus size={15} /> Cash Out
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-y-auto">
          {activeTab === 'daybook' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Cash In</p>
                    <h3 className="text-2xl md:text-3xl font-black text-emerald-600 mt-1">
                      Rs. {totalCashIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                    <ArrowDownRight size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Cash Out</p>
                    <h3 className="text-2xl md:text-3xl font-black text-rose-600 mt-1">
                      Rs. {totalCashOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                    <ArrowUpRight size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Net Balance</p>
                    <h3 className={`text-2xl md:text-3xl font-black mt-1 ${netBalance >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>
                      Rs. {netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
                    <Wallet size={22} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-sm">Recent Transactions</h3>
                    <span className="text-[11px] bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-full font-extrabold">
                      {filteredTransactions.length} Total
                    </span>
                  </div>

                  <div className="relative w-full sm:w-auto">
                    <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search entries..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold w-full sm:w-64 shadow-sm"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-100/70 text-slate-600 text-[10px] uppercase font-black border-b border-slate-200">
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Particulars / Remarks</th>
                        <th className="p-4">Payment Method</th>
                        <th className="p-4 text-right">Cash In (Rs.)</th>
                        <th className="p-4 text-right">Cash Out (Rs.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-800">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-slate-400 font-medium text-xs">
                            No transactions recorded yet in your account.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((t) => {
                          const p = parties.find(party => party.id === t.party_id);
                          return (
                            <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4 text-slate-500 text-xs font-mono font-semibold">
                                {new Date(t.txn_date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                              </td>
                              <td className="p-4 font-bold text-slate-900">
                                {p ? (
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-xs">{p.name}</span>
                                    <span>{t.remarks}</span>
                                  </span>
                                ) : (t.remarks || 'Cash Transaction')}
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[10px] font-black uppercase tracking-wider">
                                  {t.payment_mode}
                                </span>
                              </td>
                              <td className="p-4 text-right font-bold text-emerald-600">
                                {t.txn_type === 'CASH_IN' ? `Rs. ${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                              </td>
                              <td className="p-4 text-right font-bold text-rose-600">
                                {t.txn_type === 'CASH_OUT' ? `Rs. ${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'parties' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 md:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900">Party Accounts</h3>
                  <p className="text-xs text-slate-500 font-semibold">Manage customer and vendor ledger accounts</p>
                </div>
                <button 
                  onClick={() => setShowAddPartyModal(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus size={15} /> Add Party Account
                </button>
              </div>

              {parties.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Users size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-slate-700 text-sm">No Party Accounts Added</p>
                  <button 
                    onClick={() => setShowAddPartyModal(true)}
                    className="mt-3 bg-sky-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase shadow-md cursor-pointer"
                  >
                    + Add Party
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column */}
                  <div className="w-full md:w-80 shrink-0 space-y-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search party..." 
                        value={partySearchTerm}
                        onChange={(e) => setPartySearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium w-full shadow-sm"
                      />
                    </div>

                    <div className="space-y-2 max-h-[300px] md:max-h-[500px] overflow-y-auto pr-1">
                      {filteredParties.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No party found matching search.</p>
                      ) : (
                        filteredParties.map((p) => {
                          const pTxns = transactions.filter(t => t.party_id === p.id);
                          const pIn = pTxns.filter(t => t.txn_type === 'CASH_IN').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
                          const pOut = pTxns.filter(t => t.txn_type === 'CASH_OUT').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
                          const pBal = pIn - pOut;

                          return (
                            <div 
                              key={p.id}
                              onClick={() => setSelectedParty(p)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                                selectedParty && selectedParty.id === p.id 
                                  ? 'border-sky-500 bg-sky-50/50 shadow-sm' 
                                  : 'border-slate-200/80 hover:bg-slate-50'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <h4 className="font-bold text-slate-900 text-sm truncate">{p.name}</h4>
                                <p className="text-[11px] text-slate-500 font-medium truncate">{p.phone ? `Phone: ${p.phone}` : 'No phone'}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className={`text-xs font-black ${pBal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  Rs. {Math.abs(pBal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase">
                                  {pBal >= 0 ? 'You Get' : 'You Give'}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex-1 min-w-0">
                    {selectedParty ? (
                      <div className="space-y-4">
                        {/* Party Header Banner with PDF Icon */}
                        <div className="bg-slate-900 text-white p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <UserCheck size={18} className="text-sky-400 shrink-0" />
                              <h3 className="text-base md:text-lg font-black truncate">{selectedParty.name}</h3>
                              
                              {/* PARTY PDF ICON BUTTON */}
                              <button 
                                onClick={downloadPartyPDF}
                                title="Download Party Statement PDF"
                                className="bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white p-2 rounded-xl transition-all cursor-pointer border border-slate-700/80 shadow-sm flex items-center justify-center shrink-0"
                              >
                                <Download size={15} />
                              </button>
                            </div>
                          </div>

                          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Ledger Balance</p>
                            <h4 className={`text-lg md:text-xl font-black ${partyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              Rs. {Math.abs(partyBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h4>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 inline-block mt-1">
                              {partyBalance >= 0 ? 'You Get (+ In)' : 'You Give (- Out)'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">Record Entry for {selectedParty.name}</h4>
                            <p className="text-[10px] text-slate-500">Add transaction directly to account</p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => { setTxnType('CASH_IN'); setShowModal(true); }}
                              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                            >
                              <Plus size={14} /> Received
                            </button>
                            <button 
                              onClick={() => { setTxnType('CASH_OUT'); setShowModal(true); }}
                              className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                            >
                              <Minus size={14} /> Given
                            </button>
                          </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                              <thead>
                                <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-black border-b border-slate-200">
                                  <th className="p-3">Date</th>
                                  <th className="p-3">Remarks / Particulars</th>
                                  <th className="p-3">Mode</th>
                                  <th className="p-3 text-right">Given (- Out)</th>
                                  <th className="p-3 text-right">Received (+ In)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                {partyTransactions.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-400 font-medium">
                                      No entries recorded for {selectedParty.name} yet.
                                    </td>
                                  </tr>
                                ) : (
                                  partyTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="p-3 text-slate-500 font-mono">
                                        {new Date(t.txn_date).toLocaleDateString('en-IN')}
                                      </td>
                                      <td className="p-3 font-bold text-slate-800">{t.remarks}</td>
                                      <td className="p-3">
                                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[9px] font-bold">
                                          {t.payment_mode}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right font-bold text-rose-600">
                                        {t.txn_type === 'CASH_OUT' ? `Rs. ${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                      </td>
                                      <td className="p-3 text-right font-bold text-emerald-600">
                                        {t.txn_type === 'CASH_IN' ? `Rs. ${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-2xl text-xs">
                        Select a party from the list to view entries.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Download Account Statements</h3>
              <p className="text-xs text-slate-500 mb-6">Generate and download PDF account reports</p>

              <div className="p-6 border border-slate-200/80 rounded-2xl hover:border-sky-500 transition-all bg-slate-50/30 max-w-md">
                <FileText size={32} className="text-sky-600 mb-3" />
                <h4 className="font-bold text-slate-900 text-base">PDF Account Statement</h4>
                <p className="text-xs text-slate-500 mt-1 mb-5">Printable A4 PDF statement</p>
                
                <button 
                  onClick={downloadPDF}
                  className="bg-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all w-full sm:w-auto"
                >
                  <Download size={15} /> Download PDF
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm max-w-2xl">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Store & Business Details</h3>
              <p className="text-xs text-slate-500 mb-6">Enter your business information to appear on PDF statements.</p>

              {saveSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} /> Business Profile Saved
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">Business / Firm Name</label>
                  <input 
                    type="text" 
                    required
                    value={businessName} 
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter business name"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter contact number"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">Address</label>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter business address"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button 
                    type="submit"
                    className="bg-slate-950 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase shadow-md cursor-pointer w-full sm:w-auto text-center"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className={`text-base font-extrabold uppercase tracking-wider mb-4 ${txnType === 'CASH_IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {activeTab === 'parties' && selectedParty ? `${txnType === 'CASH_IN' ? '+ Received From' : '- Given To'} ${selectedParty.name}` : (txnType === 'CASH_IN' ? '+ Record Cash In Entry' : '- Record Cash Out Entry')}
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">Amount (Rs.)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">Payment Method</label>
                <select 
                  value={paymentMode} 
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">Particulars / Remarks</label>
                <input 
                  type="text" 
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={activeTab === 'parties' && selectedParty ? `e.g. Received for bill` : "Enter entry details"}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-5 py-2 text-white rounded-xl font-bold text-xs uppercase shadow-md cursor-pointer ${txnType === 'CASH_IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Party Modal */}
      {showAddPartyModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-extrabold uppercase mb-4 text-slate-900">Add New Party</h3>
            <form onSubmit={handleAddParty} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">Party / Customer Name</label>
                <input 
                  type="text" 
                  required 
                  value={partyName} 
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Panwariya Pump"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <load className="block text-[10px] font-black text-slate-600 uppercase mb-1">Phone Number</load>
                <input 
                  type="text" 
                  value={partyPhone} 
                  onChange={(e) => setPartyPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddPartyModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-white bg-sky-600 hover:bg-sky-700 rounded-xl font-bold text-xs uppercase shadow-md cursor-pointer"
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}