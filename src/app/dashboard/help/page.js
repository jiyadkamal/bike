'use client';

import { motion } from 'framer-motion';
import { HelpCircle, Mail, MessageSquare, FileText, ExternalLink } from 'lucide-react';

const faqs = [
    { q: 'How do I create an organization?', a: 'Go to "Create Org" in the sidebar, fill in your organization name and state, then click "Create Organization". A unique joining code will be generated automatically.' },
    { q: 'How do members join my organization?', a: 'Share your organization\'s joining code with potential members. They can use the "Explore" page to find your organization and enter the code to request access.' },
    { q: 'How do I post messages?', a: 'Navigate to the "Messages" page from the sidebar. Type your message in the input field and press Send. All organization members can see the messages.' },
    { q: 'Who can remove members?', a: 'Only the organization admin (creator) can remove members from the organization via the Members page.' },
    { q: 'How do I leave an organization?', a: 'Contact the organization admin to remove you, or use the Settings page options if available.' },
];

export default function HelpPage() {
    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Help Center</h2>
                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Everything you need to get started with Biker OS</p>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { icon: MessageSquare, title: 'Contact Support', desc: 'Get in touch with our team', color: '#3b82f6', bg: '#eff6ff' },
                    { icon: FileText, title: 'Documentation', desc: 'Browse full docs', color: '#10b981', bg: '#ecfdf5' },
                    { icon: Mail, title: 'Email Us', desc: 'support@bikeros.com', color: '#f59e0b', bg: '#fffbeb' },
                ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            style={{ background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid rgba(229,231,235,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                        >
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                <Icon style={{ width: 20, height: 20, color: card.color }} />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{card.title}</h3>
                            <p style={{ fontSize: 13, color: '#9ca3af' }}>{card.desc}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* FAQs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid rgba(229,231,235,0.5)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>Frequently Asked Questions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {faqs.map((faq, i) => (
                        <div key={i} style={{ padding: '18px 0', borderTop: i > 0 ? '1px solid #f0f0f0' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                    <HelpCircle style={{ width: 14, height: 14, color: '#ff6b00' }} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 6 }}>{faq.q}</h4>
                                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{faq.a}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
