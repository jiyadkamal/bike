'use client';

import { motion } from 'framer-motion';
import { Users, Clock, MessageSquare, Shield } from 'lucide-react';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' }
    })
};

export default function StatsCards({ stats }) {
    const defaultStats = stats || {
        totalMembers: 0,
        pendingRequests: 0,
        activeChats: 0,
        userRole: 'user'
    };

    const cards = [
        {
            title: 'Total Members',
            value: defaultStats.totalMembers,
            icon: Users,
            color: '#3b82f6',
            bg: 'bg-blue-50',
        },
        {
            title: 'Pending Requests',
            value: defaultStats.pendingRequests,
            icon: Clock,
            color: '#f59e0b',
            bg: 'bg-amber-50',
        },
        {
            title: 'Active Chats',
            value: defaultStats.activeChats,
            icon: MessageSquare,
            color: '#10b981',
            bg: 'bg-emerald-50',
        },
        {
            title: 'Your Role',
            value: defaultStats.userRole?.charAt(0).toUpperCase() + defaultStats.userRole?.slice(1),
            icon: Shield,
            color: '#ff6b00',
            bg: 'bg-orange-50',
            isText: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <motion.div
                        key={card.title}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e7eb]/50 cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                                <Icon className="w-5 h-5" style={{ color: card.color }} />
                            </div>
                        </div>

                        <p className="text-sm text-[#9ca3af] font-medium mb-1">{card.title}</p>
                        <p className={`font-bold text-[#1a1a2e] ${card.isText ? 'text-xl' : 'text-3xl'}`}>
                            {card.value}
                        </p>
                    </motion.div>
                );
            })}
        </div>
    );
}
