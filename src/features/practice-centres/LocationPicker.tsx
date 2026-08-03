import { useMemo, useState, useEffect, useRef } from 'react'
import {
  TextField,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  InputAdornment,
  Box,
  Typography,
  Grid
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { httpClient } from '../../api/httpClient'

export interface LocationPickerProps {
  district: string
  mohArea: string
  placeName: string
  placeId?: string
  onChange: (field: string, value: any) => void
  error?: boolean
}

interface ApiLocation {
  id: string
  name: string
}

interface SearchableSelectProps {
  label: string
  value: string
  options: string[]
  onChange: (val: string) => void
  disabled?: boolean
  required?: boolean
  error?: boolean
  helperText?: string
  freeSolo?: boolean
  onAddNew?: (val: string) => void
  inputRef?: React.Ref<HTMLInputElement>
}

function SearchableSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  required,
  error,
  helperText,
  freeSolo,
  onAddNew,
  inputRef,
}: SearchableSelectProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const preventOpenRef = useRef(false)

  const open = Boolean(anchorEl)

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        searchRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleOpenTarget = (target: HTMLElement) => {
    if (disabled || preventOpenRef.current) return
    setAnchorEl(target)
    setSearchQuery('')
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const selectOption = (optName: string, isAddNew = false) => {
    preventOpenRef.current = true
    if (isAddNew && onAddNew) {
      onAddNew(optName)
    }
    onChange(optName)
    handleClose()
    setTimeout(() => {
      preventOpenRef.current = false
    }, 300)
  }

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options
    const q = searchQuery.toLowerCase().trim()
    return options.filter(opt => opt.toLowerCase().includes(q))
  }, [options, searchQuery])

  const showAddNew = freeSolo && searchQuery.trim() && !options.some(o => o.toLowerCase() === searchQuery.toLowerCase().trim())

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (filteredOptions.length > 0) {
        if (e.key === 'Enter') e.preventDefault()
        selectOption(filteredOptions[0])
      } else if (showAddNew) {
        if (e.key === 'Enter') e.preventDefault()
        selectOption(searchQuery.trim(), true)
      }
    }
  }

  return (
    <>
      <TextField
        inputRef={inputRef}
        fullWidth
        label={label}
        value={value}
        required={required}
        error={error}
        helperText={helperText}
        disabled={disabled}
        onClick={(e) => handleOpenTarget(e.currentTarget)}
        onFocus={(e) => {
          if (!disabled && !open && !preventOpenRef.current) {
            handleOpenTarget(e.currentTarget)
          }
        }}
        onChange={(e) => {
          if (freeSolo) {
            onChange(e.target.value)
          }
        }}
        slotProps={{
          input: {
            readOnly: !freeSolo,
            endAdornment: (
              <InputAdornment position="end" onClick={(e) => handleOpenTarget(e.currentTarget)} style={{ cursor: disabled ? 'default' : 'pointer' }}>
                <ArrowDropDownIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableRestoreFocus
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            style: {
              width: anchorEl ? anchorEl.clientWidth : 300,
              maxHeight: 320,
              display: 'flex',
              flexDirection: 'column',
              padding: 8,
            },
          },
        }}
      >
        <Box sx={{ p: 1, pb: 1 }}>
          <TextField
            inputRef={searchRef}
            fullWidth
            size="small"
            placeholder={`Search ${label}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <List sx={{ overflowY: 'auto', flexGrow: 1, py: 0 }}>
          {filteredOptions.map((opt) => (
            <ListItemButton
              key={opt}
              selected={opt.toLowerCase() === value.toLowerCase()}
              onMouseDown={(e) => {
                e.preventDefault()
                selectOption(opt)
              }}
              onClick={() => {
                selectOption(opt)
              }}
            >
              <ListItemText primary={opt} />
            </ListItemButton>
          ))}

          {filteredOptions.length === 0 && !showAddNew && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No options found
              </Typography>
            </Box>
          )}

          {showAddNew && (
            <ListItemButton
              onMouseDown={(e) => {
                e.preventDefault()
                selectOption(searchQuery.trim(), true)
              }}
              onClick={() => {
                selectOption(searchQuery.trim(), true)
              }}
              sx={{ bgcolor: 'rgba(143, 0, 255, 0.08)', fontWeight: 700 }}
            >
              <ListItemText primary={`Add new place: "${searchQuery.trim()}"`} />
            </ListItemButton>
          )}
        </List>
      </Popover>
    </>
  )
}

export function LocationPicker({ district, mohArea, placeName, onChange, error }: LocationPickerProps) {
  const [districtsList, setDistrictsList] = useState<ApiLocation[]>([])
  const [mohAreasList, setMohAreasList] = useState<ApiLocation[]>([])
  const [placesList, setPlacesList] = useState<ApiLocation[]>([])

  const mohInputRef = useRef<HTMLInputElement>(null)
  const placeInputRef = useRef<HTMLInputElement>(null)

  // Fetch districts on mount
  useEffect(() => {
    httpClient.get<any>('/api/locations/districts')
      .then(res => {
        const raw = res.data?.value || res.data?.$values || res.data || []
        const list = Array.isArray(raw) ? raw : []
        const valid = list.filter(item => item && typeof item.name === 'string' && typeof item.id === 'string')
        setDistrictsList(valid)
      })
      .catch(console.error)
  }, [])

  const selectedDistrictId = useMemo(() => {
    if (!district) return undefined
    const cleanDist = String(district).trim().toLowerCase()
    return districtsList.find(d => d.name && String(d.name).trim().toLowerCase() === cleanDist)?.id
  }, [district, districtsList])

  const selectedMohAreaId = useMemo(() => {
    if (!mohArea) return undefined
    const cleanMoh = String(mohArea).trim().toLowerCase()
    return mohAreasList.find(m => m.name && String(m.name).trim().toLowerCase() === cleanMoh)?.id
  }, [mohArea, mohAreasList])

  // Fetch MOH areas when district changes
  useEffect(() => {
    if (selectedDistrictId) {
      httpClient.get<any>(`/api/locations/places/moh-areas?districtId=${selectedDistrictId}`).catch(() => {})
      httpClient.get<any>(`/api/locations/moh-areas?districtId=${selectedDistrictId}`)
        .then(res => {
          const raw = res.data?.value || res.data?.$values || res.data || []
          const list = Array.isArray(raw) ? raw : []
          const valid = list.filter(item => item && typeof item.name === 'string' && typeof item.id === 'string')
          setMohAreasList(valid)
        })
        .catch(console.error)
    } else {
      setMohAreasList([])
    }
  }, [selectedDistrictId])

  // Fetch Places when MOH area changes
  useEffect(() => {
    if (selectedMohAreaId) {
      httpClient.get<any>(`/api/locations/places?mohAreaId=${selectedMohAreaId}`)
        .then(res => {
          const raw = res.data?.value || res.data?.$values || res.data || []
          const list = Array.isArray(raw) ? raw : []
          const valid = list.filter(item => item && typeof item.name === 'string' && typeof item.id === 'string')
          setPlacesList(valid)
        })
        .catch(console.error)
    } else {
      setPlacesList([])
    }
  }, [selectedMohAreaId])

  const districtNames = useMemo(() => {
    return Array.from(new Set(districtsList.map(d => String(d.name || '').trim()).filter(Boolean))).sort()
  }, [districtsList])

  const mohAreaNames = useMemo(() => {
    return Array.from(new Set(mohAreasList.map(m => String(m.name || '').trim()).filter(Boolean))).sort()
  }, [mohAreasList])

  const placeNames = useMemo(() => {
    return Array.from(new Set(placesList.map(p => String(p.name || '').trim()).filter(Boolean))).sort()
  }, [placesList])

  const handlePlaceChange = (newPlaceName: string) => {
    if (newPlaceName && !placeNames.includes(newPlaceName) && selectedMohAreaId) {
      onChange('placeId', '')
      onChange('mohAreaId', selectedMohAreaId)
      onChange('isNewPlace', true)
    } else {
      const existingPlace = placesList.find(p => p.name.trim().toLowerCase() === newPlaceName.trim().toLowerCase())
      if (existingPlace) {
        onChange('placeId', existingPlace.id)
        onChange('isNewPlace', false)
      } else {
        onChange('placeId', '')
        onChange('isNewPlace', false)
      }
    }
    onChange('placeName', newPlaceName)
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <SearchableSelect
          label="District"
          value={district}
          options={districtNames}
          required
          error={error && !district}
          onChange={(val) => {
            onChange('district', val)
            onChange('mohArea', '')
            onChange('placeName', '')
            onChange('placeId', '')
            onChange('mohAreaId', '')
            onChange('isNewPlace', false)
            if (val) {
              setTimeout(() => {
                mohInputRef.current?.focus()
              }, 50)
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <SearchableSelect
          inputRef={mohInputRef}
          label="MOH Area"
          value={mohArea}
          options={mohAreaNames}
          required
          disabled={!district}
          error={error && !mohArea}
          onChange={(val) => {
            onChange('mohArea', val)
            onChange('placeName', '')
            onChange('placeId', '')
            onChange('mohAreaId', '')
            onChange('isNewPlace', false)
            if (val) {
              setTimeout(() => {
                placeInputRef.current?.focus()
              }, 50)
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <SearchableSelect
          inputRef={placeInputRef}
          label="Hospital / Place"
          value={placeName}
          options={placeNames}
          freeSolo
          required
          disabled={!mohArea}
          error={error && !placeName}
          helperText={placeName && !placeNames.includes(placeName) ? "Will be added as a new location" : "Select or type to create new"}
          onChange={handlePlaceChange}
          onAddNew={handlePlaceChange}
        />
      </Grid>
    </Grid>
  )
}
