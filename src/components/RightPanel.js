'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, BookOpen, Crown, Mail, MapPin } from 'lucide-react';

const tabs = ['Overview', 'Members', 'Rules'];

export default function RightPanel({ organization }) {
    const [activeTab, setActiveTab] = useState('Overview');
    const org = organization;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb]/50 overflow-hidden"
        >
            {/* Tab header */}
            <div className="flex border-b border-[#e5e7eb]">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3.5 text-sm font-semibold transition-smooth relative ${activeTab === tab
                                ? 'text-[#ff6b00]'
                                : 'text-[#9ca3af] hover:text-[#6b7280]'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6b00]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
                {activeTab === 'Overview' && (
                    <div className="space-y-4">
                        {org ? (
                            <>
                                <div className="flex items-center gap-3 p-3 bg-[#f5f6fa] rounded-xl">
                                    <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#1a1a2e]">{org.name}</p>
                                        <p className="text-xs text-[#9ca3af]">Organization</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-[#6b7280]">State</span>
                                        <span className="text-sm font-semibold text-[#1a1a2e]">{org.state || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-t border-[#e5e7eb]/50">
                                        <span className="text-sm text-[#6b7280]">Joining Code</span>
                                        <span className="text-sm font-bold text-[#ff6b00] tracking-wider">{org.joiningCode}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-t border-[#e5e7eb]/50">
                                        <span className="text-sm text-[#6b7280]">Members</span>
                                        <span className="text-sm font-semibold text-[#1a1a2e]">{org.members?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-t border-[#e5e7eb]/50">
                                        <span className="text-sm text-[#6b7280]">Requests</span>
                                        <span className="text-sm font-semibold text-[#1a1a2e]">{org.pendingRequests?.length || 0}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-[#9ca3af] text-sm">No organization data available</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Members' && (
                    <div className="space-y-3">
                        {org?.members && org.members.length > 0 ? (
                            org.members.map((member, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f6fa] transition-smooth">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff6b00] to-[#ff8533] flex items-center justify-center text-white text-sm font-bold">
                                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1a1a2e] truncate">{member.name}</p>
                                        <p className="text-xs text-[#9ca3af] truncate">{member.email}</p>
                                    </div>
                                    {member.role === 'admin' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-[#ff6b00] text-xs font-bold rounded-lg">
                                            <Crown className="w-3 h-3" />
                                            Admin
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <Users className="w-10 h-10 text-[#e5e7eb] mx-auto mb-2" />
                                <p className="text-[#9ca3af] text-sm">No members to display</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Rules' && (
                    <div className="space-y-3">
                        {[
                            'Be respectful to all members',
                            'No spam or promotional content',
                            'Follow traffic safety guidelines',
                            'Admin decisions are final',
                            'Report issues to the admin'
                        ].map((rule, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#f5f6fa]">
                                <span className="w-6 h-6 rounded-lg orange-gradient text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {i + 1}
                                </span>
                                <p className="text-sm text-[#1a1a2e] leading-relaxed">{rule}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
