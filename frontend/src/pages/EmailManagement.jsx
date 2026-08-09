import React, { useEffect, useState } from 'react';
import useAdminStore from '../store/adminStore';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../api/apiClient';

const EmailManagement = () => {
  const smtpConfig = useAdminStore((state) => state.smtpConfig);
  const fetchSmtpConfig = useAdminStore((state) => state.fetchSmtpConfig);
  const updateSmtpConfig = useAdminStore((state) => state.updateSmtpConfig);
  const sendTestEmail = useAdminStore((state) => state.sendTestEmail);

  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [secure, setSecure] = useState(false);

  const [testTarget, setTestTarget] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchSmtpConfig();
    loadHistory();
    loadTemplates();
  }, [fetchSmtpConfig]);

  useEffect(() => {
    if (smtpConfig) {
      setHost(smtpConfig.host || '');
      setPort(smtpConfig.port || 587);
      setUsername(smtpConfig.username || '');
      setFromEmail(smtpConfig.fromEmail || '');
      setSecure(smtpConfig.secure || false);
    }
  }, [smtpConfig]);

  const loadHistory = async () => {
    try {
      const res = await apiClient.get('/admin/monitoring/smtp/history');
      if (res.data.success) setHistory(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await apiClient.get('/admin/monitoring/smtp/templates');
      if (res.data.success) setTemplates(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateSmtpConfig({
      host,
      port,
      username,
      password,
      fromEmail,
      secure
    });
    alert('SMTP parameters updated successfully!');
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testTarget.trim()) return;

    setTestLoading(true);
    setTestResult(null);

    try {
      await sendTestEmail(testTarget);
      setTestResult({ success: true, message: 'Test email dispatched successfully!' });
      loadHistory();
    } catch (err) {
      setTestResult({ success: false, message: err.response?.data?.message || 'SMTP Connection failed.' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left select-none max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Mail className="w-6 h-6 text-brand-400" />
          <span>Email & SMTP Management</span>
        </h1>
        <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
          Configure mail transport credentials, edit welcome templates, and inspect dispatch logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration settings form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">
              SMTP Server Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">SMTP Host</label>
                <input
                  type="text"
                  required
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="smtp.mailgun.org"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">SMTP Port</label>
                <input
                  type="number"
                  required
                  value={port}
                  onChange={(e) => setPort(parseInt(e.target.value))}
                  placeholder="587"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">SMTP Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="postmaster@domain.com"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">SMTP Password</label>
                <input
                  type="password"
                  required={!smtpConfig}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Encrypted password"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sender Email (From)</label>
                <input
                  type="email"
                  required
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="noreply@domain.com"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1 flex items-center pt-5">
                <label className="flex items-center space-x-2 text-xs font-bold text-zinc-400 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={secure}
                    onChange={(e) => setSecure(e.target.checked)}
                    className="h-4.5 w-4.5 bg-zinc-950 border border-zinc-900 text-brand-500 rounded focus:ring-0"
                  />
                  <span>Enforce SSL / TLS Secure Connection</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg"
              >
                Save SMTP Config
              </button>
            </div>
          </form>

          {/* Mail template listing */}
          <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">
              System Email Templates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 bg-zinc-900 text-[10px] font-bold text-brand-400 border border-zinc-800 rounded">
                      {tpl.key}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{tpl.subject}</h4>
                  <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed font-semibold">{tpl.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Send Test Email widget & History list */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleSendTest} className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">
              SMTP Connection Test
            </h3>

            <div className="space-y-3 text-xs">
              <input
                type="email"
                required
                placeholder="Recipient Email (e.g. test@domain.com)"
                value={testTarget}
                onChange={(e) => setTestTarget(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={testLoading}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 text-white rounded-xl font-bold shadow-md"
              >
                {testLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                <span>Send Test Mail</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3.5 border rounded-xl text-[10px] font-semibold leading-relaxed ${
                testResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {testResult.message}
              </div>
            )}
          </form>

          {/* Email History */}
          <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">
              Dispatch Logs History
            </h3>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {history.map((log) => (
                <div key={log.id} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-white truncate max-w-[120px]">{log.to}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      log.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate font-semibold">{log.subject}</div>
                  <div className="text-[9px] text-zinc-500 font-mono">{new Date(log.sentAt).toLocaleTimeString()}</div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-4 text-xs text-zinc-500 italic">No emails logs logged</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailManagement;
