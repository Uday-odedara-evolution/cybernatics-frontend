import { useEffect, useState, useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Timer, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth } from '@/auth/_helpers';
import ApiClient from '@/utils/ApiClient';

const VerifyOTP = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const countdownRef = useRef<NodeJS.Timeout | null>(null); // Track the interval
  const [resending, setResending] = useState(false);

  useEffect(() => {
    document.title = 'OTP Verification';
  }, []);

  // Start the countdown when the component mounts
  useEffect(() => {
    startCountdown();
    return () => clearCountdown();
  }, []);

  const startCountdown = () => {
    setResendDisabled(true);
    setCountdown(30);
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setResendDisabled(false);
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).split('');

    if (pastedData.some((char) => isNaN(Number(char)))) {
      toast.error('Please paste numbers only');
      return;
    }

    setOtp(pastedData.concat(new Array(6 - pastedData.length).fill('')));
    inputRefs.current[pastedData.length - 1]?.focus();
  };

  const handleResendOTP = async () => {
    setResending(true);
    // setLoading(true);
    try {
      await ApiClient.post(
        '/auth/send-otp',
        {},
        {
          headers: {
            Authorization: `Bearer ${auth?.access_token}`
          }
        }
      );
      toast.success('OTP resent successfully');
      startCountdown();
      setResendDisabled(true);
      setCountdown(30);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.some((digit) => !digit)) {
      toast.error('Please enter all digits');
      return;
    }
    setLoading(true);
    try {
      const response = await ApiClient.post(
        '/auth/verify-otp',
        { otp: otp.join('') },
        {
          // headers: {
          //     Authorization: `Bearer ${auth?.access_token}`,
          //     "Content-Type": "application/json"
          // }
        }
      );

      if (response.data.message === 'OTP verified successfully') {
        localStorage.removeItem('organisationForm');
        localStorage.removeItem('organisationForm2');
        navigate('/organisations-step-1', { replace: true });
      } else {
        toast.error('Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-[400px] w-full p-6">
      <img src="/media/app/newlogo.png" alt="logo" />
      <div className="w-full max-w-md space-y-8 mt-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Verify your email</h2>
          <p className="text-sm text-muted-foreground mt-2">
            We sent a verification code to your email. Please enter it below.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <Input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-lg"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={loading || otp.some((digit) => !digit)}
            >
              {loading ? (
                'Verifying...'
              ) : (
                <>
                  Verify <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleResendOTP}
                disabled={resendDisabled || loading || resending}
                className="text-sm"
              >
                {resending ? (
                  'Sending...'
                ) : resendDisabled ? (
                  <span className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Resend in {countdown}s
                  </span>
                ) : (
                  'Resend OTP'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { VerifyOTP };
