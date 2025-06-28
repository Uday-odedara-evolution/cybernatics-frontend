import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Plan } from '@/interface';
import { usePremium, useUser } from '@/store/store';
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
  CheckIcon,
  Minus,
  Plus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ActivePlanCard from './active-plan-card';

interface PlanCardProps {
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

const PlanCard = ({ plan }: PlanCardProps) => {
  const { subscription, isPremium, setSubscription } = usePremium();
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);
  const { user } = useUser();
  const [seats, setSeats] = useState<number>(plan.defaultDeviceNum);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    if (subscription?.planId === plan.id) {
      setSeats(subscription.deviceNumOverride);
      setIsSubscribed(true);
    } else {
      setSeats(plan.defaultDeviceNum);
      setIsSubscribed(false);
    }
  }, [plan, subscription]);

  const handleSeatsChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setSeats((prev) => prev + 1);
    } else {
      setSeats((prev) => prev - 1);
    }
  };

  const handleUpgrade = () => {
    setLoadingPlan(true);
    ApiClient.post('/stripe/upgrade-subscription', {
      subscriptionId: subscription?.subscriptionId,
      subItemId: subscription?.subscriptionItemId,
      companyId: user?.companyId,
      planId: plan.id,
      priceId: plan.priceId,
      quantity: seats
    })
      .then((response) => {
        if (response.data.data) {
          setSubscription(response.data.data);
        }
        toast.success('Subscription updated successfully');
      })
      .catch(() => {
        toast.error('Error during upgrade');
      })
      .finally(() => {
        setLoadingPlan(false);
      });
  };

  const handleCheckout = () => {
    setLoadingPlan(true);

    ApiClient.post('/stripe/checkout', {
      planId: plan.id,
      priceId: plan.priceId,
      companyId: user?.companyId,
      quantity: seats
    })
      .then((res) => {
        window.location.href = res.data.url;
      })
      .catch(() => {
        toast.error('Error during checkout');
      })
      .finally(() => {
        setLoadingPlan(false);
      });
  };

  const getDiscountPrice = (): string => {
    let price = Number(plan.price) / 100; // convert cents to dollars

    if (plan.discountPercentage > 0) {
      price = price * (1 - plan.discountPercentage / 100); // 10% discount
    }
    price = Number(price.toFixed(2));
    return price.toString();
  };

  const getButtonText = () => {
    if (loadingPlan) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isPremium && subscription?.status === 'active') return 'Upgrade';
    return 'Subscribe';
  };

  if (isSubscribed) {
    return <ActivePlanCard plan={plan} />;
  }

  return (
    <Card
      key={plan.id}
      className={`border border-gray-200 ${plan.Product.isPopular ? 'h-[450px]' : 'h-[414px]'} flex flex-col justify-between relative overflow-hidden`}
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
          {plan.Product.features.map((feature) => (
            <li key={`feat-plan-${feature}`} className="flex items-center">
              {getFeatureIcon(feature)}
              <span className="ml-2">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center">
          <div>
            <div className="flex items-center gap-2">
              {plan.discountPercentage > 0 && (
                <div className="text-md font-bold text-red-600 line-through">{`USD ${Number(plan.price) / 100}`}</div>
              )}
              {plan.discountPercentage > 0 && (
                <div className="text-xs text-blue-500">
                  <span>SAVE {plan.discountPercentage}%</span>
                </div>
              )}
            </div>
            <div>
              <div className="font-bold flex items-center">
                <div className="text-md">USD$</div>
                <div className="text-xl">{getDiscountPrice()}</div>
              </div>
              <div className="text-xs text-gray-500">
                {`Per ${plan.recurringIntervalCount} ${plan.recurringInterval}`}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex justify-between w-full">
            <span className="text-xs">Seats</span>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-full bg-white"
                onClick={() => handleSeatsChange('decrement')}
                disabled={seats <= 5}
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
        </div>

        <Button
          className="btn btn-sm btn-primary w-full flex items-center justify-center"
          onClick={isPremium && subscription?.status === 'active' ? handleUpgrade : handleCheckout}
          disabled={loadingPlan || isPremium}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
