import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ApiClient from '@/utils/ApiClient';
import { toast } from 'sonner';
import { useUser } from '@/store/store';

interface ImportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsersImported: (users: any[]) => void;
}

const downloadUrl = `${import.meta.env.VITE_APP_API_URL}/organisation-users/sample-csv`;

const ImportUserModal = ({ isOpen, onClose, onUsersImported }: ImportUserModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
      e.target.value = '';
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await ApiClient.post(
        `/organisation-users/upload/${user?.companyId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Users imported successfully');
      onUsersImported(response.data);
      onClose();
      setFile(null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to import users';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Users</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <div className="text-sm text-gray-600">
              Upload a CSV file containing user information. The file should include columns for
              name, email, and role.
            </div>

            <div className="flex flex-col gap-2">
              <label className="form-label">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="input py-2 h-auto"
              />
            </div>

            <div className="flex items-center">
              <Link
                to={downloadUrl}
                className="text-xs text-blue-500 hover:text-primary-active underline"
                download
              >
                Download sample CSV template
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                className="btn btn-primary w-full flex items-center justify-center"
                onClick={handleImport}
                disabled={!file || loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Import Users</span>}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                Make sure your CSV file follows the required format
              </div>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default ImportUserModal;
