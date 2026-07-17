import { useMemo, useState, useEffect } from 'react'
import { Autocomplete, TextField, Grid, createFilterOptions } from '@mui/material'
import { httpClient } from '../../api/httpClient'

export interface LocationPickerProps {
  district: string
  mohArea: string
  placeName: string
  placeId?: string
  onChange: (field: string, value: any) => void
  error?: boolean
}

const filter = createFilterOptions<any>({ stringify: (option) => option.title });

interface ApiLocation {
  id: string
  name: string
}

export function LocationPicker({ district, mohArea, placeName, onChange, error }: LocationPickerProps) {
  const [districtsList, setDistrictsList] = useState<ApiLocation[]>([])
  const [mohAreasList, setMohAreasList] = useState<ApiLocation[]>([])
  const [placesList, setPlacesList] = useState<ApiLocation[]>([])

  // Fetch districts on mount
  useEffect(() => {
    httpClient.get<ApiLocation[]>('/api/locations/districts')
      .then(res => setDistrictsList(res.data))
      .catch(console.error)
  }, [])

  const selectedDistrictId = useMemo(() => {
    return districtsList.find(d => d.name === district)?.id
  }, [district, districtsList])

  const selectedMohAreaId = useMemo(() => {
    return mohAreasList.find(m => m.name === mohArea)?.id
  }, [mohArea, mohAreasList])

  // Fetch MOH areas when district changes
  useEffect(() => {
    if (selectedDistrictId) {
      httpClient.get<ApiLocation[]>(`/api/locations/moh-areas?districtId=${selectedDistrictId}`)
        .then(res => setMohAreasList(res.data))
        .catch(console.error)
    } else {
      setMohAreasList([])
    }
  }, [selectedDistrictId])

  // Fetch Places when MOH area changes
  useEffect(() => {
    if (selectedMohAreaId) {
      httpClient.get<ApiLocation[]>(`/api/locations/places?mohAreaId=${selectedMohAreaId}`)
        .then(res => setPlacesList(res.data))
        .catch(console.error)
    } else {
      setPlacesList([])
    }
  }, [selectedMohAreaId])

  const districtNames = useMemo(() => districtsList.map(d => d.name).sort(), [districtsList])
  const mohAreaNames = useMemo(() => mohAreasList.map(m => m.name).sort(), [mohAreasList])
  const placeNames = useMemo(() => placesList.map(p => p.name).sort(), [placesList])

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Autocomplete
          options={districtNames}
          value={district || null}
          onChange={(_, val) => {
            onChange('district', val || '')
            onChange('mohArea', '')
            onChange('placeName', '')
            onChange('placeId', '')
            onChange('mohAreaId', '')
            onChange('isNewPlace', false)
          }}
          renderInput={(params) => <TextField {...params} label="District" required error={error && !district} />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Autocomplete
          options={mohAreaNames}
          value={mohArea || null}
          onChange={(_, val) => {
            onChange('mohArea', val || '')
            onChange('placeName', '')
            onChange('placeId', '')
            onChange('mohAreaId', '')
            onChange('isNewPlace', false)
          }}
          disabled={!district}
          renderInput={(params) => <TextField {...params} label="MOH Area" required error={error && !mohArea} />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Autocomplete
          value={placeName ? { title: placeName } : null}
          onChange={(_event, newValue) => {
            let newPlaceName = '';
            if (typeof newValue === 'string') {
              newPlaceName = newValue;
            } else if (newValue && (newValue as any).inputValue) {
              newPlaceName = (newValue as any).inputValue;
            } else {
              newPlaceName = (newValue as any)?.title || '';
            }

            if (newPlaceName && !placeNames.includes(newPlaceName) && selectedMohAreaId) {
              onChange('placeId', '');
              onChange('mohAreaId', selectedMohAreaId);
              onChange('isNewPlace', true);
            } else {
              const existingPlace = placesList.find(p => p.name === newPlaceName);
              if (existingPlace) {
                onChange('placeId', existingPlace.id);
                onChange('isNewPlace', false);
              } else {
                onChange('placeId', '');
                onChange('isNewPlace', false);
              }
            }

            onChange('placeName', newPlaceName);
          }}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            const { inputValue } = params;
            const isExisting = options.some((option) => inputValue === option.title);
            if (inputValue !== '' && !isExisting) {
              filtered.push({
                inputValue,
                title: `Add new place: "${inputValue}"`,
              } as any);
            }

            return filtered;
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          options={placeNames.map(p => ({ title: p }))}
          isOptionEqualToValue={(option, val) => option.title === (typeof val === 'string' ? val : (val as any).title)}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            if ((option as any).inputValue) {
              return (option as any).inputValue;
            }
            return (option as any).title;
          }}
          renderOption={(props, option) => (
            <li {...props} key={(option as any).title}>
              {(option as any).title}
            </li>
          )}
          freeSolo
          disabled={!mohArea}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Hospital / Place" 
              required 
              error={error && !placeName}
              helperText={placeName && !placeNames.includes(placeName) ? "Will be added as a new location" : "Select or type to create new"}
            />
          )}
        />
      </Grid>
    </Grid>
  )
}
