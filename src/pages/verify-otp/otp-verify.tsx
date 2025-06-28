import { useState, useRef, type KeyboardEvent, type ClipboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Timer, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle countdown for resend button
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setResendDisabled(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value exists
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const pastedArray = pastedData.slice(0, 6).split('');

    if (pastedArray.some((char) => isNaN(Number(char)))) {
      toast.error('Please paste numbers only');
      return;
    }

    setOtp(pastedArray.concat(new Array(6 - pastedArray.length).fill('')));
    inputRefs.current[pastedArray.length - 1]?.focus();
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      // Add your resend OTP API call here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('OTP resent successfully');
      setResendDisabled(true);
      setCountdown(30);
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.some((digit) => !digit)) {
      toast.error('Please enter all digits');
      return;
    }

    setLoading(true);
    try {
      // Add your verify OTP API call here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('OTP verified successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8">
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
                disabled={resendDisabled || loading}
                className="text-sm"
              >
                {resendDisabled ? (
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
}
