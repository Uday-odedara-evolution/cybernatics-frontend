import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { usePremium, useUser } from '@/store/store';
import { useState } from 'react';
import ApiClient from '@/utils/ApiClient';
import { toast } from 'sonner';

const AddOnDeviceModal = () => {
  const [seats, setSeats] = useState<number>(0);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const { subscription, setSubscription } = usePremium();

  const { user } = useUser();
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleUpdateSubscription = async () => {
    try {
      if (!subscription) return;
      if (seats <= 0) {
        toast.error('Please enter a valid number of seats');
        return;
      }
      const totalSeats = subscription.deviceNumOverride + seats;
      setLoadingPlan(true);
      const response = await ApiClient.post('/stripe/update-subscription', {
        subscriptionId: subscription.subscriptionId,
        quantity: totalSeats,
        subItemId: subscription.subscriptionItemId,
        companyId: user?.companyId.toString(),
        planId: subscription.planId.toString()
      });
      if (response.data.data) {
        setSubscription(response.data.data);
      }
      toast.success('Subscription updated successfully');
      setIsOpen(false);
      setShowConfirmation(false);
    } catch {
      toast.error('Error during update subscription');
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleSeatsChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setSeats((prev) => prev + 1);
    } else {
      setSeats((prev) => (prev - 1 > 0 ? prev - 1 : 0));
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setIsOpen(true)}>Add Seats</Button>
      </div>
      <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle>Buy additional seats</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-md font-bold">
                  Current plan has {subscription?.deviceNumOverride} seats
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-md">Seats: {seats}</span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-white"
                    onClick={() => handleSeatsChange('decrement')}
                    disabled={seats <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center">{seats}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-white"
                    onClick={() => handleSeatsChange('increment')}
                    disabled={loadingPlan}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {subscription?.deviceNumOverride && (
                <div>
                  <span className="text-md">
                    Total seats after update: {subscription?.deviceNumOverride + seats}
                  </span>
                </div>
              )}
              <Button
                className="btn btn-sm btn-primary w-full flex items-center justify-center"
                onClick={() => setShowConfirmation(true)}
                disabled={seats <= 0}
              >
                Update Subscription
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmation} onOpenChange={() => setShowConfirmation(false)}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle>Confirm Subscription Update</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div className="text-md">
                Are you sure you want to add {seats} additional {seats === 1 ? 'seat' : 'seats'} to
                your subscription?
              </div>
              <div className="text-md">Your card will be charged automatically.</div>
              {subscription?.deviceNumOverride !== undefined && (
                <div className="text-sm text-gray-600">
                  Your total seats will be {subscription.deviceNumOverride + seats}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={loadingPlan}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateSubscription} disabled={loadingPlan}>
                  {loadingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Update'}
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddOnDeviceModal;
