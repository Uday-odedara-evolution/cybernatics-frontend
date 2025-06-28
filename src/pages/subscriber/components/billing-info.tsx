import { usePremium, useUser } from '@/store/store';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { Invoice, PaymentMethod } from '@/interface';
import ApiClient from '@/utils/ApiClient';
import { Button } from '@/components/ui/button';
import { Download, CreditCard, Edit } from 'lucide-react';
import { toast } from 'sonner';

const BillingInfo = () => {
  const { subscription, planDetails, isPremium } = usePremium();
  const { user } = useUser();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    if (user?.customerId) {
      fetchInvoices();
      fetchPaymentMethod();
    }
  }, [user?.customerId]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await ApiClient.get(`/stripe/list/invoices/${user?.customerId}`);
      setInvoices(response.data.data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch invoices';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethod = async () => {
    setLoadingPayment(true);
    try {
      const response = await ApiClient.get(`/stripe/list/payment-method/${user?.customerId}`);
      setPaymentMethods(response.data.data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch payment method';
      toast.error(errorMessage);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleDownload = async (pdfUrl: string) => {
    try {
      window.open(pdfUrl, '_blank');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to download invoice';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'paid') return 'bg-green-100 text-green-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const renderInvoiceContent = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <p>Loading invoices...</p>
        </div>
      );
    }

    if (invoices.length === 0) {
      return (
        <div className="text-center py-4">
          <p>No invoices available</p>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.number}</TableCell>
                <TableCell>{new Date(invoice.created * 1000).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className="text-sm flex items-center gap-1">
                    <span className="uppercase font-bold">{invoice.currency}</span>
                    <span>{(invoice.amount_paid / 100).toFixed(2)}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}
                  >
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(invoice.invoice_pdf)}
                    className="hover:text-primary-active"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (!isPremium || !subscription || !planDetails) {
    return (
      <div className="text-center py-4">
        <p>No subscription information available</p>
      </div>
    );
  }

  const subscriptionDetails = [
    { label: 'Plan Name', value: planDetails?.Product?.name },
    {
      label: 'Status',
      value: subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
    },
    {
      label: 'Start Date',
      value: new Date(subscription.createdAt).toLocaleDateString()
    },
    {
      label: 'End Date',
      value: new Date(subscription.expireOn * 1000).toLocaleDateString()
    },
    { label: 'Total Seats', value: subscription.deviceNumOverride }
  ];

  const handleEditPaymentMethod = async () => {
    const response = await ApiClient.post(`/stripe/update/payment-method/${user?.customerId}`);

    if (response?.data?.url) {
      window.location.href = response.data.url;
    } else {
      toast.error('Failed to update payment method');
    }
  };

  const renderPaymentMethodsContent = () => {
    if (loadingPayment) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            Loading payment methods...
          </TableCell>
        </TableRow>
      );
    }

    if (paymentMethods.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            No payment methods available
          </TableCell>
        </TableRow>
      );
    }

    return paymentMethods.map((method) => (
      <TableRow key={method.id}>
        <TableCell className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)}
        </TableCell>
        <TableCell>•••• {method.card.last4}</TableCell>
        <TableCell>
          {method.card.exp_month}/{method.card.exp_year}
        </TableCell>
        <TableCell>{method.billing_details.name}</TableCell>
        <TableCell>{method.billing_details.email}</TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-primary-active"
            onClick={() => handleEditPaymentMethod()}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="p-4 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-6">Billing Info</h1>
        <div className="rounded-md border">
          <Table>
            <TableBody>
              {subscriptionDetails.map((detail) => (
                <TableRow key={detail.label}>
                  <TableCell className="font-medium w-1/3">{detail.label}</TableCell>
                  <TableCell>{detail.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-6">Billing History</h2>
        {renderInvoiceContent()}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-6">Payment Methods</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card Type</TableHead>
                <TableHead>Last 4 Digits</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderPaymentMethodsContent()}</TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BillingInfo;
