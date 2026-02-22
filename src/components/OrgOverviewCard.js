'use client';

import { motion } from 'framer-motion';
import { MapPin, Hash, Users, Calendar, Shield } from 'lucide-react';

export default function OrgOverviewCard({ organization }) {
    const org = organization || {
        name: 'No Organization',
        state: 'Join or create one',
        joiningCode: '------',
        memberCount: 0,
        createdAt: null
    };

    const createdDate = org.createdAt
        ? new Date(org.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        : '--';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="glass-card rounded-2xl p-6 relative overflow-hidden shadow-lg"
        >
            {/* Orange accent bar */}
            <div className="absolute top-0 left-0 w-1.5 h-full orange-gradient rounded-l-2xl" />

            <div className="flex items-center justify-between">
                {/* Left: Info */}
                <div className="flex-1 pl-4">
                    <h2 className="text-2xl font-bold text-[#1a1a2e] mb-1">{org.name}</h2>
                    <div className="flex items-center gap-2 text-[#6b7280] text-sm mb-6">
                        <MapPin className="w-4 h-4" />
                        <span>{org.state || 'Location not set'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                <Hash className="w-5 h-5 text-[#ff6b00]" />
                            </div>
                            <div>
                                <p className="text-xs text-[#9ca3af] font-medium">Joining Code</p>
                                <p className="text-sm font-bold text-[#1a1a2e] tracking-wider">{org.joiningCode}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-[#9ca3af] font-medium">Members</p>
                                <p className="text-sm font-bold text-[#1a1a2e]">{org.memberCount || (org.members?.length || 0)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-[#9ca3af] font-medium">Created</p>
                                <p className="text-sm font-bold text-[#1a1a2e]">{createdDate}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Motorcycle image */}
                <div className="hidden lg:block w-64 h-40 relative">
                    <img
                        src="/images/motorcycle.png"
                        alt="Motorcycle"
                        className="w-full h-full object-contain drop-shadow-2xl"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
