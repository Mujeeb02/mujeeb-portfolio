import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    postTitle: string;
}

export const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    postTitle
}: DeleteConfirmModalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                    >
                        <div
                            className="relative bg-card/95 backdrop-blur-xl border border-destructive/30 rounded-lg p-6 shadow-[0_0_50px_rgba(255,77,77,0.2)] w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center border border-destructive/30">
                                    <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-foreground mb-2">
                                    Delete Post?
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Are you sure you want to delete this post? This action cannot be undone.
                                </p>
                                <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                                    <p className="text-sm text-destructive font-mono truncate">
                                        "{postTitle}"
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={onConfirm}
                                    className="flex-1 bg-destructive hover:bg-destructive/90 shadow-[0_0_20px_rgba(255,77,77,0.3)]"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>

                            {/* Terminal-style footer */}
                            <div className="mt-4 pt-4 border-t border-border/30 text-center">
                                <p className="text-[10px] text-muted-foreground font-mono">
                                    <span className="text-destructive">$</span> rm -rf ./blog/{postTitle.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    // Render via portal to document.body to avoid parent container issues
    return createPortal(modalContent, document.body);
};

