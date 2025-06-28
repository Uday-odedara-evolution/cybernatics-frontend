import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle
} from '@/components/ui/dialog';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  message: string;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, message }: DeleteModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>{message}</p>
          <div className="flex justify-end gap-4 mt-4">
            <button className="btn btn-light" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="loader" /> Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
