import type { ReleasesSearchResult } from "@repo/shared/types/releases"
import { Download, FileText, HardDrive, ShieldCheck, Zap, Search, ChevronRight, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo } from "react"

/**
 * Formats bytes into a human-readable string (e.g., 1.2 GB)
 */
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Individual File Component
 */
const FileItem = ({ 
    file, 
    downloadUrl, 
    isDualAudio 
}: { 
    file: { name: string, length: number }, 
    downloadUrl: string,
    isDualAudio?: boolean
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ 
                scale: 1.02, 
                x: 8,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.5)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative flex items-center justify-between p-5 mb-3 rounded-2xl bg-white/3 border border-white/10 hover:border-indigo-500/40 transition-all duration-300 backdrop-blur-sm z-0 hover:z-10"
        >
            <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="relative">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                        <FileText size={24} />
                    </div>
                    {isDualAudio && (
                        <div className="absolute -top-1 -right-1 p-1 bg-indigo-500 rounded-full text-white shadow-lg shadow-indigo-500/40">
                            <Zap size={8} fill="currentColor" />
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                    <h2 className="text-base font-bold text-white leading-relaxed mb-1 group-hover:text-indigo-300 transition-colors whitespace-normal wrap-break-word overflow-hidden">
                        {file.name}
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-medium text-white/40 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                            <HardDrive size={10} />
                            {formatBytes(file.length)}
                        </span>
                        {isDualAudio && (
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                Dual Audio
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <a 
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-6 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-xl shadow-indigo-600/10 active:scale-95 group-hover:shadow-indigo-600/30 whitespace-nowrap"
            >
                <Download size={16} />
                <span>DOWNLOAD</span>
            </a>
        </motion.div>
    )
}


/**
 * Individual Release Component (Collapsible section for one release)
 */
const ReleaseSection = ({ 
    release,
    isInitiallyExpanded = false
}: { 
    release: ReleasesSearchResult,
    isInitiallyExpanded?: boolean
}) => {
    const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded)
    const groupName = release.releaseGroup || "Unknown Group"

    // Calculate total size of this specific release
    const totalSize = release.files.reduce((acc, f) => acc + f.length, 0)

    return (
        <div className="mb-4 last:mb-0">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 rounded-3xl bg-white/3 border border-white/10 hover:bg-white/6 hover:border-white/20 transition-all duration-300 group cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:text-white transition-colors"
                    >
                        <ChevronRight size={16} />
                    </motion.div>
                    <div className="flex flex-col items-start">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors text-left">
                            {groupName}
                        </h3>
                        <span className="text-[10px] font-bold text-white/20">
                            {release.files.length} File{release.files.length !== 1 ? 's' : ''} • {formatBytes(totalSize)}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {release.isBest && (
                        <div className="px-2 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[8px] font-black uppercase tracking-tighter rounded-md">
                            Best Choice
                        </div>
                    )}
                    {release.dualAudio && (
                        <div className="px-2 py-1 bg-indigo-400/10 border border-indigo-400/20 text-indigo-400 text-[8px] font-black uppercase tracking-tighter rounded-md hidden sm:block">
                            Dual Audio
                        </div>
                    )}
                    <div className="h-px w-12 bg-white/10 hidden md:block" />
                </div>
            </button>
            
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 px-2 space-y-2">
                            {release.files.map((file, fIdx) => (
                                <div key={fIdx} className="relative">
                                    {release.isBest && fIdx === 0 && (
                                        <div className="absolute -top-3 left-6 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-[10px] font-black text-black rounded-lg uppercase tracking-tighter shadow-lg shadow-amber-400/20">
                                            <ShieldCheck size={12} />
                                            Recommended
                                        </div>
                                    )}
                                    
                                    <FileItem 
                                        file={file} 
                                        downloadUrl={release.url} 
                                        isDualAudio={release.dualAudio}
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/**
 * Main Downloadable Component
 */
export function Downloadable({ releases }: { releases: ReleasesSearchResult[] }) {
    const [searchQuery, setSearchQuery] = useState("")

    // Filter releases based on search query
    const filteredReleases = useMemo(() => {
        const query = searchQuery.toLowerCase()
        const allReleases = releases || []
        
        if (!query) return allReleases

        return allReleases.filter(release => {
            const groupName = release.releaseGroup || "Unknown Group"
            const groupMatches = groupName.toLowerCase().includes(query)
            const fileMatches = release.files.some(f => f.name.toLowerCase().includes(query))
            return groupMatches || fileMatches
        })
    }, [releases, searchQuery])

    return (
        <div className="w-full max-w-5xl mx-auto overflow-hidden">
            <div className="relative p-8 md:p-12 bg-[#0a0a0c]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                {/* Decorative background flare */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full" />

                <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-8 h-1 bg-indigo-500 rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">P2P Network</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Downloads</h1>
                            <p className="text-white/40 text-sm max-w-md leading-relaxed">
                                Select a release and file to begin your download.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-sm">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20">
                                <Search size={18} />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search files or groups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-12 pr-10 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-white/20"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery("")}
                                    className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-tighter bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            {releases.length} Mirrors Online
                        </div>
                        {searchQuery && (
                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                Found {filteredReleases.length} matches
                            </div>
                        )}
                    </div>
                </header>

                <div className="relative z-10 min-h-[400px]">
                    {filteredReleases.length > 0 ? (
                        filteredReleases.map((release, idx) => (
                            <ReleaseSection 
                                key={idx} 
                                release={release} 
                                isInitiallyExpanded={searchQuery.length > 0} 
                            />
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-24 text-center rounded-3xl border-2 border-dashed border-white/5"
                        >
                            <div className="inline-flex p-4 rounded-full bg-white/5 text-white/20 mb-4">
                                {searchQuery ? <X size={32} /> : <Download size={32} />}
                            </div>
                            <h3 className="text-xl font-bold text-white/50 mb-1">
                                {searchQuery ? "No Matches Found" : "No Links Found"}
                            </h3>
                            <p className="text-white/20 text-sm">
                                {searchQuery ? `We couldn't find anything matching "${searchQuery}"` : "We couldn't find any download links for this content yet."}
                            </p>
                        </motion.div>
                    )}
                </div>
                
                <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <span>P2P NETWORK</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span>VERIFIED RELEASES</span>
                    </div>
                    <div className="text-right">
                        © ANYHAVEN CONTENT DELIVERY
                    </div>
                </footer>
            </div>
        </div>
    )
}