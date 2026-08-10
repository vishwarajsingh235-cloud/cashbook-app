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
  UserCheck
} from 'lucide-react';

export default function CashLedgerDashboard() {
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

  // Load Saved Data
  useEffect(() => {
    try {
      const savedTxns = localStorage.getItem('cl_transactions');
      if (savedTxns) setTransactions(JSON.parse(savedTxns));

      const savedParties = localStorage.getItem('cl_parties');
      if (savedParties) {
        const parsedParties = JSON.parse(savedParties);
        setParties(parsedParties);
        if (parsedParties.length > 0 && !selectedParty) {
          setSelectedParty(parsedParties[0]);
        }
      }

      const savedProfile = localStorage.getItem('cl_profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        setBusinessName(p.businessName || 'My Business');
        setPhone(p.phone || '');
        setEmail(p.email || '');
        setAddress(p.address || '');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Summary Calculations
  const totalCashIn = transactions
    .filter(t => t.txn_type === 'CASH_IN')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const totalCashOut = transactions
    .filter(t => t.txn_type === 'CASH_OUT')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);

  const netBalance = totalCashIn - totalCashOut;

  // Selected Party Summary
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

  // Add Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      const newTxn = {
        id: Date.now(),
        party_id: activeTab === 'parties' && selectedParty ? selectedParty.id : null,
        txn_type: txnType,
        amount: parseFloat(amount),
        payment_mode: paymentMode,
        remarks: remarks || (activeTab === 'parties' && selectedParty ? `${txnType === 'CASH_IN' ? 'Payment from' : 'Payment to'} ${selectedParty.name}` : 'Cash Transaction'),
        txn_date: new Date().toISOString()
      };

      const updated = [newTxn, ...transactions];
      setTransactions(updated);
      localStorage.setItem('cl_transactions', JSON.stringify(updated));

      setShowModal(false);
      setAmount('');
      setRemarks('');
    } catch (err) {
      alert('Failed to save entry.');
    }
  };

  // Add Party
  const handleAddParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName) return;

    try {
      const newParty = {
        id: Date.now(),
        name: partyName,
        phone: partyPhone
      };

      const updated = [newParty, ...parties];
      setParties(updated);
      localStorage.setItem('cl_parties', JSON.stringify(updated));
      setSelectedParty(newParty);

      setShowAddPartyModal(false);
      setPartyName('');
      setPartyPhone('');
    } catch (err) {
      alert('Failed to save party.');
    }
  };

  // Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = { businessName, phone, email, address };
    localStorage.setItem('cl_profile', JSON.stringify(profile));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Clear Entries
  const handlePurgeData = () => {
    if (confirm('Are you sure you want to clear all transaction records?')) {
      localStorage.removeItem('cl_transactions');
      localStorage.removeItem('cl_parties');
      setTransactions([]);
      setParties([]);
      setSelectedParty(null);
    }
  };

  // PDF Generator: Forced Times New Roman + Logo before CashLedger text
  const downloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    // Explicitly set default Times font
    doc.setFont('times', 'normal');

    const badgeText = businessName
      .trim()
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'CB';

    // 1. Outer Frame Border
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.rect(8, 8, 194, 281);

    // 2. Top Header Logo Badge
    doc.setFillColor(24, 24, 27);
    doc.roundedRect(14, 14, 16, 16, 3, 3, 'F');
    doc.setTextColor(244, 244, 245);
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text(badgeText, 17, 24);

    // 3. Store Header Details (Times New Roman Bold)
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

    // 4. Document Title
    doc.setTextColor(2, 132, 199);
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.text('ACCOUNT STATEMENT', 196, 20, { align: 'right' });

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 196, 26, { align: 'right' });

    // Divider Line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, 34, 196, 34);

    // 5. Metric Cards
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

    // 6. Data Table in Times New Roman Font
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
      styles: {
        font: 'times',
        fontSize: 9
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        font: 'times'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85],
        font: 'times'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 80 },
        2: { cellWidth: 22 },
        3: { cellWidth: 27, halign: 'right' },
        4: { cellWidth: 28, halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });

    // 7. Footer: [LOGO BADGE] -> "CashLedger" (Exact Bottom Right Alignment)
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Bottom Left Note
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8.5);
      doc.setFont('times', 'normal');
      doc.text('* Computer Generated Statement', 14, 281);

      // Bottom Right: LOGO BADGE FIRST, THEN TEXT "CashLedger"
      // Logo Badge Box at x = 160mm, y = 275.5mm
      doc.setFillColor(24, 24, 27);
      doc.roundedRect(160, 275.5, 8, 8, 2, 2, 'F');
      
      // "CL" inside logo badge
      doc.setTextColor(244, 244, 245);
      doc.setFontSize(6);
      doc.setFont('times', 'bold');
      doc.text('CL', 161.3, 281);

      // Neon Green Indicator Dot on Logo
      doc.setFillColor(34, 197, 94);
      doc.circle(166, 277.5, 0.7, 'F');

      // "CashLedger" Text RIGHT AFTER LOGO BADGE (x = 170mm)
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10.5);
      doc.setFont('times', 'bold');
      doc.text('CashLedger', 170, 281.5);
    }

    doc.save(`${businessName.replace(/[^a-zA-Z0-9]/g, '_')}_Statement.pdf`);
  };

  const filteredTransactions = transactions.filter(t => 
    (t.remarks && t.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.payment_mode && t.payment_mode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(partySearchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(partySearchTerm))
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <style jsx global>{`
        [data-nextjs-toast], [data-nextjs-dialog-overlay], #nextjs-dev-indicator { display: none !important; }
      `}</style>

      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col justify-between hidden md:flex border-r border-slate-800 shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-md shrink-0">
                <rect width="100" height="100" rx="26" fill="#18181B"/>
                <rect x="10" y="10" width="80" height="80" rx="20" stroke="#27272A" strokeWidth="2"/>
                <text x="46" y="63" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="44" fill="#F4F4F5" textAnchor="middle" letterSpacing="-3">CL</text>
                <circle cx="74" cy="28" r="5" fill="#22C55E"/>
              </svg>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white uppercase">CashLedger</h1>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Business Cashbook</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <button 
              onClick={() => setActiveTab('daybook')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'daybook' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <BookOpen size={16} /> Cashbook
            </button>

            <button 
              onClick={() => setActiveTab('parties')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'parties' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Users size={16} /> Customers & Parties
            </button>

            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'reports' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <FileSpreadsheet size={16} /> Reports & Exports
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Settings size={16} /> Store Profile
            </button>
          </nav>
        </div>

        <div className="p-4 m-4 bg-slate-900/90 rounded-2xl border border-slate-800">
          <div className="text-xs font-bold text-white truncate">{businessName}</div>
          {phone && <div className="text-[10px] text-slate-400 font-semibold mt-0.5">+91 {phone}</div>}
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200/80 px-8 py-5 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === 'daybook' && 'Cashbook Entries'}
              {activeTab === 'parties' && 'Customer & Party Ledger'}
              {activeTab === 'reports' && 'Reports & Statements'}
              {activeTab === 'settings' && 'Store Profile'}
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{businessName}</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setTxnType('CASH_IN'); setShowModal(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Plus size={16} /> Cash In
            </button>
            <button 
              onClick={() => { setTxnType('CASH_OUT'); setShowModal(true); }}
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Minus size={16} /> Cash Out
            </button>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'daybook' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Cash In</p>
                    <h3 className="text-3xl font-black text-emerald-600 mt-1">
                      Rs. {totalCashIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                    <ArrowDownRight size={26} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Cash Out</p>
                    <h3 className="text-3xl font-black text-rose-600 mt-1">
                      Rs. {totalCashOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                    <ArrowUpRight size={26} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Net Balance</p>
                    <h3 className={`text-3xl font-black mt-1 ${netBalance >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>
                      Rs. {netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
                    <Wallet size={26} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-sm">Recent Transactions</h3>
                    <span className="text-[11px] bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-full font-extrabold">
                      {filteredTransactions.length} Total
                    </span>
                  </div>

                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search entries..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold w-48 md:w-64 shadow-sm"
                    />
                  </div>
                </div>

                <table className="w-full text-left border-collapse">
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
                        <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                          No transactions recorded yet.
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
                              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200/80 text-slate-700 rounded-md text-[10px] font-black uppercase tracking-wider">
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
            </>
          )}

          {activeTab === 'parties' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Party Accounts</h3>
                  <p className="text-xs text-slate-500 font-semibold">Manage customer and vendor ledger accounts</p>
                </div>
                <button 
                  onClick={() => setShowAddPartyModal(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <UserPlus size={16} /> Add Party Account
                </button>
              </div>

              {parties.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Users size={44} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-slate-700 text-base">No Party Accounts Added</p>
                  <button 
                    onClick={() => setShowAddPartyModal(true)}
                    className="mt-3 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase shadow-md cursor-pointer"
                  >
                    + Add Party
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column: Party Search & List */}
                  <div className="w-full md:w-80 shrink-0 space-y-3 border-r border-slate-100 pr-0 md:pr-4">
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

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
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

                  {/* Right Column: Selected Particular Party Workspace */}
                  <div className="flex-1 min-w-0">
                    {selectedParty ? (
                      <div className="space-y-4">
                        {/* Party Header Banner */}
                        <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                          <div>
                            <div className="flex items-center gap-2">
                              <UserCheck size={18} className="text-sky-400" />
                              <h3 className="text-lg font-black">{selectedParty.name}</h3>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{selectedParty.phone ? `+91 ${selectedParty.phone}` : 'No phone details'}</p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Ledger Balance</p>
                            <h4 className={`text-xl font-black ${partyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              Rs. {Math.abs(partyBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h4>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 inline-block mt-1">
                              {partyBalance >= 0 ? 'You Get (+ In)' : 'You Give (- Out)'}
                            </span>
                          </div>
                        </div>

                        {/* Particular Party Entry Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">Record Entry for {selectedParty.name}</h4>
                            <p className="text-[10px] text-slate-500">Add transaction directly to {selectedParty.name}'s account</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button 
                              onClick={() => { setTxnType('CASH_IN'); setShowModal(true); }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                            >
                              <Plus size={15} /> Received (+ Cash In)
                            </button>
                            <button 
                              onClick={() => { setTxnType('CASH_OUT'); setShowModal(true); }}
                              className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                            >
                              <Minus size={15} /> Given (- Cash Out)
                            </button>
                          </div>
                        </div>

                        {/* Particular Party History Table */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                          <table className="w-full text-left border-collapse">
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
                                    No entries recorded for {selectedParty.name} yet. Click <span className="text-emerald-600 font-bold">+ Received</span> or <span className="text-rose-600 font-bold">- Given</span> above.
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
                    ) : (
                      <div className="text-center py-16 text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-2xl">
                        Select a party from the left list to view or add entries.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Download Account Statements</h3>
              <p className="text-xs text-slate-500 mb-6">Generate and download PDF account reports</p>

              <div className="p-6 border border-slate-200/80 rounded-2xl hover:border-sky-500 transition-all bg-slate-50/30 max-w-md">
                <FileText size={32} className="text-sky-600 mb-3" />
                <h4 className="font-bold text-slate-900 text-base">PDF Account Statement</h4>
                <p className="text-xs text-slate-500 mt-1 mb-5">Printable A4 PDF statement</p>
                
                <button 
                  onClick={downloadPDF}
                  className="bg-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Download size={15} /> Download PDF
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm max-w-2xl">
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
                    className="bg-slate-950 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>

                  <button 
                    type="button"
                    onClick={handlePurgeData}
                    className="text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} /> Clear All Entries
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
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">Phone Number</label>
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