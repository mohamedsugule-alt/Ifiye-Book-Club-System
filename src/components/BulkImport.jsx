import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { generateTemplate, parseExcel } from '../utils/excelHandler';
import { useBookClub } from '../context/BookClubContext';
import { useData } from '../context/DataContext';

const BulkImport = () => {
    const { addLog, addPeerReview, addDiscussionPoint } = useBookClub();
    const { sessions, setSessions } = useData(); // We need direct setter for sessions or an action
    // Note: setSessions is available from DataContext since it exposes ...data which has setSessions (from useState)

    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [status, setStatus] = useState('IDLE'); // IDLE, PARSING, READY, SAVING, SUCCESS, ERROR
    const [stats, setStats] = useState({});
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) processFile(selectedFile);
    };

    const processFile = async (f) => {
        setFile(f);
        setStatus('PARSING');
        try {
            const data = await parseExcel(f);
            setParsedData(data);

            // Calculate stats
            setStats({
                logs: data.logs.length,
                academy: data.academy.length,
                topics: data.topics.length,
                peerReviews: data.peerReviews.length,
                sessions: data.sessions.length
            });

            setStatus('READY');
        } catch (err) {
            console.error(err);
            setStatus('ERROR');
        }
    };

    const handleImport = async () => {
        if (!parsedData) return;
        setStatus('SAVING');

        try {
            // Import Logs
            for (const log of parsedData.logs) {
                if (log.memberId) await addLog(log);
            }

            // Import Academy (TODO: Needs addAcademyProgress action in context, skipping for now or mocking)
            // Assuming we might need to add this action later. 
            // For now, let's log usage.
            if (parsedData.academy.length > 0) {
                console.log("Academy Import Not Fully Connected yet:", parsedData.academy);
            }

            // Import Topics
            for (const topic of parsedData.topics) {
                if (topic.memberId) await addDiscussionPoint(topic);
            }

            // Import Reviews
            for (const review of parsedData.peerReviews) {
                if (review.reviewerId) addPeerReview(review); // PeerReview is state only currently
            }

            // Import Sessions (Admin Only)
            if (parsedData.sessions.length > 0) {
                // Merge with existing
                const existingIds = new Set(sessions.map(s => s.id));
                const newSessions = parsedData.sessions.filter(s => !existingIds.has(s.id));
                if (newSessions.length > 0) {
                    setSessions(prev => [...prev, ...newSessions]);
                }
            }

            // Artificial delay for UX
            setTimeout(() => {
                setStatus('SUCCESS');
                setFile(null);
                setParsedData(null);
                setTimeout(() => setStatus('IDLE'), 3000);
            }, 1000);

        } catch (err) {
            console.error("Import failed", err);
            setStatus('ERROR');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Template DL */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="text-brand-green" />
                        Bulk Data Import
                    </h3>
                    <p className="text-sm text-glass-400">Upload Excel sheets to update system records.</p>
                </div>
                <button
                    onClick={generateTemplate}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-glass-100 hover:bg-glass-200 text-sm font-medium transition-colors text-white"
                >
                    <Download size={16} />
                    Download Template
                </button>
            </div>

            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all
                    ${isDragging
                        ? 'border-brand-green bg-brand-green/10 scale-[1.02]'
                        : 'border-glass-200 hover:border-glass-300 hover:bg-glass-50'}
                    ${status === 'SUCCESS' ? 'border-emerald-500/50 bg-emerald-500/10' : ''}
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleFileSelect}
                />

                {status === 'IDLE' && (
                    <>
                        <Upload size={48} className="text-glass-300 mb-4" />
                        <p className="text-lg font-medium text-white">Click to upload or drag & drop</p>
                        <p className="text-sm text-glass-400">Excel files (.xlsx)</p>
                    </>
                )}

                {status === 'PARSING' && (
                    <div className="text-center">
                        <Loader className="animate-spin text-brand-orange mx-auto mb-2" size={32} />
                        <p className="text-brand-orange">Analyzing file...</p>
                    </div>
                )}

                {status === 'READY' && (
                    <div className="text-center">
                        <FileSpreadsheet size={48} className="text-brand-green mx-auto mb-4" />
                        <p className="text-lg font-bold text-white">{file.name}</p>
                        <p className="text-sm text-glass-400 mb-4">Ready to import</p>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-left bg-black/20 p-4 rounded-lg">
                            <div className="text-glass-400">Logs: <span className="text-white font-bold">{stats.logs}</span></div>
                            <div className="text-glass-400">Topics: <span className="text-white font-bold">{stats.topics}</span></div>
                            <div className="text-glass-400">Reviews: <span className="text-white font-bold">{stats.peerReviews}</span></div>
                            <div className="text-glass-400">Academy: <span className="text-white font-bold">{stats.academy}</span></div>
                            <div className="text-glass-400">Sessions: <span className="text-white font-bold">{stats.sessions}</span></div>
                        </div>
                    </div>
                )}

                {status === 'SAVING' && (
                    <div className="text-center">
                        <Loader className="animate-spin text-brand-purple mx-auto mb-2" size={32} />
                        <p className="text-brand-purple">Importing records...</p>
                    </div>
                )}

                {status === 'SUCCESS' && (
                    <div className="text-center">
                        <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                        <p className="text-lg font-bold text-emerald-400">Import Successful!</p>
                        <p className="text-sm text-emerald-400/70">Data has been updated.</p>
                    </div>
                )}

                {status === 'ERROR' && (
                    <div className="text-center">
                        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                        <p className="text-lg font-bold text-red-400">Import Failed</p>
                        <p className="text-sm text-red-400/70">Please check the file format.</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            {status === 'READY' && (
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => {
                            setFile(null);
                            setParsedData(null);
                            setStatus('IDLE');
                        }}
                        className="px-4 py-2 rounded-lg text-glass-300 hover:bg-white/5 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        className="px-6 py-2 rounded-lg bg-brand-green hover:bg-green-500 text-white font-bold shadow-lg shadow-green-900/20 transition transform active:scale-95"
                    >
                        Confirm Import
                    </button>
                </div>
            )}
        </div>
    );
};

export default BulkImport;
