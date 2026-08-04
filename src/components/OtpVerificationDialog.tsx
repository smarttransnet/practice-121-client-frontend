import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';

interface Props {
  open: boolean;
  onClose: () => void;
  maskedMobile: string;
  sessionId: string;
  onVerified: (verificationToken: string) => void;
  onVerifyOtp: (sessionId: string, otpCode: string) => Promise<{ verified: boolean; verificationToken?: string; errorMessage?: string }>;
  onResendOtp: (sessionId: string) => Promise<{ success: boolean; errorMessage?: string; cooldownSeconds?: number }>;
}

export function OtpVerificationDialog({
  open,
  onClose,
  maskedMobile,
  sessionId,
  onVerified,
  onVerifyOtp,
  onResendOtp,
}: Props) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState<number>(60);
  const [expiry, setExpiry] = useState<number>(600);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setDigits(['', '', '', '', '', '']);
      setCooldown(60);
      setExpiry(600);
      setError(null);
      setSuccessMsg(null);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [open, sessionId]);

  useEffect(() => {
    if (!open || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, cooldown]);

  useEffect(() => {
    if (!open || expiry <= 0) return;
    const timer = setInterval(() => {
      setExpiry((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, expiry]);

  const handleChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      const newDigits = [...digits];
      pasted.forEach((ch, idx) => {
        if (idx < 6) newDigits[idx] = ch;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    pastedData.split('').forEach((ch, idx) => {
      newDigits[idx] = ch;
    });
    setDigits(newDigits);
    const nextFocus = Math.min(pastedData.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

  const otpCode = digits.join('');
  const isComplete = otpCode.length === 6;

  const handleVerify = async () => {
    if (!isComplete || submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await onVerifyOtp(sessionId, otpCode);
      if (res.verified && res.verificationToken) {
        setSuccessMsg('Mobile number verified successfully!');
        setTimeout(() => {
          onVerified(res.verificationToken!);
          onClose();
        }, 600);
      } else {
        setError(res.errorMessage || 'Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await onResendOtp(sessionId);
      if (res.success) {
        setSuccessMsg('A new 6-digit code has been sent via SMS.');
        setCooldown(res.cooldownSeconds ?? 60);
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(res.errorMessage || 'Failed to resend OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Resend request failed.');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SmsOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              SMS Verification
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Security Authentication
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          We sent a 6-digit verification code to <strong>{maskedMobile}</strong>. Enter it below to access patient records.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert icon={<CheckCircleOutlineIcon fontSize="inherit" />} severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {successMsg}
          </Alert>
        )}

        {/* 6 Digit Input Boxes */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 2 }}>
          {digits.map((digit, idx) => (
            <TextField
              key={idx}
              inputRef={(el) => (inputRefs.current[idx] = el)}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={submitting || expiry <= 0}
              variant="outlined"
              inputProps={{
                maxLength: 1,
                inputMode: 'numeric',
                pattern: '[0-9]*',
                type: 'tel',
                style: {
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  padding: '12px 0',
                  width: '38px',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: 'background.default',
                },
              }}
            />
          ))}
        </Box>

        {/* Timers & Resend Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, mb: 1 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TimerOutlinedIcon sx={{ fontSize: 16, color: expiry > 0 ? 'text.secondary' : 'error.main' }} />
            <Typography variant="caption" color={expiry > 0 ? 'text.secondary' : 'error.main'} fontWeight={600}>
              {expiry > 0 ? `Code expires in ${formatTime(expiry)}` : 'Code expired'}
            </Typography>
          </Stack>

          <Button
            size="small"
            disabled={cooldown > 0 || resending || expiry <= 0}
            onClick={handleResend}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {resending ? (
              <CircularProgress size={14} sx={{ mr: 1 }} />
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              'Resend Code'
            )}
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 6, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleVerify}
          variant="contained"
          color="primary"
          disabled={!isComplete || submitting || expiry <= 0}
          sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 700, px: 3 }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Verify Code'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
