import { useState, useEffect } from 'react';
import { Container } from '@/components/container';

import { Plan } from '@/interface';
import { usePremium, useUser } from '@/store/store';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import PlanCard from './components/plan-card';
import ApiClient from '@/utils/ApiClient';
import AddOnDeviceModal from './components/AddOnDeviceModal';
import BillingInfo from './components/billing-info';

const SubscriberPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [URLSearchParams, setURLSearchParams] = useSearchParams();
  const { user } = useUser();
  const { isPremium, subscription } = usePremium();
  const [activeTab, setActiveTab] = useState<'subscribe' | 'billing'>('subscribe');

  const fetchPlans = () => {
    setLoading(true);
    ApiClient.get<Plan[]>('/plans/list')
      .then((response) => {
        if (response.data.length > 0) {
          const filteredPlans = response.data.filter((item: Plan) => item.isActive);
          setPlans(filteredPlans);
        } else {
          setPlans([]);
        }
      })
      .catch(() => {
        setError('Error loading plans. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = 'subscriptions';

    const paymentStatus = URLSearchParams.get('payment_status');
    if (paymentStatus === '1') {
      toast.success('Payment successful');
      setURLSearchParams({});
    } else if (paymentStatus === '0') {
      toast.error('Payment failed');
      setURLSearchParams({});
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  if (loading) {
    return (
      <Container>
        <div className="text-center py-12">
          <p>Loading plans...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex items-center justify-between pb-3">
        <div className="flex space-x-6">
          <button
            className={`cursor-pointer pb-2 text-lg font-medium ${
              activeTab === 'subscribe'
                ? 'border-b-2 border-primary text-primary'
                : 'text-black-100 hover:text-primary'
            }`}
            onClick={() => setActiveTab('subscribe')}
          >
            Subscribe
          </button>
          <button
            className={`cursor-pointer pb-2 text-lg font-medium ${
              activeTab === 'billing'
                ? 'border-b-2 border-primary text-primary'
                : 'text-black-100 hover:text-primary'
            }`}
            onClick={() => setActiveTab('billing')}
          >
            Billing
          </button>
        </div>
      </div>
      {activeTab === 'subscribe' && (
        <div className="my-2">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Which plan do you want to try?</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the best plan which suits your business size. Change plans as you grow.
              <br />
              All plans have a minimum requirement of 5 seats.
            </p>
          </div>
          {isPremium && subscription?.status === 'active' && <AddOnDeviceModal />}
          {plans.length <= 0 && (
            <div>
              <h1 className="text-center">No plans found</h1>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      )}
      {activeTab === 'billing' && (
        <div className="my-2">
          <BillingInfo />
        </div>
      )}
    </Container>
  );
};

export { SubscriberPlans };
