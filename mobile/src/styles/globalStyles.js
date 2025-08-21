import { StyleSheet } from 'react-native';

// Estilos globais reutilizáveis com valores hardcoded
export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  
  // Layout styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text styles
  textPrimary: {
    color: '#1f2937',
    fontFamily: 'System',
    fontSize: 16,
  },
  
  textSecondary: {
    color: '#6b7280',
    fontFamily: 'System',
    fontSize: 14,
  },
  
  textTertiary: {
    color: '#9ca3af',
    fontFamily: 'System',
    fontSize: 12,
  },
  
  // Heading styles
  h1: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'System',
  },
  
  h2: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'System',
  },
  
  h3: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'System',
  },
  
  h4: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'System',
  },
  
  h5: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    fontFamily: 'System',
  },
  
  h6: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    fontFamily: 'System',
  },
  
  // Body text styles
  bodyLarge: {
    fontSize: 18,
    color: '#1f2937',
    fontFamily: 'System',
    lineHeight: 27,
  },
  
  bodyMedium: {
    fontSize: 16,
    color: '#1f2937',
    fontFamily: 'System',
    lineHeight: 24,
  },
  
  bodySmall: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'System',
    lineHeight: 21,
  },
  
  caption: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'System',
  },
  
  // Link styles
  link: {
    color: '#ef4444',
    textDecorationLine: 'underline',
  },
  
  linkBold: {
    color: '#ef4444',
    fontWeight: '600',
  },
  
  // Card styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  
  cardSmall: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  cardLarge: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  
  // Button base styles
  buttonBase: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Input base styles
  inputBase: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  // Spacing utilities
  mt0: { marginTop: 0 },
  mt1: { marginTop: 4 },
  mt2: { marginTop: 8 },
  mt3: { marginTop: 16 },
  mt4: { marginTop: 24 },
  mt5: { marginTop: 32 },
  
  mb0: { marginBottom: 0 },
  mb1: { marginBottom: 4 },
  mb2: { marginBottom: 8 },
  mb3: { marginBottom: 16 },
  mb4: { marginBottom: 24 },
  mb5: { marginBottom: 32 },
  
  ml0: { marginLeft: 0 },
  ml1: { marginLeft: 4 },
  ml2: { marginLeft: 8 },
  ml3: { marginLeft: 16 },
  ml4: { marginLeft: 24 },
  ml5: { marginLeft: 32 },
  
  mr0: { marginRight: 0 },
  mr1: { marginRight: 4 },
  mr2: { marginRight: 8 },
  mr3: { marginRight: 16 },
  mr4: { marginRight: 24 },
  mr5: { marginRight: 32 },
  
  mx0: { marginHorizontal: 0 },
  mx1: { marginHorizontal: 4 },
  mx2: { marginHorizontal: 8 },
  mx3: { marginHorizontal: 16 },
  mx4: { marginHorizontal: 24 },
  mx5: { marginHorizontal: 32 },
  
  my0: { marginVertical: 0 },
  my1: { marginVertical: 4 },
  my2: { marginVertical: 8 },
  my3: { marginVertical: 16 },
  my4: { marginVertical: 24 },
  my5: { marginVertical: 32 },
  
  pt0: { paddingTop: 0 },
  pt1: { paddingTop: 4 },
  pt2: { paddingTop: 8 },
  pt3: { paddingTop: 16 },
  pt4: { paddingTop: 24 },
  pt5: { paddingTop: 32 },
  
  pb0: { paddingBottom: 0 },
  pb1: { paddingBottom: 4 },
  pb2: { paddingBottom: 8 },
  pb3: { paddingBottom: 16 },
  pb4: { paddingBottom: 24 },
  pb5: { paddingBottom: 32 },
  
  pl0: { paddingLeft: 0 },
  pl1: { paddingLeft: 4 },
  pl2: { paddingLeft: 8 },
  pl3: { paddingLeft: 16 },
  pl4: { paddingLeft: 24 },
  pl5: { paddingLeft: 32 },
  
  pr0: { paddingRight: 0 },
  pr1: { paddingRight: 4 },
  pr2: { paddingRight: 8 },
  pr3: { paddingRight: 16 },
  pr4: { paddingRight: 24 },
  pr5: { paddingRight: 32 },
  
  px0: { paddingHorizontal: 0 },
  px1: { paddingHorizontal: 4 },
  px2: { paddingHorizontal: 8 },
  px3: { paddingHorizontal: 16 },
  px4: { paddingHorizontal: 24 },
  px5: { paddingHorizontal: 32 },
  
  py0: { paddingVertical: 0 },
  py1: { paddingVertical: 4 },
  py2: { paddingVertical: 8 },
  py3: { paddingVertical: 16 },
  py4: { paddingVertical: 24 },
  py5: { paddingVertical: 32 },
  
  // Border utilities
  border: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  
  // Background utilities
  bgPrimary: {
    backgroundColor: '#ef4444',
  },
  
  bgSecondary: {
    backgroundColor: '#f9fafb',
  },
  
  bgWhite: {
    backgroundColor: '#ffffff',
  },
  
  bgTransparent: {
    backgroundColor: 'transparent',
  },
  
  // Position utilities
  absolute: {
    position: 'absolute',
  },
  
  relative: {
    position: 'relative',
  },
  
  // Flex utilities
  flex1: {
    flex: 1,
  },
  
  flexGrow: {
    flexGrow: 1,
  },
  
  flexShrink: {
    flexShrink: 1,
  },
  
  // Alignment utilities
  alignCenter: {
    alignItems: 'center',
  },
  
  alignStart: {
    alignItems: 'flex-start',
  },
  
  alignEnd: {
    alignItems: 'flex-end',
  },
  
  justifyCenter: {
    justifyContent: 'center',
  },
  
  justifyStart: {
    justifyContent: 'flex-start',
  },
  
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  
  justifyBetween: {
    justifyContent: 'space-between',
  },
  
  justifyAround: {
    justifyContent: 'space-around',
  },
  
  // Text alignment utilities
  textCenter: {
    textAlign: 'center',
  },
  
  textLeft: {
    textAlign: 'left',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  // Opacity utilities
  opacity50: {
    opacity: 0.5,
  },
  
  opacity75: {
    opacity: 0.75,
  },
  
  opacity90: {
    opacity: 0.9,
  },
  
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default globalStyles;