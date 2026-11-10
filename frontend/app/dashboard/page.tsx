'use client';

import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  user: string;
  loan: number | string;
  phone_number: string;
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [loan, setLoan] = useState('');
  const [phone_number, setPhone_number] = useState('');
  const [editingOldName, setEditingOldName] = useState<string | null>(null);

  const API_URL = 'http://localhost:4000/api/users';

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('فشل في جلب البيانات');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingOldName) {
      await fetch(`${API_URL}/${encodeURIComponent(editingOldName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, loan, phone_number }),
      });
      setEditingOldName(null);
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, loan, phone_number }),
      });
    }

    setName('');
    setLoan('');
    setPhone_number('');
    fetchUsers();
  };

  const handleEditSetup = (u: User) => {
    setEditingOldName(u.user);
    setName(u.user);
    setLoan(u.loan.toString());
    setPhone_number(u.phone_number || '');
  };

  const handleDelete = async (userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف الزبون: ${userName}؟`)) return;
    
    await fetch(`${API_URL}/${encodeURIComponent(userName)}`, {
      method: 'DELETE',
    });
    fetchUsers();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top right, #1a1a1a, #0d0d0d)', 
      color: '#fff', 
      padding: '40px 20px', 
      direction: 'rtl',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header Title */}
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
          <h1 style={{ color: '#f7a01c', fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            ⚡ لوحة التحكم الرئيسية (Dashboard)
          </h1>
          <p style={{ color: '#888', fontSize: '14px', margin: '5px 0 0 0' }}>
           دفتر  الكتروني
          </p>
        </div>

        {/* Form Box (Glassmorphism Style) */}
        <form onSubmit={handleSubmit} style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 150px', 
          gap: '15px', 
          marginBottom: '35px', 
          background: 'rgba(20, 20, 20, 0.75)', 
          backdropFilter: 'blur(10px)',
          padding: '25px', 
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <input 
            type="text" 
            placeholder="اسم الزبون..." 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={inputStyle}
          />
          <input 
            type="number" 
            step="0.001" 
            placeholder="المبلغ / القرض (JOD)" 
            value={loan} 
            onChange={(e) => setLoan(e.target.value)} 
            required 
            style={inputStyle}
          />
          <input 
            type="text" 
            placeholder="رقم الهاتف" 
            value={phone_number} 
            onChange={(e) => setPhone_number(e.target.value)} 
            required 
            style={inputStyle}
          />
          
          <div style={{ display: 'flex', gap: '8px', gridColumn: '1 / -1' }}>
            <button 
              type="submit" 
              style={{ 
                flex: 1,
                padding: '12px', 
                background: editingOldName ? '#4caf50' : '#f7a01c', 
                color: editingOldName ? '#fff' : '#000', 
                fontWeight: 'bold', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: editingOldName ? '0 4px 12px rgba(76, 175, 80, 0.3)' : '0 4px 12px rgba(247, 160, 28, 0.3)'
              }}
            >
              {editingOldName ? '💾 حفظ التعديلات' : '➕ إضافة زبون جديد'}
            </button>
            
            {editingOldName && (
              <button 
                type="button" 
                onClick={() => { setEditingOldName(null); setName(''); setLoan(''); setPhone_number(''); }}
                style={{ padding: '12px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                إلغاء
              </button>
            )}
          </div>
        </form>

        {/* Table Container */}
        <div style={{ 
          background: '#121212', 
          borderRadius: '16px', 
          border: '1px solid #222', 
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: '#181818', color: '#f7a01c', fontSize: '14px', borderBottom: '1px solid #262626' }}>
                <th style={thStyle}># ID</th>
                <th style={thStyle}>اسم الزبون</th>
                <th style={thStyle}>المبلغ (JOD)</th>
                <th style={thStyle}>رقم الهاتف</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u, idx) => (
                  <tr key={u.id} style={{ 
                    borderBottom: '1px solid #1a1a1a', 
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition: 'background 0.2s'
                  }}>
                    <td style={tdStyle}>{u.id}</td>
                    <td style={{ ...tdStyle, fontWeight: '600', color: '#fff' }}>{u.user}</td>
                    <td style={{ ...tdStyle, color: '#4caf50', fontWeight: 'bold' }}>{u.loan} د.أ</td>
                    <td style={{ ...tdStyle, color: '#aaa' }}>{u.phone_number || 'غير متوفر'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button 
                        onClick={() => handleEditSetup(u)} 
                        style={editBtnStyle}
                      >
                        تعديل
                      </button>
                      <button 
                        onClick={() => handleDelete(u.user)} 
                        style={deleteBtnStyle}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '15px' }}>
                    لا توجد بيانات مسجلة حالياً في قاعدة البيانات.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

// Styles Helper
const inputStyle: React.CSSProperties = {
  padding: '12px 15px', 
  borderRadius: '8px', 
  border: '1px solid #333', 
  background: '#181818', 
  color: '#fff', 
  outline: 'none',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box'
};

const thStyle: React.CSSProperties = {
  padding: '15px 20px', 
  fontWeight: '600'
};

const tdStyle: React.CSSProperties = {
  padding: '15px 20px', 
  fontSize: '14px',
  color: '#ddd'
};

const editBtnStyle: React.CSSProperties = {
  background: 'rgba(76, 175, 80, 0.15)', 
  color: '#4caf50', 
  border: '1px solid rgba(76, 175, 80, 0.3)', 
  padding: '6px 14px', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontWeight: '600',
  marginLeft: '8px',
  transition: 'all 0.2s'
};

const deleteBtnStyle: React.CSSProperties = {
  background: 'rgba(229, 9, 20, 0.15)', 
  color: '#e50914', 
  border: '1px solid rgba(229, 9, 20, 0.3)', 
  padding: '6px 14px', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontWeight: '600',
  transition: 'all 0.2s'
};