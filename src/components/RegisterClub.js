import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { registerClub, checkClubNameAvailable } from '../services/clubService';

const steps = ['Club Information', 'Admin Account', 'Select Plan'];

function RegisterClub({ open, onClose, onSuccess }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Club data
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubNameError, setClubNameError] = useState('');
  
  // Admin data
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Payment plan
  const [selectedPlan, setSelectedPlan] = useState('7day-trial');
  
  const plans = [
    {
      id: '7day-trial',
      name: '7-Day Free Trial',
      price: 'Free',
      description: 'Try all features free for 7 days',
      features: [
        'Unlimited events',
        'Member management',
        'Email invitations',
        'All features included'
      ]
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '$29/month',
      description: 'Perfect for small to medium clubs',
      features: [
        'Everything in Free Trial',
        'Priority support',
        'Custom branding',
        'Advanced analytics'
      ],
      comingSoon: true
    }
  ];
  
  const handleNext = async () => {
    setError('');
    
    if (activeStep === 0) {
      // Validate club information
      if (!clubName.trim()) {
        setError('Club name is required');
        return;
      }
      
      // Check if club name is available
      setLoading(true);
      const result = await checkClubNameAvailable(clubName);
      setLoading(false);
      
      if (!result.success) {
        setError('Error checking club name availability');
        return;
      }
      
      if (!result.available) {
        setClubNameError('This club name is already taken');
        return;
      }
      
      setClubNameError('');
    } else if (activeStep === 1) {
      // Validate admin account
      if (!adminName.trim() || !adminEmail.trim() || !adminPassword) {
        setError('All fields are required');
        return;
      }
      
      if (adminPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (adminPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(adminEmail)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await registerClub(
        {
          name: clubName,
          description: clubDescription
        },
        {
          name: adminName,
          email: adminEmail,
          password: adminPassword
        },
        selectedPlan
      );
      
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || 'Failed to register club');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Club Name"
              value={clubName}
              onChange={(e) => {
                setClubName(e.target.value);
                setClubNameError('');
              }}
              fullWidth
              required
              error={!!clubNameError}
              helperText={clubNameError}
            />
            <TextField
              label="Description"
              value={clubDescription}
              onChange={(e) => setClubDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Tell us about your running club..."
            />
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Create the admin account for your club
            </Typography>
            <TextField
              label="Admin Name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Admin Email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              fullWidth
              required
              helperText="At least 6 characters"
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
            />
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose your plan
            </Typography>
            <RadioGroup
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    variant="outlined"
                    sx={{
                      border: selectedPlan === plan.id ? 2 : 1,
                      borderColor: selectedPlan === plan.id ? 'primary.main' : 'divider',
                      position: 'relative',
                      opacity: plan.comingSoon ? 0.6 : 1
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <FormControlLabel
                          value={plan.id}
                          control={<Radio disabled={plan.comingSoon} />}
                          label=""
                          sx={{ m: 0 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6">
                              {plan.name}
                            </Typography>
                            {plan.comingSoon && (
                              <Typography
                                variant="caption"
                                sx={{
                                  bgcolor: 'grey.200',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1
                                }}
                              >
                                Coming Soon
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
                            {plan.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {plan.description}
                          </Typography>
                          <Box component="ul" sx={{ m: 0, pl: 2 }}>
                            {plan.features.map((feature, index) => (
                              <Typography
                                key={index}
                                component="li"
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                              >
                                {feature}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </RadioGroup>
            
            {selectedPlan === '7day-trial' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No credit card required. You can upgrade to a paid plan at any time.
              </Alert>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Register Your Running Club</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {renderStepContent()}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={activeStep === 0 ? onClose : handleBack}
            disabled={loading}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {activeStep === steps.length - 1 ? 'Create Club' : 'Next'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default RegisterClub;
