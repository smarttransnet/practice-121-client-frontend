import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Stack, 
  IconButton, 
  InputBase, 
  Avatar, 
  Chip,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FilterListIcon from '@mui/icons-material/FilterList'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import SearchIcon from '@mui/icons-material/Search'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import DescriptionIcon from '@mui/icons-material/Description'
import MemoryIcon from '@mui/icons-material/Memory'
import HeadsetIcon from '@mui/icons-material/Headset'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export function DashboardPage() {
  // Stat Card Mock Data
  const stats = [
    {
      title: 'Active Cases',
      value: '534',
      change: '23,5%',
      trend: 'up',
      color: '#F97316', // Orange
      bgColor: 'rgba(249, 115, 22, 0.08)',
      icon: <DescriptionIcon sx={{ color: '#F97316', fontSize: 32 }} />,
      badgeIcon: '👥',
    },
    {
      title: 'Ai Analyses',
      value: '129',
      change: '23,5%',
      trend: 'up',
      color: '#10B981', // Green
      bgColor: 'rgba(16, 185, 129, 0.08)',
      icon: <MemoryIcon sx={{ color: '#10B981', fontSize: 32 }} />,
      badgeIcon: '💡',
    },
    {
      title: 'Flagged Alerts',
      value: '37',
      change: '23,5%',
      trend: 'up',
      color: '#3B82F6', // Blue
      bgColor: 'rgba(59, 130, 246, 0.08)',
      icon: <HeadsetIcon sx={{ color: '#3B82F6', fontSize: 32 }} />,
      badgeIcon: '⚠️',
    },
    {
      title: 'Reports Parsed',
      value: '275',
      change: '23,5%',
      trend: 'up',
      color: '#8F00FF', // Purple
      bgColor: 'rgba(143, 0, 255, 0.08)',
      icon: <AssignmentIcon sx={{ color: '#8F00FF', fontSize: 32 }} />,
      badgeIcon: '📋',
    },
  ]

  // Column Chart Data
  const chartDays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const chartData = [
    { purple: 18, orange: 12, pink: 8 },
    { purple: 14, orange: 10, pink: 6 },
    { purple: 22, orange: 15, pink: 10 },
    { purple: 25, orange: 18, pink: 12, active: true }, // Highlighted Tue
    { purple: 16, orange: 12, pink: 8 },
    { purple: 24, orange: 14, pink: 9 },
    { purple: 20, orange: 13, pink: 7 },
    { purple: 23, orange: 16, pink: 11 },
  ]

  // Table Data
  const tableData = [
    {
      name: 'Sarah Mitchell',
      sub: 'Persistent cough',
      dept: 'Cardiology',
      stay: '3 Weeks',
      cabin: 'CF-315',
      date: '22/03/2026',
      status: 'Released',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      name: 'James Rodriguez',
      sub: 'Post-op checkup',
      dept: 'Neurology',
      stay: '1 Week',
      cabin: 'NW-104',
      date: '20/03/2026',
      status: 'Released',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    {
      name: 'Emily Watson',
      sub: 'Migraine therapy',
      dept: 'Pediatrics',
      stay: '5 Days',
      cabin: 'PD-208',
      date: '18/03/2026',
      status: 'Released',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  ]

  return (
    <Stack spacing={4}>
      {/* Title / Action Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Dashboard
          </Typography>
        </Stack>

        <Button 
          variant="contained" 
          className="gradient-primary-btn"
          startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
          sx={{ 
            borderRadius: '50px',
            px: 3,
            py: 1.2,
            fontSize: '0.85rem'
          }}
        >
          Summary With Ai
        </Button>
      </Box>

      {/* Grid: 4 Top Stat Cards */}
      <Grid container spacing={3}>
        {stats.map((stat, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Paper 
              className="glass-card"
              sx={{ 
                p: 3, 
                position: 'relative',
                overflow: 'visible', // Allows floating badges to extend outside
              }}
            >
              {/* Floating top-right badge */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: -15,
                  right: 25,
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: '#FFFFFF',
                  border: `2px solid ${stat.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  boxShadow: `0 4px 14px ${stat.color}20`
                }}
              >
                {stat.badgeIcon}
              </Box>

              <Stack spacing={2}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                  {stat.title}
                </Typography>
                
                {/* Large Central Icon container */}
                <Box 
                  sx={{ 
                    width: 76, 
                    height: 76, 
                    borderRadius: '20px', 
                    bgcolor: stat.bgColor, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>

                <Stack spacing={0.5}>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {stat.value}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                      {stat.change}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      compared last month
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Grid: Charts Row */}
      <Grid container spacing={3}>
        {/* Left Column: Stacked Column Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper className="glass-card" sx={{ p: 3.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  AI Healthcare Department Analytics
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  AI insights on patient volume, treatment performance
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <Button 
                  variant="outlined" 
                  startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
                  sx={{ 
                    borderRadius: '12px',
                    borderColor: 'rgba(0,0,0,0.06)',
                    color: 'text.primary',
                    bgcolor: 'rgba(255,255,255,0.4)',
                    fontSize: '0.75rem',
                    py: 0.75,
                    px: 2,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                  }}
                >
                  Filter
                </Button>
                <Select
                  value="Last Month"
                  size="small"
                  sx={{ 
                    borderRadius: '12px',
                    bgcolor: 'rgba(255,255,255,0.4)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    height: 34,
                    '& .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(0,0,0,0.05)' }
                  }}
                >
                  <MenuItem value="Last Month">Last Month</MenuItem>
                  <MenuItem value="This Month">This Month</MenuItem>
                </Select>
              </Stack>
            </Stack>

            {/* Custom High-Fidelity Column Chart Canvas */}
            <Box sx={{ height: 260, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pt: 1 }}>
              {/* Chart Grid Lines */}
              {[40, 30, 20, 10, 0].map((gridVal, gIdx) => (
                <Box 
                  key={gIdx} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    position: 'absolute', 
                    width: '100%', 
                    top: `${(1 - gridVal / 40) * 100}%`,
                    transform: 'translateY(-50%)',
                    zIndex: 0,
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', width: 25, fontSize: '0.68rem', fontWeight: 600 }}>
                    {gridVal}
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', borderBottom: '1px dashed rgba(143, 0, 255, 0.04)', ml: 1 }} />
                </Box>
              ))}

              {/* Chart Bars Section */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-around', 
                  alignItems: 'flex-end', 
                  height: '100%', 
                  position: 'relative',
                  zIndex: 1,
                  pl: 4,
                  pr: 2,
                  pb: 3,
                }}
              >
                {chartData.map((data, idx) => {
                  const total = data.purple + data.orange + data.pink
                  const scale = 200 / 40 // Grid max is 40
                  
                  return (
                    <Box 
                      key={idx} 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        height: '100%', 
                        justifyContent: 'flex-end',
                        position: 'relative',
                        width: 32,
                      }}
                    >
                      {/* Stacked Bar Container */}
                      <Box 
                        sx={{ 
                          width: 14, 
                          height: total * scale, 
                          display: 'flex', 
                          flexDirection: 'column-reverse', 
                          borderRadius: '10px',
                          overflow: 'hidden',
                          boxShadow: data.active ? '0 8px 24px rgba(143,0,255,0.2)' : 'none',
                        }}
                      >
                        {/* Pink Base */}
                        <Box sx={{ width: '100%', height: `${(data.pink / total) * 100}%`, bgcolor: '#EC4899' }} />
                        {/* Orange Middle */}
                        <Box sx={{ width: '100%', height: `${(data.orange / total) * 100}%`, bgcolor: '#F97316', borderTop: '2px solid rgba(255,255,255,0.4)', borderBottom: '2px solid rgba(255,255,255,0.4)' }} />
                        {/* Purple Top */}
                        <Box sx={{ width: '100%', height: `${(data.purple / total) * 100}%`, bgcolor: '#8F00FF' }} />
                      </Box>

                      {/* Active Tuesday Tooltip Popover replica */}
                      {data.active && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            bottom: total * scale + 10,
                            width: 130,
                            bgcolor: '#FFFFFF',
                            border: '1px solid rgba(143, 0, 255, 0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.08)',
                            p: 1.25,
                            zIndex: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            transform: 'translateX(0%)',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#8F00FF' }} /> Weekly:
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 900 }}>$2,197</Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#F97316' }} /> Monthly:
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 900 }}>$6,464</Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#EC4899' }} /> Yearly:
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 900 }}>$9,796</Typography>
                          </Stack>
                        </Box>
                      )}

                      {/* Active Tuesday vertical helper line */}
                      {data.active && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            width: 1,
                            height: '100%',
                            bgcolor: 'rgba(143, 0, 255, 0.15)',
                            borderStyle: 'dashed',
                            zIndex: -1,
                            bottom: 20
                          }}
                        />
                      )}

                      {/* Tuesday Highlight active node indicator */}
                      {data.active && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            bottom: total * scale - 4,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            border: '2px solid #FFFFFF',
                            bgcolor: '#8F00FF',
                            zIndex: 2,
                            boxShadow: '0 0 10px rgba(143, 0, 255, 0.5)'
                          }}
                        />
                      )}

                      {/* Day Label */}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          position: 'absolute',
                          bottom: 0,
                          fontWeight: 700,
                          color: data.active ? 'primary.main' : 'text.secondary',
                          fontSize: '0.72rem'
                        }}
                      >
                        {chartDays[idx]}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Patients Gender Concentric Ring Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper className="glass-card" sx={{ p: 3.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                Patients Gender
              </Typography>
              <IconButton 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.4)', 
                  border: '1px solid rgba(0,0,0,0.03)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  width: 32,
                  height: 32,
                }}
              >
                <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              </IconButton>
            </Stack>

            {/* Concentric Gender Ring Graphic */}
            <Box 
              sx={{ 
                position: 'relative', 
                height: 180, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 4
              }}
            >
              {/* Concentric circles utilizing SVG */}
              <svg width="180" height="180" viewBox="0 0 180 180">
                {/* Track Circle 1 (Outer - Purple 73%) */}
                <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(143, 0, 255, 0.05)" strokeWidth="10" />
                <circle cx="90" cy="90" r="70" fill="none" stroke="#8F00FF" strokeWidth="10" 
                  strokeDasharray="440" strokeDashoffset={440 * (1 - 0.73)} 
                  strokeLinecap="round" transform="rotate(-90 90 90)" />

                {/* Track Circle 2 (Middle - Blue 53%) */}
                <circle cx="90" cy="90" r="52" fill="none" stroke="rgba(59, 130, 246, 0.05)" strokeWidth="10" />
                <circle cx="90" cy="90" r="52" fill="none" stroke="#3B82F6" strokeWidth="10" 
                  strokeDasharray="327" strokeDashoffset={327 * (1 - 0.53)} 
                  strokeLinecap="round" transform="rotate(-90 90 90)" />

                {/* Track Circle 3 (Inner - Pink/Lilac 27%) */}
                <circle cx="90" cy="90" r="34" fill="none" stroke="rgba(236, 72, 153, 0.05)" strokeWidth="10" />
                <circle cx="90" cy="90" r="34" fill="none" stroke="#EC4899" strokeWidth="10" 
                  strokeDasharray="213" strokeDashoffset={213 * (1 - 0.27)} 
                  strokeLinecap="round" transform="rotate(-90 90 90)" />
              </svg>

              {/* Centered Learn More bubble */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 4px 16px rgba(31, 38, 135, 0.05)',
                  borderRadius: '30px',
                  px: 1.5,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  border: '1px solid rgba(143, 0, 255, 0.1)',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.65rem' }}>
                  Learn More
                </Typography>
                <ArrowForwardIcon sx={{ fontSize: 10, color: 'text.secondary' }} />
              </Box>

              {/* Ring Label Callouts */}
              <Box sx={{ position: 'absolute', right: 28, top: 40, bgcolor: 'rgba(255,255,255,0.9)', p: '2px 8px', borderRadius: 10, border: '1px solid rgba(143,0,255,0.05)' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>53% <span style={{fontWeight:500, color:'#64748B'}}>Female</span></Typography>
              </Box>
              <Box sx={{ position: 'absolute', right: 10, bottom: 45, bgcolor: 'rgba(255,255,255,0.9)', p: '2px 8px', borderRadius: 10, border: '1px solid rgba(143,0,255,0.05)' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>73% <span style={{fontWeight:500, color:'#64748B'}}>Male</span></Typography>
              </Box>
              <Box sx={{ position: 'absolute', left: 24, bottom: 42, bgcolor: 'rgba(255,255,255,0.9)', p: '2px 8px', borderRadius: 10, border: '1px solid rgba(143,0,255,0.05)' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>27% <span style={{fontWeight:500, color:'#64748B'}}>Other</span></Typography>
              </Box>
            </Box>

            {/* Bottom Percent list */}
            <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: '1px dashed rgba(143,0,255,0.08)' }}>
              <Stack spacing={0.25} alignItems="center">
                <Typography variant="caption" sx={{ fontWeight: 800 }}>73%</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Male</Typography>
              </Stack>
              <Stack spacing={0.25} alignItems="center">
                <Typography variant="caption" sx={{ fontWeight: 800 }}>53%</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Female</Typography>
              </Stack>
              <Stack spacing={0.25} alignItems="center">
                <Typography variant="caption" sx={{ fontWeight: 800 }}>27%</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Other</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Table: Medical Department Statistics */}
      <Paper className="glass-card" sx={{ p: 3.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 4 }}>
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              Medical Department Statistics
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Patient volume, treatment progress, status, and critical cases.
            </Typography>
          </Stack>

          {/* Table Controls (Search, Filter, Export) */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Search Pill */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(0,0,0,0.05)',
                borderRadius: '50px',
                px: 1.5,
                py: 0.5,
                width: 200,
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />
              <InputBase 
                placeholder="Search Data" 
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            </Box>

            {/* Filter IconButton */}
            <IconButton 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.4)', 
                border: '1px solid rgba(0,0,0,0.03)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                width: 32,
                height: 32,
              }}
            >
              <FilterListIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            </IconButton>

            {/* Export Dropdown button */}
            <Select
              value="Export Data"
              size="small"
              sx={{ 
                borderRadius: '12px',
                bgcolor: 'rgba(255,255,255,0.4)',
                fontSize: '0.75rem',
                fontWeight: 700,
                height: 32,
                '& .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(0,0,0,0.05)' }
              }}
            >
              <MenuItem value="Export Data">Export Data</MenuItem>
              <MenuItem value="CSV">CSV</MenuItem>
              <MenuItem value="PDF">PDF</MenuItem>
            </Select>
          </Stack>
        </Stack>

        {/* High-Fidelity Patient Table */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px dashed rgba(143,0,255,0.08)', color: 'text.secondary', fontWeight: 800, fontSize: '0.8rem', py: 1.5 } }}>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Length Stay</TableCell>
                <TableCell>Cabin No</TableCell>
                <TableCell>Admission Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, idx) => (
                <TableRow 
                  key={idx}
                  sx={{ 
                    '&:last-child td': { border: 0 },
                    '& td': { borderBottom: '1px dashed rgba(143,0,255,0.05)', py: 2 } 
                  }}
                >
                  {/* Name column with avatar and sub-condition */}
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={row.avatar} sx={{ width: 38, height: 38 }} />
                      <Stack spacing={0}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          {row.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          {row.sub}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>

                  {/* Department */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {row.dept}
                    </Typography>
                  </TableCell>

                  {/* Length of Stay */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      {row.stay}
                    </Typography>
                  </TableCell>

                  {/* Cabin No */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {row.cabin}
                    </Typography>
                  </TableCell>

                  {/* Admission Date */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      {row.date}
                    </Typography>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(59, 130, 246, 0.08)',
                        color: '#3B82F6',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        px: 1,
                        py: 0.5,
                        borderRadius: '30px',
                      }}
                    />
                  </TableCell>

                  {/* Context menu icon */}
                  <TableCell align="right">
                    <IconButton size="small">
                      <MoreVertIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  )
}


