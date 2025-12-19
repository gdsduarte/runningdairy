// Responsive utility functions and constants for the Running Events Calendar app

/**
 * Material-UI Breakpoints:
 * - xs: 0px (mobile)
 * - sm: 600px (tablet)
 * - md: 900px (small laptop)
 * - lg: 1200px (desktop)
 * - xl: 1536px (large desktop)
 */

// Common responsive spacing patterns
export const responsiveSpacing = {
  // Page container padding
  pageContainer: { xs: 2, sm: 3, md: 4 },
  
  // Card/Section spacing
  sectionGap: { xs: 2, sm: 3, md: 4 },
  
  // Grid spacing
  gridSpacing: { xs: 2, sm: 2, md: 3 },
  
  // Modal padding
  modalPadding: { xs: 2, sm: 3, md: 3 },
};

// Common responsive sizing patterns
export const responsiveSizing = {
  // Modal widths
  modalWidth: { xs: '95%', sm: '85%', md: '70%', lg: '60%' },
  modalMaxWidth: { xs: 400, sm: 600, md: 800 },
  
  // Avatar sizes
  avatarSmall: { xs: 40, sm: 48, md: 56 },
  avatarMedium: { xs: 80, sm: 100, md: 120 },
  avatarLarge: { xs: 120, sm: 150, md: 180 },
  
  // Icon sizes
  iconSmall: { xs: 20, sm: 24 },
  iconMedium: { xs: 32, sm: 40, md: 48 },
  iconLarge: { xs: 48, sm: 56, md: 64 },
};

// Typography responsive patterns
export const responsiveTypography = {
  // Page title
  pageTitle: {
    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
    fontWeight: 700,
  },
  
  // Section title
  sectionTitle: {
    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
    fontWeight: 600,
  },
  
  // Card title
  cardTitle: {
    fontSize: { xs: '1.1rem', sm: '1.25rem' },
    fontWeight: 600,
  },
};

// Common responsive layout patterns
export const responsiveLayouts = {
  // Flex container that switches to column on mobile
  flexRow: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 2, md: 3 },
  },
  
  // Center content vertically and horizontally
  centerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Stack items vertically with spacing
  stack: (spacing = 2) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: spacing,
  }),
};

// Grid column patterns for common layouts
export const gridColumns = {
  // Full width on mobile, half on tablet, third on desktop
  threeColumn: { xs: 12, sm: 6, md: 4 },
  
  // Full width on mobile, half on tablet+
  twoColumn: { xs: 12, sm: 6 },
  
  // Full width on mobile, third on desktop
  desktopThird: { xs: 12, md: 4 },
  
  // Full width on mobile, 2/3 on desktop
  desktopTwoThird: { xs: 12, md: 8 },
  
  // Sidebar layout: full on mobile, 1/4 on desktop
  sidebar: { xs: 12, md: 3 },
  mainContent: { xs: 12, md: 9 },
};

// Responsive visibility utilities
export const visibility = {
  // Hide on mobile
  hideMobile: { display: { xs: 'none', sm: 'block' } },
  
  // Hide on desktop
  hideDesktop: { display: { xs: 'block', md: 'none' } },
  
  // Show only on mobile
  mobileOnly: { display: { xs: 'block', sm: 'none' } },
  
  // Show only on tablet
  tabletOnly: { display: { xs: 'none', sm: 'block', md: 'none' } },
  
  // Show only on desktop
  desktopOnly: { display: { xs: 'none', md: 'block' } },
};

// Common component responsive styles
export const componentStyles = {
  // Modal that adjusts for mobile
  responsiveModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: '85%', md: '70%' },
    maxWidth: { xs: 400, sm: 600, md: 800 },
    maxHeight: { xs: '95vh', sm: '90vh' },
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    overflow: 'auto',
  },
  
  // Card that fills container on mobile
  responsiveCard: {
    height: '100%',
    borderRadius: { xs: 1, sm: 2 },
  },
  
  // Button that adjusts size on mobile
  responsiveButton: {
    py: { xs: 1, sm: 1.5 },
    px: { xs: 2, sm: 3 },
    fontSize: { xs: '0.875rem', sm: '1rem' },
  },
  
  // Bottom navigation for mobile
  mobileBottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    bgcolor: 'background.paper',
    borderTop: '1px solid',
    borderColor: 'divider',
    display: { xs: 'flex', md: 'none' },
    justifyContent: 'space-around',
    //py: 1,
    zIndex: 1100,
  },
};

/**
 * Example usage in components:
 * 
 * import { responsiveSpacing, gridColumns, visibility } from '../utils/responsive';
 * 
 * <Box sx={{ p: responsiveSpacing.pageContainer }}>
 *   <Grid container spacing={responsiveSpacing.gridSpacing}>
 *     <Grid item {...gridColumns.threeColumn}>
 *       <Card>Content</Card>
 *     </Grid>
 *   </Grid>
 *   <Box sx={visibility.hideDesktop}>Mobile only content</Box>
 * </Box>
 */

const responsive = {
  spacing: responsiveSpacing,
  sizing: responsiveSizing,
  typography: responsiveTypography,
  layouts: responsiveLayouts,
  gridColumns,
  visibility,
  componentStyles,
};

export default responsive;
