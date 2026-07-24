import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { calculateAge } from '../../utils/ageHelper';

export interface PatientOption {
  id: string;
  firstName: string;
  lastName?: string;
  nicNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber: string;
  parentId?: string;
}

interface FamilyPatientSelectorProps {
  primaryPatient: PatientOption;
  children: PatientOption[];
  selectedPatientId: string;
  onSelectPatient: (patient: PatientOption) => void;
  onOpenAddChild: () => void;
}

export const FamilyPatientSelector: React.FC<FamilyPatientSelectorProps> = ({
  primaryPatient,
  children,
  selectedPatientId,
  onSelectPatient,
  onOpenAddChild,
}) => {
  return (
    <Box sx={{ my: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
          Who is this appointment for?
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onOpenAddChild}
          sx={{
            borderRadius: 6,
            textTransform: 'none',
            fontWeight: 700,
            color: 'primary.main',
          }}
        >
          Add Child
        </Button>
      </Box>

      <Stack spacing={1.5}>
        {/* Primary Account (Parent / Self) */}
        {(() => {
          const isSelected = primaryPatient.id === selectedPatientId;
          const ageInfo = calculateAge(primaryPatient.dateOfBirth);

          return (
            <Card
              variant="outlined"
              onClick={() => onSelectPatient(primaryPatient)}
              sx={{
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderColor: isSelected ? 'primary.main' : 'divider',
                borderWidth: isSelected ? 2 : 1,
                bgcolor: isSelected ? 'rgba(143, 0, 255, 0.04)' : 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PersonIcon color={isSelected ? 'primary' : 'action'} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {primaryPatient.firstName} {primaryPatient.lastName ?? ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Primary Account (Self)
                        {primaryPatient.nicNumber ? ` • NIC: ${primaryPatient.nicNumber}` : ''}
                        {ageInfo.formatted ? ` • Age: ${ageInfo.formatted}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                  {isSelected && <CheckCircleIcon color="primary" fontSize="small" />}
                </Box>
              </CardContent>
            </Card>
          );
        })()}

        {/* Attached Children */}
        {children.map((child) => {
          const isSelected = child.id === selectedPatientId;
          const ageInfo = calculateAge(child.dateOfBirth);

          return (
            <Card
              key={child.id}
              variant="outlined"
              onClick={() => onSelectPatient(child)}
              sx={{
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderColor: isSelected ? 'primary.main' : 'divider',
                borderWidth: isSelected ? 2 : 1,
                bgcolor: isSelected ? 'rgba(143, 0, 255, 0.04)' : 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ChildCareIcon color={isSelected ? 'primary' : 'action'} />
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {child.firstName} {child.lastName ?? ''}
                        </Typography>
                        <Chip
                          label="Child"
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {child.gender ? `${child.gender} • ` : ''}
                        DOB: {child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString() : 'N/A'}
                        {ageInfo.formatted ? ` (${ageInfo.formatted})` : ''}
                      </Typography>
                    </Box>
                  </Box>
                  {isSelected && <CheckCircleIcon color="primary" fontSize="small" />}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};
