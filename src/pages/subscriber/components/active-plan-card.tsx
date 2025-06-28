import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Plan } from '@/interface';
import { usePremium } from '@/store/store';
import ApiClient from '@/utils/ApiClient';
import {
  Loader2,
  UsersIcon,
  DatabaseIcon,
  CloudIcon,
  HeadphonesIcon,
  ShieldIcon,
  FileTextIcon,
  BarChartIcon,
  BellIcon,
  SearchIcon,
  CheckIcon
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ActivePlanCardProps {
  plan: Plan;
}

const getFeatureIcon = (feature: string) => {
  if (feature.includes('Malware') || feature.includes('Ransomware'))
    return <ShieldIcon className="h-4 w-4" />;
  if (feature.includes('File Integrity')) return <FileTextIcon className="h-4 w-4" />;
  if (feature.includes('Log Analysis')) return <BarChartIcon className="h-4 w-4" />;
  if (feature.includes('Security Alerts')) return <BellIcon className="h-4 w-4" />;
  if (feature.includes('MITRE ATT&CK')) return <SearchIcon className="h-4 w-4" />;
  if (feature.includes('team members')) return <UsersIcon className="h-4 w-4" />;
  if (feature.includes('storage')) return <DatabaseIcon className="h-4 w-4" />;
  if (feature.includes('analytics')) return <CloudIcon className="h-4 w-4" />;
  if (feature.includes('support')) return <HeadphonesIcon className="h-4 w-4" />;
  if (feature.includes('SSO') || feature.includes('authentication'))
    return <ShieldIcon className="h-4 w-4" />;
  return <CheckIcon className="h-4 w-4" />;
};

const ActivePlanCard = ({ plan }: ActivePlanCardProps) => {
  const { subscription } = usePremium();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      if (!subscription?.subscriptionId) {
        toast.error('No subscription found');
        return;
      }
      setLoading(true);
      await ApiClient.post(`/stripe/cancel/subscription/${subscription?.subscriptionId}`);
      window.location.reload();
      toast.success('Subscription cancelled successfully');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to cancel subscription';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setShowDialog(false);
    }
  };

  const formatRenewalDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);

    return `${subscription?.status === 'canceled' ? 'Until' : 'Renew in'} ${date.toLocaleString(
      'default',
      {
        month: 'short'
      }
    )} ${date.getFullYear()}`;
  };

  const getButtonText = () => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin mr-2" />;
    if (subscription?.status === 'canceled') return 'Will cancel at end of billing cycle';
    return 'Cancel Subscription';
  };

  return (
    <>
      <Card
        className={`border border-gray-200 bg-[#0070A4] text-white ${plan.Product.isPopular ? 'h-[450px]' : 'h-[414px]'} flex flex-col justify-between relative overflow-hidden`}
      >
        {plan.Product.isPopular && (
          <div className="absolute top-0 inset-x-0">
            <div className="bg-primary text-white py-2 text-center font-medium">MOST POPULAR</div>
          </div>
        )}
        <CardHeader className={`text-center pb-2 ${plan.Product.isPopular ? 'mt-6 pt-10' : ''}`}>
          <h2 className="text-[25px] font-bold">{plan.Product.name}</h2>
        </CardHeader>

        <CardContent className="pt-1 flex-1">
          <ul className="space-y-2 mb-3 text-sm">
            {plan.Product.features.map((feature, index) => (
              <li key={`${feature}-${index}`} className="flex items-center">
                {getFeatureIcon(feature)}
                <span className="ml-2">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="text-center text-sm">{formatRenewalDate(subscription?.expireOn)}</div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center">
            <div>
              <div className="font-bold flex items-center justify-center">
                <div className="text-md">USD$</div>
                <div className="text-xl">{Number(plan.price) / 100}</div>
              </div>
              <div className="text-xs">
                {`Per ${plan.recurringIntervalCount} ${plan.recurringInterval}`}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowDialog(true)}
            disabled={subscription?.status === 'canceled' || loading}
            className="w-full bg-transparent border-white text-white hover:bg-white hover:text-[#0070A4]"
          >
            {getButtonText()}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription>
              Are you sure you want to cancel your subscription? This action cannot be undone.
            </DialogDescription>
          </DialogBody>
          <DialogFooter className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCancelSubscription}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActivePlanCard;
